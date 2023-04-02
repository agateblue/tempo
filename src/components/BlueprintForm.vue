<template>
  <div v-if="fields.length > 0" :key="formConfig.id">
    <p v-if="formConfig.help">{{ formConfig.help }}</p>
    <v-row>
      <v-col
        v-for="field in fields"
        :key="field.id"
        cols="12"
        sm="6"
      >
        <blueprint-field v-model="values[field.id]" :field="field" :form-id="formConfig.id" />
      </v-col>
    </v-row>
  </div>
</template>

<script>

import BlueprintField from '@/components/BlueprintField'

function getValueType(value) {
  switch (typeof value) {
    case 'boolean':
      return 'boolean'
    case 'number':
      return 'number'
    default:
      return 'text'
  }
}

export default {
  props: {
    value: {default: () => {return {}}},
    config: {},
    availableFields: {},
  },
  components: {
    BlueprintField
  },
  data () {
    let values = {...this.value}
    return {
      values
    }
  },
  computed: {
    formConfig () {
      if (this.config) {
        return this.config
      }
      else {
        // offer a basic form to edit existing annotations that 
        // may not belong to a form
        let config = {
          fields: []
        }
        for (const key in this.values) {
          if (Object.hasOwnProperty.call(this.values, key)) {
            config.fields.push({
              label: key,
              id: key,
              type: getValueType(this.values[key]),
            })
          }
        }
        return config
      }
    },
    fields () {
      return this.formConfig.fields.map(f => {
        return {
          ...this.availableFields[f.id],
          ...f
        }
      })
    }
  },
  methods: {
    async fillFromLast () {
      let results = await this.$store.state.db.find({
        selector: {
          form: this.config.id,
        },
        fields: ['date', 'form', 'data'],
        sort: [{_id: 'desc'}],
        limit: 1,
      })
      let last = results.docs[0]
      if (last) {
        this.fields.forEach(f => {
          if (last.data[f.id] != undefined) {
            this.$set(this.values, f.id, last.data[f.id])
          }
        })
      }
    },
  },
  watch: {
    values: {
      deep: true,
      handler (v) {
        this.$emit('input', v)
      }
    },
    'config.id': {
      handler () {
        this.values = {}
      }
    }
  }
}
</script>
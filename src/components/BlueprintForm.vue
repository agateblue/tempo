<template>
  <div v-if="fields.length > 0">
    <p v-if="formConfig.help">{{ formConfig.help }}</p>
    <v-row>
      <v-col
        v-for="field in fields"
        :key="field.id"
        cols="12"
        sm="6"
      >
        <v-checkbox
          v-if="field.type === 'boolean'"
          v-model="values[field.id]"
          :label="field.label"

        />
        <v-text-field
          v-else
          v-model="values[field.id]"
          :label="field.label"
          :type="field.type || 'text'"
          :required="field.required === undefined ? true : field.required"
          clearable
        ></v-text-field>
      </v-col>
    </v-row>
  </div>
</template>

<script>
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
  watch: {
    values: {
      deep: true,
      handler (v) {
        this.$emit('input', v)
      }
    }
  }
}
</script>
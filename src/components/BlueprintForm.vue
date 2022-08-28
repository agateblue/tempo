<template>
  <div>
    <p v-if="config.help">{{ config.help }}</p>
    <v-row>
      <v-col
        v-for="field in fields"
        :key="field.id"
        cols="12"
        sm="6"
      >
        <v-text-field
          :label="field.label"
          :type="field.type || 'text'"
          v-model="values[field.id]"
          :required="field.required === undefined ? true : field.required"
          clearable
        ></v-text-field>
      </v-col>
    </v-row>
  </div>
</template>

<script>
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
    fields () {
      return this.config.fields.map(f => {
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
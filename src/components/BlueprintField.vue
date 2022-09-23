<template>
  <div>
    <v-checkbox
      v-if="field.type === 'boolean'"
      v-model="localValue"
      :label="field.label"

    />
    <component
      v-else
      v-bind:is="getComponent(field)"
      v-model="localValue"
      :label="field.label"
      :type="field.type || 'text'"
      :required="field.required === undefined ? true : field.required"
      clearable
      :hint="field.unit"
      persistent-hint
      :items="getSuggestions(field)"
      :step="field.step || 'any'"
    ></component>
  </div>
</template>
<script>
import isEqual from 'lodash/isEqual'

import { VTextField, VCombobox } from 'vuetify/lib';

export default {
  props: {
    field: {},
    value: {default: null},
  },
  data () {
    return {
      localValue: this.value
    }
  }, 
  methods: {
    getSuggestions (field) {
      return field.suggestions || []
    },
    getComponent(field) {
      if (this.getSuggestions(field).length > 0) {
        return VCombobox
      }
      return VTextField
    }
  },
  watch: {
    localValue: {
      deep: true,
      handler (v) {
        this.$emit('input', v)
      }
    },
    value: {
      deep: true,
      handler (v) {
        if (!isEqual(v, this.localValue)) {
          this.localValue = v
        } 
      }
    }
  }
}
</script>
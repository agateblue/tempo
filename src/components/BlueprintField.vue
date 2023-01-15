<template>
  <div>
    <v-checkbox
      v-if="field.type === 'boolean'"
      v-model="localValue"
      :label="field.label"
      :ripple="false"

    />
    <component
      v-else
      v-bind:is="getComponent(field)"
      v-model="localValue"
      :label="field.label"
      :type="field.type || 'text'"
      :required="isRequired"
      clearable
      :hint="field.unit"
      persistent-hint
      :items="getSuggestions(field)"
      :step="field.step || 'any'"
      v-bind="additionalAttrs"
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
  created () {
    if (this.field.default != undefined && this.isRequired && (this.localValue === null || this.localValue === "")) {
      this.localValue = this.field.default
    }
  },
  computed: {
    isRequired () {
      return this.field.required === undefined ? true : this.field.required
    },
    additionalAttrs () {
      let attrs = {}
      if (this.field.min != undefined) {
        attrs.min = this.field.min
      }
      if (this.field.max != undefined) {
        attrs.max = this.field.max
      }
      return attrs
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
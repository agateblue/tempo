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
      v-bind:is="getComponent()"
      v-model="localValue"
      :label="field.label"
      :type="field.type || 'text'"
      :required="isRequired"
      clearable
      :hint="field.unit"
      persistent-hint
      :items="suggestions"
      :step="field.step || 'any'"
      v-bind="additionalAttrs"
      @blur="onBlur"
      ref="input"
    ></component>
  </div>
</template>
<script>
import isEqual from 'lodash/isEqual'
import uniq from 'lodash/uniq'

import {getEntries} from '@/utils'
import { VTextField, VCombobox } from 'vuetify/lib';

function getValues(entries, form, field) {
  let candidates = entries.filter(r => {
    if (!r.data) {
      return false
    }
    if (form && form != r.form) {
      return false
    }
    if (r.data[field] === undefined || r.data[field] === null) {
      return false
    }
    return true
  }).map(r => {
    return r.data[field]
  })
  return uniq(candidates)

}
export default {
  props: {
    field: {},
    value: {default: null},
    formId: {default: null},
  },
  data () {
    return {
      localValue: this.value,
      suggestions: null,
    }
  }, 
  async created () {
    if (this.field.default != undefined && this.isRequired && (this.localValue === null || this.localValue === "")) {
      this.localValue = this.field.default
    }
    this.suggestions = await this.getSuggestions(this.field)
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
    async getSuggestions (field) {
      let suggestions = field.suggestions || []
      if (field.autosuggest) {
        let entries = await getEntries(this.$store, false)
        suggestions = [
          ...suggestions,
          ...getValues(entries, field.autosuggest === 'form' ? this.formId : null, field.id)
        ]
        suggestions.sort()
      }
      return uniq(suggestions.map(s => {
        if (s.trim) {
          return s.trim()
        }
        return s
      }))
    },
    getComponent() {
      if (this.suggestions && this.suggestions.length > 0) {
        return VCombobox
      }
      return VTextField
    },
    onBlur () {
      if (this.$refs.input.updateSelf) {
        this.$refs.input.updateSelf()

      }
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
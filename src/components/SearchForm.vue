<template>
  <v-row
    tag="form"
    @submit.prevent="$emit('submit', localValue)"
    class="d-flex justify-space-between align-items-center mt-3">
    <v-col sm="6">
      <v-text-field
        class="mt-0"
        v-model="localValue"
        :append-icon="$icons.mdiMagnify"
        placeholder="tag:sleep"
        label="Search"
        clearable
        @keydown.enter="$emit('submit', localValue)"
        @click:clear="localValue = ''; $emit('submit', '')"
      ></v-text-field>
    </v-col>
    <v-col sm="6">
      <v-select
        v-model="filters"
        :items="filtersChoices"
        label="Filters"
        multiple
        chips
        dense
        deletable-chips
      ></v-select>
    </v-col>
  </v-row>
</template>
<script>
export default {
  props: {
    value: {default: ''}
  },
  data () {
    return {
      filters: [],
      filtersChoices: [
        {text: 'Favorite', value: 'is:fav'},
        {text: 'Form', value: 'is:form'},
        {text: 'Reply', value: 'is:reply'},
        {text: 'Thread', value: 'is:thread'},
        {text: 'Important', value: '!'},
        {text: 'Positive', value: '+'},
        {text: 'Negative', value: '-'},
      ],
      localValue: this.value
    }
  },
  computed: {
    computedQuery () {
      return this.filters.join(' ')
    }
  },
  watch: {
    computedQuery (v) {
      this.localValue = v
      this.$emit('submit', this.localValue)
    }
  }
}
</script>
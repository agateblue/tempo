<template>
  <v-row
    tag="form"
    @submit.prevent="$emit('submit', localValue)"
    class="d-flex justify-space-between align-items-center mt-3">
    <v-col cols="6" sm="5" class="py-0">
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
    <v-col cols="6" sm="4" class="py-0">
      <v-select
        v-model="filters"
        :items="filtersChoices"
        label="Filters"
        item-title="text"
        multiple
        chips
        dense
        deletable-chips
      ></v-select>
    </v-col>
    <v-col cols="6" sm="3" class="py-0">
      <v-chip
        v-if="resultCount != null"
        small
        class=" my-3"
      >Results: {{ resultCount }}</v-chip>
    </v-col>
  </v-row>
</template>
<script>
export default {
  props: {
    value: {default: ''},
    resultCount: {default: null}
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
    },
    '$store.state.searchQuery' (v) {
      this.localValue = v
    }
  }
}
</script>
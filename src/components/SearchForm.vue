<template>
  <v-row
    tag="form"
    @submit.prevent="$emit('submit', localValue)"
    class="d-flex justify-space-between align-items-center mt-3">
    <v-col cols="6" sm="5" class="py-0">
      <v-text-field
        class="mt-0"
        variant="underlined"
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
        multiple
        chips
        density="compact"
        closable-chips
        variant="underlined"
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
        {title: 'Favorite', value: 'is:fav'},
        {title: 'Form', value: 'is:form'},
        {title: 'Reply', value: 'is:reply'},
        {title: 'Thread', value: 'is:thread'},
        {title: 'Important', value: '!'},
        {title: 'Positive', value: '+'},
        {title: 'Negative', value: '-'},
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
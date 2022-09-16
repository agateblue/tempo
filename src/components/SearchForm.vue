<template>
  <v-row
    tag="form"
    @submit.prevent="$emit('submit', localValue)"
    class="d-flex justify-space-between align-items-center mt-3">
    <v-col sm="6">
      <v-text-field
        v-model="localValue"
        :append-icon="$icons.mdiMagnify"
        placeholder="tag:sleep"
        label="Search"
        clearable
        @keydown.enter="$emit('submit', localValue)"
        @click:clear="localValue = ''; $emit('submit', '')"
      ></v-text-field>
    </v-col>
    <v-col sm="2">
      <v-checkbox
        v-model="filters.favorites"
        label="Favorites"
      ></v-checkbox>
    </v-col>
    <v-col sm="2">
      <v-checkbox
        class="mr-2 flex-grow-1"
        v-model="filters.thread"
        label="Threads">
      ></v-checkbox>  
    </v-col>
    <v-col sm="2">
      <v-checkbox
        class="mr-2 flex-grow-1"
        v-model="filters.form"
        label="Forms">
      ></v-checkbox>  
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
      filters: {
        favorites: false,
        thread: false,
        forms: false,
      },
      localValue: this.value
    }
  },
  computed: {

    computedQuery () {
      let query = []
      if (this.filters.favorites) {
        query.push('is:fav')
      }
      if (this.filters.thread) {
        query.push('is:thread')
      }
      if (this.filters.form) {
        query.push('is:form')
      }
      return query.join(' ')
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
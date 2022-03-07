<template>
  <div class="pb-8">
    <v-container class="narrow">
      <entry-form
        textarea-label="Write a new entry"
        color="transparent"
        :key="`timeline-${$store.state.lastSync}`"
        ref="entryForm"
        @submitted="handleCreated"
      />
    </v-container>
    <v-divider></v-divider>
    <timeline
      ref="timeline"
      class="container narrow"
      :entries="shownEntries"
      :key="`timeline-${$store.state.lastSync}`"
      @updated="$emit('updated', $event)"
      @deleted="$emit('deleted', $event)"></timeline>
    <v-container class="narrow" v-if="shownEntries.length < entries.length" :key="`container-${$store.state.lastSync}`">
      <v-btn
        v-if="showShowMoreButton"
        color="secondary"
        @click.prevent="showMore"
        v-intersect="{
          handler: showMore,
          options: {
            threshold: 0.5
          }
        }">Show more</v-btn>
    </v-container>
  </div>
</template>

<script>
import Timeline from '@/components/Timeline.vue'
import debounce from 'lodash/debounce'
import EntryForm from '@/components/EntryForm.vue'

export default {
  props: {
    allEntries: Array
  },
  components: {
    Timeline,
    EntryForm,
  },
  data () {
    return {
      showEntryModal: false,
      showShowMoreButton: false,
      count: this.$store.state.pageSize,
      sortDesc: true,
    }
  },
  computed: {
    entries () {
      let e = [...this.allEntries]
      if (this.sortDesc) {
        e.reverse()
      }
      return e
    },
    shownEntries () {
      return this.entries.slice(0, this.count)
    },
  },
  methods: {
    async handleCreated (e) {
      this.$emit('created', e)
    },
    showMore: debounce(function (data) {
      if (data && !data[0].isIntersecting) {
        return
      }
      this.count += this.$store.state.pageSize
    }, 1000, {leading: true, trailing: false, maxWait: 500})
  },
  watch: {
    
    shownEntries () {
      setTimeout(() => {
        this.showShowMoreButton = true
      }, 1000)
    },
  },
}
</script>
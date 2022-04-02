<template>
  <div class="pb-8">
    <template v-if="!entryId">
      <entry-form
        
        textarea-label="Write a new entry"
        color="transparent"
        :key="`timeline-${$store.state.lastSync}`"
        ref="entryForm"
        @submitted="handleCreated"
      />
      <v-divider></v-divider>
    </template>
    <timeline
      ref="timeline"
      class="container narrow px-0"
      :entries="shownEntries"
      :entry-id="entryId"
      :key="`timeline-${$store.state.lastSync}`"
      @updated="$emit('updated', $event)"
      @deleted="$emit('deleted', $event)"></timeline>
    <v-container
      v-if="!entryId && shownEntries.length < entries.length"
      class="narrow"
      :key="`container-${$store.state.lastSync}`"
    >
      <v-btn
        v-if="showShowMoreButton"
        color="secondary"
        @click.prevent="showMore([{isIntersecting: true}])"
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
    allEntries: Array,
    entryId: {required: false}
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

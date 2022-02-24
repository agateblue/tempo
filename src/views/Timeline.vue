<template>
  <div class="pb-8">
    <v-container class="narrow">
      <entry-form
        textarea-label="Write a new entry"
        :compact="true"
        color="transparent"
        :key="`timeline-${$store.state.lastSync}`"
        @fullscreen="showEntryModal = true"
        @submitted="handleCreated"
      />
    </v-container>
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
    <entry-modal :show.sync="showEntryModal" @submitted="handleCreated" />
  </div>
</template>

<script>
import Timeline from '@/components/Timeline.vue'
import debounce from 'lodash/debounce'
import EntryModal from '@/components/EntryModal.vue'
import EntryForm from '@/components/EntryForm.vue'

export default {
  props: {
    allEntries: Array
  },
  components: {
    Timeline,
    EntryForm,
    EntryModal,
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
    
    async handleCreated () {
      if (this.$router.currentRoute.query.q) {
        this.$router.push({
          path: "/",
          query: {}
        })
      }
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

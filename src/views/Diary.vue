<template>
  <div class="pb-8">
    <v-container>
      <v-tabs
        show-arrows
        centered
        height="36"
        background-color="transparent">
        <v-tab
          :to="{path: '/diary', query: {q: query}}"
          exact
          :key="entries.length"
        >
          Entries · {{ entries.length }}
        </v-tab>
        <v-tab :to="{path: '/diary/calendar', query: {q: query}}">Calendar</v-tab>
        <v-tab :to="{path: '/diary/vizualisation', query: {q: query}}">Vizualisation</v-tab>
      </v-tabs>
    </v-container>
    <router-view
      :all-entries="entries"
      @deleted="handleDelete"
      @updated="handleUpdate"
      @created="handleCreated"
    ></router-view>
  </div>
</template>

<script>
import {search, trackEvent} from '@/utils'

export default {
  props: {
    query: String
  },
  data () {
    return {
      entries: [],
    }
  },
  async created () {
    this.search()
  },
  methods: {    
    
    async handleCreated (entry) {
      this.entries.push(entry)
      trackEvent(this.$store, "entry.created")
    },
    async handleDelete (entry) {
      this.entries = this.entries.filter((e) => {
        return e._id != entry._id
      })
      trackEvent(this.$store, "entry.deleted")
    },
    async handleUpdate (entry) {
      this.entries.forEach((e) => {
        if (e._id === entry._id) {
          Object.assign(e, entry)
        }
      })
      trackEvent(this.$store, "entry.updated")
    },
    async search () {
      this.entries = await search({
        store: this.$store,
        sortDesc: this.sortDesc,
        query: this.query
      })
    },
  },
  watch: {
    async query () {
      await this.search()
    },
    "$store.state.lastSync": {
      async handler () {
        await this.search()
      }
    },
  },
}
</script>

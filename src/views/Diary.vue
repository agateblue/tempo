<template>
  <div class="pb-8">
    <v-container v-if="$route.name != 'Entry'">
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
        <v-tab :to="{path: '/diary/visualization', query: {q: query}}">Visualization</v-tab>
      </v-tabs>
    </v-container>
    <router-view
      :all-entries="entries"
      @deleted="handleDelete"
      @updated="handleUpdate"
      @replied="handleCreated"
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
      // small optimisation to avoid string comparison
      // when entry is already deleted
      let alreadyDeleted = false
      let id = entry._id
      this.entries = this.entries.filter((e) => {
        if (alreadyDeleted || e._id != id) {
          return true
        }
        alreadyDeleted = true
        return false
      })
      // redirect to diary view if we were
      // on detail view
      if (this.$route.name === 'Entry') {
        this.$router.push('/')
      }
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
    "$route.params.entryId": {
      async handler (v) {
        if (v) {
          await this.search()
        }
      }
    },
  },
}
</script>

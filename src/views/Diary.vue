<template>
  <div class="pb-8">
    <v-container class="narrow">
      <v-tabs grow centered background-color="transparent">
        <v-tab :to="{path: '/diary', query: {q: query}}" exact>
          Entries · {{ entries.length }}
        </v-tab>
        <!-- <v-tab to="/calendar">Calendar</v-tab> -->
        <v-tab :to="{path: '/diary/visualization', query: {q: query}}">Visualization</v-tab>
        <v-tab :to="{path: '/diary/advanced', query: {q: query}}">Advanced</v-tab>
      </v-tabs>
    </v-container>
    <router-view
      :all-entries="entries"
      @deleted="handleDelete"
      @updated="handleUpdate"
    ></router-view>
  </div>
</template>

<script>
import {parseFullQuery, matchOrTokens} from '@/utils'

export default {
  props: {
    query: String
  },
  data () {
    return {
      entries: [],
      entriesCount: 0,
    }
  },
  async created () {
    this.search()
  },
  methods: {    
    async getEntries () {
      let options = {
        include_docs: true,
        descending: this.sortDesc,
      }
      let result = await this.$store.state.db.allDocs(options)
      let entries = result.rows.map(r => {
        return r.doc
      })
      entries = entries.filter((e) => {
        return e.type == 'entry'
      })
      return entries
    },
    async handleDelete (entry) {
      this.entries = this.entries.filter((e) => {
        return e._id != entry._id
      })
    },
    async handleUpdate (entry) {
      this.entries.forEach((e) => {
        if (e._id === entry._id) {
          Object.assign(e, entry)
        }
      })
    },
    filterEntries (entries, queryTokens) {
      if (queryTokens.length === 0) {
        return entries
      }
      return entries.filter((e) => {
        return matchOrTokens(e, queryTokens)
      })
    },

    async search () {

      this.count = this.$store.state.pageSize
      let allEntries = await this.getEntries()
      this.entriesCount = allEntries.length
      this.entries = this.filterEntries(
        allEntries,
        parseFullQuery(this.query),
      )
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

<template>
  <div class="pb-8">
    <router-view
      :all-entries="entries"
      :query="$store.state.searchQuery"
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
    query: {default: ''}
  },
  data () {
    return {
      localQuery: (this.query || '').trim(),
      entries: [],
    }
  },
  async created () {
    if (this.localQuery) {
      this.$store.commit('searchQuery', this.localQuery)
    } else {
      await this.search()
    }
  },
  methods: {    
    
    async handleCreated () {
      await this.search()
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
      await this.search()
      trackEvent(this.$store, "entry.updated")
    },
    async search () {
      this.entries = await search({
        store: this.$store,
        sortDesc: this.sortDesc,
        query: this.$store.state.searchQuery,
      })
    },
  },
  watch: {
    '$store.state.searchQuery': async function () {
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

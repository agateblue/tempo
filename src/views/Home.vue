<template>
  <main>
    <aside>
      <entry-form @input="addNew" />
      <form @submit.prevent="submitSearch">
        <label for="search">
          <strong>Filter entries</strong>
        </label>
        <input type="text" ref="search" :value="query" name="search" id="search" placeholder="#work +">
        <input type="submit" class="right floated" value="Search">
        <button class="link" @click.stop.prevent="clearSearch">Clear</button>
      </form>
    </aside>
    <section>
      <h1>Your notes</h1>
      <entry v-for="entry in entries" :entry="entry" :key="entry._id" @delete="handleDelete"></entry>
    </section>
  </main>
</template>

<script>
import EntryForm from '@/components/EntryForm.vue'
import Entry from '@/components/Entry.vue'

import {getNewEntryData, parseQuery, matchTokens} from '@/utils'

export default {
  props: {
    query: String
  },
  components: {
    EntryForm,
    Entry,
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
    async addNew (text) {
      let data = {
        ...getNewEntryData(text),
        date: (new Date ()).toISOString(),
      }
      data._id = data.date
      let result = await this.$store.dispatch('addEntry', data)
      this.entries.unshift(result)
    },
    async getEntries () {
      let result = await this.$store.state.db.find({
        selector: {
          type: 'entry',
        },
        sort: [{"_id": "desc"}]
      })
      return result.docs
    },
    async handleDelete (entry) {
      await this.$store.state.db.remove(entry)
      this.entries = this.entries.filter((e) => {
        return e._id != entry._id
      })
    },
    filterEntries (entries, queryTokens) {
      if (queryTokens.length === 0) {
        return entries
      }
      return entries.filter((e) => {
        return matchTokens(e, queryTokens)
      })
    },
    clearSearch () {
      if (this.query) {
        this.$router.push({name: 'Home'})
      }
    },
    submitSearch () {
      if (this.$refs.search.value != this.query) {
        this.$router.push({name: 'Home', query: {q: this.$refs.search.value }})
      }
    },
    async search () {
      this.entries = this.filterEntries(
        await this.getEntries(),
        parseQuery(this.query),
      )
    }
  },
  watch: {
    async query () {
      await this.search()
    }
  }
}
</script>

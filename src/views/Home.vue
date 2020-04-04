<template>
  <main>
    <aside>
      <div class="widget">
        <h2>
          <label for="how">How do you feel?</label>
        </h2>
        <entry-form @input="addNew" />
      </div>
      <div class="widget">
        <h2>
          <label for="search">Filter entries</label>
        </h2>
        <form @submit.prevent="submitSearch">
          <input type="text" ref="search" :value="query" name="search" id="search" placeholder="#work +">
          <input type="submit" class="right floated" value="Search">
          <button class="link" @click.stop.prevent="clearSearch">Clear</button>
        </form>
      </div>
      <div class="widget">
        <h2>
          <button class="right floated link" @click.stop.prevent="showGraph = !showGraph">
            <template v-if="showGraph">Hide</template>
            <template v-else>Show</template>
          </button>
          Daily mood
        </h2>

        <heatmap
          v-if="showGraph"
          :key="JSON.stringify(moodData)"
          :chart-data="moodData">
        </heatmap>
      </div>
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
import Heatmap from '@/components/Heatmap.vue'


import {getNewEntryData, parseQuery, matchTokens} from '@/utils'

export default {
  props: {
    query: String
  },
  components: {
    EntryForm,
    Entry,
    Heatmap,
  },
  data () {
    return {
      entries: [],
      showGraph: true,
    }
  },
  async created () {
    this.search()
  },
  computed: {
    moodData () {
      let start = new Date()
      let points = {}
      this.entries.forEach((e) =>  {
        let timestamp = (new Date(e._id).getTime()) / 1000
        points[String(parseInt(timestamp))] = e.mood
      })
      return {
        dataPoints: {...points},
        start,
      }
    }
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

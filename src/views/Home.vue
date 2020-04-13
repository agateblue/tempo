<template>
  <main>
    <section>
      <aside class="center aligned attached widget">
        <router-link :to="{name: 'About'}">Help and settings</router-link> ·
        <a href="" @click.prevent="$modal.show('export')">Export…</a> ·
        <a href="" @click.stop.prevent="$store.commit('toggleShowDailyMood')">
          <template v-if="$store.state.showDailyMood">Hide daily mood</template>
          <template v-else>Show daily mood</template>
        </a>
      </aside>
      <aside class="attached widget">
        <h2>
          <label for="how">How do you feel?</label>
        </h2>
        <entry-form @input="addNew" />
      </aside>
      <aside v-if="entriesCount" :class="[{attached: query}, 'widget']">
        <form @submit.prevent="submitSearch" class="inline">
          <label for="search" class="hidden">Search</label>
          <input type="text" ref="search" :value="query" name="search" id="search" placeholder="#work +">
          <input type="submit" class="right floated secondary" value="Search">
        </form>
      </aside>
      <div v-if="query" :class="[{attached: $store.state.showDailyMood}, 'center aligned widget']">
        {{ entries.length }} matching entries · <button class="link" @click="clearSearch">Clear search</button>
      </div>
      <aside class="widget" v-if="$store.state.showDailyMood">
        <h3>
          Daily mood
        </h3>
        <heatmap
          @selected-date="filterByDate"
          :key="JSON.stringify(moodData)"
          :chart-data="moodData">
        </heatmap>
      </aside>
      <entry
        :class="[{attached: idx != shownEntries.length - 1}, 'widget']"
        v-for="(entry, idx) in shownEntries"
        :entry="entry" :key="entry._id"
        @delete="handleDelete"></entry>
      <p v-if="shownEntries.length < entries.length" class="center aligned">
        <button @click.prevent="count += $store.state.pageSize">Show more</button>
      </p>
    </section>
    <modal name="export">
      <a href="" class="right floated" @click.prevent="$modal.hide('export')">Close</a>
      <p>Export the selected {{ entries.length }} entries as a Markdown file.</p>
      <button @click="downloadMarkdown">Download as markdown</button>
      <p>Export the selected {{ entries.length }} entries as JSON file. Can be imported in Tempo.</p>
      <button @click="downloadJSON">Download as JSON</button>
    </modal>
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
      entriesCount: 0,
      count: this.$store.state.pageSize,
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
    },
    shownEntries () {
      return this.entries.slice(0, this.count)
    }
  },
  methods: {
    downloadMarkdown () {
      let markdownParts = this.entries.map((e) => {
        return `---
date: ${e.date}
mood: ${e.mood}
---

${e.text}

`
      })

      this.downloadFile(markdownParts.join('\n'), 'text/markdown', 'tempo.md')
    },
    downloadJSON () {
      this.downloadFile(JSON.stringify(this.entries), 'application/json', 'tempo.json')
    },
    downloadFile (text, mimetype, name) {
      let f = this.makeFile(text, mimetype)
      var link = document.createElement('a')
      link.setAttribute('download', name)
      link.href = f
      document.body.appendChild(link)

      window.requestAnimationFrame(function () {
        var event = new MouseEvent('click')
        link.dispatchEvent(event)
        document.body.removeChild(link)
      })
    },
    makeFile (text, mimetype) {
      let data = new Blob([text], {type: mimetype})
      let textFile = window.URL.createObjectURL(data)
      return textFile
    },
    filterByDate (d) {
      let day = (d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2))
      if (this.query === `@${day}`) {
        this.$router.push({name: 'Home'})
      } else {
        this.$router.push({name: 'Home', query: {q: `@${day}` }})
      }
    },
    async addNew (text) {
      let data = {
        ...getNewEntryData(text),
        date: (new Date ()).toISOString(),
      }
      data._id = data.date
      await this.$store.dispatch('addEntry', data)
      await this.search()
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

      this.count = this.$store.state.pageSize
      let allEntries = await this.getEntries()
      this.entriesCount = allEntries.length
      this.entries = this.filterEntries(
        allEntries,
        parseQuery(this.query),
      )
    }
  },
  watch: {
    async query () {
      await this.search()
    },
    "$store.state.lastSync": {
      async handler () {
        await this.search()
      }
    }
  },
}
</script>

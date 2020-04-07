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
          @selected-date="filterByDate"
          :key="JSON.stringify(moodData)"
          :chart-data="moodData">
        </heatmap>
      </div>
    </aside>
    <section>
      <h1 class="left floated">Your notes</h1>
      <span class="right floated">{{ entries.length }} matching entries</span>
      <router-link :to="{name: 'About'}">Help and settings</router-link> ·
      <a href="" @click.prevent="$modal.show('export')">Export…</a>
      <hr>
      <entry v-for="entry in shownEntries" :entry="entry" :key="entry._id" @delete="handleDelete"></entry>
      <button v-if="shownEntries.length < entries.length" @click.prevent="count += $store.state.pageSize">Show more</button>
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
      count: this.$store.state.pageSize,
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

      this.count = this.$store.state.pageSize,
      this.entries = this.filterEntries(
        await this.getEntries(),
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

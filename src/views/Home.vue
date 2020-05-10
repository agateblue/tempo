<template>
  <main>
    <section>
      <aside class="center aligned attached widget">
        <router-link :to="{name: 'About'}">Help and settings</router-link> ·
        <a href="" @click.stop.prevent="$store.commit('toggleShowDailyMood')">
          <template v-if="$store.state.showDailyMood">Hide daily mood</template>
          <template v-else>Show daily mood</template>
        </a>
        <template v-if="$store.state.couchDbUrl">
          ·
          <a href="" @click.stop.prevent="forceSync" v-if="!isSyncing">
            Sync
          </a>
          <template v-if="!isSyncing && syncError">
            Sync error:
            <span v-if="syncError.name">{{ syncError.name }}</span>
            <span v-else>Unknown</span>
          </template>
          <span v-else-if="syncError === false">
            Sync complete
          </span>
          <span v-else-if="isSyncing">Syncing…</span>
        </template>
      </aside>
      <aside class="widget">
        <h2>
          <label for="how">How do you feel?</label>
        </h2>
        <entry-form @created="clearSearch();search()" />
      </aside>
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

      <aside v-if="entriesCount" :class="[{attached: true}, 'controls widget']">
        <form @submit.prevent="submitSearch" class="inline">
          <label for="search" class="hidden">Search</label>
          <div class="wrapper">
            <input type="text" ref="search" :value="query" class="compact" name="search" id="search" placeholder="#work +">
            <a v-if="query" href="" class="clearing link" title="Clear search" @click.prevent="clearSearch();$refs.search.focus()">×</a>
          </div>
          <input type="submit" class="secondary" value="Search">
        </form>
        <a href="" class="link" @click.prevent="showAdditionalControls = !showAdditionalControls">More…</a>
      </aside>
      <aside v-if="showAdditionalControls" class="controls attached widget">
        <form class="inline">
          <label for="sort">Sort</label>
          <select name="sort" id="sort" v-model="sort">
            <option :value="{date: 'desc'}">Newest first</option>
            <option :value="{date: 'asc'}">Oldest first</option>
          </select>
        </form>
        <a v-if="entries.length > 0" href="" class="link" @click.prevent="$modal.show('export')">Export {{ entries.length }} entries…</a>
      </aside>
      <aside v-if="showAdditionalControls" class="attached widget">
        <form>
          <label for="sort">Query</label>
          <textarea id="query" name="query" v-model="dataQuery"></textarea>
        </form>
        <table v-if="queriedData && queriedData[0]">
          <thead>
            <tr>
              <th v-for="field in dataQueryFields" :key="field">{{ field }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in queriedData" :key="idx">
              <td v-for="field in dataQueryFields" :key="field">
                {{ row[field] }}
              </td>
            </tr>
          </tbody>
        </table>
      </aside>
      <entry
        class="attached widget"
        v-for="entry in shownEntries"
        :entry="entry" :key="entry._id"
        @updated="search"
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
import alasql from 'alasql'

import {parseQuery, matchTokens} from '@/utils'

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
      isSyncing: false,
      syncError: null,
      dataQuery: 'SELECT mood, count(mood) FROM ? GROUP BY mood ORDER BY mood DESC',
      queriedData: null,
      sort: {"date": "desc"},
      showAdditionalControls: false,
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
    },
    queryableEntries () {
      let data = {
        entries: [],
        tags: [],
      }
      this.entries.forEach((e) => {
        let entry = {
          text: e.text,
          mood: e.mood,
          tags: e.tags,
          date: new Date(e.date),
        }
        data.entries.push(entry)
        e.tags.forEach((t) => {

          data.tags.push({
            ...t,
            entry: entry
          })
        })
      })
      return data.entries
    },
    dataQueryFields () {
      if (this.queriedData && this.queriedData[0]) {
        return Object.keys(this.queriedData[0])
      }
      return []
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
    async getEntries () {
      let result = await this.$store.state.db.find({
        selector: {
          type: 'entry',
          date: { $gt: 0 }
        },
        sort: [this.sort]
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
    },
    async forceSync() {
      this.isSyncing = true
      this.syncError = null
      try {
        this.result = await this.$store.dispatch('forceSync')
      } catch (e) {
        this.syncError = e
      }
      if (!this.syncError) {
        this.syncError = false
      }
      setTimeout(() => {
        this.isSyncing = false
      }, 2000);
      setTimeout(() => {
        this.syncError = null
      }, 2000);
    },
    async queryData (query) {
      if (!query) {
        return null
      }
      return await alasql(this.dataQuery,[this.queryableEntries]);

    }
  },
  watch: {
    async query () {
      await this.search()
    },
    async sort () {
      await this.search()
    },
    "$store.state.lastSync": {
      async handler () {
        await this.search()
      }
    },
    dataQuery: {
      immediate: true,
      handler: async function (v) {
        this.queriedData = await this.queryData(v)
      }
    },
    entries: {
      deep: true,
      handler: async function () {
        this.queriedData = await this.queryData(this.queryData)
      }
    }
  },
}
</script>

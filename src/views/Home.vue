<template>
  <main>
    <section>
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
      <aside v-if="showAdditionalControls" class="widget">
        <h3>Visualization</h3>
        <form>
          <div class="row">
            <div class="column">
              <label for="save-queries">Query</label>
              <select name="saved-queries" id="saved-queries" @input="updateQuery">
                <option :value="idx" v-for="(dq, idx) in defaultDataQueries" :key="idx">{{ dq.label }}</option>
              </select>
            </div>
            <div class="column">
              <label for="chart-type">Output</label>
              <select id="chart-type" name="chart-type" v-model="chartType">
                <option value="line">Plot line</option>
                <option value="pie">Pie chart</option>
                <option value="percentage">Percentage bar</option>
                <option value="table">Table</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>
          <hr>
          <template v-if="queriedData && queriedData[0]">
            <table v-if="chartType === 'table'">
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
            <textarea v-else-if="chartType === 'json'" readonly :value="JSON.stringify(queriedData)"></textarea>
            <chart
              v-else
              :options="chartOptions">
            </chart>
          </template>
          <label for="query">Raw query</label>
          <textarea id="query" name="query" v-model="dataQuery" rows="2"></textarea>
        </form>
      </aside>

      <template v-if="$store.state.logTab === 'timeline'">
        <v-container class="narrow" v-if="shownEntries.length < entries.length">
          <v-btn block color="secondary" @click.prevent="count += $store.state.pageSize">Show more</v-btn>
        </v-container>
        <timeline
          :entries="shownEntries"
          @delete="handleDelete"></timeline>
      </template>
    </section>
    <modal name="export">
      <a href="" class="right floated" @click.prevent="$modal.hide('export')">Close</a>
      <p>Export the selected {{ entries.length }} entries as a Markdown file.</p>
      <button @click="downloadMarkdown">Download as markdown</button>
      <p>Export the selected {{ entries.length }} entries as JSON file. Can be imported in Tempo.</p>
      <button @click="downloadJSON">Download as JSON</button>
    </modal>

    <v-footer inset padless app>
      <v-container>
        <entry-form @created="handleCreated" />
      </v-container>
    </v-footer>
  </main>
</template>

<script>
import debounce from 'lodash/debounce'
import Timeline from '@/components/Timeline.vue'
import alasql from '@/alasql'

import EntryForm from '@/components/EntryForm.vue'
import {parseQuery, matchTokens, quoteFrontMatter, getCompleteEntry, } from '@/utils'

export default {
  props: {
    query: String
  },
  components: {
    Timeline,
    EntryForm,
    Chart:  () => import("@/components/Chart"),
  },
  data () {
    return {
      entries: [],
      entriesCount: 0,
      count: this.$store.state.pageSize,
      isSyncing: false,
      syncError: null,
      dataQuery: null,
      queriedData: null,
      sort: {"date": "desc"},
      chartType: "line",
      chartTitle: "",
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
    defaultDataQueries () {
      let defaultDays = 60
      return [
        {
          label: "Mood by day",
          help: "Higher is better",
          query: `SELECT date, sum(mood) as mood FROM ? GROUP BY date ORDER BY date DESC LIMIT ${defaultDays}`,
          chartType: 'line',
        },
        {
          label: "Mood instability",
          help: "Lower is stabler",
          query: `Select date, posmood * negmood / 10 as instability From (SELECT date, sum(CASE when mood>0 then mood else 0 END) as posmood,  sum(CASE when mood<0 then abs(mood) else 0 END) AS negmood FROM ? GROUP BY date ORDER BY date DESC LIMIT ${defaultDays})`,
          chartType: 'line',
        },
        {
          help: "Lower is stabler",
          label: "Entries per week",
          query: `SELECT week, count(*) as entries FROM ? GROUP BY week ORDER BY week DESC LIMIT 16`,
          chartType: 'table',
        },
        {
          label: "Average entry length",
          query: `SELECT date, avg(length(text)) as chars FROM ? GROUP BY date ORDER BY date DESC LIMIT ${defaultDays}`,
          chartType: 'line',
        },
        {
          label: "Mood for 'work' tag",
          query: `SELECT mood, sum(mood) as chars FROM ? WHERE tags->work->present = true GROUP BY mood`,
          chartType: 'percentage',
        },
        // {
        //   label: "Sleep quality",
        //   query: `SELECT date, sum(tags->sleep->mood) as sleep FROM ? WHERE tags->sleep->present GROUP BY date ORDER BY date DESC LIMIT ${defaultDays}`,
        //   chartType: 'line',
        // },
        {
          label: "Predominant moods",
          query: `SELECT mood, count(*) as entries FROM ? GROUP BY mood`,
          chartType: 'percentage',
        },
      ]
    },
    shownEntries () {
      return this.entries.slice(0, this.count)
    },
    queryableEntries () {
      let data = []
      this.entries.forEach((e) => {
        let entry = getCompleteEntry(e)
        data.push(entry)
      })
      return data
    },
    dataQueryFields () {
      if (this.queriedData && this.queriedData[0]) {
        return Object.keys(this.queriedData[0])
      }
      return []
    },
    chartOptions () {
      return {
        data: {
          datasets: this.getDatasets(this.queriedData),
          labels: this.getLabels(this.queriedData),
        },
        title: this.chartTitle,
        axisOptions: {
          xIsSeries: true,
        },
        lineOptions: {
          hideDots: 1,
        },
        height: 300,
        type: this.chartType,
        maxSlices: 7,
        colors: ["magenta", "orange"]
      }
    }
  },
  methods: {
    downloadMarkdown () {
      let markdownParts = this.entries.map((e) => {
        return `---
date: ${e.date}
mood: ${e.mood}
event: ${e.event}
data: ${JSON.stringify(e.data || {})}
---

${quoteFrontMatter(e.text)}

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
      this.$nextTick(() => {
        this.scrollToBottom()
      })
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
    },
    getLabels (data) {
      let firstField = Object.keys(data[0])[0]
      let labels = data.map((r) => {
        return r[firstField]
      })
      labels.reverse()
      return labels
    },

    getDatasets (data) {
      let allFields = Object.keys(data[0]).slice(1)
      let datasets = []
      allFields.forEach(f => {
        let ds = {
          values: data.map(r => { return r[f] }),
          name: f,
        }
        ds.values.reverse()
        datasets.push(ds)
      })
      return datasets
    },
    updateQuery (event) {
      let conf = this.defaultDataQueries[event.target.value]
      this.dataQuery = conf.query
      this.chartType = conf.chartType
      let help = ''
      if (conf.help) {
        help = ` · ${conf.help}`
      }
      this.chartTitle = `${conf.label}${help}`
    },
    async handleCreated () {
      await this.search()
    },
    scrollToBottom () {
      window.scrollTo(0,document.body.scrollHeight)
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

    "$store.state.logTab" (v) {
      if (v === 'timeline') {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },

    dataQuery: {
      handler: debounce(
        async function (v) {
          try {
            this.queriedData = await this.queryData(v)
          } catch (e) {
            console.log('SQL Error', e)
            this.queriedData = null
          }

        },
        500
      )
    },
    entries: {
      deep: true,
      handler: async function () {
        try {
          this.queriedData = await this.queryData(this.dataQuery)
        } catch (e) {
          console.log('SQL Error', e)
          this.queriedData = null
        }

      }
    },
    showAdditionalControls (v) {
      if (v) {
        this.dataQuery = this.defaultDataQueries[0].query

        let help = ''
        if (this.defaultDataQueries[0].help) {
          help = ` · ${this.defaultDataQueries[0].help}`
        }
        this.chartTitle = `${this.defaultDataQueries[0].label}${help}`
        this.chartType = this.defaultDataQueries[0].chartType
      } else {
        this.dataQuery = null
        this.chartTitle = null
      }
    }
  },
}
</script>

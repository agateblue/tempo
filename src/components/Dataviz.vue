<template>
  <v-container>
    <v-row>
      <v-col>
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
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import debounce from 'lodash/debounce'
import alasql from '@/alasql'
import { getCompleteEntry, } from '@/utils'

export default {
  props: ['entries'],
  components: {
    Chart:  () => import(/* webpackChunkName: "visualization" */ "@/components/Chart"),
  },
  data () {
    return {
      dataQuery: null,
      queriedData: null,

      chartType: "line",
      chartTitle: "",
    }
  },
  created () {

    this.dataQuery = this.defaultDataQueries[0].query

    let help = ''
    if (this.defaultDataQueries[0].help) {
      help = ` · ${this.defaultDataQueries[0].help}`
    }
    this.chartTitle = `${this.defaultDataQueries[0].label}${help}`
    this.chartType = this.defaultDataQueries[0].chartType
  },
  computed: {
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
    },
  },
  methods: {
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
  },
  watch: {

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
  }
}
</script>

<template>
  <v-card class="mb-8">
    <v-card-title>
      {{ config.label }}
    </v-card-title>
    <v-card-text v-if="queriedData && queriedData[0]">
      <v-simple-table v-if="config.chartType === 'table'">
        <template v-slot:default>
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
        </template>
      </v-simple-table>

      <v-textarea
        v-else-if="config.chartType === 'json'"
        auto-grow
        :value="JSON.stringify(queriedData, null, 2)"
        rows="2"
        readonly
        label="JSON data"
      ></v-textarea>
      <chart
        v-else-if="isFrappeChart"
        ref="chart"
        :options="chartOptions">
      </chart>
    </v-card-text>
    <v-card-actions>
      <v-btn
        v-if="isFrappeChart"
        text
        @click="$refs.chart.chart.export()"
      >
        Export chart...
      </v-btn>

      <v-spacer></v-spacer>

      <v-btn
        text
        @click="expand = !expand"
      >
        Edit
        <v-icon right>{{ expand ? $icons.mdiChevronUp : $icons.mdiChevronDown  }}</v-icon>
      </v-btn>
    </v-card-actions>

    <v-expand-transition>
      <div v-show="expand">
        <v-divider></v-divider>
        <v-card-text>
          <v-textarea

            clearable
            v-model="dataQuery"
            ref="textarea"
            autofocus
            auto-grow
            rows="2"
            label="SQL Query"
          ></v-textarea>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>
<script>
import debounce from 'lodash/debounce'
import alasql from '@/alasql'

export default {
  props: ['entries', 'config'],
  components: {
    Chart:  () => import(/* webpackChunkName: "visualization" */ "@/components/Chart"),
  },
  data () {
    return {
      expand: false,
      dataQuery: this.config.query,
      queriedData: null,

      chartType: this.config.chartType,
      chartTitle: this.config.label,
    }
  },
  computed: {
    isFrappeChart () {
      return ['json', 'table'].indexOf(this.config.chartType) < 0
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
        // title: this.chartTitle,
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
      return await alasql(this.dataQuery,[this.entries]);
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
      immediate: true,
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

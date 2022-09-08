<template>
  <v-card class="mb-8">
    <v-card-title>
      {{ config.label }}
    </v-card-title>
    <v-card-text v-if="config.help">
      {{ config.help }}
    </v-card-text>
    <v-card-text v-if="queriedData && queriedData[0]">
      <v-simple-table v-if="displayType === 'table'">
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
        :background-color="$theme.input.color"
        v-else-if="displayType === 'json'"
        auto-grow
        :value="JSON.stringify(queriedData, null, 2)"
        rows="2"
        readonly
        label="JSON data"
      ></v-textarea>
      <chart
        v-else-if="isFrappeChart"
        ref="chart"
        :options="displayOptions">
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
        @click="expandQuery = !expandQuery"
      >
        Query
        <v-icon right>{{ expandQuery ? $icons.mdiChevronUp : $icons.mdiChevronDown  }}</v-icon>
      </v-btn>
      <v-menu v-if="config._id" bottom left>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-icon>{{ $icons.mdiDotsHorizontal}}</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="showVisualizationModal = true">
            <v-list-item-icon>
              <v-icon>{{ $icons.mdiPencil }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="deleteDialog = true">
            <v-list-item-icon>
              <v-icon>{{ $icons.mdiDelete }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
      <visualization-modal
        :show.sync="showVisualizationModal"
        :config="config"
        :entries="entries"
        :tags="tags"
        @updated="update">
      </visualization-modal>

      <v-dialog

        v-model="deleteDialog"
        max-width="400"
      >
        <v-card :color="$theme.card.color">
          <v-card-title class="headline">Delete this chart?</v-card-title>

          <v-card-text>
            This action is irreversible.
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              color="secondary"
              text
              @click="deleteDialog = false"
            >
              Cancel
            </v-btn>

            <v-btn
              color="primary"
              text
              @click="deleteDialog = false;handleDelete()"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-actions>

    <v-expand-transition>
      <div v-show="expandQuery">
        <v-divider></v-divider>
        <v-card-text>
          <v-textarea
            :background-color="$theme.input.color"
            clearable
            v-model="dataQuery"
            ref="textarea"
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
import merge from 'lodash/merge'

import alasql from '@/alasql'

import {DISPLAYTYPES} from '@/utils'
export default {
  props: ['entries', 'tags', 'config', 'builtin'],
  components: {
    Chart:  () => import(/* webpackChunkName: "visualization" */ "@/components/Chart"),
    VisualizationModal:  () => import(/* webpackChunkName: "visualization" */ "@/components/VisualizationModal"),
  },
  data () {
    return {
      currentConfig: this.config,
      deleteDialog: false,
      showVisualizationModal: false,
      expandQuery: false,
      dataQuery: this.config.query,
      queriedData: null,
      displayType: this.config.displayType,
      chartTitle: this.config.label,
      source: this.config.source || 'entries'
    }
  },
  computed: {
    isFrappeChart () {
      return ['json', 'table'].indexOf(this.displayType) < 0
    },
    displayTypes () {
      return DISPLAYTYPES
    },
    dataQueryFields () {
      if (this.queriedData && this.queriedData[0]) {
        return Object.keys(this.queriedData[0])
      }
      return []
    },
    displayOptions () {
      let options = {
        data: {
          datasets: this.getDatasets(this.queriedData),
          labels: this.getLabels(this.queriedData),
        },
        // title: this.chartTitle,
        axisOptions: {
          xIsSeries: true,
        },
        height: 300,
        type: this.displayType,
        maxSlices: 7,
        colors: [
          'light-green',
          'purple',
          'green',
          'orange',
          'light-blue',
          'magenta',
          'blue',
          'red',
          'yellow',
          'violet',
          'light-grey',
          'dark-grey',
        ],
        barOptions: {
          spaceRatio: 0.1
        }
      }
      return merge(options, this.config.displayOptions || {})
    },

    dataSource () {
      if (this.source === 'tags') {
        return this.tags
      }
      return this.entries
    },
  },
  methods: {
    async queryData (query) {
      if (!query) {
        return null
      }
      return await alasql(this.dataQuery,[this.dataSource]);
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

    async handleDelete () {
      await this.$store.dispatch('removeChart', this.config._id)
      this.$emit('delete', this.config)
    },

    async update (e) {
      this.currentConfig = e
      this.$emit('updated', e)
    },
  },
  watch: {

    dataQuery: {
      handler: debounce(
        async function (v) {
          this.$emit('query:updated', v)
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

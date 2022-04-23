<template>

  <v-dialog v-model="show" fullscreen hide-overlay transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar :color="$theme.appBar.color">
        <v-btn icon @click="$emit('update:show', false)">
          <v-icon>{{ $icons.mdiClose }}</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-toolbar-title v-if="config">Update chart</v-toolbar-title>
        <v-toolbar-title v-else>Add a new chart</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn text @click="submit">Save</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-divider></v-divider>
      <v-container class="mt-4">
        <h1>Chart configuration</h1>
        <v-form>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="label"
                label="Chart name"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              
              <v-text-field
                v-model="field"
                label="Data query"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                :items="[{text: 'Entries', value: 'entries'}, {text: 'Tags', value: 'tags'}]"
                v-model="source"
                label="Data source"
                required
              ></v-select>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                :items="chartTypes"
                v-model="chartType"
                label="Vizualisation"
                required
              ></v-select>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
      <v-divider></v-divider>
      <v-container class="mt-4">
        <h1>Preview</h1>
        <blueprint-vizualisation
          :key="previewKey"
          :config="chartConfig"
          :tags="tags"
          :entries="entries"
          :builtin="false"
          @query:updated="query = $event;field = null"></blueprint-vizualisation>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import {CHARTTYPES} from '@/utils'

export default {
  props: {
    entries: {type: Array},
    tags: {type: Array},
    show: {type: Boolean, default: false},
    config: {type: Object, default: null},
    days: {type: Number, default: null},
  },
  components: {
    BlueprintVizualisation:  () => import(/* webpackChunkName: "vizualisation" */ "@/components/BlueprintVizualisation"),
  },
  data () {
    return {
      field: 'sum(mood) as Mood',
      defaultConfig: this.config,
      chartTypes: CHARTTYPES,
      label: (this.config || {}).label || "Mood by day",
      query: (this.config || {}).query || "SELECT date, sum(mood) as Mood FROM ? GROUP BY date ORDER BY date DESC",
      chartType: (this.config || {}).chartType || "line",
      source: (this.config || {}).source || "entries",
    }
  },
  computed: {
    chartConfig () {
      let config = this.config || {}
      return {...config, ...{
        label: this.label,
        query: this.query,
        chartType: this.chartType,
        source: this.source,
      }}
    },
    previewKey () {
      return JSON.stringify(this.chartConfig)
    }
  },
  methods: {

    setQuery () {
      if (this.field && this.field.length > 0) {
        this.query = `SELECT date, ${this.field} FROM ? GROUP BY date ORDER BY date DESC`
      }
    },
    async submit () {
    
      if (this.config) {
        await this.update()
      } else {
        await this.addNew()
      }
      this.$emit('update:show', false)
    },
    async addNew () {
      let e = await this.$store.dispatch('addChart', this.chartConfig)
      this.$emit('created', e)

    },
    async update () {
      let e = await this.$store.dispatch('updateChart', this.chartConfig)
      this.$emit('updated', e)
    }
  },
  watch: {
    "field": {
      handler: function () {
        this.setQuery()
      },
      immediate: true,
    },
  }
}
</script>

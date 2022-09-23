<template>
  <div>
    <v-container class="narrow py-0 px-0">
      <visualization-config
        v-model="params"
        :all-entries="allEntries"
      ></visualization-config>
    </v-container>
    <v-container class="mt-4 py-0 px-0" v-if="selectedBlueprint">
      <dataviz 
        :blueprint="selectedBlueprint"      
        :entries="queryableEntries"
        :tags="queryableTags"
      ></dataviz>
    </v-container>
  </div>
</template>

<script>
import {getQueryableEntries, getQueryableTags, getDates} from '@/utils'

export default {
  props: {
    allEntries: Array,
    blueprint: {type: String, default: null},
    defaultStart: {type: String, default: null},
    defaultEnd: {type: String, default: null},
  },
  components: {
    Dataviz:  () => import(/* webpackChunkName: "visualization" */ "@/components/Dataviz"),
    VisualizationConfig:  () => import(/* webpackChunkName: "visualization" */ "@/components/VisualizationConfig"),
  },
  data () {
    return {
      params: {
        ...getDates(this.defaultStart, this.defaultEnd),
        selectedBlueprintId: this.blueprint,
      },
    }
  },
  async created () {
    await this.$store.dispatch("loadBlueprints")
    this.params.selectedBlueprintId = this.blueprint || this.$store.state.loadedBlueprints[0].id
  },
  computed: {
    entries () {
      return this.allEntries
    },
    queryableEntries () {
      return getQueryableEntries(this.entries, this.params.start, this.params.end)
    },
    queryableTags () {
      return getQueryableTags(this.queryableEntries)
    },
    selectedBlueprint () {
      return this.$store.getters.enabledBlueprints.filter(b => {
        return b.id === this.params.selectedBlueprintId
      })[0]
    }
  },
  watch: {
    params: {
      handler (v) {
        if (!v.start) {
          v.start = this.entries[0].date.slice(0, 10)
        }
        if (!v.end) {
          v.end = this.entries[this.entries.length - 1].date.slice(0, 10)
        }
        let query = {
          blueprint: v.selectedBlueprintId,
          q: '',
          start: v.start,
          end: v.end,
        }
        this.$router.push({ path: this.$route.path, query })
      },
      deep: true,
    },
    "$route.query.blueprint" (v) {
      this.params.selectedBlueprintId = v
    },
    "$route.query.start" (v) {
      this.params.start = v
    },
    "$route.query.end" (v) {
      this.params.end = v
    },
  }
}
</script>

<template>
  <div>
    <v-container class="narrow py-0 px-0">
      <v-card tag="section" class="mb-8" :color="$theme.card.color">
        <v-card-title class="headline">Options</v-card-title>

        <v-card-text :class="$theme.card.textSize">
          <v-row>
            <v-col
              cols="4"
            >
              <v-select
                v-model="params.selectedBlueprintIdx"
                :items="blueprintChoices"
                label="Name"
                variant="underlined"
              ></v-select>
            </v-col>
            <v-col
              cols="4"
            >
              <v-menu
                v-model="showStartMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="params.start"
                    label="Start"
                    v-bind="attrs"
                    v-on="on"
                    clearable
                    variant="underlined"
                  ></v-text-field>
                </template>
                <v-date-picker
                  no-title
                  :max="params.end"
                  v-model="params.start"
                  @input="showStartMenu = false"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col
              cols="4"
            >
              <v-menu
                v-model="showEndMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="params.end"
                    label="End"
                    v-bind="attrs"
                    v-on="on"
                    clearable
                    variant="underlined"
                  ></v-text-field>
                </template>
                <v-date-picker
                  no-title
                  :min="params.start"
                  :max="(new Date()).toISOString()"
                  v-model="params.end"
                  @input="showEndMenu = false"
                ></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <search-form
            :value="$store.state.searchQuery"
            @submit="$store.commit('searchQuery', $event)"
            :resultCount="allEntries.length"
          />
        </v-card-text>
      </v-card>
      
      <!-- <v-btn
        class="mb-4"
        :color="$theme.mainButton.color"
        @click="showvisualizationModal = true"
      >
        <v-icon>{{ $icons.mdiPlus }}</v-icon>
        Add a new visualization
      </v-btn> -->
    </v-container>
    <v-container class="mt-4 py-0 px-0" v-if="selectedBlueprint">
      <dataviz 
        :blueprint="selectedBlueprint"      
        :entries="queryableEntries"
        :tags="queryableTags"
        :days="graphDays"></dataviz>
      <!-- <visualization-modal
        :days="graphDays"
        :entries="queryableEntries"
        :tags="queryableTags"
        :show.sync="showvisualizationModal" /> -->
    </v-container>
  </div>
</template>

<script>
// import parseISO from 'date-fns/parseISO'
import sub from 'date-fns/sub'

import SearchForm from '@/components/SearchForm.vue'
// import VisualizationModal from '@/components/VisualizationModal.vue'
import {getQueryableEntries, getQueryableTags} from '@/utils'

function getDates (start, end) {
  end = end ? new Date(end) : new Date
  start = start ? new Date(start) : sub(end, {months: 2})
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  }
}
export default {
  props: {
    allEntries: Array,
    blueprint: {type: Number, default: 0},
    defaultStart: {type: String, default: null},
    defaultEnd: {type: String, default: null},
  },
  components: {
    // VisualizationModal,
    SearchForm,
    Dataviz:  () => import(/* webpackChunkName: "visualization" */ "@/components/Dataviz"),
  },
  data () {
    return {
      showStartMenu: false,
      showEndMenu: false,
      params: {
        ...getDates(this.defaultStart, this.defaultEnd),
        selectedBlueprintIdx: parseInt(this.blueprint) || 0,
      },
      showvisualizationModal: false,
      graphDays: 60,
    }
  },
  async created () {
    await this.$store.dispatch("loadBlueprints")
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
      return this.$store.getters.enabledBlueprints[this.params.selectedBlueprintIdx]
    },
    blueprintChoices () {
      let i = -1
      return this.$store.getters.enabledBlueprints.map(b => {
        i += 1
        return {
          text: b.label,
          value: i,
        }
      })
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
          blueprint: v.selectedBlueprintIdx,
          q: '',
          start: v.start,
          end: v.end,
        }
        this.$router.push({ path: this.$route.path, query })
      },
      deep: true,
    },
    "$route.query.blueprint" (v) {
      this.params.selectedBlueprintIdx = parseInt(v || 0)
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

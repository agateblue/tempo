<template>
  <div>
    <v-container class="narrow">
      <v-card tag="section" class="mb-8" :color="$theme.card.color">
        <v-card-title class="headline">Options</v-card-title>

        <v-card-text :class="$theme.card.textSize">
          <v-row>
            <v-col
              cols="12"
              sm="6"
            >
              <v-select
                v-model="selectedBlueprintIdx"
                :items="blueprintChoices"
                label="Blueprint"
              ></v-select>
            </v-col>
            <v-col
              cols="12"
              sm="6"
            >
              <v-text-field
                v-model="graphDays"
                type="number"
                step="1"
                label="Days to show"></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      
      <!-- <v-btn
        class="mb-4"
        :color="$theme.mainButton.color"
        @click="showvizualisationModal = true"
      >
        <v-icon>{{ $icons.mdiPlus }}</v-icon>
        Add a new vizualisation
      </v-btn> -->
    </v-container>
    <v-divider></v-divider>
    <v-container class="mt-4" v-if="selectedBlueprint">
      <dataviz 
        :blueprint="selectedBlueprint"      
        :entries="queryableEntries"
        :tags="queryableTags"
        :days="graphDays"></dataviz>
      <vizualisation-modal
        :days="graphDays"
        :entries="queryableEntries"
        :tags="queryableTags"
        :show.sync="showvizualisationModal" />
    </v-container>
  </div>
</template>

<script>
import VizualisationModal from '@/components/VizualisationModal.vue'
import {getQueryableEntries, getQueryableTags} from '@/utils'

export default {
  props: {
    allEntries: Array,
    blueprint: {type: Number, default: 0}
  },
  components: {
    VizualisationModal,
    Dataviz:  () => import(/* webpackChunkName: "vizualisation" */ "@/components/Dataviz"),
  },
  data () {
    return {
      showvizualisationModal: false,
      graphDays: 60,
      selectedBlueprintIdx: parseInt(this.blueprint) || 0,
    }
  },
  async created () {
    await this.$store.dispatch("loadBlueprints", this.$store.state.settings.blueprints)
  },
  computed: {
    entries () {
      return this.allEntries
    },
    queryableEntries () {
      return getQueryableEntries(this.entries, this.graphDays)
    },
    queryableTags () {
      return getQueryableTags(this.queryableEntries)
    },
    selectedBlueprint () {
      return this.$store.state.loadedBlueprints[this.selectedBlueprintIdx]
    },
    blueprintChoices () {
      let i = -1
      return this.$store.state.loadedBlueprints.map(b => {
        i += 1
        return {
          text: b.label,
          value: i,
        }
      })
    }
  },
  watch: {
    selectedBlueprintIdx (v) {
      this.$router.push({ path: this.$route.path, query: { q: '', blueprint: v} })
    },
    "$route.query.blueprint" (v) {
      this.selectedBlueprintIdx = parseInt(v || 0)
    },
  }
}
</script>

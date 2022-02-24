<template>
  <div>
    <v-container class="narrow">
      <v-card tag="section" class="mb-8" :color="$theme.card.color">
      <v-card-title class="headline">Options</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <v-text-field
          v-model="graphDays"
          type="number"
          step="1"
          label="Days to show"></v-text-field>
        </v-card-text>
      </v-card>
      
      <v-btn
        class="mb-4"
        :color="$theme.mainButton.color"
        @click="showvisualizationModal = true"
      >
        <v-icon>{{ $icons.mdiPlus }}</v-icon>
        Add a new visualization
      </v-btn>
    </v-container>
    <v-divider></v-divider>
    <v-container class="narrow mt-4">
      <dataviz       
        :entries="queryableEntries"
        :tags="queryableTags"
        :days="graphDays"></dataviz>
      <visualization-modal
        :days="graphDays"
        :entries="queryableEntries"
        :tags="queryableTags"
        :show.sync="showvisualizationModal" />
    </v-container>
  </div>
</template>

<script>
import VisualizationModal from '@/components/VisualizationModal.vue'
import {getQueryableEntries, getQueryableTags} from '@/utils'

export default {
  props: {
    allEntries: Array
  },
  components: {
    VisualizationModal,
    Dataviz:  () => import(/* webpackChunkName: "visualization" */ "@/components/Dataviz"),
  },
  data () {
    return {
      showvisualizationModal: false,
      graphDays: 60,
    }
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
  },
}
</script>

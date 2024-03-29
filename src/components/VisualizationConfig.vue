<template>
  <v-card tag="section" class="mb-8" :color="$theme.card.color">
    <v-card-title class="headline">
      
      <v-select
        v-model="params.selectedBlueprintId"
        :items="blueprintChoices"
        label="Visualization"
      ></v-select>
    </v-card-title>
    <v-card-text :class="$theme.card.textSize">
      <v-row>
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
        <v-col
          cols="4"
          v-if="showGroupByPeriodControl"
        >
          <v-select
            v-model="params.groupByPeriod"
            :items="groupByPeriodOptions"
            label="Group by period"
          ></v-select>
        </v-col>
      </v-row>
      <search-form
        :value="$store.state.searchQuery"
        @submit="$store.commit('searchQuery', $event)"
        :resultCount="allEntries.length"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import isEqual from 'lodash/isEqual'
import SearchForm from '@/components/SearchForm.vue'
import {groupByPeriodOptions} from '@/utils'
export default {
  props: {
    value: {},
    allEntries: {},
    selectedBlueprint: {},
    showBlueprintSelector: {default: true},
  },
  components: {
    SearchForm,
  },
  data () {
    return {
      showStartMenu: false,
      showEndMenu: false,
      params: {
        ...this.value
      },
      groupByPeriodOptions
    }
  },
  computed: {
    blueprintChoices () {
      return this.$store.getters.enabledBlueprints.filter(b => {
        return (b.visualizations || []).length > 0
      }).map(b => {
        return {
          text: b.label,
          value: b.id,
        }
      })
    },
    showGroupByPeriodControl () {
      if (!this.selectedBlueprint) {
        return false
      }
      let visualizations = this.selectedBlueprint.visualizations || []
      for (let index = 0; index < visualizations.length; index++) {
        const v = visualizations[index];
        if (v.query.includes('{{ groupByPeriod }}')) {
          return true
        }
      }
      return false
    } 
  },
  watch: {
    params: {
      deep: true,
      handler (v) {
        this.$emit('input', v)
      }
    },
    value: {
      deep: true,
      handler (v) {
        if (!isEqual(v, this.params)) {
          this.params = {...v}
        } 
      }
    }
  }
}
</script>
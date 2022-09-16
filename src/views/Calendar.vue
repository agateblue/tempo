<template>
  <v-container class="px-0 py-0">
    <v-container  class="narrow px-0 py-0 mb-4">
      <search-form
        class="mt-0"
        :value="$store.state.searchQuery"
        @submit="$store.commit('searchQuery', $event)"
        :resultCount="allEntries.length"
      />
    </v-container>
    <v-sheet
      tile
    > 
      <v-toolbar dense flat>
        <v-toolbar-title v-if="$refs.calendar">
          {{ $refs.calendar.title }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-switch
          class="mt-5"
          v-model="expanded"
          label="Show all events"
        ></v-switch>
      </v-toolbar>
      <v-toolbar dense flat>
        <v-menu
          bottom
          right
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              outlined
              v-bind="attrs"
              v-on="on"
              small
            >
              <span>{{ type }}</span>
              <v-icon right>
                {{ $icons.mdiMenuDown}}
              </v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="type = 'day'">
              <v-list-item-title>Day</v-list-item-title>
            </v-list-item>
            <v-list-item @click="type = 'week'">
              <v-list-item-title>Week</v-list-item-title>
            </v-list-item>
            <v-list-item @click="type = 'month'">
              <v-list-item-title>Month</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-spacer></v-spacer>
        <v-btn
          text
          @click="$refs.calendar.prev()"
        >
          <v-icon>{{ $icons.mdiChevronLeft }}</v-icon>
          Previous
        </v-btn>
        <v-btn
          text
          @click="$refs.calendar.next()"
        >
          Next
          <v-icon>{{ $icons.mdiChevronRight }}</v-icon>
        </v-btn>

        <v-spacer></v-spacer>
        <v-btn
          outlined
          small
          @click="setToday"
        >
          Today
        </v-btn>
        
      </v-toolbar>
    </v-sheet>
    <v-sheet :height="expanded ? '' : '60vh'" :min-height="expanded ? '' : 600">
      <v-calendar
        ref="calendar"
        v-model="value"
        :weekdays="weekday"
        :type="type"
        :events="events"
        :event-overlap-mode="mode"
        :event-overlap-threshold="30"
        @click:event="showEvent"
        @click:more="viewDay"
        @click:date="viewDay"

      ></v-calendar>
      <v-menu
        v-model="selectedOpen"
        :close-on-content-click="false"
        :activator="selectedElement"
        offset-x
      >
        <v-card
          min-width="350px"
          max-width="350px"
        >
          <v-card-text>
            <span v-html="renderMarkdown(selectedEvent.details)"></span>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-sheet>
  </v-container>
</template>

<script>
import RENDERER from '@/markdown'
import {insertTagMarkup} from '@/utils'
import SearchForm from '@/components/SearchForm.vue'

export default {
  props: {
    allEntries: Array
  },
  components: {
    SearchForm
  },
  data: () => ({
    type: 'month',
    types: ['month', 'week', 'day', '4day'],
    mode: 'stack',
    modes: ['stack', 'column'],
    weekday: [1, 2, 3, 4, 5, 6, 0],
    weekdays: [
      { text: 'Sun - Sat', value: [0, 1, 2, 3, 4, 5, 6] },
      { text: 'Mon - Sun', value: [1, 2, 3, 4, 5, 6, 0] },
      { text: 'Mon - Fri', value: [1, 2, 3, 4, 5] },
      { text: 'Mon, Wed, Fri', value: [1, 3, 5] },
    ],
    value: '',
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    expanded: false,
  }),
  mounted () {
    this.$refs.calendar.checkChange()
  },
  computed: {
    events () {
      return this.allEntries.map(e => {
        return {
          start: new Date(e.date),
          name: e.text,
          details: e.text,
          color: this.getEventColor(e),
          timed: true
        }
      })
    }
  },
  methods: {
    setToday () {
      this.value = ''
    },
    viewDay ({ date }) {
      this.value = date
      if (this.type != "day") {
        this.type = 'day'
      } else {
        this.type = 'month'
      }
    },
    getEventColor (event) {
      let hasImportant = (event.tags || []).filter(t => {
        return t.sign === "!"
      }).length > 0
      if (event.mood === undefined) {
        return ""
      } else if (hasImportant && event.mood < 0) {
        return "red accent-4"
      } else if (event.mood === -1) {
        return "amber darken-2"
      } else if (event.mood < -1) {
        return "red darken-1"
      } else if (hasImportant && event.mood > 0) {
        return "green accent-4"
      } else if (event.mood === 1) {
        return "light-green"
      } else if (event.mood > 1) {
        return "green darken-3"
      }
      return "grey darken-2"
    },
    showEvent ({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
      }

      if (this.selectedOpen) {
        this.selectedOpen = false
        requestAnimationFrame(() => requestAnimationFrame(() => open()))
      } else {
        open()
      }

      nativeEvent.stopPropagation()
    },
    renderMarkdown (text) {
      return RENDERER.render(insertTagMarkup(text))
    }
  }
}
</script>

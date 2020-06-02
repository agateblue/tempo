<template>
  <v-container style="max-width: 600px;">
    <v-timeline dense clipped>
      <v-slide-x-transition
        group
      >
        <v-timeline-item
          v-for="row in timelineRows"
          :key="row.id"
          :color="row.color"
          class="pb-0"
          small
        >
          <entry v-if="row.type === 'entry'" @updated="$emit('updated', $event)" @delete="$emit('delete', $event)" :row="row"></entry>
        </v-timeline-item>
      </v-slide-x-transition>

      <v-timeline-item
        hide-dot
      >
        <span>TODAY</span>
      </v-timeline-item>

      <v-timeline-item
        color="grey"
        icon-color="grey lighten-2"
        small
      >
        <v-row justify="space-between">
          <v-col cols="7">This order was archived.</v-col>
          <v-col class="text-right" cols="5">15:26 EDT</v-col>
        </v-row>
      </v-timeline-item>

      <v-timeline-item
        class="mb-4"
        small
      >
        <v-row justify="space-between">
          <v-col cols="7">
            <v-chip
              class="white--text ml-0"
              color="purple"
              label
              small
            >
              APP
            </v-chip>
            Digital Downloads fulfilled 1 item.
          </v-col>
          <v-col class="text-right" cols="5">15:25 EDT</v-col>
        </v-row>
      </v-timeline-item>

      <v-timeline-item
        class="mb-4"
        color="grey"
        small
      >
        <v-row justify="space-between">
          <v-col cols="7">
            Order confirmation email was sent to John Leider (john@vuetifyjs.com).
          </v-col>
          <v-col class="text-right" cols="5">15:25 EDT</v-col>
        </v-row>
      </v-timeline-item>

      <v-timeline-item
        class="mb-4"
        hide-dot
      >
        <v-btn
          class="mx-0"
          color="white"
        >
          Resend Email
        </v-btn>
      </v-timeline-item>

      <v-timeline-item
        class="mb-4"
        color="grey"
        small
      >
        <v-row justify="space-between">
          <v-col cols="7">
            A $15.00 USD payment was processed on PayPal Express Checkout
          </v-col>
          <v-col class="text-right" cols="5">15:25 EDT</v-col>
        </v-row>
      </v-timeline-item>

      <v-timeline-item
        color="grey"
        small
      >
        <v-row justify="space-between">
          <v-col cols="7">
            John Leider placed this order on Online Store (checkout #1937432132572).
          </v-col>
          <v-col class="text-right" cols="5">15:25 EDT</v-col>
        </v-row>
      </v-timeline-item>
    </v-timeline>
  </v-container>
</template>
<script>
import MarkdownIt from 'markdown-it'
import {getCompleteEntry, insertTagMarkup, quoteFrontMatter, getPrettyTimeFromDate} from '@/utils'
import Entry from './Entry'

const RENDERER = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
});
RENDERER.use(require('markdown-it-attrs'))
let aggregateConfigs = [
  {
    id: 'day',
    repr: (e) => e.date,
  },
  {
    id: 'week',
    repr: (e) => `Week ${e.weeknumber}, ${e.year}`,
  },
  {
    id: 'month',
    repr: (e) => {
      let d = new Date(1, e.month, 1)
      let monthName = d.toLocaleString('default', { month: 'long' })
      return `${monthName} ${e.year}`
    }
  },
]
function recordAggregate(config, aggregates, entry, init) {
  let complete = []
  if (init) {
    config.forEach((c) => {
      aggregates[c.id] = [{repr: c.repr(entry), entries: [entry]}]
    })
  } else {
    config.forEach((c) => {
      let lastGroup = aggregates[c.id][aggregates[c.id].length - 1]
      if (c.repr(entry) === lastGroup.repr) {
        lastGroup.entries.push(entry)
      } else {
        complete.push({type: c.id, data: lastGroup})
        aggregates[c.id].push([{repr: c.repr(entry), entries: [entry]}])
      }
    })
  }
  return complete
}
export default {
  props: ['entries'],
  components: {Entry} ,
  computed: {
    timelineRows () {
      let aggregates = {}
      let rows = []
      this.entries.forEach((e) => {
        let entry = getCompleteEntry(e)
        let row = {
          text: RENDERER.render(insertTagMarkup(quoteFrontMatter(entry.text))),
          id: Math.random(),
          color: 'grey',
          type: "entry",
          entry: entry,
          rawEntry: e,
          time: getPrettyTimeFromDate(entry.fullDate)
        }
        let baseColor = " accent-"
        if (entry.mood > 0) {
          row.color = "light-green" + baseColor + Math.min(entry.mood, 4)
        } else if (entry.mood < 0) {
          row.color = "deep-orange" + baseColor + Math.min(Math.abs(entry.mood), 4)
        }
        let additionalRows = recordAggregate(aggregateConfigs, aggregates, entry, rows.length === 0)
        rows = [...rows, row, ...additionalRows]
      })
      return rows
    }
  }
}
</script>

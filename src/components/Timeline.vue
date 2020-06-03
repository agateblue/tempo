<template>
  <div>
    <v-timeline  align-top dense clipped>
      <v-slide-x-transition
        group
      >
        <v-timeline-item
          v-for="row in timelineRows"
          :key="row.id"
          :color="row.color"
          class="pb-4"
          small
        >
          <entry v-if="row.type === 'entry'" @updated="$emit('updated', $event)" @delete="$emit('delete', $event)" :row="row"></entry>
        </v-timeline-item>
      </v-slide-x-transition>
    </v-timeline>
  </div>
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
      let reversedEntries = [...this.entries]
      reversedEntries.reverse()
      reversedEntries.forEach((e) => {
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

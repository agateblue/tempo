<template>
  <div>
    <template v-for="row in timelineRows">
      <v-card
        v-if="row.type === 'entry'"
        :key="row.id"
        elevation="1"
        class="my-2"
        :color="row.color"
      >
        <entry @updated="$emit('updated', $event)" @delete="$emit('delete', $event)" :row="row"></entry>
      </v-card>
      <h2
        v-else
        :key="row.repr"
        class="py-4 mt-5"
      >
        <date-entry :row="row"></date-entry>
      </h2>
    </template>
  </div>
</template>
<script>
import MarkdownIt from 'markdown-it'
import {getCompleteEntry, insertTagMarkup, getPrettyTimeFromDate} from '@/utils'
import Entry from './Entry'
import DateEntry from './DateEntry'

const RENDERER = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
});
RENDERER.use(require('markdown-it-attrs'))
RENDERER.use(require('@toycode/markdown-it-class'), { blockquote: 'blockquote' })
let aggregateConfigs = [
  {
    id: 'day',
    repr: (e) => e.fullDate.toLocaleDateString(),
  },
  // {
  //   id: 'week',
  //   repr: (e) => `Week ${e.weeknumber}, ${e.year}`,
  // },
  // {
  //   id: 'month',
  //   repr: (e) => {
  //     let d = new Date(1, e.month, 1)
  //     let monthName = d.toLocaleString('default', { month: 'long' })
  //     return `${monthName} ${e.year}`
  //   }
  // },
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
        complete.push({type: c.id, ...lastGroup})
        aggregates[c.id].push({repr: c.repr(entry), entries: [entry]})
      }
    })
  }
  return complete
}
function insertAggregates(config, rows, aggregates) {
  let final = []
  let handled = []
  rows.forEach((r) => {
    config.forEach((c) => {
      aggregates[c.id].forEach((a) => {
        if (handled.indexOf(a) === -1 && c.repr(r.entry) === a.repr) {
          handled.push(a)
          final.push(a)
        }
      })
    })
    final.push(r)
  })
  return final
}
export default {
  props: ['entries'],
  components: {Entry, DateEntry},
  computed: {
    timelineRows () {
      let aggregates = {}
      let rows = []
      let entries = [...this.entries]
      entries.forEach((e) => {
        let entry = getCompleteEntry(e)
        let row = {
          text: RENDERER.render(insertTagMarkup(entry.text)),
          id: Math.random(),
          color: 'grey',
          type: "entry",
          entry: entry,
          rawEntry: e,
          time: getPrettyTimeFromDate(entry.fullDate)
        }
        let baseColor = " lighten-"
        if (entry.mood > 0) {
          row.color = "light-green" + baseColor + Math.min(entry.mood + 1, 4)
        } else if (entry.mood < 0) {
          row.color = "deep-orange" + baseColor + Math.min(Math.abs(entry.mood) + 1, 4)
        }
        recordAggregate(aggregateConfigs, aggregates, entry, rows.length === 0)
        rows.push(row)
      })
      rows = insertAggregates(aggregateConfigs, rows, aggregates)
      return rows
    }
  }
}
</script>

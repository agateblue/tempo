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
        <entry
          @updated="$emit('updated', $event)"
          @replied="$emit('replied', $event)"
          @deleted="$emit('deleted', $event)"
          :row="row"></entry>
      </v-card>
      <h3
        v-else
        :key="row.repr"
        class="pt-2"
      >
        <date-entry :row="row"></date-entry>
      </h3>
    </template>
  </div>
</template>
<script>
import RENDERER from '@/markdown'
import {
  getShortEntryId,
  getCompleteEntry,
  insertTagMarkup,
  getPrettyTimeFromDate
} from '@/utils'
import Entry from './Entry'
import DateEntry from './DateEntry'

let aggregateConfigs = [
  {
    id: 'day',
    repr: (e) => e.fullDate.toDateString(),
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
  props: {
    entries: {},
    entryId: {required: false}
  },
  components: {Entry, DateEntry},
  computed: {
    timelineRows () {
      let aggregates = {}
      let rows = []
      let entries = [...this.entries]
      if (this.entryId) {
        entries = entries.filter(entry => {
          if (getShortEntryId(entry._id) === this.entryId) {
            return true
          } else if (entry.thread && getShortEntryId(entry.thread) === this.entryId) {
            return true
          }
          return false
        })
      }
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
        let baseColor = " accent-"
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

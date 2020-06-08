<template>
  <div>
    <chart-component
      v-for="chart in charts"
      :key="chart.label + days"
      :config="chart"
      :tags="queryableTags"
      :entries="queryableEntries"></chart-component>
  </div>
</template>
<script>
import { getCompleteEntry, } from '@/utils'

export default {
  props: ['entries', 'days'],
  components: {
    ChartComponent:  () => import(/* webpackChunkName: "visualization" */ "@/components/ChartComponent"),
  },
  data () {
    return {
      dataQuery: null,
      queriedData: null,
    }
  },
  computed: {
    charts () {
      return [
        {
          label: "Mood by day",
          help: "Higher is better",
          query: `SELECT date, sum(mood) as mood FROM ? GROUP BY date ORDER BY date DESC`,
          chartType: 'line',
        },
        {
          label: "Mood instability",
          help: "Lower is stabler",
          query: `Select date, posmood * negmood / 10 as instability From (SELECT date, sum(CASE when mood>0 then mood else 0 END) as posmood,  sum(CASE when mood<0 then abs(mood) else 0 END) AS negmood FROM ? GROUP BY date ORDER BY date DESC)`,
          chartType: 'line',
        },
        {
          label: "Predominent tags",
          query: `SELECT id, entries, mood from ? ORDER BY entries DESC limit 15`,
          chartType: 'table',
          source: 'tags'
        },
        {
          label: "Entries per week",
          query: `SELECT week, count(*) as entries FROM ? GROUP BY week ORDER BY week DESC`,
          chartType: 'table',
        },
        {
          label: "Average entry length",
          query: `SELECT date, avg(length(text)) as chars FROM ? GROUP BY date ORDER BY date DESC`,
          chartType: 'line',
        },
        // {
        //   label: "Mood for 'work' tag",
        //   query: `SELECT mood, sum(mood) as chars FROM ? WHERE tags->work->present = true GROUP BY mood`,
        //   chartType: 'json',
        // },
        // {
        //   label: "Sleep quality",
        //   query: `SELECT date, sum(tags->sleep->mood) as sleep FROM ? WHERE tags->sleep->present GROUP BY date ORDER BY date DESC`,
        //   chartType: 'line',
        // },
        {
          label: "Predominant moods",
          query: `SELECT mood, count(*) as entries FROM ? GROUP BY mood`,
          chartType: 'percentage',
        },
      ]
    },

    queryableEntries () {
      let defaultDays = this.days
      let limit = (new Date((new Date()).getTime() - (defaultDays * 24 * 3600 * 1000))).getTime()
      return this.entries.filter((e) => {
        return new Date(e.date) >= limit
      }).map((e) => {
        return getCompleteEntry(e)
      })
    },
    queryableTags () {
      let data = {}
      this.queryableEntries.forEach((e) => {
        Object.keys(e.tags).forEach(tid => {
          let t = data[tid] || {id: tid, entries: 0, mood: 0}
          t.entries += 1
          t.mood += e.mood
          data[tid] = t
        })
      })

      return Object.keys(data).map((t) => {
        return data[t]
      })
    },
  }
}
</script>

<template>
  <div>
    <chart-component
      v-for="chart in charts"
      :key="chart.label"
      :config="chart"
      :entries="queryableEntries"></chart-component>
  </div>
</template>
<script>
import { getCompleteEntry, } from '@/utils'

export default {
  props: ['entries'],
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
      let defaultDays = 60
      return [
        {
          label: "Mood by day",
          help: "Higher is better",
          query: `SELECT date, sum(mood) as mood FROM ? GROUP BY date ORDER BY date DESC LIMIT ${defaultDays}`,
          chartType: 'line',
        },
        {
          label: "Mood instability",
          help: "Lower is stabler",
          query: `Select date, posmood * negmood / 10 as instability From (SELECT date, sum(CASE when mood>0 then mood else 0 END) as posmood,  sum(CASE when mood<0 then abs(mood) else 0 END) AS negmood FROM ? GROUP BY date ORDER BY date DESC LIMIT ${defaultDays})`,
          chartType: 'line',
        },
        {
          label: "Entries per week",
          query: `SELECT week, count(*) as entries FROM ? GROUP BY week ORDER BY week DESC LIMIT ${Math.floor(defaultDays / 7)}`,
          chartType: 'table',
        },
        {
          label: "Average entry length",
          query: `SELECT date, avg(length(text)) as chars FROM ? GROUP BY date ORDER BY date DESC LIMIT ${defaultDays}`,
          chartType: 'line',
        },
        {
          label: "Mood for 'work' tag",
          query: `SELECT mood, sum(mood) as chars FROM ? WHERE tags->work->present = true GROUP BY mood`,
          chartType: 'json',
        },
        // {
        //   label: "Sleep quality",
        //   query: `SELECT date, sum(tags->sleep->mood) as sleep FROM ? WHERE tags->sleep->present GROUP BY date ORDER BY date DESC LIMIT ${defaultDays}`,
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
      let data = []
      this.entries.forEach((e) => {
        let entry = getCompleteEntry(e)
        data.push(entry)
      })
      return data
    },
  }
}
</script>

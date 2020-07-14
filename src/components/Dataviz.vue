<template>
  <div>
    <chart-component
      v-for="chart in charts"
      :key="chart.label + days"
      :config="chart"
      :tags="queryableTags"
      :builtin="chart.builtin"
      :entries="queryableEntries"></chart-component>
  </div>
</template>
<script>
import { getQueryableEntries, getQueryableTags} from '@/utils'

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
          builtin: true,
        },
        {
          label: "Mood instability",
          help: "Lower is stabler",
          query: `Select date, posmood * negmood / 10 as instability From (SELECT date, sum(CASE when mood>0 then mood else 0 END) as posmood,  sum(CASE when mood<0 then abs(mood) else 0 END) AS negmood FROM ? GROUP BY date ORDER BY date DESC)`,
          chartType: 'line',
          builtin: true,
        },
        {
          label: "Predominent tags",
          query: `SELECT id, entries, mood from ? ORDER BY entries DESC limit 15`,
          builtin: true,
          chartType: 'table',
          source: 'tags'
        },
        ...this.$store.state.charts
      ] 
    },

    queryableEntries () {
      return getQueryableEntries(this.entries, this.days)
    },
    queryableTags () {
      return getQueryableTags(this.queryableEntries)
    },
  }
}
</script>

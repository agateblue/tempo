<template>
  <div>
    <button class="link" ref="previous">Previous month</button>
    <button class="right floated link" ref="next">Next month</button>
    <div ref="heatmap">
    </div>
  </div>
</template>
<script>
require("d3")
require('cal-heatmap/cal-heatmap.css')
const CalHeatMap = require('cal-heatmap')
export default {
  props: {
    chartData: Object
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.$nextTick(() => {
        const cal = new CalHeatMap()
        cal.init(this.initArgs)
      })
    }
  },
  computed: {
    initArgs () {
      let self = this
      const points = {...this.chartData.dataPoints}
      return {
        nextSelector: this.$refs.next,
        previousSelector: this.$refs.previous,
        itemSelector: this.$refs.heatmap,
        start: this.chartData.start,
        data: points,
        maxDate: new Date(),
        domain: "month",
        subDomain: "x_day",
        legendVerticalPosition: "bottom",
        legendHorizontalPosition: "center",
        range: 1,
        label: {
          position: 'top'
        },
        cellSize: 40,
        cellRadius: 50,
        legendCellSize: 20,
        cellPadding: 8,
        legendCellPadding: 10,
        domainGutter: 10,
        itemName: ["mood", "mood"],
        domainDynamicDimension: false,
        subDomainTextFormat: "%d",
        legend: [-3, -1, 1, 3],
        verticalOrientation: true,
        highlight: ["now"],
        domainLabelFormat: "%Y-%m",
        animationDuration: 0,
        legendMargin: [10, 0, 0, 0],
        legendTitleFormat: {
          lower: 'Mood below {min}',
          inner: 'Mood between {down} and {up}',
          upper: 'Mood higher than {max}',
        },
        subDomainTitleFormat: {
          filled: 'Mood: {count} {connector} {date}'
        },
        onClick: function(date) {
          self.$emit('selected-date', date)
        }
      }
    }
  },
}
</script>

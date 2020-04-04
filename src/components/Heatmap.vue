<template>
  <div id="cal-heatmap">
  </div>
</template>
<script>
require("d3")
require('cal-heatmap/cal-heatmap.css')
const CalHeatMap = require('cal-heatmap')
export default {
  props: {
    data: Object
  },
  mounted () {
    this.$nextTick(() => {
      const cal = new CalHeatMap()
      cal.init({
        start: this.data.start,
        data: this.data.dataPoints,
        maxDate: new Date(),
        domain: "month",
        subDomain: "x_day",
        legendVerticalPosition: "top",
        range: 1,
        cellSize: 30,
        legendCellSize: 20,
        cellPadding: 8,
        legendCellPadding: 10,
        domainGutter: 10,
        itemName: ["mood", "mood"],
        domainDynamicDimension: false,
        subDomainTextFormat: "%d",
        legend: [-10, -5, 5, 10],
        verticalOrientation: true,
        legendMargin: [0, 0, 50, 0],
        legendTitleFormat: {
          lower: 'Mood below {min}',
          inner: 'Mood between {down} and {up}',
          upper: 'Mood higher than {max}',
        },
        subDomainTitleFormat: {
          filled: 'Mood: {count} {connector} {date}'
        }
      })
    })
  }
}
</script>

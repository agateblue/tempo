<template>
  <div class="chart">
    <div ref="chart"></div>
    <a class="right floated link" v-if="chart" @click.stop.prevent="chart.export()">Export chart…</a>
  </div>
</template>


<script>
import { Chart } from 'frappe-charts/dist/frappe-charts.esm.js'
import 'frappe-charts/dist/frappe-charts.min.css'

export default {
  props: ["options"],
  data () {
    return {
      chart: null,
    }
  },
  watch: {
    options: {
      immediate: true,
      deep: true,
      handler (v) {
        this.$nextTick(() => {
          this.chart = new Chart(this.$refs.chart, v)
        })
      }
    }
  }
}
</script>

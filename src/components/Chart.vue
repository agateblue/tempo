<template>
  <div class="chart">
    <div ref="chart"></div>
  </div>
</template>


<script>
import { Chart } from 'frappe-charts/dist/frappe-charts.esm.js'

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

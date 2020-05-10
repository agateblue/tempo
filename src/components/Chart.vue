<template>
  <div></div>
</template>


<script>
import { Chart } from 'frappe-charts/dist/frappe-charts.esm.js'
import 'frappe-charts/dist/frappe-charts.min.css'

export default {
  props: ["options"],
  watch: {
    options: {
      immediate: true,
      deep: true,
      handler (v) {
        this.$nextTick(() => {
          new Chart(this.$el, v)
        })
      }
    }
  }
}
</script>

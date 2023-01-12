<template>
  <div>
    <blueprint-visualization
      v-for="visualization in blueprint.visualizations"
      :key="visualization.label"
      :config="visualization"
      :tags="tags"
      :builtin="true"
      :group-by-period="params.groupByPeriod"
      :entries="entries">
    </blueprint-visualization>
  </div>
</template>
<script>

export default {
  props: ['entries', 'tags', 'blueprint', 'params'],
  components: {
    BlueprintVisualization:  () => import(/* webpackChunkName: "visualizationChunk" */ "@/components/BlueprintVisualization"),
  },
}
</script>

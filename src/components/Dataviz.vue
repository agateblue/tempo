<template>
  <div>
    <blueprint-visualization
      v-for="visualization in blueprint.visualizations"
      :key="visualization.label"
      :config="visualization"
      :tags="tags"
      :builtin="true"
      :entries="entries">
    </blueprint-visualization>
  </div>
</template>
<script>

export default {
  props: ['entries', 'tags', 'days', 'blueprint'],
  components: {
    BlueprintVisualization:  () => import(/* webpackChunkName: "visualization" */ "@/components/BlueprintVisualization"),
  },
}
</script>

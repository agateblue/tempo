<template>
  <div>
    <blueprint-vizualisation
      v-for="vizualisation in blueprint.vizualisations"
      :key="vizualisation.label"
      :config="vizualisation"
      :tags="tags"
      :builtin="true"
      :entries="entries">
    </blueprint-vizualisation>
  </div>
</template>
<script>

export default {
  props: ['entries', 'tags', 'days', 'blueprint'],
  components: {
    BlueprintVizualisation:  () => import(/* webpackChunkName: "vizualisation" */ "@/components/BlueprintVizualisation"),
  },
}
</script>

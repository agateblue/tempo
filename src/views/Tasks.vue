<template>
  <div>
    <v-card tag="section" v-if="!isConfigured" class="mb-8" :color="$theme.card.color">
      <v-card-title class="headline">Create your board</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <board-form></board-form>
      </v-card-text>
    </v-card>
    <template v-else>
      <h1 class="mb-4">Your board</h1>
      <div class="board">
        <v-card class="task-list mr-4" v-for="(list, idx) in $store.getters['taskLists']" :key="idx">
          <v-card-title class="headline">{{ list.label }}</v-card-title>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script>

export default {
  components: {
    BoardForm:  () => import(/* webpackChunkName: "tasks" */ "@/components/BoardForm"),
  },
  computed: {
    isConfigured () {
      return this.$store.state.taskLists && this.$store.state.taskLists.length > 0  
    }
  }
}
</script>

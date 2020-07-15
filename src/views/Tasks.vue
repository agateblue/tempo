<template>
  <div>
    <v-card
      tag="section"
      v-if="!isConfigured || isEditing"
      class="mb-8"
      :color="$theme.card.color">
      <v-card-title class="headline" v-if="isEditing">Update your board</v-card-title>
      <v-card-title class="headline" v-else>Create your board</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <board-form @updated="isEditing = false"></board-form>

      </v-card-text>
    </v-card>
    <template v-else>
      <v-row>
        <v-col>
          <h1>Your board</h1>
        </v-col>
        <v-col>
          <v-btn class="float-right" @click="isEditing = true" color="secondary">Edit...</v-btn>
        </v-col>
      </v-row>
      <div class="board">
        <v-card class="task-list mr-4" v-for="(list, idx) in $store.getters['boardLists']" :key="idx">
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
  data () {
    return {
      isEditing: false,
    }
  },
  computed: {
    isConfigured () {
      return this.$store.state.boardConfig && this.$store.state.boardConfig.lists.length > 0  
    }
  }
}
</script>

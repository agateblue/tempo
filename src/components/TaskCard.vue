<template>
  <v-card :color="$theme.nestedCard.color">
    <v-btn
      icon
      small
      class="float-right mx-3 my-2"
      @click="expanded = !expanded"
    >
      <v-icon>{{ expanded ? $icons.mdiChevronUp : $icons.mdiChevronDown }}</v-icon>
    </v-btn>
    <v-card-text :class="[$theme.nestedCard.textSize, 'py-3 px-3']">{{ task.text }}</v-card-text>
    <v-card-text class="pt-0" v-if="category">
      <v-chip
        class="px-1"
        x-small
        :color="category.color[0]"
        :text-color="category.color[1]"
      >
        {{ category.label }}
      </v-chip>
    </v-card-text>
    <template v-if="expanded">
      <v-divider></v-divider>
      <v-card-text>
        <v-text-field label="Text" v-model="newTask.text">
        </v-text-field>
        <v-select
          v-model="newTask.category"
          :items="$store.getters['taskCategoryChoices']"
          label="Category"
        ></v-select>
        <v-select
          v-model="newTask.list"
          :items="$store.getters['taskListChoices']"
          label="List"
        ></v-select>
        <v-btn small text color="red" @click.prevent="deleteTask">
         <v-icon left>{{ $icons.mdiDelete }}</v-icon>
          Delete
        </v-btn>
        <v-btn small text color="primary" class="float-right" @click.prevent="updateTask">
          Update
        </v-btn>
      </v-card-text>
    </template>
  </v-card>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
const COLOR_CHOICES = [
  ["green", "white"],
  ["blue", "white"],
  ["teal", "white"],
  ["pink", "white"],
  ["purple", "white"],
  ["indigo", "white"],
  ["deep-orange", "white"],
  ["black", "white"],
]
export default {
  props: ['task'],
  data () {
    return {
      expanded: false,
      newTask: cloneDeep(this.task)
    }
  },
  computed: {
    category () {
      if (!this.task.category) {
        return 
      }
      let index = 0
      let colorIndex = null
      this.$store.state.boardConfig.categories.forEach((c) => {
        if (c.label.toLowerCase() == this.task.category.toLowerCase()) {
          colorIndex = index
        }
        index += 1
      })
      let d = {
        label: this.task.category, 
      }
      if (colorIndex != null) {
        d.color = COLOR_CHOICES[colorIndex]
      }
      return d
    }
  },
  methods: {
    deleteTask () {
      this.$store.state.db.remove(this.task)
      this.$emit('deleted')
    },
    async updateTask () {
      let result = await this.$store.state.db.put(this.newTask)
      this.newTask._rev = result.rev
      this.expanded = false
      this.$emit('updated', this.newTask)
    },
  }
}
</script>

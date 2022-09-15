<template>
  <v-card :color="$theme.nestedCard.color">
    <v-btn
      icon
      small
      class="float-right mx-3 my-2"
      transition=""
      @click="expanded = !expanded"
    >
      <v-icon transition="" >{{ expanded ? $icons.mdiChevronUp : $icons.mdiChevronDown }}</v-icon>
    </v-btn>
    <v-card-text :class="[$theme.nestedCard.textSize, 'py-3 px-3']">
      <v-checkbox
        class="task-checkbox my-0 py-0"
        :disabled="isDone"
        v-model="completed"
        :label="task.text"
      ></v-checkbox>
    </v-card-text>
    <v-card-text class="px-3 pt-0 pb-2" v-if="category">
      <v-chip
        class="px-1"
        x-small
        @click.prevent="$router.push({
          path: '/tasks',
          query: { q: `category:${category.label}`},
        })"
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
        <v-btn transition="" small text color="red" @click.prevent="deleteTask">
         <v-icon left transition="">{{ $icons.mdiDelete }}</v-icon>
          Delete
        </v-btn>
        <v-btn transition="" small text color="primary" class="float-right" @click.prevent="updateTask">
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
  props: ['task', 'isDone'],
  data () {
    return {
      expanded: false,
      newTask: cloneDeep(this.task),
      completed: this.isDone,
    }
  },
  computed: {
    category () {
      if (!this.task.category) {
        return 
      }
      let index = 0
      let colorIndex = null
      this.$store.state.settings.boardConfig.categories.forEach((c) => {
        if (c.label.toLowerCase() == this.task.category.toLowerCase()) {
          colorIndex = index
        }
        index += 1
      })
      let d = {
        label: this.task.category,
        color: ['teal', 'white'], 
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
  },
  watch: {
    completed (v) {
      if (v) {
        this.$emit('done', this.task)
      }
    }
  }
}
</script>

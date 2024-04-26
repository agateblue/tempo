<template>
  <v-card :color="$theme.nestedCard.color">
    <v-system-bar
      :class="{'red': isLate, 'light-green': !isLate}"
      text-color=white
      v-if=task.deadline
      small
    >
        <v-icon small v-if=isLate>{{ $icons.mdiClockAlert }}</v-icon>
        <span class="font-weight-bold">{{ task.deadline }}</span>
    </v-system-bar>

    <v-card-text :class="[$theme.nestedCard.textSize, 'pt-3 pb-1 px-3']">
      <v-checkbox
        class="task-checkbox my-0 py-0"
        :disabled="isDone"
        v-model="completed"
        :label="task.text"
        :ripple="false"
      ></v-checkbox>
    </v-card-text>
    <v-card-text :class="[$theme.nestedCard.textSize, 'pt-3 pb-1 px-3']">
      <v-row>
        <v-col
          cols="6"
          sm="6"
          class="pb-0"
        >
          <v-chip
            v-if="category"
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
        </v-col>
        <v-col
          cols="6"
          sm="6"
          class="text-right pb-0"
        >
          <v-btn
            transition=""
            transparent
            depressed
            icon
            small
            color="grey"
            title="Add subtasks…"
            @click="showSubtasks = !showSubtasks"
          >
            <v-icon transition="" >{{ $icons.mdiFormatListBulleted }}</v-icon>
          </v-btn>
          <v-btn
            transition=""
            transparent
            depressed
            icon
            small
            title="Show options…"
            @click="expanded = !expanded"
          >
            <v-icon transition="" >{{ expanded ? $icons.mdiChevronUp : $icons.mdiChevronDown }}</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <subtask-list
        ref="subtaskList"
        v-if="showSubtasks"
        :value="newTask.subtasks"
        :taskCompleted="completed"
        @input="newTask.subtasks = $event; updateTask()"
      />
    </v-card-actions>
    <form v-if="expanded" @submit.prevent="updateTask" class="mt-4">
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
        <v-text-field
          v-model="newTask.deadline"
          label="Deadline"
          type="date"
          ></v-text-field>
        <v-btn transition="" small text color="red" @click.prevent="deleteTask">
         <v-icon left transition="">{{ $icons.mdiDelete }}</v-icon>
          Delete
        </v-btn>
        <v-btn transition="" type="submit" small text color="primary" class="float-right">
          Update
        </v-btn>
      </v-card-text>
    </form>
  </v-card>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import SubtaskList from '@/components/SubtaskList'

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
    let localTask = {subtasks: [], ...cloneDeep(this.task)}
    return {
      expanded: false,
      newTask: localTask,
      completed: this.isDone,
      showSubtasks: this.isDone ? false : localTask.subtasks.length > 0,
    }
  },
  components: {SubtaskList},
  computed: {
    isLate () {
      if (this.task.deadline &&
          this.task.deadline < new Date().toISOString() &&
          !this.isDone) {
        return true
      }
      return false
    },
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
    async deleteTask () {
      this.$store.state.db.remove(this.task)
      this.$emit('deleted', this.task)
      await this.$store.dispatch('forceSync', {updateLastSync: false})
    },
    async updateTask () {
      let result = await this.$store.state.db.put(this.newTask)
      this.newTask._rev = result.rev
      this.expanded = false
      this.$emit('updated', this.newTask)
      await this.$store.dispatch('forceSync', {updateLastSync: false})
    },
  },
  watch: {
    'newTask.subtasks' (v) {
      if (v.filter(t => {return t.done}).length === v.length) {
        this.completed = true
      }
    },
    completed (v) {
      if (v) {
        this.$emit('done', this.task)
      }
    },
    showSubtasks (v) {
      if (v) {
        this.$nextTick(() => {
          let textareas = this.$refs.subtaskList.$el.getElementsByTagName('textarea')
          textareas[textareas.length - 1].focus()
        })
      }
    }
  }
}
</script>

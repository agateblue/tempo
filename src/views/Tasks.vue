<template>
  <div :key="`tasks-${$store.state.lastSync}`">
    <v-card
      tag="section"
      v-if="isEditing"
      class="mb-8"
      :color="$theme.card.color">
      <v-card-title class="headline">Update your board</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <board-form @updated="isEditing = false; trackEvent($store, 'board.updated')"></board-form>
      </v-card-text>
    </v-card>
    <template v-else>
      <v-row class="v-align">
        <v-col>
          <h1>Your board</h1>
        </v-col>
        <v-col>
          <v-btn 
            class="float-right"
            @click="isEditing = true" 
            small
            transition="" 
            color="secondary">Edit...</v-btn>
        </v-col>
      </v-row>
      <div class="board">
        <v-card
          :class="['task-list mr-4', {collapsed: !lists[idx].expanded}, {expanded: lists[idx].expanded}]"
          v-for="(list, idx) in $store.getters['boardLists']"
          :key="idx">
          <v-card-title class="px-2 py-0 body-1">
            <v-row class="py-3">
              <v-col cols="10">
                <v-btn transition="" x-small icon @click="lists[idx].expanded = !lists[idx].expanded">
                  <v-icon transition="" v-if="lists[idx].expanded">{{ $icons.mdiChevronDown }}</v-icon>
                  <v-icon transition="" v-else>{{ $icons.mdiChevronUp }}</v-icon>
                </v-btn>
                {{ list.label }} · {{ (tasksByList[idx] || []).length }}
              </v-col>
              <v-col cols="2" v-if="lists[idx].expanded">
                <v-btn
                  v-if="idx >= $store.getters['boardLists'].length - 1"
                  class="float-right"
                  fab
                  dark
                  x-small
                  @click.prevent="clearDoneDialog = true"
                  transition=""
                  title="Clear tasks in column"
                  color="secondary">
                  <v-icon transition="">{{ $icons.mdiTrashCan }}</v-icon>
                </v-btn>
                <v-btn
                  v-else
                  class="float-right"
                  fab
                  dark
                  x-small
                  @click.prevent="lists[idx].showForm = !lists[idx].showForm"
                  transition=""
                  title="Add task"
                  color="secondary">
                  <v-icon transition="">{{ $icons.mdiPlus }}</v-icon>
                </v-btn>
                <v-dialog
                  v-model="clearDoneDialog"
                  max-width="400"
                >
                  <v-card :color="$theme.card.color">
                    <v-card-title class="headline">Delete {{ tasksByList[idx].length }} tasks from this column?</v-card-title>
                    <v-card-text>
                      This will remove all {{ tasksByList[idx].length }} tasks in this column. This action is irresversible.
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>

                      <v-btn
                        color="secondary"
                        text
                        @click="clearDoneDialog = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        color="primary"
                        text
                        @click="clearDoneDialog = false;removeTasks(tasksByList[idx])"
                      >
                        Delete
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
            </v-row>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text v-if="lists[idx].expanded" class="py-2 px-2">
            <v-card v-if="lists[idx].showForm" :color="$theme.nestedCard.color">
              <v-card-text class="pb-0 px-2 pt-1">
                <v-form :ref="`form${idx}`">
                  <v-text-field
                    label="Task"
                    autofocus
                    v-model="newTaskText"
                    @keydown.enter="submitTask(idx)"
                    required></v-text-field>
                  <v-select
                    :items="$store.getters['taskCategoryChoices']"
                    v-model="newTaskCategory"
                    @keydown.enter="submitTask(idx)"
                    label="Category"
                  ></v-select>
                  <v-text-field
                    label="Deadline"
                    v-model="newTaskDeadline"
                    type="date"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions class="py-4 px-0">
                <v-row>
                  <v-col class="ml-3">
                    <v-btn transition="" class="float-left" text @click.prevent="lists[idx].showForm = false">
                      Cancel
                    </v-btn>
                  </v-col>
                  <v-col class="mr-4">
                    <v-btn transition="" class="float-right" color="primary" @click.prevent="submitTask(idx)">
                      Add
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-actions>
            </v-card>
            <draggable
              class="list-group"
              v-model="tasksByList[idx]"
              :group="{ name: 'tasks' }"
              filter="input, button, textarea"
              :prevent-on-filter="false"
              @add="moveCard($event.item.dataset.id, idx)">
              <v-lazy
                :options="{
                  threshold: .5
                }"
                :data-id="task._id"
                min-height="50"
                transition=""
                :key="`task-${task._id}`"
                v-for="task in tasksByList[idx]"
              >
                <task-card
                  class="mb-2"
                  :task="task"
                  :is-done="idx === $store.getters['boardLists'].length - 1"
                  transition="" 
                  @done="moveCard($event._id, $store.getters['boardLists'].length - 1); trackEvent($store, 'task.completed')"
                  @deleted="deleteTask($event); trackEvent($store, 'task.deleted')"
                  @updated="updateTask($event); trackEvent($store, 'task.updated')"
                  ></task-card>
              </v-lazy>
            </draggable>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script>

import sortBy from 'lodash/sortBy'
import {getTasks, trackEvent} from '@/utils'

export default {
  props: {
    query: String
  },
  components: {
    BoardForm:  () => import(/* webpackChunkName: "tasks" */ "@/components/BoardForm"),
    TaskCard:  () => import(/* webpackChunkName: "tasks" */ "@/components/TaskCard"),
    draggable:  () => import(/* webpackChunkName: "tasks" */ "vuedraggable"),
  },
  data () {
    return {
      isEditing: false,
      lists: {
        0: {showForm: false, expanded: true},
        1: {showForm: false, expanded: true},
        2: {showForm: false, expanded: true},
        3: {showForm: false, expanded: true},
        4: {showForm: false, expanded: true},
        5: {showForm: false, expanded: true},
        6: {showForm: false, expanded: true},
        7: {showForm: false, expanded: true},
        8: {showForm: false, expanded: true},
        9: {showForm: false, expanded: true},
      },
      tasks: [],
      newTaskText: '',
      newTaskCategory: null,
      newTaskDeadLine: null,
      trackEvent,
      clearDoneDialog: false,
    }
  },
  async created () {
    this.tasks = await getTasks(this.$store, this.query)
  },
  computed: {
    tasksByList () {
      let d = {}
      let i = -1
      this.$store.getters["boardLists"].forEach(() => {
        i += 1
        d[i] = sortBy(this.tasks.filter((t) => {
          return t.list === i
        }, ['_id']))
        d[i].reverse()
      })
      return d
    }
  },
  methods: {
    async submitTask(idx) {
      if (!this.newTaskText || this.newTaskText.length === 0) {
        return
      }
      this.lists[idx].showForm = false
      let date = (new Date()).toISOString()
      let task = {
        type: 'task',
        _id: date,
        date,
        index: -this.tasksByList[idx].length,
        text: this.newTaskText,
        list: idx,
        category: this.newTaskCategory,
        deadline: this.newTaskDeadline,
        subtasks: [],
      }
      let result = await this.$store.state.db.put(task)
      task._rev = result.rev
      this.tasks.push(task)
      this.newTaskText = null
      this.newTaskCategory = null
      this.newTaskDeadline = null
      trackEvent(this.$store, "task.created")
      await this.$store.dispatch('forceSync', {updateLastSync: false})
    },
    async updateTasks () {
      this.tasks = await getTasks(this.$store, this.query)
    },
    async deleteTask (task) {
      this.tasks = this.tasks.filter(t => {
        return t._id != task._id
      })
    },
    async updateTask (task) {
      this.tasks.forEach(t => {
        if (t._id === task._id) {
          Object.assign(t, task)
        }
      })
    },
    async moveCard (id, list) {
      let task = await this.$store.state.db.get(id)
      task.list = list
      let result = await this.$store.state.db.put(task)
      this.tasks.forEach(t => {
        if (t._id === id) {
          t.list = list
          t._rev = result.rev
        }
      })
      await this.$store.dispatch('forceSync', {updateLastSync: false})
    },
    async removeTasks(tasks) {
      let toDelete = tasks.map(t => {
        return {
          _id: t._id,
          _rev: t._rev,
          _deleted: true,
        }
      })
      console.log(`Deleting ${toDelete.length} tasks…`)
      await this.$store.state.db.bulkDocs(toDelete)
      await this.$store.dispatch('forceSync', {updateLastSync: false})
      this.tasks = await getTasks(this.$store, this.query)
    }
  },
  watch: {
    query: {
      handler: async function () {
        this.tasks = await getTasks(this.$store, this.query)
      },
      immediate: true,
    },
  }
}
</script>

<template>
  <div :key="String($store.state.lastSync)">
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
      <v-row class="v-align">
        <v-col>
          <h1>Your board</h1>
        </v-col>
        <v-col>
          <v-btn 
            class="float-right"
            @click="isEditing = true" 
            small
            color="secondary">Edit...</v-btn>
          <v-btn 
            class="float-right mx-2"
            @click.stop="exportDialog = true" 
            small
            color="secondary">Export...</v-btn>
        </v-col>
      </v-row>
      <v-dialog
        v-model="exportDialog"
        max-width="700"
      >
        <v-card :color="$theme.card.color">
          <v-card-title class="headline">Export your tasks</v-card-title>

          <v-card-text>
            <p>Export the selected {{ tasks.length }} tasks and your board configuration.</p>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              color="secondary"
              text
              @click="exportDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn color="primary" @click="downloadJSON">Export as JSON</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <div class="board">
        <v-card
          :class="['task-list mr-4', {collapsed: !lists[idx].expanded}, {expanded: lists[idx].expanded}]"
          v-for="(list, idx) in $store.getters['boardLists']"
          :key="idx">
          <v-card-title class="px-2 py-0 body-1">
            <v-row>
              <v-col cols="10">
                <v-btn x-small icon @click="lists[idx].expanded = !lists[idx].expanded">
                  <v-icon v-if="lists[idx].expanded">{{ $icons.mdiChevronDown }}</v-icon>
                  <v-icon v-else>{{ $icons.mdiChevronUp }}</v-icon>
                </v-btn>
                {{ list.label }} · {{ tasksByList[idx].length }}
              </v-col>
              <v-col cols="2" v-if="lists[idx].expanded">
                <v-btn
                  class="float-right"
                  fab
                  dark
                  x-small
                  @click.prevent="lists[idx].showForm = !lists[idx].showForm"
                  color="secondary">
                  <v-icon>{{ $icons.mdiPlus }}</v-icon>
                </v-btn>
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
                </v-form>
              </v-card-text>
              <v-card-actions class="py-0 px-2 mb-5">
                <v-row>
                  <v-col>
                    <v-btn class="float-left" text @click.prevent="lists[idx].showForm = false">
                      Cancel
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn class="float-right" color="primary" @click.prevent="submitTask(idx)">
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
              @add="moveCard($event.item.dataset.id, idx)">
              <task-card
                class="mb-2"
                :task="task"
                :data-id="task._id"
                :is-done="idx === $store.getters['boardLists'].length - 1"
                v-for="task in tasksByList[idx]"
                @done="moveCard($event._id, $store.getters['boardLists'].length - 1)"
                @deleted="updateTasks"
                @updated="updateTasks"
                :key="`task-${task._id}-${task._rev}`"></task-card>
            </draggable>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script>

import sortBy from 'lodash/sortBy'
import {parseQuery, matchTokens} from '@/utils'

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
      tasksByList: {},
      newTaskText: '',
      newTaskCategory: null,
      exportDialog: false,
    }
  },
  async created () {
    this.tasks = await this.getTasks()
  },
  computed: {
    isConfigured () {
      return this.$store.state.boardConfig && this.$store.state.boardConfig.lists.length > 0  
    },
  },
  methods: {
    getTasksByList () {
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
    },
    filterTasks (tasks, queryTokens) {
      if (queryTokens.length === 0) {
        return tasks
      }
      return tasks.filter((e) => {
        return matchTokens(e, queryTokens)
      })
    },
    async getTasks () {
      let result = await this.$store.state.db.find({
        selector: {
          type: 'task',
          date: { $gt: 0 }
        }
      })
      let tasks = result.docs
      return this.filterTasks(
        tasks,
        parseQuery(this.query),
      )
    },
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
      }
      let result = await this.$store.state.db.put(task)
      task._rev = result.rev
      this.tasks.push(task)
      this.newTaskText = null
      this.newTaskCategory = null
    },
    async updateTasks () {
      this.tasks = await this.getTasks()
    },
    async moveCard (id, list) {
      let task = await this.$store.state.db.get(id)
      task.list = list
      await this.$store.state.db.put(task)
      await this.updateTasks()
    },
    downloadJSON () {
      let payload = JSON.stringify({
        tasks: this.tasks,
        boardConfig: this.$store.state.boardConfig
      })
      this.downloadFile(payload, 'application/json', 'tempo.json')
    },
    downloadFile (text, mimetype, name) {
      let f = this.makeFile(text, mimetype)
      var link = document.createElement('a')
      link.setAttribute('download', name)
      link.href = f
      document.body.appendChild(link)

      window.requestAnimationFrame(function () {
        var event = new MouseEvent('click')
        link.dispatchEvent(event)
        document.body.removeChild(link)
      })
    },
    makeFile (text, mimetype) {
      let data = new Blob([text], {type: mimetype})
      let textFile = window.URL.createObjectURL(data)
      return textFile
    },
  },
  watch: {
    query: {
      handler: async function () {
        this.tasks = await this.getTasks()
      },
      immediate: true,
    },

    "$store.state.lastSync": {
      async handler () {
        this.tasks = await this.getTasks()
      }
    },

    tasks: {
      handler () {
        if (!this.isConfigured) {
          return
        }
        this.tasksByList = this.getTasksByList()
        this.lists[this.$store.getters['boardLists'].length - 1].expanded = false
      },
      immediate: true,
      deep: true,
    }
  }
}
</script>

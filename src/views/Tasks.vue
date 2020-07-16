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
          <v-btn class="float-right mx-2" @click.stop="exportDialog = true" color="secondary">Export...</v-btn>
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
        <v-card class="task-list mr-4" v-for="(list, idx) in $store.getters['boardLists']" :key="idx">
          <v-card-title class="px-2 py-0">
            <v-row>
              <v-col>
                {{ list.label }}
              </v-col>
              <v-col>
                <v-btn
                  class="float-right"
                  fab
                  dark
                  x-small
                  @click.prevent="showTaskForm[idx] = !showTaskForm[idx]"
                  color="secondary">
                  <v-icon>{{ $icons.mdiPlus }}</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="py-2 px-2">
            <v-card v-if="showTaskForm[idx]" :color="$theme.nestedCard.color">
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
                    label="Category"
                  ></v-select>
                </v-form>
              </v-card-text>
              <v-card-actions class="py-0 px-2 mb-5">
                <v-row>
                  <v-col>
                    <v-btn class="float-left" text @click.prevent="showTaskForm[idx] = false">
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
              @add="moveCard($event, idx)">
              <task-card
                class="mb-2"
                :task="task"
                :data-id="task._id"
                v-for="task in tasksByList[idx]"
                @deleted="updateTasks"
                @updated="updateTasks"
                :key="`task-${task._id}`"></task-card>
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
      showTaskForm: {
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
        9: false,
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
      console.log('Tokens', queryTokens)
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
      this.showTaskForm[idx] = false
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
    async moveCard (evt, list) {
      let task = await this.$store.state.db.get(evt.item.dataset.id)
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
    tasks: {
      handler () {
        if (!this.isConfigured) {
          return
        }
        this.tasksByList = this.getTasksByList()
      },
      immediate: true,
      deep: true,
    }
  }
}
</script>

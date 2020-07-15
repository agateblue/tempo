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
          <v-card-title class="px-3">
            <v-row>
              <v-col>
                {{ list.label }}
              </v-col>
              <v-col>
                <v-btn
                  class="float-right"
                  fab
                  dark
                  small
                  @click.prevent="showTaskForm[idx] = !showTaskForm[idx]"
                  color="secondary">
                  <v-icon>{{ $icons.mdiPlus }}</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-card v-if="showTaskForm[idx]" :color="$theme.nestedCard.color">
              <v-card-text class="pb-0 px-2 pt-1">
                <v-form :ref="`form${idx}`">
                  <v-text-field
                    label="Task"
                    autofocus
                    v-model="newTaskText"
                    @keydown.enter="submitTask(idx)"
                    required></v-text-field>
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
            <v-card
              :color="$theme.nestedCard.color"
              class="mb-5"
              v-for="(task, taskIdx) in tasksByList[idx]"
              :key="`task${taskIdx}`">
              <v-card-text :class="$theme.card.textSize">{{ task.text }}</v-card-text>
            </v-card>
          </v-card-text>
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
      newTaskText: '',
    }
  },
  async created () {
    this.tasks = await this.getTasks()
  },
  computed: {
    isConfigured () {
      return this.$store.state.boardConfig && this.$store.state.boardConfig.lists.length > 0  
    },
    tasksByList () {
      let d = {}
      let i = -1
      this.$store.state.boardConfig.lists.forEach(() => {
        i += 1
        d[i] = this.tasks.filter((t) => {
          return t.list === i
        })
        d[i].reverse()
      })
      return d
    }
  },
  methods: {
    async getTasks () {
      let result = await this.$store.state.db.find({
        selector: {
          type: 'task',
          date: { $gt: 0 }
        },
        sort: [{"date": "desc"}]
      })
      return result.docs
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
        text: this.newTaskText,
        list: idx,
        category: null, 
      }
      let result = await this.$store.state.db.put(task)
      task._rev = result.rev
      this.tasks.push(task)
      this.newTaskText = null
    }
  }
}
</script>
<template>
  <v-card :color="color" outlined>
    <v-toolbar v-if="!compact" :color="$theme.appBar.color">
      <v-btn icon @click="$emit('update:show', false)">
        <v-icon>{{ $icons.mdiClose }}</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-toolbar-title v-if="entry">Update entry</v-toolbar-title>
      <v-toolbar-title v-else>Write a new entry</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text @click="submit">Save</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-container :class="['narrow mt-4', {'px-0 px-0': compact}]">
      <v-textarea
        clearable
        outlined
        :name="name"
        ref="textarea"
        id="composer"
        :auto-grow="!compact"
        autofocus
        @keydown.ctrl.enter.exact="submit"
        :label="textareaLabel"
        placeholder="How do you feel?"
        v-model="text"
      ></v-textarea>
      <div v-if="compact" class="d-flex justify-space-between">
        <v-btn text @click="$emit('fullscreen')">Edit in fullscreen</v-btn>
        <v-btn text @click="submit">Save</v-btn>
      </div>
    </v-container>
    <v-divider v-if="!compact"></v-divider>
    <v-container class="narrow mt-4" v-if="!compact">
      <v-expansion-panels v-model="panel" flat>
        <v-expansion-panel>
          <v-expansion-panel-header>Shortcuts</v-expansion-panel-header>
          <v-expansion-panel-content>
            <template v-if="$store.state.shortcuts.length > 0">
              <h3 class="my-4">Existing shortcuts</h3>
              <v-list dense>
                <v-list-item
                  v-for="shortcut in $store.state.shortcuts"
                  :key="shortcut"
                  @click="text = shortcut;$refs.textarea.focus();panel = null"
                >

                  <v-list-item-content>
                    {{ shortcut }}
                  </v-list-item-content>
                  <v-list-item-icon>
                    <v-btn icon @click.stop.prevent="$store.dispatch('removeShortcut', shortcut)">
                      <v-icon>{{ $icons.mdiClose }}</v-icon>
                    </v-btn>
                  </v-list-item-icon>

                </v-list-item>
              </v-list>
            </template>

            <h3 class="my-4">New shortcut</h3>
            <p>Add a new shortcut to quickly log a given entry in the future.</p>
            <v-form>
              <v-text-field
                v-model="newShortcut"
                label="Shortcut content"
                placeholder="Feeling +good"
                required
              ></v-text-field>
              <v-btn
                :disabled="!newShortcut"
                @click="$store.dispatch('newShortcut', newShortcut)"
              >
                Add
              </v-btn>
            </v-form>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Date and time</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-date-picker
              v-model="newDate"
              :landscape="$vuetify.breakpoint.mdAndUp"
              scrollable
              ></v-date-picker>
            <v-time-picker
              class="mt-2"
              v-model="newTime"
              :landscape="$vuetify.breakpoint.mdAndUp"
              scrollable
              ></v-time-picker>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

    </v-container>
  </v-card>
</template>

<script>
import throttle from 'lodash/throttle'

import {getNewEntryData, pad, getPrettyTimeFromDate} from '@/utils'
export default {
  props: {
    entry: {type: Object, default: null},
    name: {type: String, default: 'how'},
    initialText: {type: String, default: ''},
    textareaLabel: {type: String, default: 'Entry content'},
    color: {type: String, default: ''},
    compact: {type: Boolean, default: false},
  },
  data () {
    return {
      text: this.initialText,
      dateDialog: false,
      newDate: null,
      newTime: null,
      timeMenu: false,
      dateMenu: false,
      maxDate: null,
      maxTime: null,
      newShortcut: null,
      panel: null,
    }
  },
  async created () {
    this.setMaxDate()
    let date = new Date()
    if (this.entry) {
      this.text = this.entry.text
      date = new Date(this.entry.date)
    } else if (!this.text) {
      this.text = localStorage.getItem('entry-draft')
    }
    this.date = date
    await this.$store.dispatch('loadShortcuts')
  },
  computed: {
    date: {
      get () {
        if (!this.newDate || !this.newTime) {
          return null
        }
        let d = new Date()
        return `${this.newDate}T${this.newTime}:${pad(d.getSeconds(), 2)}`
      },
      set (v) {
        if (!v) {
          this.newDate = null
          this.newTime = null
          return
        }
        if (!v.toISOString) {
          v = new Date(v)
        }
        let iso = v.toISOString().split('T')
        this.newDate = iso[0]
        this.newTime = getPrettyTimeFromDate(v)

      }
    }
  },
  methods: {
    setMaxDate () {
      let now = new Date()
      let parts = now.toISOString().split('T')
      this.maxDate = parts[0]
      this.maxTime = parts[1]
    },
    async submit () {
      if (!this.text) {
        return
      }
      if (this.entry) {
        await this.update()
      } else {
        await this.addNew()
      }
      this.$emit('submitted', this.entry)
      await this.$store.dispatch('triggerWebhook')
    },
    async addNew () {
      let date = this.date ? new Date(this.date) : new Date()
      let data = {
        ...getNewEntryData(this.text),
        date: date.toISOString(),
      }
      data._id = data.date
      let e = await this.$store.dispatch('addEntry', data)
      this.$emit('created', e)
      this.text = ''
      this.date = null
    },
    async update () {
      let date = new Date(this.date || this.entry.date)
      let data = {
        ...getNewEntryData(this.text),
        _rev: this.entry._rev,
        _id: this.entry._id,
        date: date.toISOString(),
      }
      let e = await this.$store.dispatch('updateEntry', data)
      this.$emit('updated', e)
    }
  },
  watch: {
    text: {
      handler: throttle(function (v) {
        if (!this.entry) {
          localStorage.setItem('entry-draft', v)
        }
      }, 1000, {leading: true, trailing: true})
    },
  }
}
</script>

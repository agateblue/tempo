<template>

  <v-dialog v-model="show" fullscreen hide-overlay transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar :color="$theme.appBar.color">
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
      <v-container class="narrow mt-4">
        <v-textarea
          clearable
          outlined
          :name="name"
          ref="textarea"
          id="composer"
          auto-grow
          autofocus
          rows="5"
          @keydown.ctrl.enter.exact="submit"
          label="Entry content"
          placeholder="How do you feel?"
          v-model="text"
        ></v-textarea>
      </v-container>
      <v-divider></v-divider>
      <v-container>
        <h2 class="text-center font-weight-light">Date and time</h2>
        <v-row>
          <v-col cols="12" md="6">
            <v-date-picker
              v-model="newDate"
              landscape
              scrollable
              ></v-date-picker>
          </v-col>
          <v-col cols="12" md="6">
            <v-time-picker
              v-model="newTime"
              landscape
              scrollable
              ></v-time-picker>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>

import {getNewEntryData, pad, getPrettyTimeFromDate} from '@/utils'
export default {
  props: {
    entry: {type: Object, default: null},
    show: {type: Boolean, default: false},
    name: {type: String, default: 'how'},
  },
  data () {
    return {
      text: null,
      dateDialog: false,
      newDate: null,
      newTime: null,
      timeMenu: false,
      dateMenu: false,
      maxDate: null,
      maxTime: null,
    }
  },
  created () {
    this.setMaxDate()
    let date = new Date()
    if (this.entry) {
      this.text = this.entry.text
      date = new Date(this.entry.date)
    }
    this.date = date
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
      this.$emit('update:show', false)
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
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <v-row>
      <v-col cols="12" sm="6">
        <v-textarea
          solo
          clearable
          :name="name"
          ref="textarea"
          autofocus
          auto-grow
          rows="2"
          :append-outer-icon="entry ? '': $icons.mdiSend"
          @click:append-outer="submit"
          @keydown.ctrl.enter.exact="submit"
          label="What's going on?"
          v-model="text"
        ></v-textarea>
      </v-col>
      <v-col offset="1" cols="5" sm="3" id="date-field">
        <v-menu
          top left
          :dark="$store.state.dark"
          ref="dateMenu"
          v-model="dateMenu"
          :close-on-content-click="true"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          attach="#date-field"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="newDate"
              label="Date"
              :prepend-icon="$icons.mdiCalendar"
              readonly
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="newDate" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="$refs.dateMenu.save(date)">OK</v-btn>
          </v-date-picker>
        </v-menu>
      </v-col>

      <v-col cols="5" sm="2" id="time-field">
        <v-menu
          :dark="$store.state.dark"
          ref="timeMenu"
          top left
          v-model="timeMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          :return-value.sync="newTime"
          transition="scale-transition"
          offset-y
          attach="#time-field"
          max-width="290px"
          min-width="290px"
        >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="newTime"
            label="Time"
            :prepend-icon="$icons.mdiClock"
            readonly
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker
          v-if="timeMenu"
          v-model="newTime"
          format="24hr"
          full-width
          scrollable
          @click:minute="$refs.timeMenu.save(newTime)"
          ></v-time-picker>
        </v-menu>
      </v-col>
    </v-row>
  </form>
</template>

<script>

import {getNewEntryData, pad, getPrettyTimeFromDate} from '@/utils'
export default {
  props: {
    entry: {type: Object, default: null},
    value: {type: String, default: ''},
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
    }
  },
  created () {
    let date = new Date()
    if (this.entry) {
      this.text = this.entry.text
      date = null
    }
    this.date = date
  },
  mounted () {
    this.$refs.textarea.focus()
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
        let iso = v.toISOString().split('T')
        this.newDate = iso[0]
        this.newTime = getPrettyTimeFromDate(v)

      }
    }
  },
  methods: {
    setDefaultDate () {
      if (!this.date) {
        this.date = new Date()
      }
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
      this.$refs.textarea.focus()
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

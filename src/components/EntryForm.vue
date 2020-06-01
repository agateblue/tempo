<template>
  <form @submit.prevent="submit">
    <v-textarea
      outlined
      :name="name"
      ref="textarea"
      :autofocus="true"
      @keydown.ctrl.enter.exact="submit"
      label="What's going on?"
      v-model="text"
    ></v-textarea>
    <v-row>
      <v-col cols="12" sm="5">
        <v-menu
          ref="dateMenu"
          v-model="dateMenu"
          :close-on-content-click="true"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
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
      <v-col cols="12" sm="5">
        <v-menu
          ref="timeMenu"
          v-model="timeMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          :return-value.sync="newTime"
          transition="scale-transition"
          offset-y
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
      <v-col cols="12" sm="2">
        <v-btn
          color="primary"
          type="submit"
        >
          Send
        </v-btn>
        <!-- <input type="submit" value="Send"> -->
      </v-col>
    </v-row>

         {{ newDate }} {{ newTime }}
  </form>
</template>

<script>
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

import {getNewEntryData} from '@/utils'
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
      date = new Date(this.entry.date) || null
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
        return `${this.newDate}T${this.newTime}:00`
      },
      set (v) {
        let iso = v.toISOString().split('T')
        this.newDate = iso[0]
        let time = iso[1].slice(0, 5).split(':')
        let hours = parseInt(time[0])
        let minutes = parseInt(time[1]) + (hours * 60)
        minutes = minutes - v.getTimezoneOffset()
        let realHours = Math.floor(minutes / 60);
        var realMinutes = minutes % 60;
        this.newTime = `${pad(realHours, 2)}:${pad(realMinutes, 2)}`

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
      let data = {
        ...getNewEntryData(this.text),
        _rev: this.entry._rev,
        _id: this.entry._id,
        date: (new Date(this.date)).toISOString(),
      }
      let e = await this.$store.dispatch('updateEntry', data)
      this.$emit('updated', e)
    }
  }
}
</script>

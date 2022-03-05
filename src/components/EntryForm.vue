<template>
  <v-card :color="color" outlined>
    <v-container :class="['narrow mt-4']">
      <v-textarea
        clearable
        outlined
        :name="name"
        ref="textarea"
        id="composer"
        auto-grow
        autofocus
        @keydown.ctrl.enter.exact="submit"
        :label="textareaLabel"
        placeholder="How do you feel?"
        v-model="text"
      ></v-textarea>
      <div class="d-flex align-top justify-space-between">
        <div>
          <v-switch
            v-model="showDateField"
            label="Set date..."
            class="mt-1"
          ></v-switch>
          <template v-if="showDateField">
            <v-text-field
              label="Date"
              v-model="textDate"
              type="datetime-local"
              :max="new Date().toLocaleDateString('en-ca')"
            ></v-text-field>
            <v-btn
              small
              @click.prevent="date = new Date()"
            >
              Set to now
            </v-btn>
          </template>
        </div>
        <div>
          <v-btn
            v-if="entry" 
            text
            small
            @click="$emit('cancel')"
          >
            Cancel
          </v-btn>
          <v-btn :color="$theme.mainButton.color" @click="submit">Save</v-btn>
        </div>
      </div>      
    </v-container>
  </v-card>
</template>

<script>
import format from 'date-fns/format'
import throttle from 'lodash/throttle'

import {getNewEntryData} from '@/utils'

export default {
  props: {
    entry: {type: Object, default: null},
    name: {type: String, default: 'how'},
    initialText: {type: String, default: ''},
    textareaLabel: {type: String, default: 'Entry content'},
    color: {type: String, default: ''},
  },
  data () {
    return {
      text: this.initialText,
      dateDialog: false,
      date: null,
      textDate: null,
      maxDate: null,
      showDateField: false,
    }
  },
  async created () {
    if (this.entry) {
      this.text = this.entry.text
      this.date = new Date(this.entry.fullDate)
    } else if (!this.text) {
      this.text = localStorage.getItem('entry-draft')
    }
  },
  methods: {
    async submit () {
      if (!this.text) {
        return
      }
      let e
      if (this.entry) {
        e = await this.update()
      } else {
        e = await this.addNew()
      }
      this.$emit('submitted', e)
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
      return e
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
      return e
    }
  },
  watch: {
    date: {
      handler (v) {
        if (!v) {
          this.textDate = null
        } else {
          this.textDate = format(v, "yyyy-MM-dd'T'HH:mm")
        }
      },
      immediate: true,
    },
    textDate: {
      handler (v) {
        if (v) {
          this.date = new Date(v)
        }
      },
      immediate: true,
    },
    text: {
      handler: throttle(function (v) {
        if (!this.entry) {
          localStorage.setItem('entry-draft', v || '')
        }
      }, 1000, {leading: true, trailing: true})
    },
  }
}
</script>

<template>
  <v-card :color="color" outlined>
    <v-container class="narrow px-0">
      <v-textarea
        clearable
        outlined
        :name="name"
        class="mt-0"
        ref="textarea"
        id="composer"
        auto-grow
        autofocus
        @keydown.ctrl.enter.exact="submit"
        :label="textareaLabel"
        placeholder="How do you feel?"
        v-model="text"
        hide-details
      ></v-textarea>
      <v-row class="mt-1 mb-3 px-3">
        <v-btn
          v-for="shortcut in shortcuts" :key="shortcut.value"
          :title="shortcut.name"
          text
          color="grey"
          class="px-1"
          style="min-width: 2.5em"
          @click.prevent="insertAtCursor($refs.textarea.$el.querySelector('textarea'), shortcut.value)"
        >
          
          {{ shortcut.value }}
        </v-btn>
      </v-row>
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
  computed: {
    shortcuts () {
      return [
        {value: "#", label: "Hashtag"},
        {value: "+", label: "Positive mood tag"},
        {value: "-", label: "Negative mood tag"},
        {value: "!", label: "Important mood tag"},
        {value: "~", label: "Mixed mood tag"},
        {value: "?", label: "Unknown mood tag"},
        {value: "@", label: "Annotation tag"},
      ]
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
    },
    insertAtCursor (field, value) {
      //IE support
      if (document.selection) {
          field.focus();
          // let sel = document.selection.createRange();
          this.text = value || "";
      }
      //MOZILLA and others
      else if (field.selectionStart || field.selectionStart == '0') {
          field.focus()
          let startPos = field.selectionStart;
          let endPos = field.selectionEnd;
          let currentValue = (field.value || "").substring(0, startPos)
          this.text = currentValue
              + value
              + field.value.substring(endPos, field.value.length);
      } else {
          this.text = (field.value || "") || value;
      }
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

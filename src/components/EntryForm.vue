<template>
  <form @submit.prevent="submit">
    <textarea
      :name="name"
      :id="name"
      rows="4"
      ref="textarea"
      @keydown.ctrl.enter.exact="submit"
      placeholder="What's going on in your life?"
      v-model="text"></textarea>
    <div class="inline field">
      <label for="date" class="inline">Date</label>
      <flat-pickr @on-open="setDefaultDate" placeholder="Now" class="inline" name="date" v-model="date" :config="{enableTime: true, position: 'below', time_24hr: true}"></flat-pickr>
    </div>
    <input class="right floated" type="submit" value="Send">
  </form>
</template>

<script>
import flatPickr from 'vue-flatpickr-component'

import {getNewEntryData} from '@/utils'
export default {
  props: {
    entry: {type: Object, default: null},
    value: {type: String, default: ''},
    name: {type: String, default: 'how'},
  },
  components: {
    flatPickr
  },
  data () {
    let text
    let date = new Date()
    if (this.entry) {
      text = this.entry.text
      date = new Date(this.entry.date) || null
    }
    return {
      text,
      date,
    }
  },
  mounted () {
    this.$refs.textarea.focus()
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

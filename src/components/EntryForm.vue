<template>
  <form @submit.prevent="submit">
    <textarea
      :name="name"
      :id="name"
      rows="4"
      ref="textarea"
      autofocus
      @keydown.ctrl.enter.exact="submit"
      placeholder="What's going on in your life?"
      v-model="text"></textarea>
    <div class="inline field">
      <label for="date" class="inline">Date</label>
      <flat-pickr class="inline" name="date" v-model="date" :config="{enableTime: true, position: 'below', time_24hr: true}"></flat-pickr>
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
      date = new Date(this.entry.date) || new Date()
    }
    return {
      text,
      date,
    }
  },
  methods: {
    async submit () {
      if (!this.text) {
        return
      }
      if (this.entry) {
        await this.update()
      } else {
        await this.addNew()
      }
    },
    async addNew () {
      let data = {
        ...getNewEntryData(this.text),
        date: (new Date(this.date)).toISOString(),
      }
      data._id = data.date
      let e = await this.$store.dispatch('addEntry', data)
      this.$emit('created', e)
      this.$refs.textarea.value = ''
      this.date = new Date()
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

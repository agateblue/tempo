<template>
  <form @submit.prevent="submit">
    <h2>
      <label for="how">How do you feel?</label>
    </h2>
    <textarea name="how" required id="how" rows="10" placeholder="I feel quite +happy today, my #friends are amazing <3" v-model="text"></textarea>
    <input type="submit">
  </form>
</template>

<script>
import {getNewEntryData} from '@/utils'

export default {
  data () {
    return {
      text: ''
    }
  },
  methods: {
    async submit () {
      let data = {
        ...getNewEntryData(this.text),
        date: (new Date ()).toISOString(),
      }
      data._id = data.date
      let result = await this.$store.dispatch('addEntry', data)
      this.$emit('added', result)
      this.text = ''
    }
  }
}
</script>

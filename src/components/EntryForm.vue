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
export default {
  data () {
    return {
      text: ''
    }
  },
  methods: {
    async submit () {
      let data = {
        text: this.text,
        type: "entry",
        date: (new Date ()).toISOString(),
      }
      data._id = data.date
      let result = await this.$store.dispatch('addEntry', data)
      this.$emit('added', result)
    }
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <textarea
      :name="name"
      :id="name"
      rows="4"
      ref="textarea"
      @keydown.ctrl.enter.exact="submit"
      placeholder="What's going on in your life?"
      @input="text = $event.target.value"
      :value="value"></textarea>
    <input class="right floated" type="submit" value="Send">
  </form>
</template>

<script>

export default {
  props: {
    value: {type: String, default: ''},
    name: {type: String, default: 'how'},
  },
  data () {
    return {
      text: this.value
    }
  },
  methods: {
    async submit () {
      if (!this.text) {
        return
      }
      let v = this.text
      this.$refs.textarea.value = ''
      this.$emit('input', v)
    }
  }
}
</script>

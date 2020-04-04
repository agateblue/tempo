<template>
  <form @submit.prevent="submit">
    <button class="right floated link" @click.stop.prevent="$emit('delete')" v-if="showDelete">Delete</button>
    <label :for="name">
      <strong>
        <slot>
          How do you feel?
        </slot>
      </strong>
    </label>
    <textarea
      :name="name"
      :id="name"
      rows="10"
      ref="textarea"
      placeholder="I feel quite +happy today, my #friends are amazing <3"
      @input="text = $event.target.value"
      :value="value"></textarea>
    <input class="right floated" type="submit">
  </form>
</template>

<script>

export default {
  props: {
    value: {type: String, default: ''},
    showDelete: {type: Boolean, default: false},
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

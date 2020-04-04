<template>
  <form @submit.prevent="submit">
    <label :for="name">
      <strong>
        <slot>
          How do you feel?
        </slot>
      </strong>
    </label>
    <textarea
      :name="name"
      required
      :id="name"
      rows="10"
      placeholder="I feel quite +happy today, my #friends are amazing <3"
      @input="text = $event.target.value"
      :value="value"></textarea>
    <button class="left floated link" @click.stop.prevent="$emit('delete')" v-if="showDelete">Delete</button>
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
      this.$emit('input', this.text)
      this.text = ''
    }
  }
}
</script>

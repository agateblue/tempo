<template>

  <v-dialog v-model="show" fullscreen hide-overlay transition="dialog-bottom-transition">
    <entry-form
      v-bind="entryFormProps"
      @update:show="$emit('update:show', $event)"
      @submitted="show = false; $emit('submitted', $event)"
    >
      </entry-form>
  </v-dialog>
</template>

<script>
import EntryForm from '@/components/EntryForm'
export default {
  props: {
    show: {type: Boolean, default: false},
    entryFormProps: {type: Object, default: () => {return {}}}
  },
  components: {
    EntryForm
  },
}
</script>

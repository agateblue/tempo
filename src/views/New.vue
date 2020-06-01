<template>
  <div>
    <section>
      <h2>
        <label for="how">What's going on?</label>
      </h2>
      <entry-form @created="entries = [$event, ...entries]" />
    </section>
    <section v-if="entries.length">
      <h2>Latest entries</h2>
      <timeline
        :entries="entries"
        @delete="handleDelete"></timeline>
    </section>
  </div>
</template>

<script>
import EntryForm from '@/components/EntryForm.vue'
import Timeline from '@/components/Timeline.vue'

export default {
  components: {
    EntryForm,
    Timeline,
  },
  data () {
    return {
      entries: [],
    }
  },
  methods: {
    async handleDelete (entry) {
      this.entries = this.entries.filter((e) => {
        return e._id != entry._id
      })
    },
  }
}
</script>

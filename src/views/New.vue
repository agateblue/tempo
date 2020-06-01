<template>
  <div>
    <section>
      <h2>
        <label for="how">What's going on?</label>
      </h2>
      <entry-form @created="entries.push($event)" />
    </section>
    <section v-if="entries.length">
      <h2>Latest entries</h2>
      <entry
        v-for="entry in entries"
        :entry="entry" :key="entry._id"
        @delete="handleDelete"></entry>
    </section>
  </div>
</template>

<script>
import EntryForm from '@/components/EntryForm.vue'
import Entry from '@/components/Entry.vue'

export default {
  components: {
    EntryForm,
    Entry,
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

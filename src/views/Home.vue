<template>
  <main>
    <aside>
      <entry-form @added="entries.unshift($event)" />
    </aside>
    <section>
      <h1>Latest entries</h1>
      <entry v-for="entry in entries" :entry="entry" :key="entry._id"></entry>
    </section>
  </main>
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
      entries: []
    }
  }
}
</script>

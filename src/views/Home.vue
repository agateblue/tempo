<template>
  <main>
    <aside>
      <entry-form @input="addNew" />
    </aside>
    <section>
      <h1>Latest entries</h1>
      <entry v-for="entry in entries" :entry="entry" :key="entry._id" @delete="handleDelete"></entry>
    </section>
  </main>
</template>

<script>
import EntryForm from '@/components/EntryForm.vue'
import Entry from '@/components/Entry.vue'

import {getNewEntryData} from '@/utils'

export default {
  components: {
    EntryForm,
    Entry,
  },
  data () {
    return {
      entries: []
    }
  },
  async created () {
    this.entries = await this.getEntries()
  },
  methods: {
    async addNew (text) {
      let data = {
        ...getNewEntryData(text),
        date: (new Date ()).toISOString(),
      }
      data._id = data.date
      let result = await this.$store.dispatch('addEntry', data)
      this.entries.unshift(result)
    },
    async getEntries () {
      let result = await this.$store.state.db.find({
        selector: {
          type: 'entry',
        }
      })
      return result.docs
    },
    async handleDelete (entry) {
      await this.$store.state.db.remove(entry)
      this.entries = this.entries.filter((e) => {
        return e._id != entry._id
      })

    }
  }
}
</script>

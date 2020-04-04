<template>
  <article>
    <entry-form
      v-if="editing"
      :show-delete="true"
      @input="update"
      @delete="$emit('delete', currentEntry)"
      :value="currentEntry.text"
      :name="`how-${currentEntry._id}`">
      Edit Entry
    </entry-form>
    <VueShowdown v-else :vue-template="true" class="content" :markdown="prerenderedText" />
    <footer>
      <div>
        <button class="link" @click.prevent="editing = !editing">
          <template v-if="editing">Cancel</template>
          <template v-else>Edit</template>
        </button>
      </div>
      <div>
        <time :datetime="currentEntry.date" :title="currentEntry.date">{{ prettyDate }}</time>
      </div>
    </footer>
  </article>
</template>
<script>
import {insertTagMarkup, getNewEntryData} from '@/utils'
import EntryForm from '@/components/EntryForm.vue'

export default {
  props: {
    entry: Object
  },
  components: {
    EntryForm
  },
  data () {
    return {
      editing: false,
      currentEntry: this.entry,
    }
  },
  computed: {
    prettyDate () {
      let d = new Date(this.currentEntry.date)
      return d.toLocaleString()
    },
    prerenderedText () {
      // we need to insert some markup so that tags render with a link
      return insertTagMarkup(this.currentEntry.text)
    }
  },
  methods: {
    async update (text) {
      let data = {
        ...getNewEntryData(text),
        _rev: this.currentEntry._rev,
        _id: this.currentEntry._id,
      }
      this.currentEntry = await this.$store.dispatch('updateEntry', data)
      this.editing = false
    }
  }
}
</script>

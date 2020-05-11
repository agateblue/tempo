<template>
  <article>
    <template v-if="editing">
      <h3>
        <button class="right floated link" @click.stop.prevent="$emit('delete', currentEntry)">Delete</button>
        <label :for="`how-${currentEntry._id}`">Edit Entry</label>
      </h3>
      <entry-form
        v-if="editing"
        :show-delete="true"
        :entry="currentEntry"
        @updated="update"
        :name="`how-${currentEntry._id}`">
      </entry-form>

    </template>
    <VueShowdown class="entry-content" v-else :vue-template="true" :options="{simpleLineBreaks: true, headerLevelStart: 3, simplifiedAutoLink: true, tasklists:true, emoji: true}" :markdown="prerenderedText" />
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
import {insertTagMarkup, quoteFrontMatter} from '@/utils'
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
      return insertTagMarkup(quoteFrontMatter(this.currentEntry.text))
    }
  },
  methods: {
    async update (e) {
      this.currentEntry = e
      this.editing = false
      this.$emit('updated', e)
    }
  }
}
</script>

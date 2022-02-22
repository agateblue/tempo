<template>
  <v-card>
    <v-card-text :class="$theme.card.textSize">
      <v-badge
        style="display: block !important"
        :color="row.color"
        dot
      >
        <div class="rendered-markdown text-body-1" v-html="expand ? row.text : truncatedText"></div>
      </v-badge>
      <div v-if="isTruncated">
        <v-btn small class="mt-4"
          @click="expand = !expand"
        >
          <template v-if="expand">
            Collapse <v-icon>{{ $icons.mdiChevronUp }}</v-icon>
          </template>
          <template v-else>
            Expand <v-icon>{{ $icons.mdiChevronDown }}</v-icon>
          </template>
        </v-btn>
      </div>
    </v-card-text>

    <v-lazy
      :options="{
        threshold: .5
      }"
      min-height="50"
      transition="fade-transition"
    >
      <v-card-actions>
        <time class="font-weight-thin" :date="row.entry.fullDate.toISOString()" :title="row.entry.fullDate.toISOString()">{{ row.time }}</time>
        <v-spacer></v-spacer>
        <v-btn
          text
          x-small
          @click="showEntryModal = true"
        >
          <v-icon left>{{ $icons.mdiPencil}}</v-icon> Edit
        </v-btn>
        <v-menu  bottom left>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              v-on="on"
            >
              <v-icon>{{ $icons.mdiDotsHorizontal}}</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="showDuplicateModal = true">
              <v-list-item-icon>
                <v-icon>{{ $icons.mdiPlusCircleMultipleOutline }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Copy</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="$store.dispatch('newShortcut', row.entry.text)">
              <v-list-item-icon>
                <v-icon>{{ $icons.mdiPlusCircleMultipleOutline }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Save as shortcut</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="deleteDialog = true">
              <v-list-item-icon>
                <v-icon>{{ $icons.mdiDelete }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
        <entry-modal
          :show.sync="showEntryModal"
          :entry="row.rawEntry"
          @updated="update"
          :name="`how-${row.rawEntry._id}`">
        </entry-modal>
        <entry-modal
          :show.sync="showDuplicateModal"
          :initial-text="row.rawEntry.text"
          :name="`how-${row.rawEntry._id}-dup`">
        </entry-modal>

        <v-dialog

          v-model="deleteDialog"
          max-width="400"
        >
          <v-card :color="$theme.card.color">
            <v-card-title class="headline">Delete this entry?</v-card-title>

            <v-card-text>
              This action is irreversible.
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn
                color="secondary"
                text
                @click="deleteDialog = false"
              >
                Cancel
              </v-btn>

              <v-btn
                color="primary"
                text
                @click="deleteDialog = false;handleDelete()"
              >
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-actions>
    </v-lazy>
  </v-card>
</template>
<script>
import EntryModal from '@/components/EntryModal.vue'
import truncate from 'truncate-html'
truncate.setup({byWords: true, length: 30, keepWhitespaces: true })

export default {
  props: {
    row: Object
  },
  components: {
    EntryModal
  },
  data () {
    return {
      deleteDialog: false,
      showEntryModal: false,
      showDuplicateModal: false,
      currentEntry: this.row.rawEntry,
      expand: false,
    }
  },
  computed: {
    truncatedText () {
      return truncate(this.row.text)
    },
    isTruncated () {
      return this.truncatedText.length < this.row.text.length
    },

  },
  methods: {
    async update (e) {
      this.currentEntry = e
      this.$emit('updated', e)
    },
    async handleDelete () {
      await this.$store.state.db.remove(this.row.rawEntry)
      this.$emit('delete', this.row.rawEntry)
      await this.$store.dispatch('triggerWebhook')
    },
  }
}
</script>

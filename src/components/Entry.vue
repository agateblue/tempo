<template>
  <v-card>
    <v-card-text :class="$theme.card.textSize" v-if="!isEditing">
      <v-badge
        style="display: block !important"
        :color="row.color"
        dot
      >
        <div
          class="rendered-markdown grey--text text--lighten-2"
          v-html="expand ? row.text : truncatedText"></div>
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
    <v-card-text v-else>
      <entry-form
        textarea-label="Update entry"
        :entry="row.entry"
        :initial-text="row.entry.text"
        color="transparent"
        :key="`timeline-${$store.state.lastSync}`"
        ref="entryForm"
        @submitted="update"
        @cancel="isEditing = false"
      />
    </v-card-text>
    <v-lazy
      :options="{
        threshold: .5
      }"
      min-height="50"
      transition="fade-transition"
    >
      <v-card-actions>
        <time
          class="text-body-2 grey--text text--darken-1"
          :date="row.entry.fullDate.toISOString()"
          :title="row.entry.fullDate.toISOString()">
            <v-icon small color="grey darken-2">{{ $icons.mdiClockOutline}}</v-icon>
            {{ row.time }}
          </time>
        <v-spacer></v-spacer>
        <v-btn
          icon
          small
          class="px-1"
          color="grey darken-2"
          @click="isEditing = !isEditing"
          title="Edit"
        >
          <v-icon left>{{ $icons.mdiPencil}}</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          class="px-1"
          color="grey darken-2"
          @click="copyToClipboard(row.entry.text)"
          title="Copy to clipboard"
        >
          <v-icon left>{{ $icons.mdiContentCopy}}</v-icon>
        </v-btn>
        <v-btn
          icon
          small
          class="px-1"
          color="grey darken-2"
          @click="deleteDialog = true"
          title="Delete"
        >
          <v-icon left>{{ $icons.mdiDelete}}</v-icon>
        </v-btn>

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
import EntryForm from '@/components/EntryForm.vue'
import truncate from 'truncate-html'
truncate.setup({byWords: true, length: 60, keepWhitespaces: true })

export default {
  props: {
    row: Object
  },
  components: {
    EntryForm
  },
  data () {
    return {
      deleteDialog: false,
      isEditing: false,
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
    async copyToClipboard (text) {
      await navigator.clipboard.writeText(text)
    },
    async update (e) {
      this.currentEntry = e
      this.$emit('updated', e)
    },
    async handleDelete () {
      await this.$store.state.db.remove(this.row.rawEntry)
      this.$emit('deleted', this.row.rawEntry)
      await this.$store.dispatch('triggerWebhook')
    },
  }
}
</script>

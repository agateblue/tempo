<template>
  <div>
    <v-card-text :class="$theme.card.textSize" v-if="!isEditing">
      <v-badge
        style="display: block !important"
        :color="row.color"
        dot
        transition="fade"
      >
        <h3
          v-if="row.entry.form && $store.getters.formsById[row.entry.form]"
        >
          <v-btn
            @click.prevent="$store.commit('searchQuery', `form:${row.entry.form}`)"
            text
            title="Search all entries for this form"
          >
            {{ $store.getters.formsById[row.entry.form].label }}
          </v-btn>
        </h3>
        <structured-data
          class="mb-4"
          v-if="!isEmpty(row.entry.data)"
          :data="row.entry.data"
          :fields="$store.getters.fieldsById"
        />
        <div
          class="rendered-markdown grey--text text--lighten-2"
          v-html="expand ? row.text : truncatedText"></div>
      </v-badge>
      <div v-if="isTruncated">
        <v-btn small class="mt-4"
          @click="expand = !expand"
        >
          <template v-if="expand">
            Collapse <v-icon transition="fade" :icon="$icons.mdiChevronUp"></v-icon>
          </template>
          <template v-else>
            Expand <v-icon transition="fade" :icon="$icons.mdiChevronDown"></v-icon>
          </template>
        </v-btn>
      </div>
    </v-card-text>
    <v-card-text v-else>
      <entry-form
        textarea-label="Update entry"
        :entry="row.entry"
        :initial-text="row.entry.text"
        :key="`timeline-${$store.state.lastSync}`"
        ref="entryForm"
        @submitted="update"
        @cancel="isEditing = false"
      />
    </v-card-text>

    <v-card-actions>
      <time
        class="text-body-2 grey--text text--darken-1"
        :date="row.entry.fullDate.toISOString()"
        :title="row.entry.fullDate.toISOString()">
          <v-icon transition="fade" small color="grey darken-2">{{ $icons.mdiClockOutline}}</v-icon>
          {{ row.time }}
        </time>
      <v-spacer></v-spacer>
      <v-btn
        v-if="row.entry.thread && $route.params.entryId != getShortEntryId(row.entry.thread)"
        small
        class="px-1"
        color="grey"
        title="View thread"
        plain
        transition="fade"
        :to="{name: 'Entry', params: {entryId: getShortEntryId(threadId)}}"
      >
        View thread
      </v-btn>
      <v-btn
        v-if="(row.entry.replies || []).length > 0 && $route.params.entryId != getShortEntryId(row.entry._id)"
        small
        class="px-1"
        color="grey"
        title="View thread"
        plain
        transition="fade"
        :to="{name: 'Entry', params: {entryId: getShortEntryId(threadId)}}"
      >
        <template v-if="row.entry.replies === 1">
          View {{ row.entry.replies.length }} reply
        </template>
        <template v-else>
          View {{ row.entry.replies.length }} replies
        </template>
      </v-btn>
      <v-btn
        v-if="$route.params.entryId != getShortEntryId(row.entry._id)"
        icon
        small
        class="px-1"
        color="grey"
        title="Detail page"
        plain
        transition="fade"
        :to="{name: 'Entry', params: {entryId: getShortEntryId(row.entry._id)}}"
      >
        <v-icon transition="fade">{{ $icons.mdiEye}}</v-icon>
      </v-btn>
      <v-btn
        icon
        small
        class="px-1"
        :color="isReplying ? 'light-blue darken-2' : 'grey darken-2'"
        @click="isReplying = !isReplying"
        title="Reply"
        transition="fade"
      >
        <v-icon transition="fade" left>{{ $icons.mdiReply}}</v-icon>
      </v-btn>
      <v-btn
        icon
        small
        class="px-1"
        :color="row.entry.favorite ? 'pink darken-2' : 'grey darken-2'"
        @click="setFavorite(!row.entry.favorite)"
        title="Set favorite"
        transition="fade"
      >
        <v-icon transition="fade" left v-if="row.entry.favorite">{{ $icons.mdiHeart }}</v-icon>
        <v-icon transition="fade" left v-else>{{ $icons.mdiHeartOutline }}</v-icon>
      </v-btn>
      <v-btn
        icon
        small
        class="px-1"
        color="grey darken-2"
        @click="copyToClipboard(row.entry.text)"
        title="Copy to clipboard"
      >
        <v-icon transition="fade" left>{{ $icons.mdiContentCopy}}</v-icon>
      </v-btn>
      <v-btn
        icon
        small
        class="px-1"
        color="grey darken-2"
        @click="isEditing = !isEditing"
        title="Edit"
        transition="fade"
      >
        <v-icon transition="fade" left>{{ $icons.mdiPencil}}</v-icon>
      </v-btn>
      <v-btn
        icon
        small
        class="px-1"
        color="grey darken-2"
        @click="deleteDialog = true"
        title="Delete"
        transition="fade"
      >
        <v-icon transition="fade" left>{{ $icons.mdiDelete}}</v-icon>
      </v-btn>

      <v-dialog

        v-model="deleteDialog"
        max-width="400"
      >
        <v-card :color="$theme.card.color">
          <v-card-title class="headline">Delete this entry?</v-card-title>
          <v-card-text v-if="row.entry.thread || (row.entry.replies && row.entry.replies.length > 0)">
            <v-checkbox
              hide-details
              v-if="row.entry.thread"
              v-model="deleteAllThread"
              :label="`Delete other entries from this thread`"
              :ripple="false"
            ></v-checkbox>
            <v-checkbox
              hide-details
              v-else
              v-model="deleteAllThread"
              :label="`Delete ${row.entry.replies.length} other entries from this thread`"
              :ripple="false"
            ></v-checkbox>
          </v-card-text>
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
    <v-card-text v-if="isReplying">
      <entry-form
        textarea-label="Reply"
        :thread="threadId"
        color="transparent"
        :key="`timeline-entry-form-thread-${threadId}`"
        ref="entryFormReply"
        @submitted="replied"
        @cancel="isReplying = false"
      />
    </v-card-text>
  </div>
</template>
<script>
import isEmpty from 'lodash/isEmpty'
import truncate from 'lodash/truncate'

import EntryForm from '@/components/EntryForm.vue'
import StructuredData from '@/components/StructuredData.vue'
import {getShortEntryId} from '@/utils'

export default {
  props: {
    row: Object
  },
  components: {
    EntryForm,
    StructuredData
  },
  data () {
    return {
      isEmpty,
      deleteDialog: false,
      deleteAllThread: false,
      isEditing: false,
      isReplying: false,
      currentEntry: this.row.rawEntry,
      expand: false,
      getShortEntryId,
    }
  },
  computed: {
    truncatedText () {
      return truncate(this.row.text, {length: 320, separator: ' '})
    },
    isTruncated () {
      return this.truncatedText.length < this.row.text.length
    },
    threadId () {
      return this.row.rawEntry.thread || this.row.rawEntry._id
    }

  },
  methods: {
    async copyToClipboard (text) {
      await navigator.clipboard.writeText(text)
    },
    async update (e) {
      this.$emit('updated', e)
      this.currentEntry = e
      this.isReplying = false
    },
    async replied (e) {
      this.$emit('replied', e)
      this.isReplying = false
    },
    async setFavorite (value) {
      let e = await this.$store.dispatch('partialUpdateEntry', {entry: this.row.entry, values: {favorite: value}})
      this.$emit('updated', e)
    },
    async handleDelete () {
      let entryId = this.row.rawEntry._id
      let threadId = this.row.rawEntry.thread
      if (this.deleteAllThread) {
        let deleted = await this.$store.dispatch('deleteThread', threadId || entryId)
        for (const d of deleted) {
          this.$emit('deleted', d)
        }
      }
      this.$emit('deleted', this.row.rawEntry)
      await this.$store.state.db.remove(this.row.rawEntry)
      await this.$store.dispatch('rebuildThread', threadId)
      await this.$store.dispatch('forceSync', {updateLastSync: false})
      await this.$store.dispatch('triggerWebhook')
    },
  }
}
</script>

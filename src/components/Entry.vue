<template>
  <v-row justify="space-between" vertical-align: to>
    <v-col cols="10">
      <time class="block font-weight-thin body-1 mb-2" :date="row.entry.fullDate.toISOString()" :title="row.entry.fullDate.toISOString()">{{ row.time }}</time>
      <div v-html="expand ? row.text : truncatedText"></div>
      <template v-if="isTruncated">
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
      </template>
    </v-col>
    <v-col class="text-right" cols="2">
      <v-menu bottom left>
        <template v-slot:activator="{ on }">
          <v-btn
            dark
            icon
            v-on="on"
          >
            <v-icon>{{ $icons.mdiDotsVertical}}</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click.stop="editDialog = true">
            <v-list-item-icon>
              <v-icon>{{ $icons.mdiPencil }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click.stop="deleteDialog = true">
            <v-list-item-icon>
              <v-icon>{{ $icons.mdiDelete }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>

    </v-col>


    <v-dialog
      v-model="editDialog"
      max-width="800"
    >
      <v-card>
        <v-card-title class="headline">Update entry</v-card-title>

        <v-card-text>
          <entry-form
            ref="updateForm"
            :entry="row.rawEntry"
            @updated="update"
            :name="`how-${row.rawEntry._id}`">
          </entry-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="secondary"
            text
            @click="editDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            text
            @click="editDialog = false;$refs.updateForm.submit()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="deleteDialog"
      max-width="400"
    >
      <v-card>
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
  </v-row>
</template>
<script>
import EntryForm from '@/components/EntryForm.vue'
import truncate from 'truncate-html'
truncate.setup({byWords: true, length: 30, keepWhitespaces: true })

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
      editDialog: false,
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
    },
  }
}
</script>

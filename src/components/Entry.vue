<template>
  <v-row justify="space-between">
    <v-col cols="7" v-html="row.text"></v-col>
    <v-col class="text-right" cols="4" v-text="row.time"></v-col>
    <v-col class="text-right" cols="1">
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
          <v-list-item>
            <v-list-item-title>Edit</v-list-item-title>
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
  <!-- <article>
    <template v-if="editing">
      <h3>
        <button class="right floated link" @click.stop.prevent="handleDelete(currentEntry)">Delete</button>
        <label :for="`how-${row._id}`">Edit Entry</label>
      </h3> -->
      <!-- <entry-form
        v-if="editing"
        :show-delete="true"
        :entry="currentEntry"
        @updated="update"
        :name="`how-${row._id}`">
      </entry-form> -->

    <!-- </template> -->
    <!-- <VueShowdown class="entry-content" v-else :vue-template="true" :options="{simpleLineBreaks: true, headerLevelStart: 3, simplifiedAutoLink: true, tasklists:true, emoji: true}" :markdown="prerenderedText" /> -->
    <!-- <footer>
      <div>
        <button class="link" @click.prevent="editing = !editing">
          <template v-if="editing">Cancel</template>
          <template v-else>Edit</template>
        </button>
      </div>
      <div>
        <time :datetime="row.date" :title="row.date">{{ prettyDate }}</time>
      </div>
    </footer>
  </article> -->
</template>
<script>
// import EntryForm from '@/components/EntryForm.vue'

export default {
  props: {
    row: Object
  },
  components: {
    // EntryForm
  },
  data () {
    return {
      deleteDialog: false,
      editing: false,
      currentEntry: this.row.entry,
    }
  },
  computed: {
    prettyDate () {
      let d = new Date(this.row.date)
      return d.toLocaleString()
    },
  },
  methods: {
    async update (e) {
      this.currentEntry = e
      this.editing = false
      this.$emit('updated', e)
    },
    async handleDelete () {
      await this.$store.state.db.remove(this.row.entry)
      this.$emit('delete', this.row.entry)
    },
  }
}
</script>

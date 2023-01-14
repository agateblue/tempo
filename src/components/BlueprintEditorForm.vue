<template>
  <v-form @submit.prevent="save">
    <v-alert
      v-if="isBuiltin"
      outlined
      type="warning"
    >
      This is a built-in blueprint, you cannot edit it.
    </v-alert>
    <yaml-editor v-model="localBlueprint" :schema="schema" />
    <v-btn
      class="mt-4"
      type="submit"
      color="primary"
      :disabled="isBuiltin"
    >Save</v-btn>
    <v-btn
      v-if="deletable"
      class="mt-4 float-right"
      color="error"
      @click="deleteDialog = true"
    >Delete</v-btn>

    <v-dialog
      v-if="deletable"
      v-model="deleteDialog"
      max-width="400"
    >
      <v-card :color="$theme.card.color">
        <v-card-title class="headline">Delete this blueprint?</v-card-title>
        <v-card-text>
          <p>
            Diary entries related to this blueprint will be kept, but related forms and visualizations won't be available anymore.
          </p>
          <p>
            This action is irreversible.
          </p>
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
  </v-form>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'
import YamlEditor from '@/components/YamlEditor'
import {trackEvent} from '@/utils'
const blueprintSchema = require('@/schemas/blueprint.json')

export default {
  props: {
    value: {},
    deletable: {default: false}
  },
  components: {
    YamlEditor,
  },
  data () {
    return {
      deleteDialog: false,
      schema: blueprintSchema,
      localBlueprint: cloneDeep(this.value),   
    }
  },
  computed: {
    isBuiltin () {
      return this.localBlueprint.id.startsWith("builtin:")
    }
  },
  methods: {
    async getBlueprintFromDb () {
      let result = await this.$store.state.db.find({
        selector: {
          type: 'blueprint',
          _id: this.localBlueprint.id
        },
        limit: 1,
      })
      return result.docs[0]
    },
    async save () {
      if (this.localBlueprint.id.startsWith("builtin:")) {
        console.log("Cannot update / create a builtin blueprint")
        return
      }
      // try to find existing blueprint with id
      let existing = await this.getBlueprintFromDb()
      let doc = {
        _id: this.localBlueprint.id,
        type: 'blueprint',
        definition: this.localBlueprint
      }
      if (existing) {
        doc._rev = existing._rev
        trackEvent(this.$store, "blueprint.updated")
      } else {
        trackEvent(this.$store, "blueprint.created")
      }
      await this.$store.state.db.put(doc)
      await this.$store.dispatch('loadBlueprints')
      this.$store.dispatch('forceSync', {updateLastSync: false})
    },
    async handleDelete () {
      let existing = await this.getBlueprintFromDb()
      if (existing) {
        await this.$store.state.db.remove(existing)
      }
      trackEvent(this.$store, "blueprint.deleted")

      await this.$store.dispatch('loadBlueprints')
      this.$router.push('/settings')
    }
  },
  watch: {
    localBlueprint: {
      deep: true,
      handler (v) {
        this.$emit('input', v)
      }
    }
  }
}
</script>
<template>
  <v-form @submit.prevent="$store.dispatch('taskLists', lists)">
    <h2 class="mb-4">Lists</h2>
    <p>Add one or more lists to your board, or use the defaults to get started.</p>
    <v-row v-for="(list, idx) in lists" :key="idx">
      <v-col>
        <v-text-field
          v-model="list.label"
          :label="`List #${idx + 1}`"
          :ref="`list${idx}`"
          :append-outer-icon="$icons.mdiDelete"
          @click:append-outer="
            lists.splice(idx, 1)
          "
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          :value="'Done'"
          :disabled="true"
          :label="`List #${lists.length + 1}`"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          block
          color="secondary"
          @click.prevent="addNew"
        >
          Add another list
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
          block
          color="primary"
          type="submit"
        >
          <template v-if="$store.state.taskLists">
            Update board
          </template>
          <template v-else>
            Create board
          </template>
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>

export default {
  data () {
    return {
      lists: this.$store.state.taskLists || [
        {label: "To-do"},
        {label: "Doing"},
      ]
    }
  },
  methods: {
    addNew () {
      this.lists.push({label: 'My list'})
      this.$nextTick(() => {
        let idx = this.lists.length - 1
        let field = this.$refs[`list${idx}`][0]
        field.focus()
      })
    }
  }
}
</script>

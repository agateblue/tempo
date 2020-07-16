<template>
  <v-form @submit.prevent="submit">
    <v-btn
      color="secondary"
      class="mb-4"
      v-if="$store.state.boardConfig"
      @click.prevent="$emit('updated')"
    >
      Cancel
    </v-btn>
    <h2 class="mb-4">Lists</h2>
    <p>Add one or more lists to your board, or use the defaults.</p>
    <v-row v-for="(list, idx) in lists" :key="`l${idx}`">
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
    <v-btn
      color="secondary"
      @click.prevent="addNewList"
    >
      Add another list
    </v-btn>
    <v-divider class="my-4"></v-divider>
    <h2 class="mb-4">Categories</h2>
    <p>Add one or more categories to quickly filter tasks, or use the defaults.</p>
    <v-row v-for="(category, idx) in categories" :key="`c${idx}`">
      <v-col>
        <v-text-field
          v-model="category.label"
          label="Category"
          :ref="`category${idx}`"
          :append-outer-icon="$icons.mdiDelete"
          @click:append-outer="
            categories.splice(idx, 1)
          "
        ></v-text-field>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col>
        <v-btn
          block
          color="secondary"
          @click.prevent="addNewCategory"
        >Add another category</v-btn>
      </v-col>
      <v-col>
        <v-btn
          block
          color="primary"
          type="submit"
        >
          <template v-if="$store.state.boardConfig && $store.state.boardConfig.lists">
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
    let boardConfig = this.$store.state.boardConfig || {}
    return {
      lists: boardConfig.lists || [
        {label: "To-do"},
        {label: "Doing"},
      ],
      categories: boardConfig.categories || [
        {label: "Personal"},
        {label: "Work"},
        {label: "House-keeping"},
      ]
    }
  },
  methods: {
    addNewList () {
      this.lists.push({label: 'My list'})
      this.$nextTick(() => {
        let idx = this.lists.length - 1
        let field = this.$refs[`list${idx}`][0]
        field.focus()
      })
    },
    addNewCategory () {
      this.categories.push({label: 'My category'})
      this.$nextTick(() => {
        let idx = this.categories.length - 1
        let field = this.$refs[`category${idx}`][0]
        field.focus()
      })
    },
    async submit() {
      await this.$store.dispatch('boardConfig', {lists: this.lists, categories: this.categories})
      this.$emit('updated')
    }
  }
}
</script>

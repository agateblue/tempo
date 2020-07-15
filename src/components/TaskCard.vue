<template>
  <v-card
    :color="$theme.nestedCard.color"
    class="mb-5">
    <v-btn
      icon
      small
      class="float-right mx-2 my-3"
      @click="expanded = !expanded"
    >
      <v-icon>{{ expanded ? $icons.mdiChevronUp : $icons.mdiChevronDown }}</v-icon>
    </v-btn>
    <v-card-text :class="[$theme.nestedCard.textSize]">{{ task.text }}</v-card-text>
    <v-card-text class="pt-0" v-if="category">
      <v-chip
        class="px-2"
        x-small
        :color="category.color[0]"
        :text-color="category.color[1]"
      >
        {{ category.label }}
      </v-chip>
    </v-card-text>
    <template v-if="expanded">
      <v-divider></v-divider>
      <v-card-text>
        <v-text-field label="Text" v-model="newText">
        </v-text-field>
        <v-select
          v-model="newCategory"
          :items="$store.getters['taskCategoryChoices']"
          label="Category"
        ></v-select>
        <v-btn small text color="red" @click.prevent="deleteTask">
         <v-icon left>{{ $icons.mdiDelete }}</v-icon>
          Delete
        </v-btn>
      </v-card-text>
    </template>
  </v-card>
</template>

<script>
const COLOR_CHOICES = [
  ["green", "white"],
  ["blue", "white"],
  ["teal", "white"],
  ["pink", "white"],
  ["purple", "white"],
  ["indigo", "white"],
  ["deep-orange", "white"],
  ["black", "white"],
]
export default {
  props: ['task'],
  data () {
    return {
      expanded: false,
      newText: this.task.text,
      newCategory: this.task.category,
    }
  },
  computed: {
    category () {
      if (!this.task.category) {
        return 
      }
      let index = 0
      let colorIndex = null
      this.$store.state.boardConfig.categories.forEach((c) => {
        if (c.label.toLowerCase() == this.task.category.toLowerCase()) {
          colorIndex = index
        }
        index += 1
      })
      let d = {
        label: this.task.category, 
      }
      if (colorIndex != null) {
        d.color = COLOR_CHOICES[colorIndex]
      }
      return d
    }
  },
  methods: {
    deleteTask () {
      this.$store.state.db.remove(this.task)
      this.$emit('deleted')
    }
  }
}
</script>

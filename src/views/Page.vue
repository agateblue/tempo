<template>
  <v-container>
    <v-row class="stackable">
      <v-col cols="12" sm="4">
        <v-card tag="section" :color="$theme.card.color">
          <v-card-title class="headline">Pages</v-card-title>
          <v-card-text :class="$theme.card.textSize" class="mb-4">
            <router-link
              v-for="p in $store.getters.pages"
              :key="p.id"
              :to="{path: `/pages/${p.id}`}"
            >

              {{ p.title }}
            </router-link>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="8">
        <v-card tag="section" class="fluid" :color="$theme.card.color">
          <v-card-text class="mb-4">
            <blueprint-page v-if="currentPage" :page="currentPage" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>


</template>

<script>

import BlueprintPage from '@/components/BlueprintPage'

export default {
  props: {
    id: {type: String, default: null},
  },
  components: {
    BlueprintPage
  },
  data () {
    return {}
  },
  created () {
    if (!this.currentPage) {
      let id = this.$store.getters.pages[0].id
      this.$router.push(`/pages/${id}`)
    }
  },
  computed: { 
    currentPage () {
      return this.$store.getters.pagesById[this.id]
    }
  }
}
</script>

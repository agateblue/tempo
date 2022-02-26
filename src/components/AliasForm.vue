<template>
  <v-form @submit.prevent="submit">
    <v-row>
      <v-col
        cols="12"
        sm="3"
      >
        <v-text-field
          label="Name"
          placeholder="dreams"
          prefix="$"
          hide-details
          v-model="name"
          required
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <v-text-field
          label="Query"
          placeholder="dreams, nightmares"
          :hint="`${matchingEntries} matching entries.`"
          v-model="query"
          required
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-btn
          class="mt-4"
          text
          type="submit"
        >Save</v-btn>
        <v-btn
          class="mt-4"
          @click.prevent="$store.dispatch('removeAlias', alias._id)"
          v-if="alias"
          text
          icon
          title="Delete"
          type="noop"
        >
          <v-icon>{{ $icons.mdiDeleteOutline }}</v-icon>
          
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>
<script>
import debounce from 'lodash/debounce'

import {search} from '@/utils'

export default {
  props: {
    alias: {required: false},
  },
  data () {
    return {
      query: this.alias ? this.alias.query : '',
      name: this.alias ? this.alias.name : '',
      matchingEntries: 0,
    }
  },
  async created () {
    await this.updateMatchingEntries(this.query)
  },
  computed: {
   aliasConfig () {
      let config = this.alias || {}
      return {...config, ...{
        name: this.name,
        query: this.query,
      }}
    },
  },
  methods: {
    async submit () {
      if (!this.aliasConfig.name || !this.aliasConfig.query) {
        return
      }
      if (this.alias) {
        await this.update()
      } else {
        await this.addNew()
      }
    },
    async addNew () {
      let e = await this.$store.dispatch('addAlias', this.aliasConfig)
      this.$emit('created', e)

    },
    async update () {
      let e = await this.$store.dispatch('updateAlias', this.aliasConfig)
      this.$emit('updated', e)
    },
    async updateMatchingEntries(v) {
      this.matchingEntries = 0
      if (v) {
        let matching = await search({
          store: this.$store,
          sortDesc: false,
          query: this.query
        })
        this.matchingEntries = matching.length
      }
    }
  },
  watch: {
    query: {
      handler: debounce(
        async function (v) {
          await this.updateMatchingEntries(v)
        }, 500
      ),
    }
  }
}
</script>
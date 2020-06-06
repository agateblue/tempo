<template>
  <div>
    <template v-if="tab === 'timeline'">
      <v-container class="narrow" v-if="shownEntries.length < entries.length">
        <v-btn color="secondary" @click.prevent="count += $store.state.pageSize">Show more</v-btn>
      </v-container>
      <timeline
        class="container narrow"
        :entries="shownEntries"
        @updated="handleUpdate"
        @delete="handleDelete"></timeline>
    </template>
    <template v-else-if="tab === 'visualization'">
      <dataviz :entries="entries" :days="graphDays"></dataviz>
    </template>
    <v-btn
      fixed
      dark
      fab
      bottom
      right
      :color="$theme.mainButton.color"
      @click="showEntryModal = true"
    >
      <v-icon>{{ $icons.mdiPencil }}</v-icon>
    </v-btn>
    <entry-modal :show.sync="showEntryModal" @created="handleCreated" />
  </div>
</template>

<script>
import Timeline from '@/components/Timeline.vue'

import EntryModal from '@/components/EntryModal.vue'
import {parseQuery, matchTokens } from '@/utils'

export default {
  props: {
    query: String
  },
  components: {
    Timeline,
    EntryModal,
    Dataviz:  () => import(/* webpackChunkName: "visualization" */ "@/components/Dataviz"),
  },
  data () {
    return {
      showEntryModal: false,
      entries: [],
      entriesCount: 0,
      count: this.$store.state.pageSize,
      sortDesc: true,
      graphDays: 60,
      tab: this.$router.currentRoute.query.tab || 'timeline',
      showAdditionalControls: false,
    }
  },
  async created () {
    this.search()
  },
  mounted () {
    this.$nextTick(() => {
      this.scrollToBottom();
    })
  },
  computed: {

    shownEntries () {
      return this.entries.slice(0, this.count)
    },
  },
  methods: {
    downloadMarkdown () {
      let markdownParts = this.entries.map((e) => {
        return `---
date: ${e.date}
mood: ${e.mood}
event: ${e.event}
data: ${JSON.stringify(e.data || {})}
---

${e.text}

`
      })

      this.downloadFile(markdownParts.join('\n'), 'text/markdown', 'tempo.md')
    },
    downloadJSON () {
      this.downloadFile(JSON.stringify(this.entries), 'application/json', 'tempo.json')
    },
    downloadFile (text, mimetype, name) {
      let f = this.makeFile(text, mimetype)
      var link = document.createElement('a')
      link.setAttribute('download', name)
      link.href = f
      document.body.appendChild(link)

      window.requestAnimationFrame(function () {
        var event = new MouseEvent('click')
        link.dispatchEvent(event)
        document.body.removeChild(link)
      })
    },
    makeFile (text, mimetype) {
      let data = new Blob([text], {type: mimetype})
      let textFile = window.URL.createObjectURL(data)
      return textFile
    },
    async getEntries () {
      let result = await this.$store.state.db.find({
        selector: {
          type: 'entry',
          date: { $gt: 0 }
        },
        sort: [{"date": this.sortDesc ? "desc": 'asc'}]
      })
      return result.docs
    },
    async handleDelete (entry) {
      this.entries = this.entries.filter((e) => {
        return e._id != entry._id
      })
    },
    async handleUpdate (entry) {
      this.entries.forEach((e) => {
        if (e._id === entry._id) {
          Object.assign(e, entry)
        }
      })
    },
    filterEntries (entries, queryTokens) {
      if (queryTokens.length === 0) {
        return entries
      }
      return entries.filter((e) => {
        return matchTokens(e, queryTokens)
      })
    },

    selectTab (value) {
      this.tab = value || 'timeline'
    },

    async search () {

      this.count = this.$store.state.pageSize
      let allEntries = await this.getEntries()
      this.entriesCount = allEntries.length
      this.entries = this.filterEntries(
        allEntries,
        parseQuery(this.query),
      )
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    async handleCreated () {
      this.$router.push({
        path: "/",
        query: {}
      })
      await this.search()
    },
    scrollToBottom () {
      window.scrollTo(0,document.body.scrollHeight)
    }
  },
  watch: {
    async query () {
      await this.search()
    },
    async sortDesc () {
      await this.search()
    },
    "$store.state.lastSync": {
      async handler () {
        await this.search()
      }
    },

    "tab" (v) {
      this.$router.push({
        path: this.$router.currentRoute.path,
        query: {...this.$router.currentRoute.query, tab: v},
      })
      if (v === 'timeline') {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    }
  },
}
</script>

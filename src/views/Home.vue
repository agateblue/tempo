<template>
  <div class="pb-8">
    <div v-if="tab === 'timeline'">
      <v-container class="narrow">
        <entry-form
          textarea-label="Write a new entry"
          :compact="true"
          color="transparent"
          :key="`timeline-${$store.state.lastSync}`"
          @fullscreen="showEntryModal = true"
          @submitted="handleCreated"
        />
      </v-container>
      <timeline
        ref="timeline"
        class="container narrow pt-12"
        :entries="shownEntries"
        :key="`timeline-${$store.state.lastSync}`"
        @updated="handleUpdate"
        @delete="handleDelete"></timeline>
      <v-container class="narrow" v-if="shownEntries.length < entries.length" :key="`container-${$store.state.lastSync}`">
        <v-btn
          v-if="showShowMoreButton"
          color="secondary"
          @click.prevent="showMore"
          v-intersect="{
            handler: showMore,
            options: {
              threshold: 0.5
            }
          }">Show more</v-btn>
      </v-container>
    </div>
    <template v-else-if="tab === 'visualization'">
      <dataviz       
        :entries="queryableEntries"
        :tags="queryableTags"
        :days="graphDays"></dataviz>
      <v-btn
        fixed
        dark
        fab
        bottom
        right
        :color="$theme.mainButton.color"
        @click="showvisualizationModal = true"
      >
        <v-icon>{{ $icons.mdiPlus }}</v-icon>
      </v-btn>
    </template>
    <entry-modal :show.sync="showEntryModal" @submitted="handleCreated" />
    <visualization-modal
      :days="graphDays"
      :entries="queryableEntries"
      :tags="queryableTags"
      :show.sync="showvisualizationModal" />
  </div>
</template>

<script>
import Timeline from '@/components/Timeline.vue'
import debounce from 'lodash/debounce'
import EntryModal from '@/components/EntryModal.vue'
import EntryForm from '@/components/EntryForm.vue'
import VisualizationModal from '@/components/VisualizationModal.vue'
import {parseFullQuery, matchOrTokens, getQueryableEntries, getQueryableTags} from '@/utils'

export default {
  props: {
    query: String
  },
  components: {
    Timeline,
    EntryForm,
    EntryModal,
    VisualizationModal,
    Dataviz:  () => import(/* webpackChunkName: "visualization" */ "@/components/Dataviz"),
  },
  data () {
    return {
      showEntryModal: false,
      showvisualizationModal: false,
      showShowMoreButton: false,
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
  computed: {

    shownEntries () {
      return this.entries.slice(0, this.count)
    },
    queryableEntries () {
      return getQueryableEntries(this.entries, this.graphDays)
    },
    queryableTags () {
      return getQueryableTags(this.queryableEntries)
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
      let options = {
        include_docs: true,
        descending: this.sortDesc,
      }
      let result = await this.$store.state.db.allDocs(options)
      let entries = result.rows.map(r => {
        return r.doc
      })
      entries = entries.filter((e) => {
        return e.type == 'entry'
      })
      return entries
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
        return matchOrTokens(e, queryTokens)
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
        parseFullQuery(this.query),
      )
    },
    async handleCreated () {
      if (this.$router.currentRoute.query.q) {
        this.$router.push({
          path: "/",
          query: {}
        })
      }
      await this.search()
    },
    showMore: debounce(function (data) {
      if (data && !data[0].isIntersecting) {
        return
      }
      this.count += this.$store.state.pageSize
    }, 1000, {leading: true, trailing: false, maxWait: 500})
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
    shownEntries () {
      setTimeout(() => {
        this.showShowMoreButton = true
      }, 1000)
    },
    "tab" (v) {
      this.$router.push({
        path: this.$router.currentRoute.path,
        query: {...this.$router.currentRoute.query, tab: v},
      })
    }
  },
}
</script>

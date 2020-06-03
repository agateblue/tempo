<template>
  <div>
    <v-row>
      <v-col cols="7">
        <template v-if="tab === 'timeline'">
          <v-container class="narrow" v-if="shownEntries.length < entries.length">
            <v-btn color="secondary" @click.prevent="count += $store.state.pageSize">Show more</v-btn>
          </v-container>
          <timeline
            :entries="shownEntries"
            @delete="handleDelete"></timeline>
        </template>
        <template v-else-if="tab === 'visualization'">
          <dataviz :entries="entries"></dataviz>
        </template>
      </v-col>

      <v-col offset="1" cols="2">
        <v-card dense class="fixed-secondary">
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ entries.length }} entries</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item
              v-for="row in [{id: 'timeline', label: 'Timeline', icon: 'mdiFormatListBulleted'}, {id: 'visualization', label: 'Charts', icon: 'mdiChartTimelineVariant'}]"
              :key="row.id"
              @click="selectTab(row.id)"
              :class="[{'v-list-item--active': tab === row.id}]">
              <v-list-item-icon>
                <v-icon>{{ $icons[row.icon] }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ row.label }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <template v-if="tab === 'timeline'">
            <v-divider></v-divider>
            <v-list dense>
              <v-list-item>
                <v-list-item-action>
                  <v-switch v-model="sortDesc" :color="$theme.switch.color"></v-switch>
                </v-list-item-action>
                <v-list-item-title>Newest first</v-list-item-title>
              </v-list-item>
              <v-list-item @click.stop="exportDialog = true">
                <v-list-item-icon>
                  <v-icon>{{ $icons.mdiDownload }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Export...</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-dialog
              v-model="exportDialog"
              max-width="700"
            >
              <v-card>
                <v-card-title class="headline">Export your entries</v-card-title>

                <v-card-text>
                  <p>Export the selected {{ entries.length }} entries. Use JSON format if you want to reimport them in Tempo, or Markdown for a more text-based format that can be opened and read by text editors.</p>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>

                  <v-btn
                    color="secondary"
                    text
                    @click="exportDialog = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn color="primary" @click="downloadMarkdown">Export as Markdown</v-btn>
                  <v-btn color="primary" @click="downloadJSON">Export as JSON</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>

        </v-card>
      </v-col>
    </v-row>
    <v-footer inset padless app>
      <entry-form class="mx-3" @created="handleCreated" />
    </v-footer>
  </div>
</template>

<script>
import Timeline from '@/components/Timeline.vue'

import EntryForm from '@/components/EntryForm.vue'
import {parseQuery, matchTokens, quoteFrontMatter } from '@/utils'

export default {
  props: {
    query: String
  },
  components: {
    Timeline,
    EntryForm,
    Dataviz:  () => import(/* webpackChunkName: "visualization" */ "@/components/Dataviz"),
  },
  data () {
    return {
      entries: [],
      entriesCount: 0,
      count: this.$store.state.pageSize,
      sortDesc: true,
      tab: this.$router.currentRoute.query.tab || 'timeline',
      showAdditionalControls: false,
      exportDialog: false,
    }
  },
  async created () {
    this.search()
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

${quoteFrontMatter(e.text)}

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

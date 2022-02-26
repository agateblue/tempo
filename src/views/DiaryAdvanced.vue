<template>
  <v-container class="narrow">
    <v-card tag="section" class="mb-8" :color="$theme.card.color">
      <v-card-title class="headline">Export your entries</v-card-title>

      <v-card-text>
        <p>Export the selected {{ allEntries.length }} entries. Use JSON format if you want to reimport them in Tempo, or Markdown for a more text-based format that can be opened and read by text editors.</p>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" @click="downloadMarkdown">Export as Markdown</v-btn>
        <v-btn color="primary" @click="downloadJSON">Export as JSON</v-btn>
      </v-card-actions>
    </v-card>
    <v-card :color="$theme.card.color" cm>
      <v-card-title class="headline">Aliases</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <p>
          Aliases let you save and reuse search queries.
          For instance, you could set a <code>$dreams</code> alias in place of a
          <code>dream, dreamed, dreams, nightmare, nightmares</code> query.
        </p>
        <v-form>
          <alias-form
            v-for="alias in $store.state.aliases"
            :key="alias._id"
            :alias="alias"
          />
          <alias-form
            :key="String(lastAliasesUpdate)"
            @created="lastAliasesUpdate = new Date()" />
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import AliasForm from '@/components/AliasForm'

export default {
  props: {
    allEntries: Array
  },
  components: {
    AliasForm
  },
  data () {
    return {
      lastAliasesUpdate: new Date(),
    }
  },
  methods: {
    downloadMarkdown () {
      let markdownParts = this.allEntries.map((e) => {
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
      this.downloadFile(JSON.stringify(this.allEntries), 'application/json', 'tempo.json')
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
  }
}
</script>

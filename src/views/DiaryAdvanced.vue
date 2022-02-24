<template>
  <v-container class="narrow">
    <v-card :color="$theme.card.color">
      <v-card-title class="headline">Export your entries</v-card-title>

      <v-card-text>
        <p>Export the selected {{ allEntries.length }} entries. Use JSON format if you want to reimport them in Tempo, or Markdown for a more text-based format that can be opened and read by text editors.</p>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" @click="downloadMarkdown">Export as Markdown</v-btn>
        <v-btn color="primary" @click="downloadJSON">Export as JSON</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>

export default {
  props: {
    allEntries: Array
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

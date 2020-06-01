<template>
  <v-container style="max-width: 600px;">
    <v-timeline dense clipped>
      <v-slide-x-transition
        group
      >
        <v-timeline-item
          v-for="row in timelineRows"
          :key="row.id"
          class="mb-4"
          :color="row.color"
          small
        >
          <v-row justify="space-between">
            <v-col cols="7" v-html="row.text"></v-col>
            <v-col class="text-right" cols="5" v-text="row.time"></v-col>
          </v-row>
        </v-timeline-item>
      </v-slide-x-transition>

      <v-timeline-item
        class="mb-6"
        hide-dot
      >
        <span>TODAY</span>
      </v-timeline-item>

      <v-timeline-item
        class="mb-4"
        color="grey"
        icon-color="grey lighten-2"
        small
      >
        <v-row justify="space-between">
          <v-col cols="7">This order was archived.</v-col>
          <v-col class="text-right" cols="5">15:26 EDT</v-col>
        </v-row>
      </v-timeline-item>

      <v-timeline-item
        class="mb-4"
        small
      >
        <v-row justify="space-between">
          <v-col cols="7">
            <v-chip
              class="white--text ml-0"
              color="purple"
              label
              small
            >
              APP
            </v-chip>
            Digital Downloads fulfilled 1 item.
          </v-col>
          <v-col class="text-right" cols="5">15:25 EDT</v-col>
        </v-row>
      </v-timeline-item>

      <v-timeline-item
        class="mb-4"
        color="grey"
        small
      >
        <v-row justify="space-between">
          <v-col cols="7">
            Order confirmation email was sent to John Leider (john@vuetifyjs.com).
          </v-col>
          <v-col class="text-right" cols="5">15:25 EDT</v-col>
        </v-row>
      </v-timeline-item>

      <v-timeline-item
        class="mb-4"
        hide-dot
      >
        <v-btn
          class="mx-0"
          color="white"
        >
          Resend Email
        </v-btn>
      </v-timeline-item>

      <v-timeline-item
        class="mb-4"
        color="grey"
        small
      >
        <v-row justify="space-between">
          <v-col cols="7">
            A $15.00 USD payment was processed on PayPal Express Checkout
          </v-col>
          <v-col class="text-right" cols="5">15:25 EDT</v-col>
        </v-row>
      </v-timeline-item>

      <v-timeline-item
        color="grey"
        small
      >
        <v-row justify="space-between">
          <v-col cols="7">
            John Leider placed this order on Online Store (checkout #1937432132572).
          </v-col>
          <v-col class="text-right" cols="5">15:25 EDT</v-col>
        </v-row>
      </v-timeline-item>
    </v-timeline>
  </v-container>
</template>
<script>
import MarkdownIt from 'markdown-it'
import {getCompleteEntry, insertTagMarkup, quoteFrontMatter} from '@/utils'

const RENDERER = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
});
RENDERER.use(require('markdown-it-attrs'))
export default {
  props: ['entries'],
  computed: {
    timelineRows () {
      let rows = []
      this.entries.forEach((e) => {
        let previous = rows[rows.length + 1]
        let entry = getCompleteEntry(e)

        let row = {
          text: RENDERER.render(insertTagMarkup(quoteFrontMatter(entry.text))),
          id: Math.random(),
          color: 'grey',

        }
        let baseColor = " accent-"
        if (entry.mood > 0) {
          row.color = "light-green" + baseColor + Math.min(entry.mood, 4)
        } else if (entry.mood < 0) {
          row.color = "deep-orange" + baseColor + Math.min(Math.abs(entry.mood), 4)
        }
        console.log(previous, row)
        rows.push(row)
      })
      return rows
    }
  }
}
</script>

import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import { VuePlausible } from 'vue-plausible'

// three shaking icons to reduce bundle size
import {
  mdiArrowLeft,
  mdiBook,
  mdiCalendar,
  mdiChartTimelineVariant,
  mdiCheck,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiClock,
  mdiClockOutline,
  mdiClose,
  mdiCog,
  mdiContentCopy,
  mdiDelete,
  mdiDeleteOutline,
  mdiDotsHorizontal,
  mdiDownload,
  mdiEye,
  mdiEyeOff,
  mdiFormatListBulleted,
  mdiHeart,
  mdiHeartOutline,
  mdiHelpCircleOutline,
  mdiMagnify,
  mdiMenuDown,
  mdiPencil,
  mdiPlus,
  mdiReply,
  mdiReplyOutline,
  mdiSend,
  mdiSync,
  mdiTrashCan,
} from '@mdi/js'

const app = createApp({
  extends: App,
  beforeCreate() {
    window.document.getElementById('app-shell').remove()
    this.$store.commit('loadCachedState')
    this.$store.commit('initDb')
    this.$store.dispatch(
      'setupSync',
      {
        url: this.$store.state.couchDbUrl,
        username: this.$store.state.couchDbUsername,
        password: this.$store.state.couchDbPassword,
      }
    )
  }
})
.use(vuetify)
.use(router)
.use(store)


app.config.globalProperties.$icons = {
  mdiArrowLeft,
  mdiBook,
  mdiCalendar,
  mdiChartTimelineVariant,
  mdiCheck,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiClock,
  mdiClockOutline,
  mdiClose,
  mdiCog,
  mdiContentCopy,
  mdiDelete,
  mdiDeleteOutline,
  mdiDotsHorizontal,
  mdiDownload,
  mdiEye,
  mdiEyeOff,
  mdiFormatListBulleted,
  mdiHeart,
  mdiHeartOutline,
  mdiHelpCircleOutline,
  mdiMagnify,
  mdiMenuDown,
  mdiPencil,
  mdiPlus,
  mdiReply,
  mdiReplyOutline,
  mdiSend,
  mdiSync,
  mdiTrashCan,
}

app.config.globalProperties.$theme = {
  appBar: {
    color: "pink darken-4",
  },
  card: {
    color: "grey darken-4",
    textSize: "body-1",
  },
  nestedCard: {
    color: "blue-grey darken-4",
    textSize: "body-2",
  },
  drawer: {
    color: "grey darken-4",
  },
  menu: {
    color: "grey darken-4",
  },
  switch: {
    color: "pink",
  },
  input: {
    color: "grey darken-4",
  },
  mainButton: {
    color: "pink darken-4",
  },
}

if (process.env.VUE_APP_PLAUSIBLE_HOST) {
  let options = {
    apiHost: process.env.VUE_APP_PLAUSIBLE_HOST,
    hashMode: true,
    enableAutoPageviews: false,
    trackLocalhost: process.env.VUE_APP_PLAUSIBLE_TRACK_LOCALHOST == "true" ? true : false,
  }
  if (process.env.VUE_APP_DOMAIN) {
    options.domain = process.env.VUE_APP_DOMAIN
    app.use(VuePlausible, options)
  }
}

export default app

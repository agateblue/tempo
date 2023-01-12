import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
// import { VuePlausible } from 'vue-plausible'

import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

if (process.env.VUE_APP_PLAUSIBLE_HOST) {
  let options = {
    apiHost: process.env.VUE_APP_PLAUSIBLE_HOST,
    hashMode: true,
    enableAutoPageviews: false,
    trackLocalhost: process.env.VUE_APP_PLAUSIBLE_TRACK_LOCALHOST == "true" ? true : false,
  }
  if (process.env.VUE_APP_DOMAIN) {
    options.domain = process.env.VUE_APP_DOMAIN
  }
  // Vue.use(VuePlausible, options)
}
const app = createApp({
  extends: App,
  components,
  directives,
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
app.use(vuetify)
app.use(router)
app.use(store)


// Vue.config.productionTip = false


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

app.mount('#app')

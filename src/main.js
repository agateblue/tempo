import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

// three shaking icons to reduce bundle size
import {
  mdiCalendar,
  mdiClock,
  mdiCog,
  mdiChartTimelineVariant,
  mdiHome,
  mdiFormatListBulleted,
  mdiDownload,
  mdiSync,
  mdiPencil,
  mdiMagnify,
  mdiEye,
  mdiEyeOff,
  mdiDotsHorizontal,
  mdiDelete,
  mdiSend,
  mdiChevronUp,
  mdiChevronDown,
  mdiHelpCircleOutline,
} from '@mdi/js'

Vue.prototype.$icons = {
  mdiCalendar,
  mdiClock,
  mdiCog,
  mdiChartTimelineVariant,
  mdiHome,
  mdiFormatListBulleted,
  mdiDownload,
  mdiSync,
  mdiPencil,
  mdiMagnify,
  mdiEye,
  mdiEyeOff,
  mdiDotsHorizontal,
  mdiDelete,
  mdiSend,
  mdiChevronUp,
  mdiChevronDown,
  mdiHelpCircleOutline,
}

Vue.prototype.$theme = {
  appBar: {
    color: "deep-purple darken-2",
  },
  card: {
    color: "deep-purple darken-2",
    textSize: "body-1",
  },
  drawer: {
    color: "deep-purple darken-2",
  },
  menu: {
    color: "deep-purple darken-2",
  },
  footer: {
    color: "deep-purple darken-2",
  },
  switch: {
    color: "pink",
  },
  input: {
    color: "deep-purple darken-4",
  },
}
new Vue({
  router,
  store,
  render: h => h(App),
  vuetify,

  beforeCreate() {

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
}).$mount('#app')

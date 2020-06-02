import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import VModal from 'vue-js-modal'
import vuetify from './plugins/vuetify';

Vue.use(VModal)
Vue.config.productionTip = false

// three shaking icons to reduce bundle size
import {
  mdiCalendar,
  mdiClock,
  mdiCog,
  mdiHome,
  mdiSync,
  mdiPencil,
  mdiMagnify,
  mdiEye,
  mdiEyeOff,
  mdiDotsVertical,
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
  mdiHome,
  mdiSync,
  mdiPencil,
  mdiMagnify,
  mdiEye,
  mdiEyeOff,
  mdiDotsVertical,
  mdiDelete,
  mdiSend,
  mdiChevronUp,
  mdiChevronDown,
  mdiHelpCircleOutline,
}

Vue.prototype.$theme = {
  card: {
    color: "grey darken-4",
    textSize: "body-1",
  }
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

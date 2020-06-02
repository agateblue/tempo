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
  mdiSync,
  mdiPencil,
  mdiMagnify,
  mdiDotsVertical,
  mdiDelete,
  mdiChevronUp,
  mdiChevronDown,
  mdiHelpCircleOutline,
} from '@mdi/js'

Vue.prototype.$icons = {
  mdiCalendar,
  mdiClock,
  mdiCog,
  mdiSync,
  mdiPencil,
  mdiMagnify,
  mdiDotsVertical,
  mdiDelete,
  mdiChevronUp,
  mdiChevronDown,
  mdiHelpCircleOutline,
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

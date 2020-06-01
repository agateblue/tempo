import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import VueShowdown from 'vue-showdown'
import VModal from 'vue-js-modal'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'

Vue.use(VModal)
Vue.config.productionTip = false


Vue.use(VueShowdown, {
  options: {
    emoji: true
  }
})

// three shaking icons to reduce bundle size
import {
  mdiCalendar,
  mdiClock,
  mdiPencil,
  mdiMagnify,
  mdiDotsVertical,
} from '@mdi/js'

Vue.prototype.$icons = {
  mdiCalendar,
  mdiClock,
  mdiPencil,
  mdiMagnify,
  mdiDotsVertical,
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

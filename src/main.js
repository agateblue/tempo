import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import VueShowdown from 'vue-showdown'
import VModal from 'vue-js-modal'

Vue.use(VModal)
Vue.config.productionTip = false


Vue.use(VueShowdown, {
  options: {
    emoji: true
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

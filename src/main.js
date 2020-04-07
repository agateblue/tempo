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
  render: h => h(App),

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

import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import {vuetify, icons, theme} from './plugins/vuetify';
import { VuePlausible } from 'vue-plausible'

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

app.config.globalProperties.$icons = icons
app.config.globalProperties.$theme = theme


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

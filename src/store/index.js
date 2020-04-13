import Vue from 'vue'
import Vuex from 'vuex'
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find'
import PouchDBAuthentication from 'pouchdb-authentication'
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBAuthentication)

Vue.use(Vuex)

const version = 1
const cssVars = [
  {
    id: "main-bg",
    default: '#422D62',
    label: 'Background color or image (CSS supported)',
  },
  {
    id: "main-text-color",
    default: 'rgba(255, 255, 255, 0.904)',
    label: 'Text color',
  },
  {
    id: "content-bg",
    default: 'rgba(39, 22, 58, 0.3)',
    label: 'Background color for sidebar and main content',
  },
  {
    id: "modal-bg",
    default: 'rgba(39, 22, 58, 1)',
    label: 'Background color for modal windows',
  },
  {
    id: "secondary-bg-color",
    default: 'rgba(66, 45, 98, 1)',
    label: 'Secondary background color',
  },
  {
    id: "very-negative-color",
    default: '#E35F75',
    label: 'Very negative mood color',
  },
  {
    id: "accent-color",
    default: '#FF65A0',
    label: 'Accent color used for links and tags',
  },
  {
    id: "negative-color",
    default: '#F3BAC3',
    label: 'Negative mood color',
  },
  {
    id: "neutral-color",
    default: 'rgba(255, 255, 255, 0.1)',
    label: 'Neutral mood color',
  },
  {
    id: "positive-color",
    default: '#79C698',
    label: 'Positive mood color',
  },
  {
    id: "very-positive-color",
    default: '#398557',
    label: 'Very positive mood color',
  },
  {
    id: "graph-label-color",
    default: 'black',
    label: 'Mood widget text color',
  },
]
let theme = {}
cssVars.forEach(v => {
  theme[v.id] = null
})
const store = new Vuex.Store({
  state: {
    db: null,
    pageSize: 50,
    syncHandler: null,
    couchDbUrl: null,
    couchDbUsername: null,
    couchDbPassword: null,
    lastSync: new Date(),
    showDailyMood: false,
    theme,
    cssVars,
    version,
  },
  mutations: {
    handleSync (state, info) {
      console.log('Received sync event', info)
      state.lastSync = new Date()
    },
    toggleShowDailyMood (state) {
      state.showDailyMood = !state.showDailyMood
    },
    syncHandler (state, newValue) {
      if (state.syncHandler) {
        console.log('Killing existing replication…')
        state.syncHandler.cancel()
      }
      state.syncHandler = newValue
    },
    theme (state, vars) {
      state.cssVars.forEach((v) => {
        if (vars[v.id] != undefined) {
          state.theme[v.id] = vars[v.id]
        }
      })
    },
    resetTheme (state) {
      state.cssVars.forEach((v) => {
        state.theme[v.id] = null
      })
    },
    couchDbConfig (state, {url, username, password}) {
      state.couchDbUrl = url
      state.couchDbUsername = username
      state.couchDbPassword = password
    },
    loadCachedState(state) {
      if(localStorage.getItem('state')) {
        let store = JSON.parse(localStorage.getItem('state'))
        if(store.version == version) {
          console.log('Loading cached state…')
          this.replaceState(
            Object.assign(state, store)
          );
        } else {
          console.log('Ignoring stale cache')
          state.version = version;
        }
      }
    },
    initDb (state) {
      if (state.syncHandler) {
        console.log('Killing existing replication…')
        state.syncHandler.cancel()
      }
      state.db = new PouchDB('db')
      state.db.createIndex({
        index: {fields: ['type']}
      })
    }
  },
  getters: {
    cssVarValue: (state) => (id) => {
      let v = state.cssVars.filter(v => {
        return v.id === id
      })[0]
      return state.theme[v] || v.default
    }
  },
  actions: {
    async addEntry ({state}, entryData) {
      await state.db.put(entryData)
      return await state.db.get(entryData._id)
    },
    async updateEntry ({state}, entryData) {
      await state.db.put(entryData)
      return await state.db.get(entryData._id)
    },
    async reset ({commit, state, dispatch}) {
      await state.db.destroy()
      commit('initDb')
      await dispatch('setupSync', {
        url: state.couchDbUrl,
        username: state.couchDbUsername,
        password: state.couchDbPassword,
      })
    },
    async setupSync ({state, commit}, {url, username, password}) {
      commit('syncHandler', null)
      commit('couchDbConfig', {url, username, password})

      if (state.couchDbUrl) {
        console.log('Setting up live replication…')
        let remoteDb = new PouchDB(state.couchDbUrl)
        console.log('Logging in…')
        await remoteDb.logIn(username, password)
        let syncHandler = state.db.sync(remoteDb, {
          live: true,
          retry: true
        }).on('change', (info) => {
          commit('handleSync', info)
        })
        commit('syncHandler', syncHandler)
      }
    },
    async setTheme ({state, commit}, theme) {
      if (theme) {
        commit('theme', theme)
      } else {
        commit('resetTheme')
      }
      let existing = await state.db.get('theme')
      let data = {
        _id: 'theme',
        theme: theme,
        type: 'settings',
      }
      if (existing) {
        data._rev = existing._rev
      }
      await state.db.put(data)
    }
  },
  modules: {
  }
})

store.subscribe((mutation, state) => {
	let store = {
		couchDbUrl: state.couchDbUrl,
		couchDbUsername: state.couchDbUsername,
		couchDbPassword: state.couchDbPassword,
		version: state.version,
    pageSize: state.pageSize,
    theme: state.theme,
    showDailyMood: state.showDailyMood,
	};

  console.log('Updating localstorage cache…')
	localStorage.setItem('state', JSON.stringify(store));
});
export default store

import Vue from 'vue'
import Vuex from 'vuex'
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find'
import PouchDBAuthentication from 'pouchdb-authentication'
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBAuthentication)

Vue.use(Vuex)
import isEqual from 'lodash/isEqual'

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
    id: "accent-color",
    default: '#FF65A0',
    label: 'Accent color used for links and tags',
  }
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
    theme,
    cssVars,
    version,
    dark: true,
  },
  mutations: {
    handleSync (state, info) {
      console.log('Received sync event', info)
      state.lastSync = new Date()
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
        index: {fields: ['date', 'type']}
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
    async forceSync({state}) {
      if (!state.couchDbUrl) {
        return
      }
      console.log('Forcing sync…')
      let remoteDb = new PouchDB(state.couchDbUrl)
      await remoteDb.logIn(state.couchDbUsername, state.couchDbPassword)
      return await state.db.sync(remoteDb)
    },
    async setTheme ({state, commit}, theme) {
      if (theme) {
        commit('theme', theme)
      } else {
        commit('resetTheme')
      }
      let existing
      try {
        existing = await state.db.get('theme')
      } catch {
        console.debug('No existing theme')
      }
      if (existing && isEqual(existing.theme, theme)) {
        return
      }
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
	};

  console.log('Updating localstorage cache…')
	localStorage.setItem('state', JSON.stringify(store));
});
export default store

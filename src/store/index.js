import Vue from 'vue'
import Vuex from 'vuex'
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find'
import PouchDBAuthentication from 'pouchdb-authentication'
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBAuthentication)

Vue.use(Vuex)

const version = 1
const store = new Vuex.Store({
  state: {
    db: null,
    pageSize: 50,
    syncHandler: null,
    couchDbUrl: null,
    couchDbUsername: null,
    couchDbPassword: null,
    lastSync: new Date(),
    version,
    cssVars: [
      {
        id: "main-bg",
        value: null,
        default: '#422D62',
        label: 'Background color or image (CSS supported)',
      },
      {
        id: "main-text-color",
        value: null,
        default: 'rgba(255, 255, 255, 0.904)',
        label: 'Text color',
      },
      {
        id: "content-bg",
        value: null,
        default: 'rgba(39, 22, 58, 0.3)',
        label: 'Background color for sidebar and main content',
      },
      {
        id: "modal-bg",
        value: null,
        default: 'rgba(39, 22, 58, 1)',
        label: 'Background color for modal windows',
      },
      {
        id: "secondary-bg-color",
        value: null,
        default: '#422D62',
        label: 'Secondary background color (inputs, entries)',
      },
      {
        id: "very-negative-color",
        value: null,
        default: '#E35F75',
        label: 'Very negative mood color',
      },
      {
        id: "accent-color",
        value: null,
        default: '#FF65A0',
        label: 'Accent color used for links and tags',
      },
      {
        id: "negative-color",
        value: null,
        default: '#F3BAC3',
        label: 'Negative mood color',
      },
      {
        id: "neutral-color",
        value: null,
        default: 'rgba(255, 255, 255, 0.1)',
        label: 'Neutral mood color',
      },
      {
        id: "positive-color",
        value: null,
        default: '#79C698',
        label: 'Positive mood color',
      },
      {
        id: "very-positive-color",
        value: null,
        default: '#398557',
        label: 'Very positive mood color',
      },
      {
        id: "graph-label-color",
        value: null,
        default: 'black',
        label: 'Mood widget text color',
      },
    ]
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
	};

  console.log('Updating localstorage cache…')
	localStorage.setItem('state', JSON.stringify(store));
});
export default store

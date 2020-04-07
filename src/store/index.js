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

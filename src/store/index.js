import Vue from 'vue'
import Vuex from 'vuex'
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find'
import PouchDBAuthentication from 'pouchdb-authentication'
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBAuthentication)

Vue.use(Vuex)

import {SETTINGS, getSettingValue} from '@/utils'

const version = 1

const store = new Vuex.Store({
  state: {
    db: null,
    pageSize: 30,
    syncHandler: null,
    couchDbUrl: null,
    couchDbUsername: null,
    couchDbPassword: null,
    lastSync: new Date(),
    version,
    dark: true,
    sync: {
      loading: false,
      error: null,
    },
    charts: [],
    aliases: [],
    serviceWorker: {
      refreshing: false,
      registration: null,
      updateAvailable: false,
    },
    settings: {}
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
        index: {fields: ['date', 'type']}
      })
    },
    serviceWorker: (state, value) => {
      state.serviceWorker = {...state.serviceWorker, ...value}
    },
    setting (state, {name, value}) {
      state.settings[name] = value
    },
    settings (state, value) {
      state.settings = value
    },
    sync (state, value) {
      state.sync = value
    },
  },
  getters: {
    settings: (state) => {
      let s = {}
      SETTINGS.forEach(r => {
        let v = state.settings[r.name]
        if (v === undefined) {
          v = r.default()
        }
        s[r.name] = v
      })
      return s
    },
    boardLists: (state, getters) => {
      return [...getters.settings.boardConfig.lists, {label: "Done"}]
    },
    taskCategoryChoices: (state) => {
      return state.settings.boardConfig.categories.map((c) => {
        return {value: c.label, text: c.label}
      })
    },
    taskListChoices: (state) => {
      let index = 0
      let choices = []
      state.settings.boardConfig.lists.forEach(l => {
        choices.push({value: index, text: l.label})
        index += 1
      })
      choices.push({value: index, text: 'Done'})
      return choices
    }
  },
  actions: {
    async addEntry ({state, dispatch}, entryData) {
      await state.db.put(entryData)
      dispatch('forceSync')
      return await state.db.get(entryData._id)
    },
    async updateEntry ({state, dispatch}, entryData) {
      await state.db.put(entryData)
      dispatch('forceSync')
      return await state.db.get(entryData._id)
    },
    async reset ({commit, state, dispatch}) {
      await state.db.destroy()
      localStorage.removeItem('state')
      commit("settings", {})
      commit('initDb')
      await dispatch('setupSync', {
        url: state.couchDbUrl,
        username: state.couchDbUsername,
        password: state.couchDbPassword,
      })
      await dispatch("loadSettings")
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
        }).on('change', () => {
          console.log("Sync change…")
          // commit('handleSync', info)
        }).on('active', () => {
          console.log("Sync active…")
          // commit('handleSync', info)
        }).on('complete', () => {
          console.log("Sync complete…")
          // commit('handleSync', info)
        })
        commit('syncHandler', syncHandler)
      }
    },
    async forceSync({state, commit}) {
      if (!state.couchDbUrl || state.sync.loading) {
        return
      }
      commit("sync", {loading: true, error: null})
      console.log('Forcing sync…')
      let remoteDb = new PouchDB(state.couchDbUrl)
      try {
        await remoteDb.logIn(state.couchDbUsername, state.couchDbPassword)
        await state.db.sync(remoteDb)
      } catch (e) {
        console.log("Error while syncing", e)
        setTimeout(() => {
          commit("sync", {loading: false, error: null})
        }, 3000);
        return commit("sync", {loading: false, error: e})
      }
      commit("sync", {loading: false, error: null})
      commit('handleSync', null)
    },
    async setWebhook ({dispatch}, {url}) {
      await dispatch("setSetting", {name: "webhook", value: {url}})
    },
    async triggerWebhook ({state}, url) {
      url = url || state.settings.webhook.url
      if (!url) {
        console.log("No webhook configured, skipping", state.settings.webhook.url)
        return
      }
      console.log("Sending webhook to", url)
      return await fetch(url, {
        method: "POST",
        body: ""
      })
    },
    async addChart ({state, dispatch}, config) {
      let id = (new Date()).toISOString()
      config._id = id
      let charts = [...state.settings.charts, config]
      await dispatch("setSetting", {name: "charts", value: charts})
    },
    async removeChart ({state, dispatch}, id) {
      let remaining = state.settings.charts.filter(c => {
        return c._id != id
      })
      await dispatch("setSetting", {name: "charts", value: remaining})
    },
    async updateChart ({state, dispatch}, chart) {
      
      let charts = []
      state.settings.charts.forEach((c) => {
        if (c._id === chart._id) {
          charts.push(chart)
        } else {
          charts.push(c)
        }
      })
      await dispatch("setSetting", {name: "charts", value: charts})
    },
    async boardConfig ({dispatch}, boardConfig) {
      await dispatch("setSetting", {name: "boardConfig", value: boardConfig})
    },

    async addAlias ({state, dispatch}, config) {
      let id = (new Date()).toISOString()
      config._id = id
      let aliases = [...state.settings.aliases, config]
      await dispatch("setSetting", {name: "aliases", value: aliases})
    },
    async removeAlias ({state, dispatch}, id) {
      let remaining = state.settings.aliases.filter(c => {
        return c._id != id
      })
      await dispatch("setSetting", {name: "aliases", value: remaining})
    },
    async updateAlias ({state, dispatch}, alias) {
      
      let aliases = []
      state.settings.aliases.forEach((c) => {
        if (c._id === alias._id) {
          aliases.push(alias)
        } else {
          aliases.push(c)
        }
      })
      await dispatch("setSetting", {name: "aliases", value: aliases})
    },
    async setSetting ({state, commit}, {name, value}) {
      let data
      try {
        data = await state.db.get(name)
        data = {
          _id: name,
          type: 'settings',
          _rev: data._rev,
          value,
        }
      } catch (e) {
        data = {
          _id: name,
          type: 'settings',
          value
        }
      }
      data = JSON.parse(JSON.stringify(data))
      await state.db.put(data)
      commit("setting", {name, value})
    },
    async loadSettings ({state, commit}) {
      let s = {}
      for (const r of SETTINGS) {
        let v
        try {
          let existing = await state.db.get(r.name)
          v = getSettingValue(existing)
        } catch {
          v = r.default()
        }
        s[r.name] = v
      }
      commit("settings", s)
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
    settings: state.settings,
	};

  console.log('Updating localstorage cache…')
	localStorage.setItem('state', JSON.stringify(store));
});
export default store

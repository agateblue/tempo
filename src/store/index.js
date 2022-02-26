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
    shortcuts: [],
    charts: [],
    aliases: [],
    serviceWorker: {
      refreshing: false,
      registration: null,
      updateAvailable: false,
    },
    webhook: {
      query: null,
      url: null,
    },
    boardConfig: null,
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
    webhook (state, {url, query}) {
      state.webhook.url = url || null
      state.webhook.query = query || null
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
    shortcuts (state, shortcuts) {
      state.shortcuts = shortcuts
    },
    charts (state, charts) {
      state.charts = charts
    },
    aliases (state, aliases) {
      state.aliases = aliases
    },
    boardConfig (state, boardConfig) {
      state.boardConfig = boardConfig
    }
  },
  getters: {
    boardLists: (state) => {
      return [...state.boardConfig.lists, {label: "Done"}]
    },
    taskCategoryChoices: (state) => {
      return state.boardConfig.categories.map((c) => {
        return {value: c.label, text: c.label}
      })
    },
    taskListChoices: (state) => {
      let index = 0
      let choices = []
      state.boardConfig.lists.forEach(l => {
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
      commit("boardConfig", null)
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
      if (!state.couchDbUrl) {
        return
      }
      console.log('Forcing sync…')
      let remoteDb = new PouchDB(state.couchDbUrl)
      await remoteDb.logIn(state.couchDbUsername, state.couchDbPassword)
      await state.db.sync(remoteDb)
      commit('handleSync', null)
    },
    async setWebhook ({state, commit}, {url, query}) {
      commit('webhook', {url, query})
      let existing
      try {
        existing = await state.db.get('webhook')
      } catch {
        console.debug('No existing wehook')
      }
      if (existing && isEqual(existing.webhook, state.webhook)) {
        return
      }
      let data = {
        _id: 'webhook',
        webook: {url, query},
        type: 'settings',
      }
      if (existing) {
        data._rev = existing._rev
      }
      await state.db.put(data)
    },
    async triggerWebhook ({state}, url) {
      url = url || state.webhook.url
      if (!url) {
        console.log("No webhook configured, skipping", state.webhook.url)
        return
      }
      console.log("Sending webhook to", url)
      return await fetch(url, {
        method: "POST",
        body: ""
      })
    },

    async newShortcut ({state, commit}, content) {
      commit('shortcuts', [...state.shortcuts, content])
      let existing
      try {
        existing = await state.db.get('shortcuts')
      } catch {
        console.debug('No existing shortcuts')
      }
      if (existing && isEqual(existing.shortcuts, state.shortcuts)) {
        return
      }
      let data = {
        _id: 'shortcuts',
        shortcuts: state.shortcuts,
        type: 'settings',
      }
      if (existing) {
        data._rev = existing._rev
      }
      await state.db.put(data)
    },
    async removeShortcut ({state, commit}, content) {
      let remaining = state.shortcuts.filter(s => {
        return s != content
      })
      commit('shortcuts', remaining)
      let existing = await state.db.get('shortcuts')
      let data = {
        _id: 'shortcuts',
        shortcuts: state.shortcuts,
        type: 'settings',
      }
      if (existing) {
        data._rev = existing._rev
      }
      await state.db.put(data)
    },
    async loadShortcuts ({state, commit}) {
      let sc = []
      try {
        sc = await state.db.get("shortcuts")
      } catch (e) {
        console.debug('No existing shortcuts')
        return
      }
      commit('shortcuts', sc.shortcuts)
    },
    async addChart ({state, commit}, config) {
      let id = (new Date()).toISOString()
      config._id = id
      commit('charts', [...state.charts, config])
      let existing
      try {
        existing = await state.db.get('charts')
      } catch {
        console.debug('No existing charts')
      }
      if (existing && isEqual(existing.charts, state.charts)) {
        return
      }
      let data = {
        _id: 'charts',
        charts: state.charts,
        type: 'settings',
      }
      if (existing) {
        data._rev = existing._rev
      }
      await state.db.put(data)
    },
    async removeChart ({state, commit}, id) {
      let remaining = state.charts.filter(c => {
        return c._id != id
      })
      commit('charts', remaining)
      let existing = await state.db.get('charts')
      let data = {
        _id: 'charts',
        charts: state.charts,
        type: 'settings',
      }
      if (existing) {
        data._rev = existing._rev
      }
      await state.db.put(data)
    },
    async updateChart ({state, commit}, chart) {
      
      let charts = []
      state.charts.forEach((c) => {
        if (c._id === chart._id) {
          charts.push(chart)
        } else {
          charts.push(c)
        }
      })
      commit('charts', charts)
      let existing = await state.db.get('charts')
      let data = {
        _id: 'charts',
        charts: state.charts,
        type: 'settings',
      }
      if (existing) {
        data._rev = existing._rev
      }
      await state.db.put(data)
    },
    async loadCharts ({state, commit}) {
      let sc = []
      try {
        sc = await state.db.get("charts")
      } catch (e) {
        console.debug('No existing charts')
        return
      }
      commit('charts', sc.charts)
    },
    async boardConfig ({state, commit}, boardConfig) {
      commit('boardConfig', boardConfig)
      let existing
      try {
        existing = await state.db.get('boardConfig')
      } catch {
        console.debug('No existing lists')
      }
      if (existing && isEqual(existing.boardConfig, state.boardConfig)) {
        return
      }
      let data = {
        _id: 'boardConfig',
        boardConfig: state.boardConfig,
        type: 'settings',
      }
      if (existing) {
        data._rev = existing._rev
      }
      await state.db.put(data)
    },

    async loadBoardConfig ({state, commit}) {
      let tl = []
      try {
        tl = await state.db.get("boardConfig")
      } catch (e) {
        console.debug('No existing boardConfig')
        return
      }
      commit('boardConfig', tl.boardConfig)
    },
    async addAlias ({state, commit}, config) {
      let id = (new Date()).toISOString()
      config._id = id
      commit('aliases', [...state.aliases, config])
      let existing
      try {
        existing = await state.db.get('aliases')
      } catch {
        console.debug('No existing aliases')
      }
      if (existing && isEqual(existing.aliases, state.aliases)) {
        return
      }
      let data = {
        _id: 'aliases',
        aliases: state.aliases,
        type: 'settings',
      }
      if (existing) {
        data._rev = existing._rev
      }
      await state.db.put(data)
    },
    async removeAlias ({state, commit}, id) {
      let remaining = state.aliases.filter(c => {
        return c._id != id
      })
      commit('aliases', remaining)
      let existing = await state.db.get('aliases')
      let data = {
        _id: 'aliases',
        aliases: state.aliases,
        type: 'settings',
      }
      if (existing) {
        data._rev = existing._rev
      }
      await state.db.put(data)
    },
    async updateAlias ({state, commit}, chart) {
      
      let aliases = []
      state.aliases.forEach((c) => {
        if (c._id === chart._id) {
          aliases.push(chart)
        } else {
          aliases.push(c)
        }
      })
      commit('aliases', aliases)
      let existing = await state.db.get('aliases')
      let data = {
        _id: 'aliases',
        aliases: state.aliases,
        type: 'settings',
      }
      if (existing) {
        data._rev = existing._rev
      }
      await state.db.put(data)
    },
    async loadAliases ({state, commit}) {
      let sc = []
      try {
        sc = await state.db.get("aliases")
      } catch (e) {
        console.debug('No existing aliases')
        return
      }
      commit('aliases', sc.aliases)
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
		webhook: state.webhook,
		version: state.version,
	};

  console.log('Updating localstorage cache…')
	localStorage.setItem('state', JSON.stringify(store));
});
export default store

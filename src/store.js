import Vue from 'vue'
import Vuex from 'vuex'
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find'
import PouchDBAuthentication from 'pouchdb-authentication'
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBAuthentication)

Vue.use(Vuex)

import {SETTINGS, getSettingValue, getNewEntryData} from '@/utils'

async function getBuiltinBlueprints () {
  return {
    "builtin:mood": (await import("@/blueprints/builtin:mood.json")).default,
    "builtin:tags": (await import("@/blueprints/builtin:tags.json")).default,
    "builtin:travel": (await import("@/blueprints/builtin:travel.json")).default,
  }
}


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
    settings: {},
    loadedBlueprints: [],
    searchQuery: '',
  },
  mutations: {
    handleSync (state, {updateLastSync}) {
      console.log('Received sync event')
      if (updateLastSync) {
        state.lastSync = new Date()
      }
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
        index: {fields: ['date', 'type', 'thread']}
      })
      state.db.createIndex({
        index: {fields: ['form', 'date']}
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
    loadedBlueprints (state, value) {
      state.loadedBlueprints = value
    },
    searchQuery (state, value) {
      state.searchQuery = value
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
    },
    enabledBlueprints: (state) => {
      return state.loadedBlueprints.filter(b => {
        return state.settings.blueprints.indexOf(b.id) > -1
      })
    },
    forms: (state, getters) => {
      let allForms = []
      getters.enabledBlueprints.forEach(l => {
        allForms = [...allForms, ...(l.forms || [])]
      })
      return allForms
    },
    formsById: (state, getters) => {
      let forms = {}
      getters.forms.forEach(f => {
        forms[f.id] = f
      })
      return forms
    },
    fields: (state, getters) => {
      let allFields = []
      getters.enabledBlueprints.forEach(l => {
        allFields = [...allFields, ...(l.fields || [])]
      })
      return allFields
    },
    fieldsById: (state, getters) => {
      let fields = {}
      getters.fields.forEach(f => {
        fields[f.id] = f
      })
      return fields
    },
  },
  actions: {
    async addEntry ({state, dispatch}, entryData) {
      await state.db.put(entryData)
      let entry = await state.db.get(entryData._id)
      await dispatch('rebuildThread', entryData.thread)
      dispatch('forceSync', {updateLastSync: false})
      return entry
    },
    async partialUpdateEntry ({dispatch}, {entry, values}) {
      let data = {
        ...getNewEntryData(entry.text, { thread: entry.thread, replies: entry.replies }),
        ...values,
        _rev: entry._rev,
        _id: entry._id,
        date: (new Date(entry.date)).toISOString()
      }
      let e = await dispatch('updateEntry', data)
      dispatch('forceSync', {updateLastSync: false})
      return e
    },
    async updateEntry ({state, dispatch}, entryData) {
      await state.db.put(entryData)
      await dispatch('rebuildThread', entryData.thread)
      return await state.db.get(entryData._id)
    },
    async rebuildThread ({state, dispatch}, id) {
      // when an entry is added, updated or deleted,
      // we need to ensure the corresponding thread is consistent
      // this functions takes a thread ID and ensures
      // the thread has the proper replies
      if (!id) {
        return
      }
      let thread
      try {
        thread = await state.db.get(id)
      } catch (e) {
        console.error(`Thread ${id} does not exist and cannot be rebuilt`, e)
        return
      }
      let replies = await state.db.find({
        selector: {
          thread: thread._id,
        },
        fields: ['_id'],
        limit: 9999999,
      })
      replies = replies.docs.map(r => {
        return r._id
      })
      replies.sort()
      thread.replies = replies
      return await dispatch('updateEntry', thread)
    },
    async deleteThread ({state}, id) {
      if (!id) {
        return
      }
      let replies = await state.db.find({
        selector: {
          thread: id,
        },
        fields: ['_id', '_rev'],
        limit: 9999999,
      })
      replies = replies.docs.map(r => {
        return {
          ...r,
          _deleted: true,
        }
      })
      console.log(`Deleting ${replies.length} from thread ${id}...`)
      await state.db.bulkDocs(replies)
      return replies
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
        }).on('active', () => {
          console.log("Sync active…")
        }).on('complete', () => {
          console.log("Sync complete…")
        })
        commit('syncHandler', syncHandler)
      }
    },
    async forceSync({state, commit}, {updateLastSync}) {
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
      commit('handleSync', {updateLastSync})
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
    async loadSettings ({state, commit, dispatch}) {
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
      dispatch("loadBlueprints")
    },
    async loadBlueprints ({commit}) {
      let builtins = await getBuiltinBlueprints()
      let allBlueprints = {...builtins}

      commit("loadedBlueprints", Object.keys(allBlueprints).map(b => {return allBlueprints[b]}))
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

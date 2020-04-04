import Vue from 'vue'
import Vuex from 'vuex'
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);


function initDb () {
  var db = new PouchDB('db');

  db.createIndex({
    index: {fields: ['type']}
  });
  return db

}
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    db: initDb(),
  },
  mutations: {
    setDb (state, db) {
      state.db = db
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
    async reset ({commit, state}) {
      await state.db.destroy()
      commit('setDb', initDb())
    }
  },
  modules: {
  }
})

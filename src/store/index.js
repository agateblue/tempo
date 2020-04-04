import Vue from 'vue'
import Vuex from 'vuex'
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

var db = new PouchDB('db');

db.createIndex({
  index: {fields: ['type']}
});


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    db,
  },
  mutations: {
  },
  actions: {
    async addEntry ({state}, entryData) {
      await state.db.put(entryData)
      return await state.db.get(entryData._id)
    }
  },
  modules: {
  }
})

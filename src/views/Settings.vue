<template>
  <main class="single-column">
    <section class="widget">
      <h1>
        Settings
      </h1>
      <router-link :to="{name: 'Home'}">Go back</router-link>
      <ul>
        <li><a href="#theming">Theming</a></li>
        <li><a href="#import">Import entries</a></li>
        <li><a href="#sync">Sync</a></li>
        <li><a href="#delete">Delete data</a></li>
      </ul>
    </section>
    <section id="theming" class="attached widget">
      <h2>Theming</h2>
      <p>Customize Tempo's look and feel</p>
      <theme-form></theme-form>
    </section>
    <section id="import" class="attached widget">
      <h2>Import entries</h2>
      <form>
        <p>Import entries from a JSON file exported from another Tempo session.</p>
        <input type="file" name="import" accept=".json,application/json" @change="toImport = $event.target.files[0]">
        <hr>
        <input class="right floated" :disabled="!toImport" type="submit" @click.stop.prevent="importEntries" value="Import">
        <p v-if="importedEntries > 0">Imported {{ importedEntries }} entries!</p>
        <p v-if="failedEntries > 0">Skipped {{ failedEntries }} existing entries.</p>
      </form>
    </section>
    <section id="sync" class="attached widget">
      <h2>Syncing with other devices</h2>
      <p>Your diary can be synced with other devices using any <a href="https://couchdb.apache.org/">CouchDB server</a>. This is not provided as part of Tempo though, and you have to find or host one yourself.</p>
      <form>
        <div>
          <label for="dbUrl">CouchDB URL</label>
          <input type="url" placeholder="http://localhost:5984/tempo" id="dbUrl" name="dbUrl" ref="dbUrl" :value="$store.state.couchDbUrl">
        </div>
        <div>
          <label for="dbUsername">CouchDB Username</label>
          <input type="text" placeholder="admin" id="dbUsername" name="dbUsername" ref="dbUsername" :value="$store.state.couchDbUsername">
        </div>
        <div>
          <label for="dbPassword">CouchDB Password</label>
          <input type="password" placeholder="secret" id="dbPassword" name="dbPassword" ref="dbPassword" :value="$store.state.couchDbPassword">
        </div>
        <hr>
        <input class="right floated" type="submit" @click.stop.prevent="$store.dispatch('setupSync', {url: $refs.dbUrl.value, username: $refs.dbUsername.value, password: $refs.dbPassword.value })" value="Setup sync">
      </form>

    </section>
    <section id="delete" class="attached widget">
      <h2>Delete your data</h2>
      <p>Delete all your data from Tempo.</p>
      <button class="right floated" @click="deleteConfirm">Delete my data…</button>
    </section>
  </main>
</template>

<script>
import ThemeForm from '@/components/ThemeForm'

export default {
  components: {
    ThemeForm
  },
  data () {
    return {
      toImport: null,
      importedEntries: 0,
      failedEntries: 0,
    }
  },
  methods: {
    async importEntries () {
      if (!this.toImport) {
        console.log('No file to import')
        return
      }
      this.importedEntries = 0
      this.failedEntries = 0
      console.log('Importing entries…')
      let text = await this.toImport.text()
      let entries = JSON.parse(text)
      entries.forEach((e) => {
        delete e._rev
      })
      let result = await this.$store.state.db.bulkDocs(entries)
      this.importedEntries = result.filter((e) => {
        return e.ok
      }).length
      this.failedEntries = result.filter((e) => {
        return !e.ok
      }).length
    },
    deleteConfirm () {
      if (confirm("This will remove all your notes. This action is irreversible.")) {
        this.$store.dispatch('reset')
        this.importedEntries = 0
        this.failedEntries = 0
      }
    }
  }
}
</script>

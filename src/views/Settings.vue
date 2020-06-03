<template>
  <div>
    <v-card tag="section" class="mb-8" :color="$theme.card.color">
      <v-card-title class="headline">Settings</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <ul>
          <li><a href="#theming">Theming</a></li>
          <li><a href="#import">Import entries</a></li>
          <li><a href="#sync">Sync</a></li>
          <li><a href="#delete">Delete data</a></li>
        </ul>
      </v-card-text>
    </v-card>
    <!-- <v-card tag="section" id="theming" class="mb-8" :color="$theme.card.color">
      <v-card-title class="headline">Theming</v-card-title>
      <v-card-text :class="$theme.card.textSize">
        <p>Customize Tempo's look and feel</p>
        <v-list dense>
          <v-list-item>
            <v-list-item-action>
              <v-switch :color="$theme.switch.color" v-model="darkTheme"></v-switch>
            </v-list-item-action>
            <v-list-item-title>Dark theme</v-list-item-title>
          </v-list-item>
        </v-list>
        <theme-form></theme-form>
      </v-card-text>
    </v-card> -->

    <v-card tag="section" id="import" class="mb-8" :color="$theme.card.color">
      <v-card-title class="headline">Import entries</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <p>Import entries from a JSON file exported from another Tempo session.</p>
        <v-form>
          <v-file-input accept=".json,application/json" label="JSON export" v-model="toImport"></v-file-input>
          <v-btn
            :disabled="!toImport"
            color="primary"
            @click="importEntries">
            Import
          </v-btn>
          <p v-if="importedEntries > 0">Imported {{ importedEntries }} entries!</p>
          <p v-if="failedEntries > 0">Skipped {{ failedEntries }} existing entries.</p>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card tag="section" id="sync" class="mb-8" :color="$theme.card.color">
      <v-card-title class="headline">Syncing with other devices</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <p>Your diary can be synced with other devices using any <a href="https://couchdb.apache.org/">CouchDB server</a>. This is not provided as part of Tempo though, and you have to find or host one yourself.</p>
        <v-form>
          <v-text-field
            v-model="couchDbUrl"
            label="CouchDB URL"
            placeholder="http://localhost:5984/tempo"
            required
          ></v-text-field>
          <v-text-field
            v-model="couchDbUsername"
            label="CouchDB Username"
            name="alice"
            required
          ></v-text-field>
          <v-text-field
            :append-icon="showdbPassword ? $icons.mdiEye : $icons.mdiEyeOff"
            :type="showdbPassword ? 'text' : 'password'"
            name="input-10-2"
            required
            label="CouchDB Password"
            v-model="couchDbPassword"
            class="input-group--focused"
            @click:append="showdbPassword = !showdbPassword"
          ></v-text-field>
          <v-btn
            class="mr-4"
            color="primary"
            @click="setupSync">
            Setup sync
          </v-btn>
          <span v-if="syncStatus">{{ syncStatus }}</span>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card tag="section" id="delete" class="mb-8" :color="$theme.card.color">
      <v-card-title class="headline">Delete your data</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <p>Delete all your data from Tempo.</p>
        <v-btn
          color="error"
          @click="deleteConfirm">
          Delete my data…
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
// import ThemeForm from '@/components/ThemeForm'

export default {
  components: {
    // ThemeForm
  },
  data () {

    return {
      syncStatus: null,
      toImport: null,
      importedEntries: 0,
      failedEntries: 0,
      showdbPassword: false,
      couchDbUrl: this.$store.state.couchDbUrl,
      couchDbUsername: this.$store.state.couchDbUsername,
      couchDbPassword: this.$store.state.couchDbPassword,
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
    },
    async setupSync () {
      this.syncStatus = "Checking sync..."
      try {
        await this.$store.dispatch(
          'setupSync', {
            url: this.couchDbUrl,
            username: this.couchDbUsername,
            password: this.couchDbPassword
          }
        )
        this.syncStatus = `Sync OK!`
      } catch (e) {
        this.syncStatus = `Error: ${e.name || e}`
      }
    }
  }
}
</script>

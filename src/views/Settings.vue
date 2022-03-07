<template>
  <div>
    <v-card tag="section" class="mb-8" :color="$theme.card.color">
      <v-card-title class="headline">Settings</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <ul>
          <li><a href="#export">Export data</a></li>
          <li><a href="#import">Import entries</a></li>
          <li><a href="#import-tasks">Import tasks</a></li>
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

    <v-card
      tag="form"
      id="export"
      class="section mb-8"
      :color="$theme.card.color"
      @submit.prevent="exportData"
    >
      <v-card-title class="headline">Export data</v-card-title>
      <v-card-text :class="$theme.card.textSize">
        <p>Export selected data into a JSON file for backup and restore purpose.</p>
        <v-checkbox
          hide-details
          v-model="exportConfig.entries"
          label="Export diary notes"
        ></v-checkbox>
        <v-checkbox
          hide-details
          v-model="exportConfig.board"
          label="Export tasks and board configuration"
        ></v-checkbox>
        <v-checkbox
          hide-details
          v-model="exportConfig.settings"
          label="Export Tempo settings"
        ></v-checkbox>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" type="submit">Export</v-btn>
      </v-card-actions>
    </v-card>
    <v-card
      tag="form"
      id="import"
      class="section mb-8"
      :color="$theme.card.color"
      @submit.prevent="importData"
    >
      <v-card-title class="headline">Import data</v-card-title>
      <v-card-text :class="$theme.card.textSize">
        <p>Import data from a previously generated Tempo JSON File. Existing notes and tasks will be kept.</p>
        <v-file-input accept=".json,application/json" label="JSON File" v-model="toImportFile"></v-file-input>
        <v-checkbox
          hide-details
          v-model="importConfig.entries"
          label="Import diary notes"
        ></v-checkbox>
        <v-checkbox
          hide-details
          v-model="importConfig.board"
          label="Import tasks and board configuration"
        ></v-checkbox>
        <v-checkbox
          hide-details
          v-model="importConfig.settings"
          label="Import Tempo settings"
        ></v-checkbox>
        <v-textarea
          v-if="importLogs.length > 0"
          readonly
          :value="importLogs.join('\n')"
          auto-grow
        >
        </v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" type="submit" :disabled="!toImportFile">Import</v-btn>
      </v-card-actions>
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

    <v-card tag="section" id="webhook" class="mb-8" :color="$theme.card.color">
      <v-card-title class="headline">Webhook</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <p>Notify an URL via a POST request when an entry is created, updated or deleted.</p>
          <v-text-field
            v-model="webhook.url"
            label="Webhook URL"
            name="webhookurl"
            type="url"
            required
          ></v-text-field>
        <v-btn
          class="mr-4"
          :disabled="!webhook.url"
          @click="triggerWebhook(webhook.url)">
          Send webhook now
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!webhook.url"
          @click="$store.dispatch('setWebhook', {url: webhook.url})">
          Save
        </v-btn>
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

import {search, getTasks, downloadFile, getSettings, bulkInsertAndUpdate} from '@/utils'

async function importEntries(entries, db, logs) {
  entries = entries || []
  logs.push(`[info] Importing ${entries.length} notes...`)
  let result = await bulkInsertAndUpdate(entries, db)
  let success = result.filter((e) => {
    return e.ok
  }).length
  let failed = result.filter((e) => {
    return !e.ok
  }).length
  if (failed > 0) {
    logs.push(`[error] ${failed} notes failed to import`)
  }
  if (success > 0) {
    logs.push(`[info] ${success} notes imported successfully...`)
  }
  return result
}
async function importBoard(board, db, dispatch, logs) {
  if (!board || !board.settings) {
    return logs.push("[error] Invalid board configuration, skipping")
  }
  logs.push(`[info] Importing board configuration...`)
  await dispatch('boardConfig', board.settings)

  let tasks = board.tasks || []
  logs.push(`[info] Importing ${tasks.length} tasks...`)
  let result = await bulkInsertAndUpdate(tasks, db)
  let success = result.filter((e) => {
    return e.ok
  }).length
  let failed = result.filter((e) => {
    return !e.ok
  }).length

  if (failed > 0) {
    logs.push(`[error] ${failed} tasks failed to import`)
  }
  if (success > 0) {
    logs.push(`[info] ${success} tasks imported successfully...`)
  }
  return result
}


async function importSettings(settings, db, logs) {
  settings = settings || []
  logs.push(`[info] Importing ${settings.length} settings...`)
  let result = await bulkInsertAndUpdate(settings, db)
  let success = result.filter((e) => {
    return e.ok
  }).length
  let failed = result.filter((e) => {
    return !e.ok
  }).length
  if (failed > 0) {
    logs.push(`[error] ${failed} settings failed to import`)
  }
  if (success > 0) {
    logs.push(`[info] ${success} settings imported successfully...`)
  }
  return result
}


export default {
  data () {
    return {
      exportConfig: {
        entries: true,
        board: true,
        settings: true,
      },
      importConfig: {
        entries: true,
        board: true,
        settings: true,
      },
      importLogs: [],
      syncStatus: null,
      toImportFile: null,
      showdbPassword: false,
      couchDbUrl: this.$store.state.couchDbUrl,
      couchDbUsername: this.$store.state.couchDbUsername,
      couchDbPassword: this.$store.state.couchDbPassword,
      webhook: this.$store.state.settings.webhook || {
        url: '',
      }
    }
  },
  methods: {
    async exportData () {
      let data = {}
      if (this.exportConfig.entries) {
        data.entries = await search({
          store: this.$store,
          sortDesc: false,
          query: ''
        })
      }
      if (this.exportConfig.board) {
        data.board = {
          settings: this.$store.state.boardConfig,
          tasks: await getTasks(this.$store, '')
        }
      }
      if (this.exportConfig.settings) {
        let settings = await getSettings(this.$store)
        data.settings = settings.filter(s => {
          return s._id != "boardConfig"
        })
      }

      let d = (new Date()).toISOString().slice(0, 16)
      downloadFile(
        window,
        document,
        JSON.stringify(data),
        'application/json',
        `tempo_export_${d}.json`
      )
    },
    async triggerWebhook (url) {
      await this.$store.dispatch("forceSync")
      await this.$store.dispatch('triggerWebhook', url)
    },
    async importData () {
      this.importLogs = []
      if (!this.toImportFile) {
        console.log('No file to import')
        return
      }
      this.importLogs.push("[info] Loading file...")
      let text = await this.toImportFile.text()
      this.importLogs.push("[info] Parsing file...")
      let data = JSON.parse(text)
      if (this.importConfig.entries ){
        await importEntries(data.entries, this.$store.state.db, this.importLogs)
      }
      if (this.importConfig.board ){
        await importBoard(data.board, this.$store.state.db, this.$store.dispatch, this.importLogs)
      }
      if (this.importConfig.settings ){
        await importSettings(data.settings, this.$store.state.db, this.importLogs)
        await this.$store.dispatch("loadSettings")
      }
      this.importLogs.push(`[info] Import complete!`)
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

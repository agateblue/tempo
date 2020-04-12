<template>
  <main>
    <aside>
      <h1>
        About Tempo
      </h1>
      <router-link :to="{name: 'Home'}">Go back</router-link>
      <p>
        Tempo is a personnal log and mood tracker. You can use it to track what's going on in your life and how different events affect your well-being.
      </p>
      <p>Features:</p>
      <ul>
        <li>Markdown syntax</li>
        <li>Offline first</li>
        <li>Private by design</li>
        <li>Mood tracking</li>
        <li>Powerful tagging and filtering</li>
        <li><a href="https://code.eliotberriot.com/eliotberriot/tempo">Free and Open Source</a></li>

      </ul>

      <button @click.prevent="$modal.show('sync')">Setup sync…</button>
      <modal name="sync" height="auto" :scrollable="true">
        <a href="" class="right floated" @click.prevent="$modal.hide('sync')">Close</a>
        <form>
          <p>Setup synchronisation through CouchDB</p>
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
          <input type="submit" @click.stop.prevent="$store.dispatch('setupSync', {url: $refs.dbUrl.value, username: $refs.dbUsername.value, password: $refs.dbPassword.value })" value="Setup sync">
        </form>
      </modal>

      <button @click.prevent="$modal.show('import')">Import entries…</button>
      <modal name="import">
        <a href="" class="right floated" @click.prevent="$modal.hide('import')">Close</a>
        <form>
          <p>Import entries from a JSON file exported from another Tempo session.</p>
          <input type="file" name="import" accept=".json,application/json" @change="toImport = $event.target.files[0]">
          <hr>
          <input :disabled="!toImport" type="submit" @click.stop.prevent="importEntries" value="Import">
          <p v-if="importedEntries > 0">Imported {{ importedEntries }} entries!</p>
          <p v-if="failedEntries > 0">Skipped {{ failedEntries }} existing entries.</p>
        </form>
      </modal>
      <button @click.prevent="$modal.show('theme')">Theming…</button>
      <modal name="theme" height="auto">
        <a href="" class="right floated" @click.prevent="$modal.hide('theme')">Close</a>
          <p>Customize Tempo's look and feel</p>
          <theme-form></theme-form>
      </modal>
      <button @click="deleteConfirm">Delete my data…</button>
    </aside>
    <section>
      <h2>
        How does it work?
      </h2>
      <p>
        Use Tempo as you would use a personnal log. Write notes when you feel like it, and use hashtags and moodtags to indicate how you feel.
      </p>
      <h2>
        Where is the data stored?
      </h2>
      <p>The data never leaves your browser. Future versions may allow optional syncing with other devices.</p>
      <h2>
        Hashtags
      </h2>
      <p>
        While entirely optional, hashtags and moodtags can help you categorize your notes and track your moods. Here is a sample note using hashtags:
      </p>
      <blockquote>
        Had a great day at <a href="">#work!</a>
      </blockquote>
      <p>Hashtags can help you to categorize your notes and search them later.</p>
      <h2>
        Moodtags
      </h2>
      <p>Moodtags work similarly, but allow you to associate a mood with a given word. For instance:</p>
      <blockquote>
        Stephanie and I had an argument. I feel <a href="">-angry</a> and <a href="">-confused</a>…
      </blockquote>
      <p>
        By using the <code>-</code> tag, you indicate to Tempo that <code>angry</code> and <code>confused</code> are negative feelings. Similarly, you could use the <code>+</code> tag in front of a word to indicate a positive feeling.
      </p>
      <p>
        When present, <code>-</code> and <code>+</code> tags are used to compute the mood score of each note. This score is then used in the daily mood widget to track your moods over time.
      </p>
      <p>
        Each occurence of <code>-</code> and <code>+</code> in a note will decrease or increase the mood score by 1.
      </p>
      <p>
        There are a couple additional tags you can use, that don't affect the mood score, but can be useful regardless:
      </p>
      <ul>
        <li><code>~</code>: indicate mixed feelings</li>
        <li><code>?</code>: indicate you don't know how you feel</li>
      </ul>
      <p>
        You can freely mix any and all these tags in the same note, and use different moodtags with the same words. For instance:
      </p>
      <blockquote>
        I hate insomnia, I'm feeling so <a href="">-tired</a>…
      </blockquote>
      <blockquote>
        Had a good sport session this morning, I'm <a href="">+tired</a> but happy.
      </blockquote>
      <h2>
        Filtering notes
      </h2>
      <p>
        The search bar let you filter notes that match your query. The daily mood widget is also updated accordingly. You can find some basic queries below:
      </p>
      <table>
        <tr>
          <td>
            <code>sport</code>
          </td>
          <td>
            Find all the entries containing the word "sport"
          </td>
        </tr>
        <tr>
          <td>
            <code>#sport</code>
          </td>
          <td>
            Find all the entries tagged with #sport
          </td>
        </tr>
        <tr>
          <td>
            <code>-sport</code>
          </td>
          <td>
            Find all the entries tagged with -sport
          </td>
        </tr>
        <tr>
          <td>
            <code>@2020-09-17</code>
          </td>
          <td>
            Find all the entries submitted on 2020-09-17
          </td>
        </tr>
        <tr>
          <td>
            <code>@2020</code>
          </td>
          <td>
            Find all the entries submitted during 2020
          </td>
        </tr>
        <tr>
          <td>
            <code>@2020-08</code>
          </td>
          <td>
            Find all the entries submitted during 2020-08
          </td>
        </tr>
        <tr>
          <td>
            <code>+</code>
          </td>
          <td>
            Find all entries with a positive moodtag (also works with <code>-</code>, <code>?</code> and <code>~</code>)
          </td>
        </tr>
      </table>
      <p>
        You can mix various parameters to further refine your results. Here are some more advanced queries:
      </p>
      <table>
        <tr>
          <td>
            <code>+ @2020-09</code>
          </td>
          <td>
            Find all positive entries submitted during 2020-09
          </td>
        </tr>
        <tr>
          <td>
            <code>- #sleep</code>
          </td>
          <td>
            Find all negative entries also tagged with #sleep
          </td>
        </tr>
      </table>
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
      console.log(result)
      this.importedEntries = result.filter((e) => {
        return e.ok
      }).length
      this.failedEntries = result.filter((e) => {
        return !e.ok
      }).length
      console.log(this.importedEntries, this.failedEntries)


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

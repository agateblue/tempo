<template>
  <div id="app">
    <v-app id="tempo" :dark="$store.state.dark">

      <v-app-bar
        app
        :dark="$store.state.dark">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>Topics</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn to="/">
          Tempo
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn icon to="/new">
          <v-icon>{{ $icons.mdiPencil }}</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>{{ $icons.mdiMagnify }}</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>{{ $icons.mdiDotsVertical }}</v-icon>
        </v-btn>
      </v-app-bar>
      <v-navigation-drawer
        v-model="drawer"
        app
      >
      </v-navigation-drawer>
      <v-content>
        <v-container fluid>
          <router-view></router-view>
        </v-container>
      </v-content>

      <v-footer app>
      </v-footer>

    </v-app>
  </div>
</template>
<script>
export default {
  data () {
    return {
      drawer: null,
    }
  },
  watch: {
    "$store.state.theme": {
      handler (theme) {
        let style = document.documentElement.style
        this.$store.state.cssVars.forEach(v => {
          style.setProperty(`--${v.id}`, theme[v.id] || v.default)
        })
      },
      deep: true,
      immediate: true,
    },
    "$store.state.lastSync": {
      async handler () {
        console.log('Loading theme…')
        let t
        try {
          t = await this.$store.state.db.get('theme')
        } catch (e) {
          console.log('No theme found')
          return
        }
        if (t && t.theme) {
          await this.$store.dispatch('setTheme', t.theme)
        }
      },
      immediate: true,
    }
  }
}
</script>
<style>
:root {
  --border-color:rgba(125, 125, 125, 0.2);
  --border: 1px solid var(--border-color);
  --border-radius: 3px;
  --box-shadow: 0px 0px 4px rgba(66, 66, 66, 0.5);
  --single-column-width: 550px;
}
* {
  box-sizing: border-box;
}
body {
  color: var(--main-text-color);
  font-size: 110%;
  line-height: 1.5;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.v-application--wrap {
  background: ;: var(--main-bg);
  background-size: cover;
  background-repeat: no-repeat;
}
body .v--modal {
  background-color: var(--modal-bg);
  padding: 1em;
}
a {
  color: var(--accent-color);
}

button, input[type="submit"] {
  background-color: var(--accent-color);
  color: var(--text-color);
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
  margin-right: 0.5em;
  margin-bottom: 0.5em;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

button:hover, input[type="submit"]:hover, button:focus, input[type="submit"]:focus {
  opacity: 0.8;
}
button.secondary, input[type="submit"].secondary {
  border: 1px solid var(--main-text-color);
  background-color: transparent;
  color: var(--main-text-color);
  box-shadow: none;
}

main {
  margin: 0 auto;
}
main.single-column {
  max-width: var(--single-column-width);
}
@media screen and (min-width: 700px) {
  main:not(.single-column) {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    max-width: 1000px;
  }
  main > aside {
    justify-content: center;
    max-width: 400px;
    margin-right: 2em;
  }

  .theme-var {
    display: inline-block;
    width: 48%;
  }
  .theme-var:nth-child(odd) {
    margin-right: 2%;
  }
  .theme-var input[type="text"] {
    display: inline-block;
    width: 80%;
  }
}
@media screen and (max-width: 700px) {
  .v--modal-box {
    left: 2.5vw !important;
    right: 2.5vw !important;
    width: 95vw !important;
  }
}
.v--modal-box {
  max-height: 90vh !important;
  top: 5vh !important;
  overflow-y: auto !important;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}
main > aside {
  flex-grow: 1;
}
main > section {
  flex-grow: 2;
  max-width: var(--single-column-width);
}

input[type="text"],
textarea,
select,
input[type="url"],
input[type="password"],
input[type="date"],
input[type="time"] {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background-color: var(--secondary-bg-color);
  color: var(--main-text-color);
  border-radius: var(--border-radius);
  font-size: 110%;
  padding: 0.25em;
  border: var(--border);
  opacity: 0.7;
}
input[type="text"],
textarea,
input[type="url"],
input[type="password"],
input[type="date"],
input[type="time"] {
  margin-bottom: 1em;
}
input[type="text"], textarea, input[type="url"], input[type="password"] {
  width: 100%;
  max-width: 100%;
}

input.compact {
  margin: 0;
}
.wrapper {
  position: relative;
}
.clearing.link {
  text-decoration: none;
  cursor: pointer;
  font-size: 1.2em;
  position: absolute;
  right: 0.5em;
  top: 0.1em;
  margin-right: 0 !important;
}
input[type="text"]:focus, textarea:focus, input[type="url"]:focus, input[type="password"]:focus, select:focus {
  opacity: 1;
  border: 1px solid var(--accent-color);
}
label {
  display: block;
}
.inline, input[type="text"].inline {
  display: inline-block;
  width: auto;
}
label.inline {
  margin-right: 0.5em;
}
.inline.field {
  display: inline-block;
  margin-right: 0.5em;
}
textarea {
  display: block;
  padding: 0.5em;
}
blockquote {
  background-color: var(--secondary-bg-color);
  padding: 1em;
  margin: 0;
}
pre {
  background-color: var(--secondary-bg-color);
  padding: 0.5em;
}
article {
  margin-bottom: 2em;
  padding: 1em;
  background-color: var(--secondary-bg-color);
}
ul, ol {
  padding-left: 1em;
}
.content > :first-child {
  margin-top: 0;
}
article footer {
  display: flex;
  font-size: 80%;
  justify-content: space-between;
  align-items: center;
  clear: both;
  margin-top: 1em;
}
time {
  font-style: italic;
}
label {
  margin-bottom: 1em;
}
.link {
  padding: 0;
  background: transparent;
  border: none;
  text-decoration: underline;
  color: var(--main-text-color);
}
a:hover, .link:hover {
  text-decoration: none;
}
.widget, form {
  clear: both;
  overflow: hidden;
}
.hidden {
  display: none;
}
.widget {
  background: var(--content-bg);
  padding: 1em;
  margin-bottom: 2em;
}
.widget.attached {
  margin-bottom: 0;
  border-bottom: var(--border);
}
.widget {
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
}
.widget.attached + .widget {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.widget:not(.attached), .widget:last-child {
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  border-bottom: none;
}
.controls.widget {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.entry-content *:first-child {
  margin-top: 0;
}

.entry-content *:last-child {
  margin-bottom: 0;
}
.right.floated {
  float: right;
  margin-right: 0;
}
h1:first-child, h2:first-child, h3:first-child {
  margin-top: 0;
}
h1, h2 {
  margin: 0.5em 0;
}

hr {
  border: none;
  display: block;
  padding: 0.5em 0;
}
.center.aligned {
  text-align: center;
}
.color-preview {
  display: inline-block;
  width: 2em;
  height: 2em;
  margin-left: 1em;
  border: 1px solid rgba(0, 0, 0, 0.5);
}
.theme-var .field {
  display: flex;
  justify-content: space-between;
  vertical-align: center;
}
form.inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
form.inline > * {
  margin-bottom: 0;
}
form.inline > *:not(:last-child) {
  margin-right: 1em;
}
form input[type="submit"] {
  margin-bottom: 0;
}
svg {
  margin: 0 auto;
}
h3 span.right.floated {
  font-size: 0.7em;
  font-weight: normal;
}
table, thead, tbody {
  width: 100%;
  text-align: left;
  border-collapse: collapse;
}
table {
  margin-bottom: 1em;
}
td, th {
  border: var(--border);
  padding: 0.5em;
}
.line-vertical {
  display: none;
}
.line-horizontal {
  stroke: var(--border-color) !important;
}
.chart .chart-container .axis, .chart .chart-container .chart-label, .chart .chart-container .title {
  fill: var(--main-text-color);
}
.row {
  display: flex;
}
.row > .column {
  flex-grow: 1;
}
</style>

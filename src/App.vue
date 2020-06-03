<template>
  <div id="app">
    <v-app id="tempo" :class="$store.state.dark ? 'theme--dark' : 'theme--light'" :dark="$store.state.dark">
      <v-navigation-drawer clipped left v-model="drawer" app :dark="$store.state.dark">
        <div class="vertical row">
          <div class="grow" v-if="$store.state.couchDbUrl">
            <v-list dense>
              <v-list-item-group>
                <v-list-item to="/">
                  <v-list-item-icon>
                    <v-icon v-text="$icons.mdiHome"></v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>All entries</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </div>
          <div v-if="$store.state.couchDbUrl">
            <v-btn
            text
              class="ma-4 mr-4"
              :loading="isSyncing"
              :disabled="isSyncing"
              @click.stop.prevent="forceSync"
            >
              <v-icon left>{{ $icons.mdiSync }}</v-icon>
              Sync now
              <template v-slot:loader>
                <span>Loading...</span>
              </template>
            </v-btn>
            <p v-if="!isSyncing && syncError">
              Sync error:
              <span v-if="syncError.name">{{ syncError.name }}</span>
              <span v-else>Unknown</span>
            </p>
          </div>
          <div>
            <v-list dense>
              <v-list-item-group>
                <v-list-item to="/settings">
                  <v-list-item-icon>
                    <v-icon v-text="$icons.mdiCog"></v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Settings</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item to="/about">
                  <v-list-item-icon>
                    <v-icon v-text="$icons.mdiHelpCircleOutline"></v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Help</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </div>
        </div>
      </v-navigation-drawer>
      <v-app-bar clipped-left app :dark="$store.state.dark">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>
          Tempo
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="searchQuery"
          solo
          flat
          clearable
          hide-details
          ref="search"
          label="Search"
          :append-outer-icon="$icons.mdiMagnify"
          @click:append-outer="
            $router.push({ path: '/', query: { q: searchQuery } })
          "
          @keydown.enter="
            $router.push({ path: '/', query: { q: searchQuery } })
          "
          @click:clear="$router.push({ path: '/', query: { q: '' } })"
        ></v-text-field>
      </v-app-bar>
      <v-content :dark="$store.state.dark">
        <v-container :dark="$store.state.dark" fluid tag="main">
          <router-view></router-view>
        </v-container>
      </v-content>
    </v-app>
  </div>
</template>
<script>
export default {
  data() {
    return {
      drawer: null,
      isSyncing: false,
      syncError: null,
      searchQuery: "",
    };
  },
  created() {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (this.$store.state.serviceWorker.refreshing) return;
        this.$store.commit("serviceWorker", {
          refreshing: true,
        });
        window.location.reload();
      });
    }
  },
  mounted() {
    let self = this;
    // we have some internal links in rendered markdown but cannot use rotueur link there, so when a
    // click is made on a link ith the appropriate class, we push via the router
    window.onclick = function(e) {
      var className = "internal-link"; // any css selector for children
      if (e.target.localName == "a" && e.target.classList.contains(className)) {
        e.preventDefault();
        self.searchQuery = e.target.getAttribute("data-query");
        self.$router.push({
          path: "/",
          query: { q: e.target.getAttribute("data-query") },
        });
      }
    };
  },
  methods: {
    async forceSync() {
      this.isSyncing = true;
      this.syncError = null;
      try {
        await this.$store.dispatch("forceSync");
      } catch (e) {
        this.syncError = e;
      }
      if (!this.syncError) {
        this.syncError = false;
      }
      this.isSyncing = false;
      setTimeout(() => {
        this.syncError = null;
      }, 3000);
    },
    updateApp() {
      this.$store.commit("serviceWorker", { updateAvailable: false });
      if (
        !this.$store.state.serviceWorker.registration ||
        !this.$store.state.serviceWorker.registration.waiting
      ) {
        return;
      }
      this.$store.state.serviceWorker.registration.waiting.postMessage({
        command: "skipWaiting",
      });
    },
  },
  watch: {
    "$router.currentRoute.query": {
      handler(v) {
        this.searchQuery = v.q;
      },
      immediate: true,
      deep: true,
    },
    "$store.state.theme": {
      handler(theme) {
        let style = document.documentElement.style;
        this.$store.state.cssVars.forEach((v) => {
          style.setProperty(`--${v.id}`, theme[v.id] || v.default);
        });
      },
      deep: true,
      immediate: true,
    },
    "$store.state.lastSync": {
      async handler() {
        console.log("Loading theme…");
        let t;
        try {
          t = await this.$store.state.db.get("theme");
        } catch (e) {
          console.log("No theme found");
          return;
        }
        if (t && t.theme) {
          await this.$store.dispatch("setTheme", t.theme);
        }
      },
      immediate: true,
    },
  },
};
</script>
<style lang="scss">
@import "~frappe-charts/src/css/charts.scss";
$roboto-font-path: "~roboto-fontface/fonts";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-black-italic.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-black.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-bold-italic.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-bold.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-light-italic.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-light.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-medium-italic.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-medium.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-regular-italic.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-regular.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-thin-italic.scss";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-thin.scss";

:root {
  --border-color: rgba(125, 125, 125, 0.2);
  --border: 1px solid var(--border-color);
  --border-radius: 3px;
  --box-shadow: 0px 0px 4px rgba(66, 66, 66, 0.5);
  --single-column-width: 550px;
  --top-bar-height: 60px;
}
.container.narrow {
  max-width: var(--single-column-width);
}
section.v-card {
  max-width: var(--single-column-width) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.v-footer .v-textarea .v-text-field__details {
  display: none;
}
.v-card.fixed-secondary {
  position: fixed;
  top: 60px;
  right: 5px;
}
@media screen and (min-width: 700px) {

  .v-card.fixed-secondary {
    top: 100px;
    right: 25px;
  }
}
.v-timeline-item:last-child {
  margin-bottom: 24px;
}
// a {
//   color: var(--accent-color);
// }

// .v-timeline {
//   background: var(--content-bg);
// }
// button,
// input[type="submit"] {
//   background-color: var(--accent-color);
//   color: var(--text-color);
//   border: none;
//   padding: 0.5em 1em;
//   cursor: pointer;
//   margin-right: 0.5em;
//   margin-bottom: 0.5em;
//   border-radius: var(--border-radius);
//   box-shadow: var(--box-shadow);
// }

// button:hover,
// input[type="submit"]:hover,
// button:focus,
// input[type="submit"]:focus {
//   opacity: 0.8;
// }
// button.secondary,
// input[type="submit"].secondary {
//   border: 1px solid var(--main-text-color);
//   background-color: transparent;
//   color: var(--main-text-color);
//   box-shadow: none;
// }

// main {
//   margin: 0 auto;
// }
// main.single-column {
//   max-width: var(--single-column-width);
// }
// @media screen and (min-width: 700px) {
//   main:not(.single-column) {
//     display: flex;
//     align-items: flex-start;
//     justify-content: center;
//     max-width: 1000px;
//   }
//   main > aside {
//     justify-content: center;
//     max-width: 400px;
//     margin-right: 2em;
//   }

//   .theme-var {
//     display: inline-block;
//     width: 48%;
//   }
//   .theme-var:nth-child(odd) {
//     margin-right: 2%;
//   }
//   .theme-var input[type="text"] {
//     display: inline-block;
//     width: 80%;
//   }
// }
// @media screen and (max-width: 700px) {
//   .v--modal-box {
//     left: 2.5vw !important;
//     right: 2.5vw !important;
//     width: 95vw !important;
//   }
// }
// .v--modal-box {
//   max-height: 90vh !important;
//   top: 5vh !important;
//   overflow-y: auto !important;
//   border-radius: var(--border-radius);
//   box-shadow: var(--box-shadow);
// }
// main > aside {
//   flex-grow: 1;
// }
// main > section {
//   flex-grow: 2;
//   max-width: var(--single-column-width);
// }

// input[type="text"],
// textarea,
// select,
// input[type="url"],
// input[type="password"],
// input[type="date"],
// input[type="time"] {
//   font-family: Avenir, Helvetica, Arial, sans-serif;
//   background-color: var(--secondary-bg-color);
//   color: var(--main-text-color);
//   border-radius: var(--border-radius);
//   font-size: 110%;
//   padding: 0.25em;
//   border: var(--border);
//   opacity: 0.7;
// }
// input[type="text"],
// textarea,
// input[type="url"],
// input[type="password"],
// input[type="date"],
// input[type="time"] {
//   margin-bottom: 1em;
// }
// input[type="text"],
// textarea,
// input[type="url"],
// input[type="password"] {
//   width: 100%;
//   max-width: 100%;
// }

// input.compact {
//   margin: 0;
// }
// .wrapper {
//   position: relative;
// }
// .clearing.link {
//   text-decoration: none;
//   cursor: pointer;
//   font-size: 1.2em;
//   position: absolute;
//   right: 0.5em;
//   top: 0.1em;
//   margin-right: 0 !important;
// }
// input[type="text"]:focus,
// textarea:focus,
// input[type="url"]:focus,
// input[type="password"]:focus,
// select:focus {
//   opacity: 1;
//   border: 1px solid var(--accent-color);
// }
// label {
//   display: block;
// }
// .inline,
// input[type="text"].inline {
//   display: inline-block;
//   width: auto;
// }
// label.inline {
//   margin-right: 0.5em;
// }
// .inline.field {
//   display: inline-block;
//   margin-right: 0.5em;
// }
// textarea {
//   display: block;
//   padding: 0.5em;
// }
// blockquote {
//   background-color: var(--secondary-bg-color);
//   padding: 1em;
//   margin: 0;
// }
// pre {
//   background-color: var(--secondary-bg-color);
//   padding: 0.5em;
// }
// article {
//   margin-bottom: 2em;
//   padding: 1em;
//   background-color: var(--secondary-bg-color);
// }
// ul,
// ol {
//   padding-left: 1em;
// }
// .content > :first-child {
//   margin-top: 0;
// }
// article footer {
//   display: flex;
//   font-size: 80%;
//   justify-content: space-between;
//   align-items: center;
//   clear: both;
//   margin-top: 1em;
// }
// time {
//   font-style: italic;
// }
// label {
//   margin-bottom: 1em;
// }
// .link {
//   padding: 0;
//   background: transparent;
//   border: none;
//   text-decoration: underline;
//   color: var(--main-text-color);
// }
// a:hover,
// .link:hover {
//   text-decoration: none;
// }
// .widget,
// form {
//   clear: both;
//   overflow: hidden;
// }
// .hidden {
//   display: none;
// }
// .widget {
//   background: var(--content-bg);
//   padding: 1em;
//   margin-bottom: 2em;
// }
// .widget.attached {
//   margin-bottom: 0;
//   border-bottom: var(--border);
// }
// .widget {
//   border-top-left-radius: var(--border-radius);
//   border-top-right-radius: var(--border-radius);
// }
// .widget.attached + .widget {
//   border-top-left-radius: 0;
//   border-top-right-radius: 0;
// }
// .widget:not(.attached),
// .widget:last-child {
//   border-bottom-left-radius: var(--border-radius);
//   border-bottom-right-radius: var(--border-radius);
//   border-bottom: none;
// }
// .controls.widget {
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
// }
// .entry-content *:first-child {
//   margin-top: 0;
// }

// .entry-content *:last-child {
//   margin-bottom: 0;
// }
// .right.floated {
//   float: right;
//   margin-right: 0;
// }
// h1:first-child,
// h2:first-child,
// h3:first-child {
//   margin-top: 0;
// }
// h1,
// h2 {
//   margin: 0.5em 0;
// }

// hr {
//   border: none;
//   display: block;
//   padding: 0.5em 0;
// }
// .center.aligned {
//   text-align: center;
// }
// .color-preview {
//   display: inline-block;
//   width: 2em;
//   height: 2em;
//   margin-left: 1em;
//   border: 1px solid rgba(0, 0, 0, 0.5);
// }
// .theme-var .field {
//   display: flex;
//   justify-content: space-between;
//   vertical-align: center;
// }
// form.inline {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// }
// form.inline > * {
//   margin-bottom: 0;
// }
// form.inline > *:not(:last-child) {
//   margin-right: 1em;
// }
// form input[type="submit"] {
//   margin-bottom: 0;
// }
// svg {
//   margin: 0 auto;
// }
// h3 span.right.floated {
//   font-size: 0.7em;
//   font-weight: normal;
// }
// table,
// thead,
// tbody {
//   width: 100%;
//   text-align: left;
//   border-collapse: collapse;
// }
// table {
//   margin-bottom: 1em;
// }
// td,
// th {
//   border: var(--border);
//   padding: 0.5em;
// }
.line-vertical {
  display: none;
}
.line-horizontal {
  stroke: var(--border-color) !important;
}
.chart .chart-container .axis,
.chart .chart-container .chart-label,
.chart .chart-container .title {
  fill: var(--main-text-color);
}
.row {
  display: flex;
}
.vertical.row {
  display: flex;
  flex-direction: column;
  justify-content: align-items;
  height: 100%;
  > * {
    padding: 12px;
  }
}
.row > .column {
  flex-grow: 1;
}
.grow {
  flex-grow: 1;
}
.block {
  display: block;
}
</style>

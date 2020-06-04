<template>
  <div id="app">
    <v-app id="tempo" dark>
      <v-navigation-drawer clipped left v-model="drawer" app :color="$theme.drawer.color">
        <div class="vertical row">
          <div class="grow">
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
            <template v-if="$router.currentRoute.path === '/' && $refs.view && $refs.view.entries">
              <v-divider></v-divider>
              <v-list :color="$theme.menu.color"  dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{ $refs.view.entries.length }} entries</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-divider></v-divider>
              <v-list :color="$theme.menu.color" dense>
                <v-list-item
                  v-for="row in [{id: 'timeline', label: 'Timeline', icon: 'mdiFormatListBulleted'}, {id: 'visualization', label: 'Charts', icon: 'mdiChartTimelineVariant'}]"
                  :key="row.id"
                  @click="$refs.view.selectTab(row.id)"
                  :class="[{'v-list-item--active': $refs.view.tab === row.id}]">
                  <v-list-item-icon>
                    <v-icon>{{ $icons[row.icon] }}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ row.label }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <template v-if="$refs.view.tab === 'timeline'">
                <v-divider></v-divider>
                <v-list :color="$theme.menu.color" dense>
                  <v-list-item>
                    <v-list-item-action>
                      <v-switch v-model="$refs.view.sortDesc" :color="$theme.switch.color"></v-switch>
                    </v-list-item-action>
                    <v-list-item-title>Newest first</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click.stop="exportDialog = true">
                    <v-list-item-icon>
                      <v-icon>{{ $icons.mdiDownload }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Export...</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>

                <v-dialog

                  v-model="exportDialog"
                  max-width="700"
                >
                  <v-card :color="$theme.card.color">
                    <v-card-title class="headline">Export your entries</v-card-title>

                    <v-card-text>
                      <p>Export the selected {{ $refs.view.entries.length }} entries. Use JSON format if you want to reimport them in Tempo, or Markdown for a more text-based format that can be opened and read by text editors.</p>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>

                      <v-btn
                        color="secondary"
                        text
                        @click="exportDialog = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn color="primary" @click="$refs.view.downloadMarkdown">Export as Markdown</v-btn>
                      <v-btn color="primary" @click="$refs.view.downloadJSON">Export as JSON</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </template>
              <template v-if="$refs.view.tab === 'visualization'">
                <v-divider></v-divider>
                <v-list :color="$theme.menu.color" dense>
                  <v-list-item>
                    <v-list-item-action>
                      <v-text-field v-model="$refs.view.graphDays" type="number" step="1" label="days"></v-text-field>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </template>
            </template>
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
      <v-app-bar clipped-left app :color="$theme.appBar.color">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>
          Tempo
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="searchQuery"
          :background-color="$theme.input.color"
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
      <v-content >
        <v-container  fluid tag="main">
          <router-view ref="view"></router-view>
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
      exportDialog: false,
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
  --application-background: var(--v-secondary-darken1);
}
.theme--dark.v-application {
  background: var(--application-background) !important;
}
.container.narrow {
  max-width: var(--single-column-width);
}
section.v-card {
  max-width: var(--single-column-width) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.v-timeline-item:last-child {
  margin-bottom: 42px;
}
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
.rendered-markdown > *:last-child {
  margin-bottom: 0;
}
.v-timeline-item__body .date-entry.v-card {
  &::before, &::after {
    border-right: none !important;
    left: 0 !important;
  }
}
.v-application pre > code {
  display: block;
  padding: 12px;
  &::before, &::after {
    content: none;
  }
}
#composer {
  max-height: 30vh;
  overflow-y: auto;
}
</style>

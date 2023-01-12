<template>
  <v-app id="tempo" dark>
    <v-app-bar
      app
      dense
      :color="$theme.appBar.color">
      <v-spacer></v-spacer>
      <v-toolbar-title @click="$router.push('/')" class="mr-4" style="cursor: pointer">
        Tempo
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-btn
        :loading="$store.state.sync.loading"
        small
        icon
        @click.stop.prevent="$store.dispatch('forceSync', {updateLastSync: true})"
        v-if="$store.state.couchDbUrl"
        title="Sync"
      >
        <span v-if="!$store.state.sync.loading && $store.state.sync.error">
          Sync error:
          <span v-if="$store.state.sync.error.name">{{ $store.state.sync.error.name }}</span>
          <span v-else>Unknown</span>
        </span>
        <v-icon :icon="$icons.mdiSync"></v-icon>
        <template v-slot:loader>
          <span>Syncing…</span>
        </template>
      </v-btn>
      <v-btn small icon class="ml-3" to="/about" title="About">
        <v-icon :icon="$icons.mdiHelpCircleOutline"></v-icon>
      </v-btn>
      <v-btn small icon to="/settings" title="Settings" class="ml-3">
        <v-icon :icon="$icons.mdiCog"></v-icon>
      </v-btn>
      <v-spacer></v-spacer>

    </v-app-bar>
    <v-main>
      <v-container fluid tag="main" style="padding-bottom: 64px">
        <router-view ref="view"></router-view>
      </v-container>
    </v-main>
    <v-bottom-navigation fixed>
      <v-spacer></v-spacer>
      <v-btn
        :style="bottomNavBarButtonStyle"
        exact
        :to="{path: '/diary', query: {q: $store.state.searchQuery}}">
        <span>Diary</span>
        <v-icon :icon="$icons.mdiBook"></v-icon>
      </v-btn>
      <v-btn
        :style="bottomNavBarButtonStyle"
        exact
        :to="{path: '/diary/calendar', query: {q: $store.state.searchQuery}}">
        <span>Calendar</span>
        <v-icon :icon="$icons.mdiCalendar"></v-icon>
      </v-btn>
      <v-btn
        :style="bottomNavBarButtonStyle"
        exact
        :to="{path: '/diary/visualization', query: {q: $store.state.searchQuery}}">
        <span>Data</span>
        <v-icon :icon="$icons.mdiChartTimelineVariant"></v-icon>
      </v-btn>
      <v-btn
        :style="bottomNavBarButtonStyle"
        exact
        to="/tasks">
        <span>Tasks</span>

        <v-icon :icon="$icons.mdiCheck"></v-icon>
      </v-btn>
      <v-spacer></v-spacer>
    </v-bottom-navigation>
  </v-app>
</template>
<script>
export default {
  data() {
    return {
      drawer: null,
      exportDialog: false,
    };
  },
  async created() {
    this.$store.dispatch('loadSettings')
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
    // we have some internal links in rendered markdown but cannot use router link there, so when a
    // click is made on a link ith the appropriate class, we push via the router
    window.onclick = function(e) {
      var className = "internal-link"; // any css selector for children
      if (e.target.localName == "a" && e.target.classList.contains(className)) {
        e.preventDefault();
        self.$store.commit('searchQuery', e.target.getAttribute("data-query"))
      }
    };
  },
  computed: {
    bottomNavBarButtonStyle () {
      // until https://github.com/vuetifyjs/vuetify/issues/7933 is fixed
      return 'height: 56px; background: transparent;'
    }
  },
  methods: {
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

    scrollToTop() {
      window.scrollTo(0,0);
    },
  },
  watch: {
    "$store.state.searchQuery": {
      handler (v) {
        this.searchQuery = v
        this.$router.push({ path: this.$route.path, query: {...this.$route.query, q: v}})
      }
    }
  },
};
</script>
<style lang="scss">
@import "~frappe-charts/src/css/charts.scss";
$roboto-font-path: "~roboto-fontface/fonts";
@import "~roboto-fontface/css/roboto/sass/roboto-fontface-regular.scss";

:root {
  --border-color: rgba(125, 125, 125, 0.2);
  --border: 1px solid var(--border-color);
  --border-radius: 3px;
  --box-shadow: 0px 0px 4px rgba(66, 66, 66, 0.5);
  --single-column-width: 600px;
  --top-bar-height: 60px;
  --application-background: var(--v-secondary-darken1);
  --main-text-color: rgba(255, 255, 255, 0.904);
  --content-bg: rgb(26, 23, 38);
  --secondary-bg-color: rgb(43, 30, 39);
  --accent-color: rgb(253, 186, 146);
}
html {
  scroll-behavior: smooth;
}
.theme--dark.v-application {
  background: var(--application-background) !important;
}
.v-container.narrow {
  max-width: var(--single-column-width);
}
section.v-card, .section.v-card {
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
.chart-container .dataset-units circle {
  stroke-width: 0;
  r: 0.2em;
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
.rendered-markdown {
  font-size: 110%;
  line-height: 1.5;
}
.rendered-markdown > * {
  margin-bottom: 21px;
}
.rendered-markdown > ul > li:not(:last-child) {
  margin-bottom: 6px;
}
.rendered-markdown > *:last-child {
  margin-bottom: 0;
}
.v-application--is-ltr .v-timeline--dense:not(.v-timeline--reverse)::before {
  left: 0 !important;
  right: initial !important;
}
.v-application pre > code {
  display: block;
  padding: 12px;
  &::before, &::after {
    content: none;
  }
}
#composer {
  max-height: 600px;
  overflow-y: auto;
}

.board {
  display: flex;
  overflow-x: auto;
  .task-list.expanded {
    min-height: 75vh;
    width: 80vw;
    max-width: 250px; 
    min-width: 250px; 
  }
  .task-list.collapsed {
    position: relative;
    width: 3em;
    .row {
      position: absolute;
      left: -8.8em;
      top:  7.6em;
      width: 20em;
      height: 5em;
      transform: rotate(90deg);
      transform-origin: center;
    }
  }
  .list-group {
    min-height: 75vh;
  }
  .task-checkbox {
    .v-input__slot {
      margin-bottom: 0;
    }
    .v-messages {
      display: none;
    }
  }
}
.v-align {
  align-items: center;
}
.v-input.search {
  max-width: 200px;
}
.v-slide-group__next, .v-slide-group__prev {
  min-width: auto !important;
}

.v-expansion-panel-text__wrap {
  padding: 0 !important;
}
.v-expansion-panel-header {
  padding: 0 !important;
}
.v-expansion-panel-header::before {
  background-color: transparent !important;
}
</style>

<template>
  <div id="app">
    <h1 class="center aligned">
      <router-link :to="{name: 'Home'}">Tempo</router-link>
    </h1>
    <router-view/>
  </div>
</template>
<script>
export default {
  data () {
    return {
      cssVars: [
        {
          id: "main-bg",
          value: null,
          // default: '#422D62',
          default: '#422D62',
          label: 'Background color or image (CSS supported)',
        },
        {
          id: "main-text-color",
          value: null,
          default: 'rgba(255, 255, 255, 0.904)',
          label: 'Text color',
        },
        {
          id: "content-bg",
          value: null,
          default: 'transparent',
          label: 'Background color for sidebar and main content',
        },
        {
          id: "secondary-bg-color",
          value: null,
          default: 'rgba(255, 255, 255, 0.1)',
          label: 'Secondary background color (inputs, entries)',
        },
        {
          id: "very-negative-color",
          value: null,
          default: '#E35F75',
          label: 'Very negative mood color',
        },
        {
          id: "negative-color",
          value: null,
          default: '#F3BAC3',
          label: 'Negative mood color',
        },
        {
          id: "neutral-color",
          value: null,
          default: 'rgba(255, 255, 255, 0.1)',
          label: 'Neutral mood color',
        },
        {
          id: "positive-color",
          value: null,
          default: '#79C698',
          label: 'Positive mood color',
        },
        {
          id: "very-positive-color",
          value: null,
          default: '#398557',
          label: 'Very positive mood color',
        },
        {
          id: "graph-label-color",
          value: null,
          default: 'black',
          label: 'Mood widget text color',
        },
      ]
    }
  },
  created () {
    this.setDefaultVars()
  },
  methods: {
    setDefaultVars () {
      let style = getComputedStyle(document.documentElement)
      this.cssVars.forEach(v => {
        v.value = style.getPropertyValue(`--${v.id}`)
      })
    }
  },
  watch: {
    cssVars: {
      handler (vars) {
        let style = document.documentElement.style
        vars.forEach(v => {
          style.setProperty(`--${v.id}`, v.value || v.default)
        })
      },
      deep: true,
      immediate: true,
    }
  }
}
</script>
<style>
* {
  box-sizing: border-box;
}
body {
  background: var(--main-bg);
  background-repeat: no-repeat;
  background-size: cover;
  background-size: cover;
  color: var(--main-text-color);
  font-size: 110%;
  line-height: 1.5;
}
body .v--modal {
  background-color: var(--main-bg-color);
  padding: 1em;
}
a {
  color: var(--main-text-color);
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
main {
  margin: 0 auto;
}
@media screen and (min-width: 700px) {
  main {
    display: flex;
    justify-content: center;
    max-width: 1000px;
  }
  main > aside {
    justify-content: center;
    max-width: 400px;
    margin-right: 2em;
  }
}
main > * {
  padding: 2em;
}
main > aside {
  flex-grow: 1;
  background: var(--content-bg);
}
main > section {
  flex-grow: 2;
  background: var(--content-bg);
}

textarea {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding: 0.5em;
  display: block;
  width: 100%;
  border-radius: 5px;
  font-size: 110%;
}

input[type="text"], textarea, input[type="url"], input[type="password"] {
  width: 100%;
  margin-bottom: 1em;
  background-color: var(--secondary-bg-color);
  color: var(--main-text-color);
  border-radius: 5px;
  font-size: 110%;
  padding: 0.25em;
}
blockquote {
  background-color: var(--secondary-bg-color);
  padding: 1em;
  margin: 0;
}
code {
  background-color: var(--secondary-bg-color);
  padding: 0 0.25em;
}
article {
  margin-bottom: 3em;
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
.widget, form {
  margin-bottom: 1em;
  clear: both;
  overflow: hidden;
}
.right.floated {
  float: right;
}
h1:first-child, h2:first-child, h3:first-child {
  margin-top: 0;
}

.cal-heatmap-container .q1 {
  fill: var(--very-negative-color) !important;
}
.cal-heatmap-container .q2 {
  fill: var(--negative-color) !important;
}
.cal-heatmap-container .q3 {
  fill: var(--main-text-color) !important;
}
.cal-heatmap-container .q4 {
  fill: var(--positive-color) !important;
}
.cal-heatmap-container .q5 {
  fill: var(--very-positive-color) !important;
}
.cal-heatmap-container .graph-label {
  font-size: 1em !important;
  font-weight: bold;
  fill: var(--neutral-color);
}

.cal-heatmap-container .subdomain-text {
  fill: var(--graph-label-color) !important;
  font-size: 0.8em !important;
}

.cal-heatmap-container .graph, .cal-heatmap-container .graph-legend rect {
  shape-rendering: auto !important;
}
.cal-heatmap-container rect.highlight-now {
    stroke: var(--graph-label-color) !important;
    shape-rendering: auto;
    stroke-width: 2;
}
hr {
  border: none;
  display: block;
  padding: 0.5em 0;
}
.center.aligned {
  text-align: center;
}
</style>

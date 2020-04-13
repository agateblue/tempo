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
    }
  }
}
</script>
<style>
:root {
  --border: 1px solid rgba(125, 125, 125, 0.2);
  --border-radius: 2px;
}
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
}

button:hover, input[type="submit"]:hover {
  translate: 1px;
  opacity: 0.8;
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
}
main > aside {
  flex-grow: 1;
}
main > section {
  flex-grow: 2;
  max-width: 500px;
}

input[type="text"], textarea, input[type="url"], input[type="password"] {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  width: 100%;
  margin-bottom: 1em;
  background-color: var(--secondary-bg-color);
  color: var(--main-text-color);
  border-radius: var(--border-radius);
  font-size: 110%;
  padding: 0.25em;
  border: var(--border);
  opacity: 0.7;
}
input[type="text"]:focus, textarea:focus, input[type="url"]:focus, input[type="password"]:focus {
  opacity: 1;
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
code {
  background-color: var(--secondary-bg-color);
  padding: 0 0.25em;
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
svg {
  margin: 0 auto;
}
h3 span.right.floated {
  font-size: 0.7em;
  font-weight: normal;
}
</style>

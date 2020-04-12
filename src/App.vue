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

}
</script>
<style>
:root {
  --main-bg-color: #422D62;
  --main-text-color: rgba(255, 255, 255, 0.904);
  --secondary-bg-color: rgba(255, 255, 255, 0.1);
  --very-negative-color: #E35F75;
  --negative-color: #F3BAC3;
  --neutral-color: rgba(255, 255, 255, 0.1);
  --positive-color: #79C698;
  --very-positive-color: #398557;
  --graph-label-color: black;
}

* {
  box-sizing: border-box;
}
body {
  background-color: var(--main-bg-color);
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
  }
}
main > * {
  padding: 2em;
}
main > aside {
  flex-grow: 1;
}
main > section {
  flex-grow: 2;
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

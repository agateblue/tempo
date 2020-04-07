<template>
  <div id="app">
    <h1 class="center aligned">
      <router-link :to="{name: 'Home'}">Tempo</router-link>
    </h1>
    <router-view/>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  background-color: #422D62;
  color: rgba(255, 255, 255, 0.904);
  font-size: 110%;
  line-height: 1.5;
}
body .v--modal {
  background-color: #422D62;
  padding: 1em;
}
a {
  color: rgba(255, 255, 255, 0.904);
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
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.904);
  border-radius: 5px;
  font-size: 110%;
  padding: 0.25em;
}
blockquote {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 1em;
  margin: 0;
}
code {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0 0.25em;
}
article {
  margin-bottom: 3em;
  padding: 1em;
  background-color: rgba(255, 255, 255, 0.1);
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
  color: rgba(255, 255, 255, 0.904);
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
  fill: #E35F75 !important;
}
.cal-heatmap-container .q2 {
  fill: #F3BAC3 !important;
}
.cal-heatmap-container .q3 {
  fill: rgba(255, 255, 255, 0.904) !important;
}
.cal-heatmap-container .q4 {
  fill: #79C698 !important;
}
.cal-heatmap-container .q5 {
  fill: #398557 !important;
}
.cal-heatmap-container .graph-label {
  font-size: 1em !important;
  font-weight: bold;
  fill: rgba(255, 255, 255, 0.904);
}

.cal-heatmap-container .subdomain-text {
  fill: black !important;
  font-size: 0.8em !important;
}

.cal-heatmap-container .graph, .cal-heatmap-container .graph-legend rect {
  shape-rendering: auto !important;
}
.cal-heatmap-container rect.highlight-now {
    stroke: black !important;
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

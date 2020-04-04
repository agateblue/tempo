<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  background-color: #422D62;
  color: hsl(0,0%,100%);
}
a {
  color: white;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
main {
  display: flex;
  max-width: 900px;
  margin: 0 auto;
  justify-content: center;
}
main > * {
  padding: 2em;
}
main > aside {
  flex-grow: 1;
  max-width: 400px;
}
main > section {
  flex-grow: 2;
}

textarea {
  padding: 0.5em;
  display: block;
  width: 100%;
  border-radius: 5px;
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
  color: white;
}
.widget, form {
  margin-bottom: 1em;
  clear: both;
  overflow: hidden;
}
input[type="text"], textarea {
  width: 100%;
  margin-bottom: 1em;
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
  fill: white !important;
}
.cal-heatmap-container .q4 {
  fill: #79C698 !important;
}
.cal-heatmap-container .q5 {
  fill: #398557 !important;
}
</style>

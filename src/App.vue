<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
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
</style>

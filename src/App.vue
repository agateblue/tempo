<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
    </div>
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
  margin: 0 auto;
  justify-content: center;
}
main > * {
  padding: 2em;
}
main > aside {
  min-width: 250px;
}

textarea {
  padding: 0.5em;
  display: block;
  width: 100%;
  border-radius: 5px;
}
</style>

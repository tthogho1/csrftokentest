<template>
  <div id="app-root">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
// Root component - routing is handled by vue-router
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app-root {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 16px;
}
</style>

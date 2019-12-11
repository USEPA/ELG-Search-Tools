<template>
  <div id="app">
    <div class="app-container">
      <main class="main-section section has-text-white">
        <div class="container">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

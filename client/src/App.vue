<template>
  <div id="app">
    <div class="app-container">
      <main class="main-section">
        <header class="header">
          <div class="container">
            <h1>Effluent Limitations Guidelines and Standards (ELG) Database</h1>
          </div>
        </header>
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

<style lang="scss" scoped>
@import '../static/variables';

.header {
  background-color: $darkBlue;
  color: #fff;
  padding: 2.5rem;
  text-align: center;

  h1 {
    font-size: 28px;
    color: #fff;
    padding-bottom: 0;
  }
}
</style>

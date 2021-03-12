<template>
  <div id="app">
    <div class="app-container">
      <main class="main-section">
        <header class="header">
          <div class="container">
            <h1>Effluent Limitations Guidelines and Standards (ELG) Database</h1>
            <div class="help-links">
              <a href="#" class="has-text-weight-bold">
                <span class="fas fa-book"></span>
                Glossary
              </a>
              <a href="#" class="has-text-weight-bold">
                <span class="fas fa-question-circle"></span>
                Help
              </a>
            </div>
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
  position: relative;
  background-color: $darkBlue;
  color: #fff;
  padding: 3rem 0;
  text-align: center;

  h1 {
    font-size: 28px;
    color: #fff;
    padding-bottom: 0;
  }
}

.help-links {
  position: absolute;
  right: 0;
  margin-top: 1rem;
  margin-right: 1.5rem;
  font-size: 0.93rem;

  a {
    padding: 5px;
    margin-left: 0.75rem;
    color: #fff;
    font-weight: normal !important;

    &:hover {
      box-shadow: 0 0 2px 1px white;
      background-color: rgba(0, 0, 0, 0.3);
    }

    .fas {
      margin-right: 0.25rem;
    }
  }
}
</style>

<template>
  <div id="app">
    <Glossary />
    <div class="app-container">
      <main class="main-section">
        <header class="header">
          <div class="container">
            <h1>Effluent Limitations Guidelines and Standards (ELG) Database</h1>
            <div class="help-links">
              <a class="has-text-weight-bold js-glossary-toggle">
                <span class="fas fa-book"></span>
                Glossary
              </a>
              <a :href="helpLink" target="_blank" class="has-text-weight-bold">
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
import { get } from 'vuex-pathify';
import Glossary from './components/shared/Glossary';

export default {
  name: 'App',
  components: { Glossary },
  computed: {
    ...get('search', [
      'selectedCategory',
      'selectedSubcategory',
      'selectedPollutant',
      'selectedPollutantCategory',
      'selectedTreatmentTechnology',
      'selectedTreatmentTechnologyCategory',
      'subcategoryData',
    ]),
    ...get('customSearch', ['keyword']),
    helpLink() {
      const basePath = `${this.$http.defaults.baseURL}/api/help`;
      const currentPath = this.$route.path.replace('/elg', '');

      let page;
      if (currentPath === '/results') {
        if (this.selectedCategory) {
          page = 5;
        } else if (this.selectedPollutant) {
          page = 9;
        } else if (this.selectedPollutantCategory) {
          page = 10;
        } else if (this.selectedTreatmentTechnology || this.selectedTreatmentTechnologyCategory) {
          page = 13;
        } else if (this.keyword && this.keyword.length) {
          page = 17;
        } else {
          page = 15;
        }
      } else if (currentPath === '/results/limitations') {
        if (this.subcategoryData) {
          page = 8;
        } else {
          page = 11;
        }
      } else if (currentPath.includes('/results/about-cfr')) {
        page = 7;
      } else if (currentPath === '/results/limitations/long-term-average') {
        page = 19;
      }

      return `${basePath}${page ? `#page=${page}` : ''}`;
    },
  },
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

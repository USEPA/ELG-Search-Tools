<template>
  <section class="section">
    <div class="elg-breadcrumbs-container">
      <div>
        <Breadcrumbs
          :pages="[
            { title: 'Search', path: '/' },
            { title: 'Results', isCurrent: true },
          ]"
        />
      </div>
      <div>
        <router-link to="/" class="usa-button usa-button--unstyled">
          <span class="fa fa-reply has-text-white"></span>Back to Search
        </router-link>
      </div>
    </div>
    <div class="elg-header-container grid-row grid-gap">
      <div :class="`page-heading ${selectedCategory ? 'grid-col-8' : ''}`">
        <h2>
          <span v-if="selectedCategory">
            Point Source Category
            {{ selectedCategory.pointSourceCategoryCode }}: {{ selectedCategory.pointSourceCategoryName }}
            Limitation Results
          </span>
          <span v-else-if="selectedPollutant"> {{ selectedPollutant.pollutantDescription }} Limitation Results </span>
          <span v-else-if="selectedPollutantCategory">
            {{ selectedPollutantCategory.description }} Limitation Results
          </span>
          <span v-else-if="selectedTreatmentTechnology">
            {{ selectedTreatmentTechnology.name }} Limitation Results
          </span>
          <span v-else-if="selectedTreatmentTechnologyCategory">
            {{ selectedTreatmentTechnologyCategory + ' Treatment Category' }}
            Limitation Results
          </span>
          <span v-else-if="keyword && keyword.length"> Keyword Search Results </span>
          <span v-else-if="searchType === 'multiCriteria'"> Multi-Criteria Search Results </span>
        </h2>
        <div class="cfr-link about-40" v-if="selectedCategory">
          <router-link :to="{ path: '/results/about-cfr', query: { psc: selectedCategory.pointSourceCategoryCode } }">
            About 40 CFR {{ selectedCategory.pointSourceCategoryCode }}: Applicability, General Requirements, and
            Definitions
            <span class="fa fa-external-link-alt" />
          </router-link>
        </div>
      </div>
      <div v-if="selectedCategory" class="grid-col-4">
        <div class="box box--multipurpose">
          <h3 class="box__title">Related Links</h3>
          <div class="box__content">
            <ul>
              <li>
                <div class="cfr-link">
                  <a
                    title="ELG Category Overview"
                    :href="categoryData.linkUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ELG Category Overview <span class="fa fa-external-link-alt" />
                  </a>
                </div>
                (Support Documents & History)
              </li>
              <li>
                <div class="cfr-link">
                  <a
                    title="Electronic Code of Federal Regulations"
                    :href="`https://www.ecfr.gov/cgi-bin/text-idx?node=pt40.31.${selectedCategory.pointSourceCategoryCode}`"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    eCFR <span class="fa fa-external-link-alt" />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <PointSourceResults v-if="selectedCategory" />
    <PollutantResults v-else-if="selectedPollutant || selectedPollutantCategory" />
    <TreatmentTechResults v-else-if="selectedTreatmentTechnology || selectedTreatmentTechnologyCategory" />
    <KeywordResults v-else-if="keyword && keyword.length" />
    <MultiCriteriaResults v-else-if="searchType === 'multiCriteria'" />
    <Alert v-else type="error">
      You must come to this page from the Search page.
      <router-link to="/" class="has-text-dark">Return Home</router-link> to run a search and view results.
    </Alert>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import PointSourceResults from '@/components/results/PointSourceResults.vue';
import PollutantResults from '@/components/results/PollutantResults.vue';
import TreatmentTechResults from '@/components/results/TreatmentTechResults.vue';
import Breadcrumbs from '@/components/shared/Breadcrumbs.vue';
import MultiCriteriaResults from '@/components/results/MultiCriteriaResults.vue';
import KeywordResults from '@/components/results/KeywordResults.vue';
import { mapStatesToComputed } from '../store';

export default {
  components: {
    Breadcrumbs,
    PointSourceResults,
    PollutantResults,
    TreatmentTechResults,
    MultiCriteriaResults,
    KeywordResults,
  },
  computed: {
    ...mapState('search', [
      'searchType',
      'selectedCategory',
      'selectedPollutant',
      'selectedPollutantCategory',
      'selectedTreatmentTechnology',
      'selectedTreatmentTechnologyCategory',
      'categoryData',
    ]),
    ...mapStatesToComputed('customSearch', ['multiCriteriaResults', 'keyword']),
  },
};
</script>

<style lang="scss" scoped>
@import '../../static/variables';

.cfr-link a:hover {
  color: $blue;
}

.cfr-link.about-40 {
  margin-top: 1rem;
}

.message.related-links {
  margin: 0;

  .message-header {
    background: $darkBlue;
  }

  .message-body {
    padding: 0;
    margin: 0 0.75rem;
  }

  ul {
    padding: 0.75rem 0 0.75rem 1.5rem;
    margin: 0;
  }

  a {
    color: $blue !important;
    text-decoration: none !important;
  }
}

.page-heading {
  margin-bottom: 0.5rem;

  h2 {
    font-size: 1.5rem;
  }
}
button {
  background: $blue;
}
a.usa-button {
  margin: 0;
}
.is-link.more {
  margin-left: 3px;
}
label {
  margin-left: 0 !important;
}
.pollutant-subtext {
  margin-bottom: 1rem;
}
section p {
  margin-bottom: 0 !important;
}
.psc-icon {
  position: absolute;
  left: 0;
}
select {
  width: 54em;
}
.psc-select {
  margin-bottom: 1rem;
}
.results-select {
  display: inline-block;
  width: auto;
  min-width: 500px;
  &.treatment-select {
    min-width: 650px;
    margin-bottom: 0;
    margin-left: 0.5rem;
  }
}
.info-box-container {
  height: 100%;
  margin-bottom: 0;
}
.technology-description {
  margin-right: 5px;
}
.is-gray-background {
  background-color: $gray;
}
.box__title,
.box__content {
  padding: 0.75rem;
}
</style>

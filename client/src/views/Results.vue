<template>
  <section class="section">
    <div class="columns elg-breadcrumbs-container">
      <div class="column is-8">
        <Breadcrumbs
          :pages="[
            { title: 'Search', path: '/' },
            { title: 'Results', isCurrent: true },
          ]"
        />
      </div>
      <div class="column">
        <router-link to="/" class="button has-text-white is-pulled-right">
          <span class="fa fa-reply has-text-white"></span>Back to Search
        </router-link>
      </div>
    </div>
    <div class="elg-header-container">
      <h2 class="is-size-4 has-text-weight-bold page-heading column is-10">
        <span v-if="selectedCategory">
          Point Source Category
          {{ selectedCategory.pointSourceCategoryCode }}: {{ selectedCategory.pointSourceCategoryName }}
          Limitation Results
        </span>
        <span v-else-if="selectedPollutant"> {{ selectedPollutant.pollutantDescription }} Limitation Results </span>
        <span v-else-if="selectedPollutantCategory">
          {{ selectedPollutantCategory.description }} Limitation Results
        </span>
        <span v-else-if="selectedTreatmentTechnology"> {{ selectedTreatmentTechnology.name }} Limitation Results </span>
        <span v-else-if="selectedTreatmentTechnologyCategory">
          {{ selectedTreatmentTechnologyCategory + ' Treatment Category' }}
          Limitation Results
        </span>
        <span v-else-if="keyword && keyword.length">
          Keyword Search Results
        </span>
        <span v-else>
          Multi-Criteria Search Results
        </span>
      </h2>
    </div>

    <PointSourceResults v-if="selectedCategory" />
    <PollutantResults v-else-if="selectedPollutant || selectedPollutantCategory" />
    <TreatmentTechResults v-else-if="selectedTreatmentTechnology || selectedTreatmentTechnologyCategory" />
    <KeywordResults v-else-if="keyword && keyword.length" />
    <MultiCriteriaResults v-else />
  </section>
</template>

<script>
import { get } from 'vuex-pathify';
import PointSourceResults from '@/components/results/PointSourceResults';
import PollutantResults from '@/components/results/PollutantResults';
import TreatmentTechResults from '@/components/results/TreatmentTechResults';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import MultiCriteriaResults from '@/components/results/MultiCriteriaResults';
import KeywordResults from '@/components/results/KeywordResults';

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
    ...get('search', [
      'selectedCategory',
      'selectedPollutant',
      'selectedPollutantCategory',
      'selectedTreatmentTechnology',
      'selectedTreatmentTechnologyCategory',
    ]),
    ...get('customSearch', ['multiCriteriaResults', 'keyword']),
  },
};
</script>

<style lang="scss" scoped>
@import '../../static/variables';
.page-heading {
  margin-bottom: 0.5rem;
}
button {
  background: $blue;
}
a.button {
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
  padding-bottom: 0 !important;
}
.is-checkradio[type='checkbox'] + label {
  cursor: auto;
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
</style>

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
    <div class="columns elg-header-container">
      <h2 class="is-size-4 has-text-weight-bold page-heading column is-10">
        <span v-if="selectedCategory">
          Point Source Category
          {{ selectedCategory.pointSourceCategoryCode }}: {{ selectedCategory.pointSourceCategoryName }}
        </span>
        <span v-else-if="selectedPollutant">
          {{ selectedPollutant.pollutantDescription }}
        </span>
        <span v-else-if="selectedTreatmentTechnology">
          {{ selectedTreatmentTechnology.name }}
        </span>
        Results
      </h2>
      <div class="column help-icons">
        <div class="field is-grouped">
          <span class="fas fa-book has-text-grey-dark help-icon"></span>
          <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Glossary</p>
        </div>
        <div class="field is-grouped help-container">
          <span class="fas fa-question-circle has-text-grey-dark help-icon"></span>
          <p class="has-text-grey-dark is-size-7 has-text-weight-bold">Help</p>
        </div>
      </div>
    </div>

    <PointSourceResults v-if="selectedCategory" />
    <PollutantResults v-if="selectedPollutant" />
    <TreatmentTechResults v-if="selectedTreatmentTechnology" />
  </section>
</template>

<script>
import { get } from 'vuex-pathify';
import PointSourceResults from '@/components/results/PointSourceResults';
import PollutantResults from '@/components/results/PollutantResults';
import TreatmentTechResults from '@/components/results/TreatmentTechResults';
import Breadcrumbs from '@/components/shared/Breadcrumbs';

export default {
  components: { Breadcrumbs, PointSourceResults, PollutantResults, TreatmentTechResults },
  computed: {
    ...get('search', ['selectedCategory', 'selectedPollutant', 'selectedTreatmentTechnology']),
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

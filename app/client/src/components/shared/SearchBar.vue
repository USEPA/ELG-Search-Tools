<template>
  <div>
    <p class="instructional-text">
      <span class="fa fa-info-circle"></span>
      Select a search type from the tabs below. Note: depending on the criteria selected, the search result may take
      time to load.
    </p>

    <ul class="grid-row tabs aq-tabs">
      <li
        v-for="option in searchTypes"
        :key="option.id"
        :class="`grid-col ${searchType === option.id ? 'is-active' : ''}`"
      >
        <button class="height-full" @click="toggleSearchType(option.id)">
          {{ option.label }}
        </button>
      </li>
    </ul>

    <div class="tab-container">
      <h3 class="search-header is-size-5 has-text-weight-bold">{{ searchTypeObject.label }} Search</h3>

      <Alert v-if="searchType === 'pollutant'" type="info" :isSlim="true">
        Select an individual pollutant or a pollutant category.
      </Alert>
      <Alert v-if="searchType === 'treatmentTech'" type="info" :isSlim="true">
        Select an individual treatment technology or a treatment technology category.
      </Alert>

      <MultiCriteria v-if="searchType === 'multiCriteria'" />
      <Keyword v-else-if="searchType === 'keyword'" />
      <div v-else class="grid-row grid-gap">
        <div class="grid-col">
          <label>{{ searchTypeObject.label }}</label>
          <div class="field has-addons">
            <div class="control is-expanded">
              <VueSelect
                class="search-select"
                :inputId="searchTypeObject.id"
                :modelValue="currentSearchValue"
                :options="optionsList"
                :placeholder="searchType ? `Select ${searchTypeObject.label}` : 'Select search criteria to continue'"
                :disabled="!searchType"
                @update:modelValue="onSelectOption"
                :label="searchTypeObject.labelField"
              >
                <template #option="option">
                  <span v-if="searchTypeObject.shouldDisplayCode">
                    {{ option[searchTypeObject.codeField] }} : {{ option[searchTypeObject.labelField] }}
                  </span>
                  <span v-else>{{ option[searchTypeObject.labelField] }}</span>
                </template>
                <template #selected-option="option">
                  <span v-if="searchTypeObject.shouldDisplayCode">
                    {{ option[searchTypeObject.codeField] }} : {{ option[searchTypeObject.labelField] }}
                  </span>
                  <span v-else>{{ option[searchTypeObject.labelField] }}</span>
                </template>
              </VueSelect>
            </div>
            <div class="control">
              <button
                class="usa-button search-btn is-dark is-medium"
                @click="onSubmit"
                :title="isFetching ? 'Loading...' : !currentSearchValue ? 'Select an option to search' : 'Search'"
                :disabled="!currentSearchValue"
              >
                <span :class="`fa has-text-white ${isFetching ? 'fa-circle-notch fa-spin' : 'fa-search'}`"></span>
                <span class="sr-only">Search</span>
              </button>
            </div>
          </div>
        </div>

        <div class="grid-col">
          <label v-if="searchType === 'treatmentTech'">Treatment Technology Category</label>
          <div v-if="searchType === 'treatmentTech'" class="field has-addons">
            <div class="control is-expanded">
              <VueSelect
                inputId="treatmentTechnologyCategory"
                class="search-select"
                :modelValue="selectedTreatmentTechnologyCategory"
                :options="treatmentTechnologyCategories"
                placeholder="Select Treatment Technology Category"
                @update:modelValue="onSelectTreatmentCategory"
              />
            </div>
            <div class="control">
              <button
                class="usa-button is-dark is-medium"
                @click="onSubmitTreatmentCategory"
                :title="
                  isFetching
                    ? 'Loading...'
                    : !selectedTreatmentTechnologyCategory
                      ? 'Select an option to search'
                      : 'Search'
                "
                :disabled="!selectedTreatmentTechnologyCategory"
              >
                <span
                  :class="`fa has-text-white ${isFetchingSecondary ? 'fa-circle-notch fa-spin' : 'fa-search'}`"
                ></span>
                <span class="sr-only">Search</span>
              </button>
            </div>
          </div>

          <label v-if="searchType === 'pollutant'">
            Pollutant Category
            <button
              type="button"
              class="usa-button is-text icon-btn"
              aria-label="More Info"
              @click="shouldDisplayPollCatDescriptions = true"
            >
              <span class="fa fa-info-circle"></span>
            </button>
          </label>
          <div v-if="searchType === 'pollutant'" class="field has-addons">
            <div class="control is-expanded">
              <VueSelect
                inputId="pollutantCategory"
                class="search-select"
                :modelValue="selectedPollutantCategory"
                :options="pollCategoriesWithDescriptions"
                label="description"
                placeholder="Select Pollutant Category"
                @update:modelValue="onSelectPollutantCategory"
              />
            </div>
            <div class="control">
              <button
                class="usa-button is-dark is-medium"
                @click="onSubmitPollutantCategory"
                :title="
                  isFetching ? 'Loading...' : !selectedPollutantCategory ? 'Select an option to search' : 'Search'
                "
                :disabled="!selectedPollutantCategory"
              >
                <span
                  :class="`fa has-text-white ${isFetchingSecondary ? 'fa-circle-notch fa-spin' : 'fa-search'}`"
                ></span>
                <span class="sr-only">Search</span>
              </button>
            </div>
          </div>
          <Modal
            v-if="shouldDisplayPollCatDescriptions"
            title="Pollutant Category Descriptions"
            @close="shouldDisplayPollCatDescriptions = false"
          >
            <div class="content">
              <ul>
                <li v-for="cat in pollutantCategories" :key="cat.id">
                  <strong>{{ cat.description }}</strong
                  >: {{ pollCatDescriptions[cat.id] }}
                </li>
              </ul>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import MultiCriteria from '@/components/search/MultiCriteria.vue';
import Keyword from '@/components/search/Keyword.vue';
import { mapStatesToComputed } from '../../store';

export default {
  name: 'SearchBar',
  components: { MultiCriteria, Keyword },
  data() {
    return {
      searchTypes: [
        {
          id: 'pointSource',
          label: 'Point Source Category',
          codeField: 'pointSourceCategoryCode',
          labelField: 'pointSourceCategoryName',
          shouldDisplayCode: true,
          optionsList: 'categories',
          selectedProp: 'selectedCategory',
          resultAction: 'getPointSourceData',
        },
        {
          id: 'pollutant',
          label: 'Pollutant',
          codeField: 'pollutantId',
          labelField: 'pollutantDescription',
          optionsList: 'pollutants',
          selectedProp: 'selectedPollutant',
          resultAction: 'getPollutantData',
        },
        {
          id: 'treatmentTech',
          label: 'Treatment Technology',
          codeField: 'id',
          labelField: 'name',
          optionsList: 'treatmentTechnologies',
          selectedProp: 'selectedTreatmentTechnology',
          resultAction: 'getTreatmentTechnologyData',
        },
        {
          id: 'multiCriteria',
          label: 'Multi-Criteria',
        },
        {
          id: 'keyword',
          label: 'Keyword',
        },
      ],
      option: '',
      category: null,
      list: [],
      code: null,
      pollutantId: null,
      treatmentTechnologyId: null,
      isFetching: false,
      isFetchingSecondary: false,
      shouldDisplayPollCatDescriptions: false,
      pollCatDescriptions: {
        1: 'All 126 pollutants that the EPA currently defines as priority pollutants.',
        2: 'Parameters include total nitrogen, organic nitrogen, total Kjeldahl nitrogen, nitrite, nitrate, and ammonia.',
        3: 'Parameters include phosphorus and phosphate.',
        4: 'Biochemical oxygen demand (BOD5), total suspended solids (TSS), fecal coliform, pH, and oil & grease.',
        5: 'Suspended and settable solids.',
        6: 'All metals parameters, including hexavalent or trivalent metals and metals in ionic form (e.g., hexavalent chromium and aluminum, ion) and metals on the CWA priority pollutant list. Excludes metal compounds (e.g., calcium chloride).',
      },
    };
  },
  computed: {
    ...mapState('search', [
      'categories',
      'pollutants',
      'pollutantCategories',
      'treatmentTechnologies',
      'treatmentTechnologyCategories',
    ]),
    ...mapStatesToComputed('search', [
      'searchType',
      'selectedCategory',
      'selectedPollutant',
      'selectedPollutantCategory',
      'selectedTreatmentTechnology',
      'selectedTreatmentTechnologyCategory',
    ]),
    searchTypeObject() {
      return this.searchTypes.find((type) => type.id === this.searchType) || {};
    },
    optionsList() {
      const searchTypeObject = this.searchTypes.find((type) => type.id === this.searchType);
      return searchTypeObject ? this[searchTypeObject.optionsList] : [];
    },
    currentSearchValue() {
      return this[this.searchTypeObject.selectedProp];
    },
    pollCategoriesWithDescriptions() {
      return this.pollutantCategories.map((cat) => {
        return {
          ...cat,
          fullDesc: this.pollCatDescriptions[cat.id],
        };
      });
    },
  },
  methods: {
    toggleSearchType(value) {
      this.searchType = value;
      this.clearSelectedValues();
    },
    onSelectOption(value) {
      this[this.searchTypeObject.selectedProp] = value;
      // Clear any secondary options (e.g. treatment category)
      this.selectedPollutantCategory = null;
      this.selectedTreatmentTechnologyCategory = null;
    },
    onSelectPollutantCategory(value) {
      this.selectedPollutant = null;
      this.selectedPollutantCategory = value;
    },
    onSelectTreatmentCategory(value) {
      this.selectedTreatmentTechnology = null;
      this.selectedTreatmentTechnologyCategory = value;
    },
    getOptionLabel(searchOption) {
      if (this.searchTypeObject.shouldDisplayCode) {
        return `${searchOption[this.searchTypeObject.codeField]}: ${searchOption[this.searchTypeObject.labelField]}`;
      }
      return searchOption[this.searchTypeObject.labelField];
    },
    clearSelectedValues() {
      // Clear all selected values when search type changes, so they aren't still populated if user switches back to same search type
      [
        this.selectedCategory,
        this.selectedPollutant,
        this.selectedTreatmentTechnology,
        this.selectedPollutantCategory,
        this.selectedTreatmentTechnologyCategory,
      ] = [null, null, null, null, null];
      this.$store.commit('customSearch/CLEAR_MULTI_CRITERIA_VALUES');
      this.$store.commit('customSearch/CLEAR_KEYWORD_VALUES');
    },
    async onSubmit() {
      this.isFetching = true;
      await this.$store.dispatch(`search/${this.searchTypeObject.resultAction}`);
      this.isFetching = false;
      this.$router.push('results');
    },
    async onSubmitTreatmentCategory() {
      this.isFetchingSecondary = true;
      await this.$store.dispatch('search/getTreatmentTechnologyCategoryData');
      this.isFetchingSecondary = false;
      this.$router.push('results');
    },
    async onSubmitPollutantCategory() {
      this.isFetchingSecondary = true;
      await this.$store.dispatch('search/getPollutantCategoryData');
      this.isFetchingSecondary = false;
      this.$router.push('results');
    },
  },
  created() {
    // Fetch lookup data for dropdown lists
    this.$store.dispatch('search/getPointSourceCategories');
    this.$store.dispatch('search/getPollutants');
    this.$store.dispatch('search/getPollutantCategories');
    this.$store.dispatch('search/getTreatmentTechnologies');
    this.$store.dispatch('search/getTreatmentTechnologyCategories');
    this.$store.dispatch('customSearch/getMultiCriteriaLookups');
    // Clear treatment train data so it's not pre-selected if user returns to same results page
    this.$store.commit('search/SET_SELECTED_TREATMENT_TRAIN', null);
    this.$store.commit('search/SET_TREATMENT_TRAIN', null);
    this.$store.commit('search/SET_SELECTED_SUBCATEGORY', null);
    this.$store.commit('customSearch/SET_MULTI_CRITERIA_RESULTS', null);
    this.$store.commit('customSearch/SET_KEYWORD_RESULTS', null);
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

.instructional-text {
  margin-top: 1rem;

  .fa-info-circle {
    color: $darkBlue;
    margin-right: 0.25rem;
    margin-left: 0.1rem;
  }
}

ul.tabs.aq-tabs {
  list-style: none;
  padding: 0;
  margin: 0;
  border-bottom: 2px solid $blue;

  li {
    margin: 0;
    padding: 0 0.5rem 0 0;

    button {
      font-weight: bold;
      border: none;
      margin-right: 0;
      cursor: pointer;
    }

    &:last-child {
      padding-right: 0;
    }

    &.is-active button {
      background-color: $blue;
      color: #fff;

      &:hover {
        cursor: default;
      }
    }
  }
}

.tab-container {
  padding: 1.5rem;
  border: 2px solid #e6e6e6;
  border-top: none;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.search-header {
  // display: inline-block;
  margin-bottom: 0.75rem;
}

.instructions-message {
  display: inline-block;
  font-size: 0.95rem;
  padding: 0.25rem 0.75rem;
  margin-bottom: 0.75rem;
}

.usa-button {
  height: 100%;
  margin-bottom: 0;
}

.usa-button[disabled] {
  background-color: gray;
}

label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: bold;
}

.poll-cat-desc {
  // width: calc(100% - 520px);
  margin-left: auto;
  margin-right: 110px;

  .fa {
    color: $blue;
  }
}

:deep() {
  .search-select {
    min-height: 40px;
    height: 100%;

    &.vs--open .vs__selected {
      top: 0.4rem;
    }

    .vs__selected {
      font-size: 1rem;
    }

    &.vs--single input.vs__search {
      width: 1px;
    }
  }
}
</style>

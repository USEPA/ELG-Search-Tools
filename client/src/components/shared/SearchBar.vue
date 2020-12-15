<template>
  <div>
    <p style="padding-bottom:0.75rem">
      Please select one of the following search criteria: point source category, pollutant, or treatment technology.
      Note: depending on the criteria selected, the search result may take time to load.
    </p>
    <p>
      For the pollutant search criteria, you can select an individual pollutant or a pollutant category. For the
      treatment technology search criteria, you can select an individual treatment technology or a treatment technology
      category.
    </p>
    <div class="field has-addons">
      <div class="control">
        <label for="searchType" class="button is-static has-background-grey-lighter has-text-black is-medium">
          Browse By:
        </label>
      </div>
      <div class="control">
        <span class="select is-medium">
          <select
            id="searchType"
            class="has-background-grey-lighter has-text-weight-semibold is-medium"
            v-model="searchType"
            @change="clearSelectedValues"
          >
            <option value="">Select Search Criteria</option>
            <option v-for="option in searchTypes" :key="option.id" :value="option.id">{{ option.label }}</option>
          </select>
        </span>
      </div>
      <div class="control is-expanded">
        <Multiselect
          :value="currentSearchValue"
          :options="optionsList"
          :placeholder="searchType ? `Select ${searchTypeObject.label}` : 'Select search criteria to continue'"
          :disabled="!searchType"
          :custom-label="getOptionLabel"
          @input="onSelectOption"
          :track-by="searchTypeObject.codeField"
        ></Multiselect>
      </div>
      <div class="control">
        <button
          class="button is-medium"
          @click="onSubmit"
          :title="isFetching ? 'Loading...' : !currentSearchValue ? 'Select an option to search' : 'Search'"
          :disabled="!currentSearchValue"
        >
          <span class="sr-only">Search</span>
          <span :class="`fa has-text-white ${isFetching ? 'fa-circle-notch fa-spin' : 'fa-search'}`"></span>
        </button>
      </div>
    </div>
    <div v-if="searchType === 'treatmentTech'" class="field has-addons">
      <div class="control is-expanded secondary-input">
        <Multiselect
          :value="selectedTreatmentTechnologyCategory"
          :options="treatmentTechnologyCategories"
          placeholder="Select Treatment Technology Category"
          :disabled="!searchType"
          @input="onSelectTreatmentCategory"
        />
      </div>
      <div class="control">
        <button
          class="button is-medium"
          @click="onSubmitTreatmentCategory"
          :title="
            isFetching ? 'Loading...' : !selectedTreatmentTechnologyCategory ? 'Select an option to search' : 'Search'
          "
          :disabled="!selectedTreatmentTechnologyCategory"
        >
          <span class="sr-only">Search</span>
          <span :class="`fa has-text-white ${isFetchingSecondary ? 'fa-circle-notch fa-spin' : 'fa-search'}`"></span>
        </button>
      </div>
    </div>
    <div v-if="searchType === 'pollutant'" class="field has-addons">
      <div class="control is-expanded secondary-input">
        <Multiselect
          :value="selectedPollutantCategory"
          :options="pollutantCategories"
          placeholder="Select Pollutant Category"
          label="description"
          track-by="id"
          :disabled="!searchType"
          @input="onSelectPollutantCategory"
        />
      </div>
      <div class="control">
        <button
          class="button is-medium"
          @click="onSubmitPollutantCategory"
          :title="isFetching ? 'Loading...' : !selectedPollutantCategory ? 'Select an option to search' : 'Search'"
          :disabled="!selectedPollutantCategory"
        >
          <span class="sr-only">Search</span>
          <span :class="`fa has-text-white ${isFetchingSecondary ? 'fa-circle-notch fa-spin' : 'fa-search'}`"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import Multiselect from 'vue-multiselect';

export default {
  name: 'SearchBar',
  components: { Multiselect },
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
      ],
      option: '',
      category: null,
      list: [],
      code: null,
      pollutantId: null,
      treatmentTechnologyId: null,
      isFetching: false,
      isFetchingSecondary: false,
    };
  },
  computed: {
    ...get('search', [
      'categories',
      'pollutants',
      'pollutantCategories',
      'treatmentTechnologies',
      'treatmentTechnologyCategories',
    ]),
    ...sync('search', [
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
  },
  methods: {
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
    // Clear treatment train data so it's not pre-selected if user returns to same results page
    this.$store.commit('search/SET_SELECTED_TREATMENT_TRAIN', null);
    this.$store.commit('search/SET_TREATMENT_TRAIN', null);
    this.$store.commit('search/SET_SELECTED_SUBCATEGORY', null);
  },
};
</script>

<style lang="scss" scoped>
@import '../../../static/variables';

button {
  width: 100px;
  background: $darkBlue;
  border-color: $darkBlue;
}

.button[disabled] {
  background-color: gray;
}

.field.has-addons {
  height: 44px;
}

.control.secondary-input {
  width: calc(100% - 503px);
  flex-grow: 0 !important;
  margin-left: auto;
}

::v-deep {
  .multiselect__tags {
    min-height: 45px !important;
  }

  .multiselect__single {
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>

<template>
  <div>
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
          :disabled="!subcategory && option === 'Point Source Category'"
        >
          <span class="fa fas fa-search has-text-white"></span>
        </button>
      </div>
    </div>
    <div class="columns subcategory-select">
      <div class="column">
        <Multiselect
          v-if="searchType === 'pointSource' && selectedCategory"
          v-model="selectedSubcategory"
          :options="subcategories"
          placeholder="Select Subcategory"
          label="comboSubcategory"
          :loading="isFetchingSubcategories"
        ></Multiselect>
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
          resultAction: 'getSubcategoryData',
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
      subcategory: null,
      isFetchingSubcategories: false,
      code: null,
      subcategoryCode: null,
      pollutantId: null,
      treatmentTechnologyId: null,
    };
  },
  computed: {
    ...get('search', ['categories', 'subcategories', 'pollutants', 'treatmentTechnologies']),
    ...sync('search', [
      'searchType',
      'selectedCategory',
      'selectedPollutant',
      'selectedTreatmentTechnology',
      'selectedSubcategory',
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
    async onSelectOption(value) {
      if (this.searchType === 'pointSource' && value) {
        // If user selected a point source category, fetch sub-categories
        this.isFetchingSubcategories = true;
        await this.$store.dispatch('search/getPointSourceSubcategories', value.pointSourceCategoryCode);
        this.isFetchingSubcategories = false;
      }
      this[this.searchTypeObject.selectedProp] = value;
    },
    getOptionLabel(searchOption) {
      if (this.searchTypeObject.shouldDisplayCode) {
        return `${searchOption[this.searchTypeObject.codeField]}: ${searchOption[this.searchTypeObject.labelField]}`;
      }
      return searchOption[this.searchTypeObject.labelField];
    },
    clearSelectedValues() {
      // Clear all selected values when search type changes, so they aren't still populated if user switches back to same search type
      [this.selectedCategory, this.selectedSubcategory, this.selectedPollutant, this.selectedTreatmentTechnology] = [
        null,
        null,
        null,
        null,
      ];
    },
    async onSubmit() {
      await this.$store.dispatch(`search/${this.searchTypeObject.resultAction}`);
      this.$router.push('results');
    },
  },
  created() {
    // Fetch lookup data for dropdown lists
    this.$store.dispatch('search/getPointSourceCategories');
    this.$store.dispatch('search/getPollutants');
    this.$store.dispatch('search/getTreatmentTechnologies');
    // Clear treatment train data so it's not pre-selected if user returns to same results page
    this.$store.commit('search/SET_SELECTED_TREATMENT_TRAIN', null);
    this.$store.commit('search/SET_TREATMENT_TRAIN', null);
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

.subcategory-select {
  width: 609px !important;
  margin-left: 392px;
}

.field.has-addons {
  height: 44px;
}
</style>

<style lang="scss">
.multiselect__tags {
  min-height: 45px !important;
}

.multiselect__single {
  white-space: nowrap;
  overflow: hidden;
}
</style>

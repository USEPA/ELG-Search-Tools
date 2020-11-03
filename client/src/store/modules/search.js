import axios from 'axios';
import { make } from 'vuex-pathify';

const state = {
  // lookups to feed dropdown lists
  categories: [],
  subcategories: [],
  pollutants: [],
  treatmentTechnologies: [],
  // user-selected values
  searchType: '',
  selectedCategory: null,
  selectedSubcategory: null,
  selectedPollutant: null,
  selectedTreatmentTechnology: null,
  selectedTreatmentTrain: null,
  // search results data
  categoryData: null,
  subcategoryData: null,
  pollutantData: null,
  treatmentTechnologyData: null,
  treatmentTrain: null,
  technologyBasisData: null,
  isFetching: false,
  isComparingPscs: false,
};

const getters = {
  ...make.getters(state),
};

const mutations = {
  // "make" helper automatically creates mutations for each property within the state object, e.g. "SET_CATEGORIES"
  ...make.mutations(state),
};

const actions = {
  async getPointSourceCategories({ commit }) {
    commit('SET_CATEGORIES', []);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get('api/pointSourceCategories');
    commit('SET_CATEGORIES', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getPointSourceSubcategories({ commit }, id) {
    commit('SET_SELECTED_SUBCATEGORY', null);
    commit('SET_SUBCATEGORIES', []);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/pointSourceCategory/${id}`);
    commit('SET_SUBCATEGORIES', res.data.pointSourceSubcategories);
    commit('SET_IS_FETCHING', false);
  },
  async getPointSourceData({ state, commit, dispatch }) {
    dispatch('clearResultsData');
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/pointSourceCategory/${state.selectedCategory.pointSourceCategoryCode}`);
    commit('SET_CATEGORY_DATA', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getSubcategoryData({ state, commit }) {
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/pointSourceSubcategory/${state.selectedSubcategory.id}`);
    commit('SET_SUBCATEGORY_DATA', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getPollutants({ commit }) {
    commit('SET_POLLUTANTS', []);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get('api/pollutants');
    commit('SET_POLLUTANTS', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getPollutantData({ state, commit, dispatch }) {
    dispatch('clearResultsData');
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/pollutant/?id=${state.selectedPollutant.pollutantId}`);
    commit('SET_POLLUTANT_DATA', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getTreatmentTechnologies({ commit }) {
    commit('SET_TREATMENT_TECHNOLOGIES', []);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get('api/treatmentTechnologies');
    commit('SET_TREATMENT_TECHNOLOGIES', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getTreatmentTechnologyData({ state, commit, dispatch }) {
    dispatch('clearResultsData');
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/treatmentTechnology/${state.selectedTreatmentTechnology.id}`);
    commit('SET_TREATMENT_TECHNOLOGY_DATA', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getTreatmentTrain({ commit }, id) {
    commit('SET_TREATMENT_TRAIN', null);
    commit('SET_IS_FETCHING', true);

    const train = await axios.get(`api/treatmentTrain/${id}`);
    commit('SET_TREATMENT_TRAIN', train.data);
    commit('SET_IS_FETCHING', false);
  },
  async getTechnologyBasisData({ commit }, { treatmentId, pointSourceCategoryCode }) {
    commit('SET_TECHNOLOGY_BASIS_DATA', null);
    commit('SET_IS_COMPARING_PSCS', false);
    commit('SET_IS_FETCHING', true);

    const train = await axios.get(`api/technologyBases`, {
      params: {
        treatmentId,
        pointSourceCategoryCode,
      },
    });
    commit('SET_TECHNOLOGY_BASIS_DATA', train.data);
    commit('SET_IS_FETCHING', false);
  },
  async getTechnologyBasisDataForMultiplePscs({ commit }, { treatmentIds, pointSourceCategoryCodes }) {
    commit('SET_TECHNOLOGY_BASIS_DATA', null);
    commit('SET_IS_COMPARING_PSCS', true);
    commit('SET_IS_FETCHING', true);

    const train = await axios.get(`api/technologyBases`, {
      params: {
        treatmentId: treatmentIds,
        pointSourceCategoryCode: pointSourceCategoryCodes,
      },
    });
    commit('SET_TECHNOLOGY_BASIS_DATA', train.data);
    commit('SET_IS_FETCHING', false);
  },
  clearResultsData({ commit }) {
    // Clear persisted results data to restart results session once user searches again
    commit('SET_CATEGORY_DATA', null);
    commit('SET_SUBCATEGORY_DATA', null);
    commit('SET_POLLUTANT_DATA', null);
    commit('SET_TREATMENT_TECHNOLOGY_DATA', null);
    commit('limitations/SET_SELECTED_TREATMENT_TRAIN', [], { root: true });
    commit('limitations/SET_SELECTED_TREATMENT_CATEGORY', [], { root: true });
    commit('limitations/SET_SELECTED_TREATMENT_POLLUTANT', [], { root: true });
    commit('limitations/SET_TREATMENT_LIMITATION_DATA', null, { root: true });
    commit('results/SET_ACTIVE_TAB', null, { root: true });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

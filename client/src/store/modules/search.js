import axios from 'axios';

const state = {
  categories: [],
  category: null,
  subcategories: [],
  subcategory: null,
  pollutants: [],
  pollutantData: null,
  treatmentTechnologies: [],
  treatmentTechnology: null,
  treatmentTrain: null,
  technologyBasisData: null,
  isFetching: false,
};

const getters = {
  categories(state) {
    return state.categories;
  },
  subcategories(state) {
    return state.subcategories;
  },
  subcategoryData(state) {
    return state.subcategory;
  },
  pollutants(state) {
    return state.pollutants;
  },
  treatmentTechnologies(state) {
    return state.treatmentTechnologies;
  },
  technologyBasisData(state) {
    return state.technologyBasisData;
  },
};

const mutations = {
  SET_CATEGORIES(state, payload) {
    state.categories = payload;
  },
  SET_CATEGORY(state, payload) {
    state.category = payload;
  },
  SET_SUBCATEGORIES(state, payload) {
    state.subcategories = payload;
  },
  SET_SUBCATEGORY(state, value) {
    state.subcategory = value;
  },
  SET_POLLUTANTS(state, payload) {
    state.pollutants = payload;
  },
  SET_POLLUTANT(state, value) {
    state.pollutantData = value;
  },
  SET_TREATMENT_TECHNOLOGIES(state, payload) {
    state.treatmentTechnologies = payload;
  },
  SET_TREATMENT_TECHNOLOGY(state, value) {
    state.treatmentTechnology = value;
  },
  SET_TREATMENT_TRAIN(state, value) {
    state.treatmentTrain = value;
  },
  SET_TECHNOLOGY_BASIS(state, value) {
    state.technologyBasisData = value;
  },
  SET_IS_FETCHING(state, value) {
    state.isFetching = value;
  },
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
    commit('SET_SUBCATEGORIES', []);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/pointSourceCategory/${id}`);
    commit('SET_SUBCATEGORIES', res.data.pointSourceSubcategories);
    commit('SET_IS_FETCHING', false);
  },
  async getSubcategory({ commit }, id) {
    commit('SET_SUBCATEGORY', null);
    commit('SET_POLLUTANT', null);
    commit('SET_TREATMENT_TECHNOLOGY', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/pointSourceSubcategory/${id}`);
    commit('SET_SUBCATEGORY', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getPollutants({ commit }) {
    commit('SET_POLLUTANTS', []);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get('api/pollutants');
    commit('SET_POLLUTANTS', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getPollutant({ commit }, id) {
    commit('SET_SUBCATEGORY', null);
    commit('SET_POLLUTANT', null);
    commit('SET_TREATMENT_TECHNOLOGY', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/pollutant/${id}`);
    commit('SET_POLLUTANT', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getTreatmentTechnologies({ commit }) {
    commit('SET_TREATMENT_TECHNOLOGIES', []);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get('api/treatmentTechnologies');
    commit('SET_TREATMENT_TECHNOLOGIES', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getTreatmentTechnology({ commit }, id) {
    commit('SET_SUBCATEGORY', null);
    commit('SET_POLLUTANT', null);
    commit('SET_TREATMENT_TECHNOLOGY', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/treatmentTechnology/${id}`);
    commit('SET_TREATMENT_TECHNOLOGY', res.data);
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
    commit('SET_TECHNOLOGY_BASIS', null);
    commit('SET_IS_FETCHING', true);

    const train = await axios.get(`api/technologyBases`, {
      params: {
        treatmentId,
        pointSourceCategoryCode,
      },
    });
    commit('SET_TECHNOLOGY_BASIS', train.data);
    commit('SET_IS_FETCHING', false);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

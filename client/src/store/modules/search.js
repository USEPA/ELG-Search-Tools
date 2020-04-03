import axios from 'axios';
import { make } from 'vuex-pathify';

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
  isFetching: false,
};

const getters = {
  ...make.getters(state),
  subcategoryData(state) {
    return state.subcategory;
  },
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
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

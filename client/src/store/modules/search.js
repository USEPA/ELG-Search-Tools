import axios from 'axios';

const state = {
  categories: [],
  category: null,
  subcategories: [],
  subcategory: null,
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
  SET_IS_FETCHING(state, value) {
    state.isFetching = value;
  },
};

const actions = {
  async get_PointSourceCategories({ commit }) {
    commit('SET_CATEGORIES', []);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get('api/pointSourceCategories');
    commit('SET_CATEGORIES', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async get_PointSourceSubcategories({ commit }, id) {
    commit('SET_SUBCATEGORIES', []);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/pointSourceCategory/${id}`);
    commit('SET_SUBCATEGORIES', res.data.pointSourceSubcategories);
    commit('SET_IS_FETCHING', false);
  },
  async getSubcategory({ commit }, id) {
    commit('SET_SUBCATEGORY', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/pointSourceSubcategory/${id}`);
    commit('SET_SUBCATEGORY', res.data);
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

import axios from 'axios';

const state = {
  cfrResults: null,
  cfrDefinitions: null,
  cfrCitationHistory: null,
  isFetching: false,
};

const getters = {};

const mutations = {};

const actions = {
  async getCfrResults({ commit }, pscId) {
    commit('SET_CFR_RESULTS', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`/api/pointSourceCategoryCfr/${pscId}`);
    commit('SET_CFR_RESULTS', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getCfrDefinitions({ commit }, pscId) {
    commit('SET_CFR_DEFINITIONS', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`/api/pointSourceCategoryDefinitions/${pscId}`);
    commit('SET_CFR_DEFINITIONS', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getCfrCitationHistory({ commit }, pscId) {
    commit('SET_CFR_CITATION_HISTORY', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`/api/pointSourceCategoryCitationHistory/${pscId}`);
    commit('SET_CFR_CITATION_HISTORY', res.data);
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

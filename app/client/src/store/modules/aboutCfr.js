import axios from 'axios';

const state = {
  cfrResults: null,
  cfrDefinitions: null,
  cfrCitationHistory: null,
  // Words in this category's CFR text that the search keywords matched by lexeme
  keywordMatches: [],
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
  async getKeywordMatches({ commit }, { pscId, keywords }) {
    commit('SET_KEYWORD_MATCHES', []);

    if (!keywords.length) {
      return;
    }

    // Repeated params - Express 5's 'simple' query parser would read axios's 'keyword[]' form as a
    // differently named param
    const params = new URLSearchParams();
    keywords.forEach((keyword) => params.append('keyword', keyword));

    // Left out of isFetching so the page renders without waiting on highlighting
    const res = await axios.get(`/api/pointSourceCategoryKeywordMatches/${pscId}?${params.toString()}`);
    commit('SET_KEYWORD_MATCHES', res.data);
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

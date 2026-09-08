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

// Not in state: state is persisted to localStorage, so a reload mid-request would restore a stale
// count and leave isFetching stuck on
let pendingRequests = 0;

const mutations = {
  START_FETCH(state) {
    pendingRequests += 1;
    state.isFetching = true;
  },
  // Only the last request in flight clears the flag
  END_FETCH(state) {
    pendingRequests = Math.max(0, pendingRequests - 1);
    state.isFetching = pendingRequests > 0;
  },
};

const actions = {
  async getCfrResults({ commit }, pscId) {
    commit('SET_CFR_RESULTS', null);
    commit('START_FETCH');

    try {
      const res = await axios.get(`/api/pointSourceCategoryCfr/${pscId}`);
      commit('SET_CFR_RESULTS', res.data);
    } finally {
      commit('END_FETCH');
    }
  },
  async getCfrDefinitions({ commit }, pscId) {
    commit('SET_CFR_DEFINITIONS', null);
    commit('START_FETCH');

    try {
      const res = await axios.get(`/api/pointSourceCategoryDefinitions/${pscId}`);
      commit('SET_CFR_DEFINITIONS', res.data);
    } finally {
      commit('END_FETCH');
    }
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
    commit('START_FETCH');

    try {
      const res = await axios.get(`/api/pointSourceCategoryCitationHistory/${pscId}`);
      commit('SET_CFR_CITATION_HISTORY', res.data);
    } finally {
      commit('END_FETCH');
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

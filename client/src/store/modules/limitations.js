import axios from 'axios';
import { make } from 'vuex-pathify';

const state = {
  pointSourceCategoryCode: null,
  pointSourceCategoryName: null,
  pollutantDescription: null,
  limitationData: null,
  isFetching: false,
  longTermAvgData: null,
};

const getters = {
  ...make.getters(state),
};

const mutations = {
  // "make" helper automatically creates mutations for each property within the state object, e.g. "SET_LIMITATION_DATA"
  ...make.mutations(state),
  SET_PSC(state, payload) {
    if (payload) {
      state.pointSourceCategoryCode = payload.pointSourceCategoryCode;
      state.pointSourceCategoryName = payload.pointSourceCategoryName;
      state.pollutantDescription = payload.pollutantDescription;
      state.treatmentNames = payload.treatmentNames;
    }
  },
  SET_LTA_DATA(state, payload) {
    state.longTermAvgData = payload;
  },
};

const actions = {
  async getLimitationData({ commit }, id) {
    commit('SET_LIMITATION_DATA', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/wastestreamProcessLimitations/${id}`);
    commit('SET_LIMITATION_DATA', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getPollLimitationData({ commit }, { pollutantId, pointSourceCategoryCode }) {
    commit('SET_LIMITATION_DATA', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get('api/pollutantLimitations', {
      params: {
        pollutantId,
        pointSourceCategoryCode,
      },
    });
    commit('SET_LIMITATION_DATA', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getTechnologyBasisLimitationData({ commit }, { treatmentId, pointSourceCategoryCode }) {
    commit('SET_LIMITATION_DATA', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get('api/technologyBasisLimitations', {
      params: {
        treatmentId,
        pointSourceCategoryCode,
      },
    });
    commit('SET_LIMITATION_DATA', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getPollutantInfo({ commit }, payload) {
    commit('SET_PSC', null);
    commit('SET_PSC', payload);
  },
  async getLongTermAvgData({ commit }, id) {
    commit('SET_LTA_DATA', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/limitation/${id}`);
    commit('SET_LTA_DATA', res.data);
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

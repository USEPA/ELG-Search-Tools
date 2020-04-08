import axios from 'axios';

const state = {
  pointSourceCategoryCode: null,
  pointSourceCategoryName: null,
  pollutantDescription: null,
  limitationData: null,
  isFetching: false,
  longTermAvgData: null,
  isComparingPscs: false,
};

const getters = {
  limitationData(state) {
    return state.limitationData;
  },
};

const mutations = {
  SET_LIMITATION_DATA(state, value) {
    state.limitationData = value;
  },
  SET_IS_FETCHING(state, value) {
    state.isFetching = value;
  },
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
  SET_COMPARE(state, payload) {
    state.isComparingPscs = payload;
  },
};

const actions = {
  async getLimitationData({ commit }, id) {
    commit('SET_LIMITATION_DATA', null);
    commit('SET_COMPARE', false);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/wastestreamProcessLimitations/${id}`);
    commit('SET_LIMITATION_DATA', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getPollLimitationData({ commit }, { pollutantId, pointSourceCategoryCode }) {
    commit('SET_LIMITATION_DATA', null);
    commit('SET_COMPARE', false);
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
  async getPollLimitationDataForMultiplePscs({ commit }, { pollutantIds, pointSourceCategoryCodes }) {
    commit('SET_LIMITATION_DATA', null);
    commit('SET_COMPARE', true);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get('api/pollutantLimitations', {
      params: {
        pollutantId: pollutantIds,
        pointSourceCategoryCode: pointSourceCategoryCodes,
      },
    });
    commit('SET_LIMITATION_DATA', res.data);
    commit('SET_IS_FETCHING', false);
  },
  async getTechnologyBasisLimitationData({ commit }, { treatmentId, pointSourceCategoryCode }) {
    commit('SET_LIMITATION_DATA', null);
    commit('SET_COMPARE', false);
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

import axios from 'axios';

const state = {
  limitationData: null,
  isFetching: false,
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
};

const actions = {
  async getLimitationData({ commit }, id) {
    commit('SET_LIMITATION_DATA', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/wastestreamProcess/${id}`);
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
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

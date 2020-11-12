import axios from 'axios';
import { make } from 'vuex-pathify';

const state = {
  pointSourceCategoryCode: null,
  pointSourceCategoryName: null,
  pollutantId: null,
  pollutantDescription: null,
  limitationData: null,
  isFetching: false,
  longTermAvgData: null,
  isComparingPscs: false,
  treatmentNames: null,
  treatmentLimitationData: null,
  selectedTreatmentTrain: [],
  selectedTreatmentCategory: [],
  selectedTreatmentPollutant: [],
  selectedLimitationId: null,
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
      state.pollutantId = payload.pollutantId;
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

    const res = await axios.get(`api/wastestreamProcessLimitations`, {
      params: {
        id,
      },
    });
    commit('SET_LIMITATION_DATA', res.data);
    commit('SET_IS_FETCHING', false);
    commit('SET_SELECTED_LIMITATION_ID', id);
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

    const res = await axios.get(`api/limitation`, {
      params: {
        id,
      },
    });
    commit('SET_LTA_DATA', res.data);
    commit('SET_IS_FETCHING', false);
    commit('SET_SELECTED_LIMITATION_ID', id);
  },
  async getLongTermAvgDataTechSearch({ commit }, id) {
    commit('SET_LTA_DATA', null);
    commit('SET_IS_FETCHING', true);

    const res = await axios.get(`api/limitation`, {
      params: {
        id,
      },
    });
    commit('SET_LTA_DATA', res.data);
    commit('SET_IS_FETCHING', false);
    commit('SET_SELECTED_LIMITATION_ID', id);
  },
  async getTreatmentTechnologyLimitations({ commit, state, rootState }) {
    commit('SET_IS_FETCHING', true);

    let data = null;

    // Only search if one or more criteria has been selected
    if (
      state.selectedTreatmentTrain.length > 0 ||
      state.selectedTreatmentCategory.length > 0 ||
      state.selectedTreatmentPollutant.length > 0
    ) {
      const res = await axios.get('api/treatmentTechnologyLimitations', {
        params: {
          id: rootState.search.treatmentTechnologyData.id,
          treatmentId: state.selectedTreatmentTrain.map((t) => t.id).join(';'),
          pointSourceCategoryCode: state.selectedTreatmentCategory.map((t) => t.pointSourceCategoryCode).join(';'),
          pollutantId: state.selectedTreatmentPollutant.map((t) => t.pollutantDescription).join(';'),
        },
      });

      data = res.data;
    }

    commit('SET_TREATMENT_LIMITATION_DATA', data);
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

import axios from 'axios';
import { make } from 'vuex-pathify';

const state = {
  isFetching: false,

  // lookups to feed dropdown lists
  multiCriteriaLookups: {},

  // selected options
  pointSourceCategoryCode: [],
  sicCode: [],
  naicsCode: [],
  pollutantId: [],
  pollutantGroupId: [],
  rangeLow: '',
  rangeHigh: '',
  rangeUnitCode: '',
  treatmentTechnologyCode: [],
  treatmentTechnologyGroup: [],

  // results
  multiCriteriaResults: null,

  // results selectors
  filterPointSourceCategoryCode: [],
  filterPollutantId: [],
  filterTreatmentId: [],

  // keyword search
  keyword: '',
  operator: 'OR',
  keywordResults: null,
};

const getters = {
  ...make.getters(state),
  multiCriteriaSelections(state) {
    return {
      pointSourceCategoryCode: state.pointSourceCategoryCode.join(';'),
      sicCode: state.sicCode.join(';'),
      naicsCode: state.naicsCode.join(';'),
      pollutantId: state.pollutantId.join(';'),
      pollutantGroupId: state.pollutantGroupId.join(';'),
      rangeLow: state.rangeLow,
      rangeHigh: state.rangeHigh,
      rangeUnitCode: state.rangeUnitCode,
      treatmentTechnologyCode: state.treatmentTechnologyCode.join(';'),
      treatmentTechnologyGroup: state.treatmentTechnologyGroup.join(';'),
      filterPointSourceCategoryCode: state.filterPointSourceCategoryCode.join(';'),
      filterPollutantId: state.filterPollutantId.join(';'),
      filterTreatmentId: state.filterTreatmentId.join(';'),
    };
  },
  multiCriteriaDownloadUrl(state, getters) {
    return `/api/multiCriteriaSearch?${new URLSearchParams(getters.multiCriteriaSelections).toString()}`;
  },
  keywordDownloadUrl(state) {
    return `/api/keywordSearch?${new URLSearchParams({ keyword: state.keyword.join(';'), operator: state.operator })}`;
  },
};

const mutations = {
  // "make" helper automatically creates mutations for each property within the state object, e.g. "SET_CATEGORIES"
  ...make.mutations(state),
  SET_POLLUTANT_ID(state, value) {
    state.pollutantId = value;
    state.pollutantGroupId = [];
  },
  SET_POLLUTANT_GROUP_ID(state, value) {
    state.pollutantGroupId = value;
    state.pollutantId = [];
  },
  SET_TREATMENT_TECHNOLOGY_CODE(state, value) {
    state.treatmentTechnologyCode = value;
    state.treatmentTechnologyGroup = [];
  },
  SET_TREATMENT_TECHNOLOGY_GROUP(state, value) {
    state.treatmentTechnologyGroup = value;
    state.treatmentTechnologyCode = [];
  },
  CLEAR_MULTI_CRITERIA_VALUES(state) {
    state.pointSourceCategoryCode = [];
    state.sicCode = [];
    state.naicsCode = [];
    state.pollutantId = [];
    state.pollutantGroupId = [];
    state.rangeLow = '';
    state.rangeHigh = '';
    state.rangeUnitCode = '';
    state.treatmentTechnologyCode = [];
    state.treatmentTechnologyGroup = [];
    state.multiCriteriaResults = null;
    state.filterPointSourceCategoryCode = [];
    state.filterPollutantId = [];
    state.filterTreatmentId = [];
  },
  CLEAR_KEYWORD_VALUES(state) {
    state.keyword = [];
    state.operator = 'OR';
    state.keywordResults = null;
  },
};

const actions = {
  async getMultiCriteriaLookups({ commit }) {
    commit('SET_MULTI_CRITERIA_LOOKUPS', {});

    const res = await axios.get('api/multiCriteriaSearchCriteria');
    commit('SET_MULTI_CRITERIA_LOOKUPS', res.data);
  },
  async getMultiCriteriaResults({ commit, getters, dispatch }) {
    dispatch('search/clearResultsData', null, { root: true });
    commit('SET_IS_FETCHING', true);
    const res = await axios.get('api/multiCriteriaSearch', {
      params: getters.multiCriteriaSelections,
    });
    commit('SET_MULTI_CRITERIA_RESULTS', res.data);
    commit('SET_IS_FETCHING', true);
  },
  async getKeywordResults({ state, commit, dispatch }) {
    dispatch('search/clearResultsData', null, { root: true });
    commit('SET_IS_FETCHING', true);
    const res = await axios.get('api/keywordSearch', {
      params: {
        keyword: state.keyword.join(';'),
        operator: state.operator,
      },
    });
    commit('SET_KEYWORD_RESULTS', res.data);
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

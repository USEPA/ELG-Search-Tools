import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import pathify from 'vuex-pathify';
import search from './modules/search';
import customSearch from './modules/customSearch';
import limitations from './modules/limitations';
import results from './modules/results';
import aboutCfr from './modules/aboutCfr';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: { search, customSearch, limitations, results, aboutCfr },
  plugins: [createPersistedState(), pathify.plugin],
});

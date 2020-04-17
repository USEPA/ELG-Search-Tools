import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import pathify from 'vuex-pathify';
import search from './modules/search';
import limitations from './modules/limitations';
import results from './modules/results';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: { search, limitations, results },
  plugins: [createPersistedState(), pathify.plugin],
});

import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import search from './modules/search';
import results from './modules/results';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: { search, results },
  plugins: [createPersistedState()],
});

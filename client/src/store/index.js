import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import search from './modules/search';
import limitations from './modules/limitations';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: { search, limitations },
  plugins: [createPersistedState()],
});

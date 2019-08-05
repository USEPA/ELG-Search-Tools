import Vue from 'vue';
import Vuex from 'vuex';
import ref from './modules/ref';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    ref,
  },
});

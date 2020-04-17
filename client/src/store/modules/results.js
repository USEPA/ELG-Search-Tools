import { make } from 'vuex-pathify';

const state = {
  activeTab: null,
};

const mutations = make.mutations(state);

export default {
  namespaced: true,
  state,
  mutations,
};

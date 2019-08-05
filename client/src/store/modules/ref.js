import axios from 'axios';

const state = {
  roles: [],
};

const mutations = {
  SET_REF(state, payload) {
    state[payload.ref] = payload.data;
  },
};

const actions = {
  async getData({ commit }) {
    const roles = await axios.get('api/roles');
    commit('SET_REF', { ref: 'roles', data: roles.data.map((role) => role.label) });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};

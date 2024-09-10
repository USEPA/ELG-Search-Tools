import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import search from './modules/search';
import customSearch from './modules/customSearch';
import limitations from './modules/limitations';
import results from './modules/results';
import aboutCfr from './modules/aboutCfr';

const getMutationName = (key) => `SET_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;

const modules = { search, customSearch, limitations, results, aboutCfr };
// Loop through each module and create a mutation for each state variable
Object.keys(modules).forEach((moduleName) => {
  const module = modules[moduleName];
  const { state } = modules[moduleName];
  const mutations = {};
  Object.keys(state).forEach((key) => {
    // Convert camelCase variable names to snake_case mutation names
    const mutationName = getMutationName(key);
    mutations[mutationName] = (state, value) => {
      state[key] = value;
    };
  });
  module.mutations = { ...mutations, ...module.mutations };
});

const store = createStore({
  modules: { search, customSearch, limitations, results, aboutCfr },
  plugins: [createPersistedState()],
});
export default store;

export const mapStateToComputed = (namespace, prop) => {
  return {
    get() {
      return store.state[namespace][prop];
    },
    set(value) {
      store.commit(`${namespace}/${getMutationName(prop)}`, value);
    },
  };
};

export const mapStatesToComputed = (namespace, props) => {
  const computed = {};
  props.forEach((prop) => {
    computed[prop] = mapStateToComputed(namespace, prop);
  });
  return computed;
};

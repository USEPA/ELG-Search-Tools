import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import '../static/app.scss';
// import './registerServiceWorker';
import router from './router';
import store from './store/index';
import App from './App';

Vue.config.productionTip = false;

Vue.use(VueAxios, axios);
Vue.axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3000';
Vue.router = router;

Vue.use(require('@websanova/vue-auth'), {
  auth: require('@websanova/vue-auth/drivers/auth/bearer.js'),
  http: require('@websanova/vue-auth/drivers/http/axios.1.x.js'),
  router: require('@websanova/vue-auth/drivers/router/vue-router.2.x.js'),
  registerData: {
    redirect: '/search',
  },
  refreshData: { enabled: false },
  notFoundRedirect: { path: '/search' },
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

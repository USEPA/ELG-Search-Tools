import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import '../static/app.scss';
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import router from './router';
import store from './store/index';
import App from './App';

// Import heavily-used components for global use
import Alert from './components/shared/Alert';
import HelpLinks from './components/shared/HelpLinks';
import Modal from './components/shared/Modal';
import LoadingIndicator from './components/shared/LoadingIndicator';
import HoverText from './components/shared/HoverText';

Vue.component('VueSelect', VueSelect);
Vue.component('Alert', Alert);
Vue.component('HelpLinks', HelpLinks);
Vue.component('Modal', Modal);
Vue.component('LoadingIndicator', LoadingIndicator);
Vue.component('HoverText', HoverText);

Vue.config.productionTip = false;

Vue.use(VueAxios, axios);
Vue.axios.defaults.baseURL =
  process.env.NODE_ENV === 'production' ? `${window.location.origin}/elg` : process.env.VUE_APP_API_URL;

// Need to set these headers to no-cache to fix IE11 issue where new requests are not sent
Vue.axios.defaults.headers.common['Cache-Control'] = 'no-cache';
Vue.axios.defaults.headers.common.Pragma = 'no-cache';

Vue.router = router;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

import { createApp } from 'vue';
import axios from 'axios';
import '../static/app.scss';
import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import router from './router';
import store from './store/index';
import App from './App.vue';

// Import heavily-used components for global use
import Alert from './components/shared/Alert.vue';
import HelpLinks from './components/shared/HelpLinks.vue';
import Modal from './components/shared/Modal.vue';
import LoadingIndicator from './components/shared/LoadingIndicator.vue';
import HoverText from './components/shared/HoverText.vue';

// Import USWDS JS for sitewide gov banner
import { accordion, banner } from '@uswds/uswds/src/js/components';

// Initialize Vue app and link to router and store
const app = createApp(App);
app.use(router);
app.use(store);

// Activate sitewide gov banner toggle
const bannerEl = document.querySelector('.usa-banner');
accordion.on(bannerEl);
banner.on(bannerEl);

// Register global components for use throughout app
app
  .component('VueSelect', VueSelect)
  .component('Alert', Alert)
  .component('HelpLinks', HelpLinks)
  .component('Modal', Modal)
  .component('LoadingIndicator', LoadingIndicator)
  .component('HoverText', HoverText);

// Set up axios
axios.defaults.baseURL = import.meta.env.MODE === 'prod' ? `${window.location.origin}/elg` : '';

// Need to set these headers to no-cache to fix IE11 issue where new requests are not sent
axios.defaults.headers.common['Cache-Control'] = 'no-cache';
axios.defaults.headers.common.Pragma = 'no-cache';
app.config.globalProperties.$http = axios;

app.mount('#app');

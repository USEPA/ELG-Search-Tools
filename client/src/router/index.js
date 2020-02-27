import Vue from 'vue';
import Router from 'vue-router';
import Search from '@/views/Search';
import Results from '@/views/Results';
import CustomSearch from '@/views/CustomSearch';
import Limitations from '@/views/Limitations';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'root',
      component: Search,
    },
    {
      path: '/customSearch',
      name: 'customSearch',
      component: CustomSearch,
    },
    {
      path: '/results',
      name: 'results',
      component: Results,
    },
    {
      path: '/limitations',
      name: 'limitations',
      component: Limitations,
    },
  ],
  mode: 'history',
});

export default router;

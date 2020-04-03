import Vue from 'vue';
import Router from 'vue-router';
import Search from '@/views/Search';
import Results from '@/views/Results';
import CustomSearch from '@/views/CustomSearch';
import Limitations from '@/views/Limitations';
import LongTermAvg from '@/views/LongTermAvg';
import TechnologyBasis from '@/views/TechnologyBasis';

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
    {
      path: '/longTermAverage',
      name: 'longTermAverage',
      component: LongTermAvg,
    },
    {
      path: '/technologyBasis',
      name: 'technologyBasis',
      component: TechnologyBasis,
    },
  ],
  mode: 'history',
});

export default router;

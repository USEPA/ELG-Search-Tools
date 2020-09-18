import Vue from 'vue';
import Router from 'vue-router';
import Search from '@/views/Search';
import Results from '@/views/Results';
import CustomSearch from '@/views/CustomSearch';
import Limitations from '@/views/Limitations';
import LongTermAvg from '@/views/LongTermAvg';
import TechnologyBasis from '@/views/TechnologyBasis';
import AboutCFR from '@/views/AboutCFR';
import CitationHistory from '@/views/CitationHistory';

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
      path: '/results/limitations',
      name: 'limitations',
      component: Limitations,
    },
    {
      path: '/results/limitations/longTermAverage',
      name: 'longTermAverage',
      component: LongTermAvg,
    },
    {
      path: '/results/technologyBasis',
      name: 'technologyBasis',
      component: TechnologyBasis,
    },
    {
      path: '/results/about-cfr',
      name: 'aboutCfr',
      component: AboutCFR,
    },
    {
      path: '/results/about-cfr/citation-history',
      name: 'citationHistory',
      component: CitationHistory,
    },
  ],
  mode: 'history',
  scrollBehavior(to, from, savedPosition) {
    // Logic to scroll to hash links when route changes
    if (to.hash) {
      return {
        selector: to.hash,
      };
    }
    // If user has scrolled below start of main content area, scroll back to top of main content on a new route change
    const mainContent = document.querySelector('#app');
    const mainYOffset = mainContent.getBoundingClientRect().top;
    if (mainYOffset < 0) {
      return { x: 0, y: window.pageYOffset + mainYOffset };
    }
    return savedPosition;
  },
});

export default router;

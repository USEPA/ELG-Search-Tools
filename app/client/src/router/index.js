import { createRouter, createWebHistory } from 'vue-router';
import Search from '@/views/Search.vue';
import Results from '@/views/Results.vue';
import Limitations from '@/views/Limitations.vue';
import LongTermAvg from '@/views/LongTermAvg.vue';
import AboutCFR from '@/views/AboutCFR.vue';
import CitationHistory from '@/views/CitationHistory.vue';
import NotFound from '@/views/NotFound.vue';

const router = new createRouter({
  history: createWebHistory(import.meta.env.MODE === 'prod' ? '/elg' : '/'),
  routes: [
    {
      path: '/',
      name: 'root',
      component: Search,
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
      path: '/results/limitations/long-term-average',
      name: 'longTermAverage',
      component: LongTermAvg,
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
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFound,
    },
  ],
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
      return { left: 0, top: window.pageYOffset + mainYOffset };
    }
    return savedPosition;
  },
});

export default router;

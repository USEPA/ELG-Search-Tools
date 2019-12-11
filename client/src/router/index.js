import Vue from 'vue';
import Router from 'vue-router';
import Search from '@/views/Search';
import Results from '@/views/Results';

Vue.use(Router);

const router = new Router({
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
  ],
  mode: 'history',
});

router.afterEach((to) => {
  // Set Google Analytics event for navigating pages without browser reload
  gtag('config', 'UA-37504877-5', { page_path: to.path });
  gtag('event', 'page_view');
});

export default router;

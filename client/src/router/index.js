import Vue from 'vue';
import Router from 'vue-router';
import Search from '@/views/Search';
import PageNotFound from '@/views/PageNotFound';

Vue.use(Router);

function guard(to, from, next) {
  if (Vue.auth.check()) {
    next();
  } else {
    next({ path: '/', query: { redirected: true } });
  }
}

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'root',
      component: Search,
      meta: { auth: false },
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
      beforeEnter: guard,
    },
    {
      path: '*',
      name: 'pageNotFound',
      component: PageNotFound,
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

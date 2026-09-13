import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'Home',
    path: '/home',
    component: () => import('#/views/home/index.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:house',
      order: Number.MIN_SAFE_INTEGER,
      title: $t('page.home.title'),
    },
  },
  {
    name: 'About',
    path: '/about',
    component: () => import('#/views/_core/about/index.vue'),
    meta: {
      icon: 'lucide:info',
      order: Number.MAX_SAFE_INTEGER,
      title: $t('page.about.title'),
    },
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      hideInMenu: true,
      icon: 'lucide:user',
      title: $t('page.auth.profile'),
    },
  },
  {
    name: 'DashboardRedirect',
    path: '/dashboard',
    redirect: '/home',
    meta: {
      hideInMenu: true,
      hideInTab: true,
      title: $t('page.home.title'),
    },
  },
];

export default routes;

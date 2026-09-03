import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        name: 'DashboardOverview',
        path: '',
        component: () => import('#/views/dashboard/index.vue'),
        meta: {
          affixTab: true,
          title: $t('page.dashboard.overview'),
        },
      },
    ],
  },
];

export default routes;

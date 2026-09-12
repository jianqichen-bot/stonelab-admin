import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: { icon: 'lucide:gem', order: 10, title: '商品中心' },
    name: 'Catalog',
    path: '/catalog',
    children: [
      {
        name: 'CatalogCategories',
        path: 'categories',
        component: () => import('#/views/catalog/categories/index.vue'),
        meta: { title: '分类管理' },
      },
      {
        name: 'CatalogProducts',
        path: 'products',
        component: () => import('#/views/catalog/products/index.vue'),
        meta: { title: '珠子商品' },
      },
    ],
  },
];

export default routes;

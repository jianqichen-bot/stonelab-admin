import type { RouteRecordRaw } from 'vue-router';

import { mergeRouteModules, traverseTreeValues } from '@vben/utils';

import { coreRoutes, fallbackNotFoundRoute } from './core';
import fixedRoutes from './fixed';

const dynamicRouteFiles = import.meta.glob('./modules/**/*.ts', {
  eager: true,
});

// 有需要可以自行打开注释，并创建文件夹
// const externalRouteFiles = import.meta.glob('./external/**/*.ts', { eager: true });

/** 动态路由 */
const dynamicRoutes: RouteRecordRaw[] = mergeRouteModules(dynamicRouteFiles);

/** 外部路由列表，访问这些页面可以不需要Layout，可能用于内嵌在别的系统(不会显示在菜单中) */
// const externalRoutes: RouteRecordRaw[] = mergeRouteModules(externalRouteFiles);
const externalRoutes: RouteRecordRaw[] = [];

const routesWithFixedChildren = coreRoutes.map((route) =>
  route.name === 'Root'
    ? { ...route, children: [...(route.children ?? []), ...fixedRoutes] }
    : route,
);

/** 启动时注册的基础、固定、外部和兜底路由。固定业务页仍需登录。 */
const routes: RouteRecordRaw[] = [
  ...routesWithFixedChildren,
  ...externalRoutes,
  fallbackNotFoundRoute,
];

/** 基本路由列表，这些路由不需要进入权限拦截 */
const coreRouteNames = traverseTreeValues(coreRoutes, (route) => route.name);

/** 需要根据角色或后端菜单生成的路由 */
const accessRoutes = [...dynamicRoutes];
export { accessRoutes, coreRouteNames, fixedRoutes, routes };

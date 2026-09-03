const BasicLayout = () => import('./basic.vue');
const AuthPageLayout = () => import('./auth.vue');

// 动态路由生成器要求保留 iframe 布局映射，即使当前没有 iframe 菜单。
const IFrameView = () => import('@vben/layouts').then((m) => m.IFrameView);

export { AuthPageLayout, BasicLayout, IFrameView };

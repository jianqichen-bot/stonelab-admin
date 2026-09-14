import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';
import { generateMenus } from '@vben/utils';

import { message } from 'ant-design-vue';

import { getAllMenusApi, getMenuTranslationsApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t, registerDynamicMenuTranslations } from '#/locales';
import { fixedRoutes } from '#/router/routes';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  const result = await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      });
      const [menus, translations] = await Promise.all([
        getAllMenusApi(),
        getMenuTranslationsApi(),
      ]);
      registerDynamicMenuTranslations(translations);
      return menus;
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });

  return {
    ...result,
    accessibleMenus: generateMenus(
      [...fixedRoutes, ...result.accessibleRoutes],
      options.router,
    ),
  };
}

export { generateAccess };

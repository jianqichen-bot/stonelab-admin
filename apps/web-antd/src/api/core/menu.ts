import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

export interface MenuTranslations {
  'en-US': { menu: Record<string, string> };
  'zh-CN': { menu: Record<string, string> };
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>('/menu/all');
}

export async function getMenuTranslationsApi() {
  return requestClient.get<MenuTranslations>('/menu/translations');
}

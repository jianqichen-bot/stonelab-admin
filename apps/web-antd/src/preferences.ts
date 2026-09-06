import { defineOverridesPreferences } from '@vben/preferences';

const LEGACY_PRIMARY_COLOR = 'hsl(145 22% 30%)';
const STONELAB_PRIMARY_COLOR = 'hsl(212 100% 45%)';

/** StoneLab 的应用级默认配置。 */
export const overridesPreferences = defineOverridesPreferences({
  app: {
    defaultAvatar: '/stonelab-logo.svg',
    defaultHomePath: '/dashboard',
    enableCheckUpdates: false,
    enableCopyPreferences: false,
    locale: 'zh-CN',
    name: import.meta.env.VITE_APP_TITLE,
  },
  copyright: {
    enable: false,
    settingShow: false,
  },
  logo: {
    source: '/stonelab-logo.svg',
    sourceDark: '/stonelab-logo.svg',
  },
  theme: {
    builtinType: 'default',
    colorPrimary: STONELAB_PRIMARY_COLOR,
    mode: 'light',
    radius: '0.5',
  },
  widget: {
    languageToggle: false,
    notification: false,
    timezone: false,
  },
});

/** 将历史默认绿色迁移为新默认蓝色，保留用户自行选择的其他颜色。 */
export function migrateLegacyThemeColor(namespace: string) {
  try {
    const storageKey = `${namespace}-preferences`;
    const cachedValue = localStorage.getItem(storageKey);
    if (!cachedValue) return;

    const cached = JSON.parse(cachedValue) as {
      value?: { theme?: { colorPrimary?: string } };
    };
    if (cached.value?.theme?.colorPrimary !== LEGACY_PRIMARY_COLOR) return;

    cached.value.theme.colorPrimary = STONELAB_PRIMARY_COLOR;
    localStorage.setItem(storageKey, JSON.stringify(cached));
  } catch {
    // 缓存不可用或数据损坏时由偏好设置模块按默认值初始化。
  }
}

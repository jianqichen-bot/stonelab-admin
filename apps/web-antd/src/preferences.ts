import { defineOverridesPreferences } from '@vben/preferences';

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
    colorPrimary: 'hsl(145 22% 30%)',
    mode: 'light',
    radius: '0.5',
  },
  widget: {
    languageToggle: false,
    notification: false,
    timezone: false,
  },
});

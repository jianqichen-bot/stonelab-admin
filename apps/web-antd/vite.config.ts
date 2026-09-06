import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            // 本地 StoneLab 服务端，保留 /api 前缀原样转发。
            target: 'http://localhost:3100',
            ws: true,
          },
        },
      },
    },
  };
});

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const config = {
    // Account for "/elg" on deployed cloud.gov app URLs
    base: mode === 'prod' ? '/elg/' : '/',
    build: {
      // Store bundled files in server so we only need to deploy server files to Cloud.gov
      outDir: path.resolve(__dirname, '../server/public'), // To be served by Express server
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
            return null;
          },
        },
      },
    },
    plugins: [vue()],
    server: {
      port: 8080,
      proxy: {
        '^/(api|docs)': {
          target: process.env.VITE_APP_BASE_URL,
          changeOrigin: true,
          secure: false,
          headers: {
            Connection: 'keep-alive',
          },
        },
      },
    },
    resolve: {
      alias: [
        {
          find: '~',
          replacement: path.resolve(__dirname, 'node_modules'),
        },
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src'),
        },
        {
          find: 'components',
          replacement: path.resolve(__dirname, 'src/components'),
        },
      ],
    },
  };

  return config;
});

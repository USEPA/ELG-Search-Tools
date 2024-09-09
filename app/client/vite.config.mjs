import path from 'path';
import { defineConfig, splitVendorChunkPlugin, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue2';

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const config = {
    // Account for "/elg" on deployed cloud.gov app URLs
    base: mode === 'prod' ? '/elg/' : '/',
    build: {
      // Store bundled files in server so we only need to deploy server files to Cloud.gov
      outDir: path.resolve(__dirname, '../server/public'), // To be served by Express server
      emptyOutDir: true,
    },
    plugins: [vue(), splitVendorChunkPlugin()],
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

  // Point to minified vue for production builds
  if (mode === 'prod') {
    config.resolve.alias.push({
      find: 'vue',
      replacement: path.resolve(__dirname, './node_modules/vue/dist/vue.min.js'),
    });
  }

  return config;
});

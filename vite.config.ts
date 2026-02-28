import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    legacy({
      targets: ['chrome >= 53', 'not IE 11'],
      polyfills: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'chrome53', // WebOS 4 and newer
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  server: {
    // https: {
    //   key: fs.readFileSync('/Users/CodeWisdom/ssl/localhost.key'),
    //   cert: fs.readFileSync('/Users/CodeWisdom/ssl/localhost.crt')
    // },
    host: 'localhost',
    port: 3000
    // proxy: {
    //   '/api': {
    //     target: 'https://xmw.siberapi.com/',
    //     changeOrigin: true,
    //     secure: true,
    //     rewrite: (path) => path.replace(/^\/api/, '/device/manage_device.php')
    //   }
    // }
  }
})

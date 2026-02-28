import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
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

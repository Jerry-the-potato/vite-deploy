import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true, // 啟用 Source Maps
    minify: false, // 禁用代碼縮減
    // rollupOptions: {
    //   input: {
    //     main: '/index.html',  // 主入口文件
    //     animateManager: '/src/js/animateManager.js',
    //     lokaVolterra: '/src/js/lokaVolterra.js',
    //     musicAnalyser: '/src/js/musicAnalyser.js',
    //     physic: '/src/js/physic.js'
    //   }
    // }
  },
  plugins: [react()],
  base: '/vite-deploy/'
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    open: true, // 启动时自动打开浏览器
    proxy: {
      // 可选：配置代理解决跨域（也可以用后端cors）
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
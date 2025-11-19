import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // /api 로 시작하는 요청이 오면 시놀로지 백엔드로 토스!
      '/api': {
        target: 'http://192.168.0.5:5050', // 본인 시놀로지 IP로 수정 필수!
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
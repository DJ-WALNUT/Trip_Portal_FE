/* global process */
import { fileURLToPath } from "node:url"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: { // <-- 2. 이 부분 전체 추가
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // /api 로 시작하는 요청이 오면 시놀로지 백엔드로 토스!
      '/api': {
        target: process.env.VITE_API_TARGET || 'https://trip-api.cukeng.kr', // 본인 시놀로지 IP로 수정 필수! - http://192.168.0.5:5050
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
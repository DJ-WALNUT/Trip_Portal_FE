import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios' // axios 임포트 확인!

// ▼▼▼ 이 부분을 추가하세요! ▼▼▼
// 배포(Production) 환경일 때만 백엔드 주소를 강제로 지정합니다.
if (import.meta.env.PROD) {
  axios.defaults.baseURL = 'https://trip-api.cukeng.kr';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

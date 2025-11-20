import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// 배포 환경 주소 설정
if (import.meta.env.PROD) {
  axios.defaults.baseURL = 'https://trip-api.cukeng.kr'; 
}

// [보안] Axios 응답 인터셉터 (전역 에러 처리)
axios.interceptors.response.use(
  (response) => response, // 성공하면 그대로 통과
  (error) => {
    // 서버가 401(Unauthorized) 에러를 보냈고, 그게 로그인 시도 중이 아닐 때
    if (error.response && error.response.status === 401 && error.config.url !== '/api/admin/login') {
      console.warn("세션이 만료되어 로그아웃됩니다.");
      
      // 흔적 지우고 강제 이동
      localStorage.removeItem('isAdmin');
      alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
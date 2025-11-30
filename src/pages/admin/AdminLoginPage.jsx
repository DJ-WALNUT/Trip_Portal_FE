import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLoginPage.css'; // 스타일 파일

function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // [NEW] 페이지 로드 시 이미 로그인되어 있는지 체크
  useEffect(() => {
    const checkLoginStatus = async () => {
      // 1. 로컬스토리지 체크
      if (localStorage.getItem('isAdmin')) {
        try {
          // 2. 백엔드 세션 체크 (더 확실하게)
          await axios.get('/api/admin/check-session');
          // 둘 다 통과하면 바로 대시보드로 이동
          navigate('/admin/dashboard'); 
        } catch (e) {
          // 백엔드 세션이 만료되었으면 로컬스토리지도 청소
          localStorage.removeItem('isAdmin');
        }
      }
    };
    checkLoginStatus();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // 백엔드로 비밀번호 전송
      const response = await axios.post('/api/admin/login', { password });
      
      if (response.data.status === 'success') {
        // 로그인 성공!
        // 브라우저에 '나 관리자야'라고 표시 (새로고침 해도 유지되게 localStorage 사용)
        localStorage.setItem('isAdmin', 'true'); 
        alert("관리자님 환영합니다! 👋");
        navigate('/admin/dashboard'); // 대시보드로 이동
      } 
    } catch (error) {
      // 401 에러(비번 틀림) 등이 오면 여기로
      if (error.response && error.response.status === 401) {
        alert("비밀번호가 틀렸습니다.");
      } else {
        alert("서버 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="container login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>관리자 로그인 ⚙️</h2>
        <p>관리자 비밀번호를 입력해주세요.</p>
        
        <input 
          type="password" 
          placeholder="비밀번호" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        <button type="submit" className="submit-btn">로그인</button>
      </form>
    </div>
  );
}

export default AdminLoginPage;
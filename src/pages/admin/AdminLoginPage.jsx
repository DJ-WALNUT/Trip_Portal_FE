import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LucianIcon from '@/components/icons/LucianIcon';
import { Card, Field, Button } from '@/components/ui';
import './AdminLoginPage.css'; // 스타일 파일

function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
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
        } catch {
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
        setUnlocked(true);
        localStorage.setItem('isAdmin', 'true'); 
        localStorage.setItem('adminRole', response.data.role); // 'master' 또는 'sub' 저장
        alert(`${response.data.role === 'master' ? '마스터' : ''} 관리자님 환영합니다!`);
        navigate('/admin/dashboard');
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
    <div className="admin-login">
      <Card className="admin-login__card">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="admin-login__icon">
            <LucianIcon name="lock" state={unlocked ? 'unlocked' : 'locked'} size={48} />
          </div>
          <h1 className="admin-login__title">관리자 로그인</h1>
          <p className="admin-login__desc">관리자 비밀번호를 입력해주세요.</p>
          <Field label="비밀번호" htmlFor="admin-password">
            <input
              id="admin-password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Field>
          <Button type="submit" block>로그인</Button>
        </form>
      </Card>
    </div>
  );
}

export default AdminLoginPage;

// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // 로컬 스토리지에서 관리자 여부 확인
  const isAdmin = localStorage.getItem('isAdmin');

  // 관리자가 아니면 로그인 페이지로 즉시 리다이렉트 (alert 없이 조용히 보냄)
  // 만약 알림을 띄우고 싶다면 useEffect를 써야 하지만, 보안상 아예 접근 차단이 깔끔함
  if (!isAdmin) {
    alert("접근 권한이 없습니다. 관리자 로그인이 필요합니다.");
    return <Navigate to="/admin" replace />;
  }

  // 관리자라면 자식 라우트(Outlet)를 보여줌
  return <Outlet />;
};

export default ProtectedRoute;
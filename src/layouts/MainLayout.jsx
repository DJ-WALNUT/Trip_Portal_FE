// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header'; // 사용 중인 헤더 컴포넌트

const MainLayout = () => {
  return (
    <>
      <Header /> {/* 고정 헤더 */}
      
      {/* 헤더 높이만큼 여백을 주는 Wrapper */}
      <div className="content-with-header" style={{ marginTop: '70px' }}> 
        <Outlet /> {/* 실제 페이지들이 들어갈 자리 */}
      </div>
    </>
  );
};

export default MainLayout;
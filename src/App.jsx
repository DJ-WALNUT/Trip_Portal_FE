import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import TeaserPage from './pages/client/TeaserPage';
import AdminTeaserPage from './pages/admin/AdminTeaserPage';
import DinoGame from './components/z_dino(easter)/DinoGame';

import MainLayout from './layouts/MainLayout';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import NoticePage from './pages/client/notice/NoticePage';
import NoticeDetailPage from './pages/client/notice/NoticeDetailPage';
import MapPage from './pages/client/MapPage';
import BorrowPage from './pages/client/borrow/BorrowPage';
import CheckPage from './pages/client/borrow/CheckPage';
import SuccessPage from './pages/client/borrow/SuccessPage';
import DepartmentPage from './pages/client/DepartmentPage';

import TermsPage from './pages/client/terms/TermsPage';
import PrivacyPage from './pages/client/terms/PrivacyPage';
import EmailRefusalPage from './pages/client/terms/EmailRefusalPage';
import CreditsPage from './pages/client/terms/CreditsPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminNoticeListPage from './pages/admin/AdminNoticeListPage';
import AdminNoticeWritePage from './pages/admin/AdminNoticeWritePage';
import AdminInstagramPage from './pages/admin/AdminInstagramPage';
import AdminApprovePage from './pages/admin/borrow/AdminApprovePage';
import AdminReturnPage from './pages/admin/borrow/AdminReturnPage';
import AdminStockPage from './pages/admin/borrow/AdminStockPage';
import AdminLogPage from './pages/admin/borrow/AdminLogPage';

// 관리자 페이지는 아직 임시
const AdminPage = () => <div className="container"><h2>관리자 페이지 (곧 만듭니다!)</h2></div>;

function App() {
  const [showGame, setShowGame] = useState(false);
  // === [1] PC용 이스터에그: 코나미 커맨드 ===
  useEffect(() => {
    const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let cursor = 0;

    const handleKeyDown = (e) => {
      if (e.key === konamiCode[cursor]) {
        cursor++;
        if (cursor === konamiCode.length) {
          setShowGame(true);
          cursor = 0;
        }
      } else {
        cursor = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // === [2] 모바일용 이스터에그: 푸터 5회 연속 터치 ===
  const lastTapTimeRef = useRef(0);
  const tapCountRef = useRef(0);

  const handleMobileEasterEgg = () => {
    const now = Date.now();
    const timeDiff = now - lastTapTimeRef.current;

    // 0.5초(500ms) 이내에 다시 터치했는지 확인
    if (timeDiff < 500 && timeDiff > 0) {
      tapCountRef.current += 1;
    } else {
      // 시간이 너무 지났으면 카운트 리셋
      tapCountRef.current = 1;
    }

    lastTapTimeRef.current = now;

    // 5번 연속 터치 시 게임 실행
    if (tapCountRef.current === 5) {
      setShowGame(true);
      tapCountRef.current = 0; // 카운트 초기화
    }
  };

  return (
    <Router>
      <ScrollToTop />
      <DinoGame isOpen={showGame} onClose={() => setShowGame(false)} />
      <div className="wrapper">
        <Routes>
          <Route path="/" element={<TeaserPage />} />
          <Route path="/teaser/departments" element={<DepartmentPage />} />
          <Route path="/teaser/campusmap" element={<MapPage />} />

          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms/privacy" element={<PrivacyPage />} />
          <Route path="/terms/emailrefusal" element={<EmailRefusalPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          
          <Route element={<MainLayout />}>
            {/* 티저페이지 오픈 시 아래 통상페이지 주석처리
                혹은 <ProtectedRoute>에 포함할 것 */}
            <Route path="/main" element={<HomePage />} />
            <Route path="/notices" element={<NoticePage />} />
            <Route path="/notices/:id" element={<NoticeDetailPage />} />
            <Route path="/campusmap" element={<MapPage />} />
            <Route path="/departments" element={<DepartmentPage />} />
            {/* 대여사업 전 비공개
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/check" element={<CheckPage />} />
            <Route path="/success" element={<SuccessPage />} />*/}

            <Route path="/admin" element={<AdminLoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/teaser" element={<AdminTeaserPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/notices" element={<AdminNoticeListPage />} />
              <Route path="/admin/notices/write" element={<AdminNoticeWritePage />} />
              <Route path="/admin/notices/edit/:id" element={<AdminNoticeWritePage />} />
              <Route path="/admin/instagram" element={<AdminInstagramPage />} />
              <Route path="/admin/borrow/approve" element={<AdminApprovePage />} />
              <Route path="/admin/borrow/return" element={<AdminReturnPage />} />
              <Route path="/admin/borrow/stock" element={<AdminStockPage />} />
              <Route path="/admin/borrow/log" element={<AdminLogPage />} />
            </Route>
          </Route>

          {/* 그 외 모든 경로는 메인으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <div onClick={handleMobileEasterEgg} style={{ width: '100%' }}>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
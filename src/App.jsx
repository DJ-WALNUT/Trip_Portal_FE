import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import TeaserPage from './pages/client/TeaserPage';
import AdminTeaserPage from './pages/admin/AdminTeaserPage';

import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import NoticePage from './pages/NoticePage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import BorrowPage from './pages/client/borrow/BorrowPage';
import CheckPage from './pages/client/borrow/CheckPage';
import SuccessPage from './pages/client/borrow/SuccessPage';
import DepartmentPage from './pages/client/DepartmentPage';

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
  return (
    <Router>
      <div className="wrapper">
        <Routes>
          <Route path="/" element={<TeaserPage />} />
           
          <Route path="/main" element={<><Header /><HomePage /></>} />
          <Route path="/notices" element={<><Header /><NoticePage /></>} />
          <Route path="/notices/:id" element={<><Header /><NoticeDetailPage /></>} />
          <Route path="/departments" element={<><Header /><DepartmentPage /></>} />
          <Route path="/borrow" element={<><Header /><BorrowPage /></>} />
          <Route path="/check" element={<><Header /><CheckPage /></>} />
          <Route path="/success" element={<><Header /><SuccessPage /></>} />

          <Route path="/admin" element={<><Header /><AdminLoginPage /></>} />
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

          {/* 그 외 모든 경로는 메인으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
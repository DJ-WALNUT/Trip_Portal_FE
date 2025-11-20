import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import TeaserPage from './pages/TeaserPage';
import AdminTeaserPage from './pages/admin/AdminTeaserPage';

import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import BorrowPage from './pages/BorrowPage';
import CheckPage from './pages/CheckPage';
import SuccessPage from './pages/SuccessPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminApprovePage from './pages/admin/AdminApprovePage';
import AdminReturnPage from './pages/admin/AdminReturnPage';
import AdminStockPage from './pages/admin/AdminStockPage';
import AdminLogPage from './pages/admin/AdminLogPage';

// 관리자 페이지는 아직 임시
const AdminPage = () => <div className="container"><h2>관리자 페이지 (곧 만듭니다!)</h2></div>;

// [보안] 관리자 인증 체크 컴포넌트
// 로그인을 안 했으면 강제로 로그인 페이지(/admin)로 돌려보냅니다.
function RequireAuth({ children }) {
  const isAdmin = localStorage.getItem('isAdmin'); // 로그인 시 저장했던 표식 확인
  if (!isAdmin) {
    // 로그인 안 했으면 튕겨내기
    return <Navigate to="/admin" replace />;
  }
  // 로그인 했으면 통과
  return children;
}

function App() {
  return (
    <Router>
      <div className="wrapper">
        <Routes>
           <Route path="/" element={<TeaserPage />} />
           {/*<Route path="/" element={<><Header /><HomePage /></>} />*/}
           <Route path="/borrow" element={<><Header /><BorrowPage /></>} />
           <Route path="/check" element={<><Header /><CheckPage /></>} />
           <Route path="/success" element={<><Header /><SuccessPage /></>} />

           <Route path="/admin" element={<AdminLoginPage />} />
            <Route 
              path="/admin/teaser" 
              element={<RequireAuth><AdminTeaserPage /></RequireAuth>} 
            />
            <Route 
              path="/admin/dashboard" 
              element={<RequireAuth><AdminDashboardPage /></RequireAuth>} 
            />
            <Route 
              path="/admin/approve" 
              element={<RequireAuth><AdminApprovePage /></RequireAuth>} 
            />
            <Route 
              path="/admin/return" 
              element={<RequireAuth><AdminReturnPage /></RequireAuth>} 
            />
            <Route 
              path="/admin/stock" 
              element={<RequireAuth><AdminStockPage /></RequireAuth>} 
            />
            <Route 
              path="/admin/log" 
              element={<RequireAuth><AdminLogPage /></RequireAuth>} 
            />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
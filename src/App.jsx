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
           <Route path="/admin/teaser" element={<AdminTeaserPage />} />
           <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
           <Route path="/admin/approve" element={<AdminApprovePage />} />
           <Route path="/admin/return" element={<AdminReturnPage />} />
           <Route path="/admin/stock" element={<AdminStockPage />} />
           <Route path="/admin/log" element={<AdminLogPage />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
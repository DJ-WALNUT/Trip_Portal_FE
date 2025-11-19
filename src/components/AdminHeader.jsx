import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css'; // 사용자용 헤더 CSS 재사용

function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 메뉴 토글 함수
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 메뉴 닫기 (이동 시)
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    if(window.confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('isAdmin'); 
        navigate('/admin'); 
    }
  };

  return (
    <header className="header admin-header" style={{backgroundColor: '#333'}}> {/* 관리자는 짙은 회색 배경 */}
      <div className="header-content">
        {/* 1. 로고 */}
        <Link to="/admin/dashboard" className="logo" onClick={closeMenu}>
           <span className="logo-text">Trip (관리자)</span>
        </Link>

        {/* 2. 메뉴 리스트 (모바일에서는 숨겨짐) */}
        <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/" onClick={closeMenu}>사용자 홈</Link></li>
            <li><Link to="/admin/dashboard" onClick={closeMenu}>대시보드</Link></li>
            <li><Link to="/admin/approve" onClick={closeMenu}>대여 수락</Link></li>
            <li><Link to="/admin/return" onClick={closeMenu}>반납 관리</Link></li>
            <li><Link to="/admin/stock" onClick={closeMenu}>재고 관리</Link></li>
            <li><Link to="/admin/log" onClick={closeMenu}>전체 기록</Link></li>
            <li>
                <button 
                    onClick={() => { closeMenu(); handleLogout(); }} 
                    style={{background:'none', border:'none', color:'#ff6b6b', fontSize:'1rem', cursor:'pointer', fontWeight:'bold'}}
                >
                    로그아웃
                </button>
            </li>
          </ul>
        </nav>

        <button className="hamburger-btn" onClick={toggleMenu}>
          ☰
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
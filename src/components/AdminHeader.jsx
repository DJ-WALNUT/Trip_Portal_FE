import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css'; 

function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태 추가
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false); // 메뉴 닫을 때 드롭다운도 닫기
  };

  // 드롭다운 토글 함수
  const toggleDropdown = (e) => {
    e.preventDefault(); // 링크 이동 방지
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    if(window.confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('isAdmin'); 
        navigate('/admin'); 
    }
  };

  return (
    <header className="header admin-header" style={{backgroundColor: '#333'}}>
      <div className="header-content">
        <Link to="/admin/dashboard" className="logo" onClick={closeMenu}>
           <span className="logo-text">Trip (관리자)</span>
        </Link>

        <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/" onClick={closeMenu}>사용자 홈</Link></li>
            <li><Link to="/admin/dashboard" onClick={closeMenu}>대시보드</Link></li>
            <li><Link to="/admin/teaser" onClick={closeMenu}>티저 이벤트</Link></li>
            
            <li><Link to="/admin/notices" onClick={closeMenu}>공지사항</Link></li>
            <li><Link to="/admin/instagram" onClick={closeMenu}>인스타 관리</Link></li>
            
            {/* ▼▼▼ 드롭다운 메뉴 시작 ▼▼▼ */}
            <li className="dropdown-container">
              <a href="#" onClick={toggleDropdown} className="dropdown-btn">
                대여 사업 <span className="arrow">▼</span>
              </a>
              {/* 드롭다운 내용 */}
              <ul className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                <li><Link to="/admin/approve" onClick={closeMenu}>대여 수락</Link></li>
                <li><Link to="/admin/return" onClick={closeMenu}>반납 관리</Link></li>
                <li><Link to="/admin/stock" onClick={closeMenu}>재고 관리</Link></li>
                <li><Link to="/admin/log" onClick={closeMenu}>전체 기록</Link></li>
              </ul>
            </li>
            {/* ▲▲▲ 드롭다운 메뉴 끝 ▲▲▲ */}

            <li>
                <button 
                    onClick={() => { closeMenu(); handleLogout(); }} 
                    style={{background:'none', border:'none', color:'#ff6b6b', fontSize:'1rem', cursor:'pointer', fontWeight:'bold', padding: '0'}}
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
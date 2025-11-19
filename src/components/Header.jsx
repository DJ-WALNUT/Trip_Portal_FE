import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 메뉴 열고 닫기 토글
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 메뉴 클릭 시 닫기 (모바일에서 이동 후 메뉴가 닫히도록)
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* 로고 (클릭 시 메인으로) */}
        <Link to="/" className="logo" onClick={closeMenu}>
           {/* 로고 이미지가 있다면 여기에 <img> 태그를 넣으면 됩니다 */}
           <span className="logo-text">여정</span>
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/borrow" onClick={closeMenu}>물품대여</Link></li>
            <li><Link to="/check" onClick={closeMenu}>신청/대여 확인</Link></li>
            <li><Link to="/admin" onClick={closeMenu}>관리자 페이지</Link></li>
          </ul>
        </nav>

        {/* 모바일 햄버거 버튼 */}
        <button className="hamburger-btn" onClick={toggleMenu}>
          ☰
        </button>
      </div>
    </header>
  );
}

export default Header;
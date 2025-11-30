import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태 추가

  // 메뉴 열고 닫기 토글
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 메뉴 클릭 시 닫기 (모바일에서 이동 후 메뉴가 닫히도록)
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // 드롭다운 토글 함수
  const toggleDropdown = (e) => {
    e.preventDefault(); // 링크 이동 방지
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo" onClick={closeMenu}>
           {/* ▼▼▼ 로고 이미지 추가 (글자 왼쪽에 배치) ▼▼▼ */}
           <img src="/images/trip_logo.png" alt="여정 로고" className="logo-img" />
           
           <span className="logo-text">여정</span>
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/notices" onClick={closeMenu}>공지사항</Link></li>
            <li className="dropdown-container">
              <a href="#" onClick={toggleDropdown} className="dropdown-btn">
                대여 사업 <span className="arrow">▼</span>
              </a>
              {/* 드롭다운 내용 */}
              <ul className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                <li><Link to="/borrow" onClick={closeMenu}>대여 신청</Link></li>
                <li><Link to="/check" onClick={closeMenu}>신청/대여 확인</Link></li>
              </ul>
            </li>
            <li>
              <a href="https://2025saegil.cukeng.kr" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
                2025 새길
              </a>
            </li>
            <li><Link to="/departments" onClick={closeMenu}>학과지도</Link></li>
            <li><Link to="/admin/dashboard" onClick={closeMenu}>관리자 페이지</Link></li>
          </ul>
        </nav>

        <button className="hamburger-btn" onClick={toggleMenu}>
          ☰
        </button>
      </div>
    </header>
  );
}

export default Header;
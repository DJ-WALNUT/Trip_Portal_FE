import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css'; 

function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태 
  // 1. 외부 클릭 감지를 위한 Ref 생성
  const navRef = useRef(null); // 네비게이션 메뉴 감지
  const btnRef = useRef(null); // 햄버거 버튼 감지

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
  
  // 2. 외부 클릭 감지 로직 (useEffect)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 메뉴나 드롭다운이 열려있지 않다면 로직 수행 X
      if (!isMenuOpen && !isDropdownOpen) return;
  
      // 클릭된 요소가 네비게이션(navRef) 내부도 아니고, 햄버거 버튼(btnRef) 내부도 아닐 때
      if (
        navRef.current && !navRef.current.contains(event.target) &&
        btnRef.current && !btnRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
      }
    };
  
    // 마우스 클릭 이벤트 리스너 등록
    document.addEventListener('mousedown', handleClickOutside);
      
    // 컴포넌트가 사라질 때(Unmount) 리스너 제거 (메모리 누수 방지)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isDropdownOpen]); // 상태가 변할 때마다 이펙트 재실행

  return (
    <header className="header admin-header" style={{backgroundColor: '#333'}}>
      <div className="header-content">
        <Link to="/admin/dashboard" className="logo" onClick={closeMenu}>
           <span className="logo-text">Trip (관리자)</span>
        </Link>

        <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`} ref={navRef}>
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
                <li><Link to="/admin/borrow/approve" onClick={closeMenu}>대여 수락</Link></li>
                <li><Link to="/admin/borrow/return" onClick={closeMenu}>반납 관리</Link></li>
                <li><Link to="/admin/borrow/stock" onClick={closeMenu}>재고 관리</Link></li>
                <li><Link to="/admin/borrow/log" onClick={closeMenu}>전체 기록</Link></li>
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

        <button className="hamburger-btn" onClick={toggleMenu} ref={btnRef}>
          ☰
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
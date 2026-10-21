import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Megaphone, Package, Map, Network, GraduationCap, ExternalLink } from 'lucide-react';
import { useSiteInfo } from '@/context/SiteInfoContext';
import './Header.css';

function Header() {
  const { info } = useSiteInfo();
  const external = info['links.external'];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); //드롭다운 상태

  // 1. 외부 클릭 감지를 위한 Ref 생성
  const navRef = useRef(null); // 네비게이션 메뉴 감지
  const btnRef = useRef(null); // 햄버거 버튼 감지

  // 메뉴 열고 닫기 토글
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 패널 안에 포커스가 있던 채로 닫히면 햄버거 버튼으로 포커스를 돌려준다
  const restoreFocusIfInside = () => {
    if (navRef.current && navRef.current.contains(document.activeElement)) {
      btnRef.current?.focus();
    }
  };

  // 메뉴 클릭 시 닫기 (모바일에서 이동 후 메뉴가 닫히도록)
  const closeMenu = () => {
    if (isMenuOpen) restoreFocusIfInside();
    setIsMenuOpen(false);
  };

  // 모바일 패널이 열리면 첫 링크로 포커스 이동
  useEffect(() => {
    if (!isMenuOpen || !navRef.current) return;
    const first = navRef.current.querySelector('a[href]:not([aria-disabled="true"])');
    first?.focus();
  }, [isMenuOpen]);

  // Esc로 모바일 패널 닫기
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      restoreFocusIfInside();
      setIsMenuOpen(false);
      setIsDropdownOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  // 드롭다운 토글 함수
  const toggleDropdown = (e) => {
    e.preventDefault(); // 링크 이동 방지
    setIsDropdownOpen(!isDropdownOpen);
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
        if (isMenuOpen) restoreFocusIfInside();
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
    <header className="header site-header">
      <div className="header-content">
        <Link to="/" className="logo" onClick={closeMenu}>
           {/* ▼▼▼ 로고 이미지 추가 (글자 왼쪽에 배치) ▼▼▼ */}
           <img src="/images/trip_logo.png" alt="여정 로고" className="logo-img" />
           
           <span className="logo-text">여정</span>
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className="main-nav" data-open={isMenuOpen} ref={navRef}>
          <ul>
            <li><Link to="/notices" onClick={closeMenu}><Megaphone size={18} aria-hidden="true" />공지사항</Link></li>
            <li className="dropdown-container">
              <a href="#" onClick={toggleDropdown} className="dropdown-btn" aria-expanded={isDropdownOpen}>
                <Package size={18} aria-hidden="true" />대여사업 <ChevronDown size={16} className="arrow" aria-hidden="true" />
              </a>
              <ul className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                {info['rental.enabled'] ? (
                  <li><Link to="/borrow" onClick={closeMenu}>대여 신청</Link></li>
                ) : (
                  <li>
                    <a
                      href="#"
                      className="disabled-link"
                      aria-disabled="true"
                      title="대여 신청은 현재 잠시 이용할 수 없습니다."
                      onClick={(e) => e.preventDefault()}
                    >
                      대여 신청
                    </a>
                  </li>
                )}
                <li><Link to="/check" onClick={closeMenu}>신청/대여 확인</Link></li>
              </ul>
            </li>
            <li><Link to="/campusmap" onClick={closeMenu}><Map size={18} aria-hidden="true" />성심지도</Link></li>
            <li><Link to="/organ" onClick={closeMenu}><Network size={18} aria-hidden="true" />조직도</Link></li>
            <li><Link to="/departments" onClick={closeMenu}><GraduationCap size={18} aria-hidden="true" />단과대 및 학과</Link></li>
            <li>
              <a href={external.url} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
                <ExternalLink size={18} aria-hidden="true" />{external.label}
              </a>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          className="hamburger-btn"
          onClick={toggleMenu}
          ref={btnRef}
          aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
        <div className="nav-overlay" data-open={isMenuOpen} onClick={closeMenu} aria-hidden="true" />
      </div>
    </header>
  );
}

export default Header;
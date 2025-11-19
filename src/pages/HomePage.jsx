import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // 스타일 파일 (바로 아래에서 만듦)

function HomePage() {
  return (
    <div className="main-page-container">
      {/* 상단 배너 섹션 */}
      <section className="hero-section">
        <div className="catch-phrase">
          <p>4대 공과대학 학생회 [여정]</p>
          <h1>변화를 새길, 우리의 여정!</h1>
        </div>
      </section>

      {/* 메인 기능 바로가기 */}
      <section className="shortcut-section container">
        <h2>물품 대여 사업</h2>
        <div className="shortcut-grid">
          <Link to="/borrow" className="shortcut-card main-card">
            <span className="icon">📦</span>
            <div className="text">
              <h3>대여 신청</h3>
              <p>학생회 비품을 간편하게 빌려요</p>
            </div>
          </Link>
          
          <Link to="/check" className="shortcut-card main-card">
            <span className="icon">🔍</span>
            <div className="text">
              <h3>대여 확인</h3>
              <p>신청/대여 기록을 확인하세요</p>
            </div>
          </Link>
        </div>

        {/* 외부 링크 바로가기 */}
        <h2 style={{ marginTop: '3rem' }}>학교 바로가기</h2>
        <div className="shortcut-grid small-grid">
          <a href="https://www.catholic.ac.kr" target="_blank" rel="noreferrer" className="shortcut-card small-card">
            학교 홈페이지
          </a>
          <a href="https://uportal.catholic.ac.kr" target="_blank" rel="noreferrer" className="shortcut-card small-card">
            트리니티
          </a>
          <a href="https://e-cyber.catholic.ac.kr" target="_blank" rel="noreferrer" className="shortcut-card small-card">
            사이버캠퍼스
          </a>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <ul className="footer-law">
          <li><a href='#'>개인정보처리방침</a></li>
          <li><a href='#'>이메일무단수집거부</a></li>
          <li><a href='#'>Credits</a></li>
        </ul>
        <p>
          홈페이지 운영 책임자 : 김세호<br/>
          &copy; 2025 Catholic University of Korea.<br/>
          CUK Engineering Student Council <strong>Trip</strong>. All Rights Reserved<br/>
          14662 경기 부천시 원미구 지봉로 43 가톨릭대학교 니콜스관 N502 공과대학 학생회실<br/>
          E Mail : cukeng2026@gmail.com
        </p>
      </div>
    </footer>
  );
}

export default Footer;
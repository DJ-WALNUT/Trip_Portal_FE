import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteInfo } from '@/context/SiteInfoContext';
import MultilineText from '@/components/MultilineText';
import './Footer.css';

function Footer() {
  const { info } = useSiteInfo();
  return (
    <footer className="footer">
      <div className="footer-container">
        <ul className="footer-law">
          <li><Link to="/terms">이용약관</Link></li>
          <li><Link to="/terms/privacy">개인정보 처리방침</Link></li>
          <li><Link to="/terms/emailrefusal">이메일무단수집거부</Link></li>
          <li><Link to="/credits">Credits</Link></li>
        </ul>
        <p>
          홈페이지 운영 책임자 : {info['contact.manager']}<br/>
          <MultilineText text={info['footer.copyright']} /><br/>
          {info['contact.address']}<br/>
          E Mail : {info['contact.email']}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
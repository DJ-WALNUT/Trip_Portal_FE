import React from 'react';
import { useSiteInfo } from '@/context/SiteInfoContext';
import { instagramUrl } from '@/lib/siteInfo';
import './FloatingSNS.css';

function FloatingSNS() {
  const { info } = useSiteInfo();
  return (
    <div className="floating-sns">
      <div className="sns-header" style={{textShadow: '0 0 0'}}>
        {/* 로고 이미지 경로 확인 필수! */}
        <img src="/images/trip_logo.png" alt="여정 로고" className="fond-logo" />
        <div className="fond-title">
          <span>여정</span><br/><strong>#SNS</strong>
        </div>
      </div>
      
      <div className="sns-links">
        <a href={instagramUrl(info['sns.instagram'])} target="_blank" rel="noopener noreferrer" className="sns-item">
          <img src="/images/brand_logo/icon_instagram.png" alt="인스타그램" className="img" />
          <span>인스타</span>
        </a>
        <a href={info['sns.linktree']} target="_blank" rel="noopener noreferrer" className="sns-item">
          <img src="/images/brand_logo/icon_linktree.png" alt="링크트리" className="img" />
          <span>링크트리</span>
        </a>
        <a href={info['sns.kakao']} target="_blank" rel="noopener noreferrer" className="sns-item">
          <img src="/images/brand_logo/icon_kakaotalk.png" alt="카카오톡" className="img" />
          <span>카카오톡</span>
        </a>
      </div>
    </div>
  );
}

export default FloatingSNS;
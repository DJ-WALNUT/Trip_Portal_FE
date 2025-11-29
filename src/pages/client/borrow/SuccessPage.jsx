import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import './SuccessPage.css';

function SuccessPage() {
  const location = useLocation();
  // BorrowPage에서 보내준 데이터 받기
  const { items, date, returnDate } = location.state || {};

  // 만약 데이터 없이 그냥 주소로 들어왔으면 메인으로 튕겨내기
  if (!items) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container success-container">
      <div className="success-box">
        {/* 체크 아이콘 */}
        <div className="success-icon">✔️</div>
        
        <h2>대여 신청이 완료되었습니다!</h2>
        
        {/* 안내 박스 (파란색) */}
        <div className="info-box">
          <p><strong>공대방(N502)에 방문하여</strong><br/>담당자 확인 후 물품을 수령해주세요!</p>
        </div>

        <p className="warning-text">
          ※ 신청 시각 기준 24시간이 지나면 자동으로 신청이 취소되오니,<br/>
          참고하여 수령해주시길 바랍니다.
        </p>

        <div className="details-area">
          <p className="date-info">대여일: {date}</p>
          
          <div className="borrowed-list">
            <p><strong>[대여 물품]</strong></p>
            <ul>
              {items.map((item, idx) => (
                <li key={idx}>- {item}</li>
              ))}
            </ul>
          </div>

          <p className="return-info">
            <strong>{returnDate}</strong> 까지 공대방(N502)으로 반납해주세요.
          </p>
        </div>

        {/* 메인으로 돌아가기 버튼 */}
        <Link to="/" className="home-btn">
          메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default SuccessPage;
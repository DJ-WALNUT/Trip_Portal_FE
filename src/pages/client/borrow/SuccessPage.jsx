import React from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import LucianIcon from '@/components/icons/LucianIcon';
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
    <div className="success-page">
      <div className="success-box">
        <div className="success-icon">
          <LucianIcon name="check" size={56} label="신청 완료" />
        </div>

        <h2>대여 신청이 완료되었습니다!</h2>

        <Card className="success-card">
          <p className="success-guide">
            <strong>공대방(N507)에 방문하여</strong><br />담당자 확인 후 물품을 수령해주세요!
          </p>

          <p className="warning-text">
            ※ 신청 시각 기준 24시간이 지나면 자동으로 신청이 취소되오니,<br />
            참고하여 수령해주시길 바랍니다.
          </p>

          <p className="date-info">대여일: {date}</p>

          <p className="success-label">[대여 물품]</p>
          <ul className="success-tags">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <p className="return-info">
            <strong>{returnDate}</strong> 까지 공대방(N507)으로 반납해주세요.
          </p>
        </Card>

        <div className="success-actions">
          <Button as={Link} to="/check" block>신청 확인하기</Button>
          <Button as={Link} to="/" variant="ghost" block>메인으로 돌아가기</Button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;

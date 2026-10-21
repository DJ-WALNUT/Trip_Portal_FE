import React, { useState } from 'react';
import axios from 'axios';
import { Button, Card, Badge, Field, EmptyState } from '@/components/ui';
import { getBorrowTone } from '@/lib/borrowStatus';
import LucianIcon from '@/components/icons/LucianIcon';
import './CheckPage.css';

function CheckPage() {
  // 입력값 상태
  const [inputs, setInputs] = useState({ name: '', student_id: '' });

  // 결과 데이터 상태
  const [result, setResult] = useState(null); // 조회된 데이터 (리스트)
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보
  const [searched, setSearched] = useState(false); // 검색 시도 여부
  const [searching, setSearching] = useState(false); // 요청 중 여부
  const [errorMsg, setErrorMsg] = useState('');

  // 입력 핸들러
  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // 조회 핸들러
  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResult(null);
    setSearching(true);

    try {
      // 백엔드에 POST 요청 (/api/check)
      const response = await axios.post('/api/check', inputs);

      if (response.data.status === 'success') {
        setResult(response.data.data);
        setUserInfo(response.data.user_info);
      } else {
        setErrorMsg(response.data.message); // "기록이 없습니다" 등
      }
    } catch (error) {
      console.error("조회 에러:", error);
      setErrorMsg("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setSearching(false);
      setSearched(true); // 검색 시도함 표시
    }
  };

  return (
    <div className="check-page">
      <div className="check-header">
        <LucianIcon name="search" size={48} state={searching ? 'searching' : 'idle'} />
        <h2>신청/대여 현황 확인</h2>
        <p>본인의 대여 기록을 확인하려면 이름과 학번을 입력해주세요.</p>
      </div>

      {/* 검색 폼 */}
      <form className="check-form" onSubmit={handleSearch}>
        <Field label="이름" htmlFor="check-name">
          <input
            id="check-name"
            type="text"
            name="name"
            placeholder="이름"
            value={inputs.name}
            onChange={handleChange}
            required
          />
        </Field>
        <Field label="학번" htmlFor="check-student-id">
          <input
            id="check-student-id"
            type="text"
            name="student_id"
            placeholder="학번"
            value={inputs.student_id}
            onChange={handleChange}
            required
          />
        </Field>
        <Button type="submit" disabled={searching} className="check-form__submit">확인하기</Button>
      </form>

      {/* 결과 화면 */}
      {errorMsg && <EmptyState title={errorMsg} />}

      {result && (
        <div className="check-result">
          <h3 className="check-result__title">{userInfo.name}님의 기록</h3>
          <p className="check-result__sub">학번: {userInfo.student_id}</p>

          <ul className="check-records">
            {result.map((row, idx) => (
              <li key={idx}>
                <Card className="check-record">
                  <div className="check-record__head">
                    <strong className="check-record__items">{row.items}</strong>
                    <Badge tone={getBorrowTone(row.status, row.due_date)}>{row.status}</Badge>
                  </div>
                  <dl className="check-record__meta">
                    <div><dt>신청/대여일</dt><dd>{row.date}</dd></div>
                    <div><dt>반납기한</dt><dd>{row.due_date}</dd></div>
                  </dl>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      {searched && !result && !errorMsg && (
        <EmptyState title="조회 결과가 없습니다." />
      )}
    </div>
  );
}

export default CheckPage;

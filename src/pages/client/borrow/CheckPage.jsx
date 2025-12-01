import React, { useState } from 'react';
import axios from 'axios';
import './CheckPage.css';

function CheckPage() {
  // 입력값 상태
  const [inputs, setInputs] = useState({ name: '', student_id: '' });
  
  // 결과 데이터 상태
  const [result, setResult] = useState(null); // 조회된 데이터 (리스트)
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보
  const [searched, setSearched] = useState(false); // 검색 시도 여부
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
      setSearched(true); // 검색 시도함 표시
    }
  };

  return (
    <div className="container">
      <div className="check-header">
        <h2>신청/대여 현황 확인</h2>
        <p>본인의 대여 기록을 확인하려면 이름과 학번을 입력해주세요.</p>
      </div>

      {/* 검색 폼 */}
      <form className="check-form" onSubmit={handleSearch}>
        <input 
          type="text" 
          name="name" 
          placeholder="이름" 
          value={inputs.name} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="student_id" 
          placeholder="학번" 
          value={inputs.student_id} 
          onChange={handleChange} 
          required 
        />
        <button type="submit" className="submit-btn borrow">확인하기</button>
      </form>

      <hr className="divider" />

      {/* 결과 화면 */}
      {errorMsg && <div className="message error">{errorMsg}</div>}

      {result && (
        <div className="result-area">
          <div className="user-info-box">
            <h3>👋 {userInfo.name}님의 기록</h3>
            <p>학번: {userInfo.student_id}</p>
          </div>

          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>대여물품</th>
                  <th>신청/대여일</th>
                  <th>상태</th>
                  <th>반납기한</th>
                </tr>
              </thead>
              <tbody>
                {result.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.items}</td>
                    <td>{row.date}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.due_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {searched && !result && !errorMsg && (
        <div className="message info">조회 결과가 없습니다.</div>
      )}
    </div>
  );
}

// 상태에 따른 CSS 클래스 반환 헬퍼 함수
function getStatusClass(status) {
  if (status === '신청') return 'status-pending';
  if (status === '미반납') return 'status-warning';
  if (status === '반납완료') return 'status-success';
  return '';
}

export default CheckPage;
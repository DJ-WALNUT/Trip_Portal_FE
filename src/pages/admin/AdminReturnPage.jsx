import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import './AdminCommon.css';

function AdminReturnPage() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const [selectedId, setSelectedId] = useState(null);
  const [handlerName, setHandlerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // [추가] 날짜 계산 로직
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  // 날짜 포맷 함수 (YYYY-MM-DD)
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchRentals = () => {
    axios.get('/api/admin/ongoing')
      .then(res => setRentals(res.data.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    // 1. 권한 체크 (로그인 안 했으면 튕겨내기)
    if (!localStorage.getItem('isAdmin')) {
      alert("관리자 로그인이 필요합니다.");
      navigate('/admin');
      return;
    } 
    fetchRentals(); 
  }, [navigate]);

  // ▼▼▼ 검색 필터링 로직 ▼▼▼
  const filteredRentals = rentals.filter(item => 
    item.name.includes(searchTerm) || 
    item.student_id.includes(searchTerm) ||
    (item.phone && item.phone.includes(searchTerm))
  );

  const openReturnModal = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/return', { id: selectedId, handler: handlerName });
      alert("반납 처리되었습니다.");
      setIsModalOpen(false);
      setHandlerName('');
      fetchRentals();
    } catch (err) {
      alert("오류 발생: " + err.message);
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="container">
        <h1>반납 현황 관리</h1>
        <p>아직 반납되지 않은 대여 건 목록입니다.</p>
        
        {/* [추가] 날짜 정보 표시 카드 */}
        <div className="date-info-card">
          <div className="date-item">
            📅 오늘 날짜: <span style={{color: '#2c3e50'}}>{formatDate(today)}</span>
          </div>
          <div className="date-item">
            ⚠️ 반납 기한 만료일 (7일 전): <span style={{color: '#c0392b'}}>{formatDate(oneWeekAgo)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="이름, 학번, 연락처로 검색" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.8rem', 
              border: '1px solid #ccc', 
              borderRadius: '8px', 
              width: '300px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>대여일</th>
                <th>이름</th>
                <th>학번</th>
                <th>연락처</th>
                <th>대여물품</th>
                <th>처리</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.length === 0 ? (
                <tr><td colSpan="6">검색 결과가 없거나 미반납 건이 없습니다.</td></tr>
              ) : filteredRentals.map((item, idx) => {
                // 대여일이 일주일 지난 경우 날짜를 빨간색으로 표시하는 시각적 힌트 추가
                const isOverdue = item.date.split(' ')[0] <= formatDate(oneWeekAgo);
                
                return (
                  <tr key={idx} style={isOverdue ? {backgroundColor: '#fff5f5'} : {}}>
                    <td style={isOverdue ? {color: 'red', fontWeight: 'bold'} : {}}>
                      {item.date}
                    </td>
                    <td>{item.name}</td>
                    <td>{item.student_id}</td>
                    <td>{item.phone}</td>
                    <td>{item.items}</td>
                    <td>
                      <button className="btn-return" onClick={() => openReturnModal(item.id)}>반납 확인</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>반납 처리</h3>
            <p>확인한 담당자 이름을 입력하세요.</p>
            <form onSubmit={handleReturn}>
              <input 
                type="text" 
                placeholder="담당자 이름" 
                value={handlerName} 
                onChange={(e) => setHandlerName(e.target.value)} 
                required 
                className="modal-input"
              />
              <div className="modal-actions">
                <button type="submit" className="btn-confirm">반납 완료</button>
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminReturnPage;
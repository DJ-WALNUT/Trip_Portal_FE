import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../../components/AdminHeader';
import '../AdminCommon.css';

function AdminApprovePage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가
  const [selectedId, setSelectedId] = useState(null);
  const [handlerName, setHandlerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = () => {
    axios.get('/api/admin/requests')
      .then(res => setRequests(res.data.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { 
    // 1. 권한 체크 (로그인 안 했으면 튕겨내기)
    if (!localStorage.getItem('isAdmin')) {
      alert("관리자 로그인이 필요합니다.");
      navigate('/admin');
      return;
    }
    fetchRequests(); 
  }, [navigate]);

  // ▼▼▼ 검색 필터링 로직 ▼▼▼
  const filteredRequests = requests.filter(req => 
    req.name.includes(searchTerm) || req.student_id.includes(searchTerm)
  );

  const openApproveModal = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/approve', { id: selectedId, handler: handlerName });
      alert("승인 처리되었습니다.");
      setIsModalOpen(false);
      setHandlerName('');
      fetchRequests();
    } catch (err) {
      alert("오류 발생: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말 이 신청을 삭제(거절)하시겠습니까?")) {
      try {
        await axios.post('/api/admin/reject', { id });
        alert("삭제되었습니다.");
        fetchRequests();
      } catch (err) {
        alert("오류 발생");
      }
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="container">
        <h1>대여 신청 수락</h1>
        <p>사용자가 신청한 대기 목록입니다.</p>

        {/* ▼▼▼ 검색창 추가 ▼▼▼ */}
        <div style={{ display: 'flex', gap: '10px', margin: '1.5rem 0' }}>
          <input 
            type="text" 
            placeholder="이름 또는 학번으로 검색" 
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
                <th>신청시각</th>
                <th>이름</th>
                <th>학번</th>
                <th>대여물품</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr><td colSpan="5">검색 결과가 없거나 대기 중인 신청이 없습니다.</td></tr>
              ) : filteredRequests.map((req, idx) => (
                <tr key={idx}>
                  <td>{req.date}</td>
                  <td>{req.name}</td>
                  <td>{req.student_id}</td>
                  <td>{req.items}</td>
                  <td>
                    <button className="btn-approve" onClick={() => openApproveModal(req.id)}>승인</button>
                    <button className="btn-delete" onClick={() => handleDelete(req.id)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>대여 승인</h3>
            <p>담당자 이름을 입력하세요.</p>
            <form onSubmit={handleApprove}>
              <input 
                type="text" 
                placeholder="담당자 이름" 
                value={handlerName} 
                onChange={(e) => setHandlerName(e.target.value)} 
                required 
                className="modal-input"
              />
              <div className="modal-actions">
                <button type="submit" className="btn-confirm">확인</button>
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminApprovePage;
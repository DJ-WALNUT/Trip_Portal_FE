import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminHeader from '../../components/AdminHeader';
import './AdminCommon.css'; // 관리자 공통 스타일 (아래에서 만듭니다)

function AdminApprovePage() {
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // 승인할 대여 건 ID
  const [handlerName, setHandlerName] = useState(''); // 승인 담당자 이름
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 데이터 불러오기
  const fetchRequests = () => {
    axios.get('/api/admin/requests')
      .then(res => setRequests(res.data.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchRequests(); }, []);

  // 승인 모달 열기
  const openApproveModal = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  // 승인 처리 (API 호출)
  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/approve', { id: selectedId, handler: handlerName });
      alert("승인 처리되었습니다.");
      setIsModalOpen(false);
      setHandlerName('');
      fetchRequests(); // 목록 새로고침
    } catch (err) {
      alert("오류 발생: " + err.message);
    }
  };

  // 삭제(거절) 처리
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
              {requests.length === 0 ? (
                <tr><td colspan="5">대기 중인 신청이 없습니다.</td></tr>
              ) : requests.map((req, idx) => (
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

      {/* 승인 모달 */}
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
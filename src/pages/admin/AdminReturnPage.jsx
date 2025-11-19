import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminHeader from '../../components/AdminHeader';
import './AdminCommon.css';

function AdminReturnPage() {
  const [rentals, setRentals] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [handlerName, setHandlerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRentals = () => {
    axios.get('/api/admin/ongoing') // 미반납 목록 가져오기
      .then(res => setRentals(res.data.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchRentals(); }, []);

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

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>대여일</th>
                <th>이름</th>
                <th>학번</th>
                <th>대여물품</th>
                <th>처리</th>
              </tr>
            </thead>
            <tbody>
              {rentals.length === 0 ? (
                <tr><td colspan="5">미반납 건이 없습니다.</td></tr>
              ) : rentals.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.date}</td>
                  <td>{item.name}</td>
                  <td>{item.student_id}</td>
                  <td>{item.items}</td>
                  <td>
                    <button className="btn-return" onClick={() => openReturnModal(item.id)}>반납 확인</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 반납 모달 */}
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
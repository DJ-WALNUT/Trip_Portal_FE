import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/layouts/AdminContext';
import { ResponsiveTable, Button, PageHeader } from '@/components/ui';
import HandlerModal from './HandlerModal';
import '../AdminCommon.css';
import './AdminBorrow.css';

function AdminApprovePage() {
  const navigate = useNavigate();
  const { refreshPendingCount } = useAdmin();
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
    axios.get('/api/admin/requests')
      .then(res => setRequests(res.data.data))
      .catch(err => console.error(err));
  }, [navigate]);

  // 검색 필터링 로직
  const filteredRequests = requests.filter(req =>
    req.name.includes(searchTerm) || req.student_id.includes(searchTerm)
  );

  const openApproveModal = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/approve', { id: selectedId, handler: handlerName });
      alert("승인 처리되었습니다.");
      setIsModalOpen(false);
      setHandlerName('');
      fetchRequests();
      refreshPendingCount();
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
        refreshPendingCount();
      } catch {
        alert("오류 발생");
      }
    }
  };

  const columns = [
    { key: 'date', header: '신청시각', primary: true, render: (req) => req.date },
    { key: 'name', header: '이름', render: (req) => req.name },
    { key: 'sid', header: '학번', render: (req) => req.student_id },
    { key: 'items', header: '대여물품', render: (req) => req.items },
    {
      key: 'actions',
      header: '관리',
      render: (req) => (
        <div className="borrow-actions">
          <Button size="sm" onClick={() => openApproveModal(req.id)}>승인</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(req.id)}>삭제</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-borrow">
      <PageHeader title="대여 신청 승인" description="사용자가 신청한 대기 목록입니다." />

      <div className="admin-search">
        <input
          type="text"
          className="admin-search__input"
          placeholder="이름 또는 학번으로 검색"
          aria-label="이름 또는 학번으로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ResponsiveTable
        breakpoint="lg"
        columns={columns}
        rows={filteredRequests}
        rowKey={(req, i) => req.id ?? i}
        empty="검색 결과가 없거나 대기 중인 신청이 없습니다."
      />

      {isModalOpen && (
        <HandlerModal
          title="대여 승인"
          description="담당자 이름을 입력하세요."
          confirmLabel="확인"
          value={handlerName}
          onChange={setHandlerName}
          onSubmit={handleApprove}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default AdminApprovePage;

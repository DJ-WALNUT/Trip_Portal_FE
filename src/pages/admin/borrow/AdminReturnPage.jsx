import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from '../../../lib/dayjs';
import { getBorrowToneFromBorrowedAt } from '@/lib/borrowStatus';
import { ResponsiveTable, Button, PageHeader } from '@/components/ui';
import HandlerModal from './HandlerModal';
import { useSiteInfo } from '@/context/SiteInfoContext';
import '../AdminCommon.css';
import './AdminBorrow.css';

function AdminReturnPage() {
  const navigate = useNavigate();
  const { info } = useSiteInfo();
  const returnDays = info['rental.return_days'];
  const [rentals, setRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const [selectedId, setSelectedId] = useState(null);
  const [handlerName, setHandlerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 한국 시간 기준 오늘 00:00:00
  const todayKST = dayjs().tz().startOf('day');
  // 오늘로부터 반납 기간(일) 전 계산
  const overdueLimit = todayKST.subtract(returnDays, 'day');
  // 날짜 포맷 함수 (YYYY-MM-DD)
  const formatDate = (dateObj) => {
    return dateObj.format('YYYY-MM-DD');
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
    axios.get('/api/admin/ongoing')
      .then(res => setRentals(res.data.data))
      .catch(err => console.error(err));
  }, [navigate]);

  // 검색 필터링 로직
  const filteredRentals = rentals.filter(item =>
    item.name.includes(searchTerm) ||
    item.student_id.includes(searchTerm) ||
    (item.phone && item.phone.includes(searchTerm))
  );

  const openReturnModal = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

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

  // 연체 = 대여일 + 반납 기간(기한)의 다음 날부터 (상태 배지와 같은 규칙)
  const isOverdue = (item) => getBorrowToneFromBorrowedAt('미반납', item.date, todayKST, returnDays) === 'overdue';

  const columns = [
    {
      key: 'date',
      header: '대여일',
      primary: true,
      render: (item) => (
        <span className={isOverdue(item) ? 'borrow-overdue' : undefined}>{item.date}</span>
      ),
    },
    { key: 'name', header: '이름', render: (item) => item.name },
    { key: 'sid', header: '학번', render: (item) => item.student_id },
    { key: 'phone', header: '연락처', render: (item) => item.phone },
    { key: 'items', header: '대여물품', render: (item) => item.items },
    {
      key: 'actions',
      header: '처리',
      render: (item) => (
        <Button onClick={() => openReturnModal(item.id)}>반납 확인</Button>
      ),
    },
  ];

  return (
    <div className="admin-borrow">
      <PageHeader title="반납 현황 관리" description="아직 반납되지 않은 대여 건 목록입니다." />

      <div className="borrow-dates">
        <div>오늘 날짜: <span>{formatDate(todayKST)}</span></div>
        <div>반납 기한 만료일 ({returnDays}일 전): <span className="borrow-dates__due">{formatDate(overdueLimit)}</span></div>
      </div>

      <div className="admin-search">
        <input
          type="text"
          className="admin-search__input"
          placeholder="이름, 학번, 연락처로 검색"
          aria-label="이름, 학번, 연락처로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ResponsiveTable
        breakpoint="lg"
        columns={columns}
        rows={filteredRentals}
        rowKey={(item, i) => item.id ?? i}
        rowProps={(item) => (isOverdue(item) ? { 'data-overdue': 'true' } : {})}
        empty="검색 결과가 없거나 미반납 건이 없습니다."
      />

      {isModalOpen && (
        <HandlerModal
          title="반납 처리"
          description="확인한 담당자 이름을 입력하세요."
          confirmLabel="반납 완료"
          value={handlerName}
          onChange={setHandlerName}
          onSubmit={handleReturn}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default AdminReturnPage;

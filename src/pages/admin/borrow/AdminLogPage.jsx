import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ResponsiveTable, Badge, Button, PageHeader } from '@/components/ui';
import { getBorrowToneFromBorrowedAt } from '@/lib/borrowStatus';
import LucianIcon from '@/components/icons/LucianIcon';
import '../AdminCommon.css';
import './AdminBorrow.css';

function AdminLogPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 1. 권한 체크 (로그인 안 했으면 튕겨내기)
    if (!localStorage.getItem('isAdmin')) {
      alert("관리자 로그인이 필요합니다.");
      navigate('/admin');
      return;
    }
    axios.get('/api/admin/logs').then(res => setLogs(res.data.data));
  }, [navigate]);

  const downloadExcel = () => {
    // 백엔드에서 파일 다운로드 처리
    window.location.href = 'https://trip-api.cukeng.kr/api/admin/download_log'; // 시놀로지 IP 확인 필요
  };

  const columns = [
    { key: 'name', header: '이름', primary: true, render: (log) => log['이름'] },
    { key: 'sid', header: '학번', render: (log) => log['학번'] },
    { key: 'item', header: '대여물품', render: (log) => log['대여물품'] },
    {
      key: 'status',
      header: '상태',
      render: (log) => (
        <Badge tone={getBorrowToneFromBorrowedAt(log['대여현황'], log['대여시각'])}>{log['대여현황']}</Badge>
      ),
    },
    { key: 'borrowed', header: '대여일', render: (log) => log['대여시각'] },
    { key: 'returned', header: '반납일', render: (log) => log['반납시각'] },
  ];

  return (
    <div className="admin-borrow">
      <PageHeader
        title="전체 대여 기록"
        actions={
          <Button onClick={downloadExcel}>
            <LucianIcon name="download" state="idle" size={18} />
            엑셀 다운로드
          </Button>
        }
      />

      <ResponsiveTable
        breakpoint="lg"
        columns={columns}
        rows={logs}
        rowKey={(log, i) => i}
        empty="대여 기록이 없습니다."
      />
    </div>
  );
}

export default AdminLogPage;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { ResponsiveTable, Badge, Button, PageHeader, Spinner } from '@/components/ui';
import './AdminCommon.css';
import './AdminNotice.css';

function AdminNoticeListPage() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const isMaster = localStorage.getItem('adminRole') === 'master';

  useEffect(() => {
    // 1. 권한 체크
    if (!localStorage.getItem('isAdmin')) {
      alert("관리자 로그인이 필요합니다.");
      navigate('/admin');
      return;
    }

    // 2. [수정] 실제 API 호출
    const fetchNotices = async () => {
      try {
        // [수정] 관리자용 목록이므로 'include_private' 파라미터 추가
        const res = await axios.get('/api/notices', {
          params: { include_private: 'true' }
        });
        setNotices(res.data); // 백엔드에서 받은 배열 저장
      } catch (err) {
        console.error("공지사항 로드 실패:", err);
        alert("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까? (삭제 시 복구 불가)')) {
      try {
        await axios.delete(`/api/notices/${id}`);
        alert('삭제되었습니다.');
        // 목록 갱신 (서버에서 다시 불러오거나, 클라이언트에서 필터링)
        setNotices(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        console.error("삭제 실패:", err);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const columns = [
    {
      key: 'title',
      header: '제목',
      primary: true,
      render: (n) => (
        <span className="notice-title">
          {n.fixed ? <Badge tone="pinned">고정</Badge> : null}
          <span className="notice-title__text">{n.title}</span>
        </span>
      ),
    },
    { key: 'id', header: '번호', render: (n) => n.id },
    {
      key: 'status',
      header: '상태',
      render: (n) => (n.is_public ? <Badge tone="done">공개</Badge> : <Badge tone="overdue">미공개</Badge>),
    },
    { key: 'author', header: '작성자', render: (n) => n.author },
    { key: 'date', header: '작성일', render: (n) => n.date },
    { key: 'views', header: '조회수', render: (n) => n.views },
  ];

  if (isMaster) {
    columns.push({
      key: 'actions',
      header: '관리',
      render: (n) => (
        <div className="notice-actions">
          <Button variant="ghost" className="notice-icon-btn" aria-label={`${n.title} 수정`} onClick={() => navigate(`/admin/notices/edit/${n.id}`)}>
            <Pencil size={16} aria-hidden="true" />
          </Button>
          <Button variant="danger" className="notice-icon-btn" aria-label={`${n.title} 삭제`} onClick={() => handleDelete(n.id)}>
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ),
    });
  }

  if (loading) return <Spinner />;

  return (
    <div className="admin-notice-list">
      <PageHeader
        title="공지사항 관리"
        actions={
          <Button as={Link} to="/admin/notices/write">
            <Plus size={18} aria-hidden="true" /> 새 공지
          </Button>
        }
      />
      <ResponsiveTable
        breakpoint="lg"
        columns={columns}
        rows={notices}
        rowKey={(n) => n.id}
        empty="등록된 공지사항이 없습니다."
        rowProps={(n) => ({ 'data-private': n.is_public ? undefined : 'true' })}
      />
    </div>
  );
}

export default AdminNoticeListPage;

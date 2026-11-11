import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { ResponsiveTable, Badge, Button, PageHeader, Spinner } from '@/components/ui';
import { getSurveyBadge, toSurveyList } from '@/lib/survey';
import './AdminCommon.css';
import './AdminSurvey.css';

function AdminSurveyListPage() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMaster = localStorage.getItem('adminRole') === 'master';

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) {
      alert('관리자 로그인이 필요합니다.');
      navigate('/admin');
      return;
    }

    const fetchSurveys = async () => {
      try {
        // 관리자 목록이므로 비공개 글까지 불러온다
        const res = await axios.get('/api/surveys', { params: { include_private: 'true' } });
        setSurveys(toSurveyList(res.data));
      } catch (err) {
        console.error('설문조사 로드 실패:', err);
        alert('데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까? (삭제 시 복구 불가)')) return;
    try {
      await axios.delete(`/api/surveys/${id}`);
      setSurveys((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const columns = [
    {
      key: 'title',
      header: '제목',
      primary: true,
      render: (s) => (
        <span className="admin-survey-title">
          <span className="admin-survey-title__text" title={s.title}>{s.title}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: '상태',
      render: (s) => {
        const badge = getSurveyBadge(s);
        return <Badge tone={badge.tone}>{badge.label}</Badge>;
      },
    },
    {
      key: 'public',
      header: '공개',
      render: (s) => (s.is_public ? <Badge tone="done">공개</Badge> : <Badge tone="overdue">미공개</Badge>),
    },
    { key: 'deadline', header: '마감일', render: (s) => s.deadline ?? '-' },
    { key: 'date', header: '작성일', render: (s) => s.date },
    { key: 'views', header: '조회수', render: (s) => s.views },
    {
      key: 'actions',
      header: '관리',
      render: (s) => (
        <div className="admin-survey-actions">
          <Button variant="ghost" className="admin-survey-icon-btn" aria-label={`${s.title} 수정`} onClick={() => navigate(`/admin/surveys/edit/${s.id}`)}>
            <Pencil size={16} aria-hidden="true" />
          </Button>
          {isMaster && (
            <Button variant="danger" className="admin-survey-icon-btn" aria-label={`${s.title} 삭제`} onClick={() => handleDelete(s.id)}>
              <Trash2 size={16} aria-hidden="true" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="admin-survey-list">
      <PageHeader
        title="설문조사 관리"
        actions={
          <Button as={Link} to="/admin/surveys/write">
            <Plus size={18} aria-hidden="true" /> 새 설문 등록
          </Button>
        }
      />
      <ResponsiveTable
        breakpoint="lg"
        columns={columns}
        rows={surveys}
        rowKey={(s) => s.id}
        empty="등록된 설문조사가 없습니다."
        rowProps={(s) => ({ 'data-private': s.is_public ? undefined : 'true' })}
      />
    </div>
  );
}

export default AdminSurveyListPage;

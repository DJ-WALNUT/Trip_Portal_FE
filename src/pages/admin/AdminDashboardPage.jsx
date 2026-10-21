import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/layouts/AdminContext';
import { ResponsiveTable, Toggle, Card, Badge, PageHeader, Spinner } from '@/components/ui';
import { getBorrowToneFromBorrowedAt } from '@/lib/borrowStatus';
import { useSiteInfo } from '@/context/SiteInfoContext';
import './AdminDashboardPage.css';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { info } = useSiteInfo();
  const [stats, setStats] = useState({ today_count: 0, recent_logs: [] });
  const [loading, setLoading] = useState(true);
  const [isSnowfallOn, setIsSnowfallOn] = useState(false);
  const [ongoingCount, setOngoingCount] = useState(0);
  const { pendingCount } = useAdmin();

  useEffect(() => {
    // 1. 권한 체크 (로그인 안 했으면 튕겨내기)
    if (!localStorage.getItem('isAdmin')) {
      alert("관리자 로그인이 필요합니다.");
      navigate('/admin');
      return;
    }

    // 2. 데이터 가져오기
    axios.get('/api/admin/dashboard')
      .then(res => {
        if(res.data.status === 'success') setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // 대여 중 개수
    axios.get('/api/admin/ongoing')
      .then(res => {
        if (res.data.status === 'success') setOngoingCount(res.data.data.length);
      })
      .catch(err => console.error(err));

    // 눈송이 설정 상태 로드
    axios.get('/api/system/snowfall')
      .then(res => {
        if (res.data.status === 'success') {
          setIsSnowfallOn(res.data.enabled);
        }
      })
      .catch(err => console.error(err));
  }, [navigate]);

  // 눈송이 토글 핸들러
  const toggleSnowfall = () => {
    const newState = !isSnowfallOn;
    axios.post('/api/admin/system/snowfall', { enabled: newState })
      .then(res => {
        if (res.data.status === 'success') {
          setIsSnowfallOn(res.data.enabled);
          alert(`눈송이 효과를 ${res.data.enabled ? '켰습니다' : '껐습니다'}.`);
        }
      })
      .catch(() => alert('설정 변경 실패'));
  };

  if (loading) return <Spinner />;
  const adminRole = localStorage.getItem('adminRole');

  const statCards = [
    { label: '금일 대여', value: stats.today_count, to: '/admin/borrow/log' },
    { label: '승인 대기', value: pendingCount, to: '/admin/borrow/approve' },
    { label: '대여 중', value: ongoingCount, to: '/admin/borrow/return' },
  ];

  const columns = [
    { key: 'time', header: '대여시각', render: (log) => log['대여시각'], primary: true },
    { key: 'name', header: '이름', render: (log) => log['이름'] },
    { key: 'sid', header: '학번', render: (log) => log['학번'] },
    { key: 'item', header: '물품', render: (log) => log['대여물품'] },
    {
      key: 'status',
      header: '상태',
      render: (log) => (
        <Badge tone={getBorrowToneFromBorrowedAt(log['대여현황'], log['대여시각'], undefined, info['rental.return_days'])}>{log['대여현황']}</Badge>
      ),
    },
  ];

  return (
    <div className="admin-dashboard">
      <PageHeader title="관리자 대시보드" />

      <div className="dash-stats">
        {statCards.map((c) => (
          <Link key={c.to} to={c.to} className="dash-stat">
            <span className="dash-stat__label">{c.label}</span>{' '}
            <span className="dash-stat__value">{c.value}건</span>
          </Link>
        ))}
      </div>

      {adminRole === 'master' && (
        <Card className="dash-snow">
          <Toggle
            id="snowfall-toggle"
            checked={isSnowfallOn}
            onChange={toggleSnowfall}
            label={`눈송이 효과: ${isSnowfallOn ? 'ON' : 'OFF'}`}
          />
        </Card>
      )}

      <h2 className="dash-section-title">최근 대여 기록 (최신 5건)</h2>
      <ResponsiveTable
        breakpoint="lg"
        columns={columns}
        rows={stats.recent_logs}
        rowKey={(log, i) => i}
        empty="최근 대여 기록이 없습니다."
      />
    </div>
  );
}

export default AdminDashboardPage;

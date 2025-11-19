import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader'; // 관리자 헤더 사용

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ today_count: 0, recent_logs: [] });
  const [loading, setLoading] = useState(true);

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
        if(res.data.status === 'success') {
            setStats(res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div className="container">로딩 중...</div>;

  return (
    <>
      <AdminHeader />
      <div className="container">
        <h1>관리자 대시보드</h1>

        {/* 통계 카드 */}
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#eaf5fc', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#2980b9' }}>금일 대여 건수</h3>
            <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#001f3f' }}>
              {stats.today_count}<span style={{ fontSize: '1.5rem' }}>건</span>
            </p>
          </div>
        </div>

        {/* 최근 기록 테이블 */}
        <h2>최근 대여 기록 (최신 5건)</h2>
        <div className="table-responsive">
            <table className="history-table">
                <thead>
                    <tr>
                        <th>대여시각</th>
                        <th>이름</th>
                        <th>학번</th>
                        <th>물품</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.recent_logs.map((log, idx) => (
                        <tr key={idx}>
                            <td>{log['대여시각']}</td>
                            <td>{log['이름']}</td>
                            <td>{log['학번']}</td>
                            <td>{log['대여물품']}</td>
                            <td>{log['대여현황']}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </>
  );
}

export default AdminDashboardPage;
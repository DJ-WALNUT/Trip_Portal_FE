import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import './AdminCommon.css';

function AdminNoticeListPage() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    // 1. 권한 체크
    if (!localStorage.getItem('isAdmin')) {
      alert("관리자 로그인이 필요합니다.");
      navigate('/admin');
      return;
    }

    // 2. [수정] 실제 API 호출
    fetchNotices();
  }, [navigate]);

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

  if (loading) return <div className="container">로딩 중...</div>;

  return (
    <>
      <AdminHeader />
      <div className="container">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1rem'}}>
            <h1>공지사항 관리</h1>
            <Link to="/admin/notices/write" className="btn-write">
                ✏️ 새 공지 작성
            </Link>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>번호</th>
                <th style={{width: '80px'}}>상태</th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th style={{width: '80px'}}>조회수</th>
                <th>고정</th>
                <th style={{width: '150px'}}>관리</th>
              </tr>
            </thead>
            <tbody>
              {notices.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign:'center', padding: '2rem'}}>등록된 공지사항이 없습니다.</td></tr>
              ) : notices.map((notice) => (
                <tr key={notice.id} style={{backgroundColor: notice.is_public ? 'white' : '#fff5f5'}}> 
                    {/* 미공개면 배경을 살짝 붉게 */}
                  <td>{notice.id}</td>
                  {/* [NEW] 상태 뱃지 표시 */}
                  <td>
                    {notice.is_public ? (
                      <span style={{color:'green', fontWeight:'bold', border:'1px solid green', padding:'2px 6px', borderRadius:'4px', fontSize:'0.8rem'}}>공개</span>
                    ) : (
                      <span style={{color:'#d63031', fontWeight:'bold', border:'1px solid #d63031', padding:'2px 6px', borderRadius:'4px', fontSize:'0.8rem'}}>미공개</span>
                    )}
                  </td>

                  <td style={{textAlign: 'left', fontWeight: notice.fixed ? 'bold' : 'normal'}}>
                    {notice.title}
                  </td>
                  <td>{notice.author}</td>
                  <td>{notice.date}</td>
                  <td>{notice.views}</td>
                  <td>
                    {notice.fixed ? <span style={{color:'red', fontWeight:'bold'}}>고정</span> : '-'}
                  </td>
                  <td>
                    <button 
                        className="btn-modify" 
                        onClick={() => navigate(`/admin/notices/edit/${notice.id}`)}
                    >
                        수정
                    </button>
                    <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(notice.id)}
                    >
                        삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminNoticeListPage;
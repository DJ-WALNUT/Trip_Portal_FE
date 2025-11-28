import React, { useState, useEffect } from 'react'; // useEffect 추가
import axios from 'axios'; // axios 추가
import { Link } from 'react-router-dom';
import './NoticePage.css';

function NoticePage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // [수정] 백엔드 API 연동
  useEffect(() => {
    axios.get('/api/notices')
      .then(res => {
        setNotices(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="wrapper">
      <div className="content container notice-page-container">
        {/* 페이지 헤더 */}
        <div className="page-header">
            <h2>공지사항</h2>
            {/* 검색창 UI (기능은 아직 미구현 상태 유지) */}
            <div className="search-bar">
                <select className="search-select">
                    <option value="title">제목</option>
                    <option value="content">내용</option>
                </select>
                <input type="text" className="search-input" placeholder="검색어를 입력하세요" />
                <button className="search-btn">검색</button>
            </div>
        </div>

        {loading ? (
           <div style={{textAlign:'center', padding:'3rem'}}>로딩 중...</div>
        ) : (
            <table className="board-table">
                <thead>
                    <tr>
                        {/* <th style={{ width: '60px' }}>번호</th> */}
                        <th className="th-date" style={{ width: '120px' }}>작성일</th>
                        <th>제목</th>
                        <th className="th-author" style={{ width: '120px' }}>작성자</th>
                        <th className="th-views" style={{ width: '80px' }}>조회</th>
                    </tr>
                </thead>
                <tbody>
                    {notices.map((notice) => (
                        <tr key={notice.id} className={notice.fixed ? "notice-fixed" : ""}>
                            {/* <td>
                                {notice.fixed ? <span className="badge-fixed">공지</span> : notice.id}
                            </td> */}
                            <td className="td-date">{notice.date}</td>
                            <td className="title-col">
                                <Link to={`/notices/${notice.id}`} className="board-link">
                                    {notice.title}
                                </Link>
                            </td>
                            <td className="td-author">{notice.author}</td>
                            <td className="td-views">{notice.views}</td>
                        </tr>
                    ))}
                    
                    {notices.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ padding: '3rem 0', color: '#888', textAlign: 'center' }}>
                                등록된 공지사항이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}

        {/* 페이지네이션 (UI만 유지) */}
        <div className="pagination">
            <button className="page-btn">&lt;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">&gt;</button>
        </div>
      </div>
    </div>
  );
}

export default NoticePage;
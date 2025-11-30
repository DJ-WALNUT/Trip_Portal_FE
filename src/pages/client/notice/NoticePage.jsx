import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './NoticePage.css';

function NoticePage() {
  const [notices, setNotices] = useState([]); // 원본 데이터
  const [filteredNotices, setFilteredNotices] = useState([]); // 검색 필터링된 데이터 (화면 표시용)
  const [loading, setLoading] = useState(true);

  // 검색 관련 상태
  const [searchType, setSearchType] = useState('title'); // 검색 기준 (제목/내용)
  const [searchKeyword, setSearchKeyword] = useState(''); // 검색어 입력값

  // 백엔드 API 연동
  useEffect(() => {
    axios.get('/api/notices')
      .then(res => {
        setNotices(res.data);
        setFilteredNotices(res.data); // 초기에는 전체 목록 표시
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 검색 기능 핸들러
  const handleSearch = () => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (keyword === '') {
      setFilteredNotices(notices); // 검색어 없으면 전체 표시
      return;
    }

    const filtered = notices.filter((notice) => {
      // 제목 검색
      if (searchType === 'title') {
        return notice.title.toLowerCase().includes(keyword);
      }
      // 내용 검색 (API 데이터에 content가 포함되어 있다고 가정)
      if (searchType === 'content') {
        return notice.content && notice.content.toLowerCase().includes(keyword);
      }
      return false;
    });

    setFilteredNotices(filtered);
  };

  // 엔터키 입력 시 검색 실행
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="wrapper">
      <div className="content container notice-page-container">
        {/* 페이지 헤더 */}
        <div className="page-header">
            <h2>공지사항</h2>
            
            {/* 검색창 UI */}
            <div className="search-bar">
                <select 
                    className="search-select"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                >
                    <option value="title">제목</option>
                    <option value="content">내용</option>
                </select>
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="검색어를 입력하세요" 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className="search-btn" onClick={handleSearch}>
                    검색
                </button>
            </div>
        </div>

        {loading ? (
           <div style={{textAlign:'center', padding:'3rem'}}>로딩 중...</div>
        ) : (
            <table className="board-table">
                <thead>
                    <tr>
                        <th className="th-date" style={{ width: '120px' }}>작성일</th>
                        <th>제목</th>
                        <th className="th-author" style={{ width: '120px' }}>작성자</th>
                        <th className="th-views" style={{ width: '80px' }}>조회</th>
                    </tr>
                </thead>
                <tbody>
                    {/* notices 대신 filteredNotices를 맵핑합니다 */}
                    {filteredNotices.map((notice) => (
                        <tr key={notice.id} className={notice.fixed ? "notice-fixed" : ""}>
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
                    
                    {filteredNotices.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{ padding: '3rem 0', color: '#888', textAlign: 'center' }}>
                                {notices.length === 0 ? "등록된 공지사항이 없습니다." : "검색 결과가 없습니다."}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}

        {/* 페이지네이션 (현재 UI 유지, 추후 기능 구현 필요) */}
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
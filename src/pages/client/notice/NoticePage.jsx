import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './NoticePage.css';

function NoticePage() {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. 페이지네이션 상태 추가 ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 한 페이지에 보여줄 개수

  const [searchType, setSearchType] = useState('title');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    axios.get('/api/notices')
      .then(res => {
        setNotices(res.data);
        setFilteredNotices(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // --- 2. 현재 페이지에 보여줄 데이터 계산 ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // 검색된 결과(filteredNotices)에서 현재 페이지 분량만 추출
  const currentNotices = filteredNotices.slice(indexOfFirstItem, indexOfLastItem);
  
  // 전체 페이지 수 계산
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);

  const handleSearch = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    setCurrentPage(1); // 검색 시 1페이지로 리셋

    if (keyword === '') {
      setFilteredNotices(notices);
      return;
    }

    const filtered = notices.filter((notice) => {
      if (searchType === 'title') return notice.title.toLowerCase().includes(keyword);
      if (searchType === 'content') return notice.content && notice.content.toLowerCase().includes(keyword);
      return false;
    });

    setFilteredNotices(filtered);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="wrapper">
      <div className="content container notice-page-container">
        <div className="page-header">
            <h2>공지사항</h2>
            <div className="search-bar">
                <select className="search-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="title">제목</option>
                    <option value="content">내용</option>
                </select>
                <input 
                    type="text" className="search-input" placeholder="검색어를 입력하세요" 
                    value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={handleKeyDown}
                />
                <button className="search-btn" onClick={handleSearch}>검색</button>
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
                        <th className="th-views" style={{ width: '80px' }}>조회수</th>
                    </tr>
                </thead>
                <tbody>
                    {/* --- 3. filteredNotices 대신 currentNotices를 사용 --- */}
                    {currentNotices.map((notice) => (
                        <tr key={notice.id} className={notice.fixed ? "notice-fixed" : ""}>
                            <td className="td-date">{notice.date}</td>
                            <td className="title-col">
                                <Link to={`/notices/${notice.id}`} className="board-link">{notice.title}</Link>
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

        {/* --- 4. 페이지네이션 UI 및 이벤트 연결 --- */}
        <div className="pagination">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i + 1} 
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              &gt;
            </button>
        </div>
      </div>
    </div>
  );
}

export default NoticePage;
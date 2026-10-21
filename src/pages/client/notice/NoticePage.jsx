import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Paperclip, Eye } from 'lucide-react';
import { ResponsiveTable, Badge, PageHeader, EmptyState, Spinner } from '@/components/ui';
import LucianIcon from '@/components/icons/LucianIcon';
import { isNewNotice, formatNoticeDate } from '@/lib/notice';
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

  const columns = [
    { key: 'date', header: '작성일', render: (n) => formatNoticeDate(n.date) },
    {
      key: 'title',
      header: '제목',
      primary: true,
      render: (n) => (
        <span className={`notice-title-cell${n.fixed ? ' is-fixed' : ''}`}>
          {n.fixed && <Badge tone="pinned">고정</Badge>}
          {isNewNotice(n.date) && <Badge tone="new">NEW</Badge>}
          <Link to={`/notices/${n.id}`} className="board-link">{n.title}</Link>
          {n.files && n.files.length > 0 && (
            <span className="notice-attach" aria-label={`첨부파일 ${n.files.length}개`}>
              <Paperclip size={14} aria-hidden="true" />
              {n.files.length}
            </span>
          )}
        </span>
      ),
    },
    { key: 'author', header: '작성자' },
    { key: 'views', header: '조회수', render: (n) => (<span className="notice-views"><Eye size={14} aria-hidden="true" />{n.views}</span>) },
  ];

  const emptyText = notices.length === 0 ? '등록된 공지사항이 없습니다.' : '검색 결과가 없습니다.';

  return (
    <div className="notice-page">
      <PageHeader title="공지사항" icon={<LucianIcon name="megaphone" size={28} />} />

      <div className="search-bar" role="search">
        <select className="search-select" aria-label="검색 기준" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="title">제목</option>
          <option value="content">내용</option>
        </select>
        <input
          type="text" className="search-input" placeholder="검색어를 입력하세요"
          value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={handleKeyDown}
        />
        <button type="button" className="search-btn" onClick={handleSearch}>
          <Search size={16} aria-hidden="true" />
          검색
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={currentNotices}
          rowKey={(n) => n.id}
          breakpoint="md"
          empty={<EmptyState title={emptyText} />}
        />
      )}

      <nav className="pagination" aria-label="페이지 이동">
        <button
          type="button" className="page-btn" aria-label="이전 페이지"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            type="button"
            key={i + 1}
            className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
            aria-current={currentPage === i + 1 ? 'page' : undefined}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          type="button" className="page-btn" aria-label="다음 페이지"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}

export default NoticePage;

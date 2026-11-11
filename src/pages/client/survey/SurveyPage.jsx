import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Gift, ExternalLink } from 'lucide-react';
import { ResponsiveTable, Badge, Button, PageHeader, EmptyState, Spinner } from '@/components/ui';
import LucianIcon from '@/components/icons/LucianIcon';
import { formatNoticeDate } from '@/lib/notice';
import { getSurveyBadge, isSafeSurveyLink, toSurveyList } from '@/lib/survey';
import { useSiteInfo } from '@/context/SiteInfoContext';
import { instagramUrl } from '@/lib/siteInfo';
import './SurveyPage.css';

const ITEMS_PER_PAGE = 10;

function SurveyPage() {
  const { info } = useSiteInfo();
  const [surveys, setSurveys] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axios.get('/api/surveys')
      .then((res) => {
        setSurveys(toSurveyList(res.data));
        setStatus('ready');
      })
      .catch((err) => {
        console.error('설문조사 로드 실패', err);
        setStatus('error');
      });
  }, []);

  const totalPages = Math.ceil(surveys.length / ITEMS_PER_PAGE);
  const pageRows = surveys.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const columns = [
    {
      key: 'title',
      header: '제목',
      primary: true,
      render: (s) => (
        <span className="survey-title-cell">
          <Link to={`/surveys/${s.id}`} className="board-link">{s.title}</Link>
          {s.duration && (
            <span className="survey-chip">
              <Clock size={14} aria-hidden="true" />
              <span className="ui-sr-only">예상 소요시간</span>
              {s.duration}
            </span>
          )}
          {s.reward && (
            <span className="survey-chip">
              <Gift size={14} aria-hidden="true" />
              <span className="ui-sr-only">보상</span>
              {s.reward}
            </span>
          )}
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
    { key: 'date', header: '작성일', render: (s) => formatNoticeDate(s.date) },
    {
      key: 'go',
      header: '참여',
      render: (s) => {
        if (s.is_closed) return <span className="survey-closed-text">마감</span>;
        if (!isSafeSurveyLink(s.link_url)) return null;
        return (
          <Button
            as="a"
            className="survey-go-btn"
            href={s.link_url.trim()}
            target="_blank"
            rel="noopener noreferrer"
          >
            설문조사 하러가기
            <ExternalLink size={14} aria-hidden="true" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="survey-page">
      <PageHeader
        title="설문조사"
        description="심심하세요? 설문조사 하실래요?"
        icon={<LucianIcon name="check" size={28} />}
      />

      <p className="survey-guide">
        설문조사 등록요청은{' '}
        <a href={instagramUrl(info['sns.instagram'])} target="_blank" rel="noopener noreferrer">공과대학 인스타</a>,{' '}
        <a href={info['sns.kakao']} target="_blank" rel="noopener noreferrer">공과대학 카카오톡 채널</a>로
        문의해주시기 바랍니다.
      </p>

      {status === 'loading' && <Spinner />}
      {status === 'error' && <EmptyState title="설문조사를 불러오지 못했습니다." />}
      {status === 'ready' && (
        <ResponsiveTable
          columns={columns}
          rows={pageRows}
          rowKey={(s) => s.id}
          breakpoint="md"
          empty={<EmptyState title="진행 중인 설문조사가 없습니다." />}
          rowProps={(s) => ({ 'data-closed': s.is_closed ? 'true' : undefined })}
        />
      )}

      {totalPages > 1 && (
        <nav className="survey-pagination" aria-label="페이지 이동">
          <button
            type="button" className="survey-page-btn" aria-label="이전 페이지"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              type="button"
              key={page}
              className={`survey-page-btn${currentPage === page ? ' active' : ''}`}
              aria-current={currentPage === page ? 'page' : undefined}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button" className="survey-page-btn" aria-label="다음 페이지"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}

export default SurveyPage;

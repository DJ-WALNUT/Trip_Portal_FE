import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Eye, Clock, Gift, Hourglass, ExternalLink } from 'lucide-react';
import { Badge, Button, Spinner } from '@/components/ui';
import { formatNoticeDate } from '@/lib/notice';
import { getSurveyBadge, isSafeSurveyLink } from '@/lib/survey';
import './SurveyDetailPage.css';

const URL_RE = /(https?:\/\/[^\s]+)/g;

// 본문 안의 URL을 새 탭 링크로 바꾼다
function renderContent(content) {
  if (!content) return null;
  return content.split(URL_RE).map((part, index) => (
    /^https?:\/\//.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="survey-detail__link">
        {part}
      </a>
    ) : part
  ));
}

function SurveyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const processedId = useRef(null); // StrictMode 이중 실행으로 조회수가 두 번 오르지 않게

  useEffect(() => {
    if (processedId.current === id) return;
    processedId.current = id;

    axios.get(`/api/surveys/${id}`, { params: { increment: 'true' } })
      .then((res) => {
        setSurvey(res.data && typeof res.data === 'object' ? res.data : null);
      })
      .catch((err) => {
        console.error('설문조사 상세조회 실패', err);
        setSurvey(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const goList = () => navigate('/surveys');

  if (loading) return <Spinner />;

  if (!survey) {
    return (
      <div className="survey-detail">
        <div className="survey-detail__missing">
          <p>존재하지 않거나 삭제된 설문조사입니다.</p>
          <Button onClick={goList}>목록으로</Button>
        </div>
      </div>
    );
  }

  const badge = getSurveyBadge(survey);
  const canGo = !survey.is_closed && isSafeSurveyLink(survey.link_url);

  return (
    <div className="survey-detail">
      <div className="survey-detail__inner">
        <header className="survey-detail__header">
          <h1 className="survey-detail__title">{survey.title}</h1>
          <div className="survey-detail__meta">
            <span className="survey-detail__meta-item"><User size={14} aria-hidden="true" /><span className="ui-sr-only">작성자</span> {survey.author}</span>
            <span className="survey-detail__meta-item"><Calendar size={14} aria-hidden="true" /><span className="ui-sr-only">작성일</span> {formatNoticeDate(survey.date)}</span>
            <span className="survey-detail__meta-item"><Eye size={14} aria-hidden="true" /><span className="ui-sr-only">조회수</span> {survey.views}</span>
            <span className="survey-detail__meta-item">
              <Hourglass size={14} aria-hidden="true" />
              <span className="ui-sr-only">마감일</span>
              <span>{survey.deadline ? `~ ${formatNoticeDate(survey.deadline)}` : '상시'}</span>
              <Badge tone={badge.tone}>{badge.label}</Badge>
            </span>
          </div>
        </header>

        {(survey.duration || survey.reward) && (
          <div className="survey-detail__chips">
            {survey.duration && (
              <span className="survey-detail__chip">
                <Clock size={14} aria-hidden="true" />
                <span className="ui-sr-only">예상 소요시간</span>
                <span>{survey.duration}</span>
              </span>
            )}
            {survey.reward && (
              <span className="survey-detail__chip">
                <Gift size={14} aria-hidden="true" />
                <span className="ui-sr-only">보상</span>
                <span>{survey.reward}</span>
              </span>
            )}
          </div>
        )}

        {survey.is_closed ? (
          <Button size="lg" block disabled className="survey-detail__cta">마감된 설문입니다</Button>
        ) : canGo ? (
          <Button
            as="a"
            size="lg"
            block
            className="survey-detail__cta"
            href={survey.link_url.trim()}
            target="_blank"
            rel="noopener noreferrer"
          >
            설문조사 하러가기
            <ExternalLink size={18} aria-hidden="true" />
          </Button>
        ) : null}

        <div className="survey-detail__content">{renderContent(survey.content)}</div>

        <div className="survey-detail__actions">
          <Button variant="ghost" onClick={goList}>목록으로</Button>
        </div>
      </div>
    </div>
  );
}

export default SurveyDetailPage;

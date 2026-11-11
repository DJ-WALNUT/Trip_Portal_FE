import { Link } from 'react-router-dom';
import { Card, Badge } from '@/components/ui';
import { getSurveyBadge } from '@/lib/survey';

// 홈의 설문조사 카드. 진행중인 설문이 없으면 아무것도 그리지 않는다.
// 공지사항 카드보다 눈에 덜 띄도록 스타일(HomePage.css의 home-survey-*)을 약하게 둔다.
function HomeSurveyCard({ surveys }) {
  if (!surveys || surveys.length === 0) return null;

  return (
    <Card as="section" className="home-survey-card" aria-labelledby="home-survey-heading">
      <div className="home-survey-header">
        <h2 id="home-survey-heading" className="home-survey-heading">심심하세요? 설문조사 하실래요?</h2>
        <Link to="/surveys" className="home-survey-more" aria-label="설문조사 더보기">더보기 →</Link>
      </div>
      <ul className="home-survey-list">
        {surveys.map((survey) => {
          const badge = getSurveyBadge(survey);
          return (
            <li key={survey.id} className="home-survey-item">
              <Link to={`/surveys/${survey.id}`} className="home-survey-link">
                <span className="home-survey-title">{survey.title}</span>
                <Badge tone={badge.tone}>{badge.label}</Badge>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default HomeSurveyCard;

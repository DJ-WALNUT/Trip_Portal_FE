import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PageHeader } from '@/components/ui';
import './Terms.css';

function TermsPage() {
  const [content, setContent] = useState('');

  useEffect(() => {
    // 1. 스크롤 최상단 이동
    window.scrollTo(0, 0);

    // 2. public 폴더의 terms.md 파일 읽어오기
    fetch('/terms/terms.md')
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch((err) => console.error("약관 로드 실패:", err));
  }, []);

  return (
    <div className="terms-page">
      <PageHeader title="이용약관" />
      <div className={'terms-page__body'}>
        <ReactMarkdown
          components={{
            // 상단 제목은 PageHeader가 대신 표시 (본문 텍스트는 .md 그대로)
            h1: () => null,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default TermsPage;

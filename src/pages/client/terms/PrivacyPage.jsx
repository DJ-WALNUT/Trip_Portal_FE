import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PageHeader } from '@/components/ui';
import './Terms.css';

function PrivacyPage() {
  const [content, setContent] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    // public 폴더의 privacy.md 파일 읽어오기
    fetch('/terms//privacy.md')
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch((err) => console.error("개인정보방침 로드 실패:", err));
  }, []);

  return (
    <div className="terms-page">
      <PageHeader title="개인정보 처리방침" />
      <div className={'terms-page__body terms-page__body--disc'}>
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

export default PrivacyPage;

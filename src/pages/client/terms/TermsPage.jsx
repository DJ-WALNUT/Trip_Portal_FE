import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

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
    <div className="wrapper">
      <div className="content">
        <div className="container" style={{maxWidth: '1000px', margin: '2rem auto'}}>
          
          {/* ReactMarkdown 컴포넌트가 md 내용을 HTML로 변환 */}
          <div className="markdown-body">
            <ReactMarkdown
              components={{
                // index.css와 통일감을 주기 위해 태그별 스타일 커스텀
                h1: ({node, ...props}) => <h2 style={{
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: 'var(--main-navy)', 
                    borderBottom: '2px solid var(--light-gray)',
                    paddingBottom: '1rem',
                    marginBottom: '2rem'
                }} {...props} />,
                h3: ({node, ...props}) => <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'var(--main-navy)',
                    marginTop: '2rem',
                    marginBottom: '1rem',
                    borderLeft: '4px solid var(--accent-blue)',
                    paddingLeft: '0.8rem'
                }} {...props} />,
                p: ({node, ...props}) => <p style={{
                    fontSize: '0.95rem', 
                    lineHeight: '1.7', 
                    color: '#555',
                    marginBottom: '1rem',
                    wordBreak: 'keep-all'
                }} {...props} />,
                li: ({node, ...props}) => <li style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.7',
                    color: '#555',
                    marginBottom: '0.3rem',
                    marginLeft: '1.2rem'
                }} {...props} />
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TermsPage;
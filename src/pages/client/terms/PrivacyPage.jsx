import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

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
    <div className="wrapper">
      <div className="content">
        <div className="container" style={{maxWidth: '1000px', margin: '2rem auto'}}>
          
          <div className="markdown-body">
            <ReactMarkdown
               components={{
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
                    marginTop: '2.5rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
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
                    marginLeft: '1.2rem',
                    listStyleType: 'disc'
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

export default PrivacyPage;
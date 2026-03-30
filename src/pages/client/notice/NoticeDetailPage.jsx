import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios'; // axios 추가
import { useParams, useNavigate, Link } from 'react-router-dom';
import './NoticeDetailPage.css';

function NoticeDetailPage() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const processedId = useRef(null); // [NEW] 중복 요청 방지를 위한 ref (이미 불러온 ID인지 기억)

  // [수정] 백엔드 API 연동 (상세 조회)
  useEffect(() => {
    // [중요] 이미 이 ID 데이터를 요청했다면 무시 (StrictMode 두 번 실행 방지)
    if (processedId.current === id) {
        return;
    }
    processedId.current = id; // 현재 ID 처리했음을 표시

    // [수정] increment 파라미터 추가
    axios.get(`/api/notices/${id}`, {
        params: { increment: 'true' } // "이건 조회수 올려주세요" 라고 명시
    })
      .then(res => {
        setNotice(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("상세조회 에러:", err);
        setLoading(false);
        // 에러 시에도 navigate 하기보다 에러 메시지 보여주는게 나을 수 있음
        // alert("존재하지 않거나 삭제된 게시물입니다.");
        // navigate('/notices');
      });
      
      // 언마운트 시(페이지 나갈 때) ref 초기화는 굳이 필요 없음(새 컴포넌트 마운트되므로)
  }, [id, navigate]); // 의존성 배열 유지

  // [NEW] 본문 내 URL을 찾아 하이퍼링크로 변환하는 함수
  const renderContent = (content) => {
    if (!content) return null;

    // URL을 찾는 정규식 (http 또는 https로 시작하고 공백 전까지의 문자열)
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // 정규식으로 텍스트를 쪼갭니다.
    return content.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        // URL이면 <a> 태그로 감싸서 반환
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#3498db', textDecoration: 'underline', fontWeight: '500' }}
          >
            {part}
          </a>
        );
      }
      // 일반 텍스트면 그냥 반환
      return part;
    });
  };

  const isImageFile = (filename) => { // 파일 확장자가 이미지인지 확인하는 헬퍼 함수
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>로딩 중...</div>;
  if (!notice) return null;

  // 배포 환경 도메인
  const BASE_URL = import.meta.env.PROD ? 'https://trip-api.cukeng.kr' : '';

  return (
    <div className="wrapper">
      <div className="content container notice-detail-container">
        
        {/* 1. 게시글 헤더 */}
        <div className="post-header">
            <h2 className="post-title">{notice.title}</h2>
            <div className="post-info">
                <div className="info-item"><span>작성자</span> {notice.author}</div>
                <div className="info-item"><span>작성일</span> {notice.date}</div>
                <div className="info-item"><span>조회수</span> {notice.views}</div>
            </div>
        </div>

        {/* 2. 첨부파일 영역 */}
        {/* notice.files 배열이 있고 길이가 0보다 클 때 */}
        {notice.files && notice.files.length > 0 ? (
            <div className="post-attachments" style={{flexDirection: 'column', alignItems:'flex-start', gap:'10px'}}>
                <span className="attach-label">첨부파일 ({notice.files.length}개)</span>
                {notice.files.map((file) => (
                    <a 
                        key={file.id}
                        href={`${BASE_URL}/api/notices/download/${notice.id}/${file.filename}`} 
                        className="attach-link"
                        download 
                    >
                        📄 {file.filename} (다운로드)
                    </a>
                ))}
            </div>
        ) : (
             <div className="post-attachments" style={{color: '#999'}}>
                <span className="attach-label">첨부파일</span>
                <span>없음</span>
             </div>
        )}

        {/* 3. 게시글 본문 */}
        <div className="post-content">
            {/* 기존: {notice.content} */}
            {/* 변경: 함수를 통해 렌더링 */}
            {renderContent(notice.content)}
        </div>

        {/* [NEW] 3-1. 이미지 미리보기 영역 (첨부파일 중 이미지인 것만 추출) */}
        {notice.files && notice.files.filter(f => isImageFile(f.filename)).length > 0 && (
          <div className="post-image-grid">
            {notice.files
              .filter(file => isImageFile(file.filename))
              .map((file, idx) => (
                <div key={file.id || idx} className="grid-item">
                  <img 
                        src={`${BASE_URL}/api/notices/download/${notice.id}/${file.filename}`} 
                        alt={`첨부 이미지 ${idx + 1}`} 
                        loading="lazy"
                        /*onClick={() => window.open(`${BASE_URL}/api/notices/download/${notice.id}/${file.filename}`, '_blank')}*/
                        style={{ cursor: 'pointer' }}
                  />
                </div>
              ))
            }
          </div>
        )}

        {/* 4. 하단 버튼 */}
        <div className="btn-area">
            <button className="list-btn" onClick={() => navigate('/notices')}>
                목록으로
            </button>
        </div>

      </div>
    </div>
  );
}

export default NoticeDetailPage;
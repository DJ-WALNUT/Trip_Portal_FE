import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios'; // axios 추가
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Eye, Paperclip, ChevronDown } from 'lucide-react';
import { Spinner } from '@/components/ui';
import LucianIcon from '@/components/icons/LucianIcon';
import { formatNoticeDate, getFileExt } from '@/lib/notice';
import './NoticeDetailPage.css';

function NoticeDetailPage() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
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
            className="content-link"
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

  if (loading) return <Spinner />;
  if (!notice) return null;

  // 배포 환경 도메인
  const BASE_URL = import.meta.env.PROD ? 'https://trip-api.cukeng.kr' : '';

  return (
    <div className="notice-detail">
      <div className="notice-detail__inner">

        {/* 1. 게시글 헤더 */}
        <header className="post-header">
          <h1 className="post-title">{notice.title}</h1>
          <div className="post-info">
            <div className="info-item"><User size={14} aria-hidden="true" /><span className="sr-only">작성자</span> {notice.author}</div>
            <div className="info-item"><Calendar size={14} aria-hidden="true" /><span className="sr-only">작성일</span> {formatNoticeDate(notice.date)}</div>
            <div className="info-item"><Eye size={14} aria-hidden="true" /><span className="sr-only">조회수</span> {notice.views}</div>
          </div>
        </header>

        {/* 2. 첨부파일 영역 (접이식, 기본 접힘) */}
        {notice.files && notice.files.length > 0 ? (
          <div className="post-attachments-wrapper">
            <button
              type="button"
              className="attachment-toggle-btn"
              aria-expanded={isFilesOpen}
              aria-controls="notice-attachment-list"
              onClick={() => setIsFilesOpen(!isFilesOpen)}
            >
              <span className="attach-label">
                <Paperclip size={16} aria-hidden="true" />
                첨부파일 {notice.files.length}개
              </span>
              <ChevronDown className="chevron" size={18} aria-hidden="true" />
            </button>

            {isFilesOpen && (
              <div className="attachment-list" id="notice-attachment-list">
                {notice.files.map((file) => (
                  <a
                    key={file.id}
                    href={`${BASE_URL}/api/notices/download/${notice.id}/${file.filename}`}
                    className="attach-link"
                    download
                  >
                    <span className="attach-ext">{getFileExt(file.filename)}</span>
                    <span className="attach-name">{file.filename}</span>
                    <span className="lucian-dl"><LucianIcon name="download" size={20} state="idle" /></span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="post-attachments no-files">
            <Paperclip size={16} aria-hidden="true" />
            <span>첨부파일 없음</span>
          </div>
        )}

        {/* 3. 게시글 본문 */}
        <div className="post-content">
          {renderContent(notice.content)}
        </div>

        {/* 3-1. 이미지 미리보기 영역 (첨부파일 중 이미지인 것만 추출) */}
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
                  />
                </div>
              ))
            }
          </div>
        )}

        {/* 4. 하단 버튼 */}
        <div className="btn-area">
          <button type="button" className="list-btn" onClick={() => navigate('/notices')}>
            목록으로
          </button>
        </div>

      </div>
    </div>
  );
}

export default NoticeDetailPage;

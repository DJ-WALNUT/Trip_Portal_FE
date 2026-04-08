import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axios 추가
import { Link } from 'react-router-dom';
import FloatingSNS from '../components/FloatingSNS'; 
import './HomePage.css'; 

function HomePage() {
  // --- 1. 상태 관리 ---
  const [notices, setNotices] = useState([]); // 공지사항
  const [instaPosts, setInstaPosts] = useState([]); // 인스타그램
  const [dDayInfo, setDDayInfo] = useState({ // 학사일정 D-Day
    left: { label: '-', count: '-' },
    right: { label: '-', count: '-' }
  });
  const [currentIdx, setCurrentIdx] = useState(0); // 슬라이더 인덱스
  const [isServerDown, setIsServerDown] = useState(false); // 서버 상태 관리

  // --- 2. 데이터 가져오기 (API) ---
  useEffect(() => {
    // (1) 최신 공지사항 4개 가져오기
    axios.get('/api/notices')
      .then(res => {
        // 고정 공지 우선 등은 백엔드가 처리함. 앞에서 4개만 자름
        setNotices(res.data.slice(0, 4));
      })
      .catch(err => console.error("공지 로드 실패", err));

    // (2) 인스타그램 게시물 가져오기
    axios.get('/api/instagram/posts')
      .then(res => {
        if(res.data.status === 'success') {
            setInstaPosts(res.data.data);
        }
      })
      .catch(err => console.error("인스타 로드 실패", err));

    // (3) 학사일정 가져오기 및 D-Day 계산
    axios.get('/api/schedule')
      .then(res => {
         calculateDDay(res.data);
      })
      .catch(err => console.error("일정 로드 실패", err));

    // (4) 공지사항 가져오기 (가장 먼저 실행되는 요청으로 체크)
    axios.get('/api/notices')
      .then(res => {
        setNotices(res.data.slice(0, 5));
        setIsServerDown(false); // 성공하면 서버가 켜져 있음
      })
      .catch(err => {
        console.error("공지 로드 실패", err);
        // 만약 에러 응답이 없거나(서버 꺼짐), 500대 에러라면 점검 중으로 판단
        if (!err.response || err.response.status >= 500) {
          setIsServerDown(true);
        }
      });
  }, []);

  // --- 3. D-Day 계산 로직 ---
  const calculateDDay = (scheduleList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let targetLeft = null;
    let targetRight = null;

    for (let i = 0; i < scheduleList.length; i++) {
        const term = scheduleList[i];
        const startDate = new Date(term.start); // 백엔드에서 start라고 줌
        const endDate = term.end ? new Date(term.end) : null;

        if (today < startDate) break; 

        // 학기 중
        if (endDate && today >= startDate && today <= endDate) {
            targetLeft = { label: '개강', date: startDate };
            targetRight = { label: '종강', date: endDate };
            break; 
        }

        // 학기 끝남 (방학) -> 다음 학기 찾기
        if (endDate && today > endDate) {
            const nextTerm = scheduleList[i + 1];
            if (nextTerm) {
                const nextStart = new Date(nextTerm.start);
                if (today < nextStart) {
                    targetLeft = { label: '종강', date: endDate };
                    targetRight = { label: '개강', date: nextStart };
                    break;
                }
            }
        }
    }

    const getDDayString = (targetDate) => {
        if (!targetDate) return '-';
        // use the same `today` date from above so we don't re-evaluate mid-day
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const diffTime = targetDate - todayStart;
        // round toward -infinity so that once the day has passed we get -1, -2, etc
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "D-Day";
        return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
    };

    if (targetLeft && targetRight) {
        setDDayInfo({
            left: { label: targetLeft.label, count: getDDayString(targetLeft.date) }, 
            right: { label: targetRight.label, count: getDDayString(targetRight.date) }
        });
    }
  };

  // --- 4. 슬라이더 핸들러 ---
  const handlePrev = (e) => {
    e.preventDefault(); 
    if (instaPosts.length === 0) return;
    setCurrentIdx((prev) => (prev === 0 ? instaPosts.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault(); 
    if (instaPosts.length === 0) return;
    setCurrentIdx((prev) => (prev === instaPosts.length - 1 ? 0 : prev + 1));
  };

  const BASE_URL = import.meta.env.PROD ? 'https://trip-api.cukeng.kr' : '';
  const getFullImgUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url; // 더미데이터 등
    return `${BASE_URL}${url}`; // 우리 백엔드 이미지
  }
  // 현재 보여줄 인스타 이미지 (데이터 없으면 기본 회색)
  const currentPost = instaPosts.length > 0 ? instaPosts[currentIdx] : null;
  const currentImgUrl = currentPost ? getFullImgUrl(currentPost.imgUrl) : '';

  if (isServerDown) {
    return (
      <section className="maintenance-section container">
          <div className="maintenance-card">
            <span className="maintenance-icon">🛠️</span>
            <h2>여정은 지금 점검 중!</h2>
            <p>
              보다 안정적인 서비스를 위해 <br />서버를 점검하고 있습니다.<br />
              <strong>매일 05:00 ~ 06:00</strong>은 정기 점검 시간입니다.
            </p>
            <div className="maintenance-info">
              <p>이용 가능 서비스:<br />학교페이지 바로가기, 조직도 열람,<br />단과대 및 학과 편성</p>
            </div>
            {/* 점검 중에도 학교 바로가기 링크는 유지 */}
            <div className="shortcut-grid small-grid">
              <a href="https://www.catholic.ac.kr" target="_blank" rel="noreferrer" className="shortcut-card small-card">학교 홈페이지</a>
              <a href="https://www.catholic.ac.kr/ko/support/calendar2024_list.do" target="_blank" rel="noreferrer" className="shortcut-card small-card">학사일정</a>
              <a href="https://uportal.catholic.ac.kr" target="_blank" rel="noreferrer" className="shortcut-card small-card">트리니티</a>
              <a href="https://e-cyber.catholic.ac.kr" target="_blank" rel="noreferrer" className="shortcut-card small-card">사이버캠퍼스</a>
              <a href="https://www.catholic.ac.kr/ko/support/absence_notification.do" target="_blank" rel="noreferrer" className="shortcut-card small-card">공결허가원</a>
            </div>
          </div>
        </section>
    );
  }

  return (
    <div className="main-page-container">
      <section className="hero-section">
        <div className="catch-phrase">
          <p>제4대 공과대학 학생회 [여정]</p>
          <h1>변화를 새길, 우리의 여정!</h1>
        </div>
      </section>

      <section className="notice-section container">
        <div className="notice-header">
            <h2>공지사항</h2>
            <Link to="/notices" className="more-link">더보기 +</Link>
        </div>

        <div className="notice-content">
            {/* 왼쪽: 리스트 + D-Day */}
            <div className="notice-left">
                <ul className="notice-list">
                    {notices.length === 0 ? (
                        <li className="notice-item">등록된 공지사항이 없습니다.</li>
                    ) : notices.map((notice) => (
                        <li key={notice.id} className="notice-item">
                            <Link to={`/notices/${notice.id}`} className="notice-link">
                              <span className="notice-title">{notice.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="d-day-wrapper">
                    <div className="d-day-item">
                        <span className={`d-day-badge ${dDayInfo.left.label === '개강' ? 'start' : 'end'}`}>
                            {dDayInfo.left.label}
                        </span>
                        <div className="d-day-count">{dDayInfo.left.count}</div>
                    </div>
                    <div className="d-day-item">
                        <span className={`d-day-badge ${dDayInfo.right.label === '종강' ? 'end' : 'start'}`}>
                            {dDayInfo.right.label}
                        </span>
                        <div className="d-day-count">{dDayInfo.right.count}</div>
                    </div>
                </div>
            </div>

            {/* 오른쪽: SNS 슬라이더 */}
            <a 
              href={currentPost ? currentPost.link : '#'} 
              target="_blank" 
              rel="noreferrer" 
              className="notice-right"
              style={{ 
                backgroundImage: currentImgUrl ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0)), url(${currentImgUrl})` : 'none',
                backgroundColor: '#999',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
                <div className="sns-header">
                    {/* <span className="sns-icon">📷</span> */}
                    <span className="sns-id">@cuk_engineering</span>
                </div>
                
                <div className="sns-pagination-control">
                    <button onClick={handlePrev} className="arrow-btn">&lt;</button>
                    <span className="page-indicator">
                        {instaPosts.length > 0 ? `${currentIdx + 1} / ${instaPosts.length}` : '- / -'}
                    </span>
                    <button onClick={handleNext} className="arrow-btn">&gt;</button>
                </div>
            </a>
        </div>
      </section>

      {/* 바로가기 섹션 (기존 유지) */}
      <section className="shortcut-section container">
        {/* --사업시작 전 비공개*/}
        <h2>물품 대여 사업</h2>
        <div className="shortcut-grid">
          <Link to="/borrow" className="shortcut-card main-card">
            <span className="icon">📦</span>
            <div className="text">
              <h3>대여 신청</h3>
              <p>학생회 비품을 간편하게 빌려요</p>
            </div>
          </Link>
          <Link to="/check" className="shortcut-card main-card">
            <span className="icon">🔍</span>
            <div className="text">
              <h3>대여 확인</h3>
              <p>신청/대여 기록을 확인하세요</p>
            </div>
          </Link>
        </div>
        <h2 style={{marginTop: '20px'}}>학교 바로가기</h2>
        <div className="shortcut-grid small-grid">
            <a href="https://www.catholic.ac.kr" target="_blank" rel="noreferrer" className="shortcut-card small-card">학교 홈페이지</a>
            <a href="https://www.catholic.ac.kr/ko/support/calendar2024_list.do" target="_blank" rel="noreferrer" className="shortcut-card small-card">학사일정</a>
            <a href="https://uportal.catholic.ac.kr" target="_blank" rel="noreferrer" className="shortcut-card small-card">트리니티</a>
            <a href="https://e-cyber.catholic.ac.kr" target="_blank" rel="noreferrer" className="shortcut-card small-card">사이버캠퍼스</a>
            <a href="https://www.catholic.ac.kr/ko/support/absence_notification.do" target="_blank" rel="noreferrer" className="shortcut-card small-card">공결허가원</a>
        </div>
      </section>
      <FloatingSNS />
    </div>
  );
}

export default HomePage;
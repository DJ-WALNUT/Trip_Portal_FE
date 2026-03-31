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

return (
  <div className="main-page-container april-fools-root">
    {/* 주석으로 개발자의 영혼을 담음 */}
    {/* DEBUG_LOG: April Fools protocol activated.
        INFO: Konami Command (U,U,D,D,L,R,L,R,B,A) is still listening... 
        WARNING: Do not touch the footer 5 times. 
    */}
    
    <section className="hero-section">
      <div className="catch-phrase">
        <p>[시스템] 공과대학 학생회 '여정'에 접속되었습니다...</p>
        <h1>
          <span className="rainbow-text">root@cukeng:~#</span>
          <span className="cursor-blink"> _</span>
        </h1>
      </div>
    </section>

    <section className="notice-section container">
      <div className="notice-header">
          <h2>STDOUT: 공지사항</h2>
          <Link to="/notices" className="more-link">./view_all</Link>
      </div>

      <div className="notice-content">
          <div className="notice-left">
              <ul className="notice-list">
                  <li className="notice-item">
                      <span className="notice-title">데이터 베이스 손상으로 인한 무한 방학 선포</span>
                  </li>
                  <li className="notice-item">
                      <span className="notice-title">학생회장 취임식 (사실 사이보그였다는 설)</span>
                  </li>
                  <li className="notice-item">
                      <span className="notice-title">코나미 커맨드? 아무튼 그런거를 입력해도 아무 일도 없습니다. 진짜로요.</span>
                  </li>
              </ul>

              <div className="d-day-wrapper" style={{background: '#111', color: '#0f0'}}>
                  <div className="d-day-item">
                      <span className="d-day-badge" style={{background: '#333'}}>남은 수명</span>
                      <div className="d-day-count">NaN</div>
                  </div>
                  <div className="d-day-item">
                      <span className="d-day-badge" style={{background: '#333'}}>과제 마감</span>
                      <div className="d-day-count">IMMINENT</div>
                  </div>
              </div>
          </div>

          {/* 인스타 슬라이더 구역 */}
          <div className="notice-right" style={{background: '#000'}}>
              <div className="sns-header">
                  <span className="sns-id">SYSTEM_LOG_INSTA</span>
              </div>
              <div style={{padding: '20px', textAlign: 'center', color: '#0f0'}}>
                  이미지 디코딩 실패... <br/>
                  수동으로 확인하십시오.
              </div>
          </div>
      </div>
    </section>

    <section className="shortcut-section container">
      <h2>핵심 커맨드</h2>
      <div className="shortcut-grid">
        <Link to="/borrow" className="shortcut-card">
          <span className="icon">💾</span>
          <div className="text">
            <h3>데이터 탈취</h3>
            <p>비품이 아니라 정보를 빌려드립니다.</p>
          </div>
        </Link>
        <Link to="/check" className="shortcut-card">
          <span className="icon">🛰️</span>
          <div className="text">
            <h3>위치 추적</h3>
            <p>여러분의 학점을 추적 중입니다.</p>
          </div>
        </Link>
      </div>
    </section>
  </div>
);
}

export default HomePage;
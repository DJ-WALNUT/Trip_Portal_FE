import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axios 추가
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from '../lib/dayjs';
import FloatingSNS from '../components/FloatingSNS';
import DomeGallery from '../components/DomeGallery';
import { Card, Badge, Button } from '@/components/ui';
import LucianIcon from '@/components/icons/LucianIcon';
import { isNewNotice } from '@/lib/notice';
import { RENTAL_ENABLED } from '@/config/features';
import './HomePage.css';

const SCHOOL_LINKS = [
  { href: 'https://www.catholic.ac.kr', label: '학교 홈페이지' },
  { href: 'https://www.catholic.ac.kr/ko/support/calendar2024_list.do', label: '학사일정' },
  { href: 'https://uportal.catholic.ac.kr', label: '트리니티' },
  { href: 'https://e-cyber.catholic.ac.kr', label: '사이버캠퍼스' },
  { href: 'https://www.catholic.ac.kr/ko/support/absence_notification.do', label: '공결허가원' },
];

const SchoolLinks = () => (
  <nav className="school-links" aria-label="학교 바로가기">
    {SCHOOL_LINKS.map(({ href, label }) => (
      <a key={href} href={href} target="_blank" rel="noreferrer" className="school-chip">{label}</a>
    ))}
  </nav>
);

const BASE_URL = import.meta.env.PROD ? 'https://trip-api.cukeng.kr' : '';
const getFullImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url; // 더미데이터 등
  return `${BASE_URL}${url}`; // 우리 백엔드 이미지
};

// --- D-Day 계산 로직 (결과를 반환만 하고 상태 설정은 호출부에서) ---
const calculateDDay = (scheduleList) => {
  const today = dayjs().tz().startOf('day');

  let targetLeft = null;
  let targetRight = null;

  for (let i = 0; i < scheduleList.length; i++) {
    const term = scheduleList[i];
    const startDate = dayjs(term.start).tz().startOf('day');
    const endDate = term.end ? dayjs(term.end).tz().startOf('day') : null;

    if (today.isBefore(startDate)) break;

    // --- [Case A] 현재 '학기 중'인 경우 ---
    // 오늘이 시작일 이후이고, 종료일 이전(또는 당일)일 때
    if (endDate && (today.isSame(startDate) || today.isAfter(startDate)) && (today.isSame(endDate) || today.isBefore(endDate))) {
      targetLeft = { label: '개강', date: startDate };
      targetRight = { label: '종강', date: endDate };
      break;
    }

    // --- [Case B] 현재 '방학(학기 종료 후)'인 경우 ---
    // 오늘이 현재 루프의 학기 종료일보다 뒤에 있다면 다음 학기를 확인
    if (endDate && today.isAfter(endDate)) {
      const nextTerm = scheduleList[i + 1];
      if (nextTerm) {
        const nextStart = dayjs(nextTerm.start).tz().startOf('day');

        // 오늘이 다음 학기 시작 전이라면, 현재는 '방학' 상태
        if (today.isBefore(nextStart)) {
          targetLeft = { label: '종강', date: endDate };   // 지난 종강일로부터 얼마나 지났나
          targetRight = { label: '개강', date: nextStart }; // 다가올 개강일까지 얼마나 남았나
          break;
        }
      }
    }
  }

  // D-Day 문자열 생성 보조 함수 (Day.js 적용)
  const getDDayString = (targetDate) => {
    if (!targetDate) return '-';
    const diffDays = targetDate.diff(today, 'day'); // 위에서 정의한 today 사용

    if (diffDays === 0) return "D-Day";
    return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  };

  if (targetLeft && targetRight) {
    return {
      left: { label: targetLeft.label, count: getDDayString(targetLeft.date) },
      right: { label: targetRight.label, count: getDDayString(targetRight.date) }
    };
  }
  return null;
};

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
  const [galleryImages, setGalleryImages] = useState([]);

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
         const info = calculateDDay(res.data);
         if (info) setDDayInfo(info);
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

  useEffect(() => {
    axios.get('/api/gallery')
      .then(res => {
        const shuffled = [...res.data].sort(() => 0.5 - Math.random());
        // 1. 전체 데이터 중 일부만 추출
        const limitedData = shuffled.slice(0, 15);
        // 백엔드에서 이미 완성된 API 경로(/api/gallery/image/...)를 주므로
        // getFullImgUrl을 거치지 않고 그대로 사용하거나, 필요한 경우에만 처리합니다.
        const formattedImages = limitedData.map((img) => ({
          // 백엔드 응답의 src가 이미 /api/gallery/... 로 시작한다면 그대로 사용
          src: img.src.startsWith('http') ? img.src : `${BASE_URL}${img.src}`,
          alt: img.alt || "여정 활동 사진"
        }));
        setGalleryImages(formattedImages);
      })
      .catch(err => console.error("갤러리 로드 실패:", err)
    );
  }, []);

  // --- 3. 슬라이더 핸들러 ---
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

  // 현재 보여줄 인스타 이미지 (데이터 없으면 기본 회색)
  const currentPost = instaPosts.length > 0 ? instaPosts[currentIdx] : null;
  const currentImgUrl = currentPost ? getFullImgUrl(currentPost.imgUrl) : '';

  if (isServerDown) {
    return (
      <section className="maintenance-section">
        <Card className="maintenance-card">
          <span className="maintenance-icon"><LucianIcon name="wrench" size={48} /></span>
          <h2>여정은 지금 점검 중!</h2>
          <p>
            보다 안정적인 서비스를 위해 <br />서버를 점검하고 있습니다.<br />
            <strong>매일 05:00 ~ 06:00</strong>은 정기 점검 시간입니다.
          </p>
          <div className="maintenance-info">
            <p>이용 가능 서비스:<br />학교페이지 바로가기, 조직도 열람,<br />단과대 및 학과 편성</p>
          </div>
          {/* 점검 중에도 학교 바로가기 링크는 유지 */}
          <SchoolLinks />
        </Card>
      </section>
    );
  }

  return (
    <div className="main-page-container">
      <section className="hero-section">
        {/* 1. 배경: Dome Gallery (제스처 적용됨) */}
        <div className="hero-background">
          <DomeGallery
            images={galleryImages.length > 0 ? galleryImages : []}
            segments={39}
            fit={0.8}
            minRadius={950}
            maxVerticalRotationDeg={0}
            dragDampening={2}
          />
          <div className="hero-dim-overlay"></div>
        </div>

        {/* 2. 콘텐츠: 문구 + 바로가기 버튼 */}
        <div className="hero-content">
          <div className="catch-phrase">
            <p className="hero-sub-text">제4대 공과대학 학생회 [여정]</p>
            <h1 className="hero-main-title">변화를 새길, 우리의 여정!</h1>
          </div>
          <div className="hero-actions">
            {RENTAL_ENABLED ? (
              <Button as={Link} to="/borrow" className="hero-action">
                <LucianIcon name="box" size={28} /><span>대여 신청</span>
              </Button>
            ) : (
              <Button
                as="div"
                className="hero-action hero-action--disabled"
                aria-disabled="true"
                title="대여 신청은 현재 이용할 수 없습니다."
              >
                <LucianIcon name="box" size={28} />
                <span className="hero-action-text">
                  <span>대여 신청</span>
                  <small className="hero-action-note">현재 이용할 수 없습니다</small>
                </span>
              </Button>
            )}
            <Button as={Link} to="/check" className="hero-action">
              <LucianIcon name="search" size={28} /><span>대여 확인</span>
            </Button>
            <Button as={Link} to="/campusmap" className="hero-action">
              <LucianIcon name="map" size={28} /><span>성심지도</span>
            </Button>
          </div>
        </div>
      </section>

      <div className="home-body">
        <SchoolLinks />

        <div className="home-grid">
          <Card as="section" className="notice-card">
            <div className="notice-header">
              <h2>공지사항</h2>
              <Link to="/notices" className="more-link">더보기 →</Link>
            </div>
            <ul className="notice-list">
              {notices.length === 0 ? (
                <li className="notice-item notice-empty">등록된 공지사항이 없습니다.</li>
              ) : notices.map((notice) => (
                <li key={notice.id} className="notice-item">
                  <Link to={`/notices/${notice.id}`} className="notice-link">
                    {notice.fixed && <Badge tone="pinned">고정</Badge>}
                    {isNewNotice(notice.date) && <Badge tone="new">NEW</Badge>}
                    <span className="notice-title">{notice.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <aside className="home-aside">
            <Card className="dday-card">
              <h2 className="dday-heading">
                <LucianIcon name="calendar" size={22} />
                <span>학사 D-Day</span>
              </h2>
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
            </Card>

            <div
              className="insta-card"
              style={{
                backgroundImage: currentImgUrl ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0)), url(${currentImgUrl})` : 'none',
              }}
            >
              <a
                href={currentPost ? currentPost.link : '#'}
                target="_blank"
                rel="noreferrer"
                className="insta-link"
                aria-label="인스타그램 게시물 열기"
              />
              <div className="sns-header">
                <span className="sns-id">@cuk_engineering</span>
              </div>
              <div className="sns-pagination-control">
                <button type="button" onClick={handlePrev} className="arrow-btn" aria-label="이전 게시물">
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <span className="page-indicator">
                  {instaPosts.length > 0 ? `${currentIdx + 1} / ${instaPosts.length}` : '- / -'}
                </span>
                <button type="button" onClick={handleNext} className="arrow-btn" aria-label="다음 게시물">
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <FloatingSNS />
    </div>
  );
}

export default HomePage;

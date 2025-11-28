## ✈️ 가톨릭대 4대 공과대학 학생회 [여정] 포털 (Frontend)

가톨릭대학교 공과대학 학생회 **여정**의 통합 포털 웹 서비스 프론트엔드 레포지토리입니다.
학우들이 간편하게 비품을 대여하고 공지사항을 확인할 수 있으며, 관리자가 효율적으로 재고 및 대여 현황을 관리할 수 있도록 **React 기반의 SPA(Single Page Application)**로 구축되었습니다.

[![React](https://img.shields.io/badge/React-18.2.0-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-6.20-CA4245?style=flat-square&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-HTTP_Client-5A29E4?style=flat-square&logo=axios&logoColor=white)](https://axios-http.com/)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
<br/>
[![Synology](https://img.shields.io/badge/Synology_NAS-Web_Station-B0B3B8?style=flat-square&logo=synology&logoColor=white)](https://www.synology.com/)
[![Apache](https://img.shields.io/badge/Apache-Server_Config-D22128?style=flat-square&logo=apache&logoColor=white)](https://httpd.apache.org/)

### ✨ 주요 기능

#### 👤 사용자 (User)
- **정보 허브**:
  - **스마트 D-Day**: 학사일정(개강/종강)을 기준으로 남은 기간 및 경과일을 자동 계산하여 표시.
  - **인스타그램 연동**: 학생회 공식 인스타그램의 최신 피드 이미지를 슬라이더 형태로 제공.
- **공지사항 (Board)**:
  - **게시글 조회**: 상단 고정(Pin) 및 최신순 정렬, 긴 제목 말줄임표(...) 처리.
  - **파일 다운로드**: 게시글에 첨부된 다중 파일을 원클릭으로 다운로드.
- **물품 대여**: 카테고리별 조회, 장바구니, 실시간 재고 체크 및 대여 신청.
- **마이페이지**: 이름/학번 기반 대여 현황 조회 및 반납 예정일 확인.
- **티저 이벤트**: ClickSpark 애니메이션이 적용된 인터랙티브 이벤트 페이지.

#### ⚙️ 관리자 (Admin)
- **CMS (콘텐츠 관리)**:
  - **공지사항 작성/수정**: 텍스트 에디팅 및 다중 파일 업로드 지원.
  - **공개 설정**: '임시 저장(미공개)' 및 '전체 공개' 상태 제어 기능.
- **대시보드**: 금일 대여 통계 및 실시간 로그 모니터링.
- **대여/반납 관리**:
  - **자동 연체 감지**: 반납 기한(7일) 경과 시 붉은색 하이라이팅으로 시각적 경고.
  - 원클릭 승인/반납 처리 및 재고 수량 자동 복구 연동.
- **데이터 관리**: 전체 대여 기록 엑셀 다운로드 (Timestamp 파일명 자동 생성).

---

### 💡 기술적 구현 포인트 (Technical Highlights)

#### 1. API 중복 호출 방지 및 최적화
- **Issue**: `React.StrictMode` 환경에서 `useEffect`가 두 번 실행되어 조회수가 중복 집계되는 문제 발생.
- **Solution**: `useRef`를 활용한 **Request Lock** 메커니즘을 도입하여, 동일한 ID에 대한 중복 API 요청을 클라이언트 단에서 원천 차단.

#### 2. 환경별 네트워크 설정 분리 (Hybrid Network)
- **Development**: `vite.config.js`의 **Proxy** 설정을 통해 CORS 문제를 해결하고 로컬 백엔드와 통신.
- **Production**: `import.meta.env.PROD` 분기 처리를 통해 배포 환경에서는 실제 도메인(`trip-api...`)으로 `Axios` BaseURL을 동적 바인딩. 쿠키 인증(`withCredentials`) 자동화.

#### 3. 보안 및 사용자 경험 (UX)
- **접근 제어 UX**: 관리자가 아닌 일반 사용자에게는 '미공개' 게시물을 목록에서 원천적으로 숨김 처리(Filtering). 관리자 뷰에서는 `[🔒 미공개]` 뱃지로 직관적인 상태 구분 제공.
- **반응형 테이블**: 모바일 환경에서 데이터 테이블이 깨지지 않도록 `overflow-x` 및 `min-width`를 활용한 수평 스크롤 UI 구현.

---

### 🛠️ 기술 스택 (Tech Stack)
- **Build Tool**: Vite
- **Framework**: React 18
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (Interceptors & Config)
- **Styling**: Pure CSS (Module & Global Variables)

---

### 🚀 설치 및 실행 (Installation)

#### 개발 환경 (Development)
```bash
# 1. 패키지 설치
npm install

# 2. 개발 서버 실행 (Port: 5173)
# 로컬 백엔드(Port: 5050)가 실행 중이어야 합니다.
npm run dev
```

#### 배포 (Production)
```
# 빌드 (dist 폴더 생성)
npm run build
```
생성된 `dist` 폴더의 내용을 웹 서버(Synology Web Station, Nginx, Apache 등)의 루트 경로에 업로드합니다.

#### ⚠️ 배포 시 주의사항 (SPA 라우팅 설정)
이 프로젝트는 Single Page Application(SPA)이므로, 새로고침 시 404 오류가 발생하지 않도록 **모든 요청을 `index.html`로 리다이렉트** 해야 합니다.

**Apache (Synology Web Station 권장)** : 배포 폴더(`dist` 내용물이 있는 곳) 최상단에 `.htaccess` 파일을 생성하고 아래 내용을 작성하세요.
```Apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx** : Nginx 설정 파일(`nginx.conf` 또는 `default.conf`)의 `location /` 블록에 `try_files`를 추가하세요.
```Nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 🔧 설정 (Configuration)
**API 연결 설정**

배포 환경에서 백엔드 API 주소를 변경하려면 src/main.jsx를 수정합니다.
```
// src/main.jsx
if (import.meta.env.PROD) {
  // 실제 배포된 백엔드 주소 (HTTPS 권장)
  // 예: [https://api.your-domain.com](https://api.your-domain.com)
  axios.defaults.baseURL = '[https://your-backend-api-url.com](https://your-backend-api-url.com)';
}
```

**개발 프록시 설정**

로컬 개발 시 CORS 문제를 방지하기 위해 `vite.config.js`에서 프록시를 설정합니다.
```
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5050', // 로컬 백엔드 주소
      changeOrigin: true,
    }
  }
}
```

### 📂 폴더 구조
```
src/
├── components/      # 공통 컴포넌트 (Header, Footer, AdminHeader)
├── pages/           # 페이지 컴포넌트
│   ├── admin/       # 관리자 전용 페이지 (승인, 반납, 재고 등)
│   └── ...          # 사용자용 페이지 (메인, 대여, 조회, 결과)
├── assets/          # 이미지, 폰트 등 정적 자원
├── App.jsx          # 라우팅 설정
└── main.jsx         # 진입점 및 Axios 설정
```

Copyright © 2025 Catholic University of Korea, CUK Engineering Student 4th Council [Trip] (최원서).

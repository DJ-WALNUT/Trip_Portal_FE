## ✈️ 가톨릭대 4대 공과대학 학생회 [여정] 포털 (Frontend)

가톨릭대학교 공과대학 학생회 **여정**의 홈페이지 및 물품 대여 웹 서비스 프론트엔드 레포지토리입니다.
학우들이 간편하게 비품을 대여하고, 관리자가 효율적으로 재고 및 대여 현황을 관리할 수 있도록 `SPA(Single Page Application)`로 구축되었습니다.

### ✨ 주요 기능

#### 👤 사용자 (User)
- 메인 페이지: 대여 사업 소개 및 학사 정보 바로가기 링크 제공.
- 물품 대여: 카테고리별 물품 조회, 장바구니 담기, 실시간 재고 확인.
- 신청/대여 확인: 이름과 학번을 통한 개인별 대여 현황 및 반납 기한 조회.
- 반응형 디자인: PC 및 모바일 환경 완벽 지원.

#### ⚙️ 관리자 (Admin)
- 대시보드: 금일 대여 건수 및 최근 활동 로그 시각화.
- 대여 승인: 신청 들어온 내역 확인 및 승인/거절 처리.
- 반납 관리: 미반납 목록 조회 및 원클릭 반납 처리.
- 재고 관리: 실시간 재고 수량 수정, 신규 물품 추가/삭제.
- 로그 관리: 전체 대여 기록 조회 및 엑셀 다운로드 기능.

#### 🛠️ 기술 스택 (Tech Stack)
- Build Tool: Vite
- Framework: React 18
- Routing: React Router DOM v6
- HTTP Client: Axios
- Styling: Custom CSS (Responsive, Mobile-first)

#### 🚀 설치 및 실행 (Installation)
**사전 요구사항**
- Node.js (v18 이상 권장)
- npm

**개발 환경 (Development)**
```
# 1. 프로젝트 클론
git clone [https://github.com/username/trip-frontend.git](https://github.com/username/trip-frontend.git)
cd trip-frontend

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

**배포 (Production)**
```
# 빌드 (dist 폴더 생성)
npm run build
```
생성된 `dist` 폴더의 내용을 웹 서버(Synology Web Station, Nginx, Apache 등)의 루트 경로에 업로드합니다.

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

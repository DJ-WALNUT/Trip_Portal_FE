# 여정 홈페이지 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기능과 정보 구조를 그대로 둔 채, 사용자 페이지(모바일 우선)와 관리자 페이지(사이드바)를 '정돈된 네이비' 톤으로 리디자인한다.

**Architecture:** `src/styles/tokens.css`의 디자인 토큰 위에 `src/components/ui/`의 공통 컴포넌트(일반 CSS)를 만들고, 각 페이지의 JSX와 CSS를 이 컴포넌트로 다시 작성한다. 상태 로직과 API 호출 코드는 옮겨 붙이기만 하고 바꾸지 않는다. 판단 로직(상태 색, NEW 판정, 재고 변경 감지, 사이드바 저장)은 `src/lib/`의 순수 함수로 분리해 단위 테스트한다. 관리자 라우트는 `AdminLayout`으로 감싼다.

**Tech Stack:** React 19, Vite 7, react-router-dom 7, axios, 일반 CSS, lucide-react, Lucian Icons 2.0.13(웹 컴포넌트, vendored). 테스트는 Vitest와 Testing Library(jsdom)를 쓴다(이번에 devDependency로 추가).

**Spec:** `docs/superpowers/specs/2026-10-21-site-redesign-design.md`

## Global Constraints

- 브랜드 색: navy-900 `#001f3f`, navy-700 `#004085`, saegil `#3986c6`, sky `#A9D0F5`. 폰트는 `'Pretendard GOV Variable'`만 쓴다.
- 기존 CSS 변수(`--main-navy`, `--second-navy`, `--light-sky-blue`, `--accent-blue`, `--saegil-blue`, `--background-color`, `--text-color`, `--light-gray`, `--white`, `--danger`, `--success`, `--border-radius`, `--box-shadow`)와 shadcn oklch 변수는 삭제하지 않는다.
- 중단점: `min-width: 768px`(태블릿), `min-width: 1024px`(데스크톱). 사용자 페이지는 모바일 스타일이 기본이고 `min-width` 쿼리로 확장한다.
- 터치 영역은 최소 44×44px, `:focus-visible` 링은 `2px solid var(--color-saegil)`이다.
- **라우트 경로 문자열과 페이지 컴포넌트의 연결은 바꾸지 않는다.** 관리자 라우트를 감싸는 레이아웃만 바꾼다(Task 10).
- 모든 `alert(...)`/`window.confirm(...)` 문구, API 경로, 요청 payload, `localStorage`의 `isAdmin`/`adminRole` 사용은 글자 하나도 바꾸지 않는다.
- 이모지 아이콘은 Lucian(`<LucianIcon>`)이나 lucide-react로 바꾼다. 아이콘 매핑은 Task 3의 표를 따른다.
- **운영 API(`https://trip-api.cukeng.kr`)로 데이터를 바꾸는 요청(POST/PUT/DELETE)을 보내지 않는다.** 수동 검증은 Task 1의 로컬 백엔드에서만 한다.
- 티저 페이지(`TeaserPage`, `/teaser/*`)와 `AdminTeaserPage`의 본문 JSX·CSS는 수정하지 않는다(`<AdminHeader />` 제거만 허용).
- 백엔드 저장소(`Trip_Portal_BE`)의 추적 파일은 수정하지 않는다. 프론트 로직이 과도해지면 작업을 멈추고 사용자에게 백엔드 변경안을 먼저 제시한다.
- 대여 상태 표시 글자는 백엔드 값(`신청`/`미반납`/`반납완료`)을 그대로 쓰고, 색만 `getBorrowTone`(Task 4)으로 정한다.
- 커밋 메시지는 저장소 관례(`[feat] …`, `[style] …`, `[fix] …`, `[docs] …`, `[chore] …`, `[test] …`)를 따르고, 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`를 붙인다.
- 각 Task는 `npm run test -- --run`, `npm run lint`, `npm run build`가 모두 통과한 상태로 끝낸다.

## Review Focus

1. **대여 2단계에서 브라우저 뒤로 가기, 새로고침, 신청 버튼 연타**: 뒤로 가기는 1단계로 돌아가고 선택이 남아야 한다. 새로고침하면 1단계부터 다시 시작한다. 요청이 진행 중이면 신청 버튼이 비활성되어 중복 신청이 생기지 않아야 한다. → Task 7
2. **360px 화면에서 띄어쓰기 없는 긴 한글 물품명·공지 제목·파일명, 많은 카테고리 탭**: 가로 스크롤 없이 줄바꿈되거나 말줄임 처리돼야 한다. → Task 2(`ui.css` 규칙), Task 6·7·9의 수동 확인
3. **`localStorage` 접근 예외(사생활 보호 모드)와 `adminRole`이 없거나 `sub`인 경우**: 사이드바는 기본값(펼침)으로 동작하고, master 전용 메뉴는 숨겨져야 한다. → Task 10
4. **공지 날짜 형식 차이**: `+09:00`이 붙은 ISO, 시간대가 없는 ISO, 잘못된 값이 와도 NEW 판정과 날짜 표시가 예외 없이 처리돼야 한다(잘못된 값은 NEW 아님, 원문 표시). → Task 4
5. **`미반납`이면서 반납기한이 `-`이거나 형식이 잘못된 경우, 그리고 기한 당일**: 연체가 아닌 대여중(파랑)으로 보여야 한다. 기한 당일까지는 대여중이고, 다음 날부터 연체다. → Task 4

---

## File Structure

**신규**
| 경로 | 책임 |
|---|---|
| `vitest.config.js`, `src/test/setup.js` | 테스트 환경(jsdom, jest-dom) |
| `tools/local-backend/README.md`, `tools/local-backend/seed_dev_data.py` | 로컬 백엔드 실행 안내와 더미 데이터 시드 |
| `src/styles/tokens.css` | 디자인 토큰 |
| `src/components/ui/*.jsx` + `ui.css` | 공통 컴포넌트(Button, Card, Badge, PageHeader, Field, EmptyState, Spinner, BottomBar, Toggle, ResponsiveTable). CSS는 `ui.css` 하나로 모은다 |
| `src/components/ui/index.js` | 공통 컴포넌트 배럴 export |
| `src/vendor/lucian-icons/` | Lucian 런타임과 선택한 모듈(CLI로 생성, 직접 수정 금지) |
| `src/components/icons/LucianIcon.jsx` | Lucian 웹 컴포넌트 React 래퍼 |
| `src/lib/borrowStatus.js` | `getBorrowTone` |
| `src/lib/notice.js` | `isNewNotice`, `formatNoticeDate`, `getFileExt` |
| `src/lib/stock.js` | `getDirtyItemNames` |
| `src/lib/safeStorage.js` | `readBool`, `writeBool` (try/catch) |
| `src/layouts/AdminLayout.jsx`, `AdminLayout.css`, `src/layouts/adminNav.js`, `src/layouts/AdminContext.jsx` | 관리자 셸, 메뉴 정의, 대기 건수 context |
| `src/pages/client/borrow/BorrowItemStep.jsx`, `BorrowFormStep.jsx`, `StepIndicator.jsx` | 대여 마법사 단계 |

**수정**: `vite.config.js`, `package.json`, `src/index.css`, `src/main.jsx`, `src/App.jsx`, `src/layouts/MainLayout.jsx`, `src/components/{Header,Footer,FloatingSNS,FacilityModal,CampusMap}.{jsx,css}`, `src/components/z_dino(easter)/DinoGame.{jsx,css}`, `src/pages/HomePage.{jsx,css}`, `src/pages/client/**`(teaser 제외), `src/pages/admin/**`(AdminTeaserPage는 헤더 제거만)

**삭제**: `src/components/AdminHeader.jsx` (Task 12에서 마지막 사용처를 제거한 뒤)

---

## Stage A: 기반

### Task 1: 테스트 환경, 프록시 환경변수, 로컬 백엔드 도구

**Files:**
- Modify: `package.json`, `vite.config.js`
- Create: `vitest.config.js`, `src/test/setup.js`, `src/test/smoke.test.js`, `tools/local-backend/README.md`, `tools/local-backend/seed_dev_data.py`
- Modify: `.gitignore` (`.superpowers/` 추가)

**Interfaces:**
- Produces: `npm run test` 스크립트, `VITE_API_TARGET` 환경변수, 로컬 백엔드(포트 5000)와 더미 데이터

- [ ] **Step 1:** `npm i -D vitest@^3 @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14 jsdom@^25`을 실행하고, `package.json`의 scripts에 `"test": "vitest"`를 추가한다.
- [ ] **Step 2:** `vitest.config.js`를 만든다. `@vitejs/plugin-react`를 쓰고, `test: { environment: 'jsdom', setupFiles: ['./src/test/setup.js'], css: false }`, alias `@ → ./src`를 둔다. `setup.js`는 `import '@testing-library/jest-dom/vitest'`이다.
- [ ] **Step 3:** `src/test/smoke.test.js`를 쓴다: `it('jest-dom matchers loaded', () => { const el = document.createElement('div'); document.body.append(el); expect(el).toBeInTheDocument(); })`. Run: `npm run test -- --run`, Expected: 1 passed (setup 파일이 빠지면 `toBeInTheDocument is not a function`으로 실패한다)
- [ ] **Step 4:** `src/test/setup.js`의 import를 잠시 주석 처리하고 실패를 확인한 뒤 되돌린다.
- [ ] **Step 5:** `vite.config.js`의 proxy target을 `process.env.VITE_API_TARGET || 'https://trip-api.cukeng.kr'`로 바꾼다(기존 주석 유지).
- [ ] **Step 6:** `tools/local-backend/seed_dev_data.py`를 작성한다. 인자로 BE 경로(기본값 `../Trip_Portal_BE`)를 받아 `data/`에 다음을 만들고, 파일이 이미 있으면 `--force` 없이는 중단한다.
  - `stuff_ongoing.xlsx`: 열은 `물품, 재고현황, 카테고리`. 카테고리 `생활`·`전자`·`행사`·`일회용품`에 12종 이상을 넣고, 재고 0 하나와 띄어쓰기 없는 긴 이름(`초대형휴대용접이식돗자리세트`) 하나를 포함한다.
  - `borrow_log.xlsx`: 열은 `이름,전화번호,학번,학과,대여물품,대여담당자,대여시각,대여현황,반납담당자,반납시각`. `신청` 3건(오늘), `미반납` 3건(1건은 대여시각 오늘-2일, 2건은 오늘-10일로 연체), `반납완료` 3건을 넣는다. 대여시각 형식은 `%Y-%m-%d %H:%M:%S`이다.
  - `major.xlsx`: `학과명` 열에 6개 학과
  - `building_info.xlsx`, `facility_info.xlsx`: `Trip_Portal_BE/routes/campus_routes.py`가 읽는 열 이름을 그대로 써서 2건씩 넣는다.
  - `database.db`: `sqlite3`로 `notices`에 6건을 넣는다(고정 1건, 오늘 작성 1건, 비공개 1건, 띄어쓰기 없는 긴 제목 1건). 열은 `models.py`의 Notice와 같다. `insta_posts`에 3건을 넣는다. 테이블이 없으면 `models.py`의 열 정의대로 `CREATE TABLE`한다.
- [ ] **Step 7:** `tools/local-backend/README.md`를 쓴다. 내용은 `py -3.11 -m venv .venv`, `pip install -r ../Trip_Portal_BE/requirements.txt`, `.env` 예시(`ADMIN_PASSWORD=devmaster`, `SUB_PASSWORD=devsub`, `FLASK_SECRET_KEY=dev`), `python seed_dev_data.py`, BE 폴더에서 `python app.py`, FE에서 PowerShell `$env:VITE_API_TARGET='http://localhost:5000'; npm run dev`, 그리고 "로그 엑셀 다운로드 버튼은 운영 URL이 하드코딩되어 있으니 클릭 금지" 경고다.
- [ ] **Step 8:** 검증한다. 시드를 실행하고 BE를 기동한 다음, `curl -s localhost:5000/api/items`(12종 이상), `curl -s localhost:5000/api/notices`(공개 5건), `curl -s localhost:5000/api/departments`(6건)를 확인한다. 그다음 `$env:VITE_API_TARGET='http://localhost:5000'; npm run dev`로 FE를 띄우고 `http://localhost:5173/api/items`가 로컬 데이터를 돌려주는지 확인한다. 끝나면 BE의 `git status --short`가 비어 있어야 한다(data/는 ignore 대상).
- [ ] **Step 9:** lint와 build를 통과시키고 커밋한다: `[chore] 테스트 환경·로컬 백엔드 도구·프록시 환경변수 추가`

### Task 2: 디자인 토큰과 공통 UI 컴포넌트

**Files:**
- Create: `src/styles/tokens.css`, `src/components/ui/{Button,Card,Badge,PageHeader,Field,EmptyState,Spinner,BottomBar,Toggle,ResponsiveTable}.jsx`, `src/components/ui/ui.css`, `src/components/ui/index.js`
- Modify: `src/index.css`(상단에 `@import './styles/tokens.css';`, 기존 변수가 토큰을 참조하도록 수정, `.container` 모바일 우선으로 재작성), `src/main.jsx`(`ui.css` import)
- Test: `src/components/ui/ui.test.jsx`

**Interfaces:**
- Produces (모두 `@/components/ui`에서 named export):
  - `Button({ variant='primary'|'ghost'|'danger', size='md'|'lg', as?: 'button'|Link|'a', block?: bool, ...rest })`: `className="btn btn--{variant} btn--{size}"`. `as`를 주지 않으면 `<button type="button">`이다.
  - `Card({ as='div', className, children })`: `.card`
  - `Badge({ tone='neutral'|'pending'|'ongoing'|'overdue'|'done'|'new'|'pinned', children })`: `<span class="badge badge--{tone}">`
  - `PageHeader({ title, description?, actions?, icon? })`: `<header class="page-header">`에 `<h1>`이 들어간다.
  - `Field({ label, htmlFor, hint?, children })`: `<label for>`과 slot
  - `EmptyState({ icon?, title, description?, children? })`
  - `Spinner({ label='불러오는 중…' })`: `role="status"`
  - `BottomBar({ children })`: 모바일에서는 `position: fixed; bottom: 0`과 `padding-bottom: env(safe-area-inset-bottom)`, `≥768px`에서는 `position: static`이다.
  - `Toggle({ checked, onChange, label, id, name? })`: `<input type="checkbox" role="switch">` 기반이고 `onChange`에는 원래 change 이벤트를 그대로 넘긴다.
  - `ResponsiveTable({ columns: [{ key, header, render?: (row) => node, primary?: bool }], rows, rowKey: (row, idx) => key, empty?: node, breakpoint='md'|'lg' })`: 표 `<table class="rtable__table">`와 카드 목록 `<ul class="rtable__cards">`를 함께 렌더링하고 CSS로 하나만 보여준다(`md`=768, `lg`=1024 기준). 카드에서는 `primary` 열이 제목이 된다. `rows`가 비면 `empty`를 보여준다.
- 토큰 이름: `--color-navy-900, --color-navy-700, --color-saegil, --color-sky, --color-bg, --color-surface, --color-border, --color-text, --color-text-muted, --gray-50…--gray-900`, 상태 쌍 `--tone-{pending|ongoing|overdue|done|new|pinned}-{bg|fg}`, `--space-1…--space-12`(4px 단위), `--radius-card: 12px; --radius-control: 10px; --radius-pill: 999px`, `--shadow-sm, --shadow-md`, `--fs-body: 15px; --fs-sub: 18px; --fs-title: 22px`(`≥1024px`에서 16/20/26), `--header-h: 70px`
- 상태 색 값(스펙 3.1): pending `#fff3d6/#b45309`, ongoing `#dbeafe/#1d4ed8`, overdue `#fee2e2/#b91c1c`, done `#dcfce7/#15803d`, new `#fee2e2/#dc2626`, pinned `#dbeafe/#1d4ed8`

- [ ] **Step 1: 실패하는 테스트를 쓴다** (`ui.test.jsx`)
  - `Badge renders tone class`: `render(<Badge tone="overdue">미반납</Badge>)` → `getByText('미반납')`의 class에 `badge--overdue`
  - `Button defaults to type=button`: `getByRole('button')`의 `type` 속성이 `'button'`
  - `Toggle exposes switch role and forwards change`: `role="switch"`를 클릭하면 `onChange`가 1회 호출되고, 인자의 `target.checked === true`
  - `ResponsiveTable renders both views and empty`: rows 2개면 `getAllByRole('row')`가 3개(헤더 포함)이고 `.rtable__cards li`가 2개다. rows가 `[]`이면 `empty` 노드 텍스트가 보인다.
  - `ResponsiveTable uses render()`: `render: r => <b>{r.n}!</b>`가 표와 카드 양쪽에 나온다(`getAllByText('a!')`.length === 2).
- [ ] **Step 2:** `npm run test -- --run src/components/ui`를 실행한다. Expected: 모듈이 없어 FAIL
- [ ] **Step 3:** 위 Interfaces대로 컴포넌트, `tokens.css`, `ui.css`를 구현한다. `ui.css`에 전역 규칙 `.card, .badge, .rtable__cards li { overflow-wrap: anywhere; min-width: 0; }`와 `:focus-visible` 링을 넣는다.
- [ ] **Step 4:** 테스트를 다시 실행한다. Expected: PASS
- [ ] **Step 5:** `npm run dev`로 띄운 뒤 티저 페이지 `/teaser`가 이전과 똑같이 보이는지 확인하고, 홈의 기존 화면이 깨지지 않는지 육안으로 확인한다.
- [ ] **Step 6:** lint와 build를 통과시키고 커밋한다: `[feat] 디자인 토큰과 공통 UI 컴포넌트 추가`

### Task 3: Lucian Icons 반입과 `LucianIcon` 래퍼

**Files:**
- Create: `src/vendor/lucian-icons/*` (CLI 생성), `src/components/icons/LucianIcon.jsx`, `src/components/icons/LucianIcon.test.jsx`

**Interfaces:**
- Produces: `LucianIcon({ name, state?, size=24, tone?: 'color'|'line', accent?, label?, animate?: 'hover'|'click'|'none', className? })`. `<lucian-{name}>`을 렌더링한다. `label`이 없으면 `aria-hidden="true"`를 붙인다. `state`가 바뀌면 ref의 `setState(state)`를 호출하는데, 엘리먼트가 아직 upgrade되지 않았으면 `state` 속성만 반영한다. 모듈은 `LucianIcon.jsx` 상단에서 아래 표의 아이콘 모듈을 정적 `import`로 불러와 등록한다.
- **아이콘 매핑** (catalog 2.0.13, 번호는 갤러리 번호)

| 용도 | id(#) | state 연결 |
|---|---|---|
| 홈 바로가기 대여 신청 / 관리자 재고 | `box` (#157) | 없음 |
| 홈 바로가기 대여 확인 / 확인 페이지 | `search` (#48) | CheckPage: 요청 중이면 `searching`, 끝나면 `idle` |
| 홈 바로가기 성심지도 | `map` (#173) | 없음 |
| 대여 완료 | `check` (#65) | 없음(`animate="none"` 아님, hover) |
| 공지 첨부 다운로드 / 로그 엑셀 | `download` (#3) | 항상 `idle`(실측 진행률 없음) |
| 관리자 '대여 승인' 메뉴 | `bell` (#26) | 대기 건수 > 0이면 `unread`, 아니면 `idle` |
| 점검 화면 | `wrench` (#91) | 없음 |
| 관리자 로그인 | `lock` (#40) | 로그인 응답 성공 직후 `unlocked`, 그 외 `locked` |
| 관리자 대시보드 | `chart` (#133) | 없음 |
| 관리자 공지 / 사용자 공지 페이지 제목 | `megaphone` (#32) | 없음 |
| 관리자 인스타 | `camera` (#99) | 없음 |
| 관리자 티저 | `sparkle` (#74) | 없음 |
| 관리자 반납 | `archive` (#7) | 없음(기본 `closed`) |
| 관리자 전체 기록 | `history` (#22) | 없음 |
| 관리자 사용자 홈 | `home` (#50) | 없음 |
| 홈 D-Day 카드 | `calendar` (#198) | 없음 |
| 단과대·학과 제목 | `graduation` (#165) | 없음 |

- [ ] **Step 1:** 모듈을 반입한다. `node "D:/projects/Trip Portal/.claude/skills/lucian-icons/scripts/lucian-icons.mjs" get box search map check download bell wrench lock chart megaphone camera sparkle archive history home calendar graduation --out ./src/vendor/lucian-icons` 실행 후 `runtime.js`의 `VERSION`이 `2.0.13`이고 LICENSE가 들어 있는지 확인한다.
- [ ] **Step 2: 실패하는 테스트를 쓴다**
  - `renders custom element tag`: `container.querySelector('lucian-box')`가 존재한다.
  - `decorative by default`: label이 없으면 `aria-hidden="true"`이다.
  - `label makes it meaningful`: `label="대여 완료"`이면 `aria-hidden`이 없고 `label` 속성이 `'대여 완료'`이다.
  - `state prop updates attribute`: `rerender`로 state를 `'idle'`에서 `'unread'`로 바꾸면 `getAttribute('state') === 'unread'`이다.
  - jsdom에서 custom element 모듈 실행이 실패하면 테스트 파일 상단에서 `vi.mock('@/vendor/lucian-icons/…')`로 등록 모듈만 막는다(래퍼 로직만 검증).
- [ ] **Step 3:** Run → FAIL. 래퍼를 구현한다. `useEffect`에서 `el.setState`가 함수일 때만 호출하고, 지원하지 않는 state로 `RangeError`가 나면 무시하고 속성만 둔다. Run → PASS
- [ ] **Step 4:** 수동 확인: dev 서버에서 임시로 홈에 `<LucianIcon name="bell" state="unread" />`를 넣어 렌더링, hover 효과, StrictMode 이중 마운트 콘솔 오류 없음을 확인한다. 확인 후 임시 코드는 지운다.
- [ ] **Step 5:** 커밋한다: `[feat] Lucian Icons 반입 및 React 래퍼 추가`

### Task 4: 판단 로직 순수 함수

**Files:**
- Create: `src/lib/borrowStatus.js`, `src/lib/notice.js`, `src/lib/stock.js`, `src/lib/safeStorage.js` 및 각 `*.test.js`

**Interfaces:**
- Produces:
  - `getBorrowTone(status: string, dueDate: string, today = dayjs().tz()) => 'pending'|'ongoing'|'overdue'|'done'|'neutral'`: `신청`이면 pending, `반납완료`이면 done, `미반납`이면 dueDate(`YYYY-MM-DD`)가 유효하고 `today`의 날짜가 기한보다 **뒤**일 때만 overdue, 그 외에는 ongoing이다. 나머지는 neutral. `@/lib/dayjs`를 쓴다.
  - `getBorrowToneFromBorrowedAt(status, borrowedAt: 'YYYY-MM-DD HH:mm:ss', today?)`: 관리자 목록용(due 없음)으로, 기한 = 대여일 + 4일(백엔드 `check_status`와 같은 규칙)을 계산해 `getBorrowTone`에 위임한다.
  - `isNewNotice(dateStr: string, now = dayjs().tz(), days = 3) => boolean`: 파싱에 실패하면 false다. `now - date < days * 24h`이고 미래가 아닐 때 true다.
  - `formatNoticeDate(dateStr) => string`: 유효하면 KST 기준 `YYYY.MM.DD`, 아니면 원문을 그대로 돌려준다.
  - `getFileExt(filename) => string`: 대문자 확장자 최대 4자를 돌려주고, 없으면 `'FILE'`이다.
  - `getDirtyItemNames(original: Item[], current: Item[]) => Set<string>`: `물품` 이름을 키로 `재고현황`(숫자 비교)이나 `카테고리`가 다른 이름의 집합이다.
  - `readBool(key, fallback) => boolean`, `writeBool(key, value) => void`: `localStorage` 예외를 삼킨다.
- [ ] **Step 1: 실패하는 테스트를 쓴다** (today는 `dayjs.tz('2026-10-21 12:00', 'Asia/Seoul')`로 고정)
  - `getBorrowTone('신청','2026-10-25')` → `'pending'`; `('반납완료','2026-10-01')` → `'done'`
  - `('미반납','2026-10-21')` → `'ongoing'` (기한 당일); `('미반납','2026-10-20')` → `'overdue'`; `('미반납','-')` → `'ongoing'`; `('미반납','')` → `'ongoing'`; `('대여중','2026-10-20')` → `'neutral'`
  - `getBorrowToneFromBorrowedAt('미반납','2026-10-11 09:00:00')` → `'overdue'`, `('미반납','2026-10-19 09:00:00')` → `'ongoing'`
  - `isNewNotice('2026-10-20T10:00:00+09:00')` → true; `('2026-10-17T11:00:00+09:00')` → false; `('2026-10-20T10:00:00')` → true; `('garbage')` → false; `('2026-10-30T00:00:00+09:00')` → false
  - `formatNoticeDate('2026-10-20T23:30:00+09:00')` → `'2026.10.20'`; `('garbage')` → `'garbage'`
  - `getFileExt('행사안내.PDF')` → `'PDF'`; `('포스터.jpeg')` → `'JPEG'`; `('noext')` → `'FILE'`
  - `getDirtyItemNames([{물품:'우산',재고현황:5,카테고리:'생활'}],[{물품:'우산',재고현황:'5',카테고리:'생활'}])` → size 0; 수량을 4로 바꾸면 `has('우산')`
  - `readBool`: `vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error()})`일 때 fallback을 돌려준다. `writeBool`은 throw하지 않는다.
- [ ] **Step 2:** Run `npm run test -- --run src/lib` → FAIL
- [ ] **Step 3:** 구현한다.
- [ ] **Step 4:** Run → PASS
- [ ] **Step 5:** 커밋한다: `[feat] 대여 상태·공지·재고 판단 함수 추가`

### Task 5: 공통 셸 (Header, Footer, FloatingSNS, MainLayout)

**Files:**
- Modify: `src/components/Header.jsx`, `Header.css`, `Footer.jsx`, `Footer.css`, `FloatingSNS.jsx`, `FloatingSNS.css`, `src/layouts/MainLayout.jsx`
- Test: `src/components/Header.test.jsx`

**Interfaces:**
- Consumes: 토큰, lucide-react
- Produces: 모바일 패널은 `<nav className="main-nav" data-open={bool}>`이다. 기존 `isMenuOpen`/`isDropdownOpen`/외부 클릭 로직을 그대로 둔다.

- [ ] **Step 1: 실패하는 테스트를 쓴다** (`MemoryRouter`로 감싼다)
  - `keeps all menu links`: 링크 텍스트 `공지사항, 대여 신청, 신청/대여 확인, 성심지도, 조직도, 단과대 및 학과, 2025 새길`이 모두 존재하고, `2025 새길`의 href는 `https://2025saegil.cukeng.kr`, `target="_blank"`이다.
  - `hamburger toggles panel`: `getByRole('button', { name: '메뉴 열기' })`를 클릭하면 nav의 `data-open="true"`, `aria-expanded="true"`가 된다.
  - `selecting a link closes panel`: 열린 상태에서 '조직도'를 클릭하면 `data-open="false"`가 된다.
- [ ] **Step 2:** Run → FAIL (aria 이름, data-open 없음)
- [ ] **Step 3:** 구현한다.
  - 햄버거 문자 `☰`는 lucide `Menu`/`X`로 바꾸고 `aria-label`을 `메뉴 열기`/`메뉴 닫기`로 둔다.
  - 메뉴마다 lucide 아이콘을 붙인다: `Megaphone, Package, Map, Network, GraduationCap, ExternalLink`.
  - 드롭다운의 `▼`는 lucide `ChevronDown`으로 바꾼다.
  - 모바일 패널은 오른쪽 슬라이드(폭 `min(84vw, 320px)`, 배경을 어둡게 덮는 오버레이)로 만들고, `≥1024px`에서는 기존 가로 메뉴와 드롭다운으로 보여준다.
  - `MainLayout`의 `marginTop: '70px'`를 `var(--header-h)`로 바꾼다.
  - Footer와 FloatingSNS는 토큰 기반으로 간격, 타이포, 버튼 모양만 다듬는다(마크업 구조와 링크는 그대로).
- [ ] **Step 4:** Run → PASS. 360px와 1280px에서 헤더를 수동으로 확인한다(드롭다운 열기, 바깥 클릭 시 닫힘).
- [ ] **Step 5:** 커밋한다: `[style] 헤더·푸터·플로팅 SNS 리디자인`

> **체크포인트 A**: Stage A 결과(로컬 실행 방법, 셸 화면)를 사용자에게 보여주고 확인을 받는다.

---

## Stage B: 사용자 페이지 재구성

### Task 6: 홈과 점검 화면

**Files:**
- Modify: `src/pages/HomePage.jsx`, `src/pages/HomePage.css`
- Test: `src/pages/HomePage.test.jsx`

**Interfaces:**
- Consumes: `Card, Badge, Button`, `LucianIcon`(box, search, map, calendar, wrench), `isNewNotice`
- 데이터와 effect(`/api/notices`, `/api/instagram/posts`, `/api/schedule`, `/api/gallery`, `isServerDown` 판정, `dDayInfo`, `getFullImgUrl`, 슬라이더 `handlePrev/handleNext`)는 **그대로** 옮긴다.

- [ ] **Step 1: 실패하는 테스트를 쓴다** (`vi.mock('axios')`로 notices에 2건(하나는 `fixed: true`, 하나는 오늘 날짜)을 넣고, 나머지 API는 빈 배열로 응답한다. `DomeGallery`도 `vi.mock`으로 빈 div 처리)
  - `hero quick actions`: `getByRole('link', { name: /대여 신청/ })`의 href는 `/borrow`, `/대여 확인/`은 `/check`, `/성심지도/`는 `/campusmap`이다.
  - `school links kept`: 5개 외부 링크 텍스트와 href가 기존 값과 같다(`https://www.catholic.ac.kr`, `…calendar2024_list.do`, `https://uportal.catholic.ac.kr`, `https://e-cyber.catholic.ac.kr`, `…absence_notification.do`).
  - `notice badges`: 고정 공지에 `고정` 배지, 오늘 공지에 `NEW` 배지가 보인다.
  - `maintenance view`: `/api/notices` 요청이 `response` 없는 에러로 reject되면(기존 판정 `!err.response || status >= 500` 그대로) `여정은 지금 점검 중!` 문구와 학교 링크 5개가 보이고 히어로는 없다.
- [ ] **Step 2:** Run → FAIL
- [ ] **Step 3:** 스펙 4.2의 배치대로 JSX와 CSS를 재작성한다.
  - 마크업 순서: hero(DomeGallery, overlay, catch-phrase, `.hero-actions`) → `.school-links`(가로 스크롤 칩) → `.home-grid`(공지 Card | aside(D-Day Card, 인스타 슬라이더))
  - `≥1024px`에서 `.home-grid { grid-template-columns: 1.6fr 1fr }`
  - 슬라이더 `&lt;`/`&gt;`는 lucide `ChevronLeft/Right`(aria-label `이전 게시물`/`다음 게시물`)로 바꾸고, 기존 `onClick` 핸들러를 그대로 연결한다.
  - 점검 화면의 `🛠️`은 `wrench`로 바꾼다.
- [ ] **Step 4:** Run → PASS. 로컬 백엔드로 360, 768, 1280px에서 DomeGallery 드래그, 슬라이더, 링크 이동, 가로 스크롤 없음(Review Focus 2)을 수동으로 확인한다.
- [ ] **Step 5:** 커밋한다: `[style] 홈 화면 바로가기 우선 레이아웃으로 재구성`

### Task 7: 대여 신청 단계별 마법사

**Files:**
- Modify: `src/pages/client/borrow/BorrowPage.jsx`, `BorrowPage.css`
- Create: `src/pages/client/borrow/StepIndicator.jsx`, `BorrowItemStep.jsx`, `BorrowFormStep.jsx`
- Test: `src/pages/client/borrow/BorrowPage.test.jsx`

**Interfaces:**
- `BorrowPage`가 기존 상태 전부(`items, loading, selectedCategory, searchTerm, cart, formData, departments`)와 `toggleItem, handleInputChange, handleSubmit`을 그대로 소유한다. 여기에 `step: 1|2`, `submitting: bool`을 추가한다.
- `StepIndicator({ current: 1|2|3 })`: 라벨 `물품`, `정보`, `완료`
- `BorrowItemStep({ categories, selectedCategory, onCategory, searchTerm, onSearch, items, cart, onToggle, onNext })`
- `BorrowFormStep({ cart, departments, formData, onChange, onBack, onEditItems, onSubmit, submitting })`. 입력칸의 `name` 속성(`name, student_id, department, phone`), `required`, `type`, `min="200000000" max="209909099"`, placeholder는 기존 그대로 두고 학번에 `inputMode="numeric"`만 추가한다.
- 단계 전환
  - `goToForm()`: `setStep(2)`, `window.history.pushState({ borrowStep: 2 }, '')`, `scrollTo(0,0)`
  - `popstate` listener: `setStep(1)`
  - `onBack`/`onEditItems`: `window.history.back()`
  - 언마운트 시 listener를 해제한다.
- `handleSubmit`: 맨 앞에 `if (submitting) return;`, 요청 전 `setSubmitting(true)`, `finally`에서 `setSubmitting(false)`. 그 밖의 코드(빈 장바구니 alert, payload, 날짜 계산, navigate state, alert 문구)는 그대로다.

- [ ] **Step 1: 실패하는 테스트를 쓴다** (axios mock: items 3개(하나는 `재고현황: 0`), departments 2개, `post` 응답은 테스트마다 제어 가능한 Promise. `MemoryRouter`에 `/success` 라우트를 둔다)
  - `step1 next disabled until selection`: `getByRole('button', { name: /다음/ })`이 disabled이고, 물품 하나를 클릭하면 enabled가 되며 `1개 선택됨`이 보인다.
  - `sold out item not selectable`: 품절 항목을 클릭해도 `0개 선택됨`이고 `aria-disabled="true"`이다.
  - `search and category filter`: 검색어 입력 시 일치하는 항목만 보이고, 결과가 없으면 `검색 결과가 없습니다.`가 보인다.
  - `next shows form and keeps cart`: 다음 클릭 시 `이름` 라벨 입력칸이 보이고 선택한 물품 태그가 보인다. `history.pushState`가 `{ borrowStep: 2 }`로 호출된다(spy).
  - `popstate returns to step1 with cart`: `window.dispatchEvent(new PopStateEvent('popstate'))` 후 물품 목록이 다시 보이고 `1개 선택됨`이 유지된다.
  - `submit posts same payload once`: 폼을 채우고 신청 버튼을 두 번 빠르게 클릭하면 `axios.post`가 **1회**만, `('/api/borrow', { name, student_id, department, phone, selected_items: ['우산'] })`로 호출된다. resolve 후 `/success`로 이동한다.
  - `button disabled while submitting`: resolve 전에는 신청 버튼이 disabled이다.
- [ ] **Step 2:** Run → FAIL
- [ ] **Step 3:** 구현한다.
  - 1단계 목록 항목은 `<button type="button" aria-pressed={selected} aria-disabled={out}>`이다(품절은 기존 `toggleItem` 가드로 무시).
  - 모바일에서는 한 줄 목록, `≥768px`에서는 `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))`이다.
  - 하단 `BottomBar`: 1단계 `N개 선택됨 · 다음 →`, 2단계 `← 이전 | 대여 신청하기`(submit)
  - 본문에 `padding-bottom: calc(var(--space-16) + env(safe-area-inset-bottom))`을 둔다.
  - 로딩은 `Spinner`로 표시한다.
  - 검색 아이콘은 기존 lucide `Search`를 쓰고, 입력칸의 인라인 style을 CSS로 옮긴다.
- [ ] **Step 4:** Run → PASS. 로컬 백엔드에서 실제 신청 1건이 `/success`까지 가는지, 뒤로 가기 동작, 360px에서 긴 이름 줄바꿈(Review Focus 1·2)을 수동으로 확인한다.
- [ ] **Step 5:** 커밋한다: `[feat] 대여 신청 단계별 마법사로 재구성`

### Task 8: 신청 확인과 완료 화면

**Files:**
- Modify: `src/pages/client/borrow/CheckPage.jsx`, `CheckPage.css`, `SuccessPage.jsx`, `SuccessPage.css`
- Test: `src/pages/client/borrow/CheckPage.test.jsx`, `SuccessPage.test.jsx`

**Interfaces:**
- Consumes: `getBorrowTone`, `Badge`, `Card`, `Field`, `EmptyState`, `Button`, `LucianIcon`(search, check)
- CheckPage: 기존 `getStatusClass`는 삭제하고 `getBorrowTone(row.status, row.due_date)`로 대체한다. 요청 중 플래그 `searching`을 추가해 `LucianIcon name="search" state={searching ? 'searching' : 'idle'}`에 연결한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**
  - Check `renders records as cards with tones`: post 응답 `{status:'success', user_info:{name:'김철수', student_id:'2023'}, data:[{items:'우산',date:'2026-10-21 10:00:00',status:'신청',due_date:'2026-10-25'},{items:'계산기',date:'2026-10-10 10:00:00',status:'미반납',due_date:'2026-10-14'}]}` → `김철수님의 기록`이 보이고, `신청` 배지 class에 `badge--pending`, `미반납` 배지 class에 `badge--overdue`가 붙는다(today를 `vi.setSystemTime('2026-10-21T03:00:00Z')`로 고정).
  - Check `fail message`: `{status:'fail', message:'기록이 없습니다.'}` → 해당 문구가 보인다.
  - Check `posts same body`: `axios.post`가 `('/api/check', { name, student_id })`로 호출된다.
  - Success `redirects without state`: state 없이 `/success`로 들어가면 `/`로 이동한다.
  - Success `shows info and check link`: state `{items:['우산'], date:'2026-10-21', returnDate:'2026-10-25'}` → `대여 신청이 완료되었습니다!`, `공대방(N502)`, `2026-10-25`, `우산`이 보이고, `getByRole('link', {name:'신청 확인하기'})`의 href는 `/check`, `메인으로 돌아가기`의 href는 `/`이다.
- [ ] **Step 2:** Run → FAIL
- [ ] **Step 3:** 스펙 4.4·4.5대로 구현한다(완료 화면의 안내 문구는 기존 텍스트 그대로, `✔️`는 `<LucianIcon name="check" size={56} label="신청 완료" />`).
- [ ] **Step 4:** Run → PASS. 로컬에서 시드의 연체 학생을 조회해 빨강 배지가 나오는지 확인한다.
- [ ] **Step 5:** 커밋한다: `[style] 대여 확인·완료 화면 리디자인`

### Task 9: 공지 목록과 상세

**Files:**
- Modify: `src/pages/client/notice/NoticePage.jsx`, `NoticePage.css`, `NoticeDetailPage.jsx`, `NoticeDetailPage.css`
- Test: `src/pages/client/notice/NoticePage.test.jsx`, `NoticeDetailPage.test.jsx`

**Interfaces:**
- Consumes: `isNewNotice`, `formatNoticeDate`, `getFileExt`, `ResponsiveTable`(breakpoint `md`), `Badge`, `PageHeader`, `EmptyState`, `Spinner`, `LucianIcon`(megaphone, download), lucide(`Eye, Calendar, User, Paperclip, ChevronDown, Search`)
- 검색과 페이지네이션 상태 로직(`itemsPerPage = 10`, `handleSearch`, `handleKeyDown`), 상세의 `processedId` ref, `increment: 'true'`, `renderContent`, `isImageFile`, `BASE_URL`, 다운로드 URL은 그대로 둔다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**
  - List `paginates 10 per page`: 공지 12건 → 1페이지에 제목 10개, `2` 버튼 클릭 시 2개
  - List `search by title resets to page 1`: 2페이지에서 검색하면 1페이지가 활성되고 일치하는 것만 보인다. 결과가 없으면 `검색 결과가 없습니다.`
  - List `badges and attachment count`: `fixed: true` 항목에 `고정`, 최근 항목에 `NEW`, `files` 2개 항목에 `2`가 붙은 첨부 표시(`aria-label="첨부파일 2개"`)
  - Detail `increments views once`: `axios.get`이 `('/api/notices/7', { params: { increment: 'true' } })`로 1회 호출된다.
  - Detail `attachments collapsed by default`: 파일 2개 → `getByRole('button', { name: /첨부파일 2개/ })`의 `aria-expanded="false"`이고 파일 링크는 없다. 클릭하면 `aria-expanded="true"`가 되고 링크 2개의 href가 `/api/notices/download/7/{filename}`, 확장자 배지 `PDF`가 보인다.
  - Detail `no files text`: files가 `[]`이면 `첨부파일 없음`
  - Detail `auto links urls`: 본문 `참고 https://a.b/c`의 링크 href가 `https://a.b/c`이다.
- [ ] **Step 2:** Run → FAIL
- [ ] **Step 3:** 스펙 4.6·4.7대로 구현한다.
  - 목록은 `ResponsiveTable`의 columns `date(formatNoticeDate) / title(primary, 배지+링크+첨부) / author / views`
  - 페이지 버튼 `&lt;`/`&gt;`는 lucide chevron(aria-label `이전 페이지`/`다음 페이지`)
  - 상세 본문은 `max-width: 720px; line-height: 1.7`
  - `renderContent`의 인라인 링크 style은 CSS class로 옮긴다.
- [ ] **Step 4:** Run → PASS. 로컬에서 긴 제목과 파일명 줄바꿈, 이미지 격자를 수동으로 확인한다.
- [ ] **Step 5:** 커밋한다: `[style] 공지 목록·상세 리디자인`

> **체크포인트 B**: 사용자 페이지 4종을 360/1280px 스크린샷으로 사용자에게 보여주고 확인을 받는다.

---

## Stage C: 관리자

### Task 10: AdminLayout, 메뉴, 대기 건수 context, 라우팅

**Files:**
- Create: `src/layouts/adminNav.js`, `src/layouts/AdminContext.jsx`, `src/layouts/AdminLayout.jsx`, `src/layouts/AdminLayout.css`
- Modify: `src/App.jsx`(관리자 라우트를 MainLayout 밖으로 이동)
- Test: `src/layouts/AdminLayout.test.jsx`, `src/layouts/adminNav.test.js`

**Interfaces:**
- `adminNav.js`: `export const ADMIN_NAV = [{ group: null|'콘텐츠'|'대여 사업', items: [{ to, label, icon: <lucian id>, masterOnly?: bool, badge?: 'pending' }] }]`, `export function getAdminNav(role) => 같은 구조(필터링됨)`
  - 순서: 대시보드 `/admin/dashboard`(chart) | 콘텐츠: 공지사항 `/admin/notices`(megaphone), 인스타 관리 `/admin/instagram`(camera, masterOnly), 티저 이벤트 `/admin/teaser`(sparkle, masterOnly) | 대여 사업: 대여 승인 `/admin/borrow/approve`(bell, badge 'pending'), 반납 관리 `/admin/borrow/return`(archive), 재고 관리 `/admin/borrow/stock`(box), 전체 기록 `/admin/borrow/log`(history)
  - 그룹의 items가 비면 그룹을 뺀다.
- `AdminContext.jsx`: `AdminProvider`, `useAdmin() => { pendingCount: number, refreshPendingCount: () => Promise<void> }`. refresh는 `axios.get('/api/admin/requests')`를 호출해 `status === 'success'`일 때 `data.length`를 저장하고, 실패하면 이전 값을 유지한다(조용히 실패).
- `AdminLayout.jsx`: `AdminProvider`로 감싸고 `<Outlet />`을 렌더링한다. 마운트 시 `refreshPendingCount()` 1회 호출한다.
  - 접힘 상태는 `readBool('adminSidebarCollapsed', false)`로 읽고 `writeBool`로 저장한다.
  - 서랍 메뉴(`<1024px`)는 `drawerOpen` 상태로 관리하고, 경로가 바뀌거나 Esc를 누르면 닫힌다.
  - 하단에는 `사용자 홈`(`/`, home)과 `로그아웃` 버튼을 둔다. 로그아웃은 기존 `AdminHeader.handleLogout` 본문을 그대로 옮긴다.
  - 현재 페이지 제목은 `ADMIN_NAV`에서 `location.pathname` 접두로 찾고, 없으면 `관리자`로 표시한다.
- `App.jsx`: `<Route path="/admin" element={<AdminLoginPage />} />`와 `<Route element={<ProtectedRoute />}><Route element={<AdminLayout />}>{기존 10개 관리자 Route 그대로}</Route></Route>`를 `MainLayout` Route 밖, `*` Route 앞에 둔다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**
  - `getAdminNav('sub') hides master items`: 레이블 목록에 `인스타 관리`, `티저 이벤트`가 없다. `getAdminNav('master')`에는 있다. `getAdminNav(null)`은 `sub`와 같다.
  - Layout `shows pending badge`: requests 응답 data 3개 → `대여 승인` 링크 안에 `3`이 있고, bell의 `state="unread"`이다. 0개면 배지가 없고 `state="idle"`이다.
  - Layout `collapse persists`: `getByRole('button', { name: '사이드바 접기' })` 클릭 → `localStorage.getItem('adminSidebarCollapsed') === 'true'`, 버튼 이름이 `사이드바 펼치기`가 된다. 다시 마운트해도 접힌 상태다.
  - Layout `storage throws`: `getItem`이 throw해도 렌더링되고 펼친 상태다(Review Focus 3).
  - Layout `drawer closes on Esc and navigation`: `메뉴 열기` 클릭 → `data-drawer="open"`, Esc 키 → `closed`. 다시 열고 `반납 관리` 클릭 → `closed`
  - Layout `logout keeps original flow`: `window.confirm`이 true를 돌려주면 `axios.post('/api/admin/logout')`를 호출하고, `localStorage`의 `isAdmin`, `adminRole`을 제거하고, `alert('로그아웃 되었습니다.')`를 띄운 뒤 `/`로 이동한다.
  - App routing `admin route has no user header`: `/admin/dashboard`를 렌더링했을 때(ProtectedRoute와 페이지는 mock) 사용자 헤더 로고 `여정 로고` img가 없다.
- [ ] **Step 2:** Run → FAIL
- [ ] **Step 3:** 구현한다.
  - 사이드바 폭: 펼침 `240px`, 접힘 `72px`. 접힌 상태에서는 라벨을 `title` 속성과 `aria-label`로 둔다(툴팁).
  - `≥1024px`에서는 `position: sticky` 사이드바, `<1024px`에서는 상단바(햄버거, 제목)와 왼쪽 서랍(오버레이) 구조다.
- [ ] **Step 4:** Run → PASS. 이 시점에는 각 관리자 페이지가 아직 `<AdminHeader />`를 렌더링하므로 헤더가 중복된다. 다음 Task까지 허용한다.
- [ ] **Step 5:** 커밋한다: `[feat] 관리자 사이드바 레이아웃 추가`

### Task 11: 관리자 로그인과 대시보드

**Files:**
- Modify: `src/pages/admin/AdminLoginPage.jsx`, `AdminLoginPage.css`, `AdminDashboardPage.jsx`, `src/pages/admin/AdminCommon.css`(공통 관리자 스타일을 토큰 기반으로 정리)
- Test: `src/pages/admin/AdminDashboardPage.test.jsx`, `AdminLoginPage.test.jsx`

**Interfaces:**
- Consumes: `useAdmin`, `ResponsiveTable`(breakpoint `lg`), `Toggle`, `Card`, `Badge`, `getBorrowToneFromBorrowedAt`, `LucianIcon`(lock)
- 대시보드: 기존 effect(로그인 체크 alert, `/dashboard`, `/api/system/snowfall`)와 `toggleSnowfall`을 그대로 두고, `axios.get('/api/admin/ongoing')`으로 대여 중 개수만 추가한다. 승인 대기는 `useAdmin().pendingCount`를 쓴다. `<AdminHeader />`는 제거한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**
  - `stat cards`: today_count 12, ongoing data 8개, pendingCount 3(Provider mock) → `금일 대여 12건`, `승인 대기 3건`, `대여 중 8건`. 각 카드 링크 href는 `/admin/borrow/log`, `/admin/borrow/approve`, `/admin/borrow/return`이다.
  - `snowfall toggle master only`: adminRole `sub`이면 `role="switch"`가 없고, `master`이면 있다. 클릭 시 `axios.post('/api/admin/system/snowfall', { enabled: true })`
  - `recent logs`: recent_logs 2건의 `이름`이 보이고, 상태 배지 tone이 적용된다.
  - Login `keeps flow`: 비밀번호 입력 후 제출 → `axios.post('/api/admin/login', { password })`. 성공 응답이면 lock 아이콘 `state="unlocked"`이 되고, 기존 alert 문구가 뜬다.
- [ ] **Step 2:** Run → FAIL → 구현 → Run → PASS
- [ ] **Step 3:** 로컬 백엔드(`devmaster`/`devsub`)로 두 역할 모두 로그인해 메뉴 노출과 눈송이 토글을 수동으로 확인한다. 1280px와 375px에서 사이드바와 서랍을 확인한다.
- [ ] **Step 4:** 커밋한다: `[style] 관리자 로그인·대시보드 리디자인`

### Task 12: 승인, 반납, 전체 기록, 티저 헤더 제거

**Files:**
- Modify: `src/pages/admin/borrow/AdminApprovePage.jsx`, `AdminReturnPage.jsx`, `AdminLogPage.jsx`, `src/pages/admin/AdminTeaserPage.jsx`(`<AdminHeader />` import와 사용만 삭제)
- Test: `src/pages/admin/borrow/AdminApprovePage.test.jsx`

**Interfaces:**
- Consumes: `ResponsiveTable`(lg), `Badge`, `Button`, `useAdmin().refreshPendingCount`, `getBorrowToneFromBorrowedAt`, `LucianIcon`(download)
- 승인과 반납의 담당자 입력 모달 상태(`selectedId`, `handlerName`, `isModalOpen`), 이름·학번 검색 필터(`searchTerm`, `filteredRequests`), API 호출은 그대로다. 모달은 `role="dialog" aria-modal="true"`로 만들고, Esc를 누르면 기존 닫기 핸들러를 호출한다.
- 승인과 거절이 성공하면 기존 목록 재조회에 이어 `refreshPendingCount()`를 호출한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**
  - `approve posts handler`: 목록 1건 → `승인` 클릭, 모달에 담당자 `홍길동` 입력, 확인 → `axios.post('/api/admin/approve', { id: 4, handler: '홍길동' })`, `alert('승인 처리되었습니다.')`, `refreshPendingCount` 1회
  - `reject confirm`: `window.confirm`이 false면 post를 호출하지 않는다. true면 `('/api/admin/reject', { id: 4 })`
  - `dialog esc closes`: 모달이 열린 상태에서 Esc → dialog가 사라진다.
  - `search filter kept`: 목록 2건(`김철수/2023…`, `이영희/2024…`)에 검색어 `2024` 입력 → `이영희`만 보인다.
- [ ] **Step 2:** Run → FAIL → 구현 → Run → PASS
- [ ] **Step 3:** 반납 페이지는 같은 패턴으로 변환하고 로컬에서 실제 반납 1건을 수동으로 확인한다. 로그 페이지는 `ResponsiveTable`과 `엑셀 다운로드` 버튼(download 아이콘, URL 그대로)으로 바꾼다. **클릭하지 않는다.**
- [ ] **Step 4:** 커밋한다: `[style] 대여 승인·반납·기록 관리 화면 리디자인`

### Task 13: 재고 관리

**Files:**
- Modify: `src/pages/admin/borrow/AdminStockPage.jsx`
- Test: `src/pages/admin/borrow/AdminStockPage.test.jsx`

**Interfaces:**
- Consumes: `getDirtyItemNames`, `ResponsiveTable`(lg), `Button`, `Field`, `Badge`
- `original` 상태를 추가한다. 로드 직후와 전체 저장 성공 직후에 `items`의 깊은 복사본을 저장한다. 행은 `dirty`이면 `data-dirty="true"`와 `수정됨` Badge(neutral)를 붙인다. 상단에 `저장하지 않은 변경 N개`를 표시한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**
  - `marks edited rows`: 수량 입력을 5에서 4로 바꾸면 그 행에 `수정됨`이 붙고 `저장하지 않은 변경 1개`가 표시된다. 5로 되돌리면 사라진다.
  - `save clears dirty`: 전체 저장 → `axios.post('/api/admin/stock/update', { items })` resolve 후 표시가 없어진다.
  - `delete confirm text`: confirm 문구가 `'우산'을(를) 정말 삭제하시겠습니까?`이다.
- [ ] **Step 2:** Run → FAIL → 구현 → Run → PASS
- [ ] **Step 3:** 커밋한다: `[style] 재고 관리 화면 리디자인 및 미저장 표시`

### Task 14: 공지 관리, 공지 작성, 인스타 관리

**Files:**
- Modify: `src/pages/admin/AdminNoticeListPage.jsx`, `AdminNoticeWritePage.jsx`, `AdminInstagramPage.jsx`
- Delete: `src/components/AdminHeader.jsx` (`grep -r AdminHeader src`로 사용처 0 확인 후)
- Test: `src/pages/admin/AdminNoticeWritePage.test.jsx`

**Interfaces:**
- Consumes: `ResponsiveTable`, `Badge`, `Toggle`, `Field`, `Button`, `Card`, lucide(`Pencil, Trash2, Plus, Upload`)
- 작성 페이지
  - `is_public` 라디오 두 개를 `.segmented` 스타일로 감싼다(input 유지).
  - `fixed`는 `Toggle id="fixed" name="fixed" checked={formData.fixed} onChange={handleChange}`이다.
  - 드롭존 `<div className="dropzone" onDragOver onDrop>`을 둔다. drop하면 `handleFileChange({ target: { files: e.dataTransfer.files } })`를 호출한다. 기존 hidden input의 클릭 경로도 유지한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**
  - `drop adds files like input`: `fireEvent.drop(dropzone, { dataTransfer: { files: [new File(['a'],'a.pdf')] } })` 후 `a.pdf`가 첨부 목록에 보인다.
  - `fixed toggle maps to formData`: 토글 클릭 후 제출 → FormData의 `fixed`가 `'true'`이다(`axios.post` 인자의 FormData에서 `get('fixed')`).
  - `validation alert kept`: 제목이 비어 있으면 `alert('제목과 내용은 필수입니다.')`
- [ ] **Step 2:** Run → FAIL → 구현 → Run → PASS
- [ ] **Step 3:** 공지 목록(고정·공개 Badge, 아이콘 버튼, `새 공지` 버튼)과 인스타(등록 Card, 게시물 격자)를 변환한다. 로컬에서 공지 등록·수정·파일 삭제, 인스타 등록·삭제를 수동으로 확인한다.
- [ ] **Step 4:** `AdminHeader.jsx`를 삭제하고 test, lint, build를 통과시킨 뒤 커밋한다: `[style] 공지·인스타 관리 화면 리디자인`

> **체크포인트 C**: 관리자 화면 전체(데스크톱과 모바일)를 사용자에게 보여주고 확인을 받는다.

---

## Stage D: 마무리

### Task 15: 스타일만 다듬는 페이지와 공룡 게임

**Files:**
- Modify: `src/pages/client/MapPage.{jsx,css}`, `src/components/CampusMap.jsx`, `FacilityModal.{jsx,css}`, `src/pages/client/OrganPage.{jsx,css}`, `DepartmentPage.{jsx,css}`, `src/pages/client/terms/*.jsx`, `src/components/z_dino(easter)/DinoGame.{jsx,css}`, `DomeGallery.css`(색 토큰만)

**Interfaces:**
- Consumes: 토큰, `PageHeader`, `Card`, `Button`, lucide, `LucianIcon`(graduation)
- **변경 금지**: `CampusMapData.js`, 지도 좌표·클릭 영역, 학과 데이터 배열, DinoGame의 게임 루프·충돌·점수 로직

- [ ] **Step 1:** 페이지마다 하드코딩된 색, 둥글기, 그림자를 토큰으로 바꾸고, 제목은 `PageHeader`로 바꾼다. 모바일 간격을 정리한다. FacilityModal과 DinoGame의 닫기 버튼은 lucide `X`(aria-label `닫기`)로 바꾸고 Esc 닫기를 유지하거나 추가한다.
- [ ] **Step 2:** 기존 테스트가 통과하는지 확인한다. 수동 확인: 지도 건물 클릭 → 모달 열기·닫기, 학과 목록, 약관 4종, 크레딧, 코나미 커맨드 → 게임 열기·닫기, 360px 푸터 5회 터치 → 게임
- [ ] **Step 3:** 커밋한다: `[style] 지도·조직도·학과·약관·공룡게임 스타일 정리`

### Task 16: 전체 회귀 점검

**Files:** 없음(발견한 문제는 해당 파일 수정)

- [ ] **Step 1:** `npm run test -- --run`, `npm run lint`, `npm run build` 모두 PASS
- [ ] **Step 2:** `grep -rnE "📦|🔍|🛠️|✔️|📄|💾|❄️|👋" src --include=*.jsx | grep -v -i teaser` → 결과 0건
- [ ] **Step 3:** `git diff main --stat -- src/pages/client/TeaserPage.jsx src/pages/client/TeaserPage.css` → 변경 0건. `/teaser` 화면을 육안으로 확인한다.
- [ ] **Step 4:** `git diff main -- src | grep -E "^\-.*(alert|confirm)\(" ` 출력에 나온 각 문구가 `^\+` 쪽에 같은 문자열로 존재하는지 대조한다(문구 보존).
- [ ] **Step 5:** 로컬 백엔드에서 모든 라우트(스펙 4·5절)를 360/768/1280px로 순회하며 가로 스크롤 없음(`document.documentElement.scrollWidth <= innerWidth`), Tab 포커스 링, OS 동작 줄이기 설정을 켰을 때 Lucian 애니메이션 정지를 확인한다.
- [ ] **Step 6:** 발견한 문제를 고치고 커밋한다: `[fix] 리디자인 회귀 점검 수정`
- [ ] **Step 7:** 사용자에게 결과를 보고하고, 메모리 [[deferred-data-consolidation]]에 따라 데이터 정리 작업을 시작할지 물어본다.

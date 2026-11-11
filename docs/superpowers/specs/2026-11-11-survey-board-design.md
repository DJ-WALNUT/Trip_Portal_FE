# 설문조사 게시판 설계

- 작성일: 2026-11-11
- 상태: 설계 합의 완료, 스펙 리뷰 대기
- 저장소: 프론트 `Trip_Portal_FE` (브랜치 `feature/survey-board`), 백엔드 `Trip_Portal_BE` (구현 시 같은 이름의 브랜치)
- 참고: 공지사항 흐름(`routes/notice_routes.py`, `pages/client/notice/*`, `pages/admin/AdminNotice*`)의 화면 구성과 권한을 따른다. 공지사항 코드는 수정하지 않는다.

## 1. 목표와 성공 기준

**목표**: "심심하세요? 설문조사 하실래요?" 컨셉으로, 학생회가 설문조사 링크와 안내 글을 모아 두는 게시판을 만든다. 학생은 목록이나 상세 글에서 버튼 한 번으로 설문 페이지로 넘어간다.

**성공 기준**
1. 관리자가 `/admin/surveys`에서 설문 글을 등록·수정하고, master가 삭제할 수 있다.
2. 사용자가 헤더의 `설문조사` 탭으로 `/surveys` 목록에 들어가고, 목록의 각 행과 상세 글 제목 아래의 **설문조사 하러가기** 버튼으로 설문 링크를 새 탭에서 연다.
3. 마감일이 지난 설문은 관리자 조작 없이 "마감"으로 표시되고, 버튼이 비활성화되며, 목록 아래쪽으로 내려간다.
4. 홈에는 진행중인 설문이 있을 때만 작은 카드가 보이고, 공지사항 카드보다 눈에 덜 띈다.
5. 비로그인 사용자는 등록·수정·삭제를 할 수 없고(401), 비공개 글을 볼 수 없다(목록 제외, 상세 404).
6. 백엔드 pytest, 프론트 Vitest, lint, build를 통과한다.

## 2. 범위

### 2.1 포함
- 백엔드: `surveys` 테이블, `/api/surveys` API
- 사용자 화면: 헤더 탭, 목록, 상세, 홈 카드
- 관리자 화면: 사이드바 항목, 목록, 작성/수정

### 2.2 제외
- 첨부파일, 상단 고정
- 목록 검색
- 설문 자체를 사이트 안에서 만들거나 응답을 수집하는 기능(외부 설문 링크만 다룬다)
- 학생이 직접 설문을 등록하는 기능
- 공지사항 API의 비공개 글 상세 노출 문제(현재 주소를 알면 열림). 별도 작업으로 남긴다.

## 3. 백엔드

### 3.1 모델 `Survey` (`models.py`, 테이블 `surveys`)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | Integer, PK | |
| `title` | String(200), 필수 | 제목 |
| `content` | Text, 필수 | 내용 |
| `link_url` | String(500), 필수 | 설문 링크 |
| `deadline` | Date, 선택 | 마감일. 비어 있으면 상시 |
| `duration` | String(30), 선택 | 예상 소요시간 (예: "3분") |
| `reward` | String(50), 선택 | 보상 (예: "추첨 기프티콘") |
| `author` | String(50), 기본 "여정 학생회" | |
| `views` | Integer, 기본 0 | |
| `is_public` | Boolean, 기본 True | |
| `created_at` | DateTime, 기본 현재 KST | |

새 테이블이므로 서버 시작 시 `db.create_all()`이 만든다. 기존 테이블은 바뀌지 않는다.

`to_dict()` 응답:

```json
{
  "id": 1,
  "title": "...",
  "content": "...",
  "link_url": "https://...",
  "deadline": "2026-11-20",
  "duration": "3분",
  "reward": "추첨 기프티콘",
  "author": "여정 학생회",
  "views": 12,
  "is_public": true,
  "date": "2026-11-11",
  "is_closed": false
}
```

- `deadline`, `duration`, `reward`는 값이 없으면 `null`.
- `is_closed`는 서버가 계산한다. `deadline`이 있고 KST 기준 오늘 날짜가 `deadline`보다 뒤면 `true`. 마감일 당일은 진행중이다.

### 3.2 API (`routes/survey_routes.py`, 블루프린트 `/api/surveys`, `app.py`에 등록)

요청 본문은 JSON이다(첨부파일이 없으므로 multipart를 쓰지 않는다).

| 메서드·경로 | 권한 | 동작 |
|---|---|---|
| `GET /api/surveys` | 없음 | 공개 글 목록. 관리자 세션이고 `?include_private=true`면 비공개 포함 |
| `GET /api/surveys/<id>` | 없음 | 상세. `?increment=true`일 때만 조회수 +1. 비공개 글은 관리자 세션이 아니면 404 |
| `POST /api/surveys` | `login_required` | 등록. 201 |
| `PUT /api/surveys/<id>` | `login_required` | 수정 |
| `DELETE /api/surveys/<id>` | `master_required` + `login_required` | 삭제 |

- `GET` 두 개에는 공지와 같은 `30 per minute` 제한을 건다.
- **정렬**(목록): 진행중 먼저, 그다음 마감. 진행중 안에서는 마감일이 가까운 순, 상시(마감일 없음)는 진행중의 맨 뒤, 같은 조건이면 최신 작성순. 마감 안에서는 최근에 마감된 순.
- **검증**(등록·수정 공통, 실패 시 400과 `{"error": "..."}`):
  - `title`, `content`, `link_url`은 앞뒤 공백 제거 후 비어 있으면 안 된다.
  - `link_url`은 `http://` 또는 `https://`로 시작해야 한다. 사용자 화면의 버튼 `href`에 그대로 들어가므로 `javascript:` 등 다른 스킴을 막는다.
  - `deadline`은 빈 값(상시) 또는 `YYYY-MM-DD` 형식.
  - `title` 200자, `link_url` 500자, `duration` 30자, `reward` 50자 이하.
  - `duration`, `reward`는 공백만 있으면 `null`로 저장한다.
- 이미 지난 날짜를 마감일로 저장하는 것은 허용한다(지난 설문을 기록용으로 올릴 수 있다).

## 4. 프론트엔드

### 4.1 공통 유틸 `src/lib/survey.js`

- `getSurveyBadge(survey, today)`: 배지에 쓸 `{ tone, label }`을 돌려준다.
  - `is_closed`면 "마감"
  - 마감일이 없으면 "상시"
  - 마감일이 오늘이면 "오늘 마감", 그 외에는 `D-n`
- 마감 여부는 서버의 `is_closed`를 그대로 쓴다. 남은 일수 계산에만 `src/lib/dayjs`(KST)를 쓴다.
- 날짜 표시는 `lib/notice.js`의 `formatNoticeDate`를 재사용한다.

### 4.2 라우트 (`App.jsx`)

| 경로 | 컴포넌트 | 레이아웃 |
|---|---|---|
| `/surveys` | `pages/client/survey/SurveyPage` | MainLayout |
| `/surveys/:id` | `pages/client/survey/SurveyDetailPage` | MainLayout |
| `/admin/surveys` | `pages/admin/AdminSurveyListPage` | AdminLayout (ProtectedRoute) |
| `/admin/surveys/write` | `pages/admin/AdminSurveyWritePage` | 〃 |
| `/admin/surveys/edit/:id` | `pages/admin/AdminSurveyWritePage` | 〃 |

### 4.3 헤더 (`components/Header.jsx`)

`공지사항` 바로 뒤에 `설문조사` 항목을 추가한다(lucide `ClipboardList` 아이콘). 메뉴가 7개가 되므로 데스크탑 폭에서 줄바꿈이나 넘침이 생기면 항목 간격을 줄여 한 줄을 유지한다.

### 4.4 목록 `/surveys`

- `PageHeader` 제목 "설문조사", 그 아래 안내 문구 "심심하세요? 설문조사 하실래요?".
- `ResponsiveTable`(breakpoint `md`)로 표시한다. 열:
  - 제목(primary): 상세로 가는 링크. 제목 옆에 소요시간·보상 칩(값이 있을 때만).
  - 상태: 4.1의 배지.
  - 작성일.
  - 참여: **설문조사 하러가기** 버튼. `<a href={link_url} target="_blank" rel="noopener noreferrer">`. 마감된 글은 버튼 대신 비활성 "마감" 표시.
- 마감된 행은 흐리게 표시한다.
- 10개 단위 페이지네이션(공지 목록과 같은 모양).
- 글이 없으면 `EmptyState` "진행 중인 설문조사가 없습니다.".
- 불러오기 실패 시 `EmptyState` "설문조사를 불러오지 못했습니다.".

### 4.5 상세 `/surveys/:id`

위에서부터:
1. 제목
2. 메타: 작성자, 작성일, 조회수, 마감일("~ 2026.11.20" 또는 "상시") + 상태 배지
3. 소요시간·보상 칩(값이 있을 때만)
4. **설문조사 하러가기** 버튼(큰 기본 버튼, 새 탭). 마감이면 비활성 "마감된 설문입니다".
5. 본문. 줄바꿈 유지, 본문 안의 URL은 자동 링크(공지 상세와 같은 방식).
6. "목록으로" 버튼 → `/surveys`

조회수는 `?increment=true`로 한 번만 올린다(공지 상세의 중복 요청 방지 방식과 같다). 글이 없거나 비공개(404)면 "존재하지 않거나 삭제된 설문조사입니다." 안내와 "목록으로" 버튼을 보여준다.

### 4.6 홈 카드 (`pages/HomePage.jsx`, `HomePage.css`)

- `/api/surveys` 응답에서 `is_closed`가 아닌 글 앞 3건을 쓴다(서버 정렬상 마감 임박순).
- 진행중이 0건이거나 요청이 실패하면 카드를 렌더하지 않는다. 이 요청의 실패는 홈의 "점검 중" 판정에 영향을 주지 않는다.
- 카드 구성: 제목줄 "심심하세요? 설문조사 하실래요?" + "더보기 →"(`/surveys`), 그 아래 `제목 · 배지` 행. 제목은 상세로 간다.
- 공지 카드보다 약하게: 제목줄 글씨를 공지 카드의 `h2`보다 작게, 행 높이를 낮게, 강조색 배경을 쓰지 않는다.
- 위치:
  - 768px 미만: 공지 → D-Day → **설문** → 인스타
  - 768px 이상: 공지 → **설문** (1024px 이상에서는 왼쪽 열에 공지와 설문이 세로로 놓이고 오른쪽 열에 D-Day·인스타)
- DOM 순서는 공지 → 설문 → aside로 두고, 768px 미만에서만 CSS로 설문 카드를 D-Day 뒤에 놓는다. 읽기 순서와 화면 순서가 달라지는 구간이 있으므로 카드 안에 포커스 이동이 어색하지 않은지 구현 때 확인한다.

### 4.7 관리자

- `layouts/adminNav.js`: `콘텐츠` 그룹의 `공지사항` 아래에 `{ to: '/admin/surveys', label: '설문조사' }` 추가(master 전용 아님).
- **목록 `/admin/surveys`**: `?include_private=true`로 전체 조회. 열은 제목, 상태 배지(진행중 D-n / 상시 / 마감), 공개 여부, 작성일, 조회수, 관리(수정, 삭제). 삭제 버튼은 master에게만 보이고 확인 창을 거친다. 상단에 "새 설문 등록" 버튼.
- **작성/수정 `/admin/surveys/write`, `/edit/:id`**: 입력란
  - 제목(필수)
  - 설문 링크(필수, `http://`·`https://`로 시작하지 않으면 저장 전에 안내)
  - 마감일(date 입력, 비우면 상시)
  - 예상 소요시간(선택, 예시 "3분")
  - 보상(선택, 예시 "추첨 기프티콘")
  - 내용(필수)
  - 공개 토글(기본 켜짐)
  
  저장 성공 시 목록으로 이동한다. 서버가 400을 주면 `error` 문구를 폼에 보여준다.

### 4.8 스타일 규칙

- 색·간격은 `src/styles/tokens.css` 토큰을 쓴다.
- 새 클래스는 사용자 화면 `survey-`, 관리자 화면 `admin-survey-` 접두사를 붙인다. `src/test/cssCollisions.test.js`가 통과해야 한다.
- 공용 UI는 `@/components/ui`의 `PageHeader`, `ResponsiveTable`, `Badge`, `Button`, `Card`, `EmptyState`, `Spinner`, `Field`, `Toggle`을 쓴다. 배지에 필요한 색조가 없으면 `Badge`에 tone을 추가한다.
- 사용자 화면은 모바일 우선으로 작성한다.

## 5. 테스트

**백엔드 (pytest, `tests/test_survey_api.py`)**
- 비로그인 등록·수정·삭제는 401, sub 관리자의 삭제는 403
- 필수값 누락, `javascript:` 링크, 잘못된 날짜 형식은 400
- `is_closed`: 마감일이 어제면 true, 오늘이면 false, 없으면 false
- 목록 정렬 순서(임박 → 상시 → 마감)
- 비공개 글: 공개 목록에서 제외, 비로그인 상세 404, 관리자 `include_private` 목록에 포함
- 조회수는 `increment=true`일 때만 증가

**프론트 (Vitest + Testing Library)**
- `lib/survey.test.js`: 배지 라벨(마감, 상시, 오늘 마감, D-n)
- `SurveyPage`: 진행중 행의 버튼 `href`·`target`, 마감 행의 비활성 표시, 빈 목록
- `SurveyDetailPage`: 버튼 위치와 링크, 마감 시 비활성, 404 안내
- `HomePage`: 진행중 0건이면 카드 없음, 있으면 최대 3건
- `AdminSurveyWritePage`: 필수값·링크 형식 검증, 수정 시 기존 값 채움
- `AdminSurveyListPage`: 삭제 버튼의 master 전용 노출
- `Header`, `adminNav` 테스트에 새 항목 반영

**수동 확인**: 로컬 백엔드(`VITE_API_TARGET=http://localhost:5000`, `tools/local-backend`)로만 확인한다. 운영 API(`trip-api.cukeng.kr`)에 쓰기 요청을 보내지 않는다.

## 6. 배포 시 유의점

- 백엔드를 먼저 배포한다. 프론트가 먼저 나가면 `/api/surveys`가 404이지만, 홈 카드는 숨겨지고 목록은 오류 안내가 뜨는 정도로 그친다.
- 백엔드 재시작 시 `surveys` 테이블이 자동 생성된다. 별도 마이그레이션은 없다.

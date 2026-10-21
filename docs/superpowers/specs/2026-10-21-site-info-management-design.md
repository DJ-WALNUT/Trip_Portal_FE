# 사이트 정보 관리 기능 설계

- 작성일: 2026-10-21
- 상태: 설계 합의 완료, 스펙 리뷰 대기
- 저장소: 프론트 `Trip_Portal_FE` (브랜치 `feature/site-info`), 백엔드 `Trip_Portal_BE` (구현 시 브랜치 `feature/site-info`)
- 선행 작업: 사이트 리디자인 (`2026-10-21-site-redesign-design.md`, main 병합 완료)

## 1. 목표와 성공 기준

**목표**: 코드 곳곳에 하드코딩된 사이트 정보(학생회실 위치, 연락처, SNS, 링크, 문구, 대여 규칙)와 학사일정을 한곳에 모은다. master 관리자가 관리자 페이지에서 직접 수정하고, 코드 수정이나 재배포 없이 바로 반영되게 한다.

**성공 기준**
1. 2.1절의 모든 정보가 DB 한곳에 저장되고, 프론트의 해당 하드코딩이 제거된다(기본값 파일 제외).
2. master가 `/admin/site-info`에서 값을 바꾸고 저장하면 새로고침 없이 사이트에 반영된다.
3. sub 관리자와 비로그인 사용자는 설정과 학사일정을 수정할 수 없다(백엔드 403/401).
4. 대여 OFF와 반납 기간이 화면과 백엔드에 함께 적용된다.
5. API가 실패해도(점검 시간, 서버 다운) 사이트는 기본값으로 정상 표시된다.
6. 백엔드 pytest, 프론트 Vitest, lint, build를 통과한다.

## 2. 범위

### 2.1 포함
- A. 단순 설정값 (3.2절 키 목록)
- B1. 학사일정 추가·수정·삭제
- 눈송이 설정의 저장 위치를 `settings.json`에서 DB로 이전 (API 계약과 권한은 유지)
- `docker-compose.yml`의 라우트 볼륨을 파일 단위에서 폴더 단위로 변경

### 2.2 제외 (다음 단계)
- B2. 학과 목록 통합 (`major.xlsx`와 `DepartmentPage.jsx` 배열). 단, 학과 페이지의 공과대학 카드 인스타 ID는 이번에 설정값으로 연결한다.
- B3. 조직도, 크레딧, 홈 갤러리 업로드
- C. 약관·개인정보 처리방침 md(안의 이메일 포함), 로고, SEO 메타
- D. 개발자 설정 (API 주소, CORS, 비밀번호, 요청 제한)
- 24시간 자동 취소의 실제 구현 (이번에는 안내 문구만 설정값으로)
- 눈송이 수정 API의 권한 변경 (사용자 결정: 현재처럼 로그인한 관리자 모두 수정 가능)

## 3. 데이터 모델

### 3.1 테이블 `site_settings` (`data/database.db`, SQLAlchemy 모델 `SiteSetting`)
| 열 | 타입 | 설명 |
|---|---|---|
| `key` | String(64), PK | 설정 키 |
| `value` | Text | JSON 직렬화 값 |
| `updated_at` | DateTime | KST |
| `updated_by` | String(20) | 저장한 역할(`master`/`sub`) |

- **초기화**: 서버 시작 시 `db.create_all()` 직후 `ensure_defaults()`를 실행한다. 3.2절의 키 중 DB에 없는 것만 기본값으로 삽입하고, 기존 값은 덮어쓰지 않는다.
- **눈송이 이전**: `system.snowfall` 키가 없고 `settings.json`이 있으면 그 파일의 `snowfall` 값을 초기값으로 쓴다.

### 3.2 설정 키 목록
| 키 | 타입·검증 | 기본값 | 사용처 |
|---|---|---|---|
| `contact.address` | 한 줄 문자열 ≤200 | `14662 경기 부천시 원미구 지봉로 43 가톨릭대학교 니콜스관 N507 공과대학 학생회실` | Footer |
| `contact.room` | 한 줄 ≤200 | `공대방(N507)` | 대여 완료 화면 수령·반납 안내 |
| `contact.email` | 이메일 | `cukeng2026@gmail.com` | Footer |
| `contact.manager` | 한 줄 ≤200 | `김세호` | Footer "홈페이지 운영 책임자" |
| `sns.instagram` | `^[A-Za-z0-9._]{1,30}$`, 앞의 `@`는 제거 후 저장 | `cuk.engineering` | FloatingSNS 링크, 홈 인스타 카드 `@` 표시, 학과 페이지 공과대학 카드 |
| `sns.linktree` | URL | `https://linktr.ee/cuk_engineering` | FloatingSNS |
| `sns.kakao` | URL | `https://pf.kakao.com/_xcyDGn` | FloatingSNS |
| `links.school` | 목록 1~10개, 항목 `{label: 한 줄 ≤30, url: URL}` | 현재 `HomePage.jsx`의 `SCHOOL_LINKS` 5개 (label/url) | 홈, 점검 화면 |
| `links.external` | `{label: 한 줄 ≤30, url: URL}` | `{label: "2025 새길", url: "https://2025saegil.cukeng.kr"}` | Header |
| `home.hero_sub` | 한 줄 ≤200 | `제4대 공과대학 학생회 [여정]` | 홈 히어로 |
| `home.hero_title` | 한 줄 ≤200 | `변화를 새길, 우리의 여정!` | 홈 히어로 |
| `footer.copyright` | 여러 줄 ≤1000 | `© 2026 Catholic University of Korea.\nCUK Engineering Student Council Trip. All Rights Reserved` | Footer |
| `maintenance.notice` | 여러 줄 ≤1000 | `보다 안정적인 서비스를 위해\n서버를 점검하고 있습니다.\n매일 05:00 ~ 06:00은 정기 점검 시간입니다.` | 점검 화면 |
| `maintenance.available` | 여러 줄 ≤1000 | `이용 가능 서비스:\n학교페이지 바로가기, 조직도 열람,\n단과대 및 학과 편성` | 점검 화면 |
| `rental.enabled` | boolean | `true` | Header, 홈, `/borrow`, `POST /api/borrow` |
| `rental.return_days` | 정수 1~30 | `4` | 대여 완료 반납일, `/api/check`, 관리자 연체 판정 |
| `rental.cancel_notice` | 여러 줄 ≤1000 | `※ 신청 시각 기준 24시간이 지나면 자동으로 신청이 취소되오니,\n참고하여 수령해주시길 바랍니다.` | 대여 완료 화면 |
| `system.snowfall` | boolean | `false` (또는 `settings.json` 값) | 기존 눈송이 API |

- **공통 검증**: 문자열은 앞뒤 공백을 제거한 뒤 빈 값을 거부한다. URL은 `http://` 또는 `https://`로 시작해야 한다. 이메일은 `^[^@\s]+@[^@\s]+\.[^@\s]+$` 형식이어야 한다.
- **여러 줄 문자열 표시**: 화면에서는 `\n`을 줄바꿈으로 렌더링한다. HTML은 허용하지 않고 텍스트로만 출력한다.
- **기존 서식 변경**: 점검 화면의 시간 부분과 푸터의 `Trip`은 지금 `<strong>`(굵게)인데, 설정값이 되면서 일반 텍스트로 표시된다. 의도된 변경이다.

### 3.3 학사일정 (`schedules` 테이블, 기존 유지)
- 열 `id`, `name`, `start_date`, `end_date`는 그대로 둔다.
- `Schedule.to_dict()`에 `id`를 추가한다(기존 `name`, `start`, `end` 유지).
- **검증**: `name`은 한 줄 ≤50, `start`와 `end`는 `YYYY-MM-DD` 형식의 실제 날짜, `start` ≤ `end`.

## 4. 백엔드

### 4.1 파일 구성
- `site_settings.py` (신규): 키 정의(`SETTINGS_SPEC`: 키 → 타입·검증 함수·기본값), `ensure_defaults()`, `get_public_settings() -> dict`, `get_setting(key)`, `update_settings(changes: dict, role: str) -> (ok, errors)`.
- `models.py`: `SiteSetting` 모델 추가, `Schedule.to_dict`에 `id` 추가.
- `routes/site_info_routes.py` (신규): Blueprint `site_info_bp`. 4.2절의 설정 API와 학사일정 쓰기 API를 담는다.
- `app.py`: Blueprint 등록, 시작 시 `ensure_defaults()` 호출, 4.3절의 동작 변경 반영.
- `docker-compose.yml`: `./routes/*.py` 파일별 볼륨 4줄을 `./routes:/app/routes` 한 줄로 바꾸고 `./site_settings.py:/app/site_settings.py`를 추가한다.

### 4.2 API
| 메서드 | 경로 | 권한 | 요청 | 응답 |
|---|---|---|---|---|
| GET | `/api/site-info` | 공개, `@limiter.exempt` | — | `200 {status:'success', data:{키: 값, …}}` (3.2절 전체) |
| PUT | `/api/admin/site-info` | `master_required` | `{키: 값, …}` (일부만 보내도 됨) | 성공 `200 {status:'success', data:{…전체}}` / 검증 실패 `400 {status:'fail', errors:{키: 사유}}` |
| GET | `/api/schedule` | 공개 | — | 기존 형식에 항목마다 `id` 추가 |
| POST | `/api/admin/schedule` | `master_required` | `{name, start, end}` | `201 {status:'success', data:{id, name, start, end}}` / `400 {status:'fail', errors}` |
| PUT | `/api/admin/schedule/<id>` | `master_required` | `{name, start, end}` | `200` / `400` / `404` |
| DELETE | `/api/admin/schedule/<id>` | `master_required` | — | `200 {status:'success'}` / `404` |

- **PUT 원자성**: 보낸 키를 모두 검증해서 오류가 하나라도 있으면 아무것도 저장하지 않는다. 모두 통과하면 하나의 트랜잭션으로 저장한다.
- **알 수 없는 키**: `errors[키] = '알 수 없는 설정입니다.'`로 거부한다.
- **권한 오류**: 기존 데코레이터 형식을 그대로 쓴다(401 `로그인이 필요합니다.`, 403 `마스터 권한이 필요합니다.`).

### 4.3 기존 동작 변경
1. **`POST /api/borrow`**: 함수 시작부에서 `get_setting('rental.enabled')`가 거짓이면 `403 {status:'fail', message:'현재 대여 신청을 받지 않습니다.'}`를 반환하고 기록하지 않는다.
2. **`POST /api/check`**: `timedelta(days=4)`를 `timedelta(days=get_setting('rental.return_days'))`로 바꾼다.
3. **눈송이 API**: `GET /api/system/snowfall`과 `POST /api/admin/system/snowfall`의 경로, 권한(`login_required`), 요청·응답 형식은 그대로 두고, 읽기와 쓰기를 `system.snowfall` 키로 바꾼다. `settings.json` 읽기·쓰기 코드는 제거한다(초기 이전만 3.1절에서 처리).

### 4.4 테스트 (pytest, 신규)
- `requirements-dev.txt`에 `pytest`를 추가한다. `tests/conftest.py`는 임시 디렉터리 SQLite와 임시 데이터 파일로 Flask 테스트 클라이언트를 만든다. 실제 `data/`는 건드리지 않는다.
- 로그인은 `/api/admin/login`에 테스트용 환경변수 비밀번호로 수행한다.
- **테스트 항목**
  - 기본값 채우기: 빈 DB → 모든 키 생성, 기존 값 보존
  - 눈송이 이전: `settings.json`의 `true` → `system.snowfall`이 `true`
  - GET 공개 응답
  - PUT 권한: 비로그인 401, sub 403, master 200
  - 키별 검증 성공·실패
  - 일부 값이 잘못됐을 때 아무것도 저장하지 않음
  - 인스타 `@` 제거
  - 학사일정 추가·수정·삭제와 검증, 없는 id 404
  - 대여 OFF면 `/api/borrow` 403이고 로그에 행이 추가되지 않음
  - `return_days=7`이면 `/api/check`의 `due_date`가 대여일 + 7일
  - 눈송이 API 응답 형식 유지

## 5. 프론트엔드

### 5.1 사이트 정보 공급
- `src/lib/siteInfo.js`: `DEFAULT_SITE_INFO`(3.2절 기본값, `system.snowfall` 제외), `mergeSiteInfo(defaults, server)`, `instagramUrl(id)`(→ `https://www.instagram.com/{id}`).
- `src/context/SiteInfoContext.jsx`: `SiteInfoProvider`, `useSiteInfo() => { info, refresh }`.
  - 마운트 시 `GET /api/site-info`를 1회 호출한다.
  - 성공하면 기본값과 병합하고, 실패하면 기본값을 유지한다(오류를 조용히 처리하고 `console.error`만 남긴다).
  - `refresh()`는 다시 불러온다.
  - 로딩 중에도 기본값을 즉시 제공해서 화면이 깜빡이지 않게 한다.
- `App.jsx`에서 `<Router>` 안쪽 최상위를 `SiteInfoProvider`로 감싼다.
- 여러 줄 텍스트는 `src/components/MultilineText.jsx`(`text.split('\n')`을 `<br />`로 연결)로 렌더링한다.

### 5.2 소비처 변경
| 파일 | 변경 |
|---|---|
| `Footer.jsx` | 운영 책임자, 저작권(여러 줄), 주소, 이메일 |
| `Header.jsx` | 외부 링크 label/url; `RENTAL_ENABLED`를 `info['rental.enabled']`로 교체 (비활성 표현은 기존과 동일) |
| `HomePage.jsx` | `SCHOOL_LINKS` 상수를 삭제하고 `links.school` 사용(일반·점검 화면 모두), 히어로 두 문구, 인스타 `@{sns.instagram}`, 점검 안내 두 문구, 대여 바로가기 비활성 판단 |
| `FloatingSNS.jsx` | 인스타 URL, 링크트리, 카카오 |
| `DepartmentPage.jsx` | 공과대학 카드의 인스타 ID만 `sns.instagram`으로 |
| `BorrowPage.jsx` | 반납일 `add(info['rental.return_days'], 'day')`; `rental.enabled`가 거짓이면 마법사 대신 `EmptyState` 안내 "현재 대여 신청을 받지 않습니다." |
| `SuccessPage.jsx` | 수령·반납 안내의 `공대방(N507)` → `contact.room`, 자동 취소 안내 → `rental.cancel_notice` |
| `src/lib/borrowStatus.js` | `getBorrowToneFromBorrowedAt(status, borrowedAt, today?, returnDays = 4)`처럼 반납 기간을 인자로 받는다(기본값 4로 하위 호환) |
| `AdminReturnPage.jsx`, `AdminDashboardPage.jsx`, `AdminLogPage.jsx` | 위 함수에 `info['rental.return_days']`를 전달 |
| `src/config/features.js` | 삭제 (사용처가 모두 설정값으로 대체됨) |

- 사용자에게 보이는 그 밖의 문구, API 호출, alert/confirm 문구는 바꾸지 않는다.

### 5.3 관리자 '정보 관리' 페이지 `/admin/site-info`
- **라우트**: `App.jsx`의 `ProtectedRoute` + `AdminLayout` 안에 추가한다.
- **사이드바**: `adminNav.js`의 '콘텐츠' 그룹 맨 앞에 `{ to: '/admin/site-info', label: '정보 관리', icon: 'settings', masterOnly: true }`를 추가한다. Lucian `settings` 아이콘은 CLI로 `src/vendor/lucian-icons`에 반입하고, `LucianIcon` 래퍼에 import를 추가한다.
- **페이지 권한**: 마운트 시 `localStorage adminRole !== 'master'`이면 `alert('마스터 권한이 필요합니다.')` 후 `navigate('/admin/dashboard')`로 보낸다. 백엔드가 최종적으로 차단한다.
- **구성**: `PageHeader("정보 관리")` 아래에 카드 6개를 둔다(모바일에서는 1열, `≥1024px`에서는 2열 격자).
  1. 연락처·위치
  2. SNS: 인스타 입력칸 앞에 `@` 접두 표시
  3. 링크: 학교 바로가기 행 목록(이름, URL, 위로/아래로 버튼, 삭제 버튼), '+ 링크 추가'(최대 10개), 외부 링크
  4. 홈·푸터 문구
  5. 점검 안내
  6. 대여 운영: `Toggle` 대여 신청 받기, 반납 기간(number 1~30), 자동 취소 안내(textarea)
- **편집 상태**: 서버 값(`original`)과 편집값(`draft`)을 비교해 변경된 키 목록을 구한다. 학교 바로가기 목록은 깊은 비교를 쓴다.
  - 하단 `BottomBar`(모바일 고정, 데스크톱 정적)에 '저장하지 않은 변경 N개'와 '저장' 버튼을 둔다. 변경이 0개면 버튼을 비활성한다.
- **저장**: 변경된 키만 `PUT /api/admin/site-info`로 보낸다.
  - 성공하면 `alert('저장되었습니다.')`, `original`을 갱신하고 `refresh()`를 호출한다.
  - `400`이면 각 입력칸 아래에 `errors[키]`를 빨간 안내로 표시하고 첫 오류 칸으로 스크롤한다.
  - 그 밖의 오류는 `alert('저장 실패')`를 띄운다.
  - 저장 중에는 버튼을 비활성해서 중복 요청을 막는다.
- **학사일정 카드**: 같은 페이지 하단에 둔다. `ResponsiveTable`(이름, 시작일, 종료일, 수정·삭제)을 쓴다.
  - '+ 일정 추가'를 누르면 입력 행이 열린다(이름, `type="date"` 시작·종료). 저장하면 POST, 수정은 해당 행을 편집 모드로 바꾼 뒤 PUT을 보낸다.
  - 삭제는 `confirm('이 학사일정을 삭제하시겠습니까?')` 후 DELETE를 보낸다.
  - 각 동작이 성공하면 목록을 다시 불러온다. 홈 D-Day는 다음 홈 진입 시 반영된다.
  - 서버 검증 오류는 행 아래에 표시한다.

### 5.4 테스트 (Vitest)
- `siteInfo`: 병합 규칙(서버 값 우선, 없는 키는 기본값 유지), `instagramUrl`
- `SiteInfoContext`: 성공 시 서버 값 사용, 실패 시 기본값 사용, `refresh`
- 소비처
  - Footer: 설정값 렌더링
  - 홈: 학교 링크·히어로·점검 문구가 설정값으로 나오고, `rental.enabled=false`면 대여 바로가기 비활성
  - Header: 외부 링크와 대여 비활성
  - BorrowPage: OFF 안내, 반납일 계산
  - SuccessPage: 장소와 자동 취소 문구
  - borrowStatus: `returnDays` 인자
- 관리자 페이지
  - 변경 키만 전송
  - 400 오류 표시
  - 저장 성공 시 `refresh` 호출
  - 링크 추가·삭제·순서 변경
  - sub 접근 차단
  - 학사일정 추가·수정·삭제와 confirm
- 기존 테스트 중 `features.js`를 mock하던 Header/Home 테스트는 SiteInfo mock으로 바꾼다.

## 6. 진행 순서
1. **백엔드**: 모델과 설정 모듈, 기본값 채우기, 눈송이 이전 + pytest
2. **백엔드**: 설정 API, 학사일정 API, 대여·확인 동작 변경, docker-compose 수정 + pytest
3. **프론트**: siteInfo, Context, MultilineText + 테스트
4. **프론트**: 소비처 교체(Footer, Header, Home, FloatingSNS, Department, Borrow, Success, borrowStatus 사용처), `features.js` 삭제
5. **프론트**: 관리자 정보 관리 페이지 + 사이드바 + 아이콘
6. **통합 점검**: 로컬 백엔드(`tools/local-backend`)와 프론트를 함께 띄워 API 계약 확인. 백엔드를 끈 상태에서 기본값으로 표시되는지 확인.

## 7. 배포 시 유의사항 (사용자 수행)
- **배포 순서**: 백엔드를 먼저 배포한다. 새 API가 없으면 프론트는 기본값으로 동작하므로, 프론트를 먼저 배포해도 사이트는 깨지지 않는다.
- **docker-compose 변경 적용**: 볼륨 설정이 바뀌므로 운영 서버에서 `docker compose up -d`로 컨테이너를 다시 만들어야 한다. `uploads/`는 이미 볼륨으로 보존된다.
- **눈송이 값 이전**: 배포 후 첫 실행 때 `settings.json` 값이 DB로 옮겨진다. 이후 `settings.json`은 쓰이지 않는다.

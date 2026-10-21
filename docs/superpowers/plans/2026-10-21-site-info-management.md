# 사이트 정보 관리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 흩어진 사이트 정보와 학사일정을 백엔드 DB 한곳에 모으고, master 관리자가 '정보 관리' 페이지에서 수정하면 사이트에 바로 반영되게 한다.

**Architecture:** 백엔드는 `site_settings` 테이블(키/JSON 값)과 키 명세 모듈(`site_settings.py`)을 두고, 공개 조회·master 수정 API와 학사일정 CRUD를 Blueprint로 추가한다. 프론트는 기본값 전용 파일(`src/config/siteDefaults.js`) 위에 서버 값을 덮어쓰는 `SiteInfoProvider`로 전 페이지에 값을 공급하고, 관리자 페이지에서 바뀐 키만 저장한다.

**Tech Stack:** 백엔드 Flask + Flask-SQLAlchemy(SQLite) + pandas, **Python 3.9 호환**(Dockerfile `python:3.9-slim`), pytest(신규). 프론트 React 19 + Vite + react-router-dom 7, 일반 CSS, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-21-site-info-management-design.md` (Trip_Portal_FE)

## Global Constraints

- 저장소·브랜치: 백엔드 `D:\projects\Trip Portal\Trip_Portal_BE` 브랜치 `feature/site-info`(Task 1에서 `main`에서 생성), 프론트 `D:\projects\Trip Portal\Trip_Portal_FE` 브랜치 `feature/site-info`(이미 존재). push하지 않는다.
- 백엔드 코드는 Python 3.9 문법만 쓴다(`match`, `X | Y` 타입 표기, `dict[str, int]` 같은 내장 제네릭 주석 금지).
- 설정 키, 타입, 검증, 기본값은 스펙 3.2절 표와 **글자 하나까지** 같아야 한다. 백엔드 `site_settings.py`와 프론트 `src/config/siteDefaults.js`의 기본값은 서로 같다(`system.snowfall`은 백엔드만).
- API 경로·권한·응답 형식은 스펙 4.2절 그대로. 오류 응답 `{status:'fail', errors:{키: 사유}}`, 권한 오류는 기존 `login_required`/`master_required` 데코레이터 메시지 그대로.
- 기존 API(`/api/system/snowfall`, `/api/admin/system/snowfall`, `/api/schedule`, `/api/borrow`, `/api/check`)의 경로·권한·응답 키는 유지한다(`/api/schedule` 항목에 `id` 추가, `/api/borrow` OFF 시 403 추가만 허용).
- 프론트: 사용자에게 보이는 기존 문구, API 호출, `alert`/`confirm` 문구는 스펙 5.2절에 적은 교체 외에는 바꾸지 않는다. 리디자인 규칙 유지: 공통 UI는 `@/components/ui`, 관리자 클래스는 `admin-` 접두, CSS 충돌 가드(`src/test/cssCollisions.test.js`) 통과.
- 운영 API(`https://trip-api.cukeng.kr`)로 쓰기 요청 금지. 수동 검증은 `tools/local-backend`의 로컬 백엔드로만. 로컬 백엔드는 시작한 PID만 종료한다(`Get-CimInstance Win32_Process | ? { $_.CommandLine -like '*app.py*' }`로 찾아 종료, 포트 5000 비었는지 확인).
- 사용자 미커밋 파일 `Trip_Portal_FE/vite.config.js`는 스테이징·커밋·되돌리기 금지.
- Lint: 프론트 `npm run lint`에 새 오류 없음, 수정 파일 0 오류(기존 TeaserPage 1건 허용).
- 커밋 메시지는 저장소 관례(`[feat]`, `[fix]`, `[test]`, `[chore]`, `[docs]`) + 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- 각 Task 종료 조건: 백엔드 `python -m pytest -q` 통과(백엔드 Task), 프론트 `npm run test -- --run`, `npm run lint`, `npm run build` 통과(프론트 Task).

## Review Focus

1. **잘못된 값이 섞인 저장 요청**: 5개 키 중 1개만 잘못돼도 DB에 아무것도 저장되지 않아야 하고, 응답에 그 키의 사유가 와야 한다. → Task 2
2. **API 실패 시 사이트**: `/api/site-info`가 500이거나 네트워크 오류여도(점검 시간) 모든 화면이 기본값으로 정상 렌더링되고, 점검 화면의 학교 바로가기가 보여야 한다. → Task 4, 5
3. **대여 OFF의 우회**: 화면에서 막혀도 `/borrow` 직접 접속과 `POST /api/borrow` 직접 호출이 모두 막혀야 한다. → Task 3, 5
4. **반납 기간 변경의 일관성**: `return_days`를 7로 바꾸면 완료 화면 반납일, `/api/check` due_date, 관리자 연체 판정, 상태 배지가 모두 7일 기준이어야 한다. → Task 3, 5
5. **관리자 편집 중 데이터 유실**: 저장 실패(400/네트워크) 시 입력한 값이 사라지지 않아야 하고, 저장 중 연타로 중복 요청이 가지 않아야 한다. → Task 6

---

## File Structure

**백엔드 (Trip_Portal_BE)**
| 경로 | 책임 |
|---|---|
| `site_settings.py` (신규) | 키 명세 `SETTINGS_SPEC`, 검증 함수, `ensure_defaults`, `get_public_settings`, `get_setting`, `update_settings` |
| `models.py` | `SiteSetting` 모델 추가, `Schedule.to_dict`에 `id` |
| `routes/site_info_routes.py` (신규) | `/api/site-info`, `/api/admin/site-info`, `/api/admin/schedule*` |
| `app.py` | DB 경로 환경변수 허용, Blueprint 등록, 시작 시 `ensure_defaults`, 대여·확인·눈송이 동작 변경 |
| `docker-compose.yml` | `./routes:/app/routes`, `./site_settings.py:/app/site_settings.py` |
| `requirements-dev.txt`, `pytest.ini`, `tests/conftest.py`, `tests/test_*.py` (신규) | 테스트 |

**프론트 (Trip_Portal_FE)**
| 경로 | 책임 |
|---|---|
| `src/config/siteDefaults.js` (신규) | 기본값 객체만 |
| `src/lib/siteInfo.js` (신규) | `mergeSiteInfo`, `instagramUrl` |
| `src/context/SiteInfoContext.jsx` (신규) | Provider + `useSiteInfo` |
| `src/components/MultilineText.jsx` (신규) | `\n` → `<br />` |
| `src/pages/admin/AdminSiteInfoPage.jsx`, `AdminSiteInfo.css`, `SchoolLinksEditor.jsx`, `ScheduleManager.jsx` (신규) | 관리자 정보 관리 |
| 수정 | `App.jsx`, `Footer.jsx`, `Header.jsx`, `HomePage.jsx`, `FloatingSNS.jsx`, `DepartmentPage.jsx`, `BorrowPage.jsx`, `SuccessPage.jsx`, `src/lib/borrowStatus.js`, `AdminReturnPage.jsx`, `AdminDashboardPage.jsx`, `AdminLogPage.jsx`, `src/layouts/adminNav.js`, `src/components/icons/LucianIcon.jsx`, `src/vendor/lucian-icons/*`(CLI) |
| 삭제 | `src/config/features.js` |

---

## Stage A: 백엔드

### Task 1: 테스트 환경, `SiteSetting` 모델, `site_settings` 모듈

**Files:**
- Create: `requirements-dev.txt`(`pytest`), `pytest.ini`(`testpaths = tests`), `tests/conftest.py`, `tests/test_site_settings.py`, `site_settings.py`
- Modify: `models.py`, `app.py`(DB 경로만)

**Interfaces:**
- Produces:
  - `models.SiteSetting(key: str PK(64), value: Text(JSON), updated_at: DateTime, updated_by: String(20))`
  - `site_settings.SETTINGS_SPEC: dict` 키 → `{'default': 값, 'validate': callable(value) -> (ok: bool, normalized_or_reason)}` (스펙 3.2절 18개 키)
  - `site_settings.ensure_defaults(settings_json_path: str) -> None`
  - `site_settings.get_public_settings() -> dict` (18개 키 전부)
  - `site_settings.get_setting(key: str)` (DB 값, 없으면 기본값)
  - `site_settings.update_settings(changes: dict, role: str) -> (bool, dict)` 성공 시 `(True, 전체설정)`, 실패 시 `(False, {키: 사유})`이고 아무것도 저장하지 않음
  - `app.py`: `app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('TRIP_DATABASE_URI') or f'sqlite:///{db_path}'` (기존 경로가 기본값)
  - `tests/conftest.py` fixture: `app_ctx`(임시 디렉터리로 `chdir`, `TRIP_DATABASE_URI`=임시 sqlite, `ADMIN_PASSWORD=testmaster`, `SUB_PASSWORD=testsub`, `FLASK_SECRET_KEY=test`를 import 전에 설정, `RATELIMIT_ENABLED=False`, `db.create_all()`), `client`, `login(client, role)` 헬퍼
- 검증 사유 문구: 빈 값 `'값을 입력해주세요.'`, 길이 초과 `'N자 이하로 입력해주세요.'`, URL `'http:// 또는 https://로 시작하는 주소를 입력해주세요.'`, 이메일 `'이메일 형식이 올바르지 않습니다.'`, 인스타 `'영문, 숫자, 마침표, 밑줄만 사용할 수 있습니다.'`, 정수 범위 `'1~30 사이의 숫자를 입력해주세요.'`, 목록 개수 `'1~10개까지 입력할 수 있습니다.'`, 타입 불일치 `'형식이 올바르지 않습니다.'`, 알 수 없는 키 `'알 수 없는 설정입니다.'`

- [ ] **Step 1:** 백엔드에서 `git checkout -b feature/site-info`. `tools/local-backend/.venv`(프론트 저장소)의 python으로 `pip install pytest`(로컬 venv에만) 후 `requirements-dev.txt`, `pytest.ini` 작성.
- [ ] **Step 2: 실패하는 테스트** `tests/test_site_settings.py`
  - `test_ensure_defaults_fills_all_keys`: 빈 DB → `get_public_settings()`의 키 집합 == `SETTINGS_SPEC` 키 집합, `['contact.room'] == '공대방(N507)'`, `['rental.return_days'] == 4`, `['links.school']` 길이 5
  - `test_ensure_defaults_keeps_existing`: `contact.room`을 `'X(1)'`로 저장 후 재실행 → 그대로 `'X(1)'`
  - `test_snowfall_migrated_from_settings_json`: 임시 `settings.json`에 `{"snowfall": true}` → `ensure_defaults(path)` 후 `get_setting('system.snowfall') is True`; 파일 없으면 `False`
  - `test_update_rejects_all_on_any_error`: `update_settings({'contact.room':'새방', 'contact.email':'bad'}, 'master')` → `(False, {'contact.email': '이메일 형식이 올바르지 않습니다.'})`, `contact.room` 미변경
  - `test_update_normalizes_instagram`: `{'sns.instagram': '@new.id'}` → 저장값 `'new.id'`
  - `test_validators`: `rental.return_days` 0/31/'4'(문자열) 거부, 30 허용; `links.school` 빈 목록·11개 거부, `{label:'a', url:'ftp://x'}` 거부; 200자 초과 한 줄 거부; 알 수 없는 키 거부; `rental.enabled`에 `'true'` 문자열 거부
- [ ] **Step 3:** `python -m pytest -q` → FAIL(모듈 없음)
- [ ] **Step 4:** 구현. `update_settings`는 모든 키 검증 후 `db.session` 한 트랜잭션으로 upsert하고, 예외 시 `rollback`.
- [ ] **Step 5:** `python -m pytest -q` → PASS. `python -c "import app"`가 오류 없이 import되는지 확인(실제 `data/`를 만들거나 수정하지 않음 — 수정됐다면 되돌린다).
- [ ] **Step 6:** 커밋 `[feat] 사이트 설정 모델·검증 모듈 및 테스트 환경 추가`

### Task 2: 설정 API와 학사일정 API

**Files:**
- Create: `routes/site_info_routes.py`, `tests/test_site_info_api.py`, `tests/test_schedule_api.py`
- Modify: `models.py`(`Schedule.to_dict`에 `'id': self.id`), `app.py`(Blueprint 등록; `__main__`의 `db.create_all()` 직후 `ensure_defaults(SETTINGS_FILE)`)

**Interfaces:**
- Consumes: Task 1 `get_public_settings`, `update_settings`, conftest `client`/`login`
- Produces: 스펙 4.2절 6개 엔드포인트. `GET /api/site-info`는 `@limiter.exempt`. `PUT /api/admin/site-info`는 JSON 객체가 아니면 `400 {status:'fail', errors:{'_': '형식이 올바르지 않습니다.'}}`. `updated_by`는 `session.get('role')`.
- 학사일정 검증 사유: 이름 `'값을 입력해주세요.'`/`'50자 이하로 입력해주세요.'`, 날짜 `'YYYY-MM-DD 형식의 날짜를 입력해주세요.'`, 순서 `{'end': '종료일은 시작일 이후여야 합니다.'}`

- [ ] **Step 1: 실패하는 테스트**
  - `test_get_site_info_public`: 비로그인 GET → 200, `data['sns.instagram'] == 'cuk.engineering'`
  - `test_put_requires_master`: 비로그인 401 `'로그인이 필요합니다.'`, sub 403 `'마스터 권한이 필요합니다.'`, master 200
  - `test_put_partial_update`: master `{'home.hero_title': '새 문구'}` → 200, 응답 `data['home.hero_title']=='새 문구'`, 다른 키는 기본값
  - `test_put_atomic`: `{'contact.room':'A', 'rental.return_days': 99}` → 400 `errors == {'rental.return_days': '1~30 사이의 숫자를 입력해주세요.'}`, 이후 GET에서 `contact.room` 기본값
  - `test_put_non_object`: 본문 `[1,2]` → 400
  - 학사일정: GET 항목에 `id`; master POST `{name:'2027-2', start:'2027-09-01', end:'2027-12-20'}` → 201; `start` > `end` → 400 `errors.end`; 잘못된 날짜 `'2027-13-01'` → 400; PUT 수정 → 200 반영; DELETE → 200 후 GET에서 사라짐; 없는 id PUT/DELETE → 404; sub POST → 403
- [ ] **Step 2:** FAIL 확인 → 구현 → PASS
- [ ] **Step 3:** 커밋 `[feat] 사이트 정보 API 및 학사일정 관리 API 추가`

### Task 3: 대여·확인·눈송이 동작 변경, docker-compose

**Files:**
- Modify: `app.py`, `docker-compose.yml`
- Create: `tests/test_rental_rules.py`, `tests/test_snowfall_api.py`

**Interfaces:**
- Consumes: `get_setting`, `update_settings`
- `POST /api/borrow`: 함수 맨 앞에서 `if not get_setting('rental.enabled'): return jsonify({'status':'fail','message':'현재 대여 신청을 받지 않습니다.'}), 403`
- `POST /api/check`: `timedelta(days=get_setting('rental.return_days'))`
- 눈송이: `load_settings`/`save_settings`/`settings.json` 쓰기 제거, GET은 `get_setting('system.snowfall')`, POST는 `update_settings({'system.snowfall': bool(enabled)}, session.get('role'))`. 응답 `{'status':'success','enabled': 값}` 그대로, 권한 `login_required` 그대로.
- `docker-compose.yml`: `./routes/notice_routes.py`, `instagram_routes.py`, `campus_routes.py`, `gallery_routes.py` 4줄 → `- ./routes:/app/routes` 한 줄, `- ./site_settings.py:/app/site_settings.py` 추가. 다른 줄과 주석 유지.

- [ ] **Step 1: 실패하는 테스트** (conftest가 임시 `data/`에 `stuff_ongoing.xlsx`(물품 `우산` 재고 5, 카테고리 `생활`), 빈 `borrow_log.xlsx`를 만드는 fixture `data_files`를 추가)
  - `test_borrow_blocked_when_disabled`: master로 `rental.enabled=false` 저장 → 비로그인 POST `/api/borrow`(정상 payload) → 403, 메시지 일치, `borrow_log.xlsx` 행 수 0
  - `test_borrow_allowed_when_enabled`: 기본값 → 200 success, 행 1
  - `test_check_due_date_uses_setting`: 대여시각 `2026-10-01 10:00:00`인 `미반납` 행을 로그에 직접 기록, `return_days=7` 저장 → POST `/api/check` → `due_date == '2026-10-08'`; 기본값이면 `'2026-10-05'`
  - `test_snowfall_contract`: GET → `{'status':'success','enabled': False}`; sub 로그인 POST `{'enabled': True}` → 200 `enabled True`; GET → True; 비로그인 POST → 401
- [ ] **Step 2:** FAIL → 구현 → PASS. `git diff docker-compose.yml`로 바뀐 줄이 위 두 가지뿐인지 확인.
- [ ] **Step 3:** 커밋 `[feat] 대여 ON/OFF·반납 기간·눈송이 설정을 사이트 설정과 연동`

---

## Stage B: 프론트엔드

### Task 4: 기본값 파일, siteInfo, Provider, MultilineText

**Files:**
- Create: `src/config/siteDefaults.js`, `src/lib/siteInfo.js`, `src/lib/siteInfo.test.js`, `src/context/SiteInfoContext.jsx`, `src/context/SiteInfoContext.test.jsx`, `src/components/MultilineText.jsx`
- Modify: `src/App.jsx`(`<Router>` 바로 안쪽을 `<SiteInfoProvider>`로 감쌈)

**Interfaces:**
- Produces:
  - `DEFAULT_SITE_INFO` (스펙 3.2절 17개 키, `system.snowfall` 제외; 그룹 순서·키별 사용처 주석). `links.school` 항목 형태 `{ label, url }`.
  - `mergeSiteInfo(defaults, server) => object`: `server`가 객체가 아니면 `defaults` 복사본; 키별로 `server[k] !== undefined && server[k] !== null`이면 서버 값, 아니면 기본값; 기본값에 없는 서버 키는 무시
  - `instagramUrl(id) => 'https://www.instagram.com/' + id`
  - `SiteInfoProvider({ children })`, `useSiteInfo() => { info, refresh }` (`info`는 최초 렌더부터 기본값; 마운트 시 `axios.get('/api/site-info')` 1회, `res.data.status === 'success'`면 `mergeSiteInfo(DEFAULT_SITE_INFO, res.data.data)`; 실패 시 `console.error` 후 기본값 유지; `refresh()`는 같은 요청을 다시 보내고 Promise 반환)
  - `MultilineText({ text })`: `String(text).split('\n')`을 `<br />`로 연결한 Fragment
- [ ] **Step 1: 실패하는 테스트**
  - siteInfo: 서버 값 우선, null/undefined는 기본값, 모르는 키 무시, `server=null` → 기본값; `instagramUrl('cuk.engineering') === 'https://www.instagram.com/cuk.engineering'`
  - Context: axios mock 성공(`{status:'success', data:{'home.hero_title':'X'}}`) → 소비 컴포넌트가 처음엔 기본 문구, 이후 `X`; 실패(reject) → 기본 문구 유지; `refresh()` 호출 시 axios.get 2회
  - siteDefaults: 키 집합이 스펙의 17개와 정확히 일치(테스트에 키 배열을 명시)
- [ ] **Step 2:** FAIL → 구현 → PASS. `App.test.jsx`가 깨지면 axios mock에 `/api/site-info` 응답을 추가.
- [ ] **Step 3:** 커밋 `[feat] 사이트 정보 기본값·Provider 추가`

### Task 5: 화면을 설정값으로 교체

**Files:**
- Modify: `src/components/Footer.jsx`, `Header.jsx`, `FloatingSNS.jsx`, `src/pages/HomePage.jsx`, `src/pages/client/DepartmentPage.jsx`, `src/pages/client/borrow/BorrowPage.jsx`, `SuccessPage.jsx`, `src/lib/borrowStatus.js`, `src/pages/admin/borrow/AdminReturnPage.jsx`, `src/pages/admin/AdminDashboardPage.jsx`, `src/pages/admin/borrow/AdminLogPage.jsx`, 관련 기존 테스트
- Delete: `src/config/features.js`
- Create: `src/config/siteDefaults.test.js`(가드)

**Interfaces:**
- Consumes: `useSiteInfo`, `instagramUrl`, `MultilineText`
- `getBorrowToneFromBorrowedAt(status, borrowedAt, today = dayjs().tz(), returnDays = BORROW_PERIOD_DAYS)` (기존 호출 하위 호환)
- 교체 규칙은 스펙 5.2절 표 그대로. Header/Home의 대여 비활성 마크업·문구·aria는 기존(`RENTAL_ENABLED` false 분기)과 동일, 조건만 `!info['rental.enabled']`. BorrowPage는 `rental.enabled`가 false면 `<EmptyState title="현재 대여 신청을 받지 않습니다." />`만 렌더링(로딩·요청 없이).
- 가드 테스트: 스펙 5.1절 문자열 목록이 `src/**/*.{js,jsx}`(`*.test.*`, `src/config/siteDefaults.js`, `src/vendor/**` 제외)에 0건. 경로는 `fileURLToPath(new URL('../', import.meta.url))` 기준.
- 테스트에서 Provider 대신 `vi.mock('@/context/SiteInfoContext', …)`로 `useSiteInfo`가 `{ info: {...DEFAULT_SITE_INFO, ...override}, refresh: vi.fn() }`를 반환하게 하는 헬퍼 `src/test/mockSiteInfo.js`를 만든다.
- [ ] **Step 1: 실패하는 테스트**
  - Footer: override(`contact.manager:'홍길동'`, `contact.email:'a@b.cd'`)가 렌더링
  - Home: `links.school`을 2개로 override → 링크 2개(일반·점검 화면 모두); `home.hero_title` override 반영; `rental.enabled:false` → 대여 신청 바로가기 링크 없음(기존 flag 테스트를 이 방식으로 교체)
  - Header: `links.external` override 반영; `rental.enabled:false` → 기존 비활성 동작
  - FloatingSNS: 인스타 href가 `instagramUrl(override)`
  - BorrowPage: `rental.enabled:false` → 안내 문구, axios 미호출; `rental.return_days:7` → 성공 시 navigate state `returnDate`가 오늘+7
  - SuccessPage: `contact.room:'공대방(N999)'`과 `rental.cancel_notice` override 반영
  - borrowStatus: `getBorrowToneFromBorrowedAt('미반납','2026-10-11 09:00:00', today(10-21), 14)` → `'ongoing'`
  - AdminReturnPage: `rental.return_days:10`이면 10일 전 대여 건이 연체 아님
  - 가드 테스트
- [ ] **Step 2:** FAIL → 구현 → PASS. `grep -rn "features" src`에 남은 import 없음 확인.
- [ ] **Step 3:** 커밋 `[feat] 사이트 정보를 화면에 연결하고 하드코딩 제거`

### Task 6: 관리자 '정보 관리' 페이지

**Files:**
- Create: `src/pages/admin/AdminSiteInfoPage.jsx`, `src/pages/admin/AdminSiteInfo.css`, `src/pages/admin/SchoolLinksEditor.jsx`, `src/pages/admin/ScheduleManager.jsx`, 각 `*.test.jsx`
- Modify: `src/App.jsx`(라우트 `/admin/site-info`), `src/layouts/adminNav.js`, `src/components/icons/LucianIcon.jsx`, `src/vendor/lucian-icons/`(CLI)

**Interfaces:**
- Consumes: `useSiteInfo().refresh`, `@/components/ui`(`PageHeader, Card, Field, Toggle, Button, BottomBar, ResponsiveTable`), `src/config/siteDefaults.js`(필드 목록 순서 참고만)
- 아이콘: `node "D:/projects/Trip Portal/.claude/skills/lucian-icons/scripts/lucian-icons.mjs" get settings --out ./src/vendor/lucian-icons` 후 `LucianIcon.jsx`에 import 추가
- `adminNav.js` '콘텐츠' 그룹 맨 앞 `{ to: '/admin/site-info', label: '정보 관리', icon: 'settings', masterOnly: true }`
- `SchoolLinksEditor({ value: [{label,url}], onChange(next), errors? })`: 행마다 이름·URL 입력, `aria-label` `'n번째 링크 위로'`/`'아래로'`/`'삭제'`, 첫 행 위로·마지막 행 아래로 비활성, '+ 링크 추가'는 10개면 비활성, 1개면 삭제 비활성
- `ScheduleManager()`: `GET /api/schedule`, 추가 `POST /api/admin/schedule`, 수정 `PUT .../<id>`, 삭제 `confirm('이 학사일정을 삭제하시겠습니까?')` 후 `DELETE`; 성공 후 재조회; 400 `errors`를 행 아래 표시; 학사일정 저장 성공 alert `'저장되었습니다.'`, 실패(400 제외) `'저장 실패'`
- 페이지: 마운트 시 `localStorage.getItem('adminRole') !== 'master'`면 `alert('마스터 권한이 필요합니다.')` + `navigate('/admin/dashboard')`. `GET /api/site-info`로 `original` 로드, `draft` 편집. 변경 키 = `JSON.stringify(draft[k]) !== JSON.stringify(original[k])`. BottomBar: `저장하지 않은 변경 {n}개` + 저장(n=0 또는 저장 중 비활성). 저장: 변경 키만 `axios.put('/api/admin/site-info', changes)` → 성공 시 `alert('저장되었습니다.')`, `original = res.data.data`, `draft` 동기화, `refresh()`; 400 → 필드 아래 `errors[키]`(`role="alert"`), 첫 오류 필드로 `scrollIntoView` + focus, draft 유지; 그 외 → `alert('저장 실패')`, draft 유지. `rental.return_days`는 숫자 입력값을 `Number`로 변환해 전송.
- 레이아웃: 카드 6개(모바일 1열, ≥1024px 2열), 클래스 `admin-site-info-*`
- [ ] **Step 1: 실패하는 테스트**
  - 페이지: sub면 alert + 대시보드 이동; 로드 후 `home.hero_title` 수정 → `저장하지 않은 변경 1개` → 저장 시 `axios.put('/api/admin/site-info', {'home.hero_title': '새 문구'})`, refresh 1회; 400 `{errors:{'contact.email':'이메일 형식이 올바르지 않습니다.'}}` → 해당 문구 표시, 입력값 유지; 저장 버튼 연타 시 put 1회; 반납 기간 `7` 입력 → 전송값 숫자 7
  - SchoolLinksEditor: 위로/아래로/삭제/추가 결과의 onChange 인자, 경계 비활성
  - ScheduleManager: 목록 표시, 추가 POST 본문, 수정 PUT, 삭제 confirm false면 미호출·true면 DELETE, 400 오류 표시
  - adminNav: master에만 '정보 관리'
- [ ] **Step 2:** FAIL → 구현 → PASS. CSS 충돌 가드 통과 확인.
- [ ] **Step 3:** 커밋 `[feat] 관리자 정보 관리 페이지 추가`

---

## Stage C: 통합

### Task 7: 로컬 통합 점검과 문서

**Files:**
- Modify: `tools/local-backend/README.md`(프론트; 정보 관리 테스트 방법, 백엔드 pytest 실행법 추가), 백엔드 `README.md`(설정 API·학사일정 API 한 단락)

- [ ] **Step 1:** 백엔드 `feature/site-info`에서 로컬 백엔드를 띄운다(시드 필요 시 백엔드가 꺼진 상태에서 `seed_dev_data.py --force`). 프론트는 `$env:VITE_API_TARGET='http://localhost:5000'; npm run dev`.
- [ ] **Step 2:** curl로 계약 확인: `GET /api/site-info`(18키), master 로그인 쿠키로 `PUT` 정상·400, sub 403, 학사일정 POST/PUT/DELETE, `rental.enabled=false` 후 `POST /api/borrow` 403, 다시 true로 복구.
- [ ] **Step 3:** 프록시(5173) 경유로 `GET /api/site-info` 확인. 백엔드를 끈 상태에서 `GET http://localhost:5173/` HTML이 로드되고 콘솔 오류가 사이트 정보 요청 실패 1건뿐인지(빌드 산출물 기준이 아닌 dev 서버 기준) 확인한다. 브라우저 확인은 사용자에게 요청한다고 보고에 적는다.
- [ ] **Step 4:** 시작한 PID만 종료, 포트 5000 비었는지 확인, 필요 시 시드 재실행.
- [ ] **Step 5:** 문서 수정 후 각 저장소에 커밋 `[docs] 정보 관리 기능 로컬 테스트 방법 추가`

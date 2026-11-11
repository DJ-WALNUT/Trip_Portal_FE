# 설문조사 게시판 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 학생회가 설문 링크와 안내 글을 올리고, 학생이 목록·상세·홈에서 버튼 한 번으로 설문에 참여하는 게시판을 만든다.

**Architecture:** 공지사항과 분리된 `surveys` 테이블과 `/api/surveys` 블루프린트를 백엔드에 추가한다. 프론트는 공지사항 페이지의 구성(목록 `ResponsiveTable`, 상세, 관리자 목록·작성)을 따르는 새 페이지 4개와 홈 카드를 추가한다. 마감 여부는 서버가 KST 기준으로 계산해 `is_closed`로 내려주고, 프론트는 배지 문구만 계산한다.

**Tech Stack:** Flask + Flask-SQLAlchemy(SQLite) + pytest / React 19 + react-router + axios + Vitest + Testing Library

**Spec:** `Trip_Portal_FE/docs/superpowers/specs/2026-11-11-survey-board-design.md` (실행 전에 함께 읽는다)

## Global Constraints

- 저장소가 둘이다. 백엔드 `D:\projects\Trip Portal\Trip_Portal_BE`, 프론트 `D:\projects\Trip Portal\Trip_Portal_FE`. 각 작업의 커밋은 해당 저장소에서 한다.
- 브랜치: 두 저장소 모두 `feature/survey-board`. 프론트는 이미 있다. 백엔드는 Task 1 첫 단계에서 `git fetch origin && git switch -c feature/survey-board origin/main && git branch --unset-upstream`으로 만든다. 푸시와 main 병합은 하지 않는다.
- 공지사항 코드(`notice_routes.py`, `pages/client/notice/*`, `AdminNotice*`)는 수정하지 않는다.
- 운영 API(`trip-api.cukeng.kr`)에 쓰기 요청을 보내지 않는다. 수동 확인은 `VITE_API_TARGET=http://localhost:5000` + `tools/local-backend`로만 한다.
- 커밋 메시지는 기존 형식 `[feat] ...`, `[test] ...`, `[docs] ...`(한국어)을 따르고 끝에 `Co-Authored-By: Claude <noreply@anthropic.com>`을 붙인다.
- CSS: 색·간격은 `src/styles/tokens.css` 토큰. 새 클래스 접두사는 사용자 화면 `survey-`, 관리자 화면 `admin-survey-`. `src/test/cssCollisions.test.js`가 통과해야 한다(같은 맨 클래스명을 두 CSS 파일에서 정의하면 실패).
- 공용 UI는 `@/components/ui`의 것을 쓴다. 사용자 화면은 모바일 우선.
- 고정 문구: 컨셉 문구 `심심하세요? 설문조사 하실래요?`, 버튼 `설문조사 하러가기`, 상세의 마감 버튼 `마감된 설문입니다`, 배지 `마감` / `상시` / `오늘 마감` / `D-n`.
- 테스트 명령: 백엔드 `python -m pytest`, 프론트 `npm run test -- --run`, `npm run lint`, `npm run build`.

## Review Focus

스펙이 직접 말하지 않지만 실제 사용에서 걸릴 가능성이 높은 입력. 각 항목의 테스트는 표시한 Task에 들어 있다.

1. 서버 시계가 UTC여도 마감 판정은 KST 날짜 기준이어야 한다(마감일 당일 23:59 KST까지 진행중). → Task 1
2. 본문이 JSON이 아니거나 비어 있는 등록·수정 요청은 500이 아니라 400이어야 한다. → Task 1
3. 링크 앞뒤 공백, 대문자 스킴(`HTTPS://`)은 받아들이되 공백은 잘라 저장한다. `javascript:`, `//evil.com`, 스킴 없는 주소는 거부한다. → Task 1
4. 수정 요청에서 `is_public`이 빠지면 기존 값을 유지한다(실수로 비공개 글이 공개되지 않게). → Task 2
5. `/api/surveys`가 배열이 아닌 응답(프록시의 HTML 등)을 주거나 실패해도 홈과 목록이 깨지지 않는다. → Task 4, Task 6

---

### Task 1: 백엔드 — Survey 모델, 등록, 상세 조회

**Files:**
- Modify: `Trip_Portal_BE/models.py` (맨 아래에 추가)
- Create: `Trip_Portal_BE/routes/survey_routes.py`
- Modify: `Trip_Portal_BE/app.py` (블루프린트 import와 `app.register_blueprint(survey_bp)`를 기존 등록 줄 옆에)
- Test: `Trip_Portal_BE/tests/test_survey_api.py`

**Interfaces:**
- Produces (models.py):
  - `today_kst() -> datetime.date` — 모듈 수준 함수. `Survey.is_closed`가 호출 시점에 `today_kst()`를 모듈 전역에서 찾아 부르도록 한다(테스트가 `monkeypatch.setattr(models, 'today_kst', ...)`로 날짜를 바꾼다).
  - `class Survey(db.Model)`, `__tablename__ = 'surveys'`, 컬럼은 스펙 3.1 표 그대로. `is_closed` 프로퍼티, `to_dict()`는 스펙 3.1의 JSON 키 그대로(`date`는 `created_at`의 `YYYY-MM-DD`).
- Produces (survey_routes.py):
  - `survey_bp = Blueprint('survey', __name__, url_prefix='/api/surveys')`
  - `parse_survey_payload(data, partial=False) -> tuple[dict | None, str | None]` — 검증된 필드 dict 또는 오류 문구. Task 2의 PUT이 재사용한다.
  - `POST /api/surveys` → 201 `{'message': '등록 성공', 'data': survey.to_dict()}`
  - `GET /api/surveys/<int:id>` → `survey.to_dict()`
- 오류 응답: 400 `{'error': <문구>}`. 문구:
  - 필수값: `제목, 내용, 설문 링크는 필수입니다.`
  - 링크: `설문 링크는 http:// 또는 https://로 시작해야 합니다.`
  - 날짜: `마감일은 YYYY-MM-DD 형식으로 입력해주세요.`
  - 길이: `입력 길이를 초과했습니다.`

- [ ] **Step 1: 백엔드 브랜치를 만든다** (Global Constraints의 명령). `git status -sb`가 `## feature/survey-board`를 보여야 한다.

- [ ] **Step 2: 실패하는 테스트를 쓴다** — `tests/test_survey_api.py`

```python
from datetime import date

import models
from tests.helpers import login

GOOD = {
    'title': '학식 만족도 조사', 'content': '3분이면 끝나요',
    'link_url': 'https://forms.example.com/abc',
    'deadline': '2026-11-20', 'duration': '3분', 'reward': '추첨 기프티콘',
    'is_public': True,
}


def freeze(monkeypatch, y, m, d):
    monkeypatch.setattr(models, 'today_kst', lambda: date(y, m, d))


def create(client, **over):
    res = client.post('/api/surveys', json={**GOOD, **over})
    assert res.status_code == 201, res.get_json()
    return res.get_json()['data']


def test_create_requires_login(client):
    assert client.post('/api/surveys', json=GOOD).status_code == 401


def test_create_and_get_detail(client, monkeypatch):
    freeze(monkeypatch, 2026, 11, 11)
    login(client, 'sub')
    item = create(client)
    assert item['link_url'] == 'https://forms.example.com/abc'
    assert item['deadline'] == '2026-11-20'
    assert item['duration'] == '3분' and item['reward'] == '추첨 기프티콘'
    assert item['author'] == '여정 학생회' and item['views'] == 0
    assert item['is_public'] is True and item['is_closed'] is False
    got = client.get(f"/api/surveys/{item['id']}").get_json()
    assert got['title'] == '학식 만족도 조사'


def test_optional_fields_become_null(client):
    login(client)
    item = create(client, deadline='', duration='  ', reward=None)
    assert item['deadline'] is None and item['duration'] is None and item['reward'] is None
    assert item['is_closed'] is False


def test_is_closed_uses_kst_date(client, monkeypatch):
    login(client)
    item = create(client, deadline='2026-11-20')
    freeze(monkeypatch, 2026, 11, 20)
    assert client.get(f"/api/surveys/{item['id']}").get_json()['is_closed'] is False
    freeze(monkeypatch, 2026, 11, 21)
    assert client.get(f"/api/surveys/{item['id']}").get_json()['is_closed'] is True


def test_today_kst_is_kst(monkeypatch):
    from datetime import datetime, timezone

    class FakeDT(datetime):
        @classmethod
        def now(cls, tz=None):  # 2026-11-20 15:30 UTC == 2026-11-21 00:30 KST
            return datetime(2026, 11, 20, 15, 30, tzinfo=timezone.utc).astimezone(tz)
    monkeypatch.setattr(models, 'datetime', FakeDT)
    assert models.today_kst() == date(2026, 11, 21)


def test_past_deadline_allowed(client, monkeypatch):
    freeze(monkeypatch, 2026, 11, 11)
    login(client)
    assert create(client, deadline='2026-01-01')['is_closed'] is True


def test_link_validation(client):
    login(client)
    for bad in ['javascript:alert(1)', '//evil.com', 'forms.example.com', 'ftp://a.b', '']:
        res = client.post('/api/surveys', json={**GOOD, 'link_url': bad})
        assert res.status_code == 400, bad
    assert create(client, link_url='  HTTPS://Forms.example.com/x  ')['link_url'] == 'HTTPS://Forms.example.com/x'


def test_required_and_format_errors(client):
    login(client)
    res = client.post('/api/surveys', json={**GOOD, 'title': '   '})
    assert res.status_code == 400
    assert res.get_json()['error'] == '제목, 내용, 설문 링크는 필수입니다.'
    res = client.post('/api/surveys', json={**GOOD, 'deadline': '2026-13-01'})
    assert res.get_json()['error'] == '마감일은 YYYY-MM-DD 형식으로 입력해주세요.'
    res = client.post('/api/surveys', json={**GOOD, 'duration': 'a' * 31})
    assert res.get_json()['error'] == '입력 길이를 초과했습니다.'
    for field, n in [('title', 201), ('link_url', 501), ('reward', 51)]:
        value = 'https://a.b/' + 'a' * n if field == 'link_url' else 'a' * n
        assert client.post('/api/surveys', json={**GOOD, field: value}).status_code == 400


def test_non_json_body_is_400(client):
    login(client)
    assert client.post('/api/surveys', data='hello', content_type='text/plain').status_code == 400
    assert client.post('/api/surveys', json=['a']).status_code == 400


def test_views_increment_only_when_asked(client):
    login(client)
    sid = create(client)['id']
    client.get(f'/api/surveys/{sid}')
    client.get(f'/api/surveys/{sid}?increment=false')
    assert client.get(f'/api/surveys/{sid}').get_json()['views'] == 0
    client.get(f'/api/surveys/{sid}?increment=true')
    assert client.get(f'/api/surveys/{sid}').get_json()['views'] == 1


def test_private_detail_404_for_guests(client):
    login(client)
    sid = create(client, is_public=False)['id']
    assert client.get(f'/api/surveys/{sid}').status_code == 200
    client.post('/api/admin/logout')
    with client.session_transaction() as s:
        s.clear()
    assert client.get(f'/api/surveys/{sid}').status_code == 404
    assert client.get('/api/surveys/99999').status_code == 404
```

- [ ] **Step 3: 실패를 확인한다**

Run: `python -m pytest tests/test_survey_api.py -q`
Expected: 전부 FAIL (404 또는 `AttributeError: today_kst`)

- [ ] **Step 4: `models.py`에 `today_kst`와 `Survey`를 추가한다.** `deadline`은 `db.Date`. `is_closed`는 `self.deadline is not None and today_kst() > self.deadline`.

- [ ] **Step 5: `routes/survey_routes.py`를 만들고 `app.py`에 등록한다.**
  - `parse_survey_payload(data, partial=False)`: `data`가 dict가 아니면 `(None, '제목, 내용, 설문 링크는 필수입니다.')`. 문자열 필드는 `strip()`. `partial=False`면 모든 필드를 반환 dict에 넣는다(`is_public` 기본 `True`, `bool()`로 변환). 링크 검사는 `link.lower().startswith(('http://', 'https://'))`. `deadline`은 `''`/`None` → `None`, 아니면 `datetime.strptime(v, '%Y-%m-%d').date()`.
  - 요청 본문은 `request.get_json(silent=True)`로 읽는다.
  - 상세: 비공개이고 `session.get('is_admin')`이 아니면 `abort(404)`. `increment == 'true'`일 때만 `views += 1`.
  - `GET`에는 `@limiter.limit("30 per minute")`, `POST`에는 `@login_required`.

- [ ] **Step 6: 통과를 확인한다**

Run: `python -m pytest -q`
Expected: 새 테스트와 기존 테스트 모두 PASS

- [ ] **Step 7: 커밋** — `git add models.py routes/survey_routes.py app.py tests/test_survey_api.py` / `[feat] 설문조사 모델과 등록·상세 API 추가`

---

### Task 2: 백엔드 — 목록(정렬·비공개), 수정, 삭제

**Files:**
- Modify: `Trip_Portal_BE/routes/survey_routes.py`
- Test: `Trip_Portal_BE/tests/test_survey_api.py` (이어서 추가)

**Interfaces:**
- Consumes: Task 1의 `Survey`, `parse_survey_payload`, 테스트의 `GOOD`, `create`, `freeze`
- Produces:
  - `GET /api/surveys` → `[survey.to_dict(), ...]`. 기본은 공개 글만. 관리자 세션이고 `include_private=true`면 전체.
  - `PUT /api/surveys/<int:id>` → 200 `{'message': '수정 성공', 'data': survey.to_dict()}`. 요청에 없는 키는 기존 값을 유지한다(`partial=True`). `deadline: ''` 또는 `null`은 마감일을 지운다.
  - `DELETE /api/surveys/<int:id>` → 200 `{'message': '삭제 성공'}`. 비로그인 401, sub 403.

- [ ] **Step 1: 실패하는 테스트를 추가한다**

```python
def test_list_sort_order(client, monkeypatch):
    freeze(monkeypatch, 2026, 11, 11)
    login(client)
    create(client, title='상시', deadline='')
    create(client, title='먼 마감', deadline='2026-12-01')
    create(client, title='오래전 마감', deadline='2026-10-01')
    create(client, title='임박', deadline='2026-11-12')
    create(client, title='최근 마감', deadline='2026-11-10')
    create(client, title='오늘 마감', deadline='2026-11-11')
    titles = [s['title'] for s in client.get('/api/surveys').get_json()]
    assert titles == ['오늘 마감', '임박', '먼 마감', '상시', '최근 마감', '오래전 마감']


def test_list_ties_newest_first(client):
    login(client)
    a = create(client, title='먼저', deadline='')
    b = create(client, title='나중', deadline='')
    ids = [s['id'] for s in client.get('/api/surveys').get_json()]
    assert ids == [b['id'], a['id']]


def test_list_hides_private_unless_admin_asks(client):
    login(client)
    create(client, title='공개')
    create(client, title='비공개', is_public=False)
    assert len(client.get('/api/surveys').get_json()) == 1
    assert len(client.get('/api/surveys?include_private=true').get_json()) == 2
    with client.session_transaction() as s:
        s.clear()
    assert [s['title'] for s in client.get('/api/surveys?include_private=true').get_json()] == ['공개']


def test_update(client):
    assert client.put('/api/surveys/1', json=GOOD).status_code == 401
    login(client, 'sub')
    sid = create(client, is_public=False)['id']
    res = client.put(f'/api/surveys/{sid}', json={**GOOD, 'title': '바뀐 제목', 'deadline': '', 'is_public': False})
    assert res.status_code == 200
    data = res.get_json()['data']
    assert data['title'] == '바뀐 제목' and data['deadline'] is None and data['is_public'] is False
    assert client.put(f'/api/surveys/{sid}', json={**GOOD, 'link_url': 'javascript:1'}).status_code == 400
    assert client.put('/api/surveys/99999', json=GOOD).status_code == 404


def test_update_keeps_is_public_when_omitted(client):
    login(client)
    sid = create(client, is_public=False)['id']
    body = {k: v for k, v in GOOD.items() if k != 'is_public'}
    assert client.put(f'/api/surveys/{sid}', json=body).get_json()['data']['is_public'] is False


def test_delete_permissions(client):
    login(client)
    sid = create(client)['id']
    with client.session_transaction() as s:
        s.clear()
    assert client.delete(f'/api/surveys/{sid}').status_code == 401
    login(client, 'sub')
    assert client.delete(f'/api/surveys/{sid}').status_code == 403
    login(client, 'master')
    assert client.delete(f'/api/surveys/{sid}').status_code == 200
    assert client.get(f'/api/surveys/{sid}').status_code == 404
```

- [ ] **Step 2: 실패를 확인한다** — `python -m pytest tests/test_survey_api.py -q`, 새 테스트 6개 FAIL(405)

- [ ] **Step 3: 세 라우트를 구현한다.**
  - 정렬은 조회 후 Python에서 한다. 키:

    ```python
    def _sort_key(s):
        newest = -s.created_at.timestamp(), -s.id
        if s.is_closed:
            return (1, -s.deadline.toordinal(), *newest)
        return (0, (s.deadline or date.max).toordinal(), *newest)
    ```
  - `PUT`: `parse_survey_payload(data, partial=True)`는 요청에 있는 키만 검증해 돌려준다. 단, 필수 세 필드는 요청에 있으면 비어 있을 수 없다.
  - `DELETE`의 데코레이터 순서는 `@login_required`가 바깥, `@master_required`가 안쪽이다(공지와 반대. 비로그인에게 401을 주기 위해서다).

- [ ] **Step 4: 통과를 확인한다** — `python -m pytest -q` 전체 PASS

- [ ] **Step 5: 커밋** — `[feat] 설문조사 목록·수정·삭제 API 추가`

---

### Task 3: 프론트 — 배지 유틸 `lib/survey.js`

**Files:**
- Create: `Trip_Portal_FE/src/lib/survey.js`
- Test: `Trip_Portal_FE/src/lib/survey.test.js`

**Interfaces:**
- Produces:
  - `getSurveyBadge(survey, today = dayjs().tz()) -> { tone: string, label: string }`
    - `survey.is_closed` → `{ tone: 'neutral', label: '마감' }`
    - `deadline` 없음 → `{ tone: 'done', label: '상시' }`
    - 남은 일수 0 이하 → `{ tone: 'pending', label: '오늘 마감' }`
    - 그 외 → `{ tone: 'ongoing', label: 'D-n' }`
  - `isSafeSurveyLink(url) -> boolean` — 앞뒤 공백 제거 후 `/^https?:\/\//i`
  - `toSurveyList(data) -> Array` — 배열이면 그대로, 아니면 `[]`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

```js
import { describe, it, expect } from 'vitest'
import dayjs from '@/lib/dayjs'
import { getSurveyBadge, isSafeSurveyLink, toSurveyList } from './survey'

const today = dayjs.tz('2026-11-11 23:30', 'Asia/Seoul')

describe('getSurveyBadge', () => {
  it('closed wins over everything', () => {
    expect(getSurveyBadge({ is_closed: true, deadline: '2026-11-10' }, today)).toEqual({ tone: 'neutral', label: '마감' })
  })
  it('no deadline is 상시', () => {
    expect(getSurveyBadge({ is_closed: false, deadline: null }, today)).toEqual({ tone: 'done', label: '상시' })
  })
  it('deadline today is 오늘 마감 even late at night', () => {
    expect(getSurveyBadge({ is_closed: false, deadline: '2026-11-11' }, today)).toEqual({ tone: 'pending', label: '오늘 마감' })
  })
  it('counts calendar days in KST', () => {
    expect(getSurveyBadge({ is_closed: false, deadline: '2026-11-12' }, today).label).toBe('D-1')
    expect(getSurveyBadge({ is_closed: false, deadline: '2026-11-20' }, today)).toEqual({ tone: 'ongoing', label: 'D-9' })
  })
  it('client clock ahead of server never shows a negative D-day', () => {
    expect(getSurveyBadge({ is_closed: false, deadline: '2026-11-10' }, today).label).toBe('오늘 마감')
  })
})

describe('helpers', () => {
  it('isSafeSurveyLink', () => {
    expect(isSafeSurveyLink(' https://a.b ')).toBe(true)
    expect(isSafeSurveyLink('HTTP://a.b')).toBe(true)
    ;['javascript:alert(1)', '//a.b', 'a.b', '', null, undefined].forEach((v) => expect(isSafeSurveyLink(v)).toBe(false))
  })
  it('toSurveyList', () => {
    expect(toSurveyList([{ id: 1 }])).toEqual([{ id: 1 }])
    ;['<html>', null, undefined, { a: 1 }].forEach((v) => expect(toSurveyList(v)).toEqual([]))
  })
})
```

- [ ] **Step 2: 실패 확인** — `npm run test -- --run src/lib/survey.test.js` → FAIL (모듈 없음)
- [ ] **Step 3: 구현한다.** 남은 일수는 `dayjs.tz(deadline, 'Asia/Seoul').startOf('day').diff(dayjs(today).tz('Asia/Seoul').startOf('day'), 'day')`.
- [ ] **Step 4: 통과 확인** — 같은 명령 PASS
- [ ] **Step 5: 커밋** — `[feat] 설문조사 배지 유틸 추가`

---

### Task 4: 프론트 — 목록 페이지, 라우트, 헤더 탭

**Files:**
- Create: `src/pages/client/survey/SurveyPage.jsx`, `src/pages/client/survey/SurveyPage.css`
- Modify: `src/App.jsx` (MainLayout 아래 `/notices/:id` 다음 줄에 `/surveys` 라우트)
- Modify: `src/components/Header.jsx` (`공지사항` `<li>` 바로 뒤에 `<li><Link to="/surveys" onClick={closeMenu}><ClipboardList size={18} aria-hidden="true" />설문조사</Link></li>`, lucide-react의 `ClipboardList` import)
- Modify: `src/components/Header.css` (7개 항목이 1024px 이상에서 한 줄에 들어가지 않을 때만 항목 간격 축소)
- Test: `src/pages/client/survey/SurveyPage.test.jsx`, `src/components/Header.test.jsx` (`keeps all menu links`의 배열에 `'설문조사'` 추가, `/surveys` href 단언 추가)

**Interfaces:**
- Consumes: `getSurveyBadge`, `isSafeSurveyLink`, `toSurveyList` (Task 3), `formatNoticeDate` (`@/lib/notice`)
- Produces: `SurveyPage` default export. CSS 클래스 `survey-page`, `survey-intro`, `survey-title-cell`, `survey-chip`, `survey-go-btn`, `survey-closed-text`, `survey-pagination`, `survey-page-btn`. 칩과 버튼 클래스는 Task 5의 상세 페이지가 `SurveyPage.css`를 import해 재사용하지 않는다. 상세는 자기 CSS에 `survey-detail__*` 클래스를 따로 둔다(충돌 테스트 때문).

화면 규칙(스펙 4.4):
- `<div className="survey-page">` → `PageHeader title="설문조사" description="심심하세요? 설문조사 하실래요?" icon={<LucianIcon name="check" size={28} />}` (`check`는 이미 등록된 아이콘이다)
- `ResponsiveTable breakpoint="md"`, `rowKey={(s) => s.id}`, `rowProps={(s) => ({ 'data-closed': s.is_closed ? 'true' : undefined })}`
- 열: 제목(primary. `<Link to={/surveys/${id}} className="board-link">` + 값이 있을 때만 `<span className="survey-chip">⏱ {duration}</span>`, `<span className="survey-chip">🎁 {reward}</span>` — 이모지 대신 lucide `Clock`, `Gift` 아이콘 14px, `aria-hidden`) / 상태(`Badge`) / 작성일(`formatNoticeDate(s.date)`) / 참여
- 참여 열: 진행중이고 `isSafeSurveyLink(link_url)`이면 `<Button as="a" className="survey-go-btn" href={link_url.trim()} target="_blank" rel="noopener noreferrer">설문조사 하러가기</Button>`(공용 버튼에 `sm` 크기가 없으므로 `.survey-go-btn`에서 높이 36px, 좌우 패딩 `--space-3`, `white-space: nowrap`으로 줄인다). 마감이면 `<span className="survey-closed-text">마감</span>`. 진행중인데 링크가 안전하지 않으면 아무것도 렌더하지 않는다.
- `[data-closed="true"]` 행은 `opacity: 0.55`. 긴 제목은 `overflow-wrap: anywhere`.
- 페이지네이션 10개 단위. `nav aria-label="페이지 이동"`, 버튼 `aria-label="이전 페이지"` / `"다음 페이지"`, 현재 페이지 `aria-current="page"`. 총 1페이지 이하면 nav를 렌더하지 않는다.
- 빈 목록: `EmptyState title="진행 중인 설문조사가 없습니다."`. 요청 실패: `EmptyState title="설문조사를 불러오지 못했습니다."`.

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `SurveyPage.test.jsx`

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import SurveyPage from './SurveyPage'

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({ default: (p) => <span data-icon={p.name} /> }))

const base = { content: '내용', author: '여정 학생회', date: '2026-11-01', views: 0, is_public: true }
const open = { ...base, id: 1, title: '열린 설문', link_url: 'https://forms.example.com/1', deadline: null, duration: '3분', reward: '기프티콘', is_closed: false }
const closed = { ...base, id: 2, title: '끝난 설문', link_url: 'https://forms.example.com/2', deadline: '2026-01-01', duration: null, reward: null, is_closed: true }

async function setup(data) {
  axios.get.mockResolvedValue({ data })
  const utils = render(<MemoryRouter><SurveyPage /></MemoryRouter>)
  await waitFor(() => expect(utils.container.querySelector('.ui-spinner')).toBeNull())
  return utils
}

describe('SurveyPage', () => {
  beforeEach(() => vi.resetAllMocks())

  it('requests the public list and shows the concept copy', async () => {
    await setup([open])
    expect(axios.get).toHaveBeenCalledWith('/api/surveys')
    expect(screen.getByText('심심하세요? 설문조사 하실래요?')).toBeInTheDocument()
  })

  it('open row: title links to detail, button opens the survey in a new tab, chips shown', async () => {
    const { container } = await setup([open, closed])
    const table = container.querySelector('.rtable__table')
    expect(within(table).getByRole('link', { name: '열린 설문' })).toHaveAttribute('href', '/surveys/1')
    const go = within(table).getAllByRole('link', { name: '설문조사 하러가기' })
    expect(go).toHaveLength(1)
    expect(go[0]).toHaveAttribute('href', 'https://forms.example.com/1')
    expect(go[0]).toHaveAttribute('target', '_blank')
    expect(go[0]).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(table).getByText('3분')).toBeInTheDocument()
    expect(within(table).getByText('기프티콘')).toBeInTheDocument()
    expect(within(table).getByText('상시')).toBeInTheDocument()
  })

  it('closed row has no survey link and is marked', async () => {
    const { container } = await setup([closed])
    const table = container.querySelector('.rtable__table')
    expect(within(table).queryByRole('link', { name: '설문조사 하러가기' })).toBeNull()
    expect(container.querySelector('[data-closed="true"]')).not.toBeNull()
    expect(within(table).getAllByText('마감').length).toBeGreaterThan(0)
  })

  it('never renders an unsafe link as a button', async () => {
    const { container } = await setup([{ ...open, link_url: 'javascript:alert(1)' }])
    expect(container.querySelector('a[href^="javascript"]')).toBeNull()
    expect(screen.queryByRole('link', { name: '설문조사 하러가기' })).toBeNull()
  })

  it('paginates 10 per page', async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ ...open, id: i + 1, title: `설문 ${i + 1}` }))
    const { container } = await setup(many)
    const table = container.querySelector('.rtable__table')
    const count = () => within(table).getAllByRole('link', { name: '설문조사 하러가기' }).length
    expect(count()).toBe(10)
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(count()).toBe(2)
  })

  it('empty, failed and malformed responses', async () => {
    const first = await setup([])
    expect(screen.getByText('진행 중인 설문조사가 없습니다.')).toBeInTheDocument()
    first.unmount()

    const second = await setup('<html></html>')
    expect(screen.getByText('진행 중인 설문조사가 없습니다.')).toBeInTheDocument()
    second.unmount()

    axios.get.mockRejectedValue(new Error('down'))
    render(<MemoryRouter><SurveyPage /></MemoryRouter>)
    expect(await screen.findByText('설문조사를 불러오지 못했습니다.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 실패 확인** — `npm run test -- --run src/pages/client/survey src/components/Header.test.jsx` → FAIL
- [ ] **Step 3: `SurveyPage.jsx`, `SurveyPage.css`를 구현하고 `App.jsx` 라우트, `Header.jsx` 항목을 추가한다.** 페이지 루트가 자기 좌우 여백을 갖는다(`NoticePage.css`의 `.notice-page` 값과 같은 토큰).
- [ ] **Step 4: 통과 확인** — 위 명령 + `npm run test -- --run src/test/cssCollisions.test.js` PASS
- [ ] **Step 5: 헤더 폭 확인** — `npm run dev`로 1024px, 1280px 폭에서 메뉴 7개가 한 줄인지 본다. 넘치면 `Header.css`에서 `.main-nav` 항목 간격을 한 단계 작은 토큰으로 줄인다. 확인하지 못했으면 최종 보고에 그렇게 적는다.
- [ ] **Step 6: 커밋** — `[feat] 설문조사 목록 페이지와 헤더 탭 추가`

---

### Task 5: 프론트 — 상세 페이지

**Files:**
- Create: `src/pages/client/survey/SurveyDetailPage.jsx`, `src/pages/client/survey/SurveyDetailPage.css`
- Modify: `src/App.jsx` (`/surveys/:id`)
- Test: `src/pages/client/survey/SurveyDetailPage.test.jsx`

**Interfaces:**
- Consumes: `getSurveyBadge`, `isSafeSurveyLink` (Task 3), `formatNoticeDate`
- Produces: `SurveyDetailPage` default export. CSS 클래스는 모두 `survey-detail` 블록(`survey-detail__title`, `__meta`, `__chips`, `__chip`, `__cta`, `__content`, `__link`, `__actions`, `__missing`).

화면 순서(스펙 4.5): `h1` 제목 → 메타(작성자, 작성일, 조회수, 마감일 `~ 2026.11.20` 또는 `상시`, 상태 배지) → 칩 → CTA → 본문 → `목록으로` 버튼.
- CTA: 진행중이고 링크가 안전하면 `<Button as="a" size="lg" block className="survey-detail__cta" href target="_blank" rel="noopener noreferrer">설문조사 하러가기</Button>`. 마감이면 `<Button size="lg" block disabled className="survey-detail__cta">마감된 설문입니다</Button>`.
- 본문: `white-space: pre-wrap; overflow-wrap: anywhere`. URL 자동 링크는 `content.split(/(https?:\/\/[^\s]+)/g)`로 나눠 URL 조각만 `<a className="survey-detail__link" target="_blank" rel="noopener noreferrer">`.
- 요청: `axios.get(/api/surveys/${id}, { params: { increment: 'true' } })`. StrictMode 이중 실행으로 조회수가 두 번 오르지 않게 `useRef`로 처리한 id를 기억한다(`NoticeDetailPage.jsx`와 같은 방식).
- 실패(404 포함): `<div className="survey-detail__missing">`에 `존재하지 않거나 삭제된 설문조사입니다.`와 `목록으로` 버튼.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import SurveyDetailPage from './SurveyDetailPage'

vi.mock('axios')
vi.mock('@/components/icons/LucianIcon', () => ({ default: (p) => <span data-icon={p.name} /> }))

const survey = {
  id: 7, title: '학식 만족도 조사', content: '참여 부탁드려요\n문의 https://example.com/help 로',
  link_url: 'https://forms.example.com/7', deadline: '2099-12-31', duration: '3분', reward: '기프티콘',
  author: '여정 학생회', views: 5, is_public: true, date: '2026-11-01', is_closed: false,
}

const setup = () => render(
  <MemoryRouter initialEntries={['/surveys/7']}>
    <Routes>
      <Route path="/surveys/:id" element={<SurveyDetailPage />} />
      <Route path="/surveys" element={<p>목록 페이지</p>} />
    </Routes>
  </MemoryRouter>
)

describe('SurveyDetailPage', () => {
  beforeEach(() => vi.resetAllMocks())

  it('fetches once with increment and puts the CTA between the title and the body', async () => {
    axios.get.mockResolvedValue({ data: survey })
    setup()
    const title = await screen.findByRole('heading', { level: 1, name: '학식 만족도 조사' })
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith('/api/surveys/7', { params: { increment: 'true' } })
    const cta = screen.getByRole('link', { name: '설문조사 하러가기' })
    expect(cta).toHaveAttribute('href', 'https://forms.example.com/7')
    expect(cta).toHaveAttribute('target', '_blank')
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer')
    const body = screen.getByText(/참여 부탁드려요/)
    expect(title.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(cta.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText('3분')).toBeInTheDocument()
    expect(screen.getByText('기프티콘')).toBeInTheDocument()
    expect(screen.getByText('~ 2099.12.31')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://example.com/help' })).toHaveAttribute('target', '_blank')
  })

  it('closed survey shows a disabled button and no survey link', async () => {
    axios.get.mockResolvedValue({ data: { ...survey, deadline: '2026-01-01', is_closed: true } })
    setup()
    expect(await screen.findByRole('button', { name: '마감된 설문입니다' })).toBeDisabled()
    expect(screen.queryByRole('link', { name: '설문조사 하러가기' })).toBeNull()
  })

  it('no deadline shows 상시; unsafe link is never rendered', async () => {
    axios.get.mockResolvedValue({ data: { ...survey, deadline: null, link_url: 'javascript:alert(1)' } })
    const { container } = setup()
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByText('상시').length).toBeGreaterThan(0)
    expect(container.querySelector('a[href^="javascript"]')).toBeNull()
  })

  it('missing survey shows a notice with a way back', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } })
    setup()
    expect(await screen.findByText('존재하지 않거나 삭제된 설문조사입니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '목록으로' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 실패 확인** — `npm run test -- --run src/pages/client/survey/SurveyDetailPage.test.jsx` → FAIL
- [ ] **Step 3: 구현하고 라우트를 추가한다.**
- [ ] **Step 4: 통과 확인** — 위 명령 + cssCollisions PASS
- [ ] **Step 5: 커밋** — `[feat] 설문조사 상세 페이지 추가`

---

### Task 6: 프론트 — 홈 카드

**Files:**
- Create: `src/components/HomeSurveyCard.jsx`
- Modify: `src/pages/HomePage.jsx`, `src/pages/HomePage.css`
- Test: `src/pages/HomePage.test.jsx` (추가)

**Interfaces:**
- Consumes: `getSurveyBadge`, `toSurveyList` (Task 3)
- Produces: `HomeSurveyCard({ surveys })` — `surveys`가 빈 배열이면 `null`. `<Card as="section" className="home-survey-card" aria-labelledby="home-survey-heading">`.

구현 규칙(스펙 4.6):
- `HomePage`에 `const [surveys, setSurveys] = useState([])`. 기존 `useEffect` 안에서 `axios.get('/api/surveys')` → `toSurveyList(res.data).filter((s) => !s.is_closed).slice(0, 3)`. `catch`는 `setSurveys([])`만 하고 `setIsServerDown`을 건드리지 않는다.
- 카드: 제목줄 `<h2 id="home-survey-heading" className="home-survey-heading">심심하세요? 설문조사 하실래요?</h2>` + `<Link to="/surveys" className="home-survey-more">더보기 →</Link>`. 목록 `<ul className="home-survey-list">`의 각 `<li>`는 `<Link to={/surveys/${id}} className="home-survey-link">` 안에 제목 span과 `Badge`.
- 공지보다 약하게: 제목 `font-size: var(--fs-body)`(공지 카드 `h2`는 `--fs-sub`), 행 세로 패딩은 공지 행보다 한 단계 작은 토큰, 강조 배경색 없음.
- 레이아웃: `home-grid`의 자식 구조를 다음으로 바꾼다.

  ```jsx
  <div className="home-grid">
    <div className="home-main">
      <Card as="section" className="notice-card">…</Card>
      <HomeSurveyCard surveys={surveys} />
    </div>
    <aside className="home-aside">…(dday-card, insta-card 그대로)</aside>
  </div>
  ```

  ```css
  /* 모바일: 두 래퍼를 풀어 공지 → D-Day → 설문 → 인스타 순으로 */
  .home-main, .home-aside { display: contents; }
  .notice-card { order: 1; }
  .dday-card { order: 2; }
  .home-survey-card { order: 3; }
  .insta-card { order: 4; }

  @media (min-width: 768px) {
    .home-main { display: flex; flex-direction: column; gap: var(--space-6); min-width: 0; }
    .home-aside { display: flex; }
    .notice-card, .dday-card, .home-survey-card, .insta-card { order: 0; }
  }
  ```

  기존 `.home-aside` 기본 규칙(`display: flex; flex-direction: column; gap`)은 768px 미디어쿼리 안에서 유지되도록 옮기거나 재선언한다. 모바일 간격은 `.home-grid`의 `gap`이 담당한다. `aside` 요소에 `display: contents`를 쓰면 일부 브라우저에서 보조 기술이 랜드마크를 잃을 수 있으니, 모바일에서 D-Day 카드와 인스타 카드가 여전히 읽히는지만 확인한다.

- [ ] **Step 1: 실패하는 테스트를 추가한다** — `HomePage.test.jsx`의 `describe` 안

```jsx
  describe('survey card', () => {
    const mk = (id, over = {}) => ({ id, title: `설문 ${id}`, deadline: null, is_closed: false, link_url: 'https://f.example.com', ...over })
    const withSurveys = (impl) => axios.get.mockImplementation((url) => {
      if (url === '/api/notices') return Promise.resolve({ data: notices })
      if (url === '/api/surveys') return impl()
      return Promise.resolve({ data: [] })
    })

    it('lists at most 3 open surveys after the notice card, with links', async () => {
      withSurveys(() => Promise.resolve({ data: [mk(1), mk(2, { is_closed: true }), mk(3), mk(4), mk(5)] }))
      const { container } = renderHome()
      const heading = await screen.findByRole('heading', { name: '심심하세요? 설문조사 하실래요?' })
      const card = heading.closest('.home-survey-card')
      const links = within(card).getAllByRole('link')
      expect(links.map((a) => a.getAttribute('href'))).toEqual(['/surveys', '/surveys/1', '/surveys/3', '/surveys/4'])
      const notice = container.querySelector('.notice-card')
      expect(notice.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(container.querySelector('.home-main').contains(card)).toBe(true)
    })

    it.each([
      ['no open surveys', () => Promise.resolve({ data: [mk(1, { is_closed: true })] })],
      ['malformed response', () => Promise.resolve({ data: '<html></html>' })],
      ['request failure', () => Promise.reject(new Error('down'))],
    ])('hidden on %s, and the home page still renders', async (_, impl) => {
      withSurveys(impl)
      const { container } = renderHome()
      await screen.findByText('오늘 공지')
      await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/surveys'))
      expect(container.querySelector('.home-survey-card')).toBeNull()
      expect(screen.queryByText('여정은 지금 점검 중!')).toBeNull()
    })
  })
```

- [ ] **Step 2: 실패 확인** — `npm run test -- --run src/pages/HomePage.test.jsx` → 새 테스트 FAIL, 기존 테스트 PASS
- [ ] **Step 3: 구현한다.**
- [ ] **Step 4: 통과 확인** — `npm run test -- --run src/pages/HomePage.test.jsx src/test/cssCollisions.test.js` 전부 PASS (기존 HomePage 테스트 포함)
- [ ] **Step 5: 커밋** — `[feat] 홈에 설문조사 카드 추가`

---

### Task 7: 프론트 — 관리자 목록과 사이드바

**Files:**
- Create: `src/pages/admin/AdminSurveyListPage.jsx`, `src/pages/admin/AdminSurvey.css`
- Modify: `src/layouts/adminNav.js` (`공지사항` 항목 다음에 `{ to: '/admin/surveys', label: '설문조사', icon: 'check' }`)
- Modify: `src/App.jsx` (`/admin/surveys`)
- Test: `src/pages/admin/AdminSurveyListPage.test.jsx`, `src/layouts/adminNav.test.js`(없으면 생성)

**Interfaces:**
- Consumes: `getSurveyBadge`, `toSurveyList` (Task 3)
- Produces: `AdminSurveyListPage` default export. CSS 클래스 `admin-survey-list`, `admin-survey-title`, `admin-survey-title__text`, `admin-survey-actions`, `admin-survey-icon-btn`. `AdminSurvey.css`는 Task 8과 공유한다.

화면 규칙(스펙 4.7):
- 로그인 확인과 조회는 `AdminNoticeListPage.jsx`와 같은 흐름: `localStorage.isAdmin` 없으면 alert 후 `/admin`으로. `axios.get('/api/surveys', { params: { include_private: 'true' } })`.
- `PageHeader title="설문조사 관리"`, actions에 `<Button as={Link} to="/admin/surveys/write"><Plus /> 새 설문 등록</Button>`.
- `ResponsiveTable breakpoint="lg"`, `empty="등록된 설문조사가 없습니다."`, `rowProps`로 비공개 행에 `data-private="true"`.
- 열: 제목(primary, `title` 속성에 전체 제목) / 상태(`getSurveyBadge`) / 공개(`<Badge tone="done">공개</Badge>` 또는 `<Badge tone="overdue">미공개</Badge>`) / 마감일(`deadline ?? '-'`) / 작성일 / 조회수 / 관리.
- 관리 열은 모든 관리자에게 보인다. 수정 버튼(`aria-label="{제목} 수정"`, `/admin/surveys/edit/{id}`로 이동)은 항상, 삭제 버튼(`aria-label="{제목} 삭제"`)은 `localStorage.adminRole === 'master'`일 때만.
- 삭제: `window.confirm('정말 삭제하시겠습니까? (삭제 시 복구 불가)')` → `axios.delete(/api/surveys/${id})` → 목록에서 제거. 실패 시 `alert('삭제 중 오류가 발생했습니다.')`.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import AdminSurveyListPage from './AdminSurveyListPage'
import { getAdminNav } from '@/layouts/adminNav'

vi.mock('axios')

const rows = [
  { id: 1, title: '공개 설문', is_public: true, is_closed: false, deadline: null, date: '2026-11-01', views: 3 },
  { id: 2, title: '숨긴 설문', is_public: false, is_closed: true, deadline: '2026-01-01', date: '2026-10-01', views: 0 },
]
const setup = () => render(<MemoryRouter><AdminSurveyListPage /></MemoryRouter>)

describe('AdminSurveyListPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('adminRole', 'master')
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
    axios.get.mockResolvedValue({ data: rows })
  })

  it('loads including private posts and shows status badges', async () => {
    const { container } = setup()
    expect((await screen.findAllByText('숨긴 설문')).length).toBeGreaterThan(0)
    expect(axios.get).toHaveBeenCalledWith('/api/surveys', { params: { include_private: 'true' } })
    expect(screen.getAllByText('미공개').length).toBeGreaterThan(0)
    expect(screen.getAllByText('마감').length).toBeGreaterThan(0)
    expect(container.querySelector('[data-private="true"]')).not.toBeNull()
    expect(screen.getByRole('link', { name: /새 설문 등록/ })).toHaveAttribute('href', '/admin/surveys/write')
  })

  it('master can delete; the row disappears', async () => {
    axios.delete.mockResolvedValue({ data: {} })
    const user = userEvent.setup()
    setup()
    await user.click((await screen.findAllByRole('button', { name: '공개 설문 삭제' }))[0])
    expect(axios.delete).toHaveBeenCalledWith('/api/surveys/1')
    await waitFor(() => expect(screen.queryByText('공개 설문')).toBeNull())
  })

  it('sub admin sees edit but not delete', async () => {
    localStorage.setItem('adminRole', 'sub')
    setup()
    expect((await screen.findAllByRole('button', { name: '공개 설문 수정' })).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: '공개 설문 삭제' })).toBeNull()
  })
})

describe('adminNav', () => {
  it('shows 설문조사 right after 공지사항 for every role', () => {
    for (const role of ['master', 'sub']) {
      const items = getAdminNav(role).flatMap((g) => g.items)
      const i = items.findIndex((x) => x.to === '/admin/notices')
      expect(items[i + 1]).toMatchObject({ to: '/admin/surveys', label: '설문조사' })
    }
  })
})
```

- [ ] **Step 2: 실패 확인** — `npm run test -- --run src/pages/admin/AdminSurveyListPage.test.jsx` → FAIL
- [ ] **Step 3: 구현하고 `adminNav.js`, `App.jsx`를 수정한다.**
- [ ] **Step 4: 통과 확인** — 위 명령 + `src/layouts` + cssCollisions PASS
- [ ] **Step 5: 커밋** — `[feat] 관리자 설문조사 목록과 사이드바 항목 추가`

---

### Task 8: 프론트 — 관리자 작성/수정

**Files:**
- Create: `src/pages/admin/AdminSurveyWritePage.jsx`
- Modify: `src/pages/admin/AdminSurvey.css`, `src/App.jsx` (`/admin/surveys/write`, `/admin/surveys/edit/:id`)
- Test: `src/pages/admin/AdminSurveyWritePage.test.jsx`

**Interfaces:**
- Consumes: `isSafeSurveyLink` (Task 3)
- Produces: `AdminSurveyWritePage` default export. CSS 클래스 `admin-survey-write`, `admin-survey-form`, `admin-survey-form__row`, `admin-survey-form__error`, `admin-survey-form__actions`.

폼 규칙(스펙 4.7):
- `PageHeader title`은 `새 설문조사 등록` / `설문조사 수정`. `Card as="form"`.
- 입력란(`Field`의 label → input id): `제목`(`survey-title`), `설문 링크`(`survey-link`, `type="url"`, placeholder `https://`), `마감일`(`survey-deadline`, `type="date"`, hint `비워 두면 상시 설문으로 표시됩니다.`), `예상 소요시간`(`survey-duration`, placeholder `3분`, `maxLength=30`), `보상`(`survey-reward`, placeholder `추첨 기프티콘`, `maxLength=50`), `내용`(`survey-content`, textarea), `Toggle label="공개"`(`id="survey-public"`, 새 글 기본 켜짐).
- `<form noValidate>`로 브라우저 기본 검증을 끄고 직접 검증한다. 오류는 `<p role="alert" className="admin-survey-form__error">`에 한 줄로 보여준다.
  - 제목·링크·내용 중 하나라도 공백뿐 → `제목, 설문 링크, 내용은 필수입니다.`
  - `!isSafeSurveyLink(link)` → `설문 링크는 http:// 또는 https://로 시작해야 합니다.`
- 전송 본문(JSON): `{ title, content, link_url, deadline, duration, reward, is_public }`. 문자열은 trim, `deadline`은 빈 문자열 그대로 보낸다.
- 등록 `axios.post('/api/surveys', body)`, 수정 `axios.put(/api/surveys/${id}, body)`. 성공 시 `/admin/surveys`로 이동. 실패 시 `err.response?.data?.error ?? '저장 중 오류가 발생했습니다.'`를 오류 줄에 보여주고 입력값을 유지한다. 전송 중에는 제출 버튼을 `disabled`로 둔다(중복 등록 방지).
- 수정 모드: `axios.get(/api/surveys/${id}, { params: { increment: 'false' } })`로 채운다. `null` 값은 빈 문자열로. 실패 시 alert `설문조사를 불러오지 못했습니다.` 후 목록으로.
- 버튼: `취소`(목록으로), 제출 `등록` / `수정 저장`.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import AdminSurveyWritePage from './AdminSurveyWritePage'

vi.mock('axios')

const setup = (path = '/admin/surveys/write') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/admin/surveys/write" element={<AdminSurveyWritePage />} />
      <Route path="/admin/surveys/edit/:id" element={<AdminSurveyWritePage />} />
      <Route path="/admin/surveys" element={<p>목록 페이지</p>} />
    </Routes>
  </MemoryRouter>
)

async function fill(user, { title = '제목', link = 'https://forms.example.com/a', content = '내용' } = {}) {
  if (title) await user.type(screen.getByLabelText('제목'), title)
  if (link) await user.type(screen.getByLabelText('설문 링크'), link)
  if (content) await user.type(screen.getByLabelText('내용'), content)
}

describe('AdminSurveyWritePage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('adminRole', 'sub')
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('posts trimmed JSON with defaults and returns to the list', async () => {
    axios.post.mockResolvedValue({ data: {} })
    const user = userEvent.setup()
    setup()
    expect(screen.getByRole('switch', { name: '공개' })).toBeChecked()
    await fill(user, { title: '  제목  ' })
    await user.type(screen.getByLabelText('예상 소요시간'), '3분')
    await user.click(screen.getByRole('button', { name: '등록' }))
    await screen.findByText('목록 페이지')
    expect(axios.post).toHaveBeenCalledWith('/api/surveys', {
      title: '제목', content: '내용', link_url: 'https://forms.example.com/a',
      deadline: '', duration: '3분', reward: '', is_public: true,
    })
  })

  it('blocks missing required fields and bad links before sending', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: '등록' }))
    expect(screen.getByRole('alert')).toHaveTextContent('제목, 설문 링크, 내용은 필수입니다.')
    await fill(user, { link: 'forms.example.com' })
    await user.click(screen.getByRole('button', { name: '등록' }))
    expect(screen.getByRole('alert')).toHaveTextContent('설문 링크는 http:// 또는 https://로 시작해야 합니다.')
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('shows the server error and keeps the input', async () => {
    axios.post.mockRejectedValue({ response: { status: 400, data: { error: '입력 길이를 초과했습니다.' } } })
    const user = userEvent.setup()
    setup()
    await fill(user)
    await user.click(screen.getByRole('button', { name: '등록' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('입력 길이를 초과했습니다.')
    expect(screen.getByLabelText('제목')).toHaveValue('제목')
    expect(screen.queryByText('목록 페이지')).toBeNull()
  })

  it('edit mode loads without counting a view, fills the form and PUTs', async () => {
    axios.get.mockResolvedValue({ data: {
      id: 3, title: '기존', content: '기존 내용', link_url: 'https://f.example.com/3',
      deadline: '2026-12-01', duration: null, reward: '기프티콘', is_public: false,
    } })
    axios.put.mockResolvedValue({ data: {} })
    const user = userEvent.setup()
    setup('/admin/surveys/edit/3')
    await waitFor(() => expect(screen.getByLabelText('제목')).toHaveValue('기존'))
    expect(axios.get).toHaveBeenCalledWith('/api/surveys/3', { params: { increment: 'false' } })
    expect(screen.getByLabelText('마감일')).toHaveValue('2026-12-01')
    expect(screen.getByLabelText('예상 소요시간')).toHaveValue('')
    expect(screen.getByRole('switch', { name: '공개' })).not.toBeChecked()
    await user.click(screen.getByRole('button', { name: '수정 저장' }))
    await screen.findByText('목록 페이지')
    expect(axios.put.mock.calls[0][0]).toBe('/api/surveys/3')
    expect(axios.put.mock.calls[0][1]).toMatchObject({ title: '기존', deadline: '2026-12-01', duration: '', is_public: false })
  })

  it('a slow save cannot be submitted twice', async () => {
    let resolve
    axios.post.mockReturnValue(new Promise((r) => { resolve = r }))
    const user = userEvent.setup()
    setup()
    await fill(user)
    const submit = screen.getByRole('button', { name: '등록' })
    await user.click(submit)
    expect(submit).toBeDisabled()
    await user.click(submit)
    expect(axios.post).toHaveBeenCalledTimes(1)
    resolve({ data: {} })
    await screen.findByText('목록 페이지')
  })
})
```

- [ ] **Step 2: 실패 확인** — `npm run test -- --run src/pages/admin/AdminSurveyWritePage.test.jsx` → FAIL
- [ ] **Step 3: 구현하고 라우트 두 개를 추가한다.**
- [ ] **Step 4: 통과 확인** — 위 명령 + cssCollisions PASS
- [ ] **Step 5: 커밋** — `[feat] 관리자 설문조사 작성·수정 페이지 추가`

---

### Task 9: 전체 검증과 로컬 확인

**Files:**
- Modify: `Trip_Portal_FE/tools/local-backend/seed_dev_data.py` (설문 3건 시드: 마감 임박 1, 상시 1, 마감 지남 1. 공지 시드와 같은 방식으로, 이미 있으면 건너뛴다)
- Modify: `Trip_Portal_FE/README.md`, `Trip_Portal_BE/README.md` (라우트/API 목록에 설문조사 한 줄씩. 해당 목록이 없으면 건드리지 않는다)

- [ ] **Step 1: 백엔드 전체 테스트** — `Trip_Portal_BE`에서 `python -m pytest -q` → 전부 PASS
- [ ] **Step 2: 프론트 전체** — `npm run test -- --run` → 전부 PASS, `npm run lint` → 오류 0, `npm run build` → 성공
- [ ] **Step 3: 로컬 수동 확인** — `tools/local-backend`의 안내대로 로컬 백엔드를 띄우고 시드를 넣은 뒤 `VITE_API_TARGET=http://localhost:5000 npm run dev`. 확인 항목:
  1. 헤더 `설문조사` 탭 → 목록. 진행중 행의 버튼이 새 탭으로 열리고 마감 행은 흐리게, 맨 아래.
  2. 상세: 제목 바로 아래 버튼. 마감 글은 비활성 버튼.
  3. 홈: 1280px에서 공지 아래, 375px에서 D-Day 아래·인스타 위. 진행중 설문을 모두 비공개로 바꾸면 카드가 사라진다.
  4. 관리자: sub로 등록·수정 가능, 삭제 버튼 없음. master로 삭제 가능. 사이드바 항목 표시.
  5. 헤더 메뉴가 1024px, 1280px에서 한 줄.
  
  브라우저로 직접 확인하지 못한 항목은 최종 보고에 "미확인"으로 적는다.
- [ ] **Step 4: 커밋** — 프론트 `[docs] 설문조사 로컬 시드와 문서 추가`, 백엔드는 README를 바꿨을 때만 `[docs] 설문조사 API 문서 추가`
- [ ] **Step 5: 마무리** — 두 저장소의 `git log --oneline origin/main..HEAD`와 테스트 결과를 보고한다. 푸시·병합은 사용자 결정에 맡긴다. 배포는 백엔드 먼저(스펙 6절).

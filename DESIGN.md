---
name: 공과대학 학생회 [여정] 홈페이지
description: 정돈된 네이비. 그라데이션 네이비 헤더와 흰 카드, 선 아이콘 위주의 학생회 포털.
colors:
  navy-900: "#001f3f"
  navy-700: "#004085"
  saegil: "#3986c6"
  sky: "#a9d0f5"
  bg: "#f8f9fa"
  surface: "#ffffff"
  border: "#e5e7eb"
  text: "#333333"
  text-muted: "#6b7280"
  gray-50: "#f9fafb"
  gray-100: "#f3f4f6"
  gray-200: "#e5e7eb"
  gray-300: "#d1d5db"
  gray-400: "#9ca3af"
  gray-500: "#6b7280"
  gray-600: "#4b5563"
  gray-700: "#374151"
  gray-800: "#1f2937"
  gray-900: "#111827"
  tone-pending-bg: "#fff3d6"
  tone-pending-fg: "#b45309"
  tone-ongoing-bg: "#dbeafe"
  tone-ongoing-fg: "#1d4ed8"
  tone-overdue-bg: "#fee2e2"
  tone-overdue-fg: "#b91c1c"
  tone-done-bg: "#dcfce7"
  tone-done-fg: "#15803d"
  tone-new-bg: "#fee2e2"
  tone-new-fg: "#dc2626"
  tone-pinned-bg: "#dbeafe"
  tone-pinned-fg: "#1d4ed8"
typography:
  title:
    fontFamily: "'Pretendard GOV Variable', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 700
  sub:
    fontFamily: "'Pretendard GOV Variable', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 600
  body:
    fontFamily: "'Pretendard GOV Variable', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Pretendard GOV Variable', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  control: "10px"
  card: "12px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "28px"
  "8": "32px"
  "9": "36px"
  "10": "40px"
  "11": "44px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.navy-700}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.navy-900}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.navy-700}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.gray-50}"
  button-danger:
    backgroundColor: "{colors.tone-overdue-fg}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-lg:
    padding: "0 24px"
    height: "52px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "16px"
  badge:
    backgroundColor: "{colors.gray-100}"
    textColor: "{colors.gray-700}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 12px"
  field-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "44px"
  admin-nav-item:
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  admin-nav-item-active:
    backgroundColor: "{colors.navy-700}"
---

# Design System: 공과대학 학생회 [여정] 홈페이지

2026-10-21 전체 리디자인(`redesign/2026-campus`, main 병합 완료)의 결과를 현재 코드 기준으로 정리한 문서다. 값의 원본은 `src/styles/tokens.css`와 `src/components/ui/ui.css`이고, 이 문서와 코드가 다르면 코드가 맞다. 페이지별 배치와 기능 유지 항목은 `docs/superpowers/specs/2026-10-21-site-redesign-design.md`에 있다.

## Overview

**Creative North Star: "정돈된 네이비"**

그라데이션 네이비 헤더, 밝은 회색 바탕 위의 흰 카드, 선 아이콘이 기본이다. 움직이는 컬러 아이콘은 주요 진입점과 상태 변화에만 포인트로 쓴다. 리디자인의 전제는 "다른 사이트가 됐다"는 느낌이 들지 않는 것이어서 로고, 네이비 메인 컬러, Pretendard GOV, 메뉴 구성은 그대로 유지한다.

사용자는 대학생이고 대부분 휴대폰으로 들어온다. 사용자 페이지는 모바일(360px)에서 먼저 완성하고 넓은 화면으로 확장한다. 관리자 페이지는 데스크톱이 기준이되 모바일에서도 조회와 처리가 가능해야 한다.

**Key Characteristics:**
- 네이비 두 단계(900, 700)가 브랜드와 주요 액션을 맡고, 새길 블루는 포커스와 강조에만 쓴다.
- 표면은 흰 카드 한 종류다. 1px 경계선과 옅은 그림자로 바탕과 구분한다.
- 상태는 배경·글자 색 쌍으로 된 알약 배지로 표시한다.
- 누를 수 있는 것은 모두 최소 44×44px이다.
- 라이트 테마 전용이다(`color-scheme: light`).

## Colors

네이비 계열 브랜드색 넷, 차가운 회색 중립, 의미가 고정된 상태색 여섯 쌍으로 구성한다.

### Primary
- **딥 네이비** (`navy-900`): 헤더 그라데이션의 시작색, 관리자 사이드바와 상단바 배경, 페이지 제목과 카드 제목 글자, primary 버튼의 hover.
- **네이비** (`navy-700`): primary 버튼 배경, ghost 버튼 글자, 켜진 토글, 사이드바의 현재 메뉴, 헤더 그라데이션의 끝색.

### Secondary
- **새길 블루** (`saegil`): 포커스 링, ghost 버튼 hover 경계선, 스피너의 회전 호. 넓은 면에는 쓰지 않는다.
- **스카이** (`sky`): 네이비 배경 위에서만 쓴다. 헤더 메뉴 hover, 사이드바 그룹 라벨, 관리자 상단바 로고.

### Neutral
- **바탕** (`bg`): 페이지 배경.
- **표면** (`surface`): 카드, 입력칸, 하단 바.
- **경계선** (`border`): 카드와 표의 1px 선. `gray-200`과 같은 값이다.
- **본문 글자** (`text`)와 **보조 글자** (`text-muted`): 설명, 메타 정보, 빈 상태 문구는 보조 글자를 쓴다.
- **회색 50~900**: 표 머리 배경(50), 표 행 구분선과 기본 배지 배경(100), 입력칸 경계선과 꺼진 토글(300), 빈 상태 아이콘(400), 라벨 글자(700, 800).

### 상태색
배경과 글자를 항상 쌍으로 쓴다.

| 톤 | 의미 | 사용처 |
|---|---|---|
| `pending` (주황) | 신청 | 대여 상태 `신청` |
| `ongoing` (파랑) | 대여 중 | 대여 상태 `미반납`, 반납기한 당일까지 |
| `overdue` (빨강) | 연체 | 대여 상태 `미반납`, 반납기한 다음 날부터. danger 버튼 배경도 이 글자색을 쓴다 |
| `done` (초록) | 완료 | 대여 상태 `반납완료` |
| `new` (빨강) | 새 글 | 작성 3일 이내 공지의 NEW 배지, 사이드바 승인 대기 건수 |
| `pinned` (파랑) | 고정 | 고정 공지 배지 |

### Named Rules
**상태 값 그대로 규칙.** 백엔드 상태 값(`신청`, `미반납`, `반납완료`)은 화면에 글자 그대로 표시하고 색만 정한다. `미반납`은 반납기한(대여일 + 4일) 당일까지 파랑, 그다음 날부터 빨강이다. 그 외 값은 중립 배지로 표시한다.

**네이비 위 스카이 규칙.** 스카이는 네이비 배경 위의 글자와 hover에만 쓴다. 흰 표면에서는 대비가 부족하다.

## Typography

**글꼴:** Pretendard GOV Variable 한 가지를 전체에 쓴다(가변 100~900, `/fonts/PretendardGOVVariable.woff2`, `font-display: swap`). 대체 글꼴은 시스템 산세리프다.

### Hierarchy
세 단계 크기가 토큰으로 있고 `≥1024px`에서 한 단계씩 커진다.

| 역할 | 토큰 | 모바일 | `≥1024px` | 굵기 | 사용처 |
|---|---|---|---|---|---|
| 페이지 제목 | `--fs-title` | 22px | 26px | 700 | `PageHeader` 제목 |
| 소제목 | `--fs-sub` | 18px | 20px | 600 | 빈 상태 제목, lg 버튼 |
| 본문 | `--fs-body` | 15px | 16px | 400 (버튼·라벨은 600) | 본문, 버튼, 표, 필드 라벨 |
| 라벨 | 없음 | 13px | 13px | 600 | 배지, 필드 힌트 |

- 기본 줄간격은 1.5다. 공지 본문은 1.7이고 데스크톱 최대 폭은 720px이다.
- 입력칸 글자는 화면 폭과 관계없이 16px이다. iOS에서 포커스할 때 화면이 확대되지 않게 하기 위해서다.
- 한글 줄바꿈은 `word-break: keep-all`과 `overflow-wrap: break-word`로 단어 단위를 지킨다.

## Layout

- **중단점**: `≥768px` 태블릿, `≥1024px` 데스크톱. 사용자 페이지 CSS는 모바일 기본 스타일에 `min-width` 미디어쿼리를 더한다.
- **간격**: 4px 단위 토큰(`--space-1`=4px … `--space-12`=48px, `--space-16`=64px). 카드 안쪽 여백은 모바일 16px, `≥768px` 24px이다.
- **사용자 셸**: 높이 70px(`--header-h`)의 고정 헤더, 본문, 푸터, 떠 있는 SNS 버튼. 본문 좌우 여백은 모바일 16px, `≥768px` 32px이다. 헤더 메뉴는 `<1024px`에서 햄버거와 오른쪽 슬라이드 패널로 바뀐다.
- **관리자 셸**: `≥1024px`에서 왼쪽 네이비 사이드바(펼침 240px, 접힘 72px)와 본문(여백 32px)의 2열 격자다. `<1024px`에서는 56px 상단바와 왼쪽 서랍(260px, 최대 85vw)이 되고 본문 여백은 16px이다. `/admin*`에는 푸터가 없다.
- **표와 카드 전환**: 목록은 넓은 화면에서 표, 좁은 화면에서 카드 목록으로 보여준다. 전환 지점은 사용자 페이지 768px, 관리자 페이지 1024px이다.
- **하단 액션 바**: 모바일에서는 화면 아래에 고정하고 safe-area 여백을 더한다. `≥768px`에서는 본문 흐름 안의 오른쪽 정렬 버튼 줄이 된다.
- **홈 배치**: 모바일은 히어로와 바로가기 → 학교 링크 칩(가로 스크롤) → 공지 → D-Day → 인스타 순으로 쌓는다. 데스크톱은 공지를 왼쪽 넓은 열에, D-Day와 인스타를 오른쪽 열에 둔다.
- **쌓임 순서**: 사용자 헤더 100, 관리자 서랍 60, 하단 액션 바 50, 관리자 상단바 30.
- 360px에서 가로 스크롤이 없어야 한다. 각 페이지 루트가 자기 좌우 여백을 책임진다.

## Elevation & Depth

평면에 가깝다. 깊이는 흰 표면, 1px 경계선, 네이비 기운이 도는 옅은 그림자 두 단계로만 만든다.

### Shadow Vocabulary
- **`--shadow-sm`** (`0 1px 3px rgba(0, 31, 63, 0.08)`): 카드, 카드형 목록 항목, 토글 손잡이.
- **`--shadow-md`** (`0 4px 15px rgba(0, 31, 63, 0.1)`): 고정 헤더처럼 본문 위에 떠 있는 것.
- **하단 바** (`0 -2px 8px rgba(0, 31, 63, 0.08)`): 모바일 고정 액션 바의 위쪽 그림자.

모달과 서랍 뒤에는 반투명 검정 오버레이를 깐다(관리자 서랍 `rgba(0, 0, 0, 0.45)`).

## Shapes

둥글기는 세 가지뿐이다.
- **카드** (12px, `--radius-card`): 카드, 카드형 목록 항목.
- **컨트롤** (10px, `--radius-control`): 버튼, 입력칸, 사이드바 메뉴, 아이콘 버튼.
- **알약** (999px, `--radius-pill`): 배지, 건수 표시, 토글 트랙.

경계선은 1px 실선이다. 고정 공지는 모바일 카드 왼쪽의 파란 띠로 구분한다.

## Components

공통 컴포넌트는 `src/components/ui/`에 있고 `index.js`에서 내보낸다. 스타일은 `ui.css` 한 파일이며 모든 선택자가 `ui-*` 클래스에서 시작한다.

### Button
- **모양**: 컨트롤 둥글기(10px), 최소 44×44px, 좌우 여백 16px, 본문 크기에 굵기 600.
- **primary**: 네이비 배경에 흰 글자, hover는 딥 네이비.
- **ghost**: 투명 배경에 네이비 글자와 회색 경계선. hover는 `gray-50` 배경과 새길 블루 경계선.
- **danger**: 연체 빨강 배경에 흰 글자, hover는 밝기 0.9.
- **크기와 폭**: `lg`는 높이 52px, 좌우 24px, 소제목 크기. `block`은 가로 전체.
- **비활성**: 투명도 0.5, `not-allowed` 커서. `as`로 Link나 a로 렌더링할 수 있다.
- **전환**: 배경, 경계선, 글자색 0.15초.

### Card
흰 표면, 1px 경계선, 12px 둥글기, `--shadow-sm`. 안쪽 여백 16px(`≥768px` 24px).

### Badge
알약 모양, 13px 굵기 600, 줄바꿈 없음. tone은 `pending`, `ongoing`, `overdue`, `done`, `new`, `pinned`, `neutral`(회색 100 배경, 회색 700 글자)이다.

### Field
라벨이 입력칸 위에 고정된 래퍼다(input, select, textarea). 입력칸은 최소 높이 44px, `gray-300` 경계선, 10px 둥글기, 글자 16px. 라벨은 굵기 600의 `gray-800`, 힌트는 13px 보조 글자.

### PageHeader
제목(페이지 제목 크기, 굵기 700, 딥 네이비), 설명(보조 글자), 오른쪽 액션 슬롯. 모바일은 세로로 쌓고 `≥768px`에서 한 줄로 양끝 정렬한다.

### ResponsiveTable
`columns`와 `rows`를 받아 넓은 화면에서는 표, 좁은 화면에서는 카드 목록으로 그린다. `rtable--md`는 768px, `rtable--lg`는 1024px에서 전환한다. 표 머리는 `gray-50` 배경에 `gray-700` 글자, 행 구분선은 `gray-100`. 카드는 제목 한 줄 아래에 항목명(왼쪽, 보조 글자)과 값(오른쪽 정렬)을 나열한다.

### BottomBar
모바일 하단 고정 액션 바. 흰 표면, 위쪽 경계선과 그림자, safe-area 여백. 안의 버튼은 폭을 똑같이 나눈다. `≥768px`에서는 고정을 풀고 오른쪽에 정렬한다.

### Toggle
44×26px 알약 트랙에 20px 흰 손잡이. 꺼짐은 `gray-300`, 켜짐은 네이비. 터치 영역은 44px이고 실제 checkbox input을 유지한다.

### EmptyState와 Spinner
- **EmptyState**: 가운데 정렬, `gray-400` 아이콘, 소제목 크기 제목, 보조 글자 설명. 빈 결과와 오류 안내에 쓴다.
- **Spinner**: 24px 고리(3px 선, 새길 블루 호)가 0.8초에 한 바퀴 돈다. `prefers-reduced-motion`에서는 2.4초로 늦춘다.

### Navigation
- **사용자 헤더**: 135도 네이비 그라데이션(`navy-900` → `navy-700`), 높이 70px, 상단 고정, `--shadow-md`. 메뉴 글자는 흰색 굵기 500에 투명도 0.9, hover는 스카이. `<1024px`에서는 햄버거를 누르면 오른쪽 슬라이드 패널이 열리고 '대여사업' 하위 메뉴는 펼침형이다. 데스크톱은 드롭다운이다.
- **관리자 사이드바**: 딥 네이비 배경. 메뉴 항목은 높이 44px, 10px 둥글기, 15px 글자(흰색 85%). hover는 흰색 8% 배경, 현재 메뉴는 네이비 배경에 굵기 700. 그룹 라벨은 12px 굵기 700의 스카이. 승인 대기 건수는 빨간 알약 배지다. 접으면 아이콘만 남고 툴팁으로 이름을 보여준다. 접힘 상태는 `localStorage['adminSidebarCollapsed']`에 저장한다.
- **관리자 서랍** (`<1024px`): 왼쪽에서 0.2초로 미끄러져 나온다. 배경을 누르거나, 메뉴를 고르거나, Esc를 누르면 닫힌다.

### 아이콘
두 종류를 역할로 나눠 쓴다.
- **Lucian Icons** (움직임과 컬러): `src/components/icons/LucianIcon.jsx` 래퍼로만 쓴다. 모듈은 `src/vendor/lucian-icons/`에 필요한 것만 들여온다. 사용처는 홈 바로가기, 대여 완료 체크, 공지 첨부 다운로드, 관리자 사이드바 주요 메뉴, 승인 대기 벨, 점검 화면 렌치, 관리자 로그인 자물쇠, 로그 엑셀 다운로드다.
- **lucide-react** (정적 선 아이콘): 검색, 화살표, 닫기, 메뉴, 메타 정보(조회수, 작성일, 첨부), 표 액션(수정, 삭제) 등 나머지 일반 UI 전부.
- 장식용이면 `label`을 주지 않는다(래퍼가 `aria-hidden`을 붙인다). 단독으로 의미가 있으면 한국어 `label`을 준다.
- 상태가 있는 아이콘(벨, 다운로드 등)은 실제 상태가 바뀔 때만 상태를 바꾼다. 클릭했다고 성공으로 표시하지 않는다.

### 포커스와 움직임
- 포커스 링은 전역 `:focus-visible`에 새길 블루 2px, 간격 2px이다. 안쪽에 그려야 하는 항목만 간격 -2px을 쓴다.
- 전환은 0.15~0.25초의 색, 투명도, transform 변화뿐이다.
- `prefers-reduced-motion`이면 애니메이션을 멈추거나 늦춘다.

## Do's and Don'ts

### Do:
- **Do** 색, 간격, 둥글기, 그림자, 글자 크기는 `tokens.css`의 변수로 쓴다.
- **Do** 버튼, 카드, 배지, 입력칸, 표, 빈 상태, 로딩은 `src/components/ui/`의 컴포넌트를 먼저 쓴다.
- **Do** 사용자 페이지는 모바일 기본 스타일을 먼저 쓰고 `min-width: 768px`, `min-width: 1024px`로 확장한다.
- **Do** 누를 수 있는 모든 요소를 최소 44×44px로 만든다.
- **Do** 관리자 페이지 전용 클래스에는 `admin-` 접두사를 붙이고, 페이지 전용 클래스는 페이지 루트 아래로 범위를 좁힌다.
- **Do** 360, 768, 1280px에서 가로 스크롤이 없는지 확인한다.

### Don't:
- **Don't** 이모지를 아이콘으로 쓰지 않는다. 리디자인에서 모두 Lucian과 lucide로 교체했다.
- **Don't** 같은 이름의 클래스를 두 CSS 파일에 정의하지 않는다. CSS가 한 번들로 합쳐져 나중 파일이 이긴다. `src/test/cssCollisions.test.js`가 이를 검사한다.
- **Don't** `ui.css`에 `ui-*`로 시작하지 않는 선택자를 넣지 않는다.
- **Don't** Tailwind 유틸리티 클래스를 쓰지 않는다. 일반 CSS와 `className` 방식이다.
- **Don't** 예전 변수(`--main-navy`, `--second-navy`, `--saegil-blue`, `--background-color`, `--border-radius`, `--box-shadow`)를 새 코드에 쓰지 않는다. 티저 페이지 호환용으로만 남아 있다. 삭제하지도 않는다.
- **Don't** `index.css`의 shadcn용 oklch 변수와 티저 페이지(`/teaser`) 스타일을 건드리지 않는다. 리디자인 범위 밖이다.
- **Don't** 색만으로 상태를 전달하지 않는다. 배지에는 항상 상태 글자가 들어간다.

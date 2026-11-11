# Trip Portal FE 작업 안내

## 디자인 작업

화면을 만들거나 고치기 전에 [DESIGN.md](DESIGN.md)를 먼저 읽는다. 색, 간격, 둥글기, 글자 크기, 공통 컴포넌트, 아이콘 규칙이 모두 거기에 있다. 값의 원본은 `src/styles/tokens.css`와 `src/components/ui/ui.css`이고, 문서와 코드가 다르면 코드가 맞다. 디자인을 바꿨으면 같은 커밋에서 DESIGN.md도 고친다.

페이지별 배치와 기능 유지 항목은 `docs/superpowers/specs/2026-10-21-site-redesign-design.md`에 있다.

### 디자인 스킬 세 가지

스킬은 이 저장소에 들어 있지 않다. 각자 환경에 설치해서 쓰고, 어느 스킬을 쓰든 DESIGN.md가 기준이다.

| 스킬 | 쓰는 때 | 이 저장소에서 지킬 것 |
|---|---|---|
| `impeccable` | 화면 다듬기, 점검, 비평, 디자인 문서 갱신 | 프로젝트 루트의 DESIGN.md를 읽는다. 상위 폴더를 작업 폴더로 열었다면 이 저장소의 DESIGN.md 경로를 직접 알려준다. 문서를 다시 만들 때는 `document` 명령을 쓴다. |
| `frontend-design` | 새 화면이나 새 컴포넌트를 만들 때 | 새 색, 새 글꼴, 새 둥글기를 들이지 않는다. DESIGN.md의 "정돈된 네이비" 톤과 토큰 안에서 만든다. |
| `lucian-icons` | 움직이는 컬러 아이콘을 추가하거나 바꿀 때 | 모듈은 `src/vendor/lucian-icons/`에 필요한 것만 들여오고 `src/components/icons/LucianIcon.jsx` 래퍼로만 쓴다. 그 밖의 일반 UI 아이콘은 `lucide-react`를 쓴다. |

### 코드 규칙

- 공통 UI는 `src/components/ui/`의 컴포넌트를 먼저 쓴다. `ui.css`의 선택자는 모두 `ui-*` 클래스에서 시작한다.
- 관리자 페이지 전용 클래스에는 `admin-` 접두사를 붙인다.
- 같은 이름의 클래스를 두 CSS 파일에 정의하지 않는다. `src/test/cssCollisions.test.js`가 검사한다.
- 사용자 페이지는 모바일 우선으로 쓰고 `min-width: 768px`, `min-width: 1024px`로 확장한다.
- Tailwind 유틸리티 클래스를 쓰지 않는다.

## 검증

- 테스트: `npm run test -- --run`
- 빌드와 린트: `npm run build`, `npm run lint`
- 개발 프록시의 기본 대상은 운영 API다. 데이터를 바꾸는 요청은 운영 서버에 보내지 않는다. 로컬 백엔드로 확인할 때는 `VITE_API_TARGET=http://localhost:5000 npm run dev`를 쓴다(`tools/local-backend/` 참고).

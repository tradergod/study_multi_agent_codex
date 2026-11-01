Status: DRAFT
Owner: Builder Planner
Inputs: docs/MVP_SPEC.md (Product Specifier [HANDOFF] §10), docs/researcher/RESEARCH_REPORT.md (§5,§7 [HANDOFF]), CLAUDE.md §2/§2.1/§11.1
Last Updated: 2026-07-29
Related Decisions/Requirements: REQ-001~007, DEC-001(오른쪽 고정 패널, 확정)·DEC-002(새로고침 후 선택 유지 안 함, 확정)·DEC-003(데스크톱 전용, 확정 — 반응형/모바일 대응 없음)

# INDEX_HTML_ARCHITECTURE

단일 standalone `index.html` 하나의 내부 구조. React/Vue/npm/bundler/별도 CSS·JS 파일 없음. 순수 DOM API + 정적 JS 배열 + CSS Grid/Flexbox만 사용(Researcher §5,§6 근거).

## 0. 이 문서의 역할

여기서 확정한 **공유 표면**(state 필드 전체, CSS custom properties, selector, 섹션 앵커, 함수 시그니처)은 **TASK-001(App Shell)에서 동결**된다. 이후 모든 worktree Task는 이 표면을 변경하지 않고 자기 앵커 블록 **안**만 채운다. Tester는 이 문서의 selector만으로 테스트를 짤 수 있어야 한다.

---

## 1. 전체 파일 골격 트리

```text
index.html
├─ <head>
│   ├─ <meta charset>, <meta viewport>, <title>
│   └─ <style>                          ← CSS 전부 여기 임베드
│       /* ==== STYLE: RESET ==== */
│       /* ==== STYLE: VARIABLES ==== */
│       /* ==== STYLE: LAYOUT ==== */
│       /* ==== STYLE: HEADER ==== */
│       /* ==== STYLE: LIST ==== */
│       /* ==== STYLE: DETAIL ==== */
│       /* ==== STYLE: STATUS ==== */
│       (RESPONSIVE 섹션 없음 — DEC-003 확정: 데스크톱 전용, 반응형 미구현. POST_MVP-7 참고)
├─ <body>
│   ├─ <!-- ==== SECTION: HEADER ==== -->   #app-header
│   ├─ <div id="app-main">                  2-column grid container
│   │   ├─ <!-- ==== SECTION: LIST ==== -->    #app-list
│   │   └─ <!-- ==== SECTION: DETAIL ==== -->  #detail-panel
│   ├─ <!-- ==== SECTION: STATUS ==== -->   #status-bar (선택 요소, MVP 필수 아님)
│   └─ <script>                          ← JS 전부 여기 임베드
│       // ==== JS: DATA ====            mock 배열 + state 객체 (동결)
│       // ==== JS: DOM_REFS ====        querySelector 참조 (동결)
│       // ==== JS: RENDER ====          renderList/renderDetail/renderApp
│       // ==== JS: INTERACTION ====     selectRequest, 이벤트 핸들러
│       // ==== JS: PERSISTENCE ====     safeLocalStorage 래퍼, 복원/저장
│       // ==== JS: INIT ====            DOMContentLoaded 초기화
```

- `<head>`의 `<style>` 하나, `<body>` 끝의 `<script>` 하나. 파일은 끝까지 이 하나의 `index.html`.
- 섹션 앵커 주석은 **삭제·이동 금지**. 각 Task는 자기 앵커 시작~끝 사이만 채운다.

---

## 2. DOM 영역 · selector · 표시 조건 (동결 — Tester가 그대로 사용)

| 영역 | Selector | Role/속성 | 표시 조건 |
|---|---|---|---|
| 앱 제목 | `#app-header h1` | — | 항상 표시 |
| 목록 컨테이너 | `#app-list` | `role="listbox"`, `aria-label="요청 목록"` | 항상 존재 |
| 목록 항목 | `.request-item[data-id="{id}"]` | `role="option"`, `tabindex="0"`, `aria-selected` | `state.requests` 각 항목당 1개, 개수 0이면 렌더 안 함 |
| 목록 항목 제목 | `.request-item .request-title` | — | 항목 존재 시 항상 |
| 목록 항목 우선순위 배지 | `.request-item .priority-badge` | `data-priority="P0\|P1\|P2"` | 항목 존재 시 항상 |
| 목록 빈 상태 안내 | `#app-list-empty` | — | `state.requests.length === 0`일 때만 표시, 그 외 `display:none`/DOM 미부착 |
| 상세 패널 컨테이너 | `#detail-panel` | `role="region"`, `aria-label="상세 정보"` | 항상 존재 |
| 상세 placeholder(초기/빈 공용) | `#detail-placeholder` | — | `state.selectedId === null`일 때 표시(초기 상태·빈 데이터 상태 공용, 문구는 §4 상태표 참고) |
| 상세 콘텐츠 | `#detail-content` | — | `state.selectedId !== null`일 때만 표시 |
| 우선순위 필드 | `#detail-priority` | — | `#detail-content` 표시 시 |
| 리뷰 필요 여부 필드 | `#detail-needs-review` | `data-needs-review="true"\|"false"`(REQ-002a, Product Specifier [REVISION_REQUEST] 반영, 2026-07-29 — 표시 문구와 무관하게 항상 이 속성을 가져야 함, 자동 테스트가 문구가 아닌 속성값으로 검증) | `#detail-content` 표시 시 |
| 담당 필드 | `#detail-assignee` | — | `#detail-content` 표시 시 |
| 다음 액션 필드 | `#detail-next-action` | — | `#detail-content` 표시 시 |
| 요약 상태바(선택) | `#status-bar` | — | 항상 표시 가능(있으면 좋음, MVP 필수 아님) |

- `#detail-placeholder`와 `#detail-content`는 항상 정확히 하나만 화면에 보인다(둘 다 DOM에는 존재, `hidden` 속성 또는 `display:none` 토글로 상호 배타 — 구현은 wt-ui가 `renderDetail()`에서 담당).
- 선택 표시 스타일: `.request-item.is-selected` 클래스 + `aria-selected="true"`(REQ-006, §8 접근성).

---

## 3. CSS 섹션 (데스크톱 전용, DEC-003 확정 — 반응형 분기 없음)

`<style>` 내부는 아래 순서·책임으로 나눈다(각 Task는 자기 앵커 안만 수정).

| 섹션 | 담당 | 책임 |
|---|---|---|
| `RESET` | TASK-001 | box-sizing, margin/padding 초기화, 기본 폰트 |
| `VARIABLES` | TASK-001 | `:root` custom properties(§4) — **동결, 이후 Task는 값 참조만** |
| `LAYOUT` | TASK-001(뼈대) → TASK-002 세부 | `#app-main`을 CSS Grid `grid-template-columns: minmax(280px, 360px) 1fr;`로 2-컬럼 고정(Researcher §5 CSS Grid 근거, **DEC-001 확정: 오른쪽 고정 패널**). 화면 폭이 좁아져 컬럼이 압축될 경우를 대비해 `#app-main`에 `overflow-x: auto` **1줄만** 안전장치로 둔다(별도 breakpoint 전환 로직 아님, DEC-003 확정 범위 안) |
| `HEADER` | TASK-002(wt-ui) | 헤더 타이포·여백 |
| `LIST` | TASK-002(wt-ui) | 목록 스크롤, 항목 카드 스타일, `.is-selected` 강조, 우선순위 배지 색상(`data-priority` 값별 `var(--color-p0/p1/p2)`) |
| `DETAIL` | TASK-002(wt-ui) | 상세 패널 내부 레이아웃, placeholder 문구 스타일 |
| `STATUS` | TASK-002(wt-ui) | 상태바 스타일(선택 요소) |

**RESPONSIVE 섹션 없음(DEC-003 확정, 2026-07-29 갱신):** 사용자가 BLOCKER Q-005에 A안(데스크톱 전용)으로 확정 답변해, 이전 버전에 있던 별도 `RESPONSIVE` CSS 섹션·`matchMedia`/`@media` breakpoint 전환 설계를 **MVP 범위에서 완전히 제거**한다. 좁은 화면 대응(목록↔상세 전환 등)은 **POST_MVP-7**로 명확히 분리되며, 이번 worktree 4개 구성·Task 범위에는 포함되지 않는다. 향후 POST_MVP-7이 승격되면 새 CSS 섹션과 `state.mobileView` 필드가 필요하므로 그 시점에 TASK-001부터 재동결해야 한다(현재는 해당 없음).

---

## 4. 상태 객체 스키마 (동결 — TASK-001에서 완전히 채워짐)

```js
// ==== JS: DATA ====
const state = {
  // 정적 mock 데이터, 완전 하드코딩 5~8개 항목, P0/P1/P2 골고루 섞임 (MVP_SPEC §6)
  requests: [
    { id: "1", title: "PR #123: 로그인 리팩터링", priority: "P0", needsReview: true,  assignee: "김도윤",   nextAction: "테스트 케이스 보완 후 재요청" },
    { id: "2", title: "Issue #45: 결제 실패 로그 누락",   priority: "P0", needsReview: true,  assignee: "미배정",   nextAction: "담당자 배정 필요" },
    { id: "3", title: "PR #130: 다크모드 스타일 적용",     priority: "P1", needsReview: false, assignee: "이서연",   nextAction: "머지 대기" },
    { id: "4", title: "Issue #52: 알림 중복 발송",         priority: "P1", needsReview: true,  assignee: "박지훈",   nextAction: "재현 스텝 확인 중" },
    { id: "5", title: "PR #128: API 응답 캐싱",            priority: "P2", needsReview: false, assignee: "최민서",   nextAction: "다음 스프린트로 이동" },
    { id: "6", title: "Issue #60: 문서 오타 수정",          priority: "P2", needsReview: true,  assignee: "미배정",   nextAction: "리뷰어 배정 필요" },
  ],
  // 선택된 요청 id(string) 또는 null(미선택). 정확히 0개 또는 1개만 선택 가능.
  selectedId: null,
};
```

- 필드 추가/삭제/이름 변경은 **동결 위반** — 필요하면 `[REVISION_REQUEST]`로 Builder Planner에 요청.
- 빈 상태(REQ-003) 검증: **자동 회귀는 `index.html?empty=1` URL로 접속**(§7 `initApp()` 참고, Tester [REVISION_REQUEST] 반영·제안 A 채택). 코드 수정 없이 브라우저 주소창 쿼리 파라미터만으로 재현 가능. 별도 수동 절차로 `state.requests`를 직접 빈 배열로 바꿔보는 방법도 여전히 유효하나(코드 편집 필요), 자동 테스트는 URL 파라미터 방식을 기본으로 한다.

### CSS custom properties (동결)

```css
/* ==== STYLE: VARIABLES ==== */
:root {
  --color-bg: #f5f6f8;
  --color-surface: #ffffff;
  --color-border: #d9dce1;
  --color-text: #1a1d23;
  --color-muted: #6b7280;
  --color-p0: #d64545; /* 빨강 계열 - 최우선 */
  --color-p1: #d99a2b; /* 주황 계열 */
  --color-p2: #3a7bd5; /* 파랑 계열 */
  --color-selected-bg: #eef3ff;
  --color-selected-border: #3a7bd5;
  --list-col-width: minmax(280px, 360px);
}
```

---

## 5. 렌더링 함수 목록 (책임)

| 함수 | 담당 Task | 책임 | 입력 | 부수효과 |
|---|---|---|---|---|
| `renderList()` | TASK-002(wt-ui) | `state.requests`로 `#app-list` 내부 항목 DOM을 (재)생성, `state.requests.length===0`이면 `#app-list-empty`만 표시 | `state.requests`, `state.selectedId`(선택 강조용) | `#app-list` innerHTML 갱신 |
| `renderDetail()` | TASK-002(wt-ui) | `state.selectedId`로 `#detail-placeholder` vs `#detail-content` 토글, 콘텐츠면 4필드 채움. `#detail-needs-review`는 표시 문구와 별개로 `data-needs-review="true"\|"false"` 속성을 항상 설정(REQ-002a) | `state.selectedId`, `state.requests` | `#detail-panel` 하위 갱신 |
| `renderApp()` | TASK-001(동결, 본문은 TASK-002가 채움 아님 — 단순 dispatcher이므로 TASK-001에서 완성) | `renderList()` + `renderDetail()` 순서 호출하는 단일 진입점 | 없음 | 없음(호출만) |

## 6. 상태 전이 · 이벤트 함수 목록 (책임)

| 함수 | 담당 Task | 책임 | 트리거 |
|---|---|---|---|
| `selectRequest(id)` | TASK-003(wt-interaction) | `state.selectedId = id` 갱신 후 `renderApp()` 호출. 이미 선택된 id 재호출 시 **아무 것도 하지 않음**(재클릭 무효과, MVP_SPEC §4 확정) | 클릭/키보드 핸들러에서 호출 |
| `handleListClick(event)` | TASK-003(wt-interaction) | 클릭된 `.request-item`의 `data-id`를 찾아 `selectRequest(id)` 호출 | `#app-list`에 위임된 `click` 리스너 |
| `handleListKeydown(event)` | TASK-003(wt-interaction) | 포커스된 `.request-item`에서 Enter/Space 시 `selectRequest(id)` 호출. 포커스는 이동시키지 않음(§8 접근성 요구) | `#app-list`에 위임된 `keydown` 리스너 |
| `attachListEventListeners()` | TASK-003(wt-interaction) — **본문 전체를 TASK-003이 소유**(Reviewer C-3 반영, 2026-07-29) | `#app-list` 컨테이너 1개에 `click`/`keydown` 리스너를 위임 등록(`handleListClick`/`handleListKeydown` 연결). 리스너 등록 코드는 **오직 이 함수 안에만** 위치한다 — `initApp()` 본문에는 이 함수를 호출하는 줄 외에 리스너 등록 코드를 추가하지 않는다 | `initApp()` 안에서 TASK-001이 이미 넣어둔 호출 1줄로 호출됨(§7 참고) |

## 7. localStorage · 초기화 함수 목록 (책임)

| 함수 | 담당 Task | 책임 |
|---|---|---|
| `safeLocalStorageGet(key)` | TASK-004(wt-persistence) | `try/catch`로 `localStorage.getItem` 감싸 실패 시 `null` 반환(REQ-007) |
| `safeLocalStorageSet(key, value)` | TASK-004(wt-persistence) | `try/catch`로 `localStorage.setItem` 감싸 실패해도 앱이 죽지 않게 함(REQ-007) |
| `initApp()` | TASK-001이 **호출부 골격을 완전히 동결**(아래 참고), 데이터/상태 로직 본문은 TASK-004가 채움. **TASK-003은 이 함수를 절대 수정하지 않음(Reviewer C-3 반영)** | 페이지 로드 시: (**DEC-002 확정 — 유지 안 함**) `state.selectedId`를 항상 `null`로 시작. **REQ-003 자동 회귀 테스트 지원(Tester [REVISION_REQUEST] 반영, 2026-07-29):** `new URLSearchParams(location.search).get('empty') === '1'`이면 `state.requests = []`로 덮어쓴 뒤 `renderApp()` 호출(제안 A 채택, 전역 테스트 훅 노출 방식은 채택 안 함). 이 분기는 오직 빈 상태 재현용이며 §2 제약(백엔드·비밀키 없음)과 무관한 순수 클라이언트 조건문. → `renderApp()` 호출. **DEC-002가 확정이므로 `safeLocalStorageGet`으로 선택 id를 복원하는 코드는 이 MVP에서 작성하지 않는다(§9 참고, 재조정 불필요)** |

### 7.1 이벤트 리스너 등록 위치 확정 (Reviewer C-3 반영, 2026-07-29)

**리스너 등록 호출 라인은 정확히 하나이며, `initApp()` 안에 위치하고 TASK-001이 골격 단계에서 이미 써 넣는다.** 즉:

```js
// ==== JS: INIT ==== (TASK-001이 아래 구조를 동결. attachListEventListeners() 호출 줄 자체는 TASK-001 소유)
function initApp() {
  // ---- 아래 본문은 TASK-004(wt-persistence) 소유, TASK-003은 이 함수를 열지 않음 ----
  // (state.selectedId 초기화, ?empty=1 처리, safeLocalStorage 관련 로직 등)

  attachListEventListeners(); // ← TASK-001이 이미 넣어둔 고정 호출 1줄. TASK-003/TASK-004 둘 다 이 줄을 수정하지 않는다.

  renderApp();
}
```

- `attachListEventListeners()` **함수 본문**은 TASK-003(wt-interaction)이 전담 소유(§6 표).
- `initApp()` **함수 본문 전체**(호출 1줄 제외한 나머지 로직)는 TASK-004(wt-persistence)가 전담 소유.
- TASK-003은 `initApp()` 파일 블록에 어떤 줄도 추가·수정하지 않는다 — 이전 버전 문서의 "INIT 블록 내 1줄 추가는 허용" 표현은 **폐기**한다. TASK-003이 만드는 것은 오직 `attachListEventListeners()`라는 별도 함수의 본문뿐이다.
- 이 함수 시그니처(`attachListEventListeners`)는 TASK-001이 §1 골격 단계에서 빈 함수로 미리 선언해둔다(다른 동결 함수와 동일한 방식) — TASK-004가 `initApp()`을 채우는 시점에 이미 존재하므로 호출이 실패하지 않는다.

- 초기화 순서: `DOMContentLoaded` → `initApp()` → (`state` 읽기 → `attachListEventListeners()` → `renderApp()`).
- DEC-002 확정(새로고침 후 선택 유지 안 함)에 따라 `safeLocalStorageGet/Set`이 선택 상태 저장에 **실제로 호출되지는 않지만**, REQ-007(localStorage 접근 실패해도 핵심 기능 유지)을 만족시키기 위해 래퍼 함수 자체는 반드시 구현하고, 상세 패널에 접근하는 어떤 향후 저장 로직도 이 래퍼를 거치도록 구조를 남겨둔다.

---

## 8. 접근성 속성 지점

- `#app-list` → `role="listbox"`.
- 각 `.request-item` → `role="option"`, `tabindex="0"`, `aria-selected="true|false"`(선택 여부에 따라 `renderList()`가 갱신).
- `#detail-panel` → `role="region"`, `aria-label="상세 정보"`.
- `#app-header h1`이 페이지의 유일한 `<h1>`. `#app-list` 앞에 `<h2>`(예: "요청 목록"), `#detail-panel` 앞에 `<h2>`(예: "상세 정보").
- `selectRequest()`/`handleListKeydown()`은 포커스를 임의로 이동시키지 않는다(클릭·Enter한 항목에 포커스 유지, MVP_SPEC §8).

---

## 9. 결정 확정 이력 (2026-07-29 갱신 — Q-001/Q-002/Q-005 전부 확정, 재조정 불필요)

**사용자가 BLOCKER 3건 모두 권장안(A안)으로 확정 답변함(docs/DECISION_LOG.md DEC-001~003). 아래 표는 과거 "재조정 지점"이었던 항목을 확정 결과로 정리한 이력이다 — 더 이상 조건부가 아니며, 이 문서의 다른 절(§2/§3/§7 등)이 이미 확정값 기준으로 갱신되어 있다.**

| 결정 | 확정값 | 상태 | 비고 |
|---|---|---|---|
| Q-001 (상세 배치) → **DEC-001** | 오른쪽 고정 패널, `#app-main` CSS Grid 2-컬럼 | **확정됨, 재조정 불필요** | B안(Drawer/`<dialog>`) 관련 서술은 §12 CHALLENGE 절에 참고용 역사 기록으로만 남겨두며, 실제 구현에는 적용되지 않는다 |
| Q-002 (새로고침 후 선택 유지) → **DEC-002** | 유지 안 함 — `initApp()`은 항상 `state.selectedId = null`로 시작, `safeLocalStorageGet`으로 선택 id를 복원하는 코드는 **작성하지 않는다** | **확정됨, 재조정 불필요** | `safeLocalStorageGet/Set` 래퍼 자체는 REQ-007(오류 복원력) 목적으로 계속 구현하되, 선택 상태 저장/복원에는 연결하지 않는다 |
| Q-005 (모바일 지원) → **DEC-003** | **데스크톱 전용 확정 — 반응형/모바일 대응 없음.** `state.mobileView` 같은 신규 상태 필드, `matchMedia`/`@media` breakpoint 전환, `wt-responsive` worktree는 전부 **MVP 범위 밖(POST_MVP-7)** | **확정됨, 재조정 불필요** | §3에서 CSS `RESPONSIVE` 섹션 자체를 제거함. TASK-002 CSS 책임에서도 반응형 분기를 제외함(TASK_BREAKDOWN.md 갱신) |

---

## 10. 테스트 가능한 selector 목록 (Tester용 요약)

```text
#app-header h1
#app-list                      (role=listbox)
.request-item[data-id]         (role=option, tabindex=0, aria-selected)
.request-item .request-title
.request-item .priority-badge[data-priority]
#app-list-empty
#detail-panel                  (role=region)
#detail-placeholder
#detail-content
#detail-priority
#detail-needs-review              (data-needs-review="true"|"false", REQ-002a)
#detail-assignee
#detail-next-action
#status-bar (선택)
```

## 11. `[HANDOFF]`

**→ Tester**
[HANDOFF] 위 §2 selector 표, §5~7 함수 책임, §10 selector 목록을 그대로 테스트 대상으로 사용할 것을 요청. 특히: (1) 선택 전/후 `#detail-placeholder`↔`#detail-content` 배타 토글, (2) `.request-item.is-selected` + `aria-selected` 동시 갱신, (3) 재클릭 무효과(상태 불변), (4) `state.requests=[]` 수동 조건에서 `#app-list-empty` 노출, (5) 키보드 Enter/Space로 선택 가능 여부. REQ-007(localStorage 실패 허용)은 자동화가 어려우므로 수동 검토 후보로 분류 요청.

**→ Reviewer**
[HANDOFF] 구현 복잡도 낮음(순수 DOM + CSS Grid, 외부 라이브러리 없음). 단일 파일 통합 위험 지점: (1) `#app-main` CSS Grid 값은 TASK-001에서만 정의·동결되므로 wt-ui가 값을 바꾸면 다른 앵커와 충돌 없음(별도 섹션이라 안전), (2) `renderApp()`은 TASK-001에서 이미 완성되므로 wt-ui/wt-interaction이 이 함수 시그니처를 변경하면 안 됨 — Reviewer가 병합 시 dispatcher 함수 미변경 여부 확인 권장. **(2026-07-29 갱신) §9는 Q-001/002/005가 DEC-001~003으로 전부 확정되어 더 이상 조건부가 아님 — Reviewer 최종 승인 시 이 문서가 "확정값" 기준으로 일관되게 갱신됐는지만 확인하면 됨(예: RESPONSIVE 섹션 제거, dialog 관련 서술이 역사 기록으로만 남아있는지).**

## 12. `[CHALLENGE]`

[CHALLENGE] → Product Specifier: MVP_SPEC §3 "Status 영역(선택)"은 "있으면 좋음" 수준으로 남아 있으나, 별도 요구사항(REQ) 없이 방치하면 Task 경계가 모호해진다. Builder Planner는 `#status-bar`를 **TASK-002(wt-ui)에 포함된 선택적 1줄 렌더**(`총 {state.requests.length}건`, 정적 텍스트, 이벤트 없음)로 축소 확정하고, 이를 별도 Task로 분리하지 않는다(§2.1 상한 보호). 이 축소에 이견이 있으면 Product Specifier가 `[REVISION_REQUEST]`로 반송할 것.

[CHALLENGE] → Researcher (2026-07-29, **철회·정정됨** — Researcher 반박 수용): 원래 이 자리에는 "Q-001이 B안(Drawer)으로 바뀌면 `<dialog>` 대신 단순 오버레이 `<div>`를 권장한다"는 CHALLENGE가 있었다. Researcher가 최신 근거(jaredcunha.com/blog/html-dialog-getting-accessibility-and-ux-right, css-tricks.com "There Is No Need To Trap Focus On A Dialog Element", W3C APA 최근 결론)로 반박: `showModal()`은 top-layer·`::backdrop`·Esc-close·포커스 관리를 브라우저가 무상 제공하므로 순수 `div`보다 직접 구현해야 할 JS가 오히려 **더 적다**. Builder Planner는 이 반박을 받아들여 판단을 뒤집었다 — 만약 B안이었다면 `<dialog>` + `showModal()`을 채택하고 순수 `<div>` 오버레이안은 폐기했을 것이다. **(2026-07-29 최종 갱신) 사용자가 Q-001을 A안(오른쪽 고정 패널)으로 확정 답변함(DEC-001, §9 참고) — 이 절은 더 이상 유효해질 가능성이 없는 순수 역사 기록이며, 실제 구현·Task 어디에도 `<dialog>`는 사용되지 않는다.**

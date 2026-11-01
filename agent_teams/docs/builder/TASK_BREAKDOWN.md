Status: DRAFT
Owner: Builder Planner
Inputs: docs/builder/INDEX_HTML_ARCHITECTURE.md, docs/builder/IMPLEMENTATION_PLAN.md, docs/MVP_SPEC.md
Last Updated: 2026-07-29
Related Decisions/Requirements: REQ-001~007, DEC-001~003(확정), AC-(Main이 조립 예정), TEST-(Tester 예정)

# TASK_BREAKDOWN

Task 5개, worktree 4개(`wt-ui`/`wt-interaction`/`wt-persistence`/`wt-tests`) + 선행 base Task(TASK-001, worktree 아님). §2.1 상한(worktree 3~4개) 안.

---

## TASK-001 — App Shell (공용 골격, 선행·비병렬)
- Goal: 단일 `index.html`의 전체 골격과 공유 표면(state·CSS 변수·selector·앵커·함수 시그니처)을 확정·동결한다.
- User Value: 이후 모든 기능이 안전하게 병렬 진행될 수 있는 기반. 사용자에게 직접 보이는 기능은 아직 없음(빈 뼈대).
- Input Documents: docs/builder/INDEX_HTML_ARCHITECTURE.md §1~7, docs/MVP_SPEC.md §6(mock 데이터 필드)
- Allowed Code Areas: 파일 전체(최초 생성이므로). 이후 Task를 위해 앵커 주석·함수 시그니처·CSS 변수·state 필드를 전부 배치.
- Forbidden Code Areas: 없음(선행 단계이나, 완료 후에는 이 Task가 만든 시그니처/필드를 스스로도 재변경하지 않는다 — 이후 변경은 [REVISION_REQUEST]로만)
- Dependencies: 없음(최초 Task)
- Implementation Requirements:
  - HTML: `#app-header`(내부에 페이지 유일의 `<h1>`), `#app-main`(grid), `#app-list`(+`#app-list-empty`), `#detail-panel`(+`#detail-placeholder`+`#detail-content`+4개 필드 요소), `#status-bar`
  - **접근성 골격(Reviewer C-2 반영, 2026-07-29 — §8 접근성 요구·TEST-003 대상, 골격 단계 누락 방지 위해 명시): `#app-list` 앞에 `<h2>` 1개(예: "요청 목록"), `#detail-panel` 앞에 `<h2>` 1개(예: "상세 정보") 반드시 포함. 두 `<h2>`는 TASK-001에서 완성하며 이후 Task가 문구만 바꿀 수 있으나 `<h2>` 요소 자체를 삭제하면 안 됨.**
  - CSS: RESET, VARIABLES(§4 custom properties 전부), LAYOUT(2-컬럼 grid 뼈대)
  - JS: `state` 객체(mock 6개 항목 포함, 완전한 값), DOM_REFS, `renderApp()` 완성 본문, `renderList/renderDetail/selectRequest/handleListClick/handleListKeydown/attachListEventListeners/safeLocalStorageGet/safeLocalStorageSet` 시그니처만(빈 본문), **`initApp()`은 시그니처뿐 아니라 `attachListEventListeners()` 호출 줄과 `renderApp()` 호출 줄까지 포함한 골격을 완성**(Reviewer C-3 반영, 2026-07-29 — INDEX_HTML_ARCHITECTURE.md §7.1 코드 예시 그대로). 나머지 `initApp()` 로직(state 초기화, `?empty=1` 처리 등)은 TASK-004가 채움
- Acceptance Criteria: AC(Main 조립 예정) — "index.html을 브라우저로 열면 콘솔 에러 없이 로드되고 §2 selector 전부가 DOM에 존재한다", AC(§8 접근성 — h1 1개·목록/상세 앞 h2 각 1개 존재)
- Required Tests: TEST(Tester 예정) — 정적 구조 검사(즉 DOM에 필수 selector 존재 여부), TEST-003(h1 1개·h2 2개 존재 여부)
- Definition of Done: `index.html`을 브라우저에서 열었을 때 콘솔 에러 없음. `document.querySelector('#app-list')`, `#detail-panel`, `#app-header h1`이 모두 null이 아님. 페이지 전체에 `<h1>`이 정확히 1개, `#app-list` 앞 `<h2>` 1개, `#detail-panel` 앞 `<h2>` 1개 존재. `renderApp()` 호출 시 에러 없음(내부 함수가 빈 본문이어도 무방).
- Codex 붙여넣기 프롬프트:
  "docs/builder/INDEX_HTML_ARCHITECTURE.md 전체를 그대로 따라 index.html 골격을 만들어라. 모든 섹션 앵커 주석과 §4 state 객체(mock 데이터 포함), §2 selector, 함수 시그니처를 정확히 그 이름대로 만들어라. 페이지에 h1은 정확히 1개, 목록 영역 앞과 상세 영역 앞에 각각 h2를 1개씩 넣어라. 함수 본문은 비워도 된다."
- Handoff Target: 모든 worktree(wt-ui/wt-interaction/wt-persistence/wt-tests)가 이 결과를 base로 분기
- Merge Order: 1 (가장 먼저, base 브랜치에 직접)
- Known Risks: RISK-001 — 이 단계에서 selector/state 필드를 잘못 정하면 이후 모든 worktree가 영향받음. 완료 즉시 Tester·Reviewer 검토를 받고서야 worktree를 분기할 것을 권장.

---

## TASK-002 — List & Detail 렌더링 (wt-ui)
- Goal: mock 데이터를 목록으로 렌더링하고, 선택 상태에 따라 상세 패널 내용을 렌더링하는 로직과 그 시각 스타일을 완성한다(REQ-001, REQ-002 표시부, REQ-003, REQ-004, REQ-006 시각 스타일).
- User Value: 사용자가 화면 진입 시 요청 목록과 우선순위 배지를 보고, 상세 영역의 초기 안내 문구를 본다.
- Input Documents: INDEX_HTML_ARCHITECTURE.md §2(selector)·§3(CSS)·§5(렌더 함수), MVP_SPEC.md §3·§5·§6
- Allowed Code Areas: HTML `HEADER`/`LIST`/`DETAIL`/`STATUS` 앵커 내부, CSS `HEADER`/`LIST`/`DETAIL`/`STATUS` 섹션, JS `renderList()`/`renderDetail()` 함수 본문 (**RESPONSIVE 섹션 없음 — DEC-003 확정: 데스크톱 전용, 반응형 미구현. 이 Task 범위에서 제외. POST_MVP-7 참고**)
- Forbidden Code Areas: `state` 객체 필드 추가/변경, `renderApp()` 시그니처, CSS `VARIABLES`/`LAYOUT`(grid-template-columns 값) 변경, `selectRequest`/`handleListClick`/`handleListKeydown`/`safeLocalStorage*`/`initApp` 함수, **`@media`/`matchMedia` 기반 반응형 분기 추가(범위 밖)**
- Dependencies: TASK-001 완료·병합
- Implementation Requirements:
  - `renderList()`: `state.requests`가 비어 있으면 `#app-list-empty`만 표시, 아니면 각 항목을 `.request-item[data-id]`로 렌더(제목 + `.priority-badge[data-priority]`), `state.selectedId`와 비교해 `.is-selected`/`aria-selected` 반영
  - `renderDetail()`: `state.selectedId === null`이면 `#detail-placeholder` 표시("목록에서 항목을 선택하세요" 문구, `state.requests.length===0`일 땐 "표시할 요청이 없습니다" 문구로 교체) + `#detail-content` 숨김. 선택 시 반대로 토글하고 4필드 값 채움. **`#detail-needs-review`는 표시 문구("리뷰 필요"/"리뷰 불필요" 등)와 별개로 항상 `data-needs-review="true"|"false"` 속성을 값에 맞게 설정**(REQ-002a, Product Specifier [REVISION_REQUEST] 반영, 2026-07-29 — 자동 테스트가 문구가 아닌 이 속성으로 검증)
  - 우선순위 배지 색상은 `data-priority` 값에 따라 CSS에서 `var(--color-p0/p1/p2)` 매핑
  - **REQ-002a(Reviewer C-1 재확인, 2026-07-29): `#detail-needs-review` 요소는 화면에 보이는 문구("리뷰 필요"/"리뷰 불필요" 등)와 별개로 `data-needs-review` 속성을 반드시 갖고, 그 값은 선택된 항목의 `needsReview`가 `true`면 `"true"`, `false`면 `"false"`여야 한다. 이 속성 설정 없이 문구만 바꾸는 구현은 완료로 인정하지 않는다.**
- Acceptance Criteria: AC(REQ-001/REQ-002 표시부/REQ-002a/REQ-003/REQ-004/REQ-006)
- Required Tests: TEST(Tester 예정) — 목록 항목 수/배지, placeholder↔content 토글, 선택 스타일 클래스 존재, `#detail-needs-review`의 `data-needs-review` 값이 선택된 항목의 `needsReview`와 일치하는지
- Definition of Done: `#app-list`에 6개 `.request-item`이 렌더되고 각각 `.priority-badge[data-priority]`를 가짐. `#detail-placeholder`가 기본 표시되고 `#detail-content`는 `hidden`. `state.requests=[]`로 바꿨을 때 `#app-list-empty`만 보임. 항목 선택 시 `#detail-needs-review`가 `data-needs-review="true"` 또는 `"false"`를 해당 항목의 `needsReview` 값과 일치하게 갖는다.
- Codex 붙여넣기 프롬프트:
  "docs/builder/INDEX_HTML_ARCHITECTURE.md의 LIST·DETAIL·HEADER·STATUS 앵커 섹션과 renderList()/renderDetail() 함수 본문만 채워라. state 객체, CSS 변수, 다른 함수 시그니처는 수정하지 마라. #app-list, #detail-panel selector 이름을 그대로 유지하라. #detail-needs-review에는 표시 문구와 별개로 data-needs-review=\"true\"|\"false\" 속성을 반드시 설정하라(REQ-002a)."
- Handoff Target: Tester(렌더 결과 selector), wt-interaction(다음 병합 대상, 클릭 대상 요소 구조 제공)
- Merge Order: 2
- Known Risks: RISK-002 — placeholder 문구를 초기/빈 상태에서 다르게 하려다 별도 DOM 요소를 늘리면 wt-interaction과 영역이 겹칠 수 있음. 문구는 텍스트 콘텐츠만 바꾸고 `#detail-placeholder` selector 자체는 유지할 것.

---

## TASK-003 — 선택 상호작용 (wt-interaction)
- Goal: 목록 항목 클릭·키보드(Enter/Space) 선택, 선택 상태 전이(0~1개), 재클릭 무효과를 구현한다(REQ-002 상호작용부, REQ-006 상태갱신, §8 접근성 키보드).
- User Value: 사용자가 항목을 클릭하거나 Tab+Enter로 선택하면 즉시 상세 내용이 바뀐다.
- Input Documents: INDEX_HTML_ARCHITECTURE.md §6(함수 목록)·§8(접근성), MVP_SPEC.md §2 Flow A·§4·§8
- Allowed Code Areas: JS `selectRequest()`, `handleListClick()`, `handleListKeydown()`, **`attachListEventListeners()`**(신규, TASK-003 전담) 함수 본문
- Forbidden Code Areas: `renderList()`/`renderDetail()` 본문, CSS 전체, HTML 마크업 신규 추가, `state` 필드, `safeLocalStorage*` 본문, **`initApp()` 본문(호출 1줄 포함 전체 — Reviewer C-3 반영, 2026-07-29: 이 함수는 TASK-004 전담이며 TASK-003은 절대 열지 않는다. 리스너 등록은 오직 `attachListEventListeners()` 함수 본문 안에서만 한다. 이 함수를 호출하는 한 줄은 TASK-001이 `initApp()` 골격에 이미 넣어두므로 TASK-003이 추가할 코드가 아니다.)**
- Dependencies: TASK-001 완료(코딩 시작 가능, `attachListEventListeners()` 시그니처와 `initApp()` 내 호출 줄이 이미 존재), **병합은 TASK-002 병합 이후**(§3 순차 이유: 통합 테스트 시 실제 렌더된 항목이 있어야 클릭 동작을 눈으로 확인 가능)
- Implementation Requirements:
  - `selectRequest(id)`: `state.selectedId === id`이면 아무 것도 하지 않고 반환(재클릭 무효과 확정 동작). 다르면 `state.selectedId = id` 갱신 후 `renderApp()` 호출
  - `handleListClick(event)`: 클릭 지점에서 가장 가까운 `.request-item` 조회 → `data-id` 추출 → `selectRequest(id)`
  - `handleListKeydown(event)`: `event.key`가 `Enter` 또는 `' '`일 때만 동작, 포커스된 `.request-item`의 `data-id`로 `selectRequest(id)` 호출, 포커스 이동 없음
  - `attachListEventListeners()`: `#app-list` 컨테이너 **1개**에 `click`/`keydown` 리스너를 각 1회씩 위임 등록하고 각각 `handleListClick`/`handleListKeydown`을 연결. 이 함수 밖(즉 `initApp()` 안)에는 리스너 등록 코드를 두지 않는다.
- Acceptance Criteria: AC(REQ-002/REQ-006, §8 키보드)
- Required Tests: TEST(Tester 예정) — 클릭 후 상세 갱신, 키보드 Enter/Space 후 상세 갱신, 재클릭 후 상태 불변, aria-selected 갱신
- Definition of Done: `.request-item`을 클릭하면 해당 요소에 `.is-selected`가 붙고 `#detail-content`가 보이며 4필드 값이 클릭한 항목과 일치한다. 같은 항목을 다시 클릭해도 DOM/상태 변화가 없다. Tab으로 항목에 포커스 후 Enter를 누르면 클릭과 동일한 결과가 된다. 페이지 로드 후 별도 조작 없이도(즉 `initApp()`이 이미 호출해둔 `attachListEventListeners()` 덕에) 첫 클릭부터 정상 동작한다.
- Codex 붙여넣기 프롬프트:
  "docs/builder/INDEX_HTML_ARCHITECTURE.md의 INTERACTION 앵커(selectRequest/handleListClick/handleListKeydown/attachListEventListeners) 본문만 채워라. renderList/renderDetail 함수, CSS, state 필드, initApp() 본문은 절대 수정하지 마라. 리스너 등록은 attachListEventListeners() 안에서만 하라(initApp()은 이미 이 함수를 호출하고 있다). 재클릭 시 아무 효과가 없어야 한다."
- Handoff Target: Tester(상태 전이 시나리오), Reviewer(재클릭 무효과 등 엣지케이스 확인 요청)
- Merge Order: 4 (TASK-002 이후, TASK-004와 코드 영역이 완전히 분리되어 있어 순서 무관하게 독립적이나 본 계획은 TASK-004를 3번으로 앞에 배치)
- Known Risks: RISK-003 — 이벤트 리스너를 `#app-list`에 위임(delegation)하지 않고 각 `.request-item`에 개별 바인딩하면 `renderList()`가 다시 그려질 때(재렌더는 이 MVP에서 선택 변경 시마다 발생) 리스너가 유실될 수 있음. 반드시 `#app-list` 컨테이너에 위임 바인딩할 것.

---

## TASK-004 — localStorage 안전 래퍼 & 데이터 상태 복원력 (wt-persistence)
- Goal: localStorage 접근 실패에도 앱이 깨지지 않도록 안전 래퍼를 구현하고(REQ-007), 페이지 초기화 로직을 완성한다. REQ-003(빈 상태) 자동 회귀 재현을 위한 `?empty=1` URL 분기도 포함한다(Tester [REVISION_REQUEST] 반영, 2026-07-29).
- User Value: 사용자가 프라이빗 브라우징 등으로 localStorage를 못 쓰는 환경이어도 목록/상세 기능이 정상 동작한다.
- Input Documents: INDEX_HTML_ARCHITECTURE.md §7, MVP_SPEC.md §5(오류 상태)·§9(DEC-002 확정)
- Allowed Code Areas: JS `safeLocalStorageGet()`, `safeLocalStorageSet()`, `initApp()` 함수 본문 **전체**(단, `attachListEventListeners();`와 `renderApp();` 호출 두 줄은 TASK-001이 이미 넣어둔 고정 줄이므로 그 순서·존재를 유지한 채 그 앞에 자신의 초기화 로직을 추가 — Reviewer C-3 반영, 2026-07-29, INDEX_HTML_ARCHITECTURE.md §7.1 코드 예시 참고)
- Forbidden Code Areas: `render*`/`select*`/`handleList*`/**`attachListEventListeners()`**(TASK-003 전담, 본문 손대지 않음) 함수, CSS 전체, HTML 마크업, `state` 필드
- Dependencies: TASK-001 완료. 다른 worktree와 코드 영역이 겹치지 않아 TASK-002/003과 완전 독립적으로 병렬 진행 가능.
- Implementation Requirements:
  - `safeLocalStorageGet(key)`: `try { return localStorage.getItem(key); } catch { return null; }`
  - `safeLocalStorageSet(key, value)`: `try { localStorage.setItem(key, value); } catch {}` (실패해도 예외를 밖으로 던지지 않음)
  - `initApp()`: (**DEC-002 확정** — 새로고침 후 선택 유지 안 함) `state.selectedId`를 항상 `null`로 시작. **`new URLSearchParams(location.search).get('empty') === '1'`이면 `state.requests = []`로 덮어쓴다**(REQ-003 자동 회귀용, Tester 제안 A 채택 — 전역 `window.__TEST_HOOKS__` 노출안은 채택 안 함). 이 로직은 TASK-001이 이미 넣어둔 `attachListEventListeners();`/`renderApp();` 호출 줄 **앞에** 추가하고, 그 두 줄 자체는 건드리지 않는다. `safeLocalStorageGet/Set`은 REQ-007(오류 복원력) 목적으로만 구현하며, DEC-002가 확정이므로 선택 상태 저장/복원에는 **연결하지 않는다**(이전 문서의 "향후 Q-002가 바뀌면" 가정형 서술은 폐기).
- Acceptance Criteria: AC(REQ-007), AC(REQ-003 자동 회귀 경로)
- Required Tests: TEST(Tester 예정) — (1) localStorage를 강제로 예외 던지게 만든 상태(수동 또는 mock)에서 목록/상세가 정상 렌더되는지(수동 검토 후보 가능성, Tester 판단), (2) `index.html?empty=1` 접속 시 `#app-list-empty` 노출 및 `#detail-placeholder`가 빈 상태 문구를 보이는지(자동, TEST-007/008)
- Definition of Done: 브라우저 devtools에서 `localStorage.setItem`/`getItem`을 오류를 던지도록 임시로 덮어써도(수동 테스트) 페이지가 에러 없이 목록/상세를 정상 표시한다. `safeLocalStorageGet`/`safeLocalStorageSet` 함수가 `index.html` 안에 존재하고 try/catch로 감싸져 있다. `index.html?empty=1`로 열면 `state.requests`가 빈 배열로 초기화되어 `#app-list-empty`만 보이고 `.request-item`은 0개다. `initApp()` 안의 `attachListEventListeners();`/`renderApp();` 호출 줄은 그대로 남아 있다.
- Codex 붙여넣기 프롬프트:
  "docs/builder/INDEX_HTML_ARCHITECTURE.md의 PERSISTENCE 앵커(safeLocalStorageGet/safeLocalStorageSet)와 INIT 앵커(initApp) 본문을 채워라. attachListEventListeners()와 renderApp() 호출 줄은 이미 존재하니 그대로 두고 그 앞에 초기화 로직만 추가하라. render/selection 함수나 CSS, HTML, attachListEventListeners() 본문은 건드리지 마라. localStorage 접근은 반드시 try/catch로 감싸 실패해도 앱이 죽지 않게 하라. URL에 ?empty=1이 있으면 state.requests를 빈 배열로 초기화하라."
- Handoff Target: Tester(REQ-007 수동 검토 기준), Reviewer(단일 파일 안정성 확인)
- Merge Order: 3
- Known Risks: RISK-004 — **(2026-07-29 갱신: DEC-002 확정으로 해소됨)** Q-002가 B안(유지)으로 바뀔 경우 `initApp()`과 `selectRequest()` 양쪽 재작업이 필요했을 위험이었으나, 사용자가 A안(유지 안 함)으로 확정 답변해 더 이상 해당하지 않음. 참고용 기록으로만 남김.

---

## TASK-005 — 자동 테스트 자산 (wt-tests)
- Goal: `index.html`과 독립된 파일로 자동 테스트/체크리스트 자산을 만든다(Tester 소관 내용을 담을 그릇 — Builder는 selector 계약만 제공, 실제 테스트 작성은 Tester 담당).
- User Value: 없음(내부 품질 보증 자산, 최종 사용자에게 보이지 않음).
- Input Documents: INDEX_HTML_ARCHITECTURE.md §2·§10(selector 목록), docs/tester/TEST_PLAN.md·TEST_CASES.md(Tester 산출)
- Allowed Code Areas: `docs/tester/**` 및 별도 테스트 파일(예: 수동 체크리스트, 브라우저 콘솔에서 실행할 assertion 스크립트) — **`index.html` 자체는 절대 수정하지 않음**
- Forbidden Code Areas: `index.html` 전체
- Dependencies: TASK-001의 selector 계약만 있으면 시작 가능. TASK-002~004의 실제 구현 완료를 기다릴 필요 없이 selector 이름만으로 테스트 케이스를 먼저 작성 가능(진짜 병렬).
- Implementation Requirements: (Tester 소관이므로 Builder는 계약만 명시) 테스트는 §2/§10 selector만 참조, `index.html`의 내부 구현 세부사항(함수 이름 등)에 의존하지 않음
- Acceptance Criteria: 전체 AC의 검증 방법 연결(Tester가 작성)
- Required Tests: 해당 없음(이 Task 자체가 테스트 자산)
- Definition of Done: `index.html`을 전혀 수정하지 않고 독립 실행 가능한 테스트/체크리스트 파일이 `docs/tester/`에 존재하고, 모든 항목이 §10 selector 목록만 참조한다.
- Codex 붙여넣기 프롬프트:
  "docs/tester/TEST_PLAN.md와 TEST_CASES.md에 정의된 테스트를 실행 가능한 형태로 준비하라. index.html은 절대 수정하지 마라. docs/builder/INDEX_HTML_ARCHITECTURE.md §10의 selector만 참조하라."
- Handoff Target: Main(통합 4 시점 회귀 실행 주체)
- Merge Order: 병합 개념 없음(별도 파일, 언제든 merge 가능, 늦어도 통합 3 이후 전체 회귀 전까지 준비)
- Known Risks: RISK-005 — 테스트가 selector가 아닌 텍스트 문구(placeholder 문구 등)에 과도하게 의존하면 wt-ui의 사소한 문구 수정에도 깨짐. Tester에게 selector/속성 기반 검증을 우선하도록 요청함.

---

## 요약 표

| Task | Worktree | Merge Order | 병렬 관계 |
|---|---|---|---|
| TASK-001 | (base) | 1 | 선행, 비병렬 |
| TASK-002 | wt-ui | 2 | TASK-001 이후 TASK-004와 병렬 코딩 가능 |
| TASK-004 | wt-persistence | 3 | TASK-001 이후 TASK-002/003과 완전 독립 병렬 |
| TASK-003 | wt-interaction | 4 | 코딩은 병렬 가능, 병합은 TASK-002 이후 |
| TASK-005 | wt-tests | 무관(상시) | 항상 완전 병렬(별도 파일) |

worktree 총 4개(`wt-ui`/`wt-interaction`/`wt-persistence`/`wt-tests`), §2.1 상한 안.

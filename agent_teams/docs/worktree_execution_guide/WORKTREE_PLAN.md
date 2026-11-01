Status: FINAL
Owner: Main
Inputs: docs/builder/TASK_BREAKDOWN.md(Codex 붙여넣기 프롬프트·Definition of Done — 단일 소스), docs/FILE_OWNERSHIP.md
Last Updated: 2026-07-29
Related Decisions/Requirements: TASK-001~005

# WORKTREE_PLAN

각 스텝의 Codex 붙여넣기 프롬프트와 완료 체크포인트(Definition of Done)의 **원본은 `docs/builder/TASK_BREAKDOWN.md`다.** 이 문서는 그것을 실행 순서(턴)에 맞춰 옮겨 쓴 것이며, 내용이 바뀌면 TASK_BREAKDOWN.md를 먼저 고친다(중복 소스 방지).

**규모: worktree 4개 · 총 7턴(6~8턴 범위) · 약 2시간~2시간30분.** "create(worktree 생성)"와 "implement(구현)"를 같은 턴 안에서 함께 진행하고, 서로 독립적인 worktree의 병합은 한 턴에 묶어 턴 수를 줄인다.

## Worktree 요약표

| ID | 브랜치 | 목적 | 담당 코드 영역 | 금지 영역 | 완료 체크포인트 | 테스트 | Merge Order |
|---|---|---|---|---|---|---|---|
| (base) | `main`/`master` | App Shell 골격 동결 | 전체 최초 생성 | 없음(선행) | index.html이 콘솔 에러 없이 로드, 필수 selector 전부 존재, h1 1개·h2 2개 | TEST-003(구조) | 1 |
| `wt-ui` | `feat/ui` | 목록/상세 렌더링 + CSS | HTML LIST/DETAIL/HEADER/STATUS, CSS 동일 섹션, `renderList/renderDetail` | `state`, CSS VARIABLES/LAYOUT 값, INTERACTION/PERSISTENCE 함수, 반응형 분기 | 6개 항목 렌더, placeholder↔content 토글, `data-needs-review` 속성 정확 | TEST-001,002,004,005,006 | 2 |
| `wt-persistence` | `feat/persistence` | localStorage 안전 래퍼 + 초기화 | `safeLocalStorageGet/Set`, `initApp()` 본문(호출 두 줄 제외) | render/select/attachListEventListeners, CSS, HTML, state | localStorage 오류에도 정상 렌더, `?empty=1`로 빈 상태 재현 | TEST-007,008,012,013 | 2(wt-ui와 같은 턴에 병합) |
| `wt-interaction` | `feat/interaction` | 선택 상호작용 | `selectRequest/handleListClick/handleListKeydown/attachListEventListeners` | renderList/renderDetail, CSS, state, **initApp() 전체** | 클릭·키보드 선택 동작, 재클릭 무효과, 포커스 유지 | TEST-004,009,010,011 | 3(wt-ui 이후) |
| `wt-tests` | `feat/tests` | 자동 테스트 자산 | `docs/tester/**`, 별도 테스트 파일 | `index.html` 전체 | index.html 미수정, 전체 selector만 참조하는 테스트 존재 | 전체 TEST-### | 상시 병렬, 늦어도 마지막 턴까지 |

## 턴별 런북 (총 7턴)

### [Codex T1] TASK-001 — App Shell (base, worktree 아님)

명령: (worktree 생성 없음, 현재 브랜치에서 직접 `index.html` 생성)

붙여넣기 프롬프트:
```text
docs/builder/INDEX_HTML_ARCHITECTURE.md 전체를 그대로 따라 index.html 골격을 만들어라. 모든 섹션 앵커 주석과 §4 state 객체(mock 데이터 포함), §2 selector, 함수 시그니처를 정확히 그 이름대로 만들어라. 페이지에 h1은 정확히 1개, 목록 영역 앞과 상세 영역 앞에 각각 h2를 1개씩 넣어라. 함수 본문은 비워도 된다.
```

완료 체크포인트: `index.html`을 브라우저에서 열었을 때 콘솔 에러 없음. `#app-list`, `#detail-panel`, `#app-header h1`이 모두 존재. `<h1>` 정확히 1개, `#app-list` 앞·`#detail-panel` 앞에 각각 `<h2>` 1개. `renderApp()` 호출 시 에러 없음.

실패 시 분기: 골격 자체 문제 → 이 턴에서 바로 재작업(다음 턴으로 넘어가지 않음, RISK-001 — 여기서 잘못되면 이후 모든 worktree에 영향).

---

### [Codex T2] wt-ui 워크트리 생성+구현 — TASK-002 List/Detail 렌더링

명령 (Windows 경로 병기):
```bash
git worktree add ../wt-ui -b feat/ui
```
```powershell
git worktree add ..\wt-ui -b feat/ui
```

붙여넣기 프롬프트:
```text
docs/builder/INDEX_HTML_ARCHITECTURE.md의 LIST·DETAIL·HEADER·STATUS 앵커 섹션과 renderList()/renderDetail() 함수 본문만 채워라. state 객체, CSS 변수, 다른 함수 시그니처는 수정하지 마라. #app-list, #detail-panel selector 이름을 그대로 유지하라. #detail-needs-review에는 표시 문구와 별개로 data-needs-review="true"|"false" 속성을 반드시 설정하라(REQ-002a).
```

완료 체크포인트: `#app-list`에 6개 `.request-item`이 렌더되고 각각 `.priority-badge[data-priority]`를 가짐. `#detail-placeholder`가 기본 표시되고 `#detail-content`는 hidden. `state.requests=[]`로 바꿨을 때 `#app-list-empty`만 보임. 항목 선택 시 `#detail-needs-review`가 `data-needs-review="true"|"false"`를 해당 항목의 `needsReview` 값과 일치하게 가짐.

실패 시 분기: selector·렌더 구조 문제 → wt-ui로 반환. TEST-001/002/005가 selector를 못 찾으면 architecture 문서와 실제 코드가 다른 것이니 wt-ui 코드를 architecture 계약에 맞춘다(계약 자체를 바꾸지 않는다).

**병행 안내:** 이 턴과 동시에(다른 터미널/세션에서) T3(wt-persistence)와 wt-tests(T7에서 마무리) 작업을 시작해도 코드 영역이 겹치지 않아 안전하다.

---

### [Codex T3] wt-persistence 워크트리 생성+구현 — TASK-004 localStorage 안전 래퍼

명령:
```bash
git worktree add ../wt-persistence -b feat/persistence
```
```powershell
git worktree add ..\wt-persistence -b feat/persistence
```

붙여넣기 프롬프트:
```text
docs/builder/INDEX_HTML_ARCHITECTURE.md의 PERSISTENCE 앵커(safeLocalStorageGet/safeLocalStorageSet)와 INIT 앵커(initApp) 본문을 채워라. attachListEventListeners()와 renderApp() 호출 줄은 이미 존재하니 그대로 두고 그 앞에 초기화 로직만 추가하라. render/selection 함수나 CSS, HTML, attachListEventListeners() 본문은 건드리지 마라. localStorage 접근은 반드시 try/catch로 감싸 실패해도 앱이 죽지 않게 하라. URL에 ?empty=1이 있으면 state.requests를 빈 배열로 초기화하라.
```

완료 체크포인트: devtools에서 `localStorage.setItem`/`getItem`이 오류를 던지도록 임시로 덮어써도 페이지가 에러 없이 목록/상세를 정상 표시. `safeLocalStorageGet`/`safeLocalStorageSet`이 try/catch로 감싸져 있음. `index.html?empty=1`로 열면 `state.requests`가 빈 배열로 초기화되어 `#app-list-empty`만 보이고 `.request-item`은 0개. `initApp()` 안의 `attachListEventListeners();`/`renderApp();` 호출 줄은 그대로 남아 있음.

이 워크트리는 wt-ui와 코드 영역이 완전히 독립적이라 T2와 동시에 진행한다(§2, 병렬 코딩).

실패 시 분기: localStorage 예외 처리 누락 → wt-persistence로 반환. `?empty=1` 분기 오류 → wt-persistence로 반환(TEST-007/008 실패 원인).

---

### [Codex T4] wt-ui + wt-persistence 병합 + 회귀 (한 턴에 함께)

두 worktree를 base로 순서대로 병합한다(코드 영역이 겹치지 않아 병합 자체는 순서 무관, wt-ui 먼저 권장 — 시각적 확인 우선). 병합 후 한 번에 회귀 실행: TEST-001, 002, 005, 006, 007, 008, 013.

실패 시 분기: 실패한 TEST-###의 원인 worktree(wt-ui 또는 wt-persistence)로 반환, 수정 후 재검증.

---

### [Codex T5] wt-interaction 워크트리 생성+구현 — TASK-003 선택 상호작용

**T4에서 wt-ui가 병합된 이후에 시작한다**(코드는 독립적이나 통합 테스트 실효성을 위한 순차 지정).

명령:
```bash
git worktree add ../wt-interaction -b feat/interaction
```
```powershell
git worktree add ..\wt-interaction -b feat/interaction
```

붙여넣기 프롬프트:
```text
docs/builder/INDEX_HTML_ARCHITECTURE.md의 INTERACTION 앵커(selectRequest/handleListClick/handleListKeydown/attachListEventListeners) 본문만 채워라. renderList/renderDetail 함수, CSS, state 필드, initApp() 본문은 절대 수정하지 마라. 리스너 등록은 attachListEventListeners() 안에서만 하라(initApp()은 이미 이 함수를 호출하고 있다). 재클릭 시 아무 효과가 없어야 한다.
```

완료 체크포인트: `.request-item`을 클릭하면 해당 요소에 `.is-selected`가 붙고 `#detail-content`가 보이며 4필드 값이 클릭한 항목과 일치한다. 같은 항목을 다시 클릭해도 DOM/상태 변화가 없다. Tab으로 항목에 포커스 후 Enter를 누르면 클릭과 동일한 결과가 된다. 페이지 로드 후 별도 조작 없이도 첫 클릭부터 정상 동작한다.

실패 시 분기: 클릭/키보드 반응 없음 → 리스너가 `#app-list`에 위임 등록됐는지 확인(RISK-003, 개별 항목 바인딩이면 재렌더 시 유실). 재클릭 시 상태 변함 → wt-interaction의 `selectRequest` 조건문 수정.

---

### [Codex T6] wt-interaction 병합 + 회귀

wt-interaction을 base로 병합한다. 병합 후 TEST-004, 006, 009, 010, 011을 실행하고, T4에서 확인한 항목(TEST-001,002,005,006,007,008,013)이 깨지지 않았는지 재확인한다(회귀).

---

### [Codex T7] wt-tests 마무리+병합, 전체 회귀, 최종 정리

wt-tests가 아직 없다면 이 턴에 생성·마무리한다(T2~T6 사이 언제든 병렬로 이미 진행했다면 여기서는 병합만).

명령(아직 안 만들었다면):
```bash
git worktree add ../wt-tests -b feat/tests
```
```powershell
git worktree add ..\wt-tests -b feat/tests
```

붙여넣기 프롬프트:
```text
docs/tester/TEST_PLAN.md와 TEST_CASES.md에 정의된 테스트를 실행 가능한 형태로 준비하라. index.html은 절대 수정하지 마라. docs/builder/INDEX_HTML_ARCHITECTURE.md §10의 selector만 참조하라.
```

완료 체크포인트(wt-tests): `index.html`을 전혀 수정하지 않고 독립 실행 가능한 테스트/체크리스트 파일이 존재하고, 모든 항목이 §10 selector 목록만 참조한다.

이어서 **전체 회귀**: TEST-001~014를 전부 실행한다. 실패 원인이 제품 문제인지 테스트 문제인지 구분해(TEST_AND_RETRY_LOOP.md 참고) 해당 worktree로 반환한다.

마지막으로 **최종 정리**: `docs/reviewer/FINAL_REVIEW.md` 기준(단일 파일 제약, 코드 영역 소유권)을 어기지 않았는지 확인하고 완료 보고한다.

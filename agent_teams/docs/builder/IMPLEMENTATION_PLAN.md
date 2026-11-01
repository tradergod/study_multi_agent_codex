Status: DRAFT
Owner: Builder Planner
Inputs: docs/builder/INDEX_HTML_ARCHITECTURE.md, docs/MVP_SPEC.md §10, docs/researcher/RESEARCH_REPORT.md §7, CLAUDE.md §11.1
Last Updated: 2026-07-29
Related Decisions/Requirements: REQ-001~007, DEC-001~003(확정 — 오른쪽 고정 패널/새로고침 후 미유지/데스크톱 전용), TASK-001~005

# IMPLEMENTATION_PLAN

## 1. 하이브리드 원칙 적용 요약 (CLAUDE.md §11.1)

단일 `index.html`이므로 무분별한 병렬은 충돌을 부른다. 본 프로젝트는:

1. **선행 공용 골격(TASK-001)**을 먼저 base 브랜치에서 완성해 공유 표면(state 필드, CSS 변수, selector, 앵커, 함수 시그니처)을 동결한다.
2. 골격 동결 후 **목적이 다른 worktree 3개 + 테스트 worktree 1개(총 4개)**를 만든다.
3. 테스트 worktree(`wt-tests`)는 `index.html`을 건드리지 않으므로 전체 기간 동안 진짜 병렬.
4. Main이 정해진 순서로 순차 병합하고, 매 병합 후 회귀(Tester 재검증)한다.
5. 공유 state를 동시에 많이 건드리는 조합은 순차로 표시한다(§3).

## 2. 선행 공용 골격 Task

**TASK-001 — App Shell (공용 골격, 동결)**
base 브랜치(worktree 생성 전)에서 직접 완성. 아래 전부를 포함:
- `<head>`/`<style>`/`<body>`/`<script>` 골격과 모든 섹션 앵커 주석
- CSS `RESET`/`VARIABLES`/`LAYOUT`(2-컬럼 grid 뼈대) 섹션
- `state` 객체(mock 데이터 6개 항목 포함) 완전 확정
- DOM_REFS 블록(주요 `querySelector` 상수)
- `renderApp()` dispatcher 완성(내부에서 `renderList()`/`renderDetail()` 호출만, 두 함수의 **본문은 빈 함수로 시그니처만** 존재)
- `selectRequest(id)`, `handleListClick`, `handleListKeydown`, `safeLocalStorageGet/Set`, `initApp()` **함수 시그니처만** 존재(빈 본문 또는 TODO 주석)
- HTML: `#app-header`, `#app-list`(빈 컨테이너 + `#app-list-empty` 요소), `#detail-panel`(`#detail-placeholder` + `#detail-content` 뼈대, 4개 필드 요소 태그까지는 존재하되 값은 비어 있음), `#status-bar` 요소 존재

이 Task가 끝나야 이후 worktree들이 동시에 시작할 수 있다. **누가 실행하든(교육생 본인 또는 Codex 첫 턴) 이 산출물은 worktree 분기 전에 merge까지 끝나 있어야 한다.**

## 3. 병렬 가능 Task vs 순차 필요 Task

| Task | Worktree | 병렬 가능 여부 | 이유 |
|---|---|---|---|
| TASK-002 (List/Detail 렌더링 + CSS) | `wt-ui` | TASK-001 이후 병렬 시작 가능 | CSS 섹션(`HEADER/LIST/DETAIL/STATUS`, **RESPONSIVE 섹션 없음 — DEC-003 확정: 데스크톱 전용**)과 `renderList()/renderDetail()` 함수 본문만 채움 — 다른 worktree가 손대는 함수와 겹치지 않음 |
| TASK-003 (선택 상호작용) | `wt-interaction` | TASK-001 이후 **코딩은 병렬 가능**하나 **병합은 wt-ui 이후**로 순차 지정 | `selectRequest()`가 호출하는 `renderList/renderDetail`이 실제로 채워져 있어야 통합 테스트가 의미 있음(코드 자체는 겹치지 않지만 런타임 검증 순서상 후행 병합) |
| TASK-004 (localStorage 안전 래퍼 + 수동 empty/error 절차) | `wt-persistence` | TASK-001 이후 완전 병렬(다른 Task와 코드 영역 겹침 없음) | `safeLocalStorageGet/Set`, `initApp()` 본문만 채움. UI/interaction과 함수 경계가 명확히 분리됨 |
| TASK-005 (자동 테스트 자산) | `wt-tests` | 항상 완전 병렬 | `index.html`을 건드리지 않는 별도 테스트 파일/체크리스트만 다룸(Tester 소관, Builder는 selector 계약만 제공) |

**공유 state를 많이 건드려 순차가 필요한 조합은 TASK-003→(TASK-002 병합 후)이다.** 그 외 조합은 코드 영역이 겹치지 않아 강제 순차가 필요 없다.

## 4. 통합(병합) 순서와 각 시점 검증

```text
[통합 0] TASK-001 완성 → base 브랜치에 직접 commit (worktree 아님)
          검증: index.html을 브라우저로 열었을 때 에러 없이 로드,
                #app-list/#detail-panel/#app-header가 DOM에 존재(내용은 비어 있어도 됨)

[통합 1] wt-ui (TASK-002) → base 병합
          검증(Tester 자동/수동): #app-list에 6개 .request-item 렌더,
                                  각 항목에 .priority-badge[data-priority] 존재,
                                  #detail-placeholder가 기본 표시, #detail-content는 hidden

[통합 2] wt-persistence (TASK-004) → base 병합 (wt-ui와 독립이므로 통합 1과 순서 바꿔도 무방,
          단 본 계획은 wt-ui 먼저 병합해 시각적 확인을 먼저 확보하는 순서를 권장)
          검증: 브라우저 localStorage를 강제로 비활성화(프라이빗 모드 시뮬레이션 또는 접근 차단)해도
                목록/상세 표시가 정상 동작(REQ-007), 콘솔 에러 없음

[통합 3] wt-interaction (TASK-003) → base 병합 (wt-ui 병합 이후여야 함)
          검증(Tester 자동): 항목 클릭 시 .is-selected + aria-selected="true" 적용,
                              #detail-content로 전환, 4필드 값 일치,
                              같은 항목 재클릭 시 상태 무변화,
                              Tab+Enter로 동일 동작 재현

[통합 4] wt-tests (TASK-005) → 언제든 병합 가능(독립 파일), 늦어도 통합 3 이후 전체 회귀에 포함
          검증: 통합 1~3 전체에 대한 자동 테스트 스위트 1회 실행, 실패 시 해당 원인 worktree로 반환
```

각 통합 시점 이후에는 이전 통합에서 확인한 항목이 깨지지 않았는지 다시 확인한다(회귀). 실패 시 Reviewer/Tester가 원인 Task로 반환하고, TASK-001의 동결된 계약(state 필드/selector/함수 시그니처)은 그 과정에서 변경하지 않는다.

## 5. `[HANDOFF]` — Main 종합용 입력 (FILE_OWNERSHIP·런북)

### 5.1 FILE_OWNERSHIP 입력 (코드 영역별 소유권, 겹침 없음)

| Worktree | 소유 HTML 영역 | 소유 CSS 섹션 | 소유 JS 함수 | 금지 영역 |
|---|---|---|---|---|
| (base, TASK-001) | 전체 골격·앵커 최초 생성 | RESET, VARIABLES, LAYOUT(뼈대) | 모든 함수 시그니처, `renderApp()` 본문, **`initApp()` 안의 `attachListEventListeners();`/`renderApp();` 호출 두 줄**(고정), `state` 객체 전체 | 없음(선행 단계) |
| `wt-ui` | `HEADER`/`LIST`/`DETAIL`/`STATUS` 앵커 안 정적 마크업 | HEADER, LIST, DETAIL, STATUS (**RESPONSIVE 섹션 없음 — DEC-003 확정: 데스크톱 전용, POST_MVP-7 참고**) | `renderList()`, `renderDetail()` 본문 | `state` 필드 추가/변경, `renderApp()` 시그니처, VARIABLES 값, INTERACTION/PERSISTENCE 함수, `@media`/`matchMedia` 반응형 분기 추가 |
| `wt-interaction` | 없음(신규 마크업 추가 안 함, data-* 속성도 wt-ui가 렌더한 요소에 이미 포함되어 있으므로 추가 불필요) | 없음(hover/focus 시각 상태는 `LIST` 섹션 안에서 wt-ui가 이미 준비한 `.is-selected`/`:focus-visible` 규칙 재사용, 신규 셀렉터 추가 금지) | `selectRequest()`, `handleListClick()`, `handleListKeydown()`, **`attachListEventListeners()`**(리스너 등록은 이 함수 안에서만, `initApp()`은 절대 열지 않음 — Reviewer C-3 반영) 본문 | `renderList/renderDetail` 본문, `state` 필드, CSS 섹션 전체, **`initApp()` 본문(호출 줄 포함 전체)** |
| `wt-persistence` | 없음 | 없음 | `safeLocalStorageGet()`, `safeLocalStorageSet()`, **`initApp()` 본문 중 `attachListEventListeners();`/`renderApp();` 호출 줄을 제외한 나머지 전체**(그 두 줄은 TASK-001 고정, 순서·존재 유지 의무) | `render*`/`select*`/**`attachListEventListeners()`**(TASK-003 전담) 함수, CSS, HTML 마크업, `state` 필드 |
| `wt-tests` | 없음(별도 테스트 파일/문서만) | 없음 | 없음(`index.html` 미수정) | `index.html` 전체 |

**C-3 정리 한 문장(Reviewer 요청 형식):** 리스너 등록은 `initApp()` 마지막 부분에서 `attachListEventListeners()` 호출 — `attachListEventListeners()` 함수 본문은 TASK-003(wt-interaction) 전담 소유, `initApp()` 본문(호출 줄 포함)은 TASK-004(wt-persistence) 전담 소유, TASK-003은 `initApp()` 안에 어떤 줄도 추가·수정하지 않는다(호출 줄 자체도 TASK-001이 골격 단계에서 이미 박아둔 것이며 TASK-003·TASK-004 둘 다 그 줄을 수정하지 않는다).

### 5.2 Codex 턴별 런북 입력 (짧은 프롬프트 + Definition of Done)

TASK_BREAKDOWN.md의 각 `TASK-###` 항목에 있는 `Codex 붙여넣기 프롬프트`·`Definition of Done`을 Main이 그대로 WORKTREE_PLAN.md 런북 스텝에 옮겨 쓸 것을 요청한다(중복 작성 방지 — 원본은 TASK_BREAKDOWN.md 단일 소스).

## 6. `[HANDOFF]` — Tester

selector·상태 변화 지점은 INDEX_HTML_ARCHITECTURE.md §2/§10에 정리됨. 통합 순서(§4)에 맞춰 TEST_PLAN을 "통합 1 시점 테스트/통합 3 시점 테스트"로 단계 구분해줄 것을 요청.

## 7. `[HANDOFF]` — Reviewer

worktree 4개(`wt-ui`/`wt-interaction`/`wt-persistence`/`wt-tests`)는 §2.1 상한(3~4개) 안이며, 코드 영역 겹침이 없음(§5.1). 유일한 순차 제약은 `wt-interaction`의 병합이 `wt-ui` 병합 뒤에 와야 한다는 점(§3)이며 이는 코드 충돌이 아니라 통합 테스트 순서상의 이유임을 확인 요청.

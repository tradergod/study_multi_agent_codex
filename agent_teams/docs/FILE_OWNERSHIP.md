Status: FINAL
Owner: Main
Inputs: docs/builder/IMPLEMENTATION_PLAN.md §5.1([HANDOFF]), docs/builder/TASK_BREAKDOWN.md(Allowed/Forbidden Code Areas), docs/builder/INDEX_HTML_ARCHITECTURE.md
Last Updated: 2026-07-29
Related Decisions/Requirements: TASK-001~005, DEC-001~003

# FILE_OWNERSHIP

단일 `index.html` 안에서 어느 worktree가 어떤 HTML/CSS/JS 코드 영역을 소유·수정하고 무엇을 건드리면 안 되는지 정의한다. 코드 영역은 서로 겹치지 않는다(Reviewer FINAL_REVIEW.md §1 C-3 확인 완료). "언제 실행하는지"는 이 문서가 아니라 `worktree_execution_guide/WORKTREE_PLAN.md`를 참고한다.

## (base) TASK-001 — App Shell (worktree 아님, 선행 단계)

- **소유:** 전체 골격 최초 생성 — HTML 앵커 전체, CSS `RESET`/`VARIABLES`/`LAYOUT`(뼈대), JS 모든 함수 시그니처(`renderList`/`renderDetail`/`selectRequest`/`handleListClick`/`handleListKeydown`/`attachListEventListeners`/`safeLocalStorageGet`/`safeLocalStorageSet`/`initApp`), `renderApp()` 완성 본문, `state` 객체 전체(mock 6개 항목 포함), `initApp()` 안의 `attachListEventListeners();`/`renderApp();` 호출 두 줄(고정).
- **금지:** 없음(선행 단계). 단, 완료·병합 후에는 이 Task 자신도 동결된 시그니처/필드를 재변경하지 않는다 — 이후 변경은 `[REVISION_REQUEST]`로만.
- **완료 후 상태:** base 브랜치에 병합 완료. 이후 모든 worktree가 여기서 분기한다.

## wt-ui (TASK-002)

- **소유 HTML:** `HEADER`/`LIST`/`DETAIL`/`STATUS` 앵커 안 정적 마크업.
- **소유 CSS:** `HEADER`, `LIST`, `DETAIL`, `STATUS` 섹션. (`RESPONSIVE` 섹션 없음 — DEC-003 확정.)
- **소유 JS:** `renderList()`, `renderDetail()` 함수 본문.
- **금지:** `state` 객체 필드 추가/변경, `renderApp()` 시그니처, CSS `VARIABLES`/`LAYOUT`(grid-template-columns 값), `selectRequest`/`handleListClick`/`handleListKeydown`/`safeLocalStorage*`/`initApp` 함수, `@media`/`matchMedia` 기반 반응형 분기 추가.

## wt-interaction (TASK-003)

- **소유 HTML:** 없음(신규 마크업 추가 안 함).
- **소유 CSS:** 없음(`.is-selected`/`:focus-visible` 등 기존 wt-ui 스타일 재사용, 신규 셀렉터 추가 금지).
- **소유 JS:** `selectRequest()`, `handleListClick()`, `handleListKeydown()`, `attachListEventListeners()` 함수 본문(리스너 등록 코드는 오직 이 함수 안에만).
- **금지:** `renderList`/`renderDetail` 본문, `state` 필드, CSS 섹션 전체, HTML 마크업, **`initApp()` 본문(호출 줄 포함 전체 — 이 함수는 wt-persistence 전담이며 wt-interaction은 절대 열지 않는다)**.

## wt-persistence (TASK-004)

- **소유 HTML:** 없음.
- **소유 CSS:** 없음.
- **소유 JS:** `safeLocalStorageGet()`, `safeLocalStorageSet()`, `initApp()` 함수 본문 전체(단 `attachListEventListeners();`/`renderApp();` 호출 두 줄은 TASK-001 고정 — 그 순서·존재를 유지한 채 앞에 자신의 초기화 로직만 추가).
- **금지:** `render*`/`select*`/`handleList*`/**`attachListEventListeners()`**(wt-interaction 전담, 본문 손대지 않음) 함수, CSS 전체, HTML 마크업, `state` 필드.

## wt-tests (TASK-005)

- **소유:** `docs/tester/**` 및 별도 테스트 파일(검증 환경).
- **금지:** `index.html` 전체 — 절대 수정하지 않음.

## 코드 영역 소유권 요약표 (겹침 없음 확인용)

| 코드 영역 | 소유 worktree | 비고 |
|---|---|---|
| HTML `HEADER`/`LIST`/`DETAIL`/`STATUS` 앵커 내부 마크업 | wt-ui | — |
| CSS `RESET`/`VARIABLES`/`LAYOUT`(값) | (base) | 동결, 이후 참조만 |
| CSS `HEADER`/`LIST`/`DETAIL`/`STATUS` | wt-ui | — |
| `state` 객체 | (base) | 동결, 필드 추가·변경 시 `[REVISION_REQUEST]` |
| `renderApp()` | (base) | 완성됨, dispatcher만 |
| `renderList()`/`renderDetail()` 본문 | wt-ui | — |
| `selectRequest()`/`handleListClick()`/`handleListKeydown()` 본문 | wt-interaction | — |
| `attachListEventListeners()` 본문 | wt-interaction | 리스너 등록은 오직 여기서만 |
| `safeLocalStorageGet()`/`safeLocalStorageSet()` 본문 | wt-persistence | — |
| `initApp()` 본문(호출 두 줄 제외) | wt-persistence | 호출 두 줄 자체는 (base) 고정 |
| `docs/tester/**`, 별도 테스트 파일 | wt-tests | `index.html` 미수정 |

**C-3 소유권 한 문장 (Reviewer 확인 완료):** 리스너 등록은 `initApp()` 마지막 부분에서 `attachListEventListeners()` 호출 — `attachListEventListeners()` 함수 본문은 wt-interaction 전담, `initApp()` 본문(호출 줄 포함)은 wt-persistence 전담, wt-interaction은 `initApp()` 안에 어떤 줄도 추가·수정하지 않는다.

## 병합 순서 (요약 — 상세는 WORKTREE_PLAN.md)

1. (base) TASK-001
2. wt-ui (TASK-002)
3. wt-persistence (TASK-004)
4. wt-interaction (TASK-003, wt-ui 병합 이후여야 함)
5. wt-tests (TASK-005, 언제든·상시 병렬, 늦어도 전체 회귀 전까지)

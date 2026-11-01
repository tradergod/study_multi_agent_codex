Status: FINAL
Owner: Main
Inputs: docs/MVP_SPEC.md(REQ 문구, Product Specifier), docs/tester/TEST_CASES.md(검증 방법, Tester), docs/builder/TASK_BREAKDOWN.md(Task 연결, Builder Planner)
Last Updated: 2026-07-29
Related Decisions/Requirements: REQ-001~007, REQ-002a, DEC-001~003

# ACCEPTANCE_CRITERIA

Product Specifier의 AC 문구, Tester의 검증 방법, Builder Planner의 Task 연결을 Main이 조립한 문서. 각 AC는 존재·위치·크기·동작을 구체 수치/조건으로 서술한다(모호 표현 금지).

| AC | 서술 | 연결 REQ | 검증 방법(자동/수동) | 대상 TEST-### | 연결 TASK |
|---|---|---|---|---|---|
| AC-001 | `#app-list` 안에 `.request-item[data-id]`가 mock 데이터 개수(6개)만큼 존재하고, 각 항목에 비어있지 않은 `.request-title` 텍스트와 `P0`\|`P1`\|`P2` 중 하나의 값을 가진 `.priority-badge[data-priority]`가 존재한다. | REQ-001 | 자동 | TEST-001 | TASK-002 |
| AC-002 | 목록 항목 클릭 또는 포커스 후 Enter/Space 시 해당 항목이 `.is-selected` 클래스와 `aria-selected="true"`를 갖고, 이전 선택 항목은 두 속성이 모두 해제된다(선택은 항상 0개 또는 1개). | REQ-002(상호작용부), REQ-006 | 자동 | TEST-004, TEST-006 | TASK-003 |
| AC-003 | 항목 선택 시 `#detail-content`가 표시되고 `#detail-priority`/`#detail-assignee`/`#detail-next-action`이 선택 항목의 값을 포함하며, `#detail-needs-review`가 선택 항목의 `needsReview` 값과 일치하는 `data-needs-review="true"\|"false"` 속성을 갖는다(표시 문구는 검증 대상 아님). | REQ-002(표시부), REQ-002a | 자동 | TEST-005, TEST-006 | TASK-002 |
| AC-004 | `index.html?empty=1`로 접속 시 `#app-list-empty`가 표시되고 `.request-item`은 0개이며, `#detail-placeholder`가 표시되고 `#detail-content`는 숨김 상태다. | REQ-003 | 자동 | TEST-007, TEST-008 | TASK-004 |
| AC-005 | 페이지 로드 직후(아무 항목도 선택 안 된 상태) `#detail-placeholder`가 표시되고 `#detail-content`는 숨김이며, `#detail-priority` 등 4개 필드 요소는 화면에 보이지 않는다. | REQ-004 | 자동 | TEST-002 | TASK-002 |
| AC-006 | 페이지 전체 DOM에 `form`, `input[type="text"]`, `textarea`, 신규 항목 추가/저장 목적의 버튼이 0개 존재한다(추가/편집 폼 부재). | REQ-005 | 자동(부재 증명) + 수동(정적 데이터 의도 확인, Reviewer SCOPE_REVIEW와 교차) | TEST-014 | TASK-002 (부재 확인 대상) |
| AC-007 | 선택된 `.request-item`은 다른 미선택 항목과 시각적으로 구분되는 스타일(배경색/테두리 등)이 CSS로 적용되어 있다(computed style 기준 차이 존재). | REQ-006 | 자동(class/computed style) + 수동(구분 가독성) | TEST-004 | TASK-002 |
| AC-008 | `localStorage.getItem`/`setItem`이 예외를 던지도록 오염된 환경에서도 페이지 로드 시 콘솔 uncaught 에러가 없고, `#app-list`가 정상 렌더되며 항목 클릭 시 `#detail-content`가 정상 갱신된다. | REQ-007 | 자동(에러 미발생·렌더 확인) + 수동("자연스러움" 판단) | TEST-013 | TASK-004 |
| AC-009 | 페이지 전체에 `<h1>`이 정확히 1개(`#app-header h1`) 존재하고, `#app-list` 앞·`#detail-panel` 앞에 각각 `<h2>` 이상 heading이 1개씩 존재하며, `#detail-panel`이 `role="region"`과 `aria-label` 속성을 갖는다. | §8 접근성 | 자동 | TEST-003 | TASK-001 |
| AC-010 | 항목 선택 상태 변화 시 관련 `.request-item`의 `aria-selected` 값이 `"true"`/`"false"`로 즉시 갱신되어 스크린리더에 전달 가능하다. | §8 접근성 | 자동 | TEST-004, TEST-010 | TASK-003 |
| AC-011 | mock 데이터는 코드 내 정적 배열로 6개 항목을 포함하며 `P0`/`P1`/`P2` 우선순위가 골고루 섞여 있다(각 값 최소 1개 이상 존재). | REQ-005, §6 데이터 모델 | 자동(데이터 배열 정적 검사) | TEST-001(간접) | TASK-001 |
| AC-012 | 목록 항목에 포커스된 상태에서 `Enter` 또는 `Space` 키를 누르면 클릭과 동일하게 선택·상세 갱신이 일어난다. | §8 접근성 | 자동 | TEST-010, TEST-011 | TASK-003 |
| AC-013 | 항목 선택(클릭 또는 키보드) 후 포커스는 선택한 `.request-item`에 그대로 유지되며 다른 요소로 이동하지 않는다. | §8 접근성 | 자동 | TEST-010 | TASK-003 |
| AC-014 | 이미 선택된 항목을 다시 클릭해도 DOM/상태(선택 클래스, 상세 필드 값)에 변화가 없다. | §4 확정 동작(재클릭 무효과) | 자동 | TEST-009 | TASK-003 |

## 참고

- 새로고침 후 선택 초기화(DEC-002)는 AC-005(초기 placeholder 상태)의 재확인 성격이라 별도 AC 번호를 만들지 않고 TEST-012로 AC-005에 연결한다.
- 반응형(POST_MVP-7)은 이번 MVP AC에 포함하지 않는다(DEC-003).
- 수동 검토가 필요한 세부 판단 기준은 `docs/tester/MANUAL_REVIEW_CHECKLIST.md`를 따른다.

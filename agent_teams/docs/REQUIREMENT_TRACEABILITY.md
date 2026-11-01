Status: FINAL
Owner: Main
Inputs: docs/MVP_SPEC.md, docs/builder/TASK_BREAKDOWN.md, docs/tester/TEST_CASES.md, docs/ACCEPTANCE_CRITERIA.md
Last Updated: 2026-07-29
Related Decisions/Requirements: REQ-001~007, REQ-002a, DEC-001~003

# REQUIREMENT_TRACEABILITY

요구사항 → 화면 영역 → Task → Worktree → AC → Test를 연결한다.

| REQ | 요구사항 요약 | 화면 영역 | Task | Worktree | AC | TEST |
|---|---|---|---|---|---|---|
| REQ-001 | 목록 렌더(제목+우선순위 배지) | 목록 영역(List) | TASK-002 | wt-ui | AC-001 | TEST-001 |
| REQ-002 | 선택 시 상세 4필드 갱신(상호작용+표시) | 목록 영역 + 상세 영역(Detail) | TASK-002(표시), TASK-003(상호작용) | wt-ui, wt-interaction | AC-002, AC-003 | TEST-004, TEST-005, TEST-006 |
| REQ-002a | `data-needs-review` 속성 확정 | 상세 영역 | TASK-002 | wt-ui | AC-003 | TEST-005 |
| REQ-003 | 빈 상태(목록·상세 각각 안내) | 목록 영역 + 상세 영역 | TASK-002(렌더), TASK-004(`?empty=1` 분기) | wt-ui, wt-persistence | AC-004 | TEST-007, TEST-008 |
| REQ-004 | 초기 상태(미선택 시 상세 안내) | 상세 영역 | TASK-002 | wt-ui | AC-005 | TEST-002 |
| REQ-005 | 완전 정적 mock 데이터, 추가/편집 폼 없음 | 목록 영역, 전체 | TASK-001(데이터), TASK-002(폼 부재 확인 대상) | (base), wt-ui | AC-006, AC-011 | TEST-014 |
| REQ-006 | 선택 상태 시각적 구분 | 목록 영역 | TASK-002(스타일), TASK-003(상태 갱신) | wt-ui, wt-interaction | AC-007, AC-002 | TEST-004 |
| REQ-007 | localStorage 실패해도 핵심 기능 유지 | 전체(JS 안전 래퍼) | TASK-004 | wt-persistence | AC-008 | TEST-013 |
| §8 접근성 | h1/heading/landmark/키보드/포커스/aria-selected | 헤더, 목록, 상세 | TASK-001(구조), TASK-003(키보드·포커스) | (base), wt-interaction | AC-009, AC-010, AC-012, AC-013 | TEST-003, TEST-004, TEST-010, TEST-011 |
| §4 확정 동작 | 재클릭 무효과 | 목록 영역 | TASK-003 | wt-interaction | AC-014 | TEST-009 |
| DEC-001 | 상세 영역 = 오른쪽 고정 패널 | 전체 레이아웃(`#app-main`) | TASK-001(CSS Grid 뼈대), TASK-002(세부) | (base), wt-ui | (레이아웃 전제, 개별 AC 없음 — TEST-004~006 전제 조건) | TEST-004~006 |
| DEC-002 | 새로고침 후 선택 미유지 | 상세 영역 | TASK-004 | wt-persistence | AC-005(재확인) | TEST-012 |
| DEC-003 | 데스크톱 전용, 반응형 없음 | 전체 | TASK-002(RESPONSIVE 섹션 제외) | wt-ui | (해당 없음 — 범위 제외 확인용) | TEST-90x(작성 안 함, 확정 제외) |

## POST_MVP 항목 (이번 실행 범위 밖, Task/Test 없음)

| POST_MVP | 내용 |
|---|---|
| POST_MVP-1 | 우선순위/담당자 필터·정렬 (Q-003, OPEN_DECISIONS.md 비차단) |
| POST_MVP-2 | 다음 액션 완료 처리, 담당자 재배정 등 편집 기능 |
| POST_MVP-3 | 실제 GitHub Issues/PR API 연동, 인증, 실시간 동기화 |
| POST_MVP-4 | 다중 페이지·라우팅, 알림, 정렬 히스토리 |
| POST_MVP-5 | 검색어 필터링 |
| POST_MVP-6 | 화면에서 새 요청 추가/수정/삭제 폼 |
| POST_MVP-7 | 모바일/좁은 화면 반응형 레이아웃 전환 |

## 커버리지 확인

- 필수 REQ-001~007(REQ-002a 포함) 전부 최소 1개 이상의 Task·AC·TEST에 연결됨 — 누락 없음(Reviewer FINAL_REVIEW.md §3 확인).
- 모든 Task(TASK-001~005)가 최소 1개 이상의 REQ 또는 §8/§4 항목에 연결됨 — 목적 없는 Task 없음.
- worktree 4개(wt-ui/wt-interaction/wt-persistence/wt-tests) 전부 위 표에 등장 — 유휴 worktree 없음.

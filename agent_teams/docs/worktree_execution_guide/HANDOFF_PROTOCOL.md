Status: FINAL
Owner: Main
Inputs: docs/builder/IMPLEMENTATION_PLAN.md §6~7, docs/builder/TASK_BREAKDOWN.md
Last Updated: 2026-07-29
Related Decisions/Requirements: TASK-001~005

# HANDOFF_PROTOCOL

Codex 구현 단계에서 Builder(각 worktree 구현자) ↔ Tester ↔ Reviewer ↔ Main 사이의 전달 계약. 설계 단계의 `[HANDOFF]`/`[REVISION_REQUEST]` 규칙(CLAUDE.md §6)을 구현 단계에도 동일하게 적용한다.

## Builder(각 worktree) → Tester

- 전달 내용: 구현 완료 후 자신의 Task가 만든 DOM 구조·상태 변화가 `docs/builder/INDEX_HTML_ARCHITECTURE.md` §2/§10 selector 계약과 정확히 일치하는지.
- 형식: 병합 요청 시 "이 worktree는 TASK-###의 Definition of Done을 만족한다"를 commit 메시지 또는 PR 설명에 명시.
- Tester가 확인할 것: 계약된 selector가 실제로 DOM에 존재하는지, TEST-###가 통과하는지.

## Tester → Builder(원인 worktree) / Main

- 테스트 실패 시: 어느 TEST-###가 실패했는지, 실제 selector/속성 값이 무엇이었는지(기대값과 diff)를 원인 worktree에 반환.
- **제품 문제**(구현이 architecture 계약과 다름) vs **테스트 문제**(selector 오타, 잘못된 기대값) 구분 — TEST_AND_RETRY_LOOP.md 참고.
- 반복 실패(같은 TEST-###가 2회 이상 실패)는 Main에게 승격 — TASK_BREAKDOWN.md 자체의 계약이 잘못됐을 가능성을 검토.

## Reviewer(최종 확인 역할) → Main

- 병합 직전 확인: FILE_OWNERSHIP.md의 코드 영역을 벗어난 수정이 있는지, 단일 파일 제약(§2) 위반(외부 스크립트 태그, npm 패키지 등 추가)이 있는지.
- 위반 발견 시 병합을 보류하고 해당 worktree에 구체적 수정 요청(어느 파일의 어느 라인이 계약을 벗어났는지)을 전달.

## Main(교육생) — 종합·병합 주체

- 정해진 Merge Order(FILE_OWNERSHIP.md §병합 순서)를 따른다.
- 매 병합 후 회귀(이전 통합에서 확인한 항목 재확인)를 직접 실행하거나 wt-tests 산출물로 실행한다.
- TASK_BREAKDOWN.md/INDEX_HTML_ARCHITECTURE.md의 동결된 계약(state 필드/selector/함수 시그니처)은 구현 단계에서 변경하지 않는다 — 변경이 꼭 필요하면 그 문서를 먼저 고치고 사유를 commit에 남긴다.

## 전달 형식 예시

```text
[FAIL] TEST-005 → wt-ui
기대: #detail-needs-review[data-needs-review="true"] (id=1, needsReview=true)
실제: data-needs-review 속성 자체가 DOM에 없음
분류: 제품 문제 (architecture §2 계약 미반영)
요청: renderDetail()에서 #detail-needs-review에 data-needs-review 속성을 항상 설정하도록 수정
```

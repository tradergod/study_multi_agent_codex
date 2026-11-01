Status: FINAL
Owner: Main
Inputs: docs/FILE_OWNERSHIP.md, docs/worktree_execution_guide/WORKTREE_PLAN.md, docs/worktree_execution_guide/TEST_AND_RETRY_LOOP.md
Last Updated: 2026-07-29
Related Decisions/Requirements: TASK-001~005

# MERGE_GUIDE

## 병합 전 체크리스트 (매 worktree 공통)

```text
[ ] 이 worktree가 수정한 파일/영역이 FILE_OWNERSHIP.md의 "소유" 목록 안에만 있는가?
[ ] "금지" 목록에 있는 함수/CSS 섹션/state 필드를 건드리지 않았는가?
[ ] index.html에 <script src> 외부 참조, npm 패키지, 별도 .css/.js 파일을 추가하지 않았는가? (§2 위반 검사)
[ ] 해당 TASK-###의 Definition of Done을 전부 만족하는가?
[ ] 해당 TEST-###를 실행해 통과했는가?
```

## 병합 순서 (고정)

1. **(base) TASK-001** — 최초 골격, worktree 아님. 이 커밋 없이는 아래 어떤 worktree도 분기할 수 없다.
2. **wt-ui (TASK-002)** — 시각적 확인을 먼저 확보하기 위해 우선 병합 권장.
3. **wt-persistence (TASK-004)** — wt-ui와 코드 영역이 독립적이라 순서를 바꿔도 무방하나, 본 가이드는 이 순서를 기본값으로 한다.
4. **wt-interaction (TASK-003)** — 반드시 wt-ui 병합 **이후**. (통합 테스트 실효성 이유, 코드 충돌 아님.)
5. **wt-tests (TASK-005)** — 언제든 병합 가능(독립 파일), 늦어도 전체 회귀 전까지는 포함.

## 충돌 처리

이 프로젝트는 코드 영역이 FILE_OWNERSHIP.md로 사전에 분리되어 있으므로 **정상적인 경우 Git 병합 충돌(conflict marker)이 발생하지 않아야 한다.** 만약 충돌이 발생하면:

1. 충돌 지점이 FILE_OWNERSHIP.md 소유 경계를 벗어난 수정인지 먼저 확인한다(가장 흔한 원인 — 예: wt-interaction이 실수로 CSS를 건드림).
2. 경계를 벗어난 수정이면 해당 worktree에서 그 부분을 되돌리고 자기 소유 영역만 남긴다.
3. 정말로 계약 자체가 겹쳐서 발생한 충돌이면(설계 오류), TASK_BREAKDOWN.md/FILE_OWNERSHIP.md를 먼저 수정해 경계를 재정의한 뒤 병합을 재시도한다 — 코드만 억지로 합치지 않는다.

## 병합 후 정리

- 병합이 끝난 worktree는 `git worktree remove <path>`로 정리한다(선택 사항, 디스크 정리 목적).
- base 브랜치의 `index.html`이 항상 "지금까지 병합된 것의 합"이라는 단일 진실이 되도록 유지한다.

## 매 병합 후 회귀

TEST_AND_RETRY_LOOP.md의 "회귀 유지 원칙"에 따라, 새로 병합된 TEST-###뿐 아니라 이전에 통과했던 TEST-###도 함께 재실행한다. WORKTREE_PLAN.md의 T4~T7 각 단계에 해당 TEST-### 목록이 명시되어 있다.

## 완료 보고 (전체 회귀 통과 후)

```text
[ ] TEST-001~014 전부 통과 (또는 의도적으로 수동 검토로 분류된 항목은 MANUAL_REVIEW_CHECKLIST.md로 확인)
[ ] docs/reviewer/FINAL_REVIEW.md 기준(단일 파일 제약, 코드 영역 소유권) 위반 없음
[ ] index.html이 다른 파일 의존 없이 브라우저에서 단독으로 열림
[ ] 4개 worktree 전부 정리(선택) 및 최종 커밋 정리
```

이 체크리스트를 모두 만족하면 MVP 구현이 완료된 것이다.

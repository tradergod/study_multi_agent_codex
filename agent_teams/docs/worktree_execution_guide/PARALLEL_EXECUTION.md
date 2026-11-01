Status: FINAL
Owner: Main
Inputs: docs/builder/IMPLEMENTATION_PLAN.md §1~4, docs/worktree_execution_guide/WORKTREE_PLAN.md
Last Updated: 2026-07-29
Related Decisions/Requirements: TASK-001~005

# PARALLEL_EXECUTION

**규모: worktree 4개 · 총 7턴 · 약 2시간~2시간30분.**

## 골격 선행 원칙

TASK-001(App Shell)은 **반드시** 모든 worktree 분기 전에 완료·병합돼야 한다. 이 단계에서 state 필드·selector·CSS 변수·함수 시그니처가 동결되므로, 이후 어떤 worktree도 이 단계를 건너뛰고 시작할 수 없다.

## 턴별 병렬/순차 매트릭스 (7턴)

| 턴 | 무엇을 | 병렬/순차 | 이유 |
|---|---|---|---|
| T1 | TASK-001 | 순차(단독) | 공유 표면 동결, 이후 전체가 이 결과에 의존 |
| T2, T3 | wt-ui(TASK-002), wt-persistence(TASK-004) 생성+구현 | **병렬 가능** | 코드 영역(HTML/CSS/JS 함수)이 완전히 겹치지 않음(FILE_OWNERSHIP.md 확인). wt-tests도 이 구간에서 병렬로 시작 가능 |
| T4 | wt-ui + wt-persistence 병합(한 턴에 함께) + 회귀 | 순차(병합) | Git 병합 자체는 순서대로 하되, 두 worktree가 독립적이라 같은 턴에 묶어 처리 가능 |
| T5 | wt-interaction(TASK-003) 생성+구현 | **코딩은 T2/T3와 동시 시작 가능**하나 **병합은 T4 이후** | 코드 영역은 독립적이나, `selectRequest`가 호출하는 `renderList/renderDetail`이 실제로 채워져 있어야 통합 테스트가 의미 있음 — 통합 테스트 실효성 문제이지 코드 충돌이 아님. 다만 본 계획은 T5를 T4 이후 턴으로 배치해 턴 수를 단순화한다 |
| T6 | wt-interaction 병합 + 회귀 | 순차 | — |
| T7 | wt-tests 마무리·병합 + 전체 회귀 + 최종 정리 | wt-tests 자체는 **항상 완전 병렬**(T2부터 언제든), 회귀·정리는 순차 | `index.html`을 건드리지 않는 별도 파일 작업이라 언제든 병렬, 최종 통합은 한 번에 |

## 충돌 구역 분리 확인

- wt-ui와 wt-persistence: HTML(LIST/DETAIL/HEADER/STATUS vs 없음), CSS(HEADER/LIST/DETAIL/STATUS vs 없음), JS(renderList/renderDetail vs safeLocalStorageGet/Set+initApp) — 겹침 없음.
- wt-ui와 wt-interaction: JS(renderList/renderDetail vs selectRequest/handleListClick/handleListKeydown/attachListEventListeners) — 겹침 없음. HTML/CSS는 wt-interaction이 아예 건드리지 않음.
- wt-interaction과 wt-persistence: 유일한 위험 지점이었던 `initApp()`/리스너 등록 위치는 `attachListEventListeners()` 신규 함수 도입으로 완전히 분리됨(Reviewer C-3 확인, FILE_OWNERSHIP.md 참고) — 겹침 없음.
- wt-tests: `index.html`을 전혀 수정하지 않으므로 다른 모든 worktree와 무조건 안전.

## 억지 병렬 금지 원칙 적용

이 프로젝트에서 "공유 state를 많이 건드려 순차가 필요한 조합"은 **없다** — TASK-001이 state를 완전히 동결했고 이후 Task는 state 필드를 추가/변경하지 않기 때문이다. 유일한 순차 제약(wt-interaction 병합이 wt-ui 병합 이후)은 코드 충돌이 아니라 통합 테스트 순서상의 이유이며, Reviewer가 이를 확인했다.

## Main(교육생) 상태 추적

```text
[ ] T1 base 병합 완료, 콘솔 에러 없음
[ ] T2 wt-ui 완료(로컬 확인)
[ ] T3 wt-persistence 완료(로컬 확인, T2와 병행)
[ ] T4 wt-ui + wt-persistence 병합 + TEST-001/002/005/006/007/008/013 통과
[ ] T5 wt-interaction 완료(로컬 확인)
[ ] T6 wt-interaction 병합 + TEST-004/006/009/010/011 통과 + 이전 통과 항목 재확인(회귀)
[ ] T7 wt-tests 마무리(index.html 미수정 확인) + 전체 회귀(TEST-001~014) + Reviewer 기준 최종 확인
```

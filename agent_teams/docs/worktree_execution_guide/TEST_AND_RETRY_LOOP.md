Status: FINAL
Owner: Main
Inputs: docs/tester/TEST_PLAN.md §6~7, docs/tester/TEST_CASES.md
Last Updated: 2026-07-29
Related Decisions/Requirements: TEST-001~014

# TEST_AND_RETRY_LOOP

## 기본 루프

```text
구현(worktree) → 자체 테스트(로컬에서 Definition of Done 확인)
  → commit
  → 검증(해당 TEST-### 실행)
  → 실패 시: 실패 증거 저장(TEST_PLAN.md §6 형식: 로그·스크린샷·재현 절차)
  → 제품 문제 vs 테스트 문제 판단
      제품 문제 → 원인 worktree로 반환, 수정 후 재검증
      테스트 문제 → wt-tests(Tester)로 반환, 테스트 자체 수정 후 재검증
  → 통과 시: Reviewer 기준(FILE_OWNERSHIP 준수) 확인 → 병합
  → 병합 후 회귀(이전 통합 항목 재확인)
```

## 제품 문제 vs 테스트 문제 구분 기준

| 신호 | 판단 |
|---|---|
| selector가 DOM에 아예 없음 | 제품 문제 — architecture 계약을 구현이 놓침 |
| selector는 있으나 속성/클래스 값이 기대와 다름(예: `data-needs-review` 누락) | 제품 문제 |
| 테스트가 architecture 문서에 없는 selector를 참조 | 테스트 문제 — wt-tests가 계약을 잘못 읽음 |
| 테스트가 정확한 문구(예: "리뷰 필요")를 하드코딩해 실패 | 테스트 문제 — REQ-002a에 따라 속성 기반으로 고쳐야 함 |
| 테스트 자체가 잘못된 mock 데이터 값(예: id=1의 assignee)을 기대 | 테스트 문제 |

## 반복 실패 시 Main 승격

같은 TEST-###가 원인 worktree에서 수정 후에도 2회 이상 실패하면 Main(교육생)에게 승격한다. 이때 확인할 것:

1. `docs/builder/TASK_BREAKDOWN.md`의 해당 Task 계약 자체가 모호하거나 잘못됐을 가능성(예: selector 이름 오기).
2. `docs/tester/TEST_CASES.md`의 기대값이 mock 데이터(INDEX_HTML_ARCHITECTURE.md §4)와 실제로 일치하는지.
3. 계약 수정이 필요하면 해당 문서를 먼저 고치고, 그 사유를 commit 메시지에 남긴 뒤 재구현한다 — 코드만 고치고 문서를 방치하지 않는다.

## 회귀 유지 원칙

매 병합 후에는 "새로 병합된 것"뿐 아니라 "이전에 이미 통과했던 것"도 다시 확인한다. 예: wt-interaction 병합(T6) 후에는 TEST-004/006/009/010/011뿐 아니라 T4에서 확인한 TEST-001/002/005/006/007/008/013도 재실행해 깨지지 않았는지 확인한다.

## 실패 증거 저장 (TEST_PLAN.md §6 그대로 적용)

- 로그: assertion 메시지, 기대값/실제값.
- 스크린샷: 실패 시점 페이지 캡처(`TEST-###_실패_YYYYMMDD.png`).
- 재현 절차: "사전 조건 → 조작 → 기대 결과" 3단계를 그대로 기록.
- 저장 위치: 검증 환경의 `test-results/` 폴더(제품 코드 `index.html`과 분리).

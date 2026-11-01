Status: FINAL
Owner: Main
Inputs: docs/MVP_SPEC.md, docs/builder/IMPLEMENTATION_PLAN.md, docs/builder/TASK_BREAKDOWN.md, docs/DECISION_LOG.md
Last Updated: 2026-07-29
Related Decisions/Requirements: DEC-001~004, TASK-001~005

# ROADMAP

이 문서는 MVP 설계 완료부터 Codex Desktop 구현 완료까지의 전체 흐름을 한 장으로 요약한다. 실행 세부는 `worktree_execution_guide/**`를 따른다.

## 0. 지금까지 완료된 것 (설계 단계)

- 사용자 원문 → 5 teammate(Researcher/Product Specifier/Builder Planner/Tester/Reviewer) 조사·명세·검토·반박 완료.
- BLOCKER 3건(Q-001/Q-002/Q-005) + 비차단 Q-003 사용자 확정 → DEC-001~004 기록.
- MVP_SPEC.md, builder/**, tester/**, reviewer/** 전부 Status FINAL(또는 최종 승인).
- ACCEPTANCE_CRITERIA.md·REQUIREMENT_TRACEABILITY.md·FILE_OWNERSHIP.md 조립 완료.

## 1. MVP 범위 한 줄 요약

코드리뷰/이슈 요청 목록(mock, 6개 항목)에서 항목을 선택하면 오른쪽 고정 패널에 우선순위(P0/P1/P2)·리뷰 필요 여부·담당·다음 액션을 보여주는 데스크톱 전용 단일 화면 웹앱. 데이터는 완전 정적, 새로고침 시 선택 초기화, 반응형 없음.

## 2. 실행 규모 (§2.1 상한 확인)

- 화면 1개, 핵심 상호작용 1개(목록 선택 → 상세 확인).
- Worktree 4개: `wt-ui`, `wt-interaction`, `wt-persistence`, `wt-tests`.
- 총 **7턴**(6~8턴 범위), 약 **2시간~2시간30분**.

## 3. 실행 단계 (Codex Desktop, 총 7턴)

```text
[턴 0] 준비 — docs/CODEX_HANDOFF.md부터 순서대로 읽기
[T1] TASK-001 App Shell — base 브랜치에서 골격·공유 표면 동결
[T2] wt-ui 생성+구현 — TASK-002 (List/Detail 렌더링 + CSS, wt-persistence와 병렬)
[T3] wt-persistence 생성+구현 — TASK-004 (localStorage 안전 래퍼 + init, wt-ui와 병렬)
[T4] wt-ui + wt-persistence 병합(한 턴에 함께) + 회귀
[T5] wt-interaction 생성+구현 — TASK-003 (선택 상호작용, wt-ui 병합 이후 시작)
[T6] wt-interaction 병합 + 회귀
[T7] wt-tests 마무리+병합(언제든 병렬 가능, 늦어도 여기까지) + 전체 회귀(TEST-001~014) + Reviewer 기준 최종 확인·정리
```

턴 수·순서의 세부 프롬프트와 완료 체크포인트는 `worktree_execution_guide/WORKTREE_PLAN.md`를 따른다.

## 4. 병합 순서 (FILE_OWNERSHIP.md와 동일)

1. (base) TASK-001
2. wt-ui (TASK-002)
3. wt-persistence (TASK-004)
4. wt-interaction (TASK-003)
5. wt-tests (TASK-005)

## 5. POST_MVP (이번 로드맵 밖)

필터/정렬(POST_MVP-1), 편집(POST_MVP-2), 실 API 연동(POST_MVP-3), 라우팅/알림(POST_MVP-4), 검색(POST_MVP-5), 추가/편집 폼(POST_MVP-6), 반응형(POST_MVP-7). 전부 이번 실행에서 착수하지 않는다.

## 6. 리스크 (TASK_BREAKDOWN.md 근거)

| RISK | 내용 | 대응 |
|---|---|---|
| RISK-001 | TASK-001 골격 단계 selector/state 오류 시 전체 영향 | 완료 즉시 Tester·Reviewer 확인 후 worktree 분기 |
| RISK-002 | wt-ui가 placeholder 문구 추가하며 selector 늘리면 wt-interaction과 충돌 가능 | selector는 유지, 텍스트만 변경 |
| RISK-003 | 이벤트 리스너를 개별 항목에 바인딩하면 재렌더 시 유실 | `#app-list`에 위임(delegation) 필수 |
| RISK-004 | (해소됨) Q-002가 B안이었다면 재작업 필요했을 위험 | DEC-002 확정으로 해당 없음 |
| RISK-005 | 테스트가 텍스트 문구에 의존하면 사소한 문구 수정에도 깨짐 | selector/속성 기반 검증 우선 |

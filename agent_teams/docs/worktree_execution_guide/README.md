Status: FINAL
Owner: Main
Inputs: docs/builder/IMPLEMENTATION_PLAN.md, docs/builder/TASK_BREAKDOWN.md, CLAUDE.md §11
Last Updated: 2026-07-29
Related Decisions/Requirements: TASK-001~005, DEC-001~003

# worktree_execution_guide — README

이 폴더는 교육생이 Codex Desktop에서 **문서와 commit만으로** 이 MVP를 완성하기 위한 실습 런북이다. 명령어 나열이 아니라 "그대로 따라 하면 끝나는" 교안이다.

## 전체 흐름

```text
docs/CODEX_HANDOFF.md 읽기
  → FILE_OWNERSHIP.md (누가 어떤 코드 영역을 소유하는지)
  → ROADMAP.md (전체 턴 요약)
  → worktree_execution_guide/README.md (지금 이 문서)
  → WORKTREE_PLAN.md (턴별 정확한 명령·프롬프트·완료 체크포인트)
  → PARALLEL_EXECUTION.md (언제 병렬/순차인지)
  → 구현 진행 (Builder → Tester → Reviewer → Main 사이클, 아래 참고)
  → HANDOFF_PROTOCOL.md (Task 사이 전달 계약)
  → TEST_AND_RETRY_LOOP.md (구현→테스트→실패시 반환→재검증 반복)
  → MERGE_GUIDE.md (병합 전 체크·순서·회귀)
```

## Builder → Tester → Reviewer → Main 사이클

이 프로젝트의 설계 단계에서 이미 5명의 teammate(Researcher/Product Specifier/Builder Planner/Tester/Reviewer)가 `docs/`를 완성했다. Codex 구현 단계에서는 이 사이클이 **문서 대신 실제 코드**로 반복된다:

1. Codex(교육생)가 worktree에서 `docs/builder/TASK_BREAKDOWN.md`의 지시대로 코드를 작성한다.
2. 작성 후 `docs/tester/TEST_CASES.md`의 해당 TEST-###를 직접 실행(또는 눈으로 확인)해 Definition of Done을 만족하는지 확인한다.
3. Main(교육생 자신 또는 Codex 상위 세션)이 병합 전 `docs/reviewer/FINAL_REVIEW.md` 기준(단일 파일 제약·코드 영역 소유권)을 어기지 않았는지 확인한다.
4. 실패하면 TEST_AND_RETRY_LOOP.md의 절차대로 원인 worktree로 되돌린다.

## "문서와 commit이 계약이다"

- 각 worktree는 `docs/builder/TASK_BREAKDOWN.md`의 자기 TASK-### 항목(Allowed/Forbidden Code Areas)만 수정한다.
- 코드 리뷰는 이 계약(FILE_OWNERSHIP.md) 위반 여부를 우선 확인한다.
- 대화로 설명하지 말고, 계약을 벗어난 수정이 필요하면 TASK_BREAKDOWN.md/INDEX_HTML_ARCHITECTURE.md를 먼저 고치고 commit 메시지에 사유를 남긴다.

## 예상 규모

- Worktree 4개: `wt-ui`, `wt-interaction`, `wt-persistence`, `wt-tests`.
- 총 **7턴**(6~8턴 범위), 약 **2시간~2시간30분**.
- 턴별 정확한 절차는 `WORKTREE_PLAN.md`를 그대로 따른다.

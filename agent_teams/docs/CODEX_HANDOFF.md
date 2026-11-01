Status: FINAL
Owner: Main
Inputs: docs/MVP_SPEC.md, docs/DECISION_LOG.md, docs/FILE_OWNERSHIP.md, docs/ROADMAP.md, docs/worktree_execution_guide/**, docs/reviewer/FINAL_REVIEW.md
Last Updated: 2026-07-29
Related Decisions/Requirements: DEC-001~004, TASK-001~005

# CODEX_HANDOFF

Codex Desktop Main이 처음 읽을 브리프. 이 문서와 `docs/` 전체만으로 시작할 수 있다 — 이전 대화 기록에 의존하지 않는다.

## 1. 프로젝트 목적과 제약

코드리뷰/이슈 요청 목록에서 항목을 선택하면 우선순위(P0/P1/P2)·리뷰 필요 여부·담당·다음 액션을 오른쪽 고정 패널에 보여주는 **단일 standalone `index.html` 하나**로 구현되는 MVP.

**절대 제약:** React/Vue/Svelte/npm/패키지/bundler/build step/별도 `.css`·`.js` 파일/backend/DB/인증 서버/브라우저 내 비밀 API 키 — 전부 금지. 데이터는 완전 정적 mock(JS 배열, 코드에 하드코딩). `<head>`에 `<style>` 하나, `<body>` 끝에 `<script>` 하나만 존재하는 단일 파일 유지.

## 2. 읽을 문서 순서 (반드시 이 순서로)

```text
1. docs/CODEX_HANDOFF.md        (이 문서)
2. docs/FILE_OWNERSHIP.md       (누가 어떤 코드 영역을 소유하는지)
3. docs/ROADMAP.md              (전체 턴 요약)
4. docs/worktree_execution_guide/README.md
5. docs/worktree_execution_guide/WORKTREE_PLAN.md   (턴별 정확한 명령·프롬프트·완료 체크포인트)
6. docs/worktree_execution_guide/PARALLEL_EXECUTION.md
7. docs/worktree_execution_guide/HANDOFF_PROTOCOL.md
8. docs/worktree_execution_guide/TEST_AND_RETRY_LOOP.md
9. docs/worktree_execution_guide/MERGE_GUIDE.md
```

세부 구현 계약(selector·state·함수)은 `docs/builder/INDEX_HTML_ARCHITECTURE.md`·`TASK_BREAKDOWN.md`·`IMPLEMENTATION_PLAN.md`에, 검증 기준은 `docs/tester/TEST_PLAN.md`·`TEST_CASES.md`·`MANUAL_REVIEW_CHECKLIST.md`에 있다. 필요할 때마다 참조한다.

## 3. 변경 금지 — 사용자 확정 결정 (docs/DECISION_LOG.md)

- **DEC-001:** 상세 정보는 오른쪽 고정 패널(2-컬럼 레이아웃)로 표시한다. Drawer/모달/아코디언 방식으로 바꾸지 않는다.
- **DEC-002:** 새로고침 시 선택 상태는 항상 초기화된다. localStorage로 선택 항목을 유지하는 기능을 추가하지 않는다.
- **DEC-003:** 데스크톱 전용이다. 반응형/모바일 레이아웃 전환을 구현하지 않는다(POST_MVP-7).
- **DEC-004:** 우선순위/담당자 필터·정렬은 MVP에 포함하지 않는다(POST_MVP-1). 목록에 필터 UI나 정렬 컨트롤을 추가하지 않는다.

이 네 가지는 사용자가 직접 답변해 확정한 것이므로, Codex가 "더 낫다고 판단해도" 임의로 바꾸지 않는다. 변경이 필요하다고 판단되면 구현을 멈추고 사용자에게 먼저 확인한다.

## 4. Worktree 생성·코드 영역 소유권 규칙

`docs/FILE_OWNERSHIP.md`에 정의된 대로, 4개 worktree(`wt-ui`/`wt-interaction`/`wt-persistence`/`wt-tests`)가 서로 겹치지 않는 코드 영역만 수정한다. 각 worktree는 자신에게 배정된 HTML 앵커/CSS 섹션/JS 함수 **밖의 코드를 수정하지 않는다.** 특히 `initApp()`(wt-persistence 전담)과 `attachListEventListeners()`(wt-interaction 전담)는 서로 다른 함수이며 절대 서로의 영역을 침범하지 않는다 — 이 경계가 이번 설계에서 가장 정교하게 정리된 부분이다(Reviewer 최종 확인 완료).

## 5. 병렬 시작 순서

```text
1. 선행 골격(TASK-001)을 먼저 완성 — state/selector/CSS 변수/함수 시그니처를 동결한다.
2. 골격이 base에 병합된 뒤에만 worktree를 분기한다.
3. wt-ui와 wt-persistence는 코드 영역이 완전히 독립적이므로 병렬 진행 가능.
4. wt-interaction은 코딩은 병렬 가능하나, 병합은 wt-ui 병합 이후로 순서를 지킨다.
5. wt-tests는 index.html을 건드리지 않으므로 언제든 완전 병렬.
```

세부 턴별 스텝(정확한 git 명령·붙여넣기 프롬프트·완료 체크포인트)은 `docs/worktree_execution_guide/WORKTREE_PLAN.md`를 그대로 따른다.

## 6. 예상 규모

Worktree 3~4개(정확히 4개: wt-ui/wt-interaction/wt-persistence/wt-tests), 총 **7턴**(6~8턴 범위), **2시간~2시간30분**. 턴별 런북은 `docs/worktree_execution_guide/WORKTREE_PLAN.md`에 있다.

## 7. Tester 검증·실패 시 반환

각 worktree 구현 완료 후 `docs/tester/TEST_CASES.md`의 해당 TEST-###를 실행한다. 실패하면 `docs/worktree_execution_guide/TEST_AND_RETRY_LOOP.md`의 기준으로 "제품 문제"(구현이 계약과 다름 → 원인 worktree로 반환)와 "테스트 문제"(테스트 자체가 잘못됨 → wt-tests로 반환)를 구분해 처리한다. 같은 테스트가 2회 이상 반복 실패하면 Main(교육생)에게 승격해 계약 자체를 재검토한다.

## 8. 병합 전 확인 증거

병합 직전 `docs/worktree_execution_guide/MERGE_GUIDE.md`의 체크리스트(코드 영역 준수·단일 파일 제약·Definition of Done·해당 TEST-### 통과)를 확인한다. 매 병합 후에는 새로 병합된 것뿐 아니라 이전에 통과했던 테스트도 재실행해 회귀를 확인한다.

## 9. 비차단 남은 항목

없음. `docs/OPEN_DECISIONS.md`의 Q-003(우선순위/담당자 필터·정렬)은 사용자가 B안(POST_MVP-1 유지)으로 명시적으로 확정 회신해 DEC-004로 기록됐다(더 이상 열린 질문 아님).

## 10. 첫 Codex Main 시작 프롬프트

```text
docs/CODEX_HANDOFF.md부터 지정된 순서(FILE_OWNERSHIP → ROADMAP →
worktree_execution_guide/README → WORKTREE_PLAN)대로 읽어라. 사용자 확정 결정을
바꾸지 말고, 먼저 index.html 골격을 만들어 공유 표면(state·CSS 변수·selector·앵커)을
확정한 뒤, WORKTREE_PLAN의 턴별 스텝(짧은 프롬프트)대로 목적이 다른 worktree
3~4개를 만들어 구현하라. 각 worktree는 허용된 코드 영역만 수정하고, Tester 검증과
Reviewer 기준을 통과한 commit만 Main에서 순차 통합·회귀하라. 전체는 총 7턴
(6~8턴 범위)/2시간~2시간30분을 목표로 한다.
```

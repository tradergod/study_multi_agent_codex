Status: FINAL
Owner: Reviewer
Inputs: docs/PROJECT_CONTEXT.md, docs/MVP_SPEC.md, docs/researcher/RESEARCH_REPORT.md, docs/builder/INDEX_HTML_ARCHITECTURE.md, docs/builder/IMPLEMENTATION_PLAN.md, docs/builder/TASK_BREAKDOWN.md, docs/tester/TEST_PLAN.md, docs/tester/TEST_CASES.md, docs/tester/MANUAL_REVIEW_CHECKLIST.md, docs/DECISION_LOG.md, docs/OPEN_DECISIONS.md, CLAUDE.md §2/§2.1
Last Updated: 2026-07-29 (2차 재검토, 승인 유지 — DEC-001~003 반영 확인, FINAL_REVIEW.md §0.1 참고)
Related Decisions/Requirements: REQ-001~007, REQ-002a, DEC-001, DEC-002, DEC-003, Q-003(비차단)

# SCOPE_REVIEW

## 1. 사용자 원문 대조

사용자 원문(PROJECT_CONTEXT.md):
> 팀에 쏟아지는 코드리뷰/이슈 요청을 우선순위와 담당이 한눈에 보이도록, 요청 목록에서 항목을 고르면 우선순위(P0/P1/P2)·리뷰 필요 여부·담당·다음 액션을 오른쪽 상세로 보여주는 단일 페이지 웹앱을 만들고 싶다.

| 원문 요소 | MVP_SPEC 반영 여부 | 판정 |
|---|---|---|
| 요청 목록 | REQ-001 | 반영됨 |
| 우선순위(P0/P1/P2) | REQ-002, §6 데이터 모델 | 반영됨 |
| 리뷰 필요 여부 | REQ-002, REQ-002a | 반영됨 |
| 담당 | REQ-002, §6 `assignee` | 반영됨 |
| 다음 액션 | REQ-002, §6 `nextAction` | 반영됨 |
| "오른쪽 상세" | §3, §9 임시값(A안 오른쪽 고정 패널) | 반영됨 — 단, Q-001 미확정이므로 임시값임을 명시한 것은 적절 |
| "한눈에 보이도록" | 우선순위 배지 시각 구분(REQ-006, `.priority-badge[data-priority]`) | 반영됨 |
| "고르면" (선택 상호작용) | REQ-002, Flow A | 반영됨 |

**침범 목록:** 사용자가 명시하지 않은 기능(필터/정렬/편집/실시간 연동)을 MVP 필수로 승격한 사례 없음. 확인됨.

**누락 목록:** 없음. 원문의 4개 필드·목록→상세 상호작용·"오른쪽"이라는 배치 힌트가 모두 문서에 존재한다.

## 2. MVP 범위 과다·과소 판정

**판정: 적정 (과다·과소 아님).**

- 핵심 상호작용은 "목록 선택 → 상세 갱신" 1개로 명확히 좁혀졌고, 필터/검색/편집/추가폼은 모두 POST_MVP-1/2/5/6으로 공격적으로 내려졌다. §2.1(핵심 상호작용 1~2개) 상한 안이다.
- 화면은 1개(단일 view), mock 데이터는 완전 정적 6개 항목으로 §2.1 조건을 만족한다.
- Status 영역(선택)을 Builder Planner가 "정적 텍스트 1줄, 이벤트 없음"으로 축소 확정한 것(TASK_BREAKDOWN.md TASK-002, INDEX_HTML_ARCHITECTURE.md §12 CHALLENGE)은 적절한 범위 보호 조치로 판단한다.
- 반응형(모바일)을 POST_MVP-7로 내린 것도 §2.1 상한 보호에 부합한다(Q-005 확정 전까지 임시값 유지 타당).

**조정 요청 없음** — 다만 아래 §4의 개별 REVISION_REQUEST는 범위 자체보다 "문서 실행 가능성" 문제다.

## 3. 단일 파일 제약(§2) 위반 탐지

전 8개 문서를 검사한 결과 **위반 사례를 발견하지 못했다.**

- React/Vue/Svelte, npm/패키지/bundler/build step: 언급 없음.
- 별도 `.css`/`.js` 파일: INDEX_HTML_ARCHITECTURE.md는 `<style>`/`<script>` 임베드를 명시하고 있고, TASK-005(wt-tests)만 `index.html` 외부 파일(테스트 자산)을 다루며 "index.html 전체 수정 금지"를 스스로 명시함 — 올바른 격리.
- backend/DB/인증 서버: 없음. Researcher가 GitHub API 실연동 가능성을 §2 위반으로 선제 CHALLENGE했고(RESEARCH_REPORT.md §8), Product Specifier/Builder Planner 모두 mock 정적 데이터로 확정 — 적절히 차단됨.
- 브라우저 내 비밀 API 키: 없음.
- Playwright: 검증 환경 전용이며 TEST_PLAN.md §4가 "index.html 자체에는 어떤 npm 패키지·스크립트 태그·빌드 도구도 추가하지 않는다"고 명시 — 적절.
- `<dialog>` 논의(Researcher/Builder Planner §12 CHALLENGE 철회): 네이티브 브라우저 API이므로 §2 위반 아님. 단, 현재 Q-001 임시값(A안 고정 패널)에서는 사용되지 않으므로 위반 소지 자체가 없음.

**판정: 위반 없음.**

## 4. 실행 가능성 관점 REVISION_REQUEST (범위 문제 아님 — 문서 간 실행 정합성 문제, §5 FINAL_REVIEW와 연결)

아래는 범위 축소 요청이 아니라, 이미 확정된 결정이 실행 문서(Builder/Tester 산출물)에 **완전히 반영되지 않은 지점**이다. 세부 근거는 FINAL_REVIEW.md §2에 정리했다.

- `[REVISION_REQUEST] → Builder Planner`: REQ-002a(`data-needs-review` 속성)가 MVP_SPEC.md에서 이미 확정(§9 "확정")되었음에도 INDEX_HTML_ARCHITECTURE.md §2 selector 표의 "리뷰 필요 여부 필드" 행 Role/속성 칸이 여전히 `—`로 비어 있다. TASK-002 Implementation Requirements에도 이 속성 부여가 명시되지 않았다.
- `[REVISION_REQUEST] → Builder Planner`: TASK-001의 HTML Implementation Requirements 목록에 §8 접근성 요구가 요구하는 `<h2>`(목록/상세 영역 heading)가 빠져 있다.
- `[REVISION_REQUEST] → Builder Planner`: TASK-003(wt-interaction)의 "Allowed Code Areas" 문구가 자체 모순적이다 — "INIT 블록 내 바인딩 호출 1줄 추가는 허용되나 `initApp()` 본문 자체는 수정 금지"라고 되어 있는데, INDEX_HTML_ARCHITECTURE.md §1 골격 트리에서 `INIT` 섹션과 `initApp()`가 사실상 같은 블록으로 보여 두 worktree(wt-interaction·wt-persistence)가 같은 코드 영역을 동시에 건드릴 위험이 있다.
- `[REVISION_REQUEST] → Tester`: TEST_PLAN.md §7(빈 상태 자동화 제안)과 §8(`data-needs-review` 속성 제안)은 이미 Builder Planner/Product Specifier가 채택을 확정했음에도 문서에는 여전히 "제안"·"미채택 시" 조건문으로 남아 있다. TEST_CASES.md TEST-005/TEST-007도 동일하게 조건부 표현이 남아있어, 이미 끝난 결정을 다시 열어놓은 것처럼 읽힌다.

## 5. POST_MVP 이동 권고

추가 권고 없음 — 현재 POST_MVP-1~7 분류가 모두 §2.1 상한 보호 논리에 부합하고, 사용자 원문에 없는 기능만 정확히 내려가 있다.

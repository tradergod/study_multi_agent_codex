Status: DRAFT
Owner: Tester
Inputs: docs/MVP_SPEC.md (Product Specifier), docs/builder/INDEX_HTML_ARCHITECTURE.md §2/§5~10 (Builder Planner), docs/builder/TASK_BREAKDOWN.md, CLAUDE.md §2/§2.1
Last Updated: 2026-07-29
Related Decisions/Requirements: REQ-001~007, DEC-001(Q-001 확정), DEC-002(Q-002 확정), DEC-003(Q-005 확정)

# TEST_PLAN

## 1. 범위와 전략

이 MVP는 §2.1 상한(화면 1개, 핵심 상호작용 1~2개, worktree 3~4개)에 맞춰 **스모크 수준**으로만 검증한다. 목표는 "구현이 깨졌는지 즉시 알 수 있는 최소 자동 테스트"이지, 전수 조합 테스트가 아니다.

- 자동 테스트 대상: REQ-001, REQ-002, REQ-003, REQ-004, REQ-006, §8 접근성(가능한 항목), 재클릭 무효과, REQ-007(부분 자동화 — 아래 §3 참고).
- 수동 검토 대상: 콘텐츠의 의미적 적절성, 시각 디자인 완성도, 배지 색상 구분의 실제 가독성, REQ-007의 "느낌상 자연스러움"(자동은 에러 미발생만 확인), DEC-001(오른쪽 고정 패널) 확정 배치의 레이아웃 완성도.
- 커버하는 흐름: Flow A(목록→선택→상세 갱신), Flow B(빈 데이터). Product Specifier가 정의한 두 흐름 외 신규 흐름은 만들지 않는다(§2.1 상한 보호, Reviewer 검토 대상).

## 2. 자동 vs 수동 경계 원칙

| 원칙 | 설명 |
|---|---|
| Selector/속성 기준 | 모든 자동 테스트는 INDEX_HTML_ARCHITECTURE.md §2/§10의 동결 selector와 `data-*`/`role`/`aria-*` 속성만 사용한다. 텍스트 문구(placeholder 안내문 등)는 정확한 존재 여부가 아니라 "비어있지 않음"/"패턴 일치" 정도로만 느슨하게 검사한다(문구 수정에 깨지지 않도록). |
| 내부 함수명 비의존 | `renderList()`/`selectRequest()` 등 JS 함수명이나 내부 구현 방식을 테스트가 직접 호출·검사하지 않는다. 오직 사용자가 보는 DOM·동작만 검증한다. |
| 실행 불가능한 의미 품질은 자동화 주장 금지 | "디자인이 보기 좋다", "문구가 자연스럽다" 같은 항목은 자동 테스트로 만들지 않고 MANUAL_REVIEW_CHECKLIST.md로 이관한다. |
| 실행한 것만 통과 기록 | 이 문서 작성 시점에는 아직 `index.html`이 구현되지 않았으므로(TASK-001~004 진행 전) 아래 테스트는 **설계됨** 상태이며 **실행/통과 기록은 Codex 구현 이후 Tester/Main이 실제 실행한 뒤에만** 채운다. 이 문서 자체에 "통과"라고 적지 않는다. |

## 3. REQ-005·REQ-007의 자동화 한계 (중요 — Builder Planner에 REVISION_REQUEST 근거)

- REQ-005(완전 정적 mock, 추가/수정 폼 없음)는 "폼이 없다"는 **부재 증명**은 자동화 가능(`input[type=text]`, `form` 등 추가/편집 관련 요소가 DOM에 없음을 확인)하지만, "데이터가 정적임" 자체는 코드 리뷰 성격이라 일부는 수동 검토로 남긴다.
- REQ-003(빈 상태)은 원래 architecture 문서(§4)에 따르면 `state.requests`를 `[]`로 **직접 코드 수정**해야 재현 가능해 회귀 자동화에 취약했으나, Builder Planner가 `?empty=1` URL 파라미터 방식을 채택해(§7 `[RESOLVED]` 참고) 이제 **완전 자동 회귀**로 해결되었다.
- REQ-007(localStorage 실패 허용)은 브라우저 devtools에서 `localStorage.setItem/getItem`을 강제로 throw하도록 덮어쓰는 방식(architecture §4 TASK-004 DoD 참고)이 필요해 완전 자동화(예: Playwright의 `page.addInitScript`로 `localStorage` 접근을 오염시키는 방식)는 가능하지만, "정상 동작처럼 보인다"는 최종 판단은 수동 검토로 분리한다. 자동은 "에러 없이 목록/상세가 렌더된다"까지만 검증한다.

## 4. 도구와 제품 코드 비침습 원칙

- 검증 도구로 Playwright(E2E) + 필요 시 간단한 DOM assertion 스크립트(브라우저 콘솔 또는 Node에서 `index.html`을 로드해 실행)를 사용할 수 있다. Testing Library류는 별도 프레임워크 컴포넌트가 아니므로 이 프로젝트에는 적용하지 않는다(순수 DOM이므로 Playwright locator로 충분).
- 테스트 도구·의존성(Playwright 등)은 **검증 환경에만** 설치한다. `index.html` 자체에는 어떤 npm 패키지·스크립트 태그·빌드 도구도 추가하지 않는다(CLAUDE.md §2, TASK_BREAKDOWN.md TASK-005 Forbidden Code Areas와 동일 원칙).
- 테스트 파일은 `index.html`과 완전히 분리된 위치(예: 검증 환경의 `tests/` 폴더, 이 저장소에서는 `docs/tester/**` 문서로 계약만 정의하고 실제 `.spec.js` 파일은 Codex 구현 단계에서 wt-tests worktree가 생성)에 둔다.

## 5. viewport 기준값

DEC-003(Q-005 확정: 데스크톱 전용)에 따라 이 MVP는 반응형/모바일 레이아웃을 전혀 구현하지 않는다. viewport는 **desktop(1280×800) 단일 기준으로 확정**한다.

| viewport 이름 | 크기 | 사용 여부 |
|---|---|---|
| desktop (유일 기준) | 1280×800 | 모든 TEST-### 실행 기준 |

mobile viewport는 정의하지 않는다. 반응형 테스트는 이 MVP 범위에서 완전히 제외되며(POST_MVP-7, TEST_CASES.md TEST-90x 참고), Q-005 재논의가 없는 한 향후 라운드에서도 추가하지 않는다.

DEC-001(Q-001 확정: 오른쪽 고정 패널)에 따라 TEST-004~006은 상세 패널이 항상 `#app-main` 오른쪽 컬럼에 고정 표시된다는 확정 전제로 작성됐다. DEC-002(Q-002 확정: 새로고침 후 미유지)에 따라 TEST-012는 "새로고침 후 항상 초기 상태로 복귀"를 확정 기대 결과로 검증한다.

## 6. 실패 증거 저장 규칙

- **로그**: 실패한 테스트의 Playwright 콘솔 출력(assertion 메시지, 기대값/실제값)을 텍스트로 보존한다.
- **스크린샷**: 실패 시점의 페이지 스크린샷을 저장한다(Playwright `page.screenshot()` 사용, 파일명 규칙: `TEST-###_실패_YYYYMMDD.png`).
- **재현 절차**: 실패한 TEST-###의 "사전 조건 → 조작 → 기대 결과" 3단계를 그대로 재현 스크립트 주석에 남겨, 사람이 브라우저에서 수동으로도 동일하게 재현할 수 있게 한다.
- **저장 위치**: 검증 환경의 별도 `test-results/` 폴더(제품 코드 `index.html`과 분리, `docs/`에는 결과 요약만 필요 시 기록).
- 실패는 "제품 문제"(구현이 architecture 계약과 다름)와 "테스트 문제"(selector 오타, 잘못된 기대값)로 구분해 기록하고, 제품 문제면 해당 Task 담당 worktree로, 테스트 문제면 Tester 자신에게 반환한다(WORKTREE_PLAN의 TEST_AND_RETRY_LOOP과 연결, Main이 종합).

## 7. `[RESOLVED]` — REQ-003 빈 상태 자동 회귀 (전: `[REVISION_REQUEST]` → Builder Planner)

빈 상태(REQ-003) 재현이 소스 코드 직접 수정에 의존하는 문제를 제기했고, Builder Planner가 **제안 A를 채택**했다: URL 쿼리 파라미터 `?empty=1`이 있을 때만 `initApp()`에서 `state.requests = []`로 덮어쓰는 1줄 분기가 INDEX_HTML_ARCHITECTURE.md §7·TASK_BREAKDOWN.md TASK-004(wt-persistence)에 반영됨.

결과: TEST-007/TEST-008(TEST_CASES.md)은 `page.goto('index.html?empty=1')` 사전 조건으로 **확정된 자동 테스트**로 격상했다. MANUAL_REVIEW_CHECKLIST.md의 "REQ-003 수동 확인" 항목은 해소되어 제거(취소선 처리)했다.

## 8. `[RESOLVED]` — `#detail-needs-review` 검증 속성 (전: `[CHALLENGE]` → Product Specifier)

MVP_SPEC.md REQ-002가 "리뷰 필요 여부" 화면 표현을 예시 문구로만 남겨 자동 테스트가 문구 변경에 취약하다는 문제를 제기했고, **제안 1(`#detail-needs-review`에 `data-needs-review="true|false"` 속성 추가)이 Product Specifier·Builder Planner에 의해 채택 확정**되었다. 사람이 읽는 텍스트 문구는 자유롭게 바뀔 수 있고, 자동 테스트는 이 속성만 검사한다(문구 적절성은 MANUAL_REVIEW_CHECKLIST.md에서 다룸).

결과: TEST_CASES.md의 관련 테스트(TEST-005)는 `data-needs-review` 속성 검사로 확정했고, "미확정 시 텍스트 loose match" 같은 대체 문구는 모두 제거했다.

## 9. `[RESOLVED]` — DEC-001/DEC-002/DEC-003 반영 확정 (전: "Q-001/Q-002/Q-005 영향 요약")

사용자가 세 BLOCKER를 모두 확정했다(DECISION_LOG.md). 아래는 확정값 기준으로 정리한 최종 테스트 전제이며, 더 이상 "결정이 바뀌면" 대비 표가 아니다(재논의가 없는 한 갱신 불필요).

| 결정 | 확정값 | 반영된 테스트 |
|---|---|---|
| DEC-001 (Q-001) | 오른쪽 고정 패널(데스크톱 2-컬럼 고정) | TEST-004~006: 상세 패널이 항상 `#app-main` 오른쪽 컬럼에 DOM으로 존재한다고 확정 전제 |
| DEC-002 (Q-002) | 새로고침 후 선택 상태 미유지 | TEST-012: 새로고침 후 `state.selectedId`가 항상 초기화(placeholder 복귀)됨을 확정 기대 결과로 검증 |
| DEC-003 (Q-005) | 데스크톱 전용, 반응형 미구현 | 반응형 테스트 자체를 만들지 않음(§5). TEST_CASES.md TEST-90x는 "이 MVP 범위에서 완전히 제외(POST_MVP-7)"로 명시 |

Status: FINAL
Owner: Reviewer
Inputs: docs/MVP_SPEC.md, docs/builder/INDEX_HTML_ARCHITECTURE.md, docs/builder/IMPLEMENTATION_PLAN.md, docs/builder/TASK_BREAKDOWN.md, docs/tester/TEST_PLAN.md, docs/tester/TEST_CASES.md, docs/tester/MANUAL_REVIEW_CHECKLIST.md, docs/reviewer/SCOPE_REVIEW.md, docs/DECISION_LOG.md, docs/OPEN_DECISIONS.md
Last Updated: 2026-07-29 (2차 재검토, 승인 유지 — §0.1 참고)
Related Decisions/Requirements: REQ-001~007, REQ-002a, DEC-001, DEC-002, DEC-003, Q-003(비차단)

# FINAL_REVIEW

## 0.1 2차 재검토 (DEC-001~003 반영 확인, 2026-07-29)

사용자가 Q-001/Q-002/Q-005 BLOCKER 3건에 모두 권장안(A안)으로 답변해 `docs/DECISION_LOG.md`에 DEC-001~003으로 확정됐다. Product Specifier(MVP_SPEC.md → Status FINAL 전환), Builder Planner(architecture·TASK_BREAKDOWN·IMPLEMENTATION_PLAN), Tester(TEST_PLAN·TEST_CASES)가 각자 문서를 갱신했다고 보고해, MVP_SPEC.md·DECISION_LOG.md·OPEN_DECISIONS.md와 builder/tester 6개 문서 전체를 처음부터 다시 읽고 아래 4개 항목을 확인했다.

**1) MVP_SPEC.md §7 재작성 ↔ builder/tester 일치 여부 — 일치 확인.**
- MVP_SPEC.md §7이 "데스크톱 전용 확정, POST_MVP-7로 완전 분리"로 재작성됨(과거 "768px 반응형" 조건부 서술 제거 확인).
- INDEX_HTML_ARCHITECTURE.md §1(골격 트리에 "RESPONSIVE 섹션 없음" 명시)·§3(CSS 섹션 표에서 RESPONSIVE 행 삭제, `overflow-x:auto` 1줄만 안전장치로 남김)·§9(결정 확정 이력 표)에서 반응형 관련 서술이 전부 "제거됨/확정됨"으로 일관되게 정리됨.
- TASK_BREAKDOWN.md TASK-002 Allowed/Forbidden Code Areas, IMPLEMENTATION_PLAN.md §3·§5.1 FILE_OWNERSHIP 표 모두 "RESPONSIVE 섹션 없음 — DEC-003 확정", "`@media`/`matchMedia` 반응형 분기 추가(범위 밖)"로 동일하게 반영됨.
- TEST_PLAN.md §5(viewport)가 desktop 단일 기준으로 정리되고 mobile 행 자체가 삭제됨(과거 "조건부" 표는 폐기). TEST_CASES.md TEST-90x가 "확정 제외 — 미결정이라 보류가 아니라 확정되어 범위 밖"으로 명확히 재작성됨.
- 8개 문서 전체에서 반응형 관련 잔재(조건부 문구, `matchMedia`, `RESPONSIVE` 섹션, `state.mobileView` 등)가 남아있는 곳을 발견하지 못했다.

**2) 이전 재검토(C-1~C-4) 사항 재훼손 여부 — 훼손 없음, 그대로 유지됨.**
- C-3(`attachListEventListeners()` 소유권 분리)이 이번 편집으로 건드려지지 않았는지 특히 주의해서 대조했다: INDEX_HTML_ARCHITECTURE.md §6/§7/§7.1, TASK_BREAKDOWN.md TASK-001/003/004, IMPLEMENTATION_PLAN.md §5.1 모두 1차 재검토 시점과 동일한 소유권 문구(`attachListEventListeners()` 본문=TASK-003 전담, `initApp()` 본문=TASK-004 전담, 호출 두 줄은 TASK-001 고정)를 그대로 유지하고 있다.
- C-1(`data-needs-review` 속성)·C-2(`<h2>` 헤딩)·C-4(Tester 확정 표현) 관련 문구도 이번 DEC 반영 편집 과정에서 삭제·변형되지 않고 그대로 남아 있음을 확인했다.

**3) MVP_SPEC.md FINAL 전환의 §9 완료 조건 부합 여부 — 부합.**
- "화면·상태·동작이 구현 가능한 수준으로 구체적"이라는 기준에 비추어: §2(요구사항 REQ-001~007)·§4(동작별 결과)·§5(상태 명세: 초기/빈/오류/선택 4종)·§6(데이터 모델 필드·타입)·§7(반응형 확정)·§8(접근성)이 전부 임시값이 아닌 확정값으로 서술되어 있고, DOM selector 수준 세부사항은 의도적으로 Builder Planner 소관으로 위임(§3 명시)하되 실제로는 INDEX_HTML_ARCHITECTURE.md에 정확히 대응되는 selector가 존재해 두 문서를 합치면 구현에 필요한 구체성이 확보된다.
- §9(임시 가정과 확정 결정의 구분)이 "임시" 표기를 전부 "확정(DEC-00X)"으로 교체했고, 유일한 비확정 항목(Q-003)도 "FINAL 전환을 막지 않는다"고 명시적으로 선을 그었다 — 적절한 처리.

**4) Q-003(비차단)이 §9 완료 조건 "구현을 막는 미결정이 없다"를 방해하는지 — 방해하지 않음.**
- Q-003은 OPEN_DECISIONS.md에 권장안(B안, POST_MVP-1 유지)이 이미 적용된 상태로 남아 있고, MVP_SPEC.md도 이 권장안을 기준으로 이미 POST_MVP-1을 확정 반영했다. 즉 "미결정이라 구현을 못 한다"가 아니라 "권장안이 기본 적용된 채로 사용자가 원하면 나중에 바꿀 수 있는 비차단 항목"이다. Codex 구현은 이 상태 그대로 시작해도 막히지 않는다.
- OPEN_DECISIONS.md 자체는 Status: DRAFT로 남아 있는 것이 맞다 — Main 소유 문서로서 사용자 회신을 계속 받을 수 있는 열린 창구이며, 이 문서가 FINAL이 아니라고 해서 전체 워크플로 완료를 막는 것은 아니다(CLAUDE.md §7 소유권 규칙상 OPEN_DECISIONS.md는 애초에 "완료"가 아니라 "현재 비차단 항목의 최신 상태"를 나타내는 문서).

**결론: 4개 항목 모두 문제 없음. 최종 판정 승인(APPROVE) 유지.** 아래 §1~7(1차 재검토 결과)은 그대로 유효하며 다시 뒤집을 사유가 없다.

## 0. 재검토 이력

1차 검토(2026-07-29)에서 C-1~C-4 4건을 사유로 **반려**했다. Builder Planner와 Tester가 각각 수정을 보고했고, 아래 §1에서 관련 5개 문서(INDEX_HTML_ARCHITECTURE.md, TASK_BREAKDOWN.md, IMPLEMENTATION_PLAN.md, TEST_PLAN.md, TEST_CASES.md, MANUAL_REVIEW_CHECKLIST.md)를 다시 읽고 실제 반영 여부와 신규 충돌 발생 여부를 확인했다. 결론: **모두 해소, 신규 차단 이슈 없음 → 승인.**

## 1. C-1~C-4 해소 확인

| # | 1차 반려 사유 | 재검토 확인 결과 |
|---|---|---|
| C-1 | `data-needs-review` 속성이 MVP_SPEC엔 확정인데 architecture §2 표·TASK-002 요구사항에 누락 | **해소 확인.** INDEX_HTML_ARCHITECTURE.md §2 표의 `#detail-needs-review` 행 Role/속성 칸에 `data-needs-review="true"\|"false"`가 명시됨(§5 renderDetail 책임, §10 selector 목록에도 반영). TASK_BREAKDOWN.md TASK-002의 Implementation Requirements·Acceptance Criteria·Required Tests·Definition of Done·Codex 프롬프트 5곳 전부에 "속성 설정 없이 문구만 바꾸는 구현은 완료로 인정하지 않는다"는 문구까지 추가됨. TEST_CASES.md TEST-005도 속성 검증(`data-needs-review="true"`)으로 확정됨. |
| C-2 | `<h2>` 헤딩이 TASK-001 Implementation Requirements에 누락 | **해소 확인.** TASK_BREAKDOWN.md TASK-001에 "`#app-list` 앞 `<h2>` 1개, `#detail-panel` 앞 `<h2>` 1개 반드시 포함"이 Implementation Requirements·Acceptance Criteria·Definition of Done·Codex 붙여넣기 프롬프트 4곳 모두에 일관되게 추가됨. |
| C-3 | 리스너 등록 위치(`INIT`/`initApp()`)가 TASK-003/TASK-004 사이에서 자체 모순, 소유권 겹침 위험 | **해소 확인, 가장 꼼꼼히 처리됨.** 신규 함수 `attachListEventListeners()` 도입으로 소유권을 물리적으로 분리: (1) INDEX_HTML_ARCHITECTURE.md §6/§7/§7.1이 "`attachListEventListeners()` 본문=TASK-003 전담, `initApp()` 본문(호출 줄 포함)=TASK-004 전담, TASK-003은 `initApp()`을 절대 열지 않는다"를 코드 예시(§7.1)까지 곁들여 명문화. (2) TASK_BREAKDOWN.md TASK-001이 `attachListEventListeners();`/`renderApp();` 호출 두 줄을 골격 단계에서 미리 고정해 어느 worktree도 이 두 줄을 수정하지 않게 함. (3) TASK-003 Forbidden Code Areas("initApp() 본문 전체, 호출 1줄 포함")·TASK-004 Allowed Code Areas("attachListEventListeners()는 손대지 않음, initApp() 본문 중 고정 두 줄 제외 전체")가 서로 대칭적으로 명시됨. (4) IMPLEMENTATION_PLAN.md §5.1 FILE_OWNERSHIP 입력 표와 "C-3 정리 한 문장"에도 동일 원칙이 요약됨. 코드 영역이 이제 겹치지 않는다. |
| C-4 | Tester 문서(TEST_PLAN §7/§8, TEST_CASES TEST-005/007)가 이미 채택된 결정을 여전히 조건부 문구로 서술 | **해소 확인.** TEST_PLAN.md §7·§8이 `[RESOLVED]`로 전환되고 채택 경위·반영 위치가 명시됨. TEST_CASES.md 상단 안내문과 TEST-005/007/008에서 "미확정 시"/"채택 여부에 따라" 같은 조건부 표현이 전부 제거되고 "[확정: 자동 테스트]" 같은 단정 표현으로 교체됨. MANUAL_REVIEW_CHECKLIST.md 항목 6도 "(해소됨 — 더 이상 수동 항목 아님)"으로 갱신됨. Q-005 모바일 관련 조건부 문구(TEST_PLAN §5, TEST_CASES TEST-90x)는 Q-005가 실제 미결정 BLOCKER이므로 조건부로 남긴 것이 맞다 — 의도적 유지로 확인. |

## 2. 재검토 중 신규 확인 사항 (차단 아님)

- **경미한 문서 낙후 1건(비차단):** IMPLEMENTATION_PLAN.md §2(구 요약 섹션)의 TASK-001 함수 목록 나열에 `attachListEventListeners()`가 빠져 있다(`selectRequest(id), handleListClick, handleListKeydown, safeLocalStorageGet/Set, initApp()`만 나열). 다만 이 섹션은 §5.1 FILE_OWNERSHIP 입력(Main이 실제로 조립에 쓸 근거 표)의 구버전 요약일 뿐이며, §5.1 표 자체와 TASK_BREAKDOWN.md TASK-001 본문에는 `attachListEventListeners()`가 정확히 포함되어 있다. Codex가 실제로 참조하는 문서(TASK_BREAKDOWN.md, INDEX_HTML_ARCHITECTURE.md)에는 반영되어 있으므로 **승인을 막을 사유는 아니다.** Builder Planner가 다음 편집 시 §2 목록에 한 단어만 추가하면 완전히 정리된다(선택적 정리, 차단 아님).
- 이 외에 attachListEventListeners() 도입으로 인한 새로운 소유권 충돌, selector 불일치, AC 누락은 발견하지 못했다.

## 3. 문서 간 충돌·모순 목록 (최종)

없음. 1차 검토에서 발견한 C-1~C-4는 모두 해소되었고, 재검토에서 신규 차단 이슈를 발견하지 못했다(§2의 낙후 1건은 비차단).

## 4. 테스트 불가능한 AC / 구체화 요청

없음(추가 요청 없음). 1차 검토 시 지적한 TEST-007/008의 조건부 표현은 §1 C-4에서 확정 표현으로 정리 완료됨을 확인했다.

## 5. 병렬 Worktree 충돌 위험 검토 (최종)

- worktree 4개(`wt-ui`/`wt-interaction`/`wt-persistence`/`wt-tests`), §2.1 상한(3~4개) 안.
- FILE_OWNERSHIP 입력(IMPLEMENTATION_PLAN.md §5.1)의 HTML/CSS/JS 함수 소유권은 이제 겹침 없이 정의된다 — C-3 해소로 유일한 겹침 위험(리스너 등록 위치)까지 해소됨.
- wt-interaction 병합이 wt-ui 병합 이후여야 한다는 순차 제약은 코드 충돌이 아니라 통합 테스트 실효성 문제라는 기존 설명에 동의(유지).
- TASK-001 선행 골격 → worktree 분기라는 하이브리드 원칙(CLAUDE.md §11.1)도 그대로 유지됨.

## 6. 남은 차단 이슈

**없음.** (1차 재검토 시점 서술 유지) Q-001/Q-002/Q-005는 당시 사용자 응답 대기 중인 BLOCKER였으나, **§0.1 2차 재검토에서 확인했듯 이제 DEC-001~003으로 전부 확정되었고 모든 문서가 확정값 기준으로 일관되게 갱신됐다.** 남은 유일한 항목 Q-003은 비차단이며 권장안이 기본 적용된 상태로 구현 착수를 막지 않는다.

## 7. 최종 판정 (2차 재검토 후 최종)

**승인 (APPROVE) — 최종.**

MVP_SPEC(Status: FINAL)·builder 3종·tester 3종 문서가 상호 정합적이며, 단일 `index.html` 제약 위반이 없고, §2.1 실습 규모 상한 안에 있으며, 코드 영역별 소유권이 겹침 없이 정의되었고(C-3 attachListEventListeners 분리 유지 확인), 테스트 불가능한 완료 조건이 남아 있지 않다. DEC-001(오른쪽 고정 패널)·DEC-002(새로고침 후 미유지)·DEC-003(데스크톱 전용)이 8개 문서 전체에 반응형 잔재 없이 일관되게 반영됐음을 재확인했다. Q-003(비차단)은 완료 조건("구현을 막는 미결정이 없다")을 방해하지 않는다.

Main은 이제 FILE_OWNERSHIP.md·ROADMAP.md·worktree_execution_guide/**·CODEX_HANDOFF.md 종합(§11)으로 진행 가능하다. 사용자 응답이 더 필요한 BLOCKER는 남아 있지 않다.

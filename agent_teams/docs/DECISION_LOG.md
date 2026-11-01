Status: FINAL
Owner: Main
Inputs: 사용자 AskUserQuestion 응답 (2026-07-29)
Last Updated: 2026-07-29
Related Decisions/Requirements: Q-001, Q-002, Q-005, Q-003

# DECISION_LOG

사용자가 확정한 결정만 이 문서에 ID로 기록한다. 아래 결정은 모든 하위 문서(MVP_SPEC.md·builder/**·tester/**)의 임시값과 동일하므로 각 문서는 "임시" 표기만 "확정"으로 갱신하면 된다.

## DEC-001 — 상세 정보 표시 위치 (Q-001)

- **확정:** A안 — 오른쪽 고정 패널(데스크톱 2-컬럼 레이아웃, 목록과 상세가 항상 나란히 보임).
- **근거:** 사용자가 권장안을 채택. Researcher 조사(GitHub PR Inbox, herdr-dashboard, Linear 사이드바)가 뒷받침.
- **영향 범위:** MVP_SPEC.md §3/§9, INDEX_HTML_ARCHITECTURE.md(CSS LAYOUT/DETAIL 섹션), TASK_BREAKDOWN.md TASK-002. 모두 이미 이 값을 임시값으로 채택해 설계됐으므로 구조 변경 불필요, 문서의 "임시/BLOCKER 대기" 표기만 정리.

## DEC-002 — 새로고침 후 선택 상태 유지 여부 (Q-002)

- **확정:** A안 — 유지 안 함. 새로고침 시 항상 초기 상태(미선택)로 복귀. localStorage에 선택 항목 id를 저장하지 않는다.
- **근거:** 사용자가 권장안을 채택. §2.1 실습 규모상 최소 구현 우선.
- **영향 범위:** MVP_SPEC.md §4/§9, INDEX_HTML_ARCHITECTURE.md(initApp() 초기화 로직), TASK_BREAKDOWN.md TASK-004, TEST_CASES.md TEST-012. 모두 이미 이 값으로 설계됨 — 구조 변경 불필요.

## DEC-003 — 반응형(모바일) 지원 범위 (Q-005)

- **확정:** A안 — 데스크톱 전용. 2-컬럼 레이아웃을 고정 폭으로 지원하고, 모바일/좁은 화면 대응 코드는 만들지 않는다.
- **근거:** 사용자가 권장안을 채택. §2.1 실습 규모 보호(반응형 대응 코드·전환 로직 추가 방지).
- **영향 범위:** MVP_SPEC.md §7(반응형 섹션 자체를 "데스크톱 전용" 확정으로 재정리 필요 — 기존에 "768px 반응형" 서술이 남아있다면 제거), TEST_PLAN.md §5/TEST_CASES.md TEST-90x(반응형 테스트 자체를 삭제, "조건부" 표기 제거). POST_MVP-7(모바일 대응)은 그대로 유지.

## DEC-004 — 우선순위/담당자 필터·정렬을 MVP에 포함할지 (Q-003)

- **확정:** B안 — POST_MVP로 전체 제외(유지). 필터/정렬 UI는 이번 MVP에 포함하지 않는다.
- **근거:** 사용자가 권장안(B안)을 명시적으로 재확인. 사용자 원문에 필터/정렬 언급이 없고, §2.1 상한(핵심 상호작용 1~2개)에서 "선택→상세"만으로 이미 1개를 채웠으므로 범위 확장을 피한다.
- **영향 범위:** 없음(원래도 B안이 임시 적용값이었음) — MVP_SPEC.md POST_MVP-1, OPEN_DECISIONS.md 모두 이미 이 값 기준. `docs/OPEN_DECISIONS.md`는 이제 이 결정을 이력으로만 남기고 더 이상 열린 질문이 아니다.

## 참고 — 그 외 비차단 항목

- Q-004(재클릭 시 토글 여부): AGENT_RESOLVABLE로 Product Specifier가 자체 확정(유지, 무효과). 사용자 확인 불필요.

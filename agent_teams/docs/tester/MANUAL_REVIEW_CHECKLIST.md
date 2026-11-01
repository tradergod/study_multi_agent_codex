Status: DRAFT
Owner: Tester
Inputs: docs/tester/TEST_PLAN.md, docs/MVP_SPEC.md, docs/builder/INDEX_HTML_ARCHITECTURE.md
Last Updated: 2026-07-29
Related Decisions/Requirements: REQ-003, REQ-005, REQ-007, DEC-001(Q-001 확정), DEC-003(Q-005 확정)

# MANUAL_REVIEW_CHECKLIST

자동 테스트(TEST_CASES.md)로 확인할 수 없는 **의미 품질**만 담는다. 존재/속성/상태 전이처럼 자동화 가능한 것은 여기 넣지 않는다. 각 항목은 판단 기준과 증거 저장 방식을 명시한다. 검토 담당은 기본적으로 Tester가 1차 수행하고 Reviewer가 최종 확인한다(Reviewer의 SCOPE_REVIEW/FINAL_REVIEW와 중복 서술하지 않고 이 체크리스트를 참조하도록 한다).

## 1. 목록·상세 콘텐츠의 의미 적절성

- 판단 기준: mock 데이터의 `title`/`assignee`/`nextAction` 문구가 "코드리뷰/이슈 요청 대시보드"라는 목표 사용자 맥락(MVP_SPEC.md §0)에 맞고, 우선순위(P0/P1/P2)와 내용의 심각도가 서로 어색하지 않게 짝지어져 있는지 사람이 읽고 판단한다.
- 증거: desktop viewport 스크린샷 1장(`#app-list` + `#detail-content` 선택된 상태 1건 포함), 검토자 코멘트 1~2줄.
- 검토 담당: Tester 1차, Reviewer 최종.

## 2. 우선순위 배지 색상 구분 가독성

- 판단 기준: `--color-p0`/`--color-p1`/`--color-p2`(빨강/주황/파랑 계열, INDEX_HTML_ARCHITECTURE.md §4)가 실제 렌더링 시 세 값이 서로 명확히 구분되고, 텍스트 대비가 읽기 불편하지 않은지 육안으로 확인한다. (WCAG 대비율 수치 측정 같은 정밀 검증은 §2.1 상한을 넘는 범위라 여기서는 다루지 않는다 — 필요 시 POST_MVP.)
- 증거: `#app-list`에 세 우선순위가 모두 보이는 상태의 스크린샷 1장.
- 검토 담당: Tester 1차, Reviewer 최종.

## 3. 선택 상태 시각적 구분의 실제 체감 (REQ-006)
- 판단 기준: `.is-selected` 스타일(배경색·테두리)이 자동 테스트로는 "클래스가 붙었는지"만 확인 가능하고, 실제로 사람이 봤을 때 선택 여부를 즉시 알아챌 수 있을 만큼 충분히 대비되는지는 육안 판단이 필요하다.
- 증거: 선택 전/후 스크린샷 2장(같은 항목, 선택 전과 후를 나란히 비교).
- 검토 담당: Tester 1차, Reviewer 최종.

## 4. 상세 영역 배치의 사용성 (DEC-001 확정 배치 기준)
- 판단 기준: DEC-001(사용자 확정: 오른쪽 고정 패널)에 따라 실제 구현된 배치가 "목록을 훑어보며 상세를 확인"하는 사용 맥락에서 시선 이동이 자연스러운지. TEST_CASES.md TEST-004~006은 위치의 "존재·DOM 순서"만 자동 확인하므로, "느낌이 자연스러운가"는 여기서 별도로 다룬다.
- 증거: desktop 전체 화면 스크린샷 1장(항목 선택된 상태).
- 검토 담당: Tester 1차, Reviewer 최종. 결정이 확정되었으므로 예비 검토가 아닌 최종 판정으로 바로 수행한다.

## 5. localStorage 실패 시 "정상 동작처럼 보이는가" (REQ-007 의미 판단 부분)
- 판단 기준: TEST-013(자동)이 "에러 없음 + 목록/상세 정상 렌더"까지는 확인하지만, 사용자 입장에서 아무 이상 징후(예: 콘솔에는 안 뜨지만 화면에 어색한 빈 칸이 생기는 등)가 없는지는 사람이 직접 devtools로 localStorage를 오염시킨 뒤 화면을 눈으로 확인해야 한다.
- 재현 절차: devtools console에서 `Storage.prototype.getItem = () => { throw new Error('blocked'); }` 실행 후 페이지 새로고침, 목록 클릭까지 수행.
- 증거: 재현 절차 수행 후 스크린샷 1장 + 콘솔 에러 유무 캡처.
- 검토 담당: Tester.

## 6. (해소됨 — 더 이상 수동 항목 아님) REQ-003 빈 상태 재현
- Builder Planner가 TEST_PLAN.md §7 REVISION_REQUEST 제안 A(`index.html?empty=1`)를 채택함(INDEX_HTML_ARCHITECTURE.md §7, TASK-004 반영). TEST-007/TEST-008이 이제 완전 자동 회귀로 확정되어 이 수동 검토 항목은 불필요해졌다. 코드 직접 수정·원상 복구 절차도 더 이상 필요 없다.

## 7. mock 데이터가 "완전 정적"이라는 설계 의도 준수 (REQ-005 의미 부분)
- 판단 기준: TEST-014(자동)은 "폼이 없다"만 확인한다. 코드 레벨에서 `state.requests`를 변경하는 어떤 사용자 트리거 이벤트(버튼, 드래그 등)도 없는지는 코드 리뷰 성격이라 Reviewer의 SCOPE_REVIEW와 겹친다 — 여기서는 중복 확인만 하고 1차 판단은 Reviewer 문서를 따른다.
- 증거: 별도 스크린샷 불필요, Reviewer SCOPE_REVIEW.md 참조 링크만 남김.
- 검토 담당: Reviewer(1차), Tester(교차 확인).

## 증거 저장 규칙 (공통)

- 스크린샷 파일명: `MANUAL-{번호}_{설명}_{YYYYMMDD}.png`, 저장 위치는 검증 환경의 `test-results/manual/` (제품 코드와 분리).
- 각 항목 검토 완료 시 이 문서에 체크박스로 결과를 남긴다(예: `- [x] 항목 1 — 2026-MM-DD 검토, 이상 없음`). 실행하지 않은 항목은 체크하지 않는다.

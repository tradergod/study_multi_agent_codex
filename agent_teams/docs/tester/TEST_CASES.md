Status: DRAFT
Owner: Tester
Inputs: docs/tester/TEST_PLAN.md, docs/builder/INDEX_HTML_ARCHITECTURE.md §2/§10 (selector 계약), docs/MVP_SPEC.md
Last Updated: 2026-07-29
Related Decisions/Requirements: REQ-001~007, AC-001~AC-014(Main 조립 예정)

# TEST_CASES

모든 케이스는 별도 명시 없는 한 viewport **desktop(1280×800)**. selector는 INDEX_HTML_ARCHITECTURE.md §2/§10에서 동결된 값만 사용한다. `#detail-needs-review`에는 확정된 `data-needs-review="true|false"` 속성이 있으며(TEST_PLAN.md §8 `[RESOLVED]` 참고), 자동 테스트는 이 속성으로만 검증한다.

---

## TEST-001 — 목록 항목 렌더 (REQ-001)
- 대상 AC: AC-001
- 사전 조건: `index.html`을 기본 mock 데이터(6개 항목)로 로드
- 조작: 페이지 로드 후 대기 없이 즉시 확인
- 기대 결과: `#app-list`에 `.request-item[data-id]`가 6개 존재. 각 항목 내부에 `.request-title`(비어있지 않은 텍스트)과 `.priority-badge[data-priority]`(값이 `P0`/`P1`/`P2` 중 하나)가 존재
- selector: `#app-list`, `.request-item`, `.request-title`, `.priority-badge[data-priority]`
- viewport: desktop

## TEST-002 — 초기 상태 상세 placeholder (REQ-004)
- 대상 AC: AC-005
- 사전 조건: 페이지 로드 직후, 아직 어떤 항목도 클릭하지 않음
- 조작: 없음(로드 상태 그대로 확인)
- 기대 결과: `#detail-placeholder`가 표시(visible)되고 `#detail-content`는 숨김(hidden 속성 또는 `display:none`). `#detail-priority`/`#detail-needs-review`/`#detail-assignee`/`#detail-next-action`은 화면에 보이지 않음(부모 `#detail-content`가 숨겨져 있으므로)
- selector: `#detail-placeholder`, `#detail-content`
- viewport: desktop

## TEST-003 — 헤더·랜드마크·heading 존재 (§8 접근성)
- 대상 AC: AC-009
- 사전 조건: 페이지 로드
- 조작: 없음
- 기대 결과: 페이지 전체에 `<h1>`이 정확히 1개(`#app-header h1`) 존재. `#app-list` 앞에 `<h2>` 이상 heading 1개, `#detail-panel` 앞에 `<h2>` 이상 heading 1개 존재. `#detail-panel`이 `role="region"`이고 `aria-label` 속성을 가짐
- selector: `#app-header h1`, `#detail-panel[role="region"]`
- viewport: desktop

## TEST-004 — 클릭 후 선택 스타일 갱신 (REQ-002, REQ-006)
- 대상 AC: AC-002, AC-007
- 사전 조건: 페이지 로드, 아무 항목도 선택 안 됨
- 조작: `.request-item[data-id="1"]`를 클릭
- 기대 결과: 해당 요소가 `.is-selected` 클래스를 가지고 `aria-selected="true"`가 됨. 다른 모든 `.request-item`은 `.is-selected`가 없고 `aria-selected="false"`
- selector: `.request-item[data-id="1"].is-selected`, `.request-item[aria-selected]`
- viewport: desktop

## TEST-005 — 클릭 후 상세 영역 4필드 갱신 (REQ-002)
- 대상 AC: AC-003
- 사전 조건: 페이지 로드
- 조작: `.request-item[data-id="1"]` 클릭(mock 데이터 기준 priority=P0, needsReview=true, assignee="김도윤", nextAction="테스트 케이스 보완 후 재요청")
- 기대 결과: `#detail-placeholder`는 숨겨지고 `#detail-content`가 표시됨. `#detail-priority`가 "P0"를 포함, `#detail-assignee`가 "김도윤"을 포함, `#detail-next-action`이 "테스트 케이스 보완 후 재요청"을 포함. `#detail-needs-review`는 `data-needs-review="true"` 속성을 가짐(id=1 mock 데이터의 needsReview=true 반영, 텍스트 문구는 검증하지 않음)
- selector: `#detail-content`, `#detail-priority`, `#detail-needs-review`, `#detail-assignee`, `#detail-next-action`
- viewport: desktop

## TEST-006 — 다른 항목 선택 시 상세 내용 교체 (Flow A 5단계)
- 대상 AC: AC-002, AC-003
- 사전 조건: `.request-item[data-id="1"]`가 이미 선택된 상태
- 조작: `.request-item[data-id="3"]` 클릭(mock 기준 priority=P1, assignee="이서연")
- 기대 결과: `data-id="1"` 항목은 `.is-selected` 해제(`aria-selected="false"`), `data-id="3"` 항목이 `.is-selected`+`aria-selected="true"`로 바뀜. `#detail-priority`가 "P1"로, `#detail-assignee`가 "이서연"으로 갱신됨(동시에 선택은 항상 1개만 유지)
- selector: `.request-item[data-id="1"]`, `.request-item[data-id="3"]`, `#detail-priority`, `#detail-assignee`
- viewport: desktop

## TEST-007 — 빈 상태 목록 안내 (REQ-003) [확정: 자동 테스트]
- 대상 AC: AC-004
- 사전 조건: `page.goto('index.html?empty=1')`로 접속. Builder Planner가 REVISION_REQUEST 제안 A를 채택해 `initApp()`이 `new URLSearchParams(location.search).get('empty')==='1'`일 때 `state.requests=[]`로 초기화하도록 구현됨(INDEX_HTML_ARCHITECTURE.md §7, TASK-004 반영). 소스 코드 수정 없이 결정론적으로 재현 가능
- 조작: 없음(로드 상태 확인)
- 기대 결과: `#app-list-empty`가 표시되고 `.request-item`은 0개. `#app-list-empty` 텍스트가 비어있지 않음(정확한 문구는 loose match)
- selector: `#app-list-empty`, `.request-item`
- viewport: desktop

## TEST-008 — 빈 상태 상세 영역 (REQ-003) [확정: 자동 테스트, TEST-007과 동일 전제]
- 대상 AC: AC-004
- 사전 조건: TEST-007과 동일(`index.html?empty=1`로 접속)
- 조작: 없음
- 기대 결과: `#detail-placeholder`가 표시되고 `#detail-content`는 숨김(선택 가능한 항목이 없으므로 항상 이 상태 유지). 클릭할 `.request-item`이 없으므로 상태 전이 없음
- selector: `#detail-placeholder`, `#detail-content`
- viewport: desktop

## TEST-009 — 재클릭 무효과 (§4 확정 동작)
- 대상 AC: AC-014
- 사전 조건: `.request-item[data-id="2"]`가 이미 선택된 상태(`.is-selected` 적용, 상세 영역이 id=2 데이터 표시 중)
- 조작: `.request-item[data-id="2"]`를 다시 클릭
- 기대 결과: DOM 상태에 변화 없음 — `.is-selected`는 여전히 `data-id="2"`에만 있고, `#detail-priority` 등 4필드 값도 클릭 전과 동일(재계산으로 우연히 같아진 게 아니라 아예 갱신 이벤트가 없었음을, 클릭 전/후 텍스트 스냅샷 비교로 확인)
- selector: `.request-item[data-id="2"]`, `#detail-content`
- viewport: desktop

## TEST-010 — 키보드 Enter로 선택 (§8 접근성, REQ-002)
- 대상 AC: AC-012, AC-013
- 사전 조건: 페이지 로드, 아무 항목도 선택 안 됨
- 조작: Tab 키로 `.request-item[data-id="4"]`에 포커스 이동 후 `Enter` 키 입력
- 기대 결과: 클릭과 동일하게 `data-id="4"` 항목에 `.is-selected`+`aria-selected="true"` 적용, `#detail-content`가 id=4 데이터로 갱신됨. **포커스는 여전히 `.request-item[data-id="4"]`에 유지**(다른 요소로 이동하지 않음)
- selector: `.request-item[data-id="4"]`, `#detail-content`
- viewport: desktop

## TEST-011 — 키보드 Space로 선택 (§8 접근성)
- 대상 AC: AC-012
- 사전 조건: 페이지 로드
- 조작: Tab으로 `.request-item[data-id="5"]`에 포커스 이동 후 `Space` 키 입력
- 기대 결과: TEST-010과 동일한 방식으로 `data-id="5"`가 선택되고 상세가 갱신됨
- selector: `.request-item[data-id="5"]`, `#detail-content`
- viewport: desktop

## TEST-012 — 새로고침 후 선택 상태 초기화 (DEC-002 확정값 기준)
- 대상 AC: AC-002/AC-005 연계(새로고침 후 초기 상태 복귀)
- 사전 조건: `.request-item[data-id="1"]`이 선택된 상태
- 조작: 페이지 새로고침(reload)
- 기대 결과: DEC-002(사용자 확정: 새로고침 후 선택 상태 미유지)에 따라 `#detail-placeholder`가 다시 표시되고 어떤 `.request-item`에도 `.is-selected`가 없음(초기 상태로 복귀). 이 기대 결과는 확정 사항이며 재논의 없이는 변경하지 않는다.
- selector: `#detail-placeholder`, `.request-item.is-selected`
- viewport: desktop

## TEST-013 — localStorage 접근 실패 시 핵심 기능 유지 (REQ-007) [자동 부분 + 수동 부분]
- 대상 AC: AC-008
- 사전 조건: 페이지 로드 **전** `localStorage.getItem`/`setItem`이 예외를 던지도록 오염시킨 상태로 초기화(Playwright `page.addInitScript`로 `Storage.prototype.getItem/setItem`을 throw하도록 재정의)
- 조작: 페이지 로드 후 `.request-item[data-id="1"]` 클릭
- 기대 결과(자동 검증 범위): 콘솔에 uncaught 에러가 발생하지 않음(`page.on('console')`/`page.on('pageerror')`로 감시). `#app-list`에 항목 6개가 정상 렌더되고, 클릭 후 `#detail-content`가 정상 갱신됨(REQ-007이 요구하는 "핵심 기능 유지"를 이 두 가지로 자동 확인)
- 기대 결과(수동 검증 범위): "정상 동작처럼 자연스러운가"는 MANUAL_REVIEW_CHECKLIST.md로 이관(TEST_PLAN §3 참고)
- selector: `#app-list`, `.request-item`, `#detail-content`
- viewport: desktop

## TEST-014 — 추가/편집 폼 부재 확인 (REQ-005 부재 증명)
- 대상 AC: AC-006
- 사전 조건: 페이지 로드
- 조작: 없음
- 기대 결과: 페이지 전체 DOM에 `form`, `input[type="text"]`, `textarea`, "추가"/"저장" 류 버튼(신규 항목 추가 목적)이 존재하지 않음. (주의: 이 테스트는 "폼이 없다"만 증명하며, "데이터가 완전 정적"이라는 의미까지는 자동으로 증명하지 못함 — TEST_PLAN §3 한계 참고)
- selector: `form`, `input[type="text"]`, `textarea` (모두 0개여야 함)
- viewport: desktop

## TEST-90x — 반응형 전환 (DEC-003 확정에 따라 이 MVP 범위에서 완전히 제외)
- 현재 상태: **작성하지 않음, 확정 제외.** DEC-003(Q-005 확정: 데스크톱 전용)에 따라 반응형/모바일 레이아웃 자체가 이 MVP에서 구현되지 않으므로 해당 테스트 대상이 존재하지 않는다(POST_MVP-7). 이 항목은 "미결정이라 보류"가 아니라 "확정되어 범위 밖"이다. 향후 별도 프로젝트에서 POST_MVP-7이 채택되면 그때 TEST-901~ 번호대로 신규 작성한다.

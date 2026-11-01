Status: DRAFT
Owner: Researcher
Inputs: docs/PROJECT_CONTEXT.md
Last Updated: 2026-07-29
Related Decisions/Requirements: Q-(TBD, see 질문 후보 하단), REQ-(TBD by Product Specifier)

# RESEARCH_REPORT

## 1. 도메인 분석

**도메인:** 팀 내부 코드리뷰/이슈 요청 트리아지(triage) — "무엇을 먼저 봐야 하는가"를 한눈에 파악하는 대시보드류 화면.

- **목표 사용자(추정, [INFERENCE]):** 여러 PR/이슈 리뷰 요청을 동시에 받는 팀 리드 또는 개발자. 사용자 원문은 "팀에 쏟아지는" 이라고만 했고 역할(리뷰어 본인 vs 매니저)은 명시하지 않음.
- **전형적 시나리오([INFERENCE], 사용자 원문 기반):** 요청이 쌓인다 → 목록에서 훑어본다 → 우선순위가 높은 것부터 클릭 → 상세에서 "리뷰 필요 여부·담당·다음 액션"을 확인 → 처리.
- **표준 화면 구성 요소([FACT], 아래 유사 서비스 조사 근거):** 좌측(또는 상단) 목록 + 우측 상세 패널의 master-detail 레이아웃, 우선순위/라벨 배지, 필터, 담당자 아바타.
- **핵심 데이터 필드(사용자가 명시 — 그대로 채택 권장):** 제목/요청명, 우선순위(P0/P1/P2), 리뷰 필요 여부(boolean 또는 상태), 담당자, 다음 액션(텍스트).
- **사용자가 명시하지 않아 확정 불가한 것([INFERENCE], 사실로 단정하지 않음):** 데이터 출처(GitHub Issues/PR API 연동 여부), 담당자가 1명인지 여러 명인지, "다음 액션"이 자유 텍스트인지 정해진 옵션인지, 정렬/필터 필요 여부, 상태 저장(새로고침 후 유지) 필요 여부.

## 2. 실제 웹 탐색 — 검색어·출처

| 검색어 | 목적 |
|---|---|
| "GitHub PR review dashboard tool priority triage list detail panel UI" | 코드리뷰 트리아지 도구의 실제 사례 |
| "Linear issue tracker list detail panel UX pattern" | 이슈 트래커의 목록↔상세 UX 표준 |
| "master-detail split view responsive pattern accessibility ARIA listbox" | 목록/상세 패턴의 접근성·반응형 표준 |
| "MDN HTMLDialogElement dialog element documentation" | 브라우저 네이티브 dialog/drawer 구현 가능성 |
| "MDN Window localStorage documentation" | 상태 저장 방식 공식 사양 |
| "MDN matchMedia window CSS Grid two column layout" | 반응형 2-컬럼 레이아웃 순수 CSS/JS 구현 근거 |

## 3. 유사 서비스 비교 (2~4개)

### 3.1 GitHub 공식 PR 대시보드 (github.com/pulls "Inbox")
[FACT] GitHub는 github.com/pulls에 리뷰 요청·CI 실패·머지 대기 PR을 한 화면에서 우선순위별로 보여주는 "Inbox"를 GA로 제공한다. 섹션 재배치·숨기기, 저장소/최근 활동 필터를 지원한다. (출처: https://devops.com/githubs-redesigned-pr-inbox-tackles-the-review-bottleneck-ai-created/)
- 강점: 실제 업무 흐름(리뷰 필요/수정 필요/머지 가능)별 분류가 사용자 요구사항의 "우선순위·담당" 개념과 유사.
- 약점(단일 HTML 관점): 실시간 GitHub API·인증이 전제 → 이 프로젝트에서는 그대로 재현 불가, mock 데이터로 컨셉만 차용해야 함.

### 3.2 오픈소스 PR 대시보드류 (herdr-dashboard, github-pr-attention, spark-pr-dashboard 등)
[FACT] 이들은 공통적으로 "목록(좌) + 상세 프리뷰(우 또는 온디맨드)" 구조를 쓰며, herdr-dashboard는 라벨·본문·리뷰 코멘트를 보여주는 detail side pane을 갖는다. (출처: https://vinitkumar.me/github-pr-attention/ , https://github.com/chouxcreams/herdr-dashboard , https://github.com/databricks/spark-pr-dashboard)
- 강점: 목록에서 선택 → 우측/온디맨드 상세라는 패턴이 사용자가 원문에서 이미 요구한 "요청 목록에서 항목을 고르면 ... 오른쪽 상세" 구조와 정확히 일치.
- 약점: 대부분 백엔드(TUI, GitHub API) 의존 — 단일 HTML에는 데이터 소스만 mock으로 대체하면 UI 패턴은 그대로 차용 가능.

### 3.3 Linear (이슈 트래커)
[FACT] Linear는 목록/보드/타임라인/스플릿 뷰를 제공하며, "Peek Preview"(가벼운 상세 미리보기, macOS Quicklook과 유사)와 "우측 사이드바"(assignee, priority, labels 등 메타데이터 표시) 두 가지 상세 노출 방식을 갖는다. (출처: https://linear.app/docs/peek , https://linear.app/docs/display-options)
- 강점: 우선순위·담당자·상태를 사이드바에 배치하는 필드 구성이 사용자 요구 필드(우선순위/담당/다음 액션)와 그대로 대응.
- 약점: Peek는 오버레이형 미리보기라 상세 정보 밀도가 낮음 — 이 MVP처럼 필드가 4개뿐이면 오히려 고정 우측 패널이 더 적합할 수 있음([INFERENCE]).

### 3.4 Windows List/Details 패턴 (Microsoft Learn) 및 W3C ARIA
[FACT] Microsoft의 List/Details 패턴 문서는 "충분히 넓은 화면에서는 목록과 상세를 나란히, 좁은 화면에서는 별도 뷰로 전환"하는 반응형 원칙을 명시한다. (출처: https://learn.microsoft.com/en-us/windows/apps/design/controls/list-details)
[FACT] W3C ARIA APG는 목록형 선택 위젯에 `listbox`/`option` role, 키보드 탐색(`aria-activedescendant` 등)을 규정한다. (출처: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- 이 MVP에 그대로 적용 가능한 접근성 뼈대: 목록 컨테이너 `role="listbox"` + 각 항목 `role="option"`, 선택 시 `aria-selected="true"`.

## 4. UI/UX 패턴 조사 및 이 MVP 적용 권장

| 패턴 | 조사 근거 | 이 MVP 권장 여부 |
|---|---|---|
| 목록(좌) + 상세(우) 고정 2-컬럼 | 3.1~3.4 전 사례 공통 | **[RECOMMENDATION] 채택** — 사용자 원문이 이미 이 구조를 요구함. 화면 1개 제약과도 정확히 일치. |
| Drawer/모달로 상세 표시 | herdr-dashboard(사이드페인), Linear Peek(오버레이) | [RECOMMENDATION] 넓은 화면 기본안 아님. 다만 좁은 화면(모바일) fallback으로는 검토 가치 있음 — Product Specifier에게 선택지로 전달. |
| 우선순위 배지(P0/P1/P2 색상 구분) | GitHub Inbox, Linear priority 필드 | **[RECOMMENDATION] 채택** — 시각적 우선순위 스캔은 사용자가 명시한 "한눈에 보이도록" 요구를 직접 충족. |
| 필터/검색 | GitHub Inbox 섹션 필터, Linear Custom Views | [RECOMMENDATION] MVP 상한(§2.1, 화면 1개+핵심 상호작용 1~2개) 고려 시 **POST_MVP 후보**. 목록/상세 선택이 핵심 상호작용 1개를 이미 소진하므로 필터·정렬은 최소(우선순위 정렬 정도)로 제한 권장. |
| 빈 상태(선택 항목 없음) | 3.4 List/Details 반응형 원칙에서 파생 [INFERENCE] | [RECOMMENDATION] 채택 — 상세 패널에 "항목을 선택하세요" 같은 플레이스홀더 필요. 화면 1개 제약 내에서 비용 낮음. |
| 반응형(좁은 화면에서 목록/상세 전환) | 3.4 Microsoft List/Details 패턴 | [RECOMMENDATION] **POST_MVP 후보** — 2~3시간 실습 규모(§2.1)를 넘어설 위험. 데스크톱 기준 2-컬럼 고정을 1차 MVP로, 반응형은 POST_MVP로 내리는 것을 권장. |
| ARIA listbox/option 역할 | W3C ARIA APG (3.4) | [RECOMMENDATION] 채택 권장하되 Task 규모는 작음(속성 부여 수준) — Builder Planner가 비용 판단. |

## 5. 브라우저 기술 조사 (단일 index.html 관점, 공식 문서 확인)

- **[FACT] `localStorage`**: origin 단위로 영구 저장되는 동기 key-value 스토리지, 브라우저 재시작에도 유지. 별도 서버 불필요. (출처: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) → 요청 목록/선택 상태 저장에 적합. **[RECOMMENDATION]** 대량·연산 집약적 동기 처리는 피하라는 MDN 권고가 있으나, 이 MVP 데이터 규모(요청 수십 건 이하)에서는 문제 없음.
- **[FACT] `<dialog>` / `HTMLDialogElement`**: 네이티브 모달/논모달 다이얼로그를 프레임워크 없이 제공(`show()`, `showModal()`, `close()`). (출처: https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement) → 상세를 오버레이/drawer로 표시해야 한다면 라이브러리 없이 구현 가능. 단, 사용자 원문은 "오른쪽 상세"라고 이미 명시했으므로 **[RECOMMENDATION] 기본안은 고정 패널(단순 `<div>` + CSS), `<dialog>`는 채택하지 않음(불필요한 복잡도)**. 좁은 화면 대안으로만 후보 유지.
  - **[RESOLVED] Builder Planner `[CHALLENGE]` 응답 (Q-001이 만약 B안/Drawer로 바뀔 경우):** 부분 반박. `showModal()`은 top-layer 배치·`::backdrop`·Esc-to-close·(과거 기준) 포커스 트랩을 **브라우저가 무료로 제공**하므로, 오히려 순수 `div`+`aria-modal`보다 **직접 작성할 JS가 더 적다**([FACT] "Dialog opened with showModal() gives you the top layer, the backdrop, the focus trap, the inert background, and Esc-to-close, for free." 출처: https://jaredcunha.com/blog/html-dialog-getting-accessibility-and-ux-right). 다만 [FACT] W3C APA 워킹그룹은 최근 `<dialog>`가 포커스를 강제로 가두지 않아도 된다고 결론지어, 수동 포커스 트랩 구현이 오히려 최신 권고와 어긋난다고 지적한다(출처: https://css-tricks.com/there-is-no-need-to-trap-focus-on-a-dialog-element/). 따라서 Builder Planner가 우려한 "포커스 트랩 처리가 과함"이라는 근거는 사실과 반대다 — `<dialog>`가 더 적은 코드로 더 표준적인 접근성을 준다. **[RECOMMENDATION] (조건부, B안 채택 시에만 적용):** Drawer가 실제로 채택되면 순수 `div`+`aria-modal`이 아니라 `<dialog>` + `showModal()`을 권장. (현재 Q-001 권장안은 A안/고정 패널이므로 이 조건은 발동 가능성이 낮음 — Main·Builder Planner 확인 요청.)
- **[FACT] CSS Grid**: `grid-template-columns` 등으로 2-컬럼(목록/상세) 레이아웃을 순수 CSS로 구성 가능. `repeat(auto-fill, minmax(...))` 같은 반응형 기법도 미디어 쿼리 없이 가능. (출처: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Basic_concepts , .../Realizing_common_layouts_using_grids) → **[RECOMMENDATION]** 목록/상세 2-컬럼은 CSS Grid 또는 Flexbox만으로 충분, JS 레이아웃 라이브러리 불필요.
- **[FACT] ARIA listbox 패턴**: `role="listbox"`/`role="option"`, `aria-selected`, `aria-activedescendant`로 순수 HTML/ARIA 속성만으로 접근성 있는 선택형 목록 구현 가능(자바스크립트 프레임워크 불필요). (출처: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- **결론 [RECOMMENDATION]:** 이 MVP는 순수 DOM API(`querySelector`, `addEventListener`) + 정적 JS 배열(mock 데이터) + CSS Grid/Flexbox + (선택적) `localStorage`만으로 충분히 구현 가능. `<dialog>`, `fetch`(공개 API) 등은 이번 요구사항 범위에서 불필요.

## 6. 라이브러리 도입 억제 판단

**[RECOMMENDATION] 기본 "라이브러리 도입 안 함".** 근거:
- 요구 기능(목록 렌더링, 클릭 시 상세 갱신, 우선순위 배지)은 모두 순수 DOM API로 수십 줄 내에 구현 가능(위 §5 근거).
- CLAUDE.md §2가 npm/bundler/프레임워크를 명시적으로 금지.
- 예외 조건 없음 — 이번 요구사항에서 외부 라이브러리가 필요한 시나리오를 발견하지 못함.

## 7. `[HANDOFF]`

### → Product Specifier
[HANDOFF] 유사 서비스·UX 근거 전달:
1. 사용자가 요구한 "목록 선택 → 우측 상세" 구조는 GitHub Inbox, herdr-dashboard, Linear 사이드바 등 실제 트리아지 도구의 표준 패턴과 일치함(§3). 화면 구조를 새로 고민할 필요 없이 이 표준을 그대로 채택 권장.
2. 우선순위 배지(P0/P1/P2 색상 구분)는 "한눈에 보이도록"이라는 사용자 요구를 직접 충족하는 검증된 패턴(§4) — MVP_SPEC에 시각적 우선순위 표시를 명시 요청.
3. 데이터 출처는 실서비스 API 연동(GitHub Issues/PR)이 아니라 **정적 mock 배열**로 귀결되어야 함(§1, §2.1 제약) — Product Specifier가 mock 데이터 필드셋(제목/우선순위/리뷰 필요 여부/담당/다음 액션 + 식별자 id)을 확정할 것을 요청.
4. 필터·검색·반응형 레이아웃 전환은 POST_MVP 후보로 판단(§4) — MVP_SPEC 범위를 목록↔상세 단일 상호작용에 집중할 것을 권장.
5. 빈 상태(선택 없음 시 상세 패널 placeholder)는 구현 비용이 낮으므로 MVP 포함 권장.

### → Builder Planner
[HANDOFF] 단일 HTML 구현 제약·기술 선택 근거 전달:
1. 레이아웃: CSS Grid 2-컬럼(`grid-template-columns: 320px 1fr` 등)으로 목록/상세를 구현 가능, 별도 JS 레이아웃 로직 불필요(§5, MDN CSS Grid 근거).
2. 목록 항목 선택: 순수 `<ul>`/`<li>` + `addEventListener('click', ...)` + 상세 영역 `innerHTML`/DOM 갱신으로 충분. `role="listbox"`/`role="option"`/`aria-selected` 부여를 저비용 접근성 개선으로 권장(§4, W3C ARIA APG 근거).
3. 상세 패널 오버레이가 필요한 경우에만 `<dialog>` 고려(§5) — 이번엔 고정 패널이 기본이므로 필요 없음. 도입 시에도 프레임워크/라이브러리 없이 네이티브 API로 충분.
4. 상태 저장이 필요하면(예: 마지막 선택 항목 유지) `localStorage` API로 충분, 별도 상태관리 라이브러리 불필요(§5).
5. **[CHALLENGE] 선제 경고:** 만약 Builder Planner가 실시간 GitHub API 연동이나 인증을 전제로 아키텍처를 설계한다면 이는 §2 제약 위반이다 — 반드시 mock 정적 데이터 + 선택적 공개 API(비밀키 없음) 범위 내에서만 설계할 것을 요청.

## 8. `[CHALLENGE]`

[CHALLENGE] (Product Specifier·Builder Planner 공통, 선제적) 사용자 원문의 "쏟아지는 코드리뷰/이슈 요청"이라는 표현은 실시간 GitHub Issues/PR 연동을 암시할 수 있으나, 이는 백엔드·인증·CORS 문제를 필연적으로 동반해 §2 단일 `index.html`·비밀키 금지 제약과 정면 충돌한다. 실제 조사(§3.1)에서도 GitHub 자체 대시보드조차 인증된 백엔드 API 기반이다. 따라서 두 teammate는 "실연동 mock 흉내"가 아니라 "정적 mock 데이터 기반의 트리아지 UI 연습"으로 요구사항을 해석해야 하며, 실연동은 예외 없이 POST_MVP로 분리할 것을 요청한다.

## 9. 미해결·추가 조사 필요 항목

- "담당(assignee)"이 단일 인물 텍스트인지, 팀원 목록에서 고르는 구조인지 미확정 — Product Specifier 결정 필요.
- "다음 액션"이 자유 텍스트인지 사전 정의된 옵션(예: "머지", "재요청", "보류")인지 미확정.
- 우선순위별 정렬·색상 규칙(P0=빨강 등 구체적 매핑)은 미조사 — 필요 시 Product Specifier가 정의하고 Researcher가 후속 조사 가능.
- 반응형(모바일) 지원 범위를 POST_MVP로 내릴지 여부는 사용자 확인 필요(§10 질문 후보 Q-R2).

## 10. 질문 후보 (Main에게 전달)

```text
[발의: Researcher / 검토: Product Specifier]
분류: BLOCKER
결정할 사항: "쏟아지는 요청"의 데이터 출처를 실제 GitHub 등과 연동할지, 아니면 화면 안에 미리 넣어둔 가짜(mock) 데이터로 보여줄지 정합니다.
선택지:
  A) 완전 mock 정적 데이터 (앱을 열면 이미 10~15개 요청이 코드에 들어있음)
  B) 사용자가 화면에서 직접 요청을 추가/수정 (mock 초기 데이터 + 폼)
  C) 실제 GitHub API 연동 (이 프로젝트 제약상 불가 — 인증·서버 필요)
권장안: A — 2~3시간 실습 규모(§2.1)에 가장 적합하고 이미 조사한 모든 유사 서비스가 "목록+상세" UI 자체는 mock으로도 충분히 재현 가능(§3).
근거: [FACT] GitHub 자체 대시보드도 인증 백엔드 필요(https://devops.com/githubs-redesigned-pr-inbox-tackles-the-review-bottleneck-ai-created/) / [INFERENCE] 사용자 원문에 "만들고 싶다"고만 했지 실연동을 명시하지 않음.
영향: 화면(입력 폼 유무) / 구현 범위(worktree 1개 추가 여부) / 테스트(폼 검증 테스트 필요 여부)가 달라짐.
```

```text
[발의: Researcher / 검토: Builder Planner]
분류: USER_FEEDBACK
결정할 사항: 좁은 화면(모바일)에서도 목록/상세를 나란히 보여줄지, 아니면 데스크톱만 지원할지.
선택지:
  A) 데스크톱 2-컬럼 고정, 모바일 미지원(POST_MVP로 이동)
  B) `matchMedia`/CSS로 좁은 화면에서 목록↔상세 전환
권장안: A — §2.1 상한(화면 1개·상호작용 1~2개) 안에서 여유를 확보하기 위함.
근거: [FACT] Microsoft List/Details 패턴은 반응형 전환을 권장하지만 별도 상태 전환 로직이 필요함(https://learn.microsoft.com/en-us/windows/apps/design/controls/list-details).
영향: CSS 복잡도, 추가 JS 상태(현재 뷰: 목록/상세), 테스트 케이스 증가.
```

```text
[발의: Researcher / 검토: Product Specifier, Tester]
분류: AGENT_RESOLVABLE
결정할 사항: 목록 항목에 `role="option"`/`aria-selected` 등 ARIA 속성을 넣을지.
해결: 넣는다 — 구현 비용이 매우 낮고(속성 추가 수준) 접근성 향상이 명확함(W3C ARIA APG, https://www.w3.org/WAI/ARIA/apg/patterns/listbox/). 사용자 확인 불필요.
```

```text
[발의: Researcher / 검토: Product Specifier]
분류: POST_MVP
결정할 사항: 필터/검색, 실시간 API 연동, 반응형 모바일 레이아웃, drawer/모달형 상세.
처리: 모두 POST_MVP로 분리 권장 — §2.1 상한 초과 위험.
```

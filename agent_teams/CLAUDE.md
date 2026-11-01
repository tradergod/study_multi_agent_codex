# Claude Code — MVP 설계 커맨드 센터 (Main 오케스트레이션 규칙)

## 0. 이 문서와 실행 구조

이 문서는 **Main 세션의 오케스트레이션 규칙**만 정의한다. 각 teammate의 상세 실행 지시는 `agent_prompts/` 폴더의 프롬프트 파일에 있다.

```text
agent_prompts/
├─ researcher.md
├─ product_specifier.md
├─ builder_planner.md
├─ reviewer.md
└─ tester.md
```

**teammate 생성 방식 (중요):** Main은 사용자가 agent teams 활용을 명시했을 때, **Agent 툴로 `subagent_type: "general-purpose"` teammate를 생성하고, `prompt`에 해당 `agent_prompts/<role>.md` 파일 내용 전체 + 공유 컨텍스트(아래 §3.2)를 넣어** 즉석에서 spawn한다. 이 파일들이 teammate 정의의 단일
진실이다. `name`은 역할명(researcher 등)으로 지정해 이후 `SendMessage`로 이어 말할 수 있게 한다.

Main은 실제로 Agent 툴을 호출해 teammate를 실행하고, teammate가 실제 `docs/`파일을 작성하게 한다. 계획만 말하고 끝내지 않는다.

---

## 1. 목적

현재 작업 범위는 **조사·질문·설계·테스트 계획·병렬 구현 계획·Codex 전달 문서작성**이다. **제품 코드(`index.html`)는 직접 구현하지 않는다.**

사용자가 5~10줄의 짧고 불완전한 요구사항을 주면, Main은 5명의 teammate를 실행해 요구사항을 조사·확장하고, 모호점과 위험을 찾고, 서로 반박·검토하게 하고, 사용자 결정이 필요한 것만 Main이 질문하고, 답변을 관련 teammate에 전파해 문서를 고도화한다. **구현을 막는 미결정이 사라질 때까지** 반복해 최종 MVP 설계 명세를 `docs/`에 완성한다.

최종 산출물은 다른 환경(Codex Desktop)으로 복사해도 **대화 기록 없이 독립적으로 이해되는 `docs/` 전체**이며, Codex Desktop이 그대로 병렬 구현·검증할 수 있는 단일 진실 공급원이어야 한다.

이 프로젝트는 최종적으로 **교육생에게 제공되는 starter kit**이다. 교육생은 자기 아이디어를 5~10줄로 입력 → 5 teammate 워크플로로 `docs/` 명세를 받고 → 그 `docs/`를 Codex Desktop으로 가져가 MVP를 구현한다. **아이디어 확장부터 MVP 완성까지 2~3시간 안에 끝나는 실습**이므로, 설계는 항상 "가장 쉽고 가장 작게"를 기본값으로 한다(§2.1).

---

## 2. 고정 제약 — 단일 `index.html` (절대 원칙)

최종 MVP는 **반드시** 브라우저에서 바로 여는 standalone `index.html` **하나**로만 구현된다. `<head>`에 `<style>`, `<body>` 끝에 `<script>`를 임베드한다.

**금지(설계·명세·질문·문서 전반):** React·Vue·Svelte 등 프레임워크 / npm·패키지·bundler·build step / 별도 `.css`·`.js` 파일 / 백엔드·DB·인증 서버 / 브라우저 코드 내 비밀 API 키.

**데이터 허용 방식:** 정적 JS 객체 · mock · 브라우저 메모리 상태 · `localStorage` · 비밀 키 없는 공개 API. 외부 서비스가 필요한 기능은 mock으로 대체하거나 `POST_MVP`로 분리한다.

이 제약은 모든 teammate·docs·질문에 예외 없이 적용되며, 위반 소지는 Reviewer가 차단한다.

### 2.1 MVP 범위 상한 (실습 규모 고정 — 절대 초과 금지)

2~3시간 실습에 맞춰 MVP는 **의도적으로 작게** 설계한다. 기능을 늘리려는 압력은 기본적으로 거부한다.

- **화면 1개**(단일 index.html 안의 한 뷰) + 목록/상세 같은 **핵심 상호작용 1~2개** + `localStorage` 상태 저장 정도로 제한한다.
- Codex Desktop에서 **목적이 서로 다른 worktree 3~4개**로 완성되는 규모를 넘지 않는다.
- Codex 구현은 **약 8~10턴**에 끝나야 한다.
- 필수(must-have)는 최소로, 나머지는 공격적으로 `POST_MVP`로 내린다.
- 라우팅·다중 페이지·복잡한 데이터 모델·실시간·인증·빌드 도구는 넣지 않는다.

Reviewer는 이 상한을 초과하는 범위를 발견하면 차단하고 축소를 요청한다. Product
Specifier는 이 상한 안에서 명세하고, Builder Planner는 이 상한 안에서 worktree를 나눈다.

---

## 3. teammate 구성과 spawn

### 3.1 5개 역할

| teammate | 핵심 책임 | 프롬프트 |
|---|---|---|
| Researcher | 외부 탐색·유사 서비스·UX 패턴·단일 HTML 브라우저 기술 조사 | `agent_prompts/researcher.md` |
| Product Specifier | 짧은 요구사항 → 화면·상태·동작·예외 명세 확장 | `agent_prompts/product_specifier.md` |
| Builder Planner | 단일 `index.html` 내부 아키텍처와 코드 섹션 단위 Task 설계 | `agent_prompts/builder_planner.md` |
| Reviewer | MVP 범위·구현 가능성·단일 파일 제약·문서 충돌·누락 검토 | `agent_prompts/reviewer.md` |
| Tester | 요구사항 → 자동 테스트·수동 검토 기준 변환 | `agent_prompts/tester.md` |

**`worktree_execution_guide` 전담 6번째 에이전트는 만들지 않는다.** 이 가이드는 Builder Planner + Tester + Reviewer 결과를 **Main이 종합**해 작성한다.

### 3.2 spawn 시 각 teammate에 넣는 공유 컨텍스트

`prompt` = `agent_prompts/<role>.md` 전체 내용 + 아래:

- 사용자 요구사항 원문
- §2 단일 `index.html` 제약과 금지·허용 데이터 방식
- 현재 `docs/` 상태와 이 teammate가 소유하는 파일(§7)
- 이번에 수행할 첫 작업과 반드시 상호작용할 teammate(§5.1)
- 사용자에게 직접 질문 금지, 질문 후보는 Main에 전달한다는 규칙

### 3.3 실행·상호작용 연결

- Researcher와 Product Specifier를 먼저 실행하고(병렬 가능), 그 산출을 근거로 Builder Planner → Tester → Reviewer가 상류 `[HANDOFF]`를 소비하도록 이어 실행한다.
- teammate 간 `[HANDOFF]`/`[CHALLENGE]` 전달은 Main이 중계한다. 실행 중인 teammate에 다른 teammate의 결과를 넘길 때는 `SendMessage`로 이어 말한다.
- Main은 teammate 완료를 기다린 뒤 종합한다. 먼저 혼자 결론을 확정하지 않는다.

---

## 4. Main의 턴 진행

### 4.1 매 턴 시작 — 어느 페이즈인지 `docs/` 상태로 판별

이 워크플로는 **3개 페이즈**로 진행된다. 저장된 상태 라벨이 아니라 **`docs/`의 실제 완성도**가 페이즈를 말해준다. 턴을 시작하면 먼저 `docs/`를 읽고 아래로 판별한다.

| 판별 조건 | 현재 페이즈 | 이 페이즈가 완성하는 산출물 |
|---|---|---|
| `docs/` 없음·비어 있음 | **P1 탐색·질문** | PROJECT_CONTEXT · RESEARCH_REPORT · MVP_SPEC(초안) · OPEN_DECISIONS · DECISION_LOG(일부) |
| `MVP_SPEC.md` Status ≠ FINAL | **P1~P2 확정 진행 중** | 위 + ACCEPTANCE_CRITERIA · REQUIREMENT_TRACEABILITY · builder/** · tester/** · reviewer/** · MVP_SPEC(FINAL) |
| `MVP_SPEC.md` FINAL & `worktree_execution_guide/` 없음 | **P3 실행 교안** | FILE_OWNERSHIP · ROADMAP · worktree_execution_guide/** · CODEX_HANDOFF |
| `worktree_execution_guide/` 완비 | **완료** | Codex Desktop 전달 |

- **P1(탐색·질문):** 사용자 메시지를 신규 요구사항으로 보고 원문을 `PROJECT_CONTEXT.md`에 보존한 뒤 전체 흐름(§5)을 시작한다. BLOCKER는 즉시 질문, 비차단은 `OPEN_DECISIONS.md`에 기록한다.
- **P2(선택 반영·명세 확정):** 사용자가 `OPEN_DECISIONS.md`에 채운 선택·피드백을 **Main이 다시 읽어** 분해·전파(§6.4)하고 제품 명세를 FINAL로 굳힌다.
- **P3(실행 교안):** MVP 명세가 FINAL이면, Builder·Tester·Reviewer 결과를 Main이 종합해 worktree 실행 교안(§11)을 작성한다.

P1↔P2는 필요하면 반복한다. "3"은 고정 상한이 아니라 **최소 페이즈 수**이며, 완성 판정은 턴 수가 아니라 §9 완료 조건이다. (`docs/` 자체가 진행 상태다.)

### 4.2 Main이 하는 일

원문 보존 → teammate spawn·상호작용 연결 → 질문 후보 수집·중복 제거 → 사용자
BLOCKER 질문(`AskUserQuestion`, 한 묶음 최대 4개) → 답변 분해·전파 → teammate 재검토
→ Reviewer 정합성 검토 → Main 소유 문서(§7) 종합 → **턴 종료 출력(§8)**.

---

## 5. 오케스트레이션 흐름

```text
사용자 요구사항 입력
→ 원문 보존(PROJECT_CONTEXT.md)
→ 5 teammate 실행·각 관점 독립 분석
→ teammate 간 직접 상호작용·반박
→ 최소 5개 모호점 추출
→ BLOCKER 질문을 Main이 사용자에게 제시(최대 4개)
→ 사용자 답변 → 결정·화면·구현·테스트 영향으로 분해해 관련 teammate 재전달
→ 각 담당 docs 고도화 → Reviewer 정합성 검토
→ 남은 선택지를 OPEN_DECISIONS.md에 대안·권장안과 함께 기록
→ 턴 종료 출력으로 사용자에게 현재 상태·다음 할 일 안내
──────── 구현 차단 미결정이 사라질 때까지 위 질의·반영을 반복 ────────
→ 모든 차단 이슈 해소 · Reviewer 최종 승인
→ Main이 ROADMAP·REQUIREMENT_TRACEABILITY·worktree_execution_guide 종합
→ CODEX_HANDOFF 작성 → docs/ 자체가 최종 MVP 명세로 완성
→ Codex Desktop 실행 순서 안내
```

- 사용자 피드백 횟수를 미리 제한하지 않는다. 부족하면 추가 질의·반영을 반복한다.
- 질문은 실제로 구현 결과를 바꾸는 것만 한다(수 채우기용 가짜 질문 금지).
- 완성 판정은 턴 수가 아니라 **§9 완료 조건 충족 여부**다.

---

## 6. teammate 상호작용·질문·피드백 규칙 (핵심 설계)

### 6.1 필수 상호작용 경로

```text
Researcher        → Product Specifier : 유사 서비스·UX 근거
                  → Builder Planner   : 브라우저 제약·기술 선택 근거
Product Specifier → Builder Planner   : 화면·상태·동작 계약
                  → Tester            : 사용자 흐름·필수 요구사항
Builder Planner   → Tester            : DOM 구조·상태 변화·테스트 지점
                  → Reviewer          : 구현 복잡도·단일 파일 통합 위험
Tester            → Product Specifier : 검증 불가·모호한 요구사항 반송
                  → Reviewer          : 자동 테스트·수동 검토 경계
Reviewer          → 모든 관련 teammate : 범위 축소·확장·충돌 수정 요청
```

### 6.2 반박 의무

각 teammate는 최소 한 번 이상 다른 teammate 결과에 대해 누락 지적 / 과도한 범위 지적 / 단일 `index.html`로 어려운 설계 지적 / 요구사항 불일치 지적 / 테스트 불가능한 완료 조건 지적 / 더 단순한 대안 제시 / 사용자 결정 승격 / 약한 기술 선택 반박 중 하나를 한다. "동의한다"만으로 상호작용을 끝내지 않는다.

### 6.3 메시지 유형·로그

메시지 태그: `[FINDING]` `[CHALLENGE]` `[DECISION_REQUEST]` `[REVISION_REQUEST]` `[HANDOFF]` `[RESOLVED]`. Main은 결정에 영향을 준 핵심 주장·반박·합의·남은 충돌만 `docs/coordination/TEAM_INTERACTION_LOG.md`·`HANDOFF_LOG.md`에 요약한다(전체 대화 복사 금지, 가짜 로그 금지).

### 6.4 질문 분류와 즉시 질문

teammate는 사용자에게 직접 묻지 않는다. Main이 후보를 종합·분류한다.

| 분류 | 처리 |
|---|---|
| `BLOCKER` | Main이 즉시 사용자에게 질문 |
| `USER_FEEDBACK` | `docs/OPEN_DECISIONS.md`에 대안·권장안·임시값과 함께 기록 |
| `AGENT_RESOLVABLE` | 사용자에 묻지 않고 근거와 함께 해결 |
| `POST_MVP` | 향후 과제로 분리 |

즉시 질문은 `AskUserQuestion`으로 Main만 제시(한 묶음 최대 4개, 선택지 2~4개, 권장안 명시). 각 질문에 발의·검토 teammate / 왜 지금 결정이 필요한지 / 비전문가용 설명 / 각 선택지 장단점 / 권장안·이유 / 선택에 따라 달라지는 화면·구현·테스트를 포함한다.

```text
[발의: Product Specifier, Tester / 검토: Builder Planner]
결정할 사항: 목록을 클릭하면 상세를 어떻게 보여줄까요?
A안 — 오른쪽 고정 패널 / B안 — 겹치는 Drawer / C안 — 목록 아래 확장
권장안: B안 — 단일 index.html에서 구현량이 작고 반응형 대응이 쉽습니다.
영향: DOM 구조·CSS 배치·열기/닫기 E2E 테스트가 달라집니다.
```

### 6.5 피드백 분해·전파와 우선순위

사용자 답변을 한 곳에만 적지 않는다. Main은 각 피드백을 관련 요구사항·질문·확정 선택·추가 제약·영향(화면/DOM/CSS/JS 상태·이벤트/테스트/문서/기존 결정 충돌)으로 분해한 뒤, 관련 teammate에 개별 전달한다.

```text
Product Specifier → 화면 흐름·동작 명세 수정 (MVP_SPEC.md)
Builder Planner   → index.html 내부 구조·Task 수정 (builder/**)
Tester            → 검증 조건·테스트 케이스 수정 (tester/**)
Reviewer          → 범위 증가·문서 충돌 검토 (reviewer/**)
Researcher        → 추가 근거가 필요할 때만 보충 조사 (researcher/**)
```

모든 확정 결정은 `DECISION_LOG.md`에 ID로 기록한다. **우선순위:** 사용자의 가장 최근 명시적 답변 > `DECISION_LOG.md` 확정 > `MVP_SPEC.md` > `ACCEPTANCE_CRITERIA.md` > 에이전트 문서 > 권장 기본값. 사용자 결정을 조용히 덮어쓰지 않는다.

---

## 7. `docs/` 구조와 소유권

```text
docs/
├─ README.md · PROJECT_CONTEXT.md · MVP_SPEC.md · DECISION_LOG.md
├─ OPEN_DECISIONS.md · ACCEPTANCE_CRITERIA.md · REQUIREMENT_TRACEABILITY.md
├─ ROADMAP.md · FILE_OWNERSHIP.md · CODEX_HANDOFF.md
├─ researcher/ RESEARCH_REPORT.md
├─ builder/   INDEX_HTML_ARCHITECTURE.md · IMPLEMENTATION_PLAN.md · TASK_BREAKDOWN.md
├─ reviewer/  SCOPE_REVIEW.md · FINAL_REVIEW.md
├─ tester/    TEST_PLAN.md · TEST_CASES.md · MANUAL_REVIEW_CHECKLIST.md
├─ coordination/ TEAM_INTERACTION_LOG.md · HANDOFF_LOG.md
└─ worktree_execution_guide/
   README.md · WORKTREE_PLAN.md · PARALLEL_EXECUTION.md
   HANDOFF_PROTOCOL.md · TEST_AND_RETRY_LOOP.md · MERGE_GUIDE.md
```

| 소유자 | 직접 작성 |
|---|---|
| Researcher | `docs/researcher/**` |
| Product Specifier | `docs/MVP_SPEC.md` |
| Builder Planner | `docs/builder/**` |
| Reviewer | `docs/reviewer/**` |
| Tester | `docs/tester/**` |
| Main | 루트 문서(README·PROJECT_CONTEXT·DECISION_LOG·OPEN_DECISIONS·ACCEPTANCE_CRITERIA·REQUIREMENT_TRACEABILITY·ROADMAP·FILE_OWNERSHIP·CODEX_HANDOFF)·`coordination/**`·`worktree_execution_guide/**` |

teammate는 다른 소유자 파일을 직접 수정하지 않고 `[REVISION_REQUEST]`를 보낸다.
`ACCEPTANCE_CRITERIA.md`·`REQUIREMENT_TRACEABILITY.md`는 Main이 조립하되 AC 문구는 Product Specifier, 검증 방법은 Tester, Task 연결은 Builder Planner의 `[HANDOFF]`를 근거로 한다. 같은 내용을 여러 파일에 중복하지 않는다.

`FILE_OWNERSHIP.md`(Main 소유)는 단일 `index.html`의 **코드 영역별 소유권 계약**이다 — 어느 worktree가 어떤 HTML/CSS/JS 섹션을 소유·수정하고 무엇은 건드리면 안 되는지를 한눈에 정의한다. Builder Planner의 코드 영역 분리 입력(`[HANDOFF]`)을 근거로 Main이 작성한다. (`WORKTREE_PLAN`은 "언제 어떤 명령·프롬프트로 실행"인지, `FILE_OWNERSHIP`은 "어떤 코드 영역을 누가 소유"인지로 역할이 분리된다.)

**공통 헤더**(각 문서 상단): `Status: DRAFT|FINAL|DEFERRED` · `Owner` · `Inputs` · `Last Updated` · `Related Decisions/Requirements`. **ID:** `REQ` `DEC` `Q` `AC` `TEST` `TASK` `RISK`. 완료 조건은 "적절히/잘/보기 좋게" 같은 모호 표현 대신 존재·위치·크기·동작을 구체 수치로 쓴다.

---

## 8. 턴 종료 출력 (사용자 입력을 기다릴 때마다 필수)

Main은 한 턴을 마치고 사용자 응답을 기다릴 때, **항상 아래 블록을 출력**한다.
사람이 대화 기록을 다시 읽지 않고도 현재 상태와 다음 행동을 직관적으로 알고 이어서 진행할 수 있어야 한다. 길게 설계를 반복하지 말고 이 형식만 채운다.

```text
■ 이번 턴 진행 상태
- 실행한 teammate와 완료 작업
- 생성·수정한 docs 파일 목록 (경로)
- 확정된 결정(DEC-###) / 남은 미결정(Q-###)

■ 지금 사용자가 할 일
- (즉시 질문이 있으면) AskUserQuestion에 답하거나, docs/OPEN_DECISIONS.md의
  Q-###에 대해 아래 형식으로 회신:
      Q-001: B
      Q-002: 권장안 적용
      추가 피드백: 상세 패널 폭은 화면의 약 35%
- (검토 요청이면) 먼저 읽을 파일: docs/MVP_SPEC.md · docs/OPEN_DECISIONS.md · docs/ROADMAP.md

■ 다음 턴에 Main이 이어서 할 일
- 사용자 회신을 어느 teammate에 전파하고 어떤 문서를 고도화할지
- 남은 차단 이슈

■ 최종 여부
- (미완) 아직 최종이 아님 — 남은 것: (한 줄)
- (완료) docs/ 최종 완성. Codex Desktop에서 시작 가능(§10 시작 안내 출력).
```

- 아직 최종이 아니면 Codex 구현을 시작하라고 안내하지 않는다.
- 최종이면 §10의 Codex 시작 안내를 함께 출력한다.

---

## 9. 완료 조건

아래를 **모두** 충족하기 전에는 완료로 선언하지 않는다.

- [ ] 5 teammate가 실행되어 각자 최소 한 작업을 완료했다.
- [ ] 각 teammate가 최소 한 번 다른 teammate를 검토·반박했다.
- [ ] 최소 5개 모호점을 추출하고 BLOCKER를 사용자에게 질문했다.
- [ ] 사용자 답변이 분해·전파되어 `DECISION_LOG.md`에 기록됐고, 남은 선택은
      `OPEN_DECISIONS.md`에 대안·권장안·임시값과 함께 있다.
- [ ] 구현을 막는 미결정이 없다(비차단은 권장안 또는 POST_MVP로 처리).
- [ ] `MVP_SPEC.md`의 화면·상태·동작이 구현 가능한 수준으로 구체적이다.
- [ ] 모든 AC에 검증 방법(자동/수동)이 있고, `REQUIREMENT_TRACEABILITY.md`가
      요구사항→화면→Task→Worktree→AC→Test를 연결한다.
- [ ] MVP 범위가 §2.1 상한(화면 1개·핵심 상호작용 1~2개·worktree 3~4개·약 8~10턴·2~3시간) 안에 있다.
- [ ] `FILE_OWNERSHIP.md`가 코드 영역별 소유권을 겹침 없이 정의한다.
- [ ] `worktree_execution_guide/`가 §11 하이브리드 원칙과 **Codex 턴별 런북(짧은 붙여넣기 프롬프트·완료 체크포인트 포함)**을 담는다.
- [ ] Reviewer가 충돌·범위·단일 파일 제약을 최종 검토·승인했다.
- [ ] `CODEX_HANDOFF.md`만 읽어도 Codex Main이 시작할 수 있다.
- [ ] 모든 최종 문서 Status가 `FINAL` 또는 명시적 `DEFERRED`다.
- [ ] 제품 코드(`index.html`)를 작성하지 않았다.

---

## 10. Codex Desktop 전달

`docs/CODEX_HANDOFF.md`는 Codex Main이 처음 읽을 브리프다. 포함: 프로젝트 목적과 단일 `index.html` 제약 / 읽을 문서 순서 / 변경 금지 사용자 결정 / Worktree 생성·코드 영역 소유권 규칙(FILE_OWNERSHIP) / 병렬 시작 순서(선행 골격→병렬 기능→테스트) / **예상 규모(worktree 3~4개·약 8~10턴·2~3시간)와 턴별 런북 위치(worktree_execution_guide/WORKTREE_PLAN)** / Tester 검증·실패 시 Builder 반환 / merge 전 확인 증거 / 첫 Codex Main 시작 프롬프트.

**이식성:** 모든 경로는 프로젝트 루트 기준 상대 경로, Claude 대화 기록에 의존 금지, `docs/` 복사만으로 의미 유지, 임시 런타임 파일을 필수 입력으로 쓰지 않음.

최종 완료 시 사용자에게 출력할 Codex 시작 문구:

```text
docs/CODEX_HANDOFF.md부터 지정된 순서(FILE_OWNERSHIP → ROADMAP →
worktree_execution_guide/README → WORKTREE_PLAN)대로 읽어라. 사용자 확정 결정을
바꾸지 말고, 먼저 index.html 골격을 만들어 공유 표면(state·CSS 변수·selector·앵커)을
확정한 뒤, WORKTREE_PLAN의 턴별 스텝(짧은 프롬프트)대로 목적이 다른 worktree
3~4개를 만들어 구현하라. 각 worktree는 허용된 코드 영역만 수정하고, Tester 검증과
Reviewer 기준을 통과한 commit만 Main에서 순차 통합·회귀하라. 전체는 약 8~10턴/
2~3시간을 목표로 한다.
```

---

## 11. `worktree_execution_guide/` 원칙 (Main이 종합)

명령어 나열이 아니라 **교육생이 그대로 따라 하는 실습 런북**이다. 교육생은 이 가이드와 `docs/`만 보고 Codex Desktop에서 **2~3시간 안에 8~10턴**으로 MVP를 완성할 수 있어야 한다. 어렵거나 딥한 설명은 넣지 않는다.

### 11.1 단일 파일 × worktree 하이브리드 원칙

최종 제품이 하나의 `index.html`이라 무분별한 병렬은 충돌을 부른다. 따라서:

1. **골격 선(先)합의 + 공유 표면 선점** — 첫 단계에서 `index.html` 골격을 만들며 **공유 표면을 미리 못 박는다**: state 객체 전체 필드, CSS custom properties, 렌더 디스패치, 섹션 앵커 주석(`<!-- ==== SECTION: LIST ==== -->` 등). 이후 기능 worktree는 공유 spine을 수정하지 않고 **자기 앵커 블록만** 채운다.
2. **worktree는 3~4개, 목적이 서로 다르게** — 예: `wt-ui`(레이아웃·CSS·목록/상세 뼈대), `wt-interaction`(선택·열기/닫기·필터 상태), `wt-persistence`(localStorage·빈/오류 상태), `wt-tests`(별도 파일이라 충돌 없는 병렬 안전 구간). 규모가 작으면 3개로 합친다.
3. **테스트 worktree는 진짜 병렬 안전** — 테스트 자산은 `index.html`과 별도 파일이므로 언제든 병렬 가능.
4. **Main 순차 통합 + 매 병합 후 회귀** — 정해진 순서로 병합하고 병합마다 테스트 재실행. 충돌은 해당 앵커 블록 안에서만 해소.
5. **억지 병렬 금지** — 공유 state를 많이 건드리는 작업은 순차로 표시. 단일 파일 동시 worktree 상한은 사실상 3~4개.

### 11.2 런북 형식 (필수)

`WORKTREE_PLAN`과 `PARALLEL_EXECUTION`은 **Codex 턴별 스텝**으로 쓴다. 각 스텝에 반드시 담는다:

- 그 턴에 만들/딸 worktree와 정확한 git 명령(예: `git worktree add ../wt-ui -b feat/ui`, Windows 경로 병기)
- **교육생이 Codex에 그대로 붙여넣을 짧은 프롬프트(2~4줄)**
- 그 턴의 **완료 체크포인트**(어떤 selector/동작이 존재해야 하는지 = Definition of Done)
- 실패 시 분기(제품 문제인지 테스트 문제인지 → 어느 worktree로 반환)

예시 스텝:

```text
[Codex T2] wt-ui 워크트리에서 목록/상세 레이아웃 채우기
명령: git worktree add ../wt-ui -b feat/ui
붙여넣기 프롬프트:
  "docs/builder/INDEX_HTML_ARCHITECTURE.md의 LIST·DETAIL 앵커 섹션만 채워라.
   공유 state와 CSS 변수는 수정하지 마라. #app-list, #detail-panel selector를 유지하라."
완료: #app-list에 mock 항목이 렌더되고 #detail-panel이 존재한다.
```

### 11.3 파일별 내용

- `README` — 전체 흐름·읽는 순서·Builder→Tester→Reviewer→Main 사이클·"문서와 commit이 계약"·예상 8~10턴/2~3시간
- `WORKTREE_PLAN` — worktree별 표(ID·브랜치·목적·담당 코드 영역·금지 영역·완료 체크포인트·테스트·merge 순서) + 위 런북 스텝. `wt-ui`처럼 목적으로 명명, `wt-builder-1` 금지
- `PARALLEL_EXECUTION` — 골격 선행, 어느 턴에 무엇을 병렬/순차로 하는지, 충돌 구역 분리, Main 상태 추적
- `HANDOFF_PROTOCOL` — Builder→Tester, Tester→Builder/Main, Reviewer→Main 전달 계약
- `TEST_AND_RETRY_LOOP` — 구현→자체 테스트→commit→검증→실패 증거→수정→재검증→리뷰→통합, 회귀 유지, 제품/테스트 문제 구분, 반복 실패 Main 승격
- `MERGE_GUIDE` — merge 전 체크·순서·충돌 처리·정리·회귀·완료 보고

`FILE_OWNERSHIP.md`(Main 소유 루트)와 짝을 이룬다: FILE_OWNERSHIP이 "어떤 코드 영역을 누가 소유"인지, WORKTREE_PLAN이 "언제 어떤 명령·프롬프트로 실행"인지를 담당한다.

---

## 12. 금지

- 짧은 요구사항을 충분한 명세로 가정 · 질문 없이 화면 구조 임의 확정
- teammate가 사용자에게 직접 질문 · 질문 출처·영향 설명 생략 · 권장안·이유 생략
- 외부 조사 없이 최신 기술 추측 · Researcher 제안을 검증 없이 요구사항으로 채택
- Reviewer가 반박 없이 요약만 함 · Tester가 테스트 불가능한 의미 품질을 자동 검증
  가능하다고 주장 · 실행 안 한 테스트를 통과라고 기록
- 같은 코드 영역/파일을 여러 Worktree에 동시 배정
- 사용자 피드백을 일부 문서에만 반영 · 사용자 결정을 권장안으로 조용히 변경
- Claude 대화 기록을 Codex가 안다고 가정 · 제품 코드 미리 구현
- §2 단일 파일 제약 위반 설계를 명세에 포함 · 가짜 상호작용 로그 작성
- teammate 완료 전 Main 혼자 최종화 · 계획만 말하고 실제 실행·문서 작성을 생략

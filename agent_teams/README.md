# MVP 아이디에이션 → Codex 구현 Starter Kit

짧은 아이디어 한 줄을 **Codex Desktop에서 2~3시간 안에 구현 가능한 단일 `index.html`
MVP 설계 문서**로 바꿔 주는 실습 키트입니다. Claude Code가 5명의 전문 teammate를
돌려 요구사항을 확장·질문·설계하고, 그 결과를 `docs/`에 남깁니다. 교육생은 그
`docs/`를 Codex Desktop으로 가져가 실제 MVP를 완성합니다.

---

## 이 키트의 구성

```text
agent_teams/
├─ README.md          ← (지금 이 문서) 사용법
├─ CLAUDE.md          ← Main 세션 오케스트레이션 규칙 (Claude Code가 자동으로 읽음)
├─ agent_prompts/     ← 5명 teammate의 실행 프롬프트 (Main이 spawn 시 사용)
│  ├─ researcher.md · product_specifier.md · builder_planner.md
│  └─ reviewer.md · tester.md
└─ docs/              ← (실습 중 생성됨) 최종 MVP 설계 명세 = 진짜 산출물
```

- `docs/`는 실습을 시작하면 자동으로 만들어집니다. 처음엔 비어 있습니다.
- 최종 산출물은 `docs/` 전체입니다. 대화 기록 없이 그 폴더만으로 이해·구현됩니다.

---

## 고정 제약 (반드시 알아둘 것)

- 최종 MVP는 **브라우저에서 바로 여는 단일 `index.html` 하나**입니다.
- HTML·CSS·JS를 한 파일에 임베드합니다. **React·Vue·npm·bundler·백엔드·DB·인증
  서버는 쓰지 않습니다.** 데이터는 정적 객체·mock·`localStorage`로 처리합니다.
- 규모는 **작게 고정**: 화면 1개 + 핵심 상호작용 1~2개 + 저장 정도. Codex에서
  목적이 다른 **worktree 3~4개**, **약 8~10턴**, **2~3시간**에 끝나는 크기입니다.

---

## 진행 흐름 (3 페이즈)

### 페이즈 1 — 아이디어 입력·질문
Claude Code 세션에 **아이디어를 5~10줄** 정도로 적어 보냅니다.
그러면 5 teammate가 조사·설계하고, 꼭 필요한 결정 몇 가지를 당신에게 질문합니다.
바로 답하기 애매한 선택지는 `docs/OPEN_DECISIONS.md`에 "대안 + 권장안 + 영향"과
함께 기록됩니다.

> 입력 예시: "동네 러닝 크루 기록을 보는 웹앱을 원해요. 목록에서 크루를 고르면
> 오른쪽에 상세(코스·페이스·후기)가 보이고, 즐겨찾기를 저장했으면 해요. ..."

### 페이즈 2 — 선택 반영·명세 확정
`docs/OPEN_DECISIONS.md`를 읽고 선택/추가 의견을 적은 뒤 "반영해서 확정해줘"라고
말합니다. Main이 그 결정을 관련 teammate에 전파해 **제품 명세(MVP_SPEC)**·구현
계획·테스트 계획을 최종(FINAL)으로 굳힙니다. 필요하면 이 과정을 몇 번 반복합니다.

### 페이즈 3 — Codex 실행 교안 작성
명세가 확정되면 Main이 **`docs/worktree_execution_guide/`**(Codex 턴별 런북)와
`FILE_OWNERSHIP.md`·`ROADMAP.md`·`CODEX_HANDOFF.md`를 완성합니다. 여기까지가
Claude Code의 역할입니다. **제품 코드는 여기서 만들지 않습니다.**

각 페이즈 끝에서 Main이 "지금 상태 / 지금 할 일 / 다음 할 일"을 명시적으로 출력하니
그대로 따라가면 됩니다.

---

## 완성 후 — Codex Desktop에서 구현

`docs/`가 완성되면 그 폴더를 Codex Desktop으로 가져가, 다음 문장으로 시작합니다.

```text
docs/CODEX_HANDOFF.md부터 지정된 순서대로 읽고, WORKTREE_PLAN의 턴별 스텝(짧은
프롬프트)대로 목적이 다른 worktree 3~4개를 만들어 단일 index.html을 구현하라.
사용자 확정 결정을 바꾸지 말고, Tester 검증과 Reviewer 기준을 통과한 commit만
순차 통합·회귀하라.
```

`worktree_execution_guide/`에는 각 Codex 턴마다 **딸 worktree·git 명령·붙여넣을
짧은 프롬프트·완료 체크포인트**가 적혀 있어, 그대로 따라 하면 됩니다.

---

## 시작하기

Claude Code를 이 폴더에서 열고, **아이디어를 5~10줄 적어 보내면** 됩니다. 끝.


---

## 🚀 [보강] Worktree 기반 병렬 실행 프로토콜 및 실습 요약

### 1. Worktree 브랜치 분할 전략
- `wt-ui`: HTML 시맨틱 마크업 및 Tailwind/CSS 스타일링
- `wt-interaction`: Vanilla JS 이벤트 리스너, 키보드 단축키, 애니메이션
- `wt-persistence`: 브라우저 LocalStorage 기반 상태 복원 로직
- `wt-tests`: Cypress/Playwright 또는 DOM assertion 기반 검증 스위트

### 2. 핸드오프 및 머지 프로토콜
각 워크트리 에이전트는 작업 완료 시 `docs/CODEX_HANDOFF.md`에 변경 사항과 검증 결과를 기록하고, 메인 세션이 순차적으로 cherry-pick/merge를 수행하여 단일 `index.html` 파일로 통합합니다.

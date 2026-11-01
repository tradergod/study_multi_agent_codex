# Frontend report

- Branch: `task/003-frontend`
- 변경 파일: `index.html`, `src/app.js`, `src/styles.css`, `docs/task_003/frontend/report.md`
- 구현 UI: P0/P1/P2/Owner Review 요약, All·priority·area 필터, 반응형 issue card grid, P0 강조, 오류 패널
- API: `GET /api/issues` 후 각 issue를 `POST /api/triage`로 분류하고 카드/요약에 반영
- 테스트 결과: `py scripts/check_dom.py` PASS
- 남은 리스크: 브라우저에서 백엔드 서버가 실행 중이어야 실제 API 데이터가 표시됨.

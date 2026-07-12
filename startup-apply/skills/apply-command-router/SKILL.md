---
name: apply-command-router
description: 슬래시 커맨드를 지원하지 않는 환경(Codex 등)에서 startup-apply의 커맨드 워크플로우를 실행합니다. "지원사업 찾아줘", "공고 소싱", "적합도 분석해줘", "사업계획서 작성", "사업계획서 HWP로 내보내기", "HWPX 변환", "지식베이스 구축", "KB 만들어줘", "지식베이스 갱신", "지원사업 데일리 리포트", "기존 계획서 재활용", "지원사업 도움말" 등 커맨드에 해당하는 요청이 오면 활성화됩니다.
---

# Apply Command Router

이 스킬은 슬래시 커맨드가 없는 호스트(Codex CLI 등)를 위한 라우터입니다. Claude Code에서는 슬래시 커맨드(`/apply-find` 등)가 우선이므로 이 스킬은 무시해도 됩니다.

## 실행 규칙

1. 아래 표에서 사용자 요청에 맞는 커맨드 파일을 찾습니다.
2. 플러그인 루트의 `commands/<파일>`을 읽습니다 (이 스킬 파일 기준 상대경로 `../../commands/`).
3. 그 문서를 실행 워크플로우로 취급해 **그대로 수행**합니다 — 출력 형식, 단계, 폴백 규칙 포함.
4. 문서 안의 "에이전트 병렬 실행" 지시는 이 환경에 서브에이전트가 없으므로 **본체가 순차 수행**합니다.
5. 문서 안의 다른 `/커맨드` 참조는 이 표에서 다시 찾아 해당 파일로 이동합니다.
6. HWPX 생성·양식 채우기는 kordoc CLI(`npx -y kordoc`)를 그대로 사용합니다 — 이 환경에서도 동일하게 작동합니다.

## 라우팅 표

| 요청 | 커맨드 파일 |
|---|---|
| 전체 커맨드 지도·도움말 | `commands/apply-help.md` |
| 지원사업 공고 찾기·소싱 | `commands/apply-find.md` |
| 특정 공고 적합도 분석 | `commands/apply-check.md` |
| 데일리 리포트·마감 현황 | `commands/apply-daily.md` |
| 사업계획서 작성 | `commands/apply-write.md` |
| 기존 계획서를 새 공고에 맞게 변환 | `commands/apply-update.md` |
| HWPX 내보내기·양식 채우기·진단(doctor) | `commands/apply-export.md` |
| 지식베이스 초기 구축 (문서 추출/인터뷰) | `commands/kb-init.md` |
| 지식베이스 갱신·점검 | `commands/kb-update.md` |

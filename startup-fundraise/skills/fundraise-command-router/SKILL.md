---
name: fundraise-command-router
description: 슬래시 커맨드를 지원하지 않는 환경(Codex 등)에서 startup-fundraise의 커맨드 워크플로우를 실행합니다. "투자유치 루틴 시작", "fundraise 실행", "VC 찾아줘", "투자자 미팅 준비", "파이프라인 점검", "리드 대시보드", "투자자 업데이트 작성", "피치덱 리뷰", "IR 자료 만들어줘", "딜소싱", "DD 준비", "투자 유치 예측", "비즈니스 케이스", "시장 규모 분석", "GTM 계획", "투자유치 도움말" 등 커맨드에 해당하는 요청이 오면 활성화됩니다.
---

# Fundraise Command Router

이 스킬은 슬래시 커맨드가 없는 호스트(Codex CLI 등)를 위한 라우터입니다. Claude Code에서는 슬래시 커맨드(`/fundraise` 등)가 우선이므로 이 스킬은 무시해도 됩니다.

## 실행 규칙

1. 아래 표에서 사용자 요청에 맞는 커맨드 파일을 찾습니다.
2. 플러그인 루트의 `commands/<파일>`을 읽습니다 (이 스킬 파일 기준 상대경로 `../../commands/`).
3. 그 문서를 실행 워크플로우로 취급해 **그대로 수행**합니다 — 출력 형식, 단계, 라우팅 규칙 포함.
4. 문서 안의 "에이전트 병렬 실행" 지시는 이 환경에 서브에이전트가 없으므로 **본체가 순차 수행**합니다.
5. 문서 안의 다른 `/커맨드` 참조는 이 표에서 다시 찾아 해당 파일로 이동합니다.

## 라우팅 표

| 요청 | 커맨드 파일 |
|---|---|
| 투자유치 시작·오늘 뭐부터, 메인 루틴 | `commands/fundraise.md` |
| 전체 커맨드 지도·도움말 | `commands/fundraise-help.md` |
| 자료 폴더 정리·구조화 | `commands/fundraise-data.md` |
| VC/AC/TIPS 운영사 찾기 | `commands/find-vc.md` |
| 특정 투자자 미팅·아웃리치·후속조치·DD 관리 | `commands/vc-meeting.md` |
| 일일 브리핑 | `commands/daily-fundraise.md` |
| 리드 현황 스냅샷 | `commands/lead-dashboard.md` |
| 파이프라인 심층 진단·병목 | `commands/fundraise-pipeline.md` |
| 목표/생존 의사결정 (office hours) | `commands/fundraise-office-hours.md` |
| 투자자 타겟 발굴·thesis 매칭 | `commands/deal-sourcing.md` |
| 아웃리치 이메일 작성 | `commands/investor-outreach.md` |
| DD·미팅 준비, 예상 질문 | `commands/dd-prep.md` |
| 월간/분기 투자자 업데이트 | `commands/investor-update.md` |
| 피치덱 평가·리뷰 | `commands/pitch-review.md` |
| IR HTML 아티팩트 (원페이저, 데이터룸) | `commands/create-ir-asset.md` |
| 유치 예측·런웨이 교차점 | `commands/fundraise-forecast.md` |
| 종합 비즈니스 케이스 | `commands/business-case.md` |
| TAM/SAM/SOM 시장 규모 | `commands/market-opportunity.md` |
| GTM 전략·90일 계획 | `commands/gtm-plan.md` |
| 공시 로컬 MCP 설치·점검 | `commands/vc-funds-setup.md` |

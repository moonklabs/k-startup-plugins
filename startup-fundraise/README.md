# startup-fundraise

**VC/AC 투자 유치 일상을 자동화하는 Startup OS 플러그인**
웹 검색만으로 단독 작동하며, CRM·이메일·문서 도구를 연결하면 더 강력해집니다.

```bash
claude plugins install startup-fundraise
```

---

## 병렬 에이전트

반복 작업을 전담 에이전트가 동시에 처리합니다.

| 에이전트 | 역할 |
|---------|------|
| `investor-researcher` | 투자자 7-10쿼리 리서치 + Thesis 매칭 (GREEN/YELLOW/RED) |
| `vc-fund-disclosure-orchestrator` | VC/AC 공시 evidence + 창업자 가이드 로컬 MCP 설계 SOT |
| `investor-email-writer` | 아웃리치 이메일 초안 + Day 5/10/21 팔로업 시퀀스 |
| `market-researcher` | TAM/SAM/SOM 3방법론 교차검증 |
| `competitor-analyst` | Porter's 5 Forces + 포지셔닝 매트릭스 + 배틀카드 |
| `financial-modeler` | Base/Bull/Bear 3-시나리오 + Unit Economics |
| `vc-question-prepper` | 예상 VC 질문 30개 + 카테고리별 답변 전략 |

> `/business-case` 하나만 실행해도 시장 분석·경쟁 분석·재무 모델이 동시에 완성됩니다.

---

## 14개 슬래시 커맨드

```
/daily-fundraise      # 일일 브리핑 — 오늘의 우선순위, 팔로업, 미팅 준비
/deal-sourcing        # 투자자 타겟 발굴 + Thesis 매칭
/vc-funds-setup       # VC/AC 공시·창업자 가이드 로컬 MCP 설치 설계 및 점검
/lead-dashboard       # 파이프라인 건강점수 + 단계별 현황 + 리스크 플래그
/investor-outreach    # VC 리서치 → 웜인트로 / 콜드 이메일 자동 생성
/fundraise-pipeline   # 파이프라인 건강점수 (100점) + 커버리지 분석
/investor-update      # 월간 투자자 업데이트 — 지표, 하이라이트, 도움 요청
/pitch-review         # 피치 덱 100점 평가 + 슬라이드별 개선 가이드
/dd-prep              # DD 미팅 준비 — 예상 질문 30개 + 데이터룸 체크리스트
/create-ir-asset      # IR HTML 아티팩트 — Executive Summary, 원페이저
/fundraise-forecast   # 3-시나리오 예측 + 런웨이 교차점
/business-case        # 투자자용 10섹션 비즈니스 케이스 문서
/market-opportunity   # TAM/SAM/SOM 3방법론 교차 검증
/gtm-plan             # GTM 모션, ICP, 채널, 90일 실행 계획
```

---

## 14개 도메인 스킬

대화 맥락에서 Claude가 자동 활성화하는 VC/창업 지식.

**펀드레이징** — `fundraising-process` `investor-research` `deal-sourcing`
`vc-fund-disclosure-mcp` `pitch-craft` `financial-modeling` `term-sheet-knowledge` `fundraise-comms`

**사업 분석** — `startup-metrics` `market-sizing` `competitive-landscape`

**GTM & 세일즈** — `gtm-strategy` `pricing-strategy` `sales-playbook`

---

## MCP 연동

```
CRM          → HubSpot, Notion, Relate
이메일·캘린더 → Microsoft 365, Gmail, Google Calendar
데이터 보강   → OpenDART, THE VC, 혁신의숲 (웹 검색)
VC/AC 공시·가이드 → 로컬 vc-fund-disclosure-mcp (Draft)
문서          → Notion, Google Docs, Microsoft 365
분석          → Mixpanel, Amplitude, ChartMogul
```

로컬 공시 MCP 구현 스펙은 `mcp/vc-fund-disclosure/`에 있습니다. source registry, SQLite schema, seed, source trust/input resolution contract, 검색/랭킹 contract, tool contract, display query, quality check pack을 함께 관리합니다.

자세한 내용은 [CONNECTORS.md](CONNECTORS.md)를 참조하세요.

---

## 라이선스

Apache 2.0

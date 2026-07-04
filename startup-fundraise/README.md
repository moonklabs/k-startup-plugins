# startup-fundraise

**VC/AC 투자 유치 일상을 자동화하는 Startup OS 플러그인**
웹 검색만으로 단독 작동하며, CRM·이메일·문서 도구를 연결하면 더 강력해집니다.

```bash
claude plugins install startup-fundraise
```

---

## 빠른 시작: 투자유치 준비 루틴

처음 투자유치를 준비하는 스타트업은 아래 순서로 시작합니다. 핵심은 투자자 리스트를 먼저 많이 뽑는 것이 아니라, 라운드 목표, 공식 펀드 근거, 미팅 순서, 후속 액션을 함께 운영하는 것입니다.

| 단계 | 목적 | 실행 |
|---|---|---|
| 0. 준비 상태 판정 | 지금 라운드를 시작할지, 한 달 더 증거를 쌓을지 결정 | `/fundraising-process "Seed/Pre-A 준비"` |
| 1. 로컬 공시 DB 준비 | KVIC/KVCA snapshot과 가이드 문서를 나중에 검색할 수 있게 준비 | `/vc-funds-setup local-dev` |
| 2. 공식 펀드 근거 수집 | VC/AC가 실제 펀드 근거를 갖는지 확인 | `vc-funds import kvic`, `vc-funds import kvca`, `vc-funds search` |
| 3. 후보 VC 3단계화 | 연습 미팅, 투자 가능성 검증, 리드 클로징 순서로 나눔 | `/deal-sourcing "뭉클랩 AI B2B SaaS Seed Pre-A Korea"` |
| 4. 아웃리치와 미팅 준비 | 웜인트로, 콜드 이메일, DD 질문, 다음 액션 준비 | `/investor-outreach`, `/dd-prep` |
| 5. 매일 운영 | 오늘의 최우선 액션, 후속 연락, 정체 리스크 확인 | `/daily-fundraise`, `/fundraise-pipeline` |

상세한 운영 방법과 PASS/FAIL 검증 기준은 [Founder Fundraising Operating Use Cases](skills/fundraising-process/references/founder-fundraising-operating-use-cases.md)를 참고하세요.

### 핵심 운영 원칙

- Fundraising mode를 분리합니다. 시작 전 자료와 타겟을 준비하고, 시작하면 6-8주 동안 집중적으로 병렬 진행합니다.
- 투자자의 긍정 표현보다 행동을 봅니다. 다음 미팅, DD 요청, 조건 논의, 송금 일정이 없으면 아직 확정이 아닙니다.
- 후보 VC는 직렬이 아니라 병렬로 진행합니다. 다만 기대값이 높은 후보에 더 많은 시간을 씁니다.
- TIPS는 회사가 혼자 신청하는 트랙이 아닙니다. 운영사 투자심사, 투자 확약, 추천 가능성, R&D 과제 적합성을 함께 봅니다.
- `vc-funds`는 추천 엔진이 아니라 evidence layer입니다. 공식 근거, data gap, source hash, parser warning을 확인하는 데 씁니다.

### 가장 먼저 답해야 할 질문

1. 이번 라운드의 목표 금액, 목표 runway, 희석률 상한은 무엇인가?
2. 투자자에게 보여줄 traction 숫자 3개는 무엇인가?
3. 투자유치 시작 희망일과 마감 희망일은 언제인가?
4. 정말 잡고 싶은 리드 후보 VC/AC 5곳은 어디인가?
5. TIPS는 필수 목표인가, 있으면 좋은 보조 신호인가?

---

## 로컬 `vc-funds` CLI 초안 사용

현재 repo-local 초안은 `startup-fundraise/mcp/vc-fund-disclosure/runtime/`에서 바로 실행할 수 있습니다.

```bash
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs setup --db /tmp/vc-funds.sqlite --json
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs doctor --db /tmp/vc-funds.sqlite --json
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs load-sql startup-fundraise/mcp/vc-fund-disclosure/runtime/fixtures/sample-data.sql --db /tmp/vc-funds.sqlite --json
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs search "뭉클랩 AI SaaS Seed Pre-A 투자사" --db /tmp/vc-funds.sqlite --json
```

사용자가 저장한 KVIC/KVCA HTML 또는 CSV snapshot을 import합니다.

```bash
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs import kvic \
  --file ./snapshots/fundfinder-AA02.html \
  --source-url http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd \
  --captured-at 2026-07-04T00:00:00.000Z \
  --db /tmp/vc-funds.sqlite \
  --json

node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs import kvca \
  --file ./snapshots/kvca-primer.csv \
  --source-url http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq \
  --captured-at 2026-07-04T00:00:00.000Z \
  --db /tmp/vc-funds.sqlite \
  --json
```

현재 P0 런타임은 HTML/CSV snapshot import와 검색에 집중합니다. XLS/XLSX snapshot은 `unsupported_format`으로 거절하고, PDF/HWP/HWPX/HWPML/Office 문서 import는 planned surface입니다. 문서 파싱은 직접 파서를 만들지 않고 [kordoc](https://github.com/chrisryugj/kordoc) CLI/MCP adapter를 사용합니다.

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

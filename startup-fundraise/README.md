# startup-fundraise

**VC/AC 투자 유치 일상을 자동화하는 Startup OS 플러그인**
웹 검색만으로 단독 작동하며, CRM·이메일·문서 도구를 연결하면 더 강력해집니다.

```bash
claude plugins marketplace add moonklabs/k-startup-plugins
claude plugins install startup-fundraise
```

Codex에서 사용할 때는 marketplace를 먼저 등록합니다.

```bash
codex plugin marketplace add moonklabs/k-startup-plugins --ref main
codex plugin add startup-fundraise@startup-plugins
```

로컬 개발 checkout을 직접 테스트할 때는 로컬 marketplace 경로를 등록합니다.

```bash
codex plugin marketplace add /path/to/your/local/checkout/k-startup-plugins
codex plugin add startup-fundraise@startup-plugins
```

---

## 빠른 시작: 투자유치 준비 루틴

처음 투자유치를 준비하는 스타트업은 4개 기본 커맨드로 시작합니다. 핵심은 투자자 리스트를 먼저 많이 뽑는 것이 아니라, 생존 목표, 라운드 목표, 공식 펀드 근거, 미팅 순서, 후속 액션을 함께 운영하는 것입니다.

| 단계 | 목적 | 실행 |
|---|---|---|
| 1. 목표 설정 | runway, 생존 목표, 라운드 목표, 이번 주 액션을 정함 | `/fundraise "Seed/Pre-A 준비"` |
| 2. 자료 구조화 | IR, 아웃리치, 투자자 파이프라인, 미팅 노트, 데이터룸을 AI 분석 가능한 구조로 정리 | `/fundraise-data "./fundraise"` |
| 3. 투자자 찾기 | VC/AC/TIPS 운영사를 연습/검증/클로징 순서로 나눔 | `/find-vc "뭉클랩 AI B2B SaaS Seed Pre-A Korea"` |
| 4. 미팅 운영 | 아웃리치, 미팅 준비, 미팅 후 기록, objection log, DD를 관리 | `/vc-meeting "투자자명"` |

상세한 운영 방법과 PASS/FAIL 검증 기준은 [Founder Fundraising Operating Use Cases](skills/fundraising-process/references/founder-fundraising-operating-use-cases.md)를 참고하세요.

### 핵심 운영 원칙

- Fundraising mode를 분리합니다. 시작 전 자료와 타겟을 준비하고, 시작하면 6-8주 동안 집중적으로 병렬 진행합니다.
- 투자자의 긍정 표현보다 행동을 봅니다. 다음 미팅, DD 요청, 조건 논의, 송금 일정이 없으면 아직 확정이 아닙니다.
- 후보 VC는 직렬이 아니라 병렬로 진행합니다. 다만 기대값이 높은 후보에 더 많은 시간을 씁니다.
- TIPS는 회사가 혼자 신청하는 트랙이 아닙니다. 운영사 투자심사, 투자 확약, 추천 가능성, R&D 과제 적합성을 함께 봅니다.
- `vc-funds`는 추천 엔진이 아니라 evidence layer입니다. 공식 근거, data gap, source hash, parser warning을 확인하는 데 씁니다.

### 가장 먼저 답해야 할 질문

1. 현재 현금잔고, 월 burn, 확정 수금, runway, 다음 자금 공백 날짜는 무엇인가?
2. 이번 라운드의 목표 금액, 목표 runway, 희석률 상한은 무엇인가?
3. 투자자에게 보여줄 traction 숫자 3개는 무엇인가?
4. 투자유치 시작 희망일과 마감 희망일은 언제인가?
5. 정말 잡고 싶은 리드 후보 VC/AC 5곳은 어디인가?
6. TIPS는 필수 목표인가, 있으면 좋은 보조 신호인가?

---

## 선택 설치: VC/AC 공시 근거 로컬 MCP

`startup-fundraise`는 위 설치만으로 VCS 투자자·모태출자펀드 검색과 웹 리서치를 통해 단독 작동합니다. 여기에 [`vc-fund-disclosure`](https://github.com/moonklabs/vc-fund-disclosure)를 설치하면 현재 지원되는 KVIC/KVCA 공식 공시를 로컬 SQLite DB에서 근거와 함께 조회합니다. VCS snapshot import는 canonical 구현에 추가되기 전까지 지원된 기능으로 안내하지 않습니다.

```bash
curl -fsSL https://raw.githubusercontent.com/moonklabs/vc-fund-disclosure/main/install.sh | sh
vc-funds setup --client claude --db auto
vc-funds doctor
```

Windows(PowerShell)는:

```powershell
irm https://raw.githubusercontent.com/moonklabs/vc-fund-disclosure/main/install.ps1 | iex
vc-funds setup --client claude --db auto
vc-funds doctor
```

처음 실행 시 "Windows에서 PC를 보호했습니다" 경고가 뜨면 **추가 정보 → 실행**을 누르세요. 코드사이닝 인증서 발급 전까지 미서명 실행 파일에 나타나는 정상 경고입니다.

(Homebrew tap는 준비 중입니다. 지금은 위 curl/PowerShell 방법을 사용하세요.)

Claude/Codex MCP 설정은 `setup`이 자동 등록합니다 (Codex는 `vc-funds setup --client codex`). `.mcp.json`을 직접 편집할 필요가 없습니다.

설치 직후에는 번들 시드(공공 개방 데이터, 운용사 327개)만 들어 있습니다. 투자자 리서치에 실사용하려면 데이터를 이어서 채웁니다:

```bash
vc-funds setup --with-data --consent   # KVIC 전체 분류코드 온디맨드 수집
```

DB는 사용자 로컬 머신에만 저장됩니다 (macOS/Linux `~/.local/share/moonklabs/vc-funds/`, Windows `%LOCALAPPDATA%\MoonkLabs\vc-funds\`). 상세 사용법은 [vc-fund-disclosure README](https://github.com/moonklabs/vc-fund-disclosure#readme)를 참고하세요.

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

## 4개 기본 커맨드

```
/fundraise           # 생존 목표, 라운드 목표, 이번 주 액션을 정하는 메인 루틴
/fundraise-data      # IR, 아웃리치, 파이프라인, 데이터룸 자료 구조화
/find-vc             # VC/AC/TIPS 운영사 후보 탐색 + 공식 근거 확인
/vc-meeting          # 아웃리치, 미팅 준비, 후속조치, DD 관리
```

## 고급 커맨드

```
/vc-funds-setup       # VC/AC 공시·창업자 가이드 로컬 MCP 설치 설계 및 점검
/fundraise-office-hours # 투자유치 Office Hours — 현황 질문, 의사결정, 운영 스냅샷 업데이트
/deal-sourcing        # 투자자 타겟 발굴 + Thesis 매칭
/daily-fundraise      # 일일 브리핑 — 오늘의 우선순위, 팔로업, 미팅 준비
/fundraise-pipeline   # 심층 건강진단 — 4차원 건강점수, 3x 커버리지, 병목 분석 (주 1회)
/lead-dashboard       # 빠른 스냅샷 — 단계별 현황과 오늘의 액션 조망 (매일/수시)
/investor-outreach    # VC 리서치 → 웜인트로 / 콜드 이메일 자동 생성
/dd-prep              # DD 미팅 준비 — 예상 질문 30개 + 데이터룸 체크리스트
/investor-update      # 월간 투자자 업데이트 — 지표, 하이라이트, 도움 요청
/pitch-review         # 피치 덱 100점 평가 + 슬라이드별 개선 가이드
/create-ir-asset      # IR HTML 아티팩트 — Executive Summary, 원페이저
/fundraise-forecast   # 3-시나리오 예측 + 런웨이 교차점
/business-case        # 투자자용 10섹션 비즈니스 케이스 문서
/market-opportunity   # TAM/SAM/SOM 3방법론 교차 검증
/gtm-plan             # GTM 모션, ICP, 채널, 90일 실행 계획
```

---

## 16개 도메인 스킬

대화 맥락에서 Claude가 자동 활성화하는 VC/창업 지식.

**펀드레이징** — `fundraise-office-hours` `fundraise-data` `fundraising-process` `investor-research` `deal-sourcing`
`vc-fund-disclosure-mcp` `pitch-craft` `financial-modeling` `term-sheet-knowledge` `fundraise-comms`

**사업 분석** — `startup-metrics` `market-sizing` `competitive-landscape`

**GTM & 세일즈** — `gtm-strategy` `pricing-strategy` `sales-playbook`

---

## MCP 연동

```
CRM          → HubSpot, Notion, Relate
이메일·캘린더 → Microsoft 365, Gmail, Google Calendar
데이터 보강   → OpenDART, THE VC, 혁신의숲 (웹 검색)
VC/AC 공시·가이드 → 로컬 vc-fund-disclosure-mcp (선택 설치)
문서          → Notion, Google Docs, Microsoft 365
분석          → Mixpanel, Amplitude, ChartMogul
```

구현체는 [moonklabs/vc-fund-disclosure](https://github.com/moonklabs/vc-fund-disclosure)입니다. 설치는 위 "선택 설치" 섹션을 참고하세요.

자세한 내용은 [CONNECTORS.md](CONNECTORS.md)를 참조하세요.

---

## 라이선스

Apache 2.0

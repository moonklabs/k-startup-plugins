# k-startup-plugins

**대한민국 스타트업 창업자를 위한 Claude Code/Codex 플러그인 마켓플레이스**

---

## startup-fundraise

VC/AC 투자 유치 일상을 자동화하는 Startup OS 플러그인.
웹 검색만으로 단독 작동하며, CRM·이메일·문서 도구를 연결하면 더 강력해집니다.

```bash
claude plugins marketplace add moonklabs/k-startup-plugins
claude plugins install startup-fundraise
```

Codex에서 사용할 때는 marketplace를 추가한 뒤 플러그인을 설치합니다.

```bash
codex plugin marketplace add moonklabs/k-startup-plugins --ref main
codex plugin add startup-fundraise@startup-plugins
```

로컬 개발 중인 checkout을 바로 연결하려면 GitHub 대신 로컬 경로를 사용합니다.

```bash
codex plugin marketplace add /Users/moonklabs/workspace-moonklabs/k-startup-plugins
codex plugin add startup-fundraise@startup-plugins
```

릴리스 버전을 고정해서 배포하려면 git tag를 만들고 `--ref`에 태그를 지정합니다.

```bash
git tag v0.3.6
git push origin v0.3.6

codex plugin marketplace add moonklabs/k-startup-plugins --ref v0.3.6
codex plugin add startup-fundraise@startup-plugins
```

`vc-funds` 로컬 MCP는 현재 별도 등록합니다. 플러그인 설치로 Slack, HubSpot, Notion, Microsoft 365 remote MCP는 노출되지만, 로컬 공시 DB 서버는 사용자별 DB 경로가 필요하기 때문입니다.

```bash
codex mcp add vc-funds -- node /Users/moonklabs/workspace-moonklabs/k-startup-plugins/startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs mcp serve --db ~/.local/share/vc-funds/vc-funds.sqlite
```

처음 투자유치를 준비하는 팀은 `startup-fundraise`의 단계별 운영 가이드부터 시작하세요.

1. `/fundraise`로 생존 목표, 라운드 목표, 이번 주 액션을 정합니다.
2. `/fundraise-data "./fundraise"`로 IR, 아웃리치, 파이프라인, 데이터룸 자료를 표준 구조로 정리합니다.
3. `/find-vc "뭉클랩 AI B2B SaaS Seed Pre-A Korea"`로 VC/AC/TIPS 운영사를 3단계 미팅 순서로 나눕니다.
4. `/vc-meeting "투자자명"`으로 아웃리치, 미팅 준비, 후속조치, DD를 관리합니다.

고급 사용자는 `/vc-funds-setup local-dev`와 `vc-funds import kvic|kvca`로 공식 snapshot을 로컬 DB에 저장하고, `/fundraise-pipeline`, `/daily-fundraise`로 진행 병목을 관리합니다.

자세한 사용법은 [startup-fundraise README](startup-fundraise/README.md)와 [Founder Fundraising Operating Use Cases](startup-fundraise/skills/fundraising-process/references/founder-fundraising-operating-use-cases.md)를 참고하세요.

---

## 특장점

### 병렬 에이전트
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

### 4개 기본 커맨드
```
/fundraise           # 생존 목표, 라운드 목표, 이번 주 액션을 정하는 메인 루틴
/fundraise-data      # IR, 아웃리치, 파이프라인, 데이터룸 자료 구조화
/find-vc             # VC/AC/TIPS 운영사 후보 탐색 + 공식 근거 확인
/vc-meeting          # 아웃리치, 미팅 준비, 후속조치, DD 관리
```

### 고급 커맨드
```
/vc-funds-setup       # VC/AC 공시·창업자 가이드 로컬 MCP 설치 설계 및 점검
/fundraise-office-hours # 투자유치 Office Hours — 현황 질문, 의사결정, 운영 스냅샷 업데이트
/deal-sourcing        # 투자자 타겟 발굴 + Thesis 매칭
/daily-fundraise      # 일일 브리핑 — 오늘의 우선순위, 팔로업, 미팅 준비
/fundraise-pipeline   # 파이프라인 건강점수 + 커버리지 분석
/investor-outreach    # VC 리서치 → 웜인트로 / 콜드 이메일 자동 생성
/dd-prep              # DD 미팅 준비 — 예상 질문 30개 + 데이터룸 체크리스트
/pitch-review         # 피치 덱 100점 평가 + 슬라이드별 개선 가이드
/business-case        # 투자자용 10섹션 비즈니스 케이스 문서
/market-opportunity   # TAM/SAM/SOM 3방법론 교차 검증
/fundraise-forecast   # 3-시나리오 예측 + 런웨이 교차점
...
```

### 16개 도메인 스킬
대화 맥락에서 자동 활성화되는 VC/창업 지식.
`fundraise-office-hours` `fundraise-data` `fundraising-process` `investor-research` `deal-sourcing` `vc-fund-disclosure-mcp`
`pitch-craft` `financial-modeling` `term-sheet-knowledge` 외 7개.

### MCP 연동
```
CRM          → HubSpot, Notion, Relate
이메일·캘린더 → Microsoft 365, Gmail
데이터 보강   → OpenDART, THE VC, 혁신의숲 (웹 검색)
VC/AC 공시·가이드 → 로컬 vc-fund-disclosure-mcp (Draft)
문서          → Notion, Google Docs, Microsoft 365
```

로컬 공시 MCP 구현 스펙은 `startup-fundraise/mcp/vc-fund-disclosure/`에 있습니다. source registry, SQLite schema, seed, source trust/input resolution contract, 검색/랭킹 contract, tool contract, display query, quality check pack을 함께 관리합니다.

---

## 라이선스

Apache 2.0

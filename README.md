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

설치 후 Claude Code를 재시작하고 아래 4단계로 시작하세요.

0. 막히면 언제든 `/fundraise-help` — 전체 커맨드 지도와 상황별 추천을 보여줍니다.
1. `/fundraise`로 생존 목표, 라운드 목표, 이번 주 액션을 정합니다.
2. `/fundraise-data "./fundraise"`로 IR, 아웃리치, 파이프라인, 데이터룸 자료를 표준 구조로 정리합니다.
3. `/find-vc "뭉클랩 AI B2B SaaS Seed Pre-A Korea"`로 VC/AC/TIPS 운영사를 3단계 미팅 순서로 나눕니다.
4. `/vc-meeting "투자자명"`으로 아웃리치, 미팅 준비, 후속조치, DD를 관리합니다.

자세한 사용법은 [startup-fundraise README](startup-fundraise/README.md)와 [Founder Fundraising Operating Use Cases](startup-fundraise/skills/fundraising-process/references/founder-fundraising-operating-use-cases.md)를 참고하세요.

**옵션 — VC/AC 공시 근거 로컬 MCP.** 위 설치만으로도 VCS 투자자·모태출자펀드 검색과 웹 리서치로 작동합니다. 여기에 [`vc-fund-disclosure`](https://github.com/moonklabs/vc-fund-disclosure)를 설치하면 현재 지원되는 KVIC/KVCA 공식 공시를 로컬 DB에서 근거와 함께 즉시 조회합니다.

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

Claude Code MCP 설정은 `setup`이 자동 등록합니다 (Codex는 `--client codex`). DB는 사용자 로컬 머신에만 저장됩니다.

---

### Codex 사용자 / 고급 설치

Codex에서 사용할 때는 marketplace를 추가한 뒤 플러그인을 설치합니다.

```bash
codex plugin marketplace add moonklabs/k-startup-plugins --ref main
codex plugin add startup-fundraise@startup-plugins
codex plugin add startup-apply@startup-plugins
```

**Codex 지원 범위** (Codex CLI 0.144+ 실측):

| 기능 | Codex 동작 |
|---|---|
| 스킬 (도메인 지식, 자동 트리거) | ✅ 그대로 작동 |
| MCP 서버 (Notion 등 HTTP + hwp-generator 로컬) | ✅ 그대로 작동 (`.codex-plugin` 매니페스트 경유) |
| `/커맨드` (슬래시 커맨드) | Codex에는 커맨드 개념이 없음 → **자연어로 요청하면 command-router 스킬이 같은 워크플로우를 실행** (예: "지원사업 찾아줘", "투자자 미팅 준비해줘") |
| 병렬 서브에이전트 | Codex 미지원 → 본체가 순차 수행 (결과 동일, 속도만 차이) |

로컬 개발 중인 checkout을 바로 연결하려면 GitHub 대신 로컬 경로를 사용합니다.

```bash
codex plugin marketplace add /path/to/your/local/checkout/k-startup-plugins
codex plugin add startup-fundraise@startup-plugins
```

> 아래는 이 저장소를 유지보수하는 사람을 위한 절차입니다 — 일반 사용자는 필요하지 않습니다. 릴리스 버전을 고정해서 배포하려면 git tag를 만들고 `--ref`에 태그를 지정합니다.
>
> ```bash
> git tag v0.3.7
> git push origin v0.3.7
>
> codex plugin marketplace add moonklabs/k-startup-plugins --ref v0.3.7
> codex plugin add startup-fundraise@startup-plugins
> ```

고급 사용자는 `/vc-funds-setup local-dev`와 `vc-funds import kvic|kvca`로 공식 snapshot을 로컬 DB에 저장하고, `/fundraise-pipeline`, `/daily-fundraise`로 진행 병목을 관리합니다.

---

## startup-apply

정부/민간 지원사업 사업계획서를 자동화하는 플러그인.
지식베이스를 구축하고, 공고를 소싱·적합도 분석하며, 사업계획서를 작성해 HWPX로 출력합니다.

```bash
claude plugins marketplace add moonklabs/k-startup-plugins
claude plugins install startup-apply
```

설치 후 Claude Code를 재시작하고 아래 흐름으로 시작하세요.

0. 막히면 언제든 `/apply-help` — 전체 커맨드 지도와 상황별 추천을 보여줍니다.
1. `/apply-find "AI SaaS 초기창업"`으로 지원사업 공고를 소싱합니다 — 지식베이스 없이도 바로 사용할 수 있습니다.
2. `/apply-check "공고명"`으로 자격요건 적합도를 분석합니다.
3. `/kb-init ./과거문서`로 과거 사업계획서·IR 자료에서 회사 지식베이스를 구축합니다.
4. `/apply-write "공고명"` → `/apply-export "공고명"`으로 사업계획서를 작성해 HWPX로 출력합니다.

매일 아침 `/apply-daily`로 마감 임박 공고와 작성 진행률을 확인합니다. 자세한 사용법은 [startup-apply README](startup-apply/README.md)를 참고하세요.

---

## 어디서부터 시작할까 — 페르소나별 가이드

| 상황 | 추천 경로 |
|---|---|
| **예비창업자** (법인 설립 전) | `/kb-init --interview`로 질문-답변 KB 구축 → `/apply-find "예비창업패키지"` 소싱. 업력·매출 항목은 채점에서 자동 제외됩니다. |
| **초기** (pre-seed/seed, 법인 1~3년) | 투자유치: `/fundraise` 4단계 루틴 · 지원사업: `/apply-find` → `/apply-check` 병행. TIPS는 `/find-vc`가 운영사 관점으로 함께 다룹니다. |
| **중기** (Series A/B, 3~7년) | 투자유치: `/fundraise-pipeline`, `/fundraise-forecast`, `/business-case` 중심 · 지원사업: `/apply-update`(기존 계획서 재활용), `/kb-update --from 분기보고서`(실적 반영) 중심. |

막히면 언제든 `/fundraise-help` 또는 `/apply-help`를 실행하세요 — 전체 커맨드 지도와 상황별 추천을 플러그인 안에서 바로 보여줍니다.

**두 플러그인을 같은 폴더에서 함께 쓴다면 `/kb-init`을 가장 먼저 실행하세요.** `.kb/`가 회사 사실(지표·시장·팀·실적)의 공통 저장소가 되어 IR 커맨드(`/business-case`, `/investor-update` 등)와 사업계획서 커맨드가 같은 수치를 사용합니다. 역할 분담: `.kb/` = 사실(팩트), `./fundraise/` = 활동(파이프라인·미팅·근거).

---

## startup-fundraise 특장점

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

전체 커맨드 목록(고급 커맨드 포함)은 [startup-fundraise README](startup-fundraise/README.md#고급-커맨드)를 참고하세요.

### 16개 도메인 스킬
대화 맥락에서 자동 활성화되는 VC/창업 지식.
`fundraise-office-hours` `fundraise-data` `fundraising-process` `investor-research` `deal-sourcing` `vc-fund-disclosure-mcp`
`pitch-craft` `financial-modeling` `term-sheet-knowledge` 외 7개.

### MCP 연동
```
CRM          → HubSpot, Notion, Relate
이메일·캘린더 → Microsoft 365, Gmail
데이터 보강   → OpenDART, THE VC, 혁신의숲 (웹 검색)
VC/AC 공시·가이드 → 로컬 vc-fund-disclosure-mcp (선택 설치)
문서          → Notion, Google Docs, Microsoft 365
```

구현체는 [moonklabs/vc-fund-disclosure](https://github.com/moonklabs/vc-fund-disclosure)입니다. 설치는 위 "옵션" 안내를 따르세요.

---

## 라이선스

Apache 2.0

# VC Funds MCP/CLI User Surface

상태: Draft introduction + executable P0 prototype.

이 도구의 사용자 가치는 "어디서 봐야 하는지 모르는 VC/AC 공시정보를 자연어로 물으면, 로컬 DB에서 공식 근거 중심으로 찾아 표와 caveat까지 보여주는 것"입니다.

참고한 구현 패턴은 [chrisryugj/schoolinfo-mcp](https://github.com/chrisryugj/schoolinfo-mcp)입니다. 이 프로젝트는 학교명만으로 OpenAPI 공시, NEIS 데이터, HWP/PDF 첨부 파싱을 묶어 MCP/CLI/웹앱에서 같은 질문-응답 경험을 제공합니다. VC Funds도 같은 방향으로, 사용자가 KVIC/KVCA/TIPS 경로와 내부 파라미터를 몰라도 질문할 수 있게 해야 합니다.

비즈니스 문제와 아키텍처 적합성 분석은 `schoolinfo-business-architecture-analysis.md`를 기준으로 합니다.

## 사용자가 보는 한 줄 설명

```text
VC Funds는 한국 스타트업이 투자자를 찾을 때 KVIC, KVCA, TIPS, 신규 공시 문서, 창업자 가이드를 로컬 DB에서 검색해 공식 근거와 다음 액션을 보여주는 개인용 MCP/CLI입니다.
```

## 핵심 UX

| 사용자 질문 | 내부 동작 | 결과 |
|---|---|---|
| "프라이머가 Seed 투자 가능한 펀드가 있어?" | 투자사 alias 정규화 → KVCA/KVIC 링크 조회 → TIPS/event 보강 | 공식 펀드 근거, 만기/결성일, caveat |
| "AI SaaS Seed/Pre-A에 맞는 펀드 찾아줘" | 회사 단계/섹터를 FundFinder 코드 후보로 변환 → 로컬 fund focus 검색 → 랭킹 | 투자사/펀드 순위, why ranked, 필요한 추가 import |
| "최근 90일 신규 펀드 결성 알려줘" | events + documents + snapshots 검색 | 신규/변경 이벤트 feed, 원본 문서 해시 |
| "처음 투자유치 전에 뭘 준비해야 해?" | founder guide corpus 검색 → guidance card 생성 | 체크리스트, 다음 액션, guide 출처 |

## 설치 UX

배포 후 목표:

```bash
brew install moonklabs/tap/vc-funds
vc-funds setup --client claude --db auto
vc-funds doctor
```

Homebrew가 어려우면 GitHub Releases 단일 실행 파일 또는 install script를 사용합니다. npm scoped package는 기본 경로로 쓰지 않습니다.

현재 repo 안에서 바로 실행 가능한 초안은 `runtime/`에 있습니다.

```bash
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs setup --db /tmp/vc-funds.sqlite
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs load-sql startup-fundraise/mcp/vc-fund-disclosure/runtime/fixtures/sample-data.sql --db /tmp/vc-funds.sqlite
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs search "AI SaaS Seed Pre-A TIPS 가능 투자사" --db /tmp/vc-funds.sqlite --json
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs mcp serve --db /tmp/vc-funds.sqlite
```

P0 구현 범위는 `setup`, `doctor`, `sources`, `health`, `resolve`, `search`, `import kvic`, `import kvca`, `mcp serve`, fixture SQL load입니다. Deep query, event feed, standalone gap analysis, report, document/guide import, watch, export는 다음 단계의 계약입니다.

## MCP 설정

```json
{
  "mcpServers": {
    "vc-fund-disclosure": {
      "type": "stdio",
      "command": "vc-funds",
      "args": [
        "mcp",
        "serve",
        "--db",
        "~/.local/share/moonklabs/vc-funds/vc-funds.sqlite"
      ]
    }
  }
}
```

중요: repo-local 초안은 실행 가능하지만 아직 배포된 `vc-funds` 바이너리가 아니므로 `.mcp.json`에는 등록하지 않습니다. 로컬 테스트는 위의 `node .../bin/vc-funds.mjs mcp serve` 경로를 사용합니다.

## CLI 명령 설계

### 1. P0 검색과 조회

```bash
vc-funds resolve "프라이머가 Seed 투자 가능한 펀드가 있어?"
vc-funds sources
vc-funds search "AI SaaS Seed Pre-A TIPS 가능 투자사"
```

P0 `search` 응답은 별도 gap 명령 없이 `data_gaps`와 `recommended_imports`를 함께 반환합니다. 투자사 deep dive, fund query, event feed, 별도 data gap 분석은 planned 표면입니다.

### 2. P0 import와 수집 상태

```bash
vc-funds import kvic --file ./snapshots/fundfinder-AA02.html --group AA --code AA02
vc-funds import kvca --file ./snapshots/kvca-primer.html --vc-name "프라이머"
vc-funds health
vc-funds doctor
vc-funds mcp serve
```

P1 CLI import는 KVIC/KVCA HTML 또는 CSV snapshot만 정규화한다. XLS/XLSX 파일은 감지 후 `unsupported_format`으로 반환하므로 공식 화면에서 HTML로 저장하거나 CSV로 내보낸 뒤 import한다.

### 3. 미팅 준비 리포트

```bash
vc-funds report investor "프라이머" --for "MoonkLabs Seed/Pre-A" --format markdown
vc-funds report shortlist --stage seed --sector "B2B SaaS,AI" --limit 20
vc-funds export evidence-pack "프라이머" --redact-personal-contacts
```

## CLI 결과 예시

```markdown
# Search Results: AI SaaS Seed Pre-A TIPS 가능 투자사

| Rank | 투자사 | 펀드/근거 | 상태 | 점수 | 왜 상위인가 | 다음 액션 |
|---:|---|---|---|---:|---|---|
| 1 | 예시벤처스 | 예시 초기기업 펀드 | 공식 근거 확인 | 86 | AA02 snapshot + KVCA 조합 링크 + 최근 결성 | 미팅 전 evidence pack 생성 |
| 2 | 예시파트너스 | TIPS 운영사 snapshot | 공식 근거 있음, 검토 필요 | 72 | TIPS 신호는 있으나 KVCA 상세 snapshot 필요 | KVCA VC명 snapshot import |

## Caveats
- 현재 결과는 로컬 DB에 import된 snapshot 기준입니다.
- KVCA DIVA는 벤처투자조합 중심이라 개인투자조합, 신기사, PEF는 누락될 수 있습니다.
- parser warning이 있는 항목은 원본 문서 확인이 필요합니다.
```

## MCP 도구 소개

| 도구 | 상태 | 사용자가 느끼는 기능 |
|---|---|---|
| `search_vc_database` | P0 구현 | 자연어 질문을 받아 투자사/펀드/이벤트/가이드 통합 검색 |
| `resolve_user_input` | P0 구현 | 사용자 입력을 투자사/펀드/조건 후보로 정확히 해석 |
| `get_source_authority` | P0 구현 | 질문 유형별 authoritative/supporting/context source 확인 |
| `get_collection_health` | P0 구현 | source별 수집 상태와 품질 플래그 확인 |
| `query_investor_profile` | 계약 예정 | 특정 투자사의 펀드 근거와 TIPS 신호 조회 |
| `search_funds_for_startup` | 계약 예정 | 회사 단계/섹터/지역 기준 적합 펀드 검색 |
| `list_new_fund_events` | 계약 예정 | 신규 결성/변경/만기 이벤트 조회 |
| `search_disclosure_evidence` | 계약 예정 | 원본 snapshot/document chunk 검색 |
| `answer_founder_question` | 계약 예정 | 창업자 가이드 기반 답변과 체크리스트 |
| `list_data_gaps` | 계약 예정 | 답변에 부족한 source와 필요한 import 액션 표시 |

## MCP 프롬프트 예시

```text
뭉클랩은 AI 기반 B2B SaaS고 Seed~Pre-A를 준비 중이야. 공식 펀드 근거가 있는 VC/AC 후보를 찾아줘. 왜 상위인지와 부족한 데이터도 같이 보여줘.
```

```text
프라이머 미팅 전에 볼 evidence pack을 만들어줘. KVIC/KVCA/TIPS 근거, 신규 이벤트, caveat, 추가 확인 질문을 분리해줘.
```

```text
최근 90일 신규 펀드 결성 이벤트 중 초기기업, AI, SaaS와 관련 있어 보이는 것만 보여줘.
```

## 정확도 원칙

- 결과마다 `evidence_status`를 표시합니다.
- 검색 전에 `resolution_status`와 후보를 기록합니다.
- `source_trust_tier`와 `authority_scope`가 질문 유형에 맞아야 공식 근거로 인정합니다.
- `verified_official`이 아니면 확정 표현을 쓰지 않습니다.
- 이름 유사도만으로 투자 가능성을 추정하지 않습니다.
- FundFinder 단독 결과와 KVCA 조합현황 결과를 구분합니다.
- TIPS는 "창업자가 투자사를 임의 지정한다"가 아니라 "투자사가 TIPS 연계 투자 후보로 볼 수 있는지"의 신호로 다룹니다.
- 검색 결과가 부족하면 `no_evidence`가 정상 결과입니다. 이때 필요한 import 액션을 먼저 안내합니다.

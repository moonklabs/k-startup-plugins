# 커넥터

## 도구 참조 방식

플러그인 파일은 `~~category`를 해당 카테고리에서 사용자가 연결한 도구의 플레이스홀더로 사용합니다. 예를 들어 `~~CRM`은 Relate, HubSpot, Notion 또는 MCP 서버가 있는 다른 CRM을 의미할 수 있습니다.

플러그인은 **도구에 구애받지 않습니다** — 특정 제품이 아닌 카테고리(CRM, 이메일, 채팅 등)로 워크플로우를 설명합니다. `.mcp.json`에 특정 MCP 서버가 사전 구성되어 있지만, 해당 카테고리의 어떤 MCP 서버든 사용할 수 있습니다.

## 이 플러그인의 커넥터

| 카테고리 | 플레이스홀더 | 포함 서버 | 기타 옵션 |
|----------|-------------|-----------|-----------|
| CRM / 투자자 관리 | `~~CRM` | HubSpot, Notion | Relate (한국 IR 특화, MCP 미지원 — 수동 운영), Affinity, Attio, Airtable |
| 이메일 | `~~email` | Microsoft 365 | Gmail |
| 캘린더 | `~~calendar` | Microsoft 365 | Google Calendar |
| 채팅 | `~~chat` | Slack | Microsoft Teams |
| 지식 베이스 | `~~knowledge base` | Notion | Google Drive, Confluence |
| 데이터 보강 | `~~data enrichment` | — | THE VC, 혁신의숲, 넥스트유니콘 (MCP 미지원 — 웹 검색 기반), OpenDART (MCP 지원 — 상장사 한정) |
| VC/AC 공시·가이드 데이터 | `~~fund disclosure` | — | 선택 설치: `vc-fund-disclosure-mcp` 로컬 DB, KVIC/KVCA snapshot import, TIPS 운영사/펀드 근거, `kordoc` 기반 창업자 문서 가이드 |
| 스프레드시트 | `~~spreadsheet` | Microsoft 365 | Google Sheets |
| 문서 | `~~docs` | Microsoft 365, Notion | Google Docs, Google Slides |
| 분석/BI | `~~analytics` | — | Mixpanel, Amplitude, ChartMogul |

## VC/AC 공시·가이드 데이터 MCP (Draft)

AC/VC 투자사 조회와 초기 창업자용 투자유치 자료 검색은 별도 데이터조회 MCP로 분리하는 것이 좋습니다. `deal-sourcing` 스킬은 투자 전략과 리포트 생성을 담당하고, `~~fund disclosure` MCP는 공식 근거 데이터와 창업자 가이드 자료를 저장/조회하는 역할을 맡습니다.

초기 방향:

| 구성 | 역할 |
|---|---|
| `vc-fund-disclosure-core` | KVIC/KVCA/TIPS 관련 HTML/CSV snapshot 정규화, `kordoc` 기반 PDF/HWP/HWPX/HWPML/Office import, 창업자 guide chunking |
| `vc-funds` CLI | 로컬 DB 초기화, setup, doctor, 파일 import, guide library, watch folder, diff, evidence export |
| `vc-fund-disclosure-mcp` | 투자사 프로필, 보유 펀드, 신규 공시 이벤트, 창업자 가이드 검색, 근거 pack 조회 |

현재 레포의 구현 스펙:

| 파일 | 역할 |
|---|---|
| `startup-fundraise/mcp/vc-fund-disclosure/README.md` | spec pack 개요와 구현 순서 |
| `startup-fundraise/mcp/vc-fund-disclosure/source-registry.yaml` | 수집 source, 정책 상태, 필수 필드, 품질 체크 목록 |
| `startup-fundraise/mcp/vc-fund-disclosure/schema.sql` | canonical SQLite schema와 조회 view |
| `startup-fundraise/mcp/vc-fund-disclosure/seed-sources.sql` | fresh DB에 source registry를 주입하는 seed |
| `startup-fundraise/mcp/vc-fund-disclosure/tool-contract.yaml` | MCP tool surface와 표시 계약 |
| `startup-fundraise/mcp/vc-fund-disclosure/data-trust-resolution-contract.yaml` | 신뢰 source tier, authoritative scope, 사용자 입력 해석, answer gate 계약 |
| `startup-fundraise/mcp/vc-fund-disclosure/search-contract.yaml` | 자연어 검색, 랭킹, evidence status, empty state 계약 |
| `startup-fundraise/mcp/vc-fund-disclosure/server-cli-usage.md` | 스타트업 사용자를 위한 MCP/CLI 소개와 명령 예시 |
| `startup-fundraise/mcp/vc-fund-disclosure/schoolinfo-business-architecture-analysis.md` | schoolinfo-mcp README의 비즈니스 문제와 아키텍처 해법 분석 |
| `startup-fundraise/mcp/vc-fund-disclosure/implementation-blueprint.md` | schoolinfo-mcp 패턴을 적용한 모듈/transport/CLI/MCP 구현 설계 |
| `startup-fundraise/mcp/vc-fund-disclosure/display-queries.sql` | 사용자에게 보여줄 주요 리포트 쿼리 |
| `startup-fundraise/mcp/vc-fund-disclosure/quality-checks.sql` | import 후 품질/누락/PII 후보 점검 쿼리 |

기본 수집 모드는 사용자가 직접 확보한 자료를 로컬에서 자동 처리하는 방식입니다.

- 허용: 저장 HTML/CSV snapshot import, `kordoc` 기반 PDF/HWP/HWPX/HWPML/Office import, 로컬 watch folder, 사용자 제스처 기반 browser snapshot import, 창업자 가이드 문서 import
- 보류: 공식 허가 없는 scheduled crawler, 전체 VC/카테고리 순회, robots 정책 우회
- 허용 후 확장: 공식 API, 유료 데이터 계약, 기관 허가 기반 rate-limited fetcher

`.mcp.json`에는 아직 이 서버를 추가하지 않습니다. 실제 실행 가능한 MCP 패키지가 준비된 뒤에만 사전 구성에 넣어야 플러그인 설치가 깨지지 않습니다.

### 검색 중심 사용자 경험

이 MCP는 사용자가 KVIC/KVCA/TIPS 화면 경로나 FundFinder 파라미터를 몰라도 자연어로 물을 수 있어야 합니다.

예상 질문:

```text
뭉클랩 같은 AI B2B SaaS Seed/Pre-A에 맞는 VC/AC를 공식 펀드 근거 기준으로 찾아줘.
```

내부 동작:

1. `resolve_user_input`으로 질문 의도, 투자사/펀드 후보, 단계/섹터/지역 조건을 해석합니다.
2. `get_source_authority`로 이 질문에 authoritative한 source를 결정합니다.
3. 회사 단계/섹터를 FundFinder 코드 후보와 local fund focus로 변환합니다.
4. KVIC/KVCA/TIPS/documents/user notes를 분리 검색합니다.
5. 결과마다 `resolution_status`, `evidence_status`, `source_trust_tier`, `authority_scope`, `why_ranked`, `hash`, `parser_warnings`, `data_gaps`를 붙입니다.
6. 근거가 없거나 입력이 모호하면 빈 결과를 숨기지 않고 후보/필요 import를 안내합니다.

검색 UX와 CLI 예시는 `startup-fundraise/mcp/vc-fund-disclosure/server-cli-usage.md`를 기준으로 합니다.

### 권장 설치 UX

도구가 배포되면 사용자는 npm registry 없이 로컬 MCP를 준비할 수 있어야 합니다. 기본은 Homebrew와 GitHub Releases입니다.

```bash
brew install moonklabs/tap/vc-funds
vc-funds setup --client claude --db auto
vc-funds doctor
```

`setup`은 로컬 SQLite DB, 기본 Inbox 폴더, Guides 폴더, watch folder, MCP 설정 백업/등록까지 처리합니다. 자세한 설치/점검 루틴은 `/vc-funds-setup` 커맨드를 사용합니다.

생성될 MCP 설정 예시:

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

### 창업자 가이드 라이브러리

초기 투자유치 기업은 투자자 리스트보다 먼저 용어, 절차, 준비물, 데이터룸, 투자계약 기본기를 이해해야 합니다. 따라서 `Guides` 폴더에 공개/보유 PDF/HWP/HWPX/HWPML/Office 문서를 저장하고, MCP가 `kordoc`으로 Markdown/표를 추출해 요약/검색 자료로 쓰게 합니다.

예상 사용:

```bash
vc-funds import guide --file "./guides/seed-fundraising-guide.pdf" --role founder_education
vc-funds ask "처음 투자유치할 때 무엇부터 준비해야 해?"
```

문서 파싱 adapter 기준:

```bash
npx -y kordoc setup
npx -y kordoc "./guides/seed-fundraising-guide.pdf"
```

MCP 연결 환경에서는 `kordoc`의 `parse_document`, `parse_table`류 도구를 사용합니다. `vc-funds` 자체에 PDF/HWP/HWPX 직접 파서를 새로 만들지 않습니다.

사용자가 제공한 KVIC PDF 후보:

```bash
vc-funds guide-source add \
  --publisher KVIC \
  --url "https://www.kvic.or.kr/upload/investment/20210114/20210114155945_63291.pdf" \
  --role founder_education \
  --access-status remote_gone_410
```

2026-07-04 확인 기준 이 URL은 `HTTP 410 Gone`으로 응답하므로 자동 다운로드 기본값에는 넣지 않습니다. 사용자가 PDF 파일을 로컬에 보유한 경우 `vc-funds import guide --file ... --source-url ...`로 import합니다.

출력 원칙:

- 공시 evidence와 창업자 guide를 분리합니다.
- 원문 전체를 재출력하지 않고 요약, 체크리스트, 다음 액션으로 제공합니다.
- 출처 URL, 파일 해시, import 시각, license note를 함께 보관합니다.
- 투자계약/세무/법률 내용은 일반 설명으로만 제공하고 전문가 검토 필요 문구를 붙입니다.

## 한국 데이터 보강 도구 안내

한국 VC/스타트업 데이터를 제공하는 주요 서비스는 현재 공식 MCP 서버를 제공하지 않습니다. 활용 방식은 다음과 같습니다:

| 도구 | 특화 데이터 | 활용 방식 |
|------|------------|-----------|
| **THE VC** (thevc.kr) | 한국 투자 라운드, VC 포트폴리오, 투자 이력 | 웹 검색 기반 접근 |
| **혁신의숲** (innoforest.co.kr) | 스타트업 트래픽·매출·고용 성장 지표 | 웹 검색 기반 접근 |
| **넥스트유니콘** (nextunicorn.kr) | 스타트업-투자자 매칭, 투자자 DB | 웹 검색 기반 접근 |
| **OpenDART** (opendart.fss.or.kr) | 상장사 공시, 재무제표, 지분구조 | MCP 서버 가능 (오픈소스) |

### OpenDART MCP 설정 (선택사항)

상장사 공시 데이터가 필요한 경우 커뮤니티 MCP 서버를 설치할 수 있습니다:

```bash
# Smithery를 통한 설치 (예시)
# https://github.com/snaiws/DART-mcp-server 참고
```

OpenDART API 키는 [opendart.fss.or.kr](https://opendart.fss.or.kr)에서 무료로 발급받을 수 있습니다.

## CRM 선택 가이드

| 상황 | 추천 도구 |
|------|----------|
| 한국어 IR 파이프라인 특화, 수동 운영 | **Relate** (MCP 미지원) |
| MCP 자동화 연동 필요 | **HubSpot** 또는 **Notion** |
| 지식베이스 겸용 | **Notion** |

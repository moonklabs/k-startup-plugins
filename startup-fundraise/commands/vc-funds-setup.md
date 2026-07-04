---
description: VC/AC 공시·창업자 가이드 데이터 로컬 MCP 설치 설계 및 점검 — 개인 로컬 DB, watch folder, MCP 설정
argument-hint: "<client: claude|codex, 또는 local-dev>"
---

# /vc-funds-setup

> 익숙하지 않은 플레이스홀더가 보이거나 연결된 도구를 확인하려면 [CONNECTORS.md](../CONNECTORS.md)를 참조하세요.

VC/AC 투자사 공시정보와 초기 창업자용 투자유치 PDF/HWP/HWPX/HWPML/Office 가이드를 개인 로컬 DB에 축적하고, `~~fund disclosure` MCP로 조회하기 위한 설치/점검 루틴입니다. 문서 파싱은 `kordoc` CLI/MCP adapter를 우선 사용합니다.

이 커맨드는 `vc-funds` 로컬 도구가 준비되어 있을 때 설치를 안내하고, repo-local 초안에서는 `startup-fundraise/mcp/vc-fund-disclosure/runtime/`의 Node 실행 파일을 기준으로 점검합니다.

스타트업이 투자유치 운영 루틴 안에서 이 CLI/MCP를 언제 쓰는지는 [Founder Fundraising Operating Use Cases](../skills/fundraising-process/references/founder-fundraising-operating-use-cases.md)를 참고합니다.

## 권장 구조

사용자에게는 하나의 로컬 도구처럼 보이게 하고, 내부만 세 모듈로 나눕니다.

| 구성 | 역할 |
|---|---|
| `vc-fund-disclosure-core` | P1은 KVIC/KVCA HTML, CSV snapshot import와 정규화에 집중한다. PDF/HWP/HWPX/HWPML/DOCX/XLS/XLSX guide/document import는 후속 `kordoc` adapter 단계로 둔다. |
| `vc-funds` CLI | setup, DB 초기화, 검색, evidence 리포트, import, watch folder, diff, doctor |
| `vc-fund-disclosure-mcp` | Codex/Claude가 호출하는 stdio MCP server. 자연어 검색, 펀드 근거, 창업자 가이드, data gap 제공 |

구현은 `schoolinfo-mcp`처럼 core와 transport를 분리합니다.

```text
core/search/import/report/db
  ├─ vc-funds CLI
  ├─ local stdio MCP: 파일 import 도구 ON
  └─ future HTTP MCP: 파일 경로 도구 OFF, 조회 중심
```

상세 모듈 설계는 `startup-fundraise/mcp/vc-fund-disclosure/implementation-blueprint.md`를 따릅니다.

## 사용법

```bash
/vc-funds-setup
/vc-funds-setup claude
/vc-funds-setup codex
/vc-funds-setup local-dev
```

## 최종 설치 UX

패키지가 배포된 뒤의 목표 UX:

```bash
brew install moonklabs/tap/vc-funds
vc-funds setup --db auto
vc-funds doctor
```

npm scoped package는 기본 설치 경로로 쓰지 않습니다. `@moonklabs/*` npm 배포는 비용/권한/registry 의존 문제가 생길 수 있으므로, 기본 배포는 Homebrew tap과 GitHub Releases 단일 실행 파일로 둡니다.

현재 repo-local 초안 실행:

```bash
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs setup --db /tmp/vc-funds.sqlite
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs load-sql startup-fundraise/mcp/vc-fund-disclosure/runtime/fixtures/sample-data.sql --db /tmp/vc-funds.sqlite
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs doctor --db /tmp/vc-funds.sqlite --json
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs search "AI SaaS Seed Pre-A TIPS 가능 투자사" --db /tmp/vc-funds.sqlite --json
node --test startup-fundraise/mcp/vc-fund-disclosure/runtime/test/*.test.mjs
```

Homebrew를 쓰지 않는 경우:

```bash
curl -fsSL https://raw.githubusercontent.com/moonklabs/vc-fund-disclosure/main/install.sh | sh
vc-funds setup --db auto
vc-funds doctor
```

`setup`은 다음을 자동 처리해야 합니다.

1. 로컬 SQLite DB 생성
2. 기본 보관함 생성
3. 창업자 guide library 생성
4. watch folder 연결
5. Claude/Codex MCP 설정 추가
6. 설정 백업 생성
7. `doctor` 실행

기본 경로:

| 항목 | macOS/Linux | Windows |
|---|---|---|
| DB | `~/.local/share/moonklabs/vc-funds/vc-funds.sqlite` | `%LOCALAPPDATA%\MoonkLabs\vc-funds\vc-funds.sqlite` |
| Inbox | `~/Documents/MoonkLabs/VC Disclosures/Inbox` | `%USERPROFILE%\Documents\MoonkLabs\VC Disclosures\Inbox` |
| Archive | `~/Documents/MoonkLabs/VC Disclosures/Archive` | `%USERPROFILE%\Documents\MoonkLabs\VC Disclosures\Archive` |
| Guides | `~/Documents/MoonkLabs/VC Disclosures/Guides` | `%USERPROFILE%\Documents\MoonkLabs\VC Disclosures\Guides` |

## MCP 설정 예시

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

## 수집 경계

기본 ON:

- `manual_snapshot_import`: 사용자가 저장한 HTML/CSV import. XLS/XLSX는 감지 후 `unsupported_format`으로 반환하고 CSV/HTML 재저장을 안내한다.
- `watch_folder_import`: Inbox에 저장된 PDF/HWP/HWPX/HWPML/DOCX/XLSX/HTML 자동 import. 문서 파싱은 `kordoc` adapter가 담당한다.
- `browser_capture_import`: 사용자가 보고 있는 페이지 snapshot import
- `guide_library_import`: Guides에 저장한 투자유치/TIPS/IR/데이터룸/투자계약 안내 PDF/HWP/HWPX/HWPML/DOCX/XLSX import. 문서 파싱은 `kordoc` adapter가 담당한다.

기본 OFF:

- `official_feed_fetch`: 공식 허가, 제휴, 유료 계약 후에만 활성화
- `site_background_crawler`: 초기 금지

## Doctor 체크

```markdown
# VC Funds Local MCP Doctor

| 항목 | 상태 | 설명 |
|---|---|---|
| CLI 실행 | OK/WARN/BLOCKED | `vc-funds --version` |
| DB 접근 | OK/WARN/BLOCKED | SQLite 생성/쓰기 가능 여부 |
| Schema health | OK/WARN/BLOCKED | 전체 table/column/view query 검증 여부 |
| Import roots | OK/WARN/BLOCKED | MCP import root 제한과 CLI explicit path 예외 분리 여부 |
| MCP 설정 | OK/WARN/BLOCKED | Claude/Codex 설정 등록 여부 |
| MCP 실행 | OK/WARN/BLOCKED | stdio server handshake 가능 여부 |
| 정책 | OK/WARN/BLOCKED | 무허가 crawler 비활성화 여부 |
```

## 초기 사용 예

```bash
vc-funds setup
vc-funds doctor
vc-funds resolve "프라이머가 Seed 투자 가능한 펀드가 있어?"
vc-funds sources
vc-funds search "AI SaaS Seed Pre-A TIPS 가능 투자사"
vc-funds import kvic --file "./snapshots/fundfinder-AA02.html" --source-url "http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd" --captured-at "2026-07-04T00:00:00.000Z"
vc-funds import kvca --file "./snapshots/kvca-primer.html"
vc-funds health
vc-funds mcp serve
```

향후 예정 표면은 투자사 deep dive, 신규 펀드 event feed, document/guide import, evidence-pack export, founder Q&A, 별도 data gap 분석 명령으로 분리합니다. 현재 P0에서는 `vc-funds search` 응답의 `data_gaps`와 `recommended_imports` 필드를 사용합니다.

검색 결과는 단순 후보 목록이 아니라 다음 필드를 포함해야 합니다.

| 필드 | 의미 |
|---|---|
| `evidence_status` | `verified_official`, `official_needs_review`, `guide_only`, `user_note_only`, `no_evidence` |
| `resolution_status` | `resolved_exact`, `resolved_alias`, `ambiguous`, `no_match` |
| `source_trust_tier` / `authority_scope` | 이 질문에 대해 source가 공식 근거인지, 보조 근거인지 |
| `why_ranked` | 왜 상위 결과인지: entity 후보, lexical hit, condition hit, source trust |
| `source_url/hash` | 원본 snapshot/document 근거 |
| `data_gaps` | 지금 답변에 부족한 source와 필요한 import 액션 |

## Seed Guide 후보 등록

사용자가 제공한 KVIC PDF 링크처럼 원격 링크가 사라졌거나 접근이 막힌 자료는 URL 후보와 실제 파일 import를 분리합니다.

현재 P0 런타임에는 `guide-source add`와 `import guide` 명령이 없습니다. 해당 흐름은 planned guide/document adapter로 유지하고, 현재는 로컬 파일을 보유했는지와 원본 `source_url`만 설계 메모에 기록합니다.

planned adapter는 `kordoc` CLI/MCP를 기본 문서 파서로 사용합니다.

```bash
npx -y kordoc setup
npx -y kordoc "./guides/kvic-founder-guide.pdf"
```

MCP 연결 환경에서는 `kordoc`의 `parse_document`와 `parse_table`류 도구로 Markdown/표를 추출하고, `vc-funds` DB에는 원본 파일 해시, source URL, parser status, warning, chunk만 저장합니다. `vc-funds` 자체에 PDF/HWP/HWPX 직접 파서를 새로 만들지 않습니다.

이 링크는 2026-07-04 확인 기준 `HTTP 410 Gone`으로 응답했으므로, 기본 설치 중 자동 다운로드 대상으로 넣지 않습니다. 사용자가 로컬 PDF를 보유한 경우에만 import합니다.

## 출력 원칙

- 설치 명령은 하나로 제시합니다.
- 실제 MCP 패키지가 없으면 `.mcp.json`에 등록하지 말고 `NOT_READY`로 표시합니다.
- 로컬 DB와 보관함은 개인 장비 안에 둡니다.
- `kordoc`으로 변환한 PDF/HWP/HWPX/HWPML/Office 가이드는 요약과 체크리스트로 활용하고, 원문 전체를 길게 재출력하지 않습니다.
- 공시 evidence, 공식 guide, 사용자 note를 답변에서 분리합니다.
- 외부 사이트 자동 순회는 기본값으로 제안하지 않습니다.

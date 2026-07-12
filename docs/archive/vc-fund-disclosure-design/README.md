# VC Fund Disclosure MCP Spec Pack

상태: **구현체 이관 완료** — canonical 구현은 [moonklabs/vc-fund-disclosure](https://github.com/moonklabs/vc-fund-disclosure) (Bun 단일 바이너리, GitHub Releases 배포).

- 계약 YAML(tool/search/data-trust/source-registry)의 canonical 사본은 구현 리포의 `docs/contracts/`에 있습니다. 계약 변경은 구현 리포에서 먼저 이루어집니다.
- 이 디렉토리의 `runtime/` Node 초안은 **deprecated(참고용 아카이브)** 입니다. 한국어 정규화 사전, 스키마 evidence 설계, 테스트 시나리오는 v0.2.0에서 구현 리포로 이식되었습니다.
- retrieval 계층(resolve/rank/evidence gate)은 구현 리포 v0.3.0 로드맵입니다.

이하는 이관 전 원본 스펙입니다.

이 디렉터리는 한국 VC/AC 공시 evidence와 창업자 guide 자료를 로컬 SQLite DB에 축적하고, MCP가 안전하게 조회/표시하기 위한 구현 계약입니다.

## 파일 역할

| 파일 | 역할 |
|---|---|
| `source-registry.yaml` | 수집 source, 정책 상태, 필수 필드, 품질 체크 목록 |
| `schema.sql` | canonical SQLite schema, index, view |
| `seed-sources.sql` | fresh DB source seed |
| `tool-contract.yaml` | MCP tool surface와 사용자 표시 계약 |
| `data-trust-resolution-contract.yaml` | 신뢰 source tier, authoritative scope, 사용자 입력 resolution, answer gate 계약 |
| `search-contract.yaml` | 자연어 질문 라우팅, 랭킹, evidence status, empty state 계약 |
| `server-cli-usage.md` | 스타트업 사용자를 위한 MCP/CLI 소개와 명령 예시 |
| `schoolinfo-business-architecture-analysis.md` | schoolinfo-mcp README의 비즈니스 문제와 아키텍처 해법 분석 |
| `implementation-blueprint.md` | schoolinfo-mcp 패턴을 적용한 실제 모듈/transport/CLI/MCP 구현 설계 |
| `display-queries.sql` | investor profile, 신규 이벤트, fund search, guide search 표시 쿼리 |
| `quality-checks.sql` | import 후 품질/누락/PII 후보 점검 쿼리 |
| `runtime/` | 새 의존성 없는 Node + SQLite CLI/MCP 초안 구현과 smoke test |

## 현재 실행 가능한 초안

`runtime/`은 P0 초안입니다. 아직 KVIC/KVCA 자동 수집기나 `kordoc` 기반 PDF/HWP/HWPX parser adapter가 아니라, 로컬 SQLite DB의 신뢰 source, entity resolution, 검색, collection health, stdio MCP handshake를 검증하는 최소 실행 레이어입니다.

```bash
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs setup --db /tmp/vc-funds.sqlite
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs load-sql startup-fundraise/mcp/vc-fund-disclosure/runtime/fixtures/sample-data.sql --db /tmp/vc-funds.sqlite
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs resolve "프라이머가 Seed 투자 가능한 펀드가 있어?" --db /tmp/vc-funds.sqlite --json
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs search "AI SaaS Seed Pre-A TIPS 가능 투자사" --db /tmp/vc-funds.sqlite --json
node --test startup-fundraise/mcp/vc-fund-disclosure/runtime/test/*.test.mjs
```

현재 MCP 도구:

- `resolve_user_input`
- `get_source_authority`
- `search_vc_database`
- `get_collection_health`
- `import_kvic_snapshot`
- `import_kvca_snapshot`

## CLI 사용 흐름

1. DB와 source registry를 초기화합니다.

```bash
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs setup --db /tmp/vc-funds.sqlite --json
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs doctor --db /tmp/vc-funds.sqlite --json
```

2. 사용자가 직접 확보한 KVIC/KVCA HTML 또는 CSV snapshot을 import합니다.

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

3. 자연어로 검색합니다.

```bash
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs search "뭉클랩 AI SaaS Seed Pre-A 투자사" --db /tmp/vc-funds.sqlite --json
```

검색 결과에서 특히 봐야 할 필드:

| 필드 | 의미 |
|---|---|
| `evidence_status` | `verified_official`이면 공식 snapshot/document 근거가 연결됨 |
| `resolution_status` | 사용자 입력이 투자사/펀드 후보로 얼마나 정확히 해석됐는지 |
| `why_ranked` | lexical match, stage/sector match, source trust 등 랭킹 이유 |
| `source_url` / `content_sha256_or_file_sha256` | 원본 snapshot/document 재현 근거 |
| `data_gaps` | 지금 답변에 부족한 source |
| `recommended_imports` | 다음에 import해야 할 자료 |

4. MCP stdio server로 연결합니다.

```bash
node startup-fundraise/mcp/vc-fund-disclosure/runtime/bin/vc-funds.mjs mcp serve --db /tmp/vc-funds.sqlite
```

현재 P0는 HTML/CSV snapshot import가 중심입니다. PDF/HWP/HWPX/HWPML/Office 문서 import는 planned surface이며, 구현 시 [kordoc](https://github.com/chrisryugj/kordoc) CLI/MCP adapter를 사용합니다.

## 구현 순서

1. `schema.sql`로 SQLite DB를 만든다.
2. `seed-sources.sql`로 source registry를 DB에 주입한다.
3. P1 import adapter는 원본 HTML/CSV를 `raw_artifacts`에 먼저 저장한다. 표 snapshot으로 들어온 XLS/XLSX는 감지만 하고 `unsupported_format`으로 반환하며, PDF/HWP/HWPX/HWPML/Office 문서 import는 별도 `kordoc` CLI/MCP adapter 단계로 둔다.
4. 정규화 row는 `source_snapshots`, `documents`, `evidence_edges` 중 하나 이상의 근거에 연결한다.
5. import 후 `quality-checks.sql`을 실행해 문제를 `data_quality_flags`와 응답 caveat로 올린다.
6. MCP 조회는 `data-trust-resolution-contract.yaml`, `search-contract.yaml`, `tool-contract.yaml`, `display-queries.sql`의 검색/표시 계약을 따른다.
7. 실제 서버/CLI 구현은 `implementation-blueprint.md`의 모듈 경계와 transport 분리를 따른다.
8. 실제 README와 제품 메시지는 `schoolinfo-business-architecture-analysis.md`의 문제 해결 구조를 따른다.

## 수집 원칙

- 기본 ON: manual snapshot import, local watch folder import, user gesture browser capture, founder guide local import.
- 기본 OFF: scheduled site crawler, login scraping, hidden API scraping, full-site pagination.
- 허가 후 ON: official API, paid data agreement, institution-approved rate-limited fetcher.
- 공식 공시 evidence, 창업자 guide, 사용자 note는 저장과 응답에서 분리한다.
- 개인 연락처와 private note 원문은 기본 응답에 노출하지 않는다.

## 검색 결과 원칙

- 검색 전에 `resolve_user_input` 단계로 사용자 입력을 intent, entity 후보, 라운드/섹터/지역 조건으로 해석한다.
- source별 `trust_tier`와 `authoritative_scope`가 질문 intent에 맞아야 `verified_official`을 줄 수 있다.
- 모든 결과는 `verified_official`, `official_needs_review`, `guide_only`, `user_note_only`, `no_evidence` 중 하나의 evidence status를 가진다.
- 검색 결과에는 `why_ranked`, `source_url`, `content_sha256_or_file_sha256`, `captured_or_imported_at`, `parser_warnings`, `caveats`를 가능한 한 포함한다.
- 입력이 모호하면 임의로 하나를 고르지 않고 resolution candidate와 필요한 추가 조건을 보여준다.
- 결과가 없거나 근거가 약한 경우에도 사용자가 다음에 import해야 할 snapshot/document를 보여준다.
- CLI와 MCP는 같은 core 검색/랭킹 로직을 공유한다.

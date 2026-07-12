# VC Funds MCP/CLI Implementation Blueprint

상태: Draft implementation design + P0 executable prototype.

이 설계는 [chrisryugj/schoolinfo-mcp](https://github.com/chrisryugj/schoolinfo-mcp)의 구조를 VC/AC 공시 evidence 조회 제품에 맞게 변환한 것입니다. 목표는 스타트업 사용자가 KVIC/KVCA/TIPS 경로와 파라미터를 몰라도 자연어로 묻고, CLI와 MCP가 같은 core 검색/파싱/랭킹 로직으로 공식 근거와 data gap을 반환하는 것입니다.

README의 비즈니스 문제와 아키텍처 적합성 분석은 `schoolinfo-business-architecture-analysis.md`를 우선합니다. 이 문서는 그 분석을 실제 구현 모듈과 MVP 순서로 내린 설계입니다.

## Schoolinfo-MCP에서 차용할 구조

| 패턴 | schoolinfo-mcp | VC Funds 적용 |
|---|---|---|
| 하나의 core | OpenAPI, NEIS, HWP/PDF 파싱을 공용 client/evaluation 모듈로 처리 | source registry, import parser, normalizer, SQLite repository, retrieval/ranker를 core에 둠 |
| transport 분리 | `buildMcpServer()`가 stdio와 Streamable HTTP에서 재사용됨 | `buildMcpServer({ localFiles })`로 stdio/local, future HTTP/remote를 같은 tool 정의로 구성 |
| local-only 파일 도구 | 로컬 MCP에는 `parse_evaluation_file`, 원격 MCP에는 제외 | 로컬 MCP에는 `import_*_file`, `watch_folder`, `parse_document`; 원격 MCP에는 document_id/snapshot_id 기반 조회만 노출 |
| 사용자 중심 CLI | `schoolinfo search/get/eval/report/parse/check` | P0는 `setup/doctor/resolve/sources/search/import kvic/import kvca/health/mcp serve`, 후속은 deep query, event feed, report, standalone gap analysis |
| 실제 결과 예시 | README에 명령과 표 결과를 직접 제시 | `server-cli-usage.md`에 검색 결과, evidence status, caveat 예시를 유지 |
| 보안 가드 | rate limit, 파일 크기 제한, 경로 정제, 원격 localFiles 비활성화 | 파일 크기/확장자 제한, storage root allowlist, PII redaction, no crawler, local-only imports |

## 패키지/프로세스 구조

초기 레포를 별도 구현 레포로 분리할 때의 기준 구조입니다.

현재 repo-local 초안은 `runtime/`에 있으며 아래 P0 subset만 구현합니다.

```text
runtime/
  bin/vc-funds.mjs        # CLI + mcp serve entry
  src/core.mjs            # shared resolve/search/source health logic
  src/sqlite.mjs          # schema/seed loader and sqlite3 wrapper
  src/mcp-stdio.mjs       # newline-delimited JSON-RPC stdio MCP
  fixtures/sample-data.sql
  test/runtime-smoke.test.mjs
```

이 초안은 새 npm dependency 없이 Node 표준 라이브러리와 로컬 `sqlite3` 실행 파일만 사용합니다. 별도 repo로 분리할 때는 아래 TypeScript 구조로 승격합니다.

```text
vc-fund-disclosure/
  package.json
  src/
    core/
      config.ts
      ids.ts
      clock.ts
      normalize.ts
      errors.ts
    db/
      sqlite.ts
      migrations.ts
      repositories/
        sources.ts
        artifacts.ts
        investors.ts
        funds.ts
        documents.ts
        search.ts
        quality.ts
    sources/
      registry.ts
      policy.ts
      fundfinder-catalog.ts
    importers/
      kvicSnapshot.ts
      kvcaSnapshot.ts
      disclosureDocument.ts
      founderGuide.ts
      browserSnapshot.ts
      watchFolder.ts
    parsers/
      htmlTable.ts
      csvTable.ts
      unsupportedSpreadsheet.ts
      pdfText.ts
      hwpxXml.ts
      hwpAdapter.ts
    normalizers/
      investorAlias.ts
      fund.ts
      money.ts
      dates.ts
      fundFocus.ts
      eventExtraction.ts
    retrieval/
      intent.ts
      recall.ts
      ranker.ts
      evidenceStatus.ts
      dataGaps.ts
      explain.ts
    reports/
      markdown.ts
      investorReport.ts
      shortlistReport.ts
      evidencePack.ts
    cli/
      index.ts
      commands/
        setup.ts
        doctor.ts
        search.ts
        query.ts
        import.ts
        events.ts
        gaps.ts
        report.ts
        export.ts
        watch.ts
        uninstall.ts
    mcp/
      server.ts
      stdio.ts
      http.ts
      tools/
        queryTools.ts
        importTools.ts
        qualityTools.ts
    security/
      fileLimits.ts
      paths.ts
      pii.ts
      redaction.ts
      rateLimit.ts
  templates/
    claude-desktop.mcp.json
    codex.mcp.json
  fixtures/
    kvic/
    kvca/
    documents/
    guides/
  tests/
    parsers/
    retrieval/
    cli/
    mcp/
```

## 실행 파일과 배포 표면

`package.json`에는 개발 편의를 위해 bin을 둘 수 있지만, 사용자 기본 설치는 Homebrew/GitHub Releases입니다.

```json
{
  "name": "vc-fund-disclosure",
  "type": "module",
  "bin": {
    "vc-funds": "dist/cli/index.js",
    "vc-fund-disclosure-mcp": "dist/mcp/stdio.js"
  },
  "scripts": {
    "build": "tsup",
    "cli": "tsx src/cli/index.ts",
    "mcp": "tsx src/mcp/stdio.ts",
    "test": "node --import tsx --test tests/**/*.test.ts"
  }
}
```

사용자에게는 항상 `vc-funds` 하나로 보이게 합니다.

```bash
vc-funds setup --client claude --db auto
vc-funds mcp serve --db ~/.local/share/moonklabs/vc-funds/vc-funds.sqlite
```

## MCP 서버 설계

`schoolinfo-mcp`처럼 tool 정의를 transport에서 분리합니다.

```ts
export function buildMcpServer(opts: {
  dbPath: string;
  localFiles?: boolean;
  readonly?: boolean;
}) {
  const localFiles = opts.localFiles !== false;
  const server = new McpServer({ name: "vc-fund-disclosure", version: VERSION });

  registerQueryTools(server, opts);
  registerQualityTools(server, opts);

  if (localFiles && !opts.readonly) {
    registerImportTools(server, opts);
  }

  return server;
}
```

Transport별 차이:

| 모드 | 엔트리 | 파일 경로 도구 | 쓰기 도구 | 용도 |
|---|---|---|---|---|
| local stdio | `src/mcp/stdio.ts` | ON | ON | 개인 장비의 Claude/Codex에서 import/query |
| local readonly stdio | `vc-funds mcp serve --readonly` | OFF | OFF | 팀 공유 데모, 실수 방지 |
| future HTTP remote | `src/mcp/http.ts` | OFF | 기본 OFF | 이미 import된 DB snapshot 조회만 |

로컬 stdio 예:

```ts
const server = buildMcpServer({ dbPath, localFiles: true, readonly: false });
await server.connect(new StdioServerTransport());
```

원격 HTTP 예:

```ts
const server = buildMcpServer({ dbPath, localFiles: false, readonly: true });
await server.connect(new StreamableHTTPServerTransport({ sessionIdGenerator: undefined }));
```

## Core 데이터 흐름

```text
user question / CLI args
  -> intent extraction
  -> entity and condition resolution
  -> source authority plan
  -> source/data gap planning
  -> recall from SQLite views + exact alias tables
  -> ranking model
  -> evidence status
  -> markdown/table response
  -> optional explanation/evidence pack
```

Import 흐름:

```text
local file / browser snapshot
  -> path and size guard
  -> raw_artifacts write with sha256
  -> source_snapshots or documents
  -> parser
  -> normalized investors/funds/events/chunks
  -> evidence_edges
  -> quality-checks.sql
  -> review_queue/data_quality_flags
```

## CLI 설계

CLI는 MCP보다 사람이 직접 쓰는 진단성과 결과 예시가 중요합니다.

| P0 명령 | 역할 | 내부 core |
|---|---|---|
| `vc-funds setup` | DB, folders, source seed, MCP config backup/create | db/migrations, seed, templates |
| `vc-funds init` | `setup` alias | db/migrations, seed, templates |
| `vc-funds doctor` | 실행 가능성, DB, folder, policy, MCP handshake 확인 | quality, mcp ping |
| `vc-funds resolve "<query>"` | 사용자 입력을 intent/entity/condition 후보로 해석 | retrieval/intent, alias resolver |
| `vc-funds sources` | source trust tier와 authoritative scope 진단 | sources, policy |
| `vc-funds search "<query>"` | 자연어 통합 검색 | retrieval/intent, recall, ranker |
| `vc-funds import kvic` / `vc-funds import kvca` | 로컬 HTML/CSV snapshot import | importers |
| `vc-funds load-sql <file>` | fixture/seed SQL load | db utility |
| `vc-funds health` | source별 수집/품질 상태 확인 | health |
| `vc-funds mcp serve` | stdio MCP 실행 | mcp/stdio |

Planned CLI surfaces:

- 투자사/fund deep dive query
- 신규/변경/만기 event feed
- 별도 data gap 분석 명령
- document/guide import
- watch folder import
- 미팅 전 report와 evidence-pack export

## MCP 도구 설계

초기 stdio MCP는 도구 수를 늘리지 않고, 자연어 검색과 source 상태 확인을 중심으로 둡니다. 아래 P0 도구만 `runtime/src/mcp-stdio.mjs`와 `tool-contract.yaml`의 canonical surface입니다.

### Query tools

- `search_vc_database`: 자연어 통합 검색. 가장 많이 쓰는 기본 도구.
- `resolve_user_input`: 검색 전에 사용자 입력을 투자사/펀드/조건 후보로 해석.
- `get_source_authority`: 질문 유형별 authoritative/supporting/context-only source 확인.
- `get_collection_health`: source별 수집/품질 상태 확인.

Planned typed query tools:

- `query_investor_profile`: 특정 투자사 deep dive.
- `search_funds_for_startup`: 회사 단계/섹터/지역 기반 shortlist.
- `list_new_fund_events`: 신규 결성/변경/만기 이벤트 feed.
- `search_disclosure_evidence`: 원문 chunk/정규화 row 검색.
- `answer_founder_question`: guide corpus 기반 창업자 답변.
- `explain_search_result`: 특정 결과의 점수와 근거 설명.
- `list_data_gaps`: 부족한 source/import 액션 안내.

### Local import tools

로컬 stdio에서만 등록합니다.

- `import_kvic_snapshot`
- `import_kvca_snapshot`
- `import_disclosure_document`
- `import_founder_guide_document`
- `import_browser_snapshot`
- `register_founder_guide_source`

### Quality tools

- `get_collection_health`
- `run_quality_checks`
- `list_review_queue`
- `mark_review_item`

## 로컬 파일 접근 정책

로컬 MCP에서 파일 경로를 받을 수 있지만 무제한 파일시스템 도구가 되어서는 안 됩니다.

필수 제한:

1. 기본 storage root는 `~/Documents/MoonkLabs/VC Disclosures`.
2. import 입력 파일은 allowlist root, 사용자가 명시한 path, 또는 drag/drop 임시 path만 허용.
3. P1 snapshot import는 `html`, `csv`만 정규화한다. `xls`, `xlsx`는 감지 후 `unsupported_format`으로 반환하고, 문서/가이드 단계의 `pdf`, `hwpx`, `hwp`, `md`, `txt`는 별도 adapter에서만 허용한다.
4. 파일 크기 상한을 둔다.
   - snapshot/table: 50MB
   - document: 200MB
5. path traversal, symlink escape, hidden system file 접근을 차단한다.
6. 원격 HTTP MCP에서는 파일 경로 도구를 등록하지 않는다.

## 검색 정확도 설계

검색은 recall과 rank를 분리합니다.

Resolve:

1. raw query 보존
2. intent 분류
3. investor/fund/stage/round/sector/region 추출
4. exact alias 우선, fuzzy는 candidate로 표시
5. ambiguity가 있으면 검색 결과보다 후보 선택/data gap을 우선 표시

Recall:

1. exact normalized investor/fund alias
2. FundFinder category/focus match
3. KVCA association/fund operator link
4. TIPS operator snapshot
5. event/document/chunk lexical match
6. guide concept/guidance card match

P0 Rank:

- resolved entity candidate match: 35
- lexical term hit: 12 per hit
- stage/sector/TIPS condition hit: 10 per hit
- source trust score: official snapshot/official 35, high 25, medium 15, guide 12, derived 10, default 8
- tie-breaker: evidence_at desc

Planned rank signals:

- recency and fund activity signal
- parser warning penalty
- source completeness penalty
- unresolved critical quality flag penalty

## Result contract

모든 검색 결과는 아래 필드를 갖습니다.

```ts
type VcSearchResult = {
  rank: number;
  title: string;
  entityType: "investor" | "fund" | "event" | "document_chunk" | "guide";
  evidenceStatus:
    | "verified_official"
    | "official_needs_review"
    | "guide_only"
    | "user_note_only"
    | "no_evidence";
  score: number;
  whyRanked: string[];
  sourceUrl?: string;
  contentSha256?: string;
  capturedOrImportedAt?: string;
  parserWarnings?: string[];
  caveats: string[];
  nextAction?: string;
};
```

## MVP 구현 순서

### P0: Executable local skeleton

1. Node/TypeScript 프로젝트 생성.
2. SQLite migration loader 작성.
3. `vc-funds setup`, `doctor`, `mcp serve` 구현.
4. `buildMcpServer({ localFiles })` 구현.
5. `get_collection_health`, `search_vc_database` stub을 실제 DB query까지 연결.

### P1: Import and query fixtures

1. 개인정보 제거 KVIC/KVCA HTML fixture 준비.
2. `import_kvic_snapshot`, `import_kvca_snapshot` 구현.
3. investor/fund alias normalization 구현.
4. `query_investor_profile`, `search_funds_for_startup` 구현.
5. parser golden test 추가.

### P2: Documents and event extraction

1. `kordoc` CLI/MCP document adapter.
2. PDF/HWP/HWPX/HWPML/DOCX/XLS/XLSX to Markdown/table import.
3. Parser status, warning, and original hash preservation.
4. event candidate extraction.
5. review queue와 quality flags 연결.

### P3: Founder guide corpus

1. guide import/chunking.
2. lexical guide search.
3. fundraising concept/guidance card 승격.
4. `answer_founder_question` 구현.

### P4: UX polish and release

1. markdown/table formatter.
2. evidence pack export.
3. Homebrew/GitHub Releases packaging.
4. MCP config backup/restore.
5. smoke tests for Claude/Codex stdio.

## 테스트 전략

| 테스트 | 목적 |
|---|---|
| parser golden tests | HTML과 `kordoc` 변환 PDF/HWP/HWPX 구조 변경 감지 |
| migration tests | fresh DB와 upgrade DB 모두 동작 |
| retrieval tests | 같은 질문이 같은 후보/점수/caveat를 반환 |
| privacy tests | 개인 이메일/휴대전화가 기본 응답에 노출되지 않음 |
| policy tests | background crawler가 기본 비활성화 |
| MCP smoke tests | stdio handshake와 주요 tool 호출 |
| CLI snapshot tests | markdown 표 출력 회귀 방지 |

## 피해야 할 설계

- MCP tool마다 직접 DB SQL을 흩뿌리는 구조.
- CLI와 MCP가 서로 다른 검색/랭킹 구현을 갖는 구조.
- 원격 MCP에서 서버 로컬 파일 경로를 받는 구조.
- FundFinder 자연어를 원격 POST 파라미터로 즉시 변환하는 구조.
- 검색 결과에 source hash와 why_ranked 없이 "추천"만 출력하는 구조.
- parser warning이 있는 결과를 `verified_official`로 표시하는 구조.

# VC Fund Disclosure MCP Spec Pack

상태: Draft spec, not executable server.

이 디렉터리는 한국 VC/AC 공시 evidence와 창업자 guide 자료를 로컬 SQLite DB에 축적하고, MCP가 안전하게 조회/표시하기 위한 구현 계약입니다.

## 파일 역할

| 파일 | 역할 |
|---|---|
| `source-registry.yaml` | 수집 source, 정책 상태, 필수 필드, 품질 체크 목록 |
| `schema.sql` | canonical SQLite schema, index, view |
| `seed-sources.sql` | fresh DB source seed |
| `tool-contract.yaml` | MCP tool surface와 사용자 표시 계약 |
| `search-contract.yaml` | 자연어 질문 라우팅, 랭킹, evidence status, empty state 계약 |
| `server-cli-usage.md` | 스타트업 사용자를 위한 MCP/CLI 소개와 명령 예시 |
| `schoolinfo-business-architecture-analysis.md` | schoolinfo-mcp README의 비즈니스 문제와 아키텍처 해법 분석 |
| `implementation-blueprint.md` | schoolinfo-mcp 패턴을 적용한 실제 모듈/transport/CLI/MCP 구현 설계 |
| `display-queries.sql` | investor profile, 신규 이벤트, fund search, guide search 표시 쿼리 |
| `quality-checks.sql` | import 후 품질/누락/PII 후보 점검 쿼리 |

## 구현 순서

1. `schema.sql`로 SQLite DB를 만든다.
2. `seed-sources.sql`로 source registry를 DB에 주입한다.
3. import adapter는 원본 HTML/CSV/XLS/PDF/HWPX를 `raw_artifacts`에 먼저 저장한다.
4. 정규화 row는 `source_snapshots`, `documents`, `evidence_edges` 중 하나 이상의 근거에 연결한다.
5. import 후 `quality-checks.sql`을 실행해 문제를 `data_quality_flags`와 응답 caveat로 올린다.
6. MCP 조회는 `search-contract.yaml`, `tool-contract.yaml`, `display-queries.sql`의 검색/표시 계약을 따른다.
7. 실제 서버/CLI 구현은 `implementation-blueprint.md`의 모듈 경계와 transport 분리를 따른다.
8. 실제 README와 제품 메시지는 `schoolinfo-business-architecture-analysis.md`의 문제 해결 구조를 따른다.

## 수집 원칙

- 기본 ON: manual snapshot import, local watch folder import, user gesture browser capture, founder guide local import.
- 기본 OFF: scheduled site crawler, login scraping, hidden API scraping, full-site pagination.
- 허가 후 ON: official API, paid data agreement, institution-approved rate-limited fetcher.
- 공식 공시 evidence, 창업자 guide, 사용자 note는 저장과 응답에서 분리한다.
- 개인 연락처와 private note 원문은 기본 응답에 노출하지 않는다.

## 검색 결과 원칙

- 모든 결과는 `verified_official`, `official_needs_review`, `guide_only`, `user_note_only`, `no_evidence` 중 하나의 evidence status를 가진다.
- 검색 결과에는 `why_ranked`, `source_url`, `content_sha256_or_file_sha256`, `captured_or_imported_at`, `parser_warnings`, `caveats`를 가능한 한 포함한다.
- 결과가 없거나 근거가 약한 경우에도 사용자가 다음에 import해야 할 snapshot/document를 보여준다.
- CLI와 MCP는 같은 core 검색/랭킹 로직을 공유한다.

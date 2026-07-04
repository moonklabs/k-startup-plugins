# KVIC/KVCA Fund Data MCP Draft

작성일: 2026-07-04
상태: Draft
목표: 한국 VC 딜소싱에서 KVIC FundFinder와 KVCA DIVA 조합현황을 사람 손검색에 의존하지 않고, 공식 근거 기반으로 검색/대사할 수 있게 만든다.

## 결론

MCP/DB화 가치는 높다. 다만 두 사이트의 `robots.txt`가 전체 경로 `Disallow: /`를 반환하므로, 허가 없는 주기적 크롤링형 scraper로 만들면 안 된다.

초기 제품은 다음 경계가 맞다.

1. 사용자가 직접 조회/다운로드/저장한 HTML 또는 표 데이터를 import한다.
2. MCP는 import된 스냅샷을 정규화하고 검색한다.
3. PDF/HWP/HWPX 같은 첨부 공시 원본은 해시와 출처를 남겨 evidence store에 보관하고, 파싱 결과는 별도 테이블로 분리한다.
4. 공식 허가 또는 별도 데이터 제공 계약을 얻은 뒤에만 scheduled fetcher를 켠다.

## 제품 결정: 별도 데이터조회 MCP가 필요하다

결론: 필요하다. 이 기능은 `deal-sourcing` 스킬 내부의 검색 절차로만 두기보다, `vc-fund-disclosure-mcp` 같은 별도 로컬 데이터 MCP로 분리하는 편이 맞다.

이유는 다음과 같다.

1. VC/AC 투자사 조회는 매번 웹 검색하는 작업이 아니라, 공식 공시/펀드 근거를 누적해 대사하는 데이터 조회 문제다.
2. 사용자는 개인적으로 확인한 스냅샷, 다운로드한 공시 파일, TIPS 운영사/펀드 보유 신호를 계속 쌓아 두고 나중에 질의하고 싶어 한다.
3. 공시 원본과 파싱 결과, 추정 점수, 미팅 전략은 신뢰 수준이 다르므로 같은 응답에 섞기보다 evidence DB로 분리해야 한다.
4. KVIC/KVCA의 무허가 주기 크롤링은 정책 리스크가 있으므로, 수집 정책을 MCP 설정과 감사 로그로 관리해야 한다.
5. 향후 공식 허가, 제휴 데이터, 유료 API가 생겨도 같은 DB와 조회 MCP 위에 fetcher만 교체하면 된다.

추천 구성:

| 패키지 | 역할 |
|---|---|
| `vc-fund-disclosure-core` | 파서, 정규화, diff, evidence pack 생성 |
| `vc-funds` | 로컬 CLI. setup, import, watch folder, diff, export 담당 |
| `vc-fund-disclosure-mcp` | Codex/Claude/Agent가 질의하는 MCP server |
| `vc-fund-disclosure-fixtures` | 개인정보 제거 fixture와 golden parser test |

초기 `.mcp.json`에는 아직 서버를 넣지 않는다. 실행 가능한 MCP 바이너리/패키지가 생긴 뒤에만 추가해야 플러그인 설치가 깨지지 않는다.

## 추천 구현 구조

내부는 모듈형으로 나누되, 설치 경험은 하나의 로컬 도구처럼 보여야 한다.

```text
vc-fund-disclosure/
  package.json
  packages/
    core/
      src/parsers/
      src/normalizers/
      src/evidence/
      src/knowledge/
      src/retrieval/
      src/policy/
    cli/
      src/commands/init.ts
      src/commands/import.ts
      src/commands/watch.ts
      src/commands/query.ts
      src/commands/doctor.ts
    mcp/
      src/server.ts
      src/tools/
    browser-capture/
      README.md
    fixtures/
      kvic/
      kvca/
      disclosures/
      guides/
  templates/
    claude-desktop.mcp.json
    codex.mcp.json
  docs/
    source-policy.md
    parser-fixtures.md
```

구조 원칙:

1. `core`는 MCP나 CLI를 모른다. 파일 import, 파싱, 정규화, diff, evidence pack 생성만 담당한다.
2. `cli`는 사람이 쓰는 표면이다. DB 생성, watch folder, import, doctor, MCP config 생성을 담당한다.
3. `mcp`는 얇아야 한다. `core`와 DB query만 호출하고, 외부 사이트 접속 로직을 직접 갖지 않는다.
4. `browser-capture`는 선택 도구다. 사용자가 보고 있는 페이지를 snapshot으로 저장할 뿐 background crawler가 아니다.
5. `knowledge`/`retrieval`은 초기 창업자를 위한 PDF/HWPX 가이드 문서 검색, 용어 설명, 체크리스트 생성을 담당한다.
6. `fixtures`는 개인정보를 제거한 최소 HTML/PDF/HWPX 예제로만 구성한다.

## 쉬운 로컬 설치 UX

사용자는 패키지 구조를 알 필요가 없어야 한다. 기본 설치 경로는 "설치 + setup + doctor"로 둔다.

npm scoped package는 기본 배포 경로로 쓰지 않는다. `@moonklabs/*` npm org/package는 유료/권한/registry 의존 문제가 생길 수 있으므로, 기본은 GitHub Releases와 Homebrew tap으로 잡는다. Node/TypeScript로 개발하더라도 사용자 설치는 registry 없이 가능해야 한다.

권장 기본 설치:

```bash
brew install moonklabs/tap/vc-funds
vc-funds setup --client claude --db auto
vc-funds doctor
```

Homebrew를 쓰지 않는 경우:

```bash
curl -fsSL https://raw.githubusercontent.com/moonklabs/vc-fund-disclosure/main/install.sh | sh
vc-funds setup --client claude --db auto
vc-funds doctor
```

보안 친화적인 수동 설치:

```bash
gh release download --repo moonklabs/vc-fund-disclosure --pattern "vc-funds-$(uname -s)-$(uname -m).tar.gz"
tar -xzf vc-funds-*.tar.gz -C ~/.local/bin vc-funds
vc-funds doctor
```

`setup`이 해야 할 일:

1. 기본 DB를 생성한다.
   - macOS/Linux: `~/.local/share/moonklabs/vc-funds/vc-funds.sqlite`
   - Windows: `%LOCALAPPDATA%\MoonkLabs\vc-funds\vc-funds.sqlite`
2. 기본 보관함을 만든다.
   - `~/Documents/MoonkLabs/VC Disclosures/Inbox`
   - `~/Documents/MoonkLabs/VC Disclosures/Archive`
   - `~/Documents/MoonkLabs/VC Disclosures/Guides`
3. `watch_folder_import`를 Inbox에 연결한다.
4. `Guides` 폴더를 창업자 교육/가이드 PDF 보관함으로 등록한다.
5. Claude/Codex MCP 설정에 로컬 stdio server를 추가한다.
6. `vc-funds doctor`를 실행해 DB, watch folder, guide library, MCP server 실행 가능 여부를 확인한다.

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

개발 중 설치:

```bash
git clone https://github.com/moonklabs/vc-fund-disclosure
cd vc-fund-disclosure
npm install
npm run build
./bin/vc-funds setup --client claude --db auto --local
```

사용 예:

```bash
vc-funds import kvic --file "./snapshots/fundfinder-AA02.html" --group AA --code AA02
vc-funds import kvca --file "./snapshots/kvca-primer.html"
vc-funds import document --file "./disclosures/new-fund.hwpx" --source kvca
vc-funds import guide --file "./guides/seed-fundraising-guide.pdf" --role founder_education --source user-library
vc-funds watch start
vc-funds query investor "프라이머"
vc-funds ask "초기 투자 미팅 전에 무엇을 준비해야 해?"
```

배포 UX 기준:

- npm registry를 기본 경로로 쓰지 않는다.
- 1순위: Homebrew tap. macOS 사용자에게 가장 쉽다.
- 2순위: GitHub Releases 단일 실행 파일 또는 install script.
- 3순위: source checkout 개발 설치.
- MCP 설정은 `npx`가 아니라 설치된 `vc-funds mcp serve`를 호출한다.
- API key가 없어도 시작 가능해야 한다.
- `setup`은 외부 사이트 수집을 켜지 않는다.
- `doctor`는 `OK`, `WARN`, `BLOCKED`로 원인을 알려준다.
- MCP config를 자동 수정하기 전에는 백업 파일을 만든다.
- 삭제는 `vc-funds uninstall --keep-data`와 `vc-funds uninstall --purge-data`를 분리한다.

## 참고 구현 패턴: schoolinfo-mcp

[chrisryugj/schoolinfo-mcp](https://github.com/chrisryugj/schoolinfo-mcp)는 학교알리미 OpenAPI 정형 데이터와 웹 공시 첨부파일 파싱을 묶은 MCP/CLI 사례다. 그대로 복제하기보다 아래 패턴을 VC 공시 쪽에 적용한다.

- 정형 API/HTML 목록 조회와 첨부 문서 파싱을 같은 도메인 모델로 합친다.
- MCP, CLI, 웹/서버 transport는 얇게 두고, 파서와 정규화 로직은 공용 core library로 둔다.
- 로컬 stdio MCP에서는 사용자가 가진 파일 경로를 읽는 `parse_*_file` 도구를 제공할 수 있지만, 원격 MCP에서는 서버 파일시스템 접근 도구를 노출하지 않는다.
- 첨부 문서는 원본 파일, 파싱 markdown/text, 추출 표, 추출 품질 경고를 분리해서 저장한다.
- 자동 조회가 실패하거나 공시 구조가 바뀌면 원본 파일 확인 경로와 한계 문구를 같이 반환한다.

VC 공시 MCP에 적용하면 초기 형태는 `vc-fund-disclosure-core`와 `vc-fund-disclosure-mcp`로 나누고, core는 HTML/CSV/XLS/PDF/HWP/HWPX import와 정규화를 담당한다. MCP는 core를 호출해 검색, 신규 이벤트, evidence pack만 제공한다.

## 확인한 접근성

### KVIC FundFinder

- 메인: `http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd`
- 실제 시작 화면: `GET /rsh/rsh/RshMacFndInq`
- 목록 조회: `POST /rsh/rsh/RshMacFndLstInq`
- 핵심 파라미터:
  - `ASCT_CLSS_GRP_CD_FND`: 대분류 코드. 예: `AA`
  - `ASCT_CLSS_CD_FND`: 소분류 코드. 예: `AA02`
- 파라미터 사전: `startup-fundraise/skills/deal-sourcing/references/kvic-fundfinder-parameter-catalog.md`
- 결과 형태: HTML table
- 확인된 필드:
  - 펀드명
  - 결성일
  - 결성총액 및 투자금액
  - 존속기간
  - 운용사명
  - 소재지
  - 홈페이지
  - 투자목적

### KVCA DIVA 조합현황

- 메인: `http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq`
- 조합현황: `GET/POST /div/dii/DivItmAssoInq`
- 핵심 검색 파라미터:
  - `S_OPER_INST_NM`: VC명
  - `S_ASCT_NM`: 조합명
  - `S_ASCT_TP_CD`: 조합구분. 기본 `A`는 벤처투자조합
  - `S_MFUND_INVST_YN`: 모태출자 여부
  - `S_ORDER_BAS_TP_CD`: 정렬 기준
  - `S_ORDER_BY_TP_CD`: 정렬 방향
  - `PAGE_UNIT`, `PAGE_INDEX`
- 조합 상세:
  - `POST /div/cmn/DivCreatStatInq/pop1`
  - 파라미터: `ASCT_ID`
- 운용사 상세:
  - `POST /div/cmn/DivCmnComInfo/pop1`
  - 파라미터: `OPER_INST_ID`, `DISCLS_YYMM`
- 결과 형태: HTML table
- 확인된 목록 필드:
  - 회사명
  - 조합명
  - 등록일
  - 결성총액
  - 만기일
  - 투자분야 구분
  - 목적구분
  - 지원구분
- 확인된 상세 필드:
  - 대표펀드매니저
  - 계정구분
  - 결성약정총액
  - 모태출자여부
  - 운용사 주소/전화/홈페이지

## robots 및 정책 경계

두 사이트 모두 `robots.txt`가 다음을 반환했다.

```text
User-agent: *
Disallow: /
```

따라서 초기 MCP는 다음을 하지 않는다.

- 무허가 scheduled crawler
- 전체 카테고리/전체 VC 순회
- 대량 pagination 수집
- robots 정책을 우회하는 headless browser 운영

허용 가능한 초기 방식:

- 사용자가 직접 저장한 HTML snapshot import
- 사용자가 직접 내려받은 표/엑셀/CSV import
- 사용자가 직접 내려받은 PDF/HWP/HWPX 공시 첨부파일 import
- 수동 조회 결과를 붙여넣기하여 parser 검증
- 공식 허가를 받은 뒤 rate-limited fetcher 활성화

## 개인 로컬 수집 모드

사용자가 원하는 "자동으로 수집해 놓고 나중에 조회"는 제품적으로 필요하다. 다만 여기서 자동 수집은 기본적으로 "사용자가 확보한 로컬 자료를 자동 import/diff"하는 뜻으로 제한한다. 사이트를 백그라운드에서 무단 순회하는 crawler와 구분한다.

| 모드 | 기본 상태 | 자동화 수준 | 사용 예 | 정책 경계 |
|---|---|---|---|---|
| `manual_snapshot_import` | ON | 낮음 | 사용자가 저장한 FundFinder/KVCA HTML, CSV, XLS를 import | 안전한 기본값 |
| `watch_folder_import` | ON | 중간 | `~/Downloads/vc-disclosures`에 저장되는 PDF/HWPX/HTML을 자동 import | 로컬 파일만 처리 |
| `browser_capture_import` | ON | 중간 | 사용자가 보고 있는 페이지를 브라우저 확장/북마클릿으로 snapshot 저장 | 사용자 제스처 필요 |
| `official_feed_fetch` | OFF | 높음 | 공식 API, 허가된 feed, 데이터 제공 계약 기반 fetch | 허가 근거 필요 |
| `site_background_crawler` | OFF | 높음 | 사이트 전체 카테고리/VC pagination 순회 | 초기 제품 금지 |

운영 원칙:

- 수집 단위마다 `acquisition_mode`, `policy_status`, `allowed_by`, `source_url`, `content_sha256`, `captured_at`을 남긴다.
- `watch_folder_import`는 로컬 파일 생성 이벤트를 처리할 뿐 외부 사이트에 접속하지 않는다.
- `browser_capture_import`는 사용자가 보고 있는 현재 페이지를 저장하는 보조도구로 보고, headless login/scrape 우회 도구로 만들지 않는다.
- 공식 허가를 받기 전까지 `official_feed_fetch`는 설정상 존재만 하고 비활성화한다.
- MCP 조회 도구는 로컬 DB의 결과를 반환하되, 공시 원문 전체 대신 근거 제목, 해시, 출처, 필요한 요약을 반환한다.

## 대상 데이터 범위

초기에는 "투자 유치 판단에 필요한 공식 근거"와 "초기 창업자에게 필요한 설명 자료"를 함께 다루되, 두 데이터의 용도를 분리한다.

| 범위 | 예시 | 저장 방식 |
|---|---|---|
| 정형 목록 | KVIC 카테고리별 펀드 목록, KVCA 조합현황 목록 | 행 단위 정규화 |
| 상세 HTML | KVCA 조합 상세, 운용사 상세 | 스냅샷 원본 + 정규화 |
| 첨부 공시 | 신규 펀드 결성, 조합 변경, 운용사 공시 PDF/HWP/HWPX | 원본 파일 + 파싱 텍스트 + 추출 이벤트 |
| 창업자 가이드 | 투자유치 절차, TIPS 안내, 투자계약 용어, IR/데이터룸 체크리스트 PDF/HWPX | 원본 파일 + 텍스트 청크 + 개념/체크리스트 카드 |
| 파생 신호 | 신규 결성, 만기 임박, 모태출자 여부, 투자분야, Seed/Pre-A 적합도 | 계산 결과 + 근거 row/document 링크 |

저장하지 않거나 기본 응답에서 마스킹하는 정보:

- 담당자 개인 이메일, 휴대전화, 주민/개인 식별 가능 정보
- 공시담당자 개인 연락처
- 출처 없이 추정한 투자 가능 금액

## 초기 창업자 가이드 코퍼스

초기 투자유치 기업은 VC/AC 목록보다 먼저 "투자유치가 무엇이고 무엇을 준비해야 하는지"를 모르는 경우가 많다. 따라서 PDF/HWPX 자료를 로컬에 저장해 창업자 교육 코퍼스로 쓰는 것이 좋다.

다만 이 코퍼스는 공시 evidence와 역할이 다르다.

| 구분 | 목적 | 예시 질문 | 답변 방식 |
|---|---|---|---|
| 공시 evidence | 특정 VC/펀드가 실제 근거를 갖는지 확인 | "이 VC가 Seed 펀드를 갖고 있나?" | 펀드/조합 row, 원본 해시, caveat |
| 창업자 guide | 절차, 용어, 준비물, 실수 방지 설명 | "프리A 전에 뭘 준비해야 해?" | PDF 근거 요약, 체크리스트, 단계별 액션 |
| 템플릿/예시 | 문서 작성과 미팅 준비 | "데이터룸 목차 만들어줘" | 템플릿 초안, 누락 항목, 주의사항 |

저장할 만한 자료 유형:

- 정부/공공기관/협회가 공개한 투자유치, TIPS, 창업지원, 투자계약 안내 PDF
- VC/AC가 공개한 지원 안내서, 배치 안내서, 포트폴리오 지원 자료
- 사용자가 보유한 IR/데이터룸/투자계약 체크리스트
- 투자 미팅 후 정리한 FAQ, 반박 목록, 후속 액션 노트

저장/출력 규칙:

- 원본 PDF/HWPX는 개인 로컬 DB 보관함에만 둔다.
- 각 문서는 `source_url`, `license_note`, `imported_by`, `file_sha256`, `document_role`을 남긴다.
- 답변에는 긴 원문을 복제하지 않고, 필요한 요약과 짧은 근거 문장만 제시한다.
- 공식 문서, 투자자 블로그, 사용자의 사내 노트는 신뢰 수준을 분리한다.
- 법률/세무/투자계약 내용은 일반 설명으로만 제공하고, 실제 계약 판단은 전문가 검토 필요 문구를 붙인다.
- private deck, NDA 자료, 투자자 메일은 기본 guide corpus에 넣지 않는다. 필요하면 별도 restricted corpus로 분리한다.

### Seed guide 후보

초기 번들에는 "다운로드 가능한 파일"과 "사용자가 제공한 후보 URL"을 구분해서 저장한다. 링크가 죽었거나 접근이 제한된 자료도 사용자가 로컬 파일을 갖고 있으면 import할 수 있어야 한다.

| 출처 | URL | 역할 | 현재 상태 | 처리 |
|---|---|---|---|---|
| KVIC 사용자 제공 PDF | https://www.kvic.or.kr/upload/investment/20210114/20210114155945_63291.pdf | `founder_education` | 2026-07-04 확인 시 `HTTP 410 Gone` | URL 후보로 등록하고, 로컬 파일 보유 시 `--file` import |

예시:

```bash
vc-funds guide-source add \
  --publisher KVIC \
  --url "https://www.kvic.or.kr/upload/investment/20210114/20210114155945_63291.pdf" \
  --role founder_education \
  --access-status remote_gone_410

vc-funds import guide \
  --file "./guides/kvic-founder-guide.pdf" \
  --source-url "https://www.kvic.or.kr/upload/investment/20210114/20210114155945_63291.pdf" \
  --role founder_education \
  --publisher KVIC
```

## DB 스키마 초안

```sql
CREATE TABLE kvic_fund_categories (
  category_code TEXT PRIMARY KEY,
  category_name TEXT NOT NULL,
  parent_code TEXT,
  description TEXT,
  source_url TEXT NOT NULL,
  snapshot_at TEXT NOT NULL
);

CREATE TABLE kvic_funds (
  id TEXT PRIMARY KEY,
  category_code TEXT NOT NULL,
  subcategory_code TEXT,
  subcategory_name TEXT,
  fund_name TEXT NOT NULL,
  formed_date TEXT,
  committed_amount_krw INTEGER,
  invested_amount_krw INTEGER,
  duration_text TEXT,
  operator_name TEXT,
  operator_homepage TEXT,
  location_text TEXT,
  investment_purpose TEXT,
  source_snapshot_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  snapshot_at TEXT NOT NULL
);

CREATE TABLE kvca_associations (
  asct_id TEXT PRIMARY KEY,
  operator_names TEXT NOT NULL,
  association_name TEXT NOT NULL,
  registered_date TEXT,
  committed_amount_krw INTEGER,
  expiry_date TEXT,
  investment_field TEXT,
  purpose_type TEXT,
  support_type TEXT,
  mfund_invested BOOLEAN,
  representative_fund_manager TEXT,
  account_type TEXT,
  source_snapshot_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  snapshot_at TEXT NOT NULL
);

CREATE TABLE vc_operator_aliases (
  operator_id TEXT,
  source TEXT NOT NULL,
  source_operator_id TEXT,
  operator_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  homepage TEXT,
  source_snapshot_id TEXT NOT NULL,
  snapshot_at TEXT NOT NULL
);

CREATE TABLE source_snapshots (
  snapshot_id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  acquisition_mode TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  storage_uri TEXT NOT NULL,
  parser_version TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE source_configs (
  source_id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  collection_mode TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT 0,
  policy_status TEXT NOT NULL,
  allowed_by TEXT,
  schedule_cron TEXT,
  local_watch_path TEXT,
  last_checked_at TEXT,
  notes TEXT
);

CREATE TABLE collection_runs (
  run_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  status TEXT NOT NULL,
  items_seen INTEGER NOT NULL DEFAULT 0,
  items_imported INTEGER NOT NULL DEFAULT 0,
  warnings TEXT,
  error_message TEXT
);

CREATE TABLE watchlist_targets (
  target_id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_value TEXT NOT NULL,
  normalized_value TEXT NOT NULL,
  tags TEXT,
  created_at TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE investor_profiles (
  investor_id TEXT PRIMARY KEY,
  investor_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  investor_type TEXT,
  homepage TEXT,
  tips_operator_status TEXT,
  latest_evidence_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE evidence_edges (
  edge_id TEXT PRIMARY KEY,
  from_type TEXT NOT NULL,
  from_id TEXT NOT NULL,
  to_type TEXT NOT NULL,
  to_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  source_snapshot_id TEXT,
  source_document_id TEXT,
  confidence TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE disclosure_documents (
  document_id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_url TEXT,
  title TEXT,
  published_date TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_sha256 TEXT NOT NULL,
  storage_uri TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  parser_status TEXT NOT NULL,
  parser_warnings TEXT
);

CREATE TABLE disclosure_extractions (
  extraction_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  parser_version TEXT NOT NULL,
  extracted_text_uri TEXT,
  extracted_markdown_uri TEXT,
  structured_json TEXT,
  extraction_quality TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE founder_guide_documents (
  guide_document_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  document_role TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_sha256 TEXT NOT NULL,
  storage_uri TEXT NOT NULL,
  license_note TEXT,
  trust_level TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  parser_status TEXT NOT NULL,
  parser_warnings TEXT
);

CREATE TABLE founder_guide_sources (
  guide_source_id TEXT PRIMARY KEY,
  publisher TEXT NOT NULL,
  source_url TEXT NOT NULL,
  suggested_role TEXT NOT NULL,
  access_status TEXT NOT NULL,
  last_checked_at TEXT,
  local_file_hint TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE founder_guide_chunks (
  chunk_id TEXT PRIMARY KEY,
  guide_document_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  heading TEXT,
  text_uri TEXT,
  token_count INTEGER,
  topics TEXT,
  embedding_ref TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE fundraising_concepts (
  concept_id TEXT PRIMARY KEY,
  concept_name TEXT NOT NULL,
  aliases TEXT,
  plain_language_summary TEXT NOT NULL,
  source_chunk_ids TEXT,
  trust_level TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE guidance_cards (
  guidance_card_id TEXT PRIMARY KEY,
  card_type TEXT NOT NULL,
  title TEXT NOT NULL,
  startup_stage TEXT,
  body_markdown TEXT NOT NULL,
  source_chunk_ids TEXT,
  review_status TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE fund_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_date TEXT,
  operator_name TEXT,
  fund_name TEXT,
  committed_amount_krw INTEGER,
  investment_field TEXT,
  source_snapshot_id TEXT,
  source_document_id TEXT,
  evidence_text TEXT NOT NULL,
  confidence TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

개인 연락처, 휴대전화, 담당자 이메일은 기본 스키마에서 제외한다. 필요 시 별도 `restricted_contacts` 테이블로 분리하고 기본 MCP 응답에서는 마스킹한다.

## MCP tool surface 초안

```yaml
tools:
  - name: configure_collection_source
    input:
      source: string
      collection_mode: string
      enabled: boolean
      policy_status: string
      allowed_by: string
      local_watch_path: string
    output: { source_id: string, enabled: boolean, warnings: string[] }

  - name: list_collection_sources
    input: { include_disabled: boolean }
    output: { sources: array, caveats: string[] }

  - name: run_personal_collection
    input: { source_id: string, dry_run: boolean }
    output: { run_id: string, items_seen: number, items_imported: number, warnings: string[] }

  - name: import_browser_snapshot
    input: { html: string, source_url: string, captured_at: string, source: string }
    output: { snapshot_id: string, imported_rows: number, warnings: string[] }

  - name: import_kvic_snapshot
    input: { file_path: string, source_url: string, snapshot_at: string, group_code: string, subcategory_code: string }
    output: { imported_funds: number, categories: number, warnings: string[] }

  - name: import_kvca_snapshot
    input: { file_path: string, source_url: string, snapshot_at: string }
    output: { imported_associations: number, operators: number, warnings: string[] }

  - name: import_disclosure_document
    input: { file_path: string, source_url: string, title: string, published_date: string }
    output: { document_id: string, file_sha256: string, parser_status: string, warnings: string[] }

  - name: import_founder_guide_document
    input:
      file_path: string
      source: string
      source_url: string
      document_role: string
      trust_level: string
      license_note: string
    output: { guide_document_id: string, file_sha256: string, imported_chunks: number, warnings: string[] }

  - name: register_founder_guide_source
    input:
      publisher: string
      source_url: string
      suggested_role: string
      access_status: string
      notes: string
    output: { guide_source_id: string, access_status: string, warnings: string[] }

  - name: check_founder_guide_source
    input: { guide_source_id: string }
    output: { guide_source_id: string, access_status: string, last_checked_at: string, warnings: string[] }

  - name: extract_fund_events_from_document
    input: { document_id: string }
    output: { events: array, extraction_quality: string, warnings: string[] }

  - name: search_funds_for_startup
    input:
      company_stage: string
      sector_keywords: string[]
      region: string
      round_type: string
      fundfinder_codes: string[]
    output:
      funds: array
      evidence: array
      caveats: string[]

  - name: lookup_vc_fund_holdings
    input: { vc_name: string }
    output:
      kvca_associations: array
      kvic_funds: array
      caveats: string[]

  - name: query_investor_profile
    input: { investor_name: string, include_evidence: boolean }
    output:
      investor_profile: object
      funds: array
      tips_operator_status: object
      evidence: array
      caveats: string[]

  - name: score_vc_fund_fit
    input:
      vc_name: string
      startup_profile: object
    output:
      score: string
      reasons: array
      official_fund_evidence: array
      limitations: array

  - name: list_new_fund_events
    input: { since: string, event_type: string }
    output:
      events: array
      evidence_documents: array
      caveats: string[]

  - name: search_disclosure_evidence
    input: { query: string, source: string, since: string, limit: number }
    output:
      matches: array
      redactions: array
      caveats: string[]

  - name: search_founder_knowledge
    input: { query: string, startup_stage: string, limit: number }
    output:
      answers: array
      source_documents: array
      caveats: string[]

  - name: explain_fundraising_concept
    input: { concept: string, startup_stage: string }
    output:
      plain_language_summary: string
      why_it_matters: string
      common_mistakes: array
      source_documents: array
      caveats: string[]

  - name: generate_fundraising_checklist
    input: { startup_stage: string, round_type: string, company_context: object }
    output:
      checklist: array
      missing_inputs: array
      source_documents: array
      caveats: string[]

  - name: answer_founder_question
    input: { question: string, company_context: object }
    output:
      answer_markdown: string
      recommended_actions: array
      source_documents: array
      caveats: string[]

  - name: list_unreviewed_fund_events
    input: { since: string, limit: number }
    output: { events: array, caveats: string[] }

  - name: mark_fund_event_reviewed
    input: { event_id: string, decision: string, notes: string }
    output: { event_id: string, review_status: string }

  - name: get_collection_health
    input: {}
    output: { sources: array, last_runs: array, warnings: string[] }

  - name: export_fund_evidence_pack
    input: { vc_name: string, include_documents: boolean }
    output:
      summary_markdown: string
      source_files: array
      redactions: array
```

## 뭉클랩 Seed/Pre-A에 적용하는 흐름

1. KVIC snapshot에서 FundFinder 파라미터 카탈로그 기준으로 `AA02`(초기기업), `DA01`(4차산업혁명), `EA01`(일반), `DH01`(기술사업화), 필요 시 `CA01`~`CA10`(지역) 카테고리를 가져온다.
2. 결성일, 결성총액, 투자금액을 기준으로 신규 투자 여력 후보를 만든다.
3. KVCA snapshot에서 후보 VC명을 조회해 보유 벤처투자조합을 확인한다.
4. `모태출자여부`, `등록일`, `만기일`, `결성총액`, `투자분야 구분`, `지원구분`을 근거로 Seed/Pre-A 후보를 나눈다.
5. 신규 펀드 결성/변경 공시 첨부파일이 있으면 `fund_events`로 추출해 "최근 dry powder 신호"로 추가 반영한다.
6. 최종 점수는 공식 펀드 근거 30%, thesis/포트폴리오 40%, 접근 경로 30%로 둔다.

## 단계별 구현 방법

### Phase 0: 소스/정책 인벤토리

1. KVIC, KVCA, 관련 공시 게시판별 URL, 화면 경로, 다운로드 방식, robots/약관, 연락 가능한 공식 데이터 제공 창구를 표로 정리한다.
2. 자동 수집 가능 여부를 `manual_snapshot`, `official_api`, `licensed_feed`, `forbidden_or_unknown` 네 단계로 분류한다.
3. 초기 구현은 `manual_snapshot`만 활성화한다. `licensed_feed`는 허가 문서/계약 번호를 설정값으로 남길 수 있을 때만 켠다.
4. 개인 로컬 자동화는 `watch_folder_import`와 `browser_capture_import`까지 허용한다. 둘 다 외부 사이트 자동 접속이 아니라 사용자가 확보한 자료를 자동 처리하는 방식이어야 한다.

### Phase 1: core library와 fixture 테스트

1. `parsers/kvic_list`, `parsers/kvca_association_list`, `parsers/kvca_association_detail`, `parsers/disclosure_document`를 분리한다.
2. 실제 원본에서 개인정보를 제거한 최소 HTML/PDF/HWPX fixture를 만든다.
3. parser 결과는 `raw_fields`, `normalized_fields`, `warnings`, `source_locator`를 반드시 반환한다.
4. fixture golden test로 "행 수, 금액 파싱, 날짜 파싱, 출처 URL, 경고"를 고정한다.

### Phase 2: evidence store

1. 원본 HTML/첨부파일은 `content_sha256` 또는 `file_sha256` 기준으로 중복 제거한다.
2. 원본 저장 경로와 파싱 산출물 경로를 분리한다.
3. 모든 정규화 row는 `source_snapshot_id` 또는 `source_document_id`를 가진다.
4. MCP 응답에는 원본 파일 전체를 바로 노출하지 않고, 제목/해시/출처/요약과 필요한 근거 문장만 반환한다.

### Phase 3: KVIC/KVCA import adapter

1. `import_kvic_snapshot`: 저장 HTML 또는 CSV/XLS를 받아 펀드 목록과 카테고리를 정규화한다.
   - `ASCT_CLSS_GRP_CD_FND`, `ASCT_CLSS_CD_FND`, 대분류명, 소분류명을 함께 저장한다.
   - 대분류와 소분류 prefix가 다를 수 있으므로 문자열 prefix 규칙으로 추론하지 않는다.
2. `import_kvca_snapshot`: 조합현황 목록 HTML 또는 CSV/XLS를 받아 조합 목록을 정규화한다.
3. `import_kvca_detail_snapshot`: 조합 상세 HTML을 받아 대표펀드매니저, 모태출자 여부, 투자분야, 결성약정총액을 보강한다.
4. 운용사명은 `vc_operator_aliases`로 정규화한다. 예: `스마일게이트인베스트먼트`, `스마일게이트 Investment` 같은 변형.

### Phase 4: 첨부 문서 파싱 adapter

1. PDF는 text layer 추출을 먼저 시도하고, 텍스트가 빈약하면 `needs_ocr` 경고만 남긴다.
2. HWPX는 ZIP/XML 기반으로 직접 텍스트와 표를 추출한다.
3. HWP binary는 직접 포맷 추측 구현을 하지 않는다. 로컬 설치형 변환기, kordoc류 파서, 한컴 SDK 같은 adapter 뒤로 격리한다.
4. 문서 파싱 결과에서 `신규 결성`, `출자`, `조합명`, `결성총액`, `운용사`, `등록일`, `만기일`, `투자분야` 패턴을 event candidate로 만든다.
5. confidence가 낮은 추출은 자동 확정하지 않고 `review_required`로 표시한다.

### Phase 4.5: 창업자 가이드 코퍼스

1. `import_founder_guide_document`로 투자유치/TIPS/IR/데이터룸/투자계약 안내 PDF와 HWPX를 import한다.
2. 공시 문서와 guide 문서를 분리한다. guide 문서는 `document_role`을 `founder_education`, `program_guide`, `legal_guide`, `template`, `meeting_prep` 등으로 둔다.
3. 텍스트를 heading 단위 chunk로 나누고, 각 chunk에 `startup_stage`, `topic`, `trust_level`, `source_url`, `file_sha256`을 연결한다.
4. 자주 묻는 질문은 `fundraising_concepts`와 `guidance_cards`로 승격한다. 예: `리드 투자자`, `텀시트`, `TIPS 추천`, `데이터룸`, `프리머니/포스트머니`.
5. 답변 생성 시 `공식 근거`, `일반 가이드`, `사용자 노트`를 분리해서 표시한다.
6. 긴 PDF 원문을 그대로 출력하지 않고, 요약과 체크리스트 중심으로 반환한다.

### Phase 5: 신규 정보 감지와 diff

1. 이전 snapshot과 새 snapshot을 비교해 신규 조합, 결성총액 변경, 만기일 변경, 모태출자 여부 변경을 감지한다.
2. 첨부 문서 이벤트는 같은 `fund_name + operator_name + event_date` 기준으로 중복 제거한다.
3. 변경 알림은 `event_type`, `why_it_matters`, `official_evidence`, `next_action` 네 필드로 요약한다.
4. Seed/Pre-A 딜소싱에서는 "최근 결성 + 투자분야 일치 + 만기 여유 + 투자 집행 여력"을 상위 신호로 둔다.

### Phase 6: MCP/CLI 표면

1. 로컬 MCP: `import_*`, `parse_*_file`, `lookup_vc_fund_holdings`, `search_funds_for_startup`, `list_new_fund_events`, `search_founder_knowledge`를 제공한다.
2. 원격 MCP: 서버 파일 경로를 받는 도구는 제외하고, 이미 업로드/import된 `snapshot_id`/`document_id` 기반 조회만 제공한다.
3. CLI: 반복 import와 검증에 집중한다. 예: `vc-funds import kvca --file ...`, `vc-funds events --since 2026-01-01`.
4. Skill: 사람이 직접 KVIC/KVCA에서 내려받은 파일을 어떻게 준비해야 하는지 안내한다.

CLI 초안:

```bash
brew install moonklabs/tap/vc-funds
vc-funds setup --client claude --db auto
vc-funds doctor
vc-funds import kvic --file ./snapshots/fundfinder-AA02.html --group AA --code AA02
vc-funds import kvca --file ./snapshots/kvca-sparklabs.html
vc-funds import document --file ./disclosures/new-fund.hwpx --source kvca
vc-funds import guide --file ./guides/seed-fundraising-guide.pdf --role founder_education
vc-funds watch ~/Downloads/vc-disclosures --source local-folder
vc-funds diff --since 2026-01-01
vc-funds query investor "스파크랩"
vc-funds query funds --stage seed --sector "AI, SaaS, API"
vc-funds ask "처음 투자유치할 때 피치덱 말고 뭘 준비해야 해?"
```

MCP 사용 예:

- "스파크랩이 지금 Seed/Pre-A에 쓸 수 있는 펀드 근거가 있는지 조회해줘."
- "최근 90일 내 신규 결성/변경 공시 중 AI/SaaS 관련 후보만 보여줘."
- "뭉클랩 관점에서 TIPS 연계 가능성이 있는 운영사와 공식 펀드 근거를 같이 보여줘."
- "이 VC 미팅 전에 근거 pack을 만들어줘. 원본 해시와 caveat도 포함해."
- "투자를 처음 받는 창업자 기준으로 Seed 라운드 준비 체크리스트를 만들어줘."
- "텀시트와 투자계약서에서 초보 창업자가 놓치기 쉬운 용어를 설명해줘."

### Phase 7: 검증과 운영 가드

1. fixture test: HTML 구조 변경, 금액 단위, 날짜 형식, 빈 필드, 여러 운용사명 케이스.
2. privacy test: 이메일/전화/휴대전화가 기본 응답에 노출되지 않는지 확인한다.
3. regression test: 뭉클랩 Seed/Pre-A 샘플 프로필로 후보 펀드와 caveat가 일관되게 나오는지 확인한다.
4. parser warning이 있으면 MCP가 확정적 표현을 쓰지 않도록 한다.
5. guide answer test: 같은 초보 창업자 질문에 대해 source document, caveat, next action이 포함되는지 확인한다.
6. copyright guard test: PDF 원문을 과도하게 그대로 출력하지 않는지 확인한다.

### Phase 8: 공식 허가 후 scheduled fetcher

1. 공식 허가, 제휴, 데이터 제공 계약이 확인되면 fetcher를 별도 모듈로 추가한다.
2. robots/약관 허용 범위, rate limit, 사용자 agent, 문의처, 장애 시 중단 조건을 설정값으로 둔다.
3. fetcher는 import pipeline만 호출한다. DB schema와 MCP tool surface는 바꾸지 않는다.

## 남은 리스크

- robots 정책 때문에 무허가 자동 수집은 제품화하지 않는다.
- HTML 구조 변경에 취약하므로 parser fixture 테스트가 필요하다.
- PDF/HWP 문서는 표 구조와 스캔 품질이 제각각이므로 extraction quality와 원본 확인 경로를 항상 남긴다.
- 가이드 PDF는 최신성/저작권/법률 해석 리스크가 있다. 출처, import 일자, license note, 전문가 검토 필요 문구를 함께 남긴다.
- KVIC와 KVCA의 범위가 다르다. KVCA DIVA는 벤처투자조합 중심이며, 개인투자조합, 신기사, PEF 등은 누락될 수 있다.
- KVIC의 투자금액은 FundFinder 화면 기준의 주목적/투자가능성 판단용이며 실제 투자 가능 확정값이 아니다.

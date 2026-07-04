# 한국 VC 펀드 보유 현황 조회 소스

한국 VC/AC 투자자 소싱에서는 "이 투자자가 우리 섹터/단계에 맞는 펀드를 실제로 보유하고 있는가"를 반드시 확인한다. 공식 공시/출자 정보를 먼저 보고, THE VC/뉴스/웹 검색은 보강 근거로 쓴다.

## 1. KVIC FundFinder

- 링크: http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd
- 제공 주체: 한국벤처투자(KVIC), 모태펀드 출자 펀드 탐색
- 용도: 회사의 설립연차와 사업 분야에 맞는 모태펀드 출자 펀드를 찾고, 해당 펀드를 운용하는 VC/AC를 초기 타겟으로 추린다.

### 사용 절차

1. 링크 접속 후 `시작하기`를 클릭한다.
2. 회사의 사업 현황에 맞춰 `설립연차`와 `사업 분야`에 맞는 펀드 카테고리를 선택한다.
3. 펀드별 `결성일`, `결성총액`, `투자 집행액`을 확인한다.
4. 결성총액 대비 투자 집행액이 낮고, 결성일이 너무 오래되지 않은 펀드를 우선 후보로 본다.
5. 해당 펀드의 운용사(VC/AC)를 투자자 리스트에 추가하고, 섹터/단계/체크사이즈/지역 적합도를 별도로 평가한다.

### 조건 파라미터

FundFinder는 지정된 코드값으로 조회한다. 자연어 조건을 바로 검색하지 말고 [KVIC FundFinder 파라미터 카탈로그](kvic-fundfinder-parameter-catalog.md)를 먼저 참조해 `ASCT_CLSS_GRP_CD_FND`와 `ASCT_CLSS_CD_FND` 후보를 고른다.

| 파라미터 | 예시 | 의미 |
|---|---|---|
| `ASCT_CLSS_GRP_CD_FND` | `AA` | 대분류 코드. 예: 창업초기 펀드 |
| `ASCT_CLSS_CD_FND` | `AA02` | 소분류 코드. 예: 초기기업 |

Seed/Pre-A 기본 조회는 `AA02`(초기기업), `DA01`(4차산업혁명), `EA01`(일반)을 우선 보고, 회사 특성에 따라 `AA01`(대학창업), `DH01`(기술사업화), `DF01`(보건산업), 지역 코드 `CA01`~`CA10` 등을 추가한다.

### 추출 필드

| 필드 | 사용 목적 |
|---|---|
| 펀드명 | 아웃리치/리서치 출처 |
| 운용사 | VC/AC 후보 |
| 주력 투자 분야 | 섹터 적합도 |
| 결성일 | dry powder 가능성 추정 |
| 결성총액 | 펀드 규모와 체크사이즈 추정 |
| 투자 집행액 | 잔여 투자 여력 추정 |
| 모태펀드 출자 여부 | 정부 출자 펀드 제약 확인 |

## 2. KVCA DIVA 항목별공시

- 링크: http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq
- 제공 주체: 한국벤처캐피탈협회(KVCA)
- 용도: VC명 기준으로 보유 벤처투자조합 현황을 확인한다.

### 사용 절차

1. 링크 접속 후 홈페이지 중앙 상단의 `항목별공시`를 클릭한다.
2. 좌측 세부 메뉴에서 `조합현황`을 클릭한다.
3. `조합현황` 메뉴에서 VC명을 검색한다.
4. VC별 보유 펀드/조합을 확인하고, 결성일/규모/상태를 리서치 리포트에 반영한다.

### 한계

- 벤처투자조합 중심으로 조회된다.
- 개인투자조합, 신기술사업투자조합, PEF 등은 검색되지 않을 수 있다.
- 따라서 실제 VC의 전체 펀드 보유 현황과 차이가 있을 수 있다.
- KVCA 결과는 "공식 벤처투자조합 확인"으로 쓰고, 누락 가능성은 리포트에 명시한다.

## 리서치 적용 규칙

- 한국 VC를 다룰 때는 THE VC/뉴스만으로 판단하지 말고, 가능한 경우 KVIC 또는 KVCA 중 하나 이상을 확인한다.
- KVIC는 "우리 회사 조건에 맞는 펀드/운용사 찾기"에 강하다.
- KVCA DIVA는 "특정 VC가 보유한 벤처투자조합 확인"에 강하다.
- 두 출처 모두 실제 투자 가능성을 보장하지 않는다. 최종 판단은 최근 투자, 포트폴리오, 파트너 thesis, 펀드 잔여 여력, 네트워크 접근 가능성을 함께 본다.
- 리포트에는 `공식 펀드 근거`, `추정 dry powder`, `한계/주의`를 별도 표기한다.

## 자동화 검증 메모

검증일: 2026-07-04

- KVIC FundFinder는 브라우저 User-Agent로 `GET /rsh/rsh/RshMacFndInq` 접근 시 카테고리 화면이 HTML로 내려온다.
- KVIC 카테고리 목록은 `POST /rsh/rsh/RshMacFndLstInq`에 `ASCT_CLSS_GRP_CD_FND=AA` 같은 카테고리 코드를 보내면 HTML 테이블로 조회된다.
- KVIC FundFinder 목록 화면은 `ASCT_CLSS_CD_FND=AA02` 같은 소분류 코드도 사용한다. 대분류만 보내면 첫 소분류가 기본 선택될 수 있으므로 정확한 조건 재현에는 대분류와 소분류를 함께 저장한다.
- KVCA DIVA 조합현황은 `GET/POST /div/dii/DivItmAssoInq`에서 HTML 테이블로 조회된다. `S_OPER_INST_NM`으로 VC명 검색이 가능하다.
- KVCA DIVA는 목록 row의 `ASCT_ID`로 `POST /div/cmn/DivCreatStatInq/pop1` 상세 조회가 가능하고, `OPER_INST_ID`로 `POST /div/cmn/DivCmnComInfo/pop1` 운용사 상세 조회가 가능하다.
- 두 사이트 모두 `robots.txt`가 `User-agent: *` 및 `Disallow: /`를 반환한다. 따라서 허가 없는 주기적 크롤링/대량 스크래핑은 하지 않는다.

## MCP/DB화 권장 경계

- 추천: 공식 허가 또는 사용자가 직접 확보한 HTML/CSV/XLS 스냅샷을 MCP가 import하여 정규화한다.
- 추천: MCP는 `fund_evidence` 조회, VC별 조합 검색, KVIC 카테고리별 후보 추출, DIVA 상세 대사 같은 내부 검색/분석을 제공한다.
- 추천: 개인용 로컬 DB에 `watch_folder_import`와 `browser_capture_import`를 제공해 사용자가 저장한 자료를 자동 import/diff한다.
- 보류: 사이트를 주기적으로 자동 순회하는 crawler, 무제한 pagination 수집, robots 정책을 무시하는 scrape job.
- 개인정보 주의: 담당자명, 전화번호, 이메일, 휴대전화, 공시담당자 정보는 기본 DB/리포트에서 저장하지 않거나 마스킹한다. 투자자 소싱에는 운용사명, 펀드명, 결성일, 결성총액, 만기일, 투자분야, 모태출자 여부 중심으로 충분하다.

### 개인용 자동 수집 설계

사용자가 개인적으로 데이터를 축적해 나중에 조회하려면 `deal-sourcing` 스킬 내부에 임시 로직을 넣기보다 별도 데이터조회 MCP를 둔다.

| 모드 | 사용 방식 | 허용 여부 |
|---|---|---|
| `manual_snapshot_import` | 사용자가 저장한 HTML/CSV/XLS를 import | 기본 허용 |
| `watch_folder_import` | 지정 폴더에 저장된 PDF/HWPX/HTML을 자동 감지해 import | 기본 허용 |
| `browser_capture_import` | 사용자가 보고 있는 페이지를 snapshot으로 저장 후 import | 사용자 제스처 기반 허용 |
| `official_feed_fetch` | 공식 API/허가/유료 계약 기반 fetch | 근거 확인 후 허용 |
| `site_background_crawler` | 사이트 전체를 주기적으로 순회 | 초기 금지 |

MCP가 제공해야 하는 핵심 조회:

- `query_investor_profile`: 투자사명 기준 보유 펀드, TIPS 운영사 여부, 최근 공시 이벤트 조회
- `lookup_vc_fund_holdings`: KVCA/KVIC 근거를 분리해 조합/펀드 보유 현황 조회
- `search_funds_for_startup`: 회사 단계, 섹터, 지역, FundFinder 조건 코드로 적합 펀드 검색
- `list_new_fund_events`: 신규 결성, 결성총액 변경, 만기일 변경, 투자분야 변경 이벤트 조회
- `export_fund_evidence_pack`: 미팅 전 공식 근거, 해시, caveat를 묶은 리포트 생성

## 신규 공시/첨부파일 처리 규칙

신규 펀드 결성, 조합 변경, 운용사 공시처럼 표 데이터 밖에 있는 정보는 PDF/HWP/HWPX 첨부파일로 제공될 수 있다. 이 경우 schoolinfo-mcp와 같은 "원본 파일 보관 + 문서 파싱 + 구조화 추출" 패턴을 적용한다.

1. 원본 파일을 먼저 보관한다.
   - `source_url`, `published_date`, `file_name`, `file_type`, `sha256`, `imported_at`을 저장한다.
   - 원본과 파싱 결과를 같은 필드에 섞지 않는다.
2. 문서를 텍스트/마크다운/표로 변환한다.
   - PDF는 text layer 추출을 먼저 시도한다.
   - HWPX는 ZIP/XML 구조에서 직접 추출한다.
   - HWP binary는 추측 구현하지 않고 로컬 변환기, kordoc류 파서, 한컴 SDK 같은 별도 adapter로 격리한다.
3. 투자 판단 이벤트를 추출한다.
   - `신규 결성`, `조합명`, `운용사`, `결성총액`, `등록일`, `만기일`, `투자분야`, `모태출자 여부`를 후보 필드로 본다.
   - 추출 confidence가 낮으면 `review_required`로 표시한다.
4. 리포트에는 반드시 공식 근거를 붙인다.
   - "신규 펀드 결성 신호"를 보여줄 때 원본 공시 제목, 파일명, 해시, 출처 URL, 파싱 경고를 함께 둔다.
   - 개인 연락처나 공시 담당자 정보는 기본 출력에서 마스킹한다.
5. 자동 알림은 diff 기반으로 만든다.
   - 이전 snapshot과 새 snapshot을 비교해 신규 조합, 결성총액 변경, 만기일 변경, 투자분야 변경을 감지한다.
   - 허가 없는 주기적 수집은 하지 않고, 사용자가 확보한 snapshot/import 또는 공식 허가된 feed에서만 알림을 생성한다.

### MCP tool 설계 메모

- 로컬 MCP: 사용자의 로컬 파일 경로를 받는 `import_disclosure_document`, `parse_disclosure_file` 도구를 제공할 수 있다.
- 로컬 MCP: `configure_collection_source`, `run_personal_collection`, `get_collection_health`로 개인 수집 상태를 관리한다.
- 원격 MCP: 서버 파일시스템 접근 도구를 노출하지 않고, 이미 import된 `document_id` 기반 조회만 제공한다.
- 공통 조회: `lookup_vc_fund_holdings`, `search_funds_for_startup`, `list_new_fund_events`, `export_fund_evidence_pack`를 제공한다.

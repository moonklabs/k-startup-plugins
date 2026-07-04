# Schoolinfo-MCP Business Problem and Architecture Analysis

상태: Draft analysis.

참조: [chrisryugj/schoolinfo-mcp](https://github.com/chrisryugj/schoolinfo-mcp)

이 문서는 `schoolinfo-mcp` README가 어떻게 비즈니스 문제를 정의하고, 그 문제를 MCP/CLI/웹앱 아키텍처로 해소하는지 분석합니다. 목표는 VC Funds MCP가 단순한 "공시 데이터 저장소"가 아니라, 스타트업 창업자의 투자자 탐색 문제를 정확히 해결하는 제품 구조를 갖게 하는 것입니다.

## 1. README가 잡은 핵심 비즈니스 문제

`schoolinfo-mcp`의 문제 정의는 단순합니다.

1. 데이터는 이미 공개되어 있다.
2. 그러나 사용자는 어디에 있는지 모른다.
3. 특히 가장 중요한 정보는 첨부파일 안에 숨어 있다.
4. 사용자는 코드, 공시 항목명, 파일 경로, 학교 식별자를 알고 싶어 하지 않는다.
5. 사용자는 자기 맥락의 질문을 하고, 바로 비교/판단 가능한 표를 원한다.

이 문제 정의가 강한 이유는 "데이터 부족"을 문제가 아니라 "탐색 비용과 구조화 비용"을 문제로 본다는 점입니다.

## 2. 문제별 아키텍처 해법

| 비즈니스 문제 | README의 제품 약속 | 아키텍처 해법 |
|---|---|---|
| 공시 데이터는 있는데 찾기 어렵다 | 학교명만으로 찾는다 | `find_school`, `search_school`, 지역/학교급/학교명 해석 layer |
| 사용자가 코드를 모른다 | 공시 항목명을 자연어로 입력한다 | 코드 매핑, 항목명 fuzzy match, 모호하면 후보 목록 반환 |
| 핵심 정보가 HWP/PDF 첨부에 숨어 있다 | 수행평가 계획을 표로 풀어준다 | 첨부 목록 조회, 파일 다운로드, HWP/PDF parser, 구조화 추출 |
| 사용자가 설치/키 발급을 싫어한다 | 웹앱/원격 MCP는 URL만 연결한다 | 서버가 API key를 보유하고 stateless Streamable HTTP MCP 제공 |
| 파워유저는 직접 자동화하고 싶다 | CLI/로컬 MCP도 제공한다 | 같은 core를 CLI와 stdio MCP에서 재사용 |
| 원격 서버가 로컬 파일을 읽으면 위험하다 | 받은 파일 파싱은 로컬에서만 한다 | `localFiles=false`일 때 file parse tool 미등록 |
| 사용자는 결과를 판단해야 한다 | 학교 비교, 이번주, 수행평가 표 제공 | formatter/report layer가 표, digest, 비교 리포트 생성 |

핵심은 각 문제마다 대응하는 모듈이 있다는 점입니다. README가 말하는 약속이 곧 코드 구조가 됩니다.

## 3. Schoolinfo-MCP 구조에서 배워야 할 점

### 3.1 "검색하지 말고 물어보는" 인터페이스

사용자에게 내부 API, 공시 코드, 파일 확장자를 노출하지 않습니다. 학교명 또는 자연어 질문으로 시작하고, 내부에서 식별자와 항목을 해석합니다.

VC Funds 적용:

- 창업자는 `ASCT_CLSS_CD_FND`, `S_OPER_INST_NM`, `ASCT_ID`를 몰라도 됩니다.
- "AI SaaS Seed/Pre-A에 맞는 VC"라고 물으면 MCP가 FundFinder 코드 후보, KVCA 운용사명, TIPS 신호, 신규 공시를 내부에서 조회해야 합니다.

### 3.2 정형 API와 첨부 문서 parser의 결합

Schoolinfo는 OpenAPI 정형 데이터만으로는 핵심 문제를 못 풉니다. 수행평가 계획이 첨부파일에 있기 때문입니다. 그래서 정형 조회와 문서 파싱을 하나의 제품 경험으로 묶습니다.

VC Funds 적용:

- KVIC/KVCA 표 데이터만으로는 부족합니다.
- 신규 펀드 결성, 조합 변경, 운용사 공시는 PDF/HWP/HWPX 첨부 또는 별도 문서에 있을 수 있습니다.
- 따라서 `funds`, `kvca_associations`만이 아니라 `documents`, `document_chunks`, `events`, `review_queue`가 필수입니다.

### 3.3 같은 core, 여러 표면

Schoolinfo는 웹앱, 원격 MCP, 로컬 MCP, CLI가 같은 문제를 다른 접근성으로 풉니다. 사용자는 비개발자부터 파워유저까지 넓고, 표면만 달라집니다.

VC Funds 적용:

| 사용자 | 표면 | 목적 |
|---|---|---|
| 초보 창업자 | MCP natural language | "어떤 VC를 만나야 하나" 질문 |
| 운영자/파워유저 | CLI | snapshot import, watch, diff, doctor |
| 투자유치 담당자 | report/export | 미팅 전 evidence pack 생성 |
| 향후 팀/웹 사용자 | HTTP MCP/web | 이미 import된 DB 조회 |

### 3.4 transport와 tool registration 분리

Schoolinfo의 `buildMcpServer()`는 transport에 묶이지 않고 tool을 등록합니다. stdio와 HTTP는 같은 tool 정의를 공유하되, local file 접근 가능 여부만 옵션으로 분기합니다.

VC Funds 적용:

```ts
buildMcpServer({
  dbPath,
  localFiles: true,
  readonly: false
})
```

- local stdio: 파일 import 도구 ON.
- remote HTTP: 파일 경로 도구 OFF, query-only.
- readonly stdio: 팀 공유/데모용으로 import OFF.

### 3.5 안전한 실패와 후보 제시

Schoolinfo는 학교가 여러 개면 정확한 이름을 요구하고, 항목이 모호하면 후보를 보여줍니다. "틀린 답"보다 "후보/한계"를 보여주는 쪽입니다.

VC Funds 적용:

- 투자사명이 모호하면 alias 후보를 보여줍니다.
- FundFinder 단독 근거이면 KVCA 대사 필요를 표시합니다.
- parser warning이 있으면 `official_needs_review`로 내려야 합니다.
- 결과가 없으면 `no_evidence`와 required import를 반환해야 합니다.

## 4. VC Funds의 대응 문제 정의

VC Funds README/소개는 아래 문제를 앞에 둬야 합니다.

```text
한국 스타트업은 투자자를 찾을 때 VC/AC가 실제로 어떤 펀드와 조합을 보유하는지 확인해야 하지만, 근거는 KVIC, KVCA, TIPS, 신규 공시 문서, PDF/HWPX 가이드에 흩어져 있다. 창업자는 사이트 경로, 조회 파라미터, 조합 유형, 첨부파일 파싱 방법을 모른다. VC Funds는 이 흩어진 공식 근거와 가이드를 로컬 DB에 축적하고, 자연어 질문으로 검색해 근거 상태와 다음 액션을 보여준다.
```

이 문장은 제품의 방향을 결정합니다.

| VC Funds 문제 | 필요한 아키텍처 |
|---|---|
| 공시 근거가 여러 기관에 흩어짐 | source registry + source-specific import adapter |
| 자연어 조건이 직접 사이트 파라미터가 아님 | intent extraction + FundFinder parameter catalog |
| VC명 표기가 흔들림 | investor alias normalization |
| 표 데이터만으로 투자 가능성을 확정할 수 없음 | KVIC/KVCA/TIPS/documents/user notes 분리 evidence model |
| 신규 정보가 첨부 문서에 숨어 있음 | document parser + event extraction + review queue |
| 사용자는 "왜 추천됐는지"를 원함 | ranking model + explain_search_result |
| 데이터가 없을 수 있음 | list_data_gaps + recommended imports |
| 개인용 로컬 수집이 필요함 | local stdio MCP + watch folder + browser capture |
| 원격/공개 MCP는 보안 경계가 필요함 | localFiles=false + query-only remote tools |

## 5. README 구조 제안

VC Funds 실제 구현 레포의 README는 아래 순서가 좋습니다.

1. 한 줄 문제/약속
   - "투자자 찾기, 검색하지 말고 근거로 물어보세요."
2. 왜 필요한가
   - KVIC/KVCA/TIPS/공시 문서/창업자 가이드가 흩어져 있음.
3. 무엇을 해주는가
   - 투자사 프로필, 적합 펀드 검색, 신규 펀드 이벤트, evidence pack, data gaps.
4. 가장 쉬운 사용법
   - `vc-funds setup`, MCP 설정, 자연어 프롬프트.
5. CLI 예시
   - 실제 명령과 markdown 표 출력.
6. MCP 도구 목록
   - query tools, local import tools, quality tools.
7. 아키텍처
   - source registry -> importers -> SQLite -> retrieval/ranker -> CLI/MCP/report.
8. 보안/정책
   - no crawler, local file tools only local, PII redaction, source hash.
9. 한계
   - KVCA 범위, FundFinder 단독 근거, parser warnings, 공식 허가 전 scheduled fetch OFF.

## 6. VC Funds에서 꼭 지켜야 할 제품 원칙

1. 사용자가 사이트 경로와 코드를 몰라도 물을 수 있어야 합니다.
2. 검색 결과는 "추천"이 아니라 "근거가 있는 후보"여야 합니다.
3. 검색 전에 사용자 입력을 exact/alias/ambiguous/no_match로 resolve해야 합니다.
4. 모든 결과에는 `resolution_status`, `evidence_status`, `source_trust_tier`, `why_ranked`가 있어야 합니다.
5. 공식 근거, 창업자 guide, 사용자 note는 섞지 않습니다.
6. 첨부 문서 파싱은 원본 hash와 parser warning을 반드시 남깁니다.
7. 결과가 없을 때도 실패가 아니라 "어떤 snapshot/document를 import해야 하는지"를 알려줘야 합니다.
8. CLI와 MCP가 서로 다른 판단을 하면 안 됩니다. 같은 retrieval/ranker core를 사용해야 합니다.
9. local-only 파일 도구와 future remote query-only 도구를 설계 단계부터 분리해야 합니다.

## 7. 아키텍처 적합성 체크리스트

아래 질문에 모두 YES가 아니면 README의 문제 해결 약속과 아키텍처가 어긋난 것입니다.

| 질문 | YES 기준 |
|---|---|
| 창업자가 FundFinder/KVCA 파라미터를 몰라도 검색 가능한가? | 자연어 search가 intent와 code 후보를 내부 생성 |
| 사용자 입력이 정확히 해석됐는가? | `resolve_user_input` 결과와 후보/점수/ambiguity가 저장됨 |
| source가 질문 유형에 대해 authoritative한가? | `source_trust_tier`와 `authority_scope`가 표시됨 |
| 추천 결과마다 공식 근거가 붙는가? | source URL, hash, import time, parser warning 포함 |
| 공식 근거가 없을 때 솔직히 말하는가? | `no_evidence` 또는 `official_needs_review` |
| 첨부 문서 속 신규 펀드 정보를 다룰 수 있는가? | document parser와 event extraction 존재 |
| 로컬 파일 import가 원격 MCP에 노출되지 않는가? | `localFiles=false` 분기 |
| CLI와 MCP가 같은 결과를 내는가? | shared core retrieval/ranker |
| 사용자가 다음 액션을 알 수 있는가? | data gaps와 recommended imports 포함 |

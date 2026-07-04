---
name: deal-sourcing
description: VC, AC, 엔젤, CVC 등 투자자 소싱 방법론과 데이터 소스를 안내합니다. 한국 VC는 KVIC FundFinder, 모태펀드 출자 펀드, KVCA DIVA 조합현황으로 공식 펀드 근거와 보유 조합을 확인하고, Seed/Pre-A 후보를 단계별 미팅 전략으로 정렬합니다. "투자자 찾기", "VC 리스트", "AC 프로그램 찾기", "딜소싱", "투자자 소싱", "VC 발굴", "모태펀드", "KVIC", "KVCA", "조합현황", "신규 펀드", "Seed VC", "Pre-A VC", "[섹터] 투자자", "[단계] VC" 등으로 실행합니다.
---

# 딜소싱 (Deal Sourcing)

신규 VC, AC, 엔젤, CVC 투자자를 체계적으로 발굴하고, thesis 적합도를 평가하며, 접근 경로를 매핑하는 방법론입니다. 이 스킬은 웹 검색만으로도 항상 작동하며, 한국 VC는 공식 펀드 근거(KVIC/KVCA)를 웹/뉴스 근거와 분리해 확인합니다.

## 작동 방식

```
┌─────────────────────────────────────────────────────────────────┐
│                       DEAL SOURCING                              │
├─────────────────────────────────────────────────────────────────┤
│  기본 기능 (웹 검색으로 단독 작동)                                 │
│  ✓ 투자자 유형별 소싱 전략 (VC/AC/엔젤/CVC)                       │
│  ✓ 10-query 웹 검색 패턴: thesis, 포트폴리오, 투자 이력          │
│  ✓ 한국 VC 공식 펀드 확인: KVIC FundFinder, KVCA DIVA 조합현황   │
│  ✓ Seed/Pre-A 단계별 미팅 전략: 연습 → 투자 가능성 검증 → 리드 클로징 │
│  ✓ Thesis 매칭 프레임워크: 섹터·단계·체크·지역 4차원 평가         │
│  ✓ 접근 경로 매핑: 웜인트로/콜드/AC지원                           │
├─────────────────────────────────────────────────────────────────┤
│  강화 모드 (도구 연결 시)                                         │
│  + ~~fund disclosure: 로컬 공시 DB에서 VC/AC 보유 펀드 근거 조회 │
│  + ~~data enrichment: THE VC, 혁신의숲, OpenDART 전문 데이터     │
│  + ~~CRM: 기존 투자자 네트워크, 인트로 경로 자동 매핑              │
│  + ~~knowledge base: 팀 문서에서 커넥션, 인트로 이력 검색          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 시작하기

투자자 소싱이 필요한 상황에서 자동으로 활성화됩니다:

- "fintech series A 투자자 찾아줘"
- "한국에서 SaaS seed 투자하는 VC 리스트"
- "Y Combinator 같은 AC 프로그램 있어?"
- "우리 포트폴리오에 투자한 VC 중 다른 투자자 추천해줘"

즉시 웹 검색을 실행하고, ~~data enrichment가 연결되어 있으면 해당 데이터도 가져옵니다.

---

## 참고 자료 로딩 규칙

필요한 경우에만 아래 reference를 읽습니다.

| 상황 | 읽을 reference |
|---|---|
| 한국 VC/AC 공식 펀드 근거가 필요함 | [한국 VC 펀드 보유 현황 조회 소스](references/korea-vc-fund-disclosure-sources.md) |
| FundFinder 조건 코드를 골라야 함 | [KVIC FundFinder 파라미터 카탈로그](references/kvic-fundfinder-parameter-catalog.md) |
| TIPS 운영사/추천 가능성/펀드 목적을 함께 판단해야 함 | [Korea TIPS Investor-Led Process](references/korea-tips-investor-led-process.md) |
| Seed/Pre-A 샘플 실행 또는 MoonkLabs류 API/MCP 스타트업 전략이 필요함 | [MoonkLabs Seed/Pre-A Fundraising Playbook](references/moonklabs-seed-prea-fundraising-playbook.md) |

---

## 커넥터 (선택사항)

도구를 연결하여 이 스킬을 강화하세요:

| 커넥터 | 추가 기능 |
|--------|----------|
| **VC/AC 공시 데이터** | 로컬 `vc-fund-disclosure-mcp`가 있을 때 KVIC/KVCA snapshot, 신규 공시, TIPS 운영사/펀드 근거를 조회 |
| **데이터 보강** | THE VC (투자 라운드·포트폴리오), 혁신의숲 (성장 지표), OpenDART (상장사 공시) — 웹 검색 기반, OpenDART는 MCP 연결 가능 |
| **CRM** | 기존 투자자 네트워크 분석, 인트로 경로 자동 매핑 |
| **지식 베이스** | Notion, Google Drive — 팀의 인트로 이력, 커넥션 DB 검색 |

> **커넥터가 없나요?** 문제없습니다. 웹 검색만으로도 충실한 투자자 리스트와 접근 전략을 제공합니다.

---

## 출력 형식

```markdown
# 딜소싱 리포트: [검색 조건]

**검색 기준:**
- 섹터: [섹터]
- 단계: [단계]
- 지역: [지역]
- 체크사이즈: $[X]-[X]

**발굴 투자자 수:** [X]개 펀드/프로그램

---

## 투자자 유형별 결과

### VC (Venture Capital) — [X]개

| VC 펀드 | Thesis 적합도 | 공식 펀드 근거 | 체크사이즈 | 접근 경로 |
|---------|-------------|----------------|-----------|----------|
| [펀드명] | ⭐⭐⭐ HIGH | KVIC/KVCA 확인 | $[X]-[X] | [웜인트로/콜드] |
| [펀드명] | ⭐⭐ MEDIUM | 뉴스/THE VC/미확인 | $[X]-[X] | [콜드] |

### AC (Accelerator) — [X]개

| 프로그램/운영사 | TIPS 운영사 | 접수 경로 | 펀드 목적 적합도 | 적합도 |
|---------|----------|----------|----------------|--------|
| [운영사명] | 확인 | [공식 접수처/웜인트로] | [KVIC/KVCA 근거] | HIGH |

### 엔젤 투자자 — [X]명

| 이름 | 배경 | 투자 이력 | 접근 경로 |
|------|------|----------|----------|
| [이름] | [전 CEO @ 회사] | [섹터, X건] | [LinkedIn 2촌] |

### CVC (Corporate VC) — [X]개

| 모기업 | CVC 펀드 | 섹터 초점 | 접근 경로 |
|--------|---------|----------|----------|
| [회사명] | [펀드명] | [섹터] | [콜드/파트너십] |

---

## 최우선 타겟 상세 (적합도 HIGH)

### [VC 펀드명]
**Thesis 적합도:** ⭐⭐⭐ HIGH

| 차원 | 평가 |
|------|------|
| 섹터 | 🟢 MATCH — [thesis 명시, 포트폴리오 3개 기업] |
| 단계 | 🟢 MATCH — [seed/A/B] |
| 체크사이즈 | 🟢 MATCH — $[X]-[X] |
| 지역 | 🟢 MATCH — [지역] |
| 공식 근거 | 🟢 확인 — [KVIC FundFinder 조건 / KVCA ASCT_ID] |
| TIPS 연계 | 🟢/🟡/🔴 — [운영사 여부, 추천 가능성, 최근 TIPS 실적] |

**최근 투자:** [회사명] ($[X], [날짜])
**포트폴리오:** [회사1], [회사2], [회사3]
**주요 파트너:** [이름 — 직함 — LinkedIn]
**공식 펀드 현황:** [펀드명, 결성일, 결성총액, 투자 집행액, 만기일/잔여 기간]
**TIPS 판단:** [운영사 여부, 추천 가능성, 접수 경로, 최근 추천/선정 실적]

**접근 경로:**
1. 🔥 웜인트로: [포트폴리오 CEO] → [파트너]
2. 🔥 웜인트로: [기존 투자자] → [파트너]
3. 콜드: [이메일]

**Why Now:** [최근 펀드 조성/유사 투자/thesis 발표]
**주의:** [KVCA 누락 가능성, FundFinder 단독 근거 여부, 별도 조합 형태 확인 필요]

---

## 단계별 미팅 전략 출력

Seed/Pre-A 라운드에서는 후보 VC를 한 번에 모두 만나지 말고 다음 순서로 나눕니다.

| 단계 | 목적 | 대상 | 산출물 |
|---|---|---|---|
| 1단계: 연습과 메시지 검증 | 포지셔닝과 반박 수집 | 전략 적합은 있으나 최우선 리드는 아닌 VC/AC/CVC | objection log, pitch 수정 사항 |
| 2단계: 투자 가능성 검증 | check size, lead/follow 가능성, DD 기대치 확인 | thesis와 단계가 맞는 중상위 후보 | DD 요청 목록, 파트너 미팅 가능성 |
| 3단계: 리드 클로징 | term sheet 또는 리드 투자자 확보 | 가장 만나고 싶은 핵심 VC | 조건 협상, follow 투자자 구성 |

MoonkLabs처럼 API/MCP/운영 데이터 스타트업은 "API wrapper"가 아니라 "AI agent가 사용할 수 있는 한국 비즈니스 운영 데이터 계층"으로 설명합니다. Toss/PortOne/Inicis 같은 PG 매출·정산·결제상세 조회, 광고/analytics/CRM 데이터 집계를 초기 wedge로 제시합니다.

## 다음 단계

1. [ ] `/investor-outreach [VC명]` — 맞춤형 아웃리치 작성
2. [ ] `/lead-dashboard` 업데이트 — 신규 타겟 추가
3. [ ] 웜인트로 확보 — [투자자 X명]
4. [ ] AC 지원서 제출 — [프로그램명, 마감 [날짜]]
```

---

## 실행 흐름

### 1단계: 타겟 기준 명확화

사용자 요청을 분석하여 다음 기준을 명확히 합니다:

```
필수 기준:
- 섹터: [예: fintech, SaaS, healthcare, marketplace]
- 단계: [예: seed, series A, series B]

선택 기준:
- 지역: [예: Korea, US, SEA, Global]
- 체크사이즈: [예: $500K-$2M, $2M-$10M]
- 투자자 유형: [VC, AC, 엔젤, CVC, 전체]
```

**불명확한 경우:**
"어떤 단계의 투자자를 찾고 계신가요? (seed, series A, series B)"
"지역 선호도가 있나요? (한국, 미국, 동남아, 전세계)"

### 2단계: 데이터 소스 우선순위

```
1순위: 네트워크 (가장 효과적)
   - 기존 투자자에게 인트로 요청
   - 포트폴리오 기업 CEO/Founder에게 추천 요청
   - 어드바이저, 멘토 네트워크

2순위: 데이터베이스
   - ~~fund disclosure 연결 시: 로컬 공시 DB에서 투자사 프로필, 보유 펀드, 신규 공시 이벤트, TIPS 운영사 여부 조회
   - 한국 VC: KVIC FundFinder, KVCA DIVA 조합현황으로 보유 펀드 확인
   - TIPS: 운영사 여부, 접수처, 추천 가능성, 추천/선정 실적 확인
   - ~~data enrichment 연결 시: THE VC, 혁신의숲, OpenDART (웹 검색 기반)
   - 미연결 시: 웹 검색 (아래 10-query 패턴)

3순위: 역추적 소싱 (Reverse Sourcing)
   - 유사 스타트업에 투자한 VC 찾기
   - 포트폴리오 분석 → 다른 투자자 발굴

4순위: 이벤트 & 커뮤니티
   - Demo Day, Pitch Competition
   - VC 컨퍼런스, 업계 이벤트
   - LinkedIn, AngelList, ProductHunt

5순위: AC 프로그램 달력
   - Y Combinator, Techstars, 500 Global
   - 한국: SparkLabs, 블루포인트, 프라이머
   - 지원 마감일 추적
```

#### 한국 VC 공식 펀드 확인 루틴

한국 VC/AC를 찾을 때는 아래 두 출처를 먼저 확인합니다. 자세한 절차는 [한국 VC 펀드 보유 현황 조회 소스](references/korea-vc-fund-disclosure-sources.md)를 따릅니다. FundFinder 조건 조회는 [KVIC FundFinder 파라미터 카탈로그](references/kvic-fundfinder-parameter-catalog.md)를 기준으로 `ASCT_CLSS_GRP_CD_FND`와 `ASCT_CLSS_CD_FND`를 고릅니다. Seed-Pre-A 샘플 실행은 [MoonkLabs Seed/Pre-A Fundraising Playbook](references/moonklabs-seed-prea-fundraising-playbook.md)을 기준으로 회귀 검증합니다.

`~~fund disclosure` MCP가 연결되어 있으면 웹에서 매번 다시 찾기 전에 먼저 로컬 DB를 조회합니다. 이 MCP는 사용자가 직접 확보한 snapshot, watch folder import, browser capture import, 공식 허가된 feed만 근거로 삼고, 허가 없는 주기 크롤링 결과를 기본 근거로 쓰지 않습니다.

| 출처 | 링크 | 사용 목적 | 주의 |
|---|---|---|---|
| KVIC FundFinder | http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd | 모태펀드 출자 펀드 중 회사의 설립연차·사업 분야에 맞는 펀드와 운용사 찾기 | 모태펀드 출자 펀드 중심 |
| KVCA DIVA 항목별공시 | http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq | VC명으로 보유 벤처투자조합 현황 확인 | 개인투자조합, 신기사, PEF 등은 누락 가능 |

**추출 필드:**
- FundFinder 조회 조건: `ASCT_CLSS_GRP_CD_FND`, `ASCT_CLSS_CD_FND`, 대분류명, 소분류명
- KVCA DIVA 대사 키: `ASCT_ID`, 운용사명, 조합명, 등록일, 만기일
- 펀드명, 운용사, 주력 투자 분야
- 결성일, 결성총액, 투자 집행액
- 벤처투자조합 보유 여부
- 잔여 투자 여력(dry powder) 추정과 한계
- 신규 펀드 결성/조합 변경 공시가 PDF/HWP/HWPX/HWPML/Office 첨부파일로 제공되는 경우 원본 파일명, 출처 URL, 해시, `kordoc` parser warning

**판단 규칙:**
- Seed/Pre-A 기본 조회는 `AA02`(초기기업), `DA01`(4차산업혁명), `EA01`(일반)을 우선 후보로 둡니다.
- 대학창업/기술사업화/보건산업/지역/해외진출 같은 회사 특성이 있으면 해당 소분류 코드를 추가합니다.
- 결성일이 너무 오래됐고 투자 집행액이 높은 펀드는 신규 투자 여력이 낮을 수 있습니다.
- KVCA DIVA에 없다고 해서 펀드가 없다고 단정하지 않습니다. 개인투자조합, 신기술사업투자조합, PEF는 별도 확인이 필요합니다.
- 공식 펀드 데이터는 `Why Now`와 `체크사이즈` 판단에 반영하되, 최종 우선순위는 thesis 적합도와 접근 경로까지 함께 봅니다.
- 첨부 공시를 `kordoc` adapter로 파싱한 신규 정보는 항상 원본 공시 근거와 함께 제시합니다. 파싱 품질이 낮으면 "추정"이 아니라 `원본 확인 필요`로 표시합니다.

**출력 검증:**
- 한국 VC 리포트에는 FundFinder 조건 코드와 KVCA 대사 여부를 함께 남깁니다.
- KVCA에 없는 후보는 `미확인/보류`로 두고, 제외 이유를 단정하지 않습니다.
- Seed/Pre-A 요청에는 최종 후보 리스트와 별도로 1단계/2단계/3단계 미팅 순서를 제안합니다.

#### TIPS 운영사 적합성 루틴

TIPS는 창업자가 단순히 운영사를 지정해 지원하는 흐름으로 보지 않습니다. 운영사가 투자 대상으로 보고, 투자를 확약하고, 추천 가능 TO와 내부 기준을 충족해야 진행됩니다. 자세한 판단 기준은 [Korea TIPS Investor-Led Process](references/korea-tips-investor-led-process.md)를 따릅니다.

**반드시 분리해서 평가:**
- 투자 적합도: 섹터, 단계, 체크사이즈, 펀드 목적, 파트너 thesis
- TIPS 추천 가능성: 운영사 여부, 접수 경로, TO/내부 일정, 최근 추천/선정 실적
- R&D 적합성: 기술성, 개발 과제 명확성, 연구개발비 집행 가능성
- 관계 경로: 웜인트로, 운영사 행사, 포트폴리오 연결, LinkedIn 공개 신호

**TIPS 후보 출력 필드:**

| 운영사 | 투자 적합도 | TIPS 추천 가능성 | 펀드 목적 근거 | 업계 신호 | 다음 액션 |
|---|---|---|---|---|---|
| [운영사명] | HIGH | MEDIUM | [KVIC/KVCA] | [LinkedIn/뉴스/포트폴리오] | [투자 미팅/추천 가능성 질문] |

### 3단계: 웹 검색 (10-query 패턴)

~~data enrichment 미연결 시, 다음 검색을 병렬로 실행:

```
1. "[섹터] [단계] venture capital firms"
   → 예: "fintech seed venture capital firms"

2. "[섹터] investors [지역]"
   → 예: "SaaS investors Korea"

3. "[단계] VC funds [지역] 2024 2025"
   → 예: "series A VC funds US 2024 2025"

4. "top [섹터] [단계] investors"
   → 예: "top healthcare seed investors"

5. "[섹터] accelerator programs [지역]"
   → 예: "fintech accelerator programs Asia"

6. "[유사 스타트업] investors"
   → 예: "Stripe investors" (유사 기업)

7. "[섹터] angel investors [지역]"
   → 예: "SaaS angel investors Silicon Valley"

8. "[섹터] corporate venture capital"
   → 예: "fintech corporate venture capital"

9. "new VC funds [섹터] 2024 2025"
   → 신규 펀드 조성 (dry powder 많음)

10. "[지역] startup funding [섹터]"
    → 예: "Korea startup funding fintech"
```

**추출 정보:**
- VC 펀드명, 웹사이트
- Thesis, 투자 섹터·단계
- 체크사이즈, 펀드 규모
- 포트폴리오 대표 기업 (3-5개)
- 주요 파트너 (이름, 직함, LinkedIn)
- 최근 투자 발표 (최근 90일)

### 4단계: Thesis 매칭 프레임워크

각 투자자를 4차원으로 평가:

```
차원 1: 섹터 (Sector)
   🟢 GREEN (MATCH): thesis, 포트폴리오에서 [섹터] 명시
   🟡 YELLOW (PARTIAL): 인접 섹터, "tech" 같은 광범위 thesis
   🔴 RED (MISMATCH): 완전히 다른 섹터

차원 2: 단계 (Stage)
   🟢 GREEN: seed/A/B 명시적 일치
   🟡 YELLOW: 인접 단계 (예: seed-A 투자자에게 series A 요청)
   🔴 RED: 완전히 다른 단계 (예: seed 스타트업에 growth VC)

차원 3: 체크사이즈 (Check Size)
   🟢 GREEN: 전형적 투자 금액이 요청 범위와 일치
   🟡 YELLOW: 범위 일부 중첩 또는 불확실
   🔴 RED: 너무 크거나 작음

차원 4: 지역 (Geography)
   🟢 GREEN: 지역 명시적 커버리지
   🟡 YELLOW: "Global" thesis 또는 인접 지역
   🔴 RED: 명시적으로 다른 지역만 투자
```

**종합 적합도 산정:**

```
HIGH (⭐⭐⭐):
   - 4차원 중 3개 이상 GREEN
   - RED 없음
   → 웜인트로 있으면 최우선, 없어도 콜드 시도

MEDIUM (⭐⭐):
   - 2개 GREEN, 또는 1개 RED
   → 웜인트로 있으면 시도, 콜드는 보류

LOW (⭐):
   - 2개 이상 RED
   → 우선순위 하향 또는 제외
```

### 5단계: 접근 경로 매핑

각 HIGH/MEDIUM 투자자에 대해 접근 경로를 탐색합니다:

#### A. 웜인트로 경로 (최우선)

```
1. 포트폴리오 연결
   - 타겟 VC의 포트폴리오 기업 CEO → VC 파트너
   - LinkedIn에서 포트폴리오 CEO 검색 → 2촌 확인

2. 기존 투자자 연결
   - 우리 기존 투자자 → 타겟 VC
   - Co-investment 이력, 펀드 간 관계 확인

3. 네트워크 연결
   - LinkedIn 2촌 분석
   - 공동 배경 (학교, 이전 회사)
   - 어드바이저, 멘토, 보드 멤버

~~CRM 또는 ~~knowledge base 연결 시:
   - 팀원들의 LinkedIn 커넥션 자동 스캔
   - Notion, Google Drive에서 인트로 이메일 이력 검색
   - 과거 미팅 참석자, 이메일 CC 분석
```

#### B. 콜드 아웃리치

```
웜인트로 없을 때:
   - Thesis 적합도 HIGH만 → 콜드 이메일
   - 파트너 이메일 주소 패턴: firstname@fund.com
   - 웹사이트 "Contact" 또는 "Founders" 페이지
```

#### C. AC 지원

```
액셀러레이터 프로그램:
   - 지원서 제출 (공개 프로세스)
   - 지원 마감일 추적
   - 레퍼런스 준비
```

### 6단계: 우선순위 정렬 및 출력

```
정렬 순서:
1. Thesis 적합도 HIGH + 웜인트로 ⭐⭐⭐🔥
2. Thesis 적합도 HIGH + 콜드 ⭐⭐⭐
3. Thesis 적합도 MEDIUM + 웜인트로 ⭐⭐🔥
4. AC 프로그램 (적합도 HIGH)
5. Thesis 적합도 MEDIUM + 콜드 ⭐⭐

상위 5-10개를 상세 프로필로 출력
나머지는 표 형식으로 요약
```

---

## 투자자 유형별 소싱 전략

### VC (Venture Capital)

**특징:**
- 전문 투자 펀드, LP로부터 자금 조성
- 명확한 thesis, 섹터·단계 초점
- 파트너 컨센서스 필요 (의사결정 느림)
- 체크사이즈 $500K-$50M (펀드 규모에 따라)

**소싱 방법:**
- 포트폴리오 역추적 (가장 효과적)
- THE VC, 혁신의숲 웹 검색
- VC 협회 회원사 리스트
- 웹 검색: "[섹터] [단계] VC"

**접근 전략:**
- 웜인트로 필수 (콜드 응답률 < 5%)
- 포트폴리오 CEO 인트로가 최고 효과
- 파트너별 thesis 차이 확인

### AC (Accelerator)

**특징:**
- Batch 단위 운영, 코호트 구조
- 소액 투자 + 멘토링 + 네트워크
- 공개 지원 프로세스
- Demo Day로 추가 투자 연결

**소싱 방법:**
- "accelerator programs [섹터] [지역]"
- F6S, AngelList, THE VC 프로그램 DB
- YC, Techstars, 500 Global 등 Top-tier
- 한국: SparkLabs, 블루포인트, 프라이머

**지원 전략:**
- 지원 마감일 달력 관리
- Batch 일정 (보통 6개월)
- 레퍼런스 2-3명 준비
- 트랙션 증빙 자료

### 엔젤 투자자

**특징:**
- 개인 자금으로 투자
- 빠른 의사결정 (1-2주)
- 소액 ($25K-$250K)
- 개인적 관심사, 경험 기반

**소싱 방법:**
- AngelList, LinkedIn
- 산업별 엔젤 그룹
- 성공한 창업자, 전 임원 타겟
- 네트워크 이벤트, Pitch Night

**접근 전략:**
- 개인적 연결 중요 (학교, 회사)
- LinkedIn 직접 메시지
- 소개팅 문화 활용

### CVC (Corporate VC)

**특징:**
- 기업의 전략적 투자
- 재무적 + 전략적 목표
- 모기업 비즈니스와 시너지
- 의사결정 복잡 (내부 승인)

**소싱 방법:**
- "[모기업] corporate venture capital"
- THE VC CVC 필터
- 산업별 주요 기업의 CVC 팀

**접근 전략:**
- 전략적 가치 강조 (재무 외)
- 모기업 파트너십 제안
- BD, 제휴 경로 활용

---

## 한국 특화 딜소싱

### VC/AC

**주요 VC:**
- Early-stage: 프라이머, 블루포인트파트너스, 본엔젤스
- Mid-stage: 스마일게이트인베스트먼트, 카카오벤처스
- Growth: IMM인베스트먼트, 알토스벤처스

**주요 AC:**
- SparkLabs (글로벌 네트워크)
- 블루포인트파트너스 AC
- 프라이머
- 퓨처플레이

**정부 프로그램:**
- TIPS (Tech Incubator Program for Startup)
- K-Startup (창업진흥원)
- 중소벤처기업진흥공단

### 데이터 소스

```
1. 협회/단체
   - KVCA (한국벤처캐피탈협회) — 회원사 리스트
   - KVCA DIVA 항목별공시 — VC별 벤처투자조합 보유 현황
   - KVIC FundFinder (한국벤처투자) — 모태펀드 출자 펀드와 운용사 탐색

2. 데이터베이스
   - thevc.kr — 한국 VC 투자 데이터베이스
   - innoforest.co.kr — 스타트업 성장 지표
   - 벤처스퀘어 — 투자 통계

3. 뉴스/미디어
   - Platum — 투자 뉴스
   - 벤처스퀘어 — 딜 발표
   - TechCrunch Korea

4. 커뮤니티
   - Startup Alliance
   - D.CAMP
   - Google for Startups Campus
```

---

## AC 프로그램 달력

주요 AC 프로그램의 지원 마감일을 추적합니다:

### 글로벌 Top-Tier

| 프로그램 | Batch 주기 | 지원 시기 | 펀딩 |
|---------|----------|----------|------|
| Y Combinator | 연 2회 (겨울/여름) | 9월, 3월 | $500K |
| Techstars | 연 4회 | 수시 | $120K |
| 500 Global | 연 4회 | 수시 | $150K |

### 한국

| 프로그램 | Batch 주기 | 지원 시기 | 펀딩 |
|---------|----------|----------|------|
| SparkLabs | 연 2회 | 수시 | $150K |
| 블루포인트 AC | 연 2회 | 수시 | $100K |

---

## 역추적 소싱 (Reverse Sourcing)

가장 효과적인 딜소싱 방법:

### 1단계: 유사 스타트업 식별

```
우리와 유사한 기업:
- 동일 섹터
- 비슷한 비즈니스 모델
- 같은 단계
- 유사한 트랙션

예: Stripe → fintech B2B SaaS 결제
유사 기업: Adyen, Square, PayPal
```

### 2단계: 투자자 발굴

```
THE VC, 혁신의숲, 웹 검색:
"[유사 스타트업] investors"
"[유사 스타트업] series A"

추출:
- 투자자 리스트
- 투자 단계
- 투자 금액
- 투자 일자
```

### 3단계: Thesis 검증

```
해당 VC가:
- 우리 섹터에 반복 투자 → 🟢 Thesis 확인
- 유사 기업에 여러 번 투자 → 🟢 강한 관심
- Lead 투자자인지 Co-investor인지 확인
```

### 4단계: 포트폴리오 연결

```
유사 기업 CEO → VC 파트너 웜인트로 요청
"안녕하세요, [유사 기업]에 투자하신 것을 보고..."
```

---

## ~~data enrichment 연결 시

THE VC, 혁신의숲, OpenDART 연결 시 자동으로 (웹 검색 기반, OpenDART는 MCP 가능):

```
정확한 데이터:
- 펀드 규모, AUM (Assets Under Management)
- 전체 포트폴리오 (웹 검색보다 완전)
- 투자 이력, 평균 체크사이즈
- 파트너별 투자 분야, 이력
- 펀드 조성 시기, Vintage (dry powder 추정)
- LP 구성, 펀드 전략

추가 필터링:
- "최근 12개월 내 [섹터]에 투자한 VC"
- "펀드 조성 1년 이내 (dry powder 많음)"
- "[지역]에서 활동하는 [단계] 투자자"
```

---

## 팁

1. **포트폴리오 역추적 최우선** — 유사 스타트업 투자자 찾기가 가장 효과적
2. **커버리지 3x 유지** — 타겟 마감액의 3배 파이프라인 (전환율 1-3%)
3. **웜인트로 확보에 집중** — 콜드 응답률 < 5% vs 웜인트로 > 40%
4. **Thesis 적합도 엄격히** — HIGH만 시간 투자, MEDIUM은 웜인트로 있을 때만
5. **AC 달력 미리 관리** — 지원 마감일 놓치지 않기
6. **매일 딜소싱** — 지속적인 신규 타겟 발굴로 파이프라인 건강 유지
7. **한국 VC는 네트워크 중심** — 인맥, 인트로가 해외보다 더 중요

---

## 관련 스킬 및 커맨드

- **investor-research** — 특정 VC 펀드/파트너 심층 조사
- **fundraise-comms** — 웜인트로, 콜드 이메일 템플릿
- `/deal-sourcing` — 이 스킬의 커맨드 버전, 구조화된 출력
- `/lead-dashboard` — 발굴한 투자자를 파이프라인에 추가, 추적
- `/investor-outreach` — 특정 투자자에 대한 맞춤형 아웃리치 작성

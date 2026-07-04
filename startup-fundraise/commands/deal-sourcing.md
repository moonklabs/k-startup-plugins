---
description: VC/AC 새 투자자 타겟 발굴 — 웹 검색, thesis 매칭, 로컬 공시 MCP/KVIC/KVCA 공식 펀드 확인, 네트워크 매핑
argument-hint: "<섹터, 단계, 또는 지역>"
---

# /deal-sourcing

> 익숙하지 않은 플레이스홀더가 보이거나 연결된 도구를 확인하려면 [CONNECTORS.md](../CONNECTORS.md)를 참조하세요.

신규 VC, AC, 엔젤, CVC 투자자를 체계적으로 발굴하고, thesis 적합도를 평가하며, 접근 경로를 매핑합니다.

신규 스타트업 또는 투자유치 준비 팀이 이 커맨드를 실제 운영 루틴에 넣는 방법은 [Founder Fundraising Operating Use Cases](../skills/fundraising-process/references/founder-fundraising-operating-use-cases.md)를 따릅니다.

## 사용법

```
/deal-sourcing fintech series A
/deal-sourcing SaaS seed Korea
/deal-sourcing YC accelerator
```

섹터, 단계, 지역 또는 투자자 유형을 지정하세요.

---

## 작동 방식

```
┌─────────────────────────────────────────────────────────────────┐
│                       DEAL SOURCING                              │
├─────────────────────────────────────────────────────────────────┤
│  단독 사용 (웹 검색으로 항상 작동)                                 │
│  ✓ 10-query 웹 검색: VC 펀드, 투자 이력, thesis, 포트폴리오      │
│  ✓ 한국 VC 공식 확인: KVIC FundFinder, KVCA DIVA 조합현황         │
│  ✓ Thesis 적합도 스크리닝: 섹터·단계·체크사이즈·지역 4차원 평가    │
│  ✓ 접근 경로 분석: 웜인트로/콜드/AC지원                           │
│  ✓ 우선순위 리스트: 적합도 HIGH → MEDIUM → LOW 정렬              │
├─────────────────────────────────────────────────────────────────┤
│  강화 모드 (도구 연결 시)                                         │
│  + ~~fund disclosure: 로컬 공시 DB에서 VC/AC 보유 펀드 근거 조회 │
│  + ~~data enrichment: THE VC, 혁신의숲, OpenDART 데이터          │
│  + ~~CRM: 기존 인트로 경로, 포트폴리오 연결고리 자동 매핑          │
│  + ~~knowledge base: 팀 노션/문서에서 웜인트로 커넥션 검색         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 필요한 정보

이 커맨드 실행 시 다음 정보를 수집합니다:

1. **타겟 기준**
   - 섹터: [예: fintech, healthcare, SaaS, marketplace]
   - 단계: [예: seed, series A, series B]
   - 지역: [예: Korea, US, SEA]
   - 체크사이즈: [예: $500K-$2M, $2M-$10M]
   - 유형: [VC, AC, 엔젤, CVC]

2. **현재 상황** (선택)
   - 기존 투자자
   - 회사 소개 (1-2문장)
   - 트랙션 (ARR, MAU 등)

---

## 출력

```markdown
# 딜소싱 리포트: [섹터] [단계] 투자자

**생성일:** [날짜]
**검색 조건:** [섹터] / [단계] / [지역] / [체크사이즈]
**발굴 투자자 수:** [X]개 펀드

---

## 검색 조건 요약

| 항목 | 값 |
|------|-----|
| **섹터** | [섹터] |
| **단계** | [단계] |
| **지역** | [지역] |
| **체크사이즈** | $[X]-[X] |
| **투자자 유형** | [VC/AC/엔젤/CVC] |

---

## 최우선 타겟 (적합도 HIGH)

### [VC 펀드명 1]
**Thesis 적합도:** ⭐⭐⭐ HIGH
| 항목 | 평가 |
|------|------|
| 섹터 | 🟢 MATCH — [상세] |
| 단계 | 🟢 MATCH — [상세] |
| 체크사이즈 | 🟢 MATCH — $[X]-[X] |
| 지역 | 🟢 MATCH — [지역] |

**포트폴리오 대표 기업:** [회사1], [회사2], [회사3]
**최근 투자:** [회사명] ($[X], [날짜])
**공식 펀드 근거:** [KVIC FundFinder / KVCA DIVA / THE VC / 뉴스]
**펀드 현황:** [펀드명, 결성일, 결성총액, 투자 집행액, 잔여 여력 추정]
**주요 파트너:** [이름 — 직함]

**접근 경로:**
- 🔥 웜인트로: [포트폴리오 CEO] → [파트너]
- 🔥 웜인트로: [기존 투자자] → [파트너]
- 콜드: [이메일 주소]

**Why Now:** [최근 펀드 조성, 유사 기업 투자, thesis 발표 등]

---

### [VC 펀드명 2]
**Thesis 적합도:** ⭐⭐⭐ HIGH
[위와 동일한 형식]

---

[상위 5-10개 HIGH 적합도 펀드 나열]

---

## 후보 타겟 (적합도 MEDIUM)

| VC 펀드 | 섹터 | 단계 | 체크 | 지역 | 공식 펀드 근거 | 종합 | 접근 경로 |
|---------|------|------|------|------|----------------|------|----------|
| [펀드명] | 🟡 | 🟢 | 🟢 | 🟢 | KVIC/KVCA | MEDIUM | [웜/콜드] |
| [펀드명] | 🟢 | 🟡 | 🟢 | 🟢 | 뉴스/THE VC | MEDIUM | [웜/콜드] |

🟢 = MATCH / 🟡 = PARTIAL / 🔴 = MISMATCH

---

## AC 프로그램 (모집 중)

현재 지원 가능한 액셀러레이터 프로그램:

### [AC 프로그램명 1]
**지원 마감:** [날짜]
**펀딩:** $[X] + [멘토링/네트워크]
**배치:** [Batch X] — [날짜]
**적합도:** [HIGH/MEDIUM]
**지원 링크:** [URL]

### [AC 프로그램명 2]
[위와 동일한 형식]

---

## 엔젤 투자자 (해당 시)

| 이름 | 배경 | 투자 이력 | LinkedIn | 접근 경로 |
|------|------|----------|----------|----------|
| [이름] | [전 CEO @ 회사] | [투자 기업 3개] | [URL] | [웜인트로 경로] |

---

## 다음 단계

### 즉시 실행 (이번 주)
1. [ ] 최우선 타겟 상위 3개 웜인트로 경로 확보
2. [ ] AC 프로그램 지원서 작성 ([프로그램명], 마감 [날짜])
3. [ ] `/investor-outreach [VC명]` 실행하여 맞춤형 아웃리치 작성

### 단기 실행 (이번 달)
1. [ ] MEDIUM 적합도 펀드 10개 추가 리서치
2. [ ] 콜드 아웃리치 시퀀스 시작 (HIGH 적합도 중 웜인트로 없는 펀드)
3. [ ] `/lead-dashboard` 업데이트하여 신규 타겟 추가

---

## 커버리지 현황

| 현재 파이프라인 | 신규 발굴 | 총 커버리지 | 목표 (3x) |
|----------------|----------|------------|----------|
| [X]명 | [X]명 | [X]명 | [목표 X]명 |

**상태:** [🟢 충분 / 🟡 보통 / 🔴 부족]

---

## 출처
- [KVIC FundFinder: 모태펀드 출자 펀드](http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd)
- [KVIC FundFinder 파라미터 카탈로그](../skills/deal-sourcing/references/kvic-fundfinder-parameter-catalog.md)
- [KVCA DIVA 조합현황: VC별 벤처투자조합](http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq)
- [THE VC: [섹터] 투자자](URL)
- [혁신의숲: [지역] VC](URL)
- [AngelList: [단계] syndicates](URL)
- [웹 검색: [검색어]](URL)
```

---

## 실행 흐름

### 1단계: 타겟 기준 확인

사용자 입력 또는 대화를 통해 다음을 명확히 합니다:
- 섹터 (fintech, SaaS, healthcare 등)
- 단계 (seed, series A, series B)
- 지역 (Korea, US, SEA 등)
- 체크사이즈 ($500K-$2M, $2M-$10M 등)
- 투자자 유형 (VC, AC, 엔젤, CVC)

### 2단계: 웹 검색 (10-query 패턴)

```
다음 검색을 병렬로 실행:
1. "[섹터] [단계] venture capital firms"
2. "[섹터] investors [지역]"
3. "[단계] VC funds [지역] 2024 2025"
4. "top [섹터] seed investors"
5. "[섹터] accelerator programs [지역]"
6. "[유사 스타트업] investors"
7. "[섹터] angel investors [지역]"
8. "[섹터] corporate venture capital"
9. "new VC funds [섹터] 2024 2025"
10. "[지역] startup funding [섹터]"
```

추출 정보:
- VC 펀드명, 웹사이트
- Thesis, 투자 섹터
- 체크사이즈, 단계
- 포트폴리오 기업
- 주요 파트너
- 최근 투자 발표

### 2.5단계: 한국 VC 공식 펀드 확인

한국 VC/AC 후보는 웹 검색 후 아래 두 출처로 펀드 보유 현황을 보강합니다.

`~~fund disclosure` MCP가 연결되어 있으면 먼저 로컬 공시 DB에서 `search_vc_database`를 canonical `intent_hint`와 함께 호출하고, 필요하면 `get_source_authority`, `get_collection_health`로 근거 범위와 import 상태를 확인합니다. 이 로컬 DB는 사용자가 직접 확보한 snapshot, watch folder import, browser capture import, 공식 허가된 feed만 근거로 사용하고, 허가 없는 주기 crawler 결과를 기본 근거로 쓰지 않습니다.

| 출처 | 링크 | 확인 내용 | 한계 |
|---|---|---|---|
| KVIC FundFinder | http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd | 회사 설립연차/사업 분야에 맞는 모태펀드 출자 펀드, 운용사, 결성일, 결성총액, 투자 집행액 | 모태펀드 출자 펀드 중심 |
| KVCA DIVA 조합현황 | http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq | 항목별공시 → 조합현황 → VC명 검색으로 보유 벤처투자조합 확인 | 개인투자조합, 신기사, PEF 등은 누락 가능 |

**FundFinder 조건 코드:**
- FundFinder 조회 조건은 [KVIC FundFinder 파라미터 카탈로그](../skills/deal-sourcing/references/kvic-fundfinder-parameter-catalog.md)를 따른다.
- Seed-Pre-A 샘플 실행은 [MoonkLabs Seed/Pre-A Fundraising Playbook](../skills/deal-sourcing/references/moonklabs-seed-prea-fundraising-playbook.md)과 [Founder Fundraising Operating Use Cases](../skills/fundraising-process/references/founder-fundraising-operating-use-cases.md)을 회귀 예시로 삼는다.
- `ASCT_CLSS_GRP_CD_FND`: 대분류 코드. 예: `AA` 창업초기 펀드
- `ASCT_CLSS_CD_FND`: 소분류 코드. 예: `AA02` 초기기업
- Seed/Pre-A 기본 후보: `AA02` 초기기업, `DA01` 4차산업혁명, `EA01` 일반
- 회사 특성별 추가 후보: `AA01` 대학창업, `DH01` 기술사업화, `DF01` 보건산업, `CA01`~`CA10` 지역, `CB01`/`CB02` 해외

**반영 규칙:**
- 결성일이 최근이고 투자 집행액이 낮은 펀드는 `Why Now`와 체크사이즈 판단에 가점
- KVCA에서 보이지 않는다고 실제 펀드가 없다고 단정하지 않음
- 공식 펀드 근거가 없는 경우 `미확인`으로 표시하고 THE VC/뉴스/웹사이트 근거와 분리
- 리포트에는 조회에 사용한 `ASCT_CLSS_GRP_CD_FND`, `ASCT_CLSS_CD_FND`, 대분류명, 소분류명을 남김

### 3단계: Thesis 적합도 스크리닝

각 투자자를 4차원으로 평가:

| 차원 | 평가 기준 |
|------|----------|
| **섹터** | thesis, 포트폴리오에서 [섹터] 명시 여부 |
| **단계** | 투자 단계 범위 (seed/A/B) |
| **체크사이즈** | 전형적 투자 금액 |
| **지역** | 투자 지역 범위 |

**각 차원 점수:**
- 🟢 GREEN (MATCH) = 명확한 적합
- 🟡 YELLOW (PARTIAL) = 일부 적합 또는 불확실
- 🔴 RED (MISMATCH) = 명확한 부적합

**종합 적합도:**
- **HIGH:** 4차원 중 3개 이상 GREEN, RED 없음
- **MEDIUM:** 2개 GREEN, 또는 1개 RED
- **LOW:** 2개 이상 RED

### 4단계: 접근 경로 분석

각 HIGH/MEDIUM 투자자에 대해:

**웜인트로 경로 탐색:**
```
1. 포트폴리오 연결: 포트폴리오 CEO/Founder → VC 파트너
2. 기존 투자자 연결: 우리 투자자 → 타겟 VC (co-investment 이력)
3. 네트워크 연결: LinkedIn 2촌, 공동 배경 (학교, 회사)
```

~~CRM 또는 ~~knowledge base 연결 시:
- 자동으로 팀의 기존 커넥션 스캔
- Notion, Google Drive에서 인트로 메일 이력 검색

**콜드 아웃리치:**
웜인트로 없으면 → 콜드 이메일 (thesis 적합도 HIGH만)

**AC 지원:**
액셀러레이터 프로그램 → 지원서 제출

---

## 한국 특화 딜소싱

한국 시장에서 추가로 고려할 소스:

### VC/AC
- **KVIC FundFinder:** 회사 설립연차·사업 분야 기준 모태펀드 출자 펀드와 운용사 탐색
- **KVCA DIVA 조합현황:** VC명 기준 보유 벤처투자조합 확인
- **VC 협회:** KVCA 회원사 리스트
- **정부 프로그램:** TIPS, K-Startup, 창업진흥원
- **주요 AC:** SparkLabs, 블루포인트파트너스, 프라이머, 퓨처플레이
- **CVC:** 네이버, 카카오, 삼성, 현대, LG

### 데이터 소스
- thevc.kr — 한국 VC 데이터베이스
- platum.kr — 투자 뉴스
- 벤처스퀘어 — 투자 통계

---

## ~~data enrichment 연결 시

THE VC, 혁신의숲, OpenDART 연결 시:
- 정확한 펀드 규모, AUM (THE VC)
- 상세 포트폴리오 및 투자 이력 (THE VC)
- 스타트업 성장 지표 — 트래픽, 매출 추정 (혁신의숲)
- 상장사 공시, 지분구조 (OpenDART)

> THE VC, 혁신의숲은 공식 MCP 서버가 없어 웹 검색으로 접근합니다. OpenDART는 커뮤니티 MCP 서버를 통해 연결할 수 있습니다 (상장사 한정). 자세한 내용은 [CONNECTORS.md](../CONNECTORS.md)를 참조하세요.

---

## 에이전트 병렬 실행

이 커맨드는 실행 시 다음 에이전트를 호출합니다:

| 에이전트 | 역할 | 출력 |
|---------|------|------|
| `investor-researcher` | 발굴된 투자자별 심층 리서치 + Thesis 매칭 | 투자자 프로필 + GREEN/YELLOW/RED 판정 |

**실행 구조:**

```
[/deal-sourcing "B2B SaaS seed Korea"] 실행
         │
 Step 1: 웹 검색 10쿼리 → 투자자 후보 리스트 생성
         │
 Step 2: investor-researcher × N 병렬 실행
         ├── 투자자A 리서치 ─── Thesis 매칭 → GREEN
         ├── 투자자B 리서치 ─── Thesis 매칭 → YELLOW
         └── 투자자C 리서치 ─── Thesis 매칭 → RED
         │
 Step 3: GREEN → YELLOW → RED 순 우선순위 리스트 출력
```

**딜소싱 → 아웃리치 연결:**

```bash
# 딜소싱으로 발굴 후 바로 아웃리치
/deal-sourcing "SaaS Series A"
# GREEN 판정 투자자 확인 후:
/investor-outreach "[GREEN 판정 VC명]"
# → investor-researcher 재활용 + investor-email-writer 이메일 생성
```

---

## 팁

1. **매일 딜소싱** — 커버리지 3x 유지를 위해 지속적인 신규 발굴 필요
2. **섹터 좁히기** — "tech" 대신 "fintech B2B SaaS"처럼 구체적으로
3. **포트폴리오 역추적** — 유사 스타트업에 투자한 VC 찾기 가장 효과적
4. **AC 달력 관리** — 주요 프로그램 지원 마감일 미리 추적
5. **웜인트로 우선** — HIGH 적합도 중 웜인트로 있는 펀드부터 접촉

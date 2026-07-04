---
description: 투자자를 위한 IR HTML 아티팩트를 생성합니다 — Executive Summary, 원페이저, 데이터룸 랜딩, 투자 메모
argument-hint: "<투자자명 또는 형식>"
---

# /create-ir-asset

[CONNECTORS.md](../CONNECTORS.md)에서 이 커맨드와 함께 사용할 수 있는 모든 통합을 확인하세요.

---

## 설명

VC, AC, 엔젤 투자자를 위한 맞춤형 IR(Investor Relations) 아티팩트를 생성합니다. 투자자 프로필, 대상 독자, 펀드레이징 단계에 맞춰 세련되고 전문적인 HTML 자료를 제공합니다.

**지원 형식**:
- **Executive Summary** — 투자 하이라이트 랜딩 페이지
- **원페이저** — 단일 페이지 투자 요약
- **데이터룸 랜딩** — DD 자료 포털 입구
- **투자 메모** — 내부 검토용 상세 분석

---

## 사용법

```
/create-ir-asset
/create-ir-asset Sequoia
/create-ir-asset "executive summary"
```

---

## 작동 방식

```
┌─────────────────────────────────────────────────────────────────┐
│                  IR ASSET CREATION WORKFLOW                       │
├─────────────────────────────────────────────────────────────────┤
│  기본 기능 (단독 작동)                                            │
│  ✓ 창업자 맥락 감지 (회사, 제품, 단계, 트랙션)                    │
│  ✓ 투자자 타겟 수집 (VC/AC, thesis, 파트너)                      │
│  ✓ 웹 검색 — 투자자 리서치 (포트폴리오, thesis, 뉴스)            │
│  ✓ 형식 선택 (4가지 중)                                          │
│  ✓ 맥락 기반 콘텐츠 생성                                         │
│  ✓ 독립 실행형 HTML 빌드                                         │
├─────────────────────────────────────────────────────────────────┤
│  강화 모드 (도구 연결 시)                                         │
│  + ~~CRM: 투자자 대화 이력, 미팅 노트 자동 로드                   │
│  + ~~knowledge base: 기존 피치 덱, 재무 모델, DD 자료 참조        │
│  + ~~docs: 데이터룸 파일 직접 연결                                │
│  + ~~spreadsheet: 실시간 재무 지표 임베드                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 필요한 정보

Claude가 다음 정보를 수집합니다:

### 1. 창업자 맥락 (자동 감지 + 확인)

| 정보 | 프롬프트 | 필수 |
|------|---------|------|
| **회사명** | 사용자 이메일 도메인에서 추출 → 확인 | 예 |
| **제품/서비스** | "어떤 제품/서비스를 만드시나요?" | 예 |
| **단계** | "현재 어느 단계인가요? (Pre-seed / Seed / Series A / B)" | 예 |
| **트랙션** | "핵심 지표를 공유해 주세요 (MRR, 사용자 수, 성장률 등)" | 아니오 |
| **기존 자료** | "피치 덱, 재무 모델, 또는 DD 자료를 업로드하세요" | 아니오 |

**~~knowledge base** 연결 시: 기존 피치 자료, 재무 모델 자동 검색

---

### 2. 투자자 타겟

| 정보 | 프롬프트 | 필수 |
|------|---------|------|
| **투자자명** | "어느 VC/AC를 타겟하시나요?" | 예 |
| **주요 파트너** | "특정 파트너가 있나요? (이름, 직함)" | 아니오 |
| **관계 단계** | "어떤 단계인가요?" (웜인트로 / 첫미팅 / 심사DD / 텀시트 협상) | 예 |
| **대화 내용** | "논의한 주요 질문이나 관심사가 있나요?" | 아니오 |
| **미팅 자료** | "녹취록, 이메일, 미팅 노트를 업로드하세요" | 아니오 |

**~~CRM** 연결 시: 투자자와의 과거 대화, 미팅 이력 자동 로드

---

### 3. 대상 독자

| 정보 | 프롬프트 | 필수 |
|------|---------|------|
| **독자 유형** | "누가 보나요?" (파트너 / 투자위원회 / 애널리스트 / LP) | 예 |
| **주요 관심사** | "가장 중요한 관심사는?" (시장기회 / 팀 / 트랙션 / 재무 / 경쟁우위) | 예 |
| **우려사항** | "해결해야 할 우려나 질문이 있나요?" | 아니오 |

---

### 4. 형식 선택

**질문:** "어떤 형식이 가장 적합한가요?"

| 형식 | 설명 | 최적 용도 |
|------|------|----------|
| **Executive Summary** | 인터랙티브 랜딩 페이지 — 투자 하이라이트, 지표, 팀, 비전 | 첫 미팅, 웜인트로 후속, 파트너 리뷰 |
| **원페이저** | 단일 스크롤 요약 — 핵심 투자 포인트 한눈에 | 빠른 참고, 이메일 첨부, 인트로 요청 |
| **데이터룸 랜딩** | DD 자료 포털 — 문서 카테고리, 다운로드 링크, 진행 추적 | DD 단계, 투자위원회 준비 |
| **투자 메모** | 내부 메모 형식 — 상세 분석, 리스크, 추천 | 파트너가 투자위원회에 제출, 내부 검토 |

---

## 출력

### Executive Summary 랜딩 페이지

```html
<!-- 독립 실행형 HTML 파일 -->
<!DOCTYPE html>
<html>
<head>
    <title>[Company] — Investment Opportunity</title>
    <!-- 모든 CSS 인라인 -->
</head>
<body>
    <!-- 다크 테마, 투자자 브랜드 컬러 -->

    <!-- 상단 네비게이션 -->
    <nav>
        <logo>[Company]</logo>
        <tabs>
            Overview | Opportunity | Traction | Team | Financials | Ask
        </tabs>
    </nav>

    <!-- [Overview 탭] -->
    <section id="overview">
        <hero>
            <headline>[비전 한 문장]</headline>
            <subhead>[타겟 시장 + 문제 정의]</subhead>
            <stats-grid>
                [MRR] | [Growth Rate] | [Users] | [Team Size]
            </stats-grid>
        </hero>
    </section>

    <!-- [Opportunity 탭] -->
    <section id="opportunity">
        <market-size>
            TAM: $XXB | SAM: $XXB | SOM: $XXM
        </market-size>
        <problem-solution>
            [3-column: Problem | Our Solution | Why Now]
        </problem-solution>
    </section>

    <!-- [Traction 탭] -->
    <section id="traction">
        <metrics-dashboard>
            [인터랙티브 차트: MRR 성장, 코호트 리텐션, 유닛 이코노믹스]
        </metrics-dashboard>
        <milestones>
            [타임라인: 주요 성과]
        </milestones>
    </section>

    <!-- [Team 탭] -->
    <section id="team">
        <founders>
            [프로필 카드: 사진, 이름, 배경, LinkedIn]
        </founders>
        <advisors>
            [어드바이저 그리드]
        </advisors>
    </section>

    <!-- [Financials 탭] -->
    <section id="financials">
        <projections>
            [3-시나리오 차트: Base/Bull/Bear]
        </projections>
        <unit-economics>
            CAC: $XX | LTV: $XX | Payback: XX months
        </unit-economics>
        <runway>
            Current: XX months | Post-raise: XX months
        </runway>
    </section>

    <!-- [Ask 탭] -->
    <section id="ask">
        <investment-ask>
            Raising: $XXM | Valuation: $XXM | Use of Funds [차트]
        </investment-ask>
        <next-steps>
            [CTA: "Schedule Deep Dive" | Contact Info]
        </next-steps>
    </section>

    <!-- 모든 JS 인라인 -->
    <script>
        // 탭 전환, 차트 인터랙션, 애니메이션
    </script>
</body>
</html>
```

**파일명**: `[Company]-executive-summary-[InvestorName]-YYYY-MM-DD.html`

---

### 원페이저

```html
<!-- 단일 스크롤 레이아웃 -->
┌─────────────────────────────────────┐
│ [Company Logo]    [Investor Logo]   │
├─────────────────────────────────────┤
│ HERO: "[비전 한 문장]"                │
│ Subhead: [시장 + 문제 정의]           │
├─────────────────────────────────────┤
│ [3-column Key Points]               │
│ ┌───────┬───────┬───────┐           │
│ │ 시장   │ 트랙션 │ 팀    │           │
│ │ TAM   │ MRR   │ Exp  │            │
│ │ $XXB  │ $XXK  │ 10yr │            │
│ └───────┴───────┴───────┘           │
├─────────────────────────────────────┤
│ TRACTION                            │
│ [핵심 지표 4개 — 큰 숫자 + 트렌드]    │
├─────────────────────────────────────┤
│ THE ASK                             │
│ Raising $XXM at $XXM valuation      │
│ [Use of Funds 파이차트]              │
├─────────────────────────────────────┤
│ CTA: [다음 단계] | [연락처]          │
└─────────────────────────────────────┘
```

**파일명**: `[Company]-one-pager-[InvestorName]-YYYY-MM-DD.html`

---

### 데이터룸 랜딩 페이지

```html
<!-- DD 자료 포털 -->
┌─────────────────────────────────────┐
│ [Company] Data Room                 │
│ For: [Investor Name] (Confidential) │
├─────────────────────────────────────┤
│ PROGRESS TRACKER                    │
│ ████████░░ 80% Complete             │
│ Last Updated: [Date]                │
├─────────────────────────────────────┤
│ DOCUMENTS BY CATEGORY               │
│                                     │
│ 📊 Financial                        │
│ ├─ 3-Year Projections (Base/Bull/Bear) [Download]
│ ├─ Unit Economics Model             [Download]
│ ├─ Cap Table                        [Download]
│ └─ Burn Rate & Runway               [Download]
│                                     │
│ 📄 Legal                            │
│ ├─ Incorporation Docs               [Download]
│ ├─ IP & Patents                     [Download]
│ ├─ Contracts (Customer, Vendor)     [Download]
│ └─ Compliance Certifications        [Download]
│                                     │
│ 👥 Team                             │
│ ├─ Org Chart                        [Download]
│ ├─ Founder Bios                     [Download]
│ ├─ Advisor Agreements               [Download]
│ └─ Employee Count & Breakdown       [Download]
│                                     │
│ 📈 Product & Traction               │
│ ├─ Product Roadmap                  [Download]
│ ├─ Customer References              [Download]
│ ├─ Metrics Dashboard (Live Link)    [View]
│ └─ Case Studies                     [Download]
│                                     │
│ 🔍 Market & Competition             │
│ ├─ Market Sizing Analysis           [Download]
│ ├─ Competitive Landscape            [Download]
│ └─ Win/Loss Analysis                [Download]
├─────────────────────────────────────┤
│ QUICK ACCESS                        │
│ [Executive Summary] [Pitch Deck]    │
│ [Financial Model] [Cap Table]       │
├─────────────────────────────────────┤
│ CONTACT                             │
│ Questions? [Founder Email/Calendar] │
└─────────────────────────────────────┘
```

**파일명**: `[Company]-dataroom-landing-[InvestorName]-YYYY-MM-DD.html`

**~~docs** 연결 시: 각 파일 다운로드 링크가 실제 Google Drive/Notion 경로로 자동 매핑

---

### 투자 메모

```html
<!-- 파트너 내부 검토용 형식 -->
┌─────────────────────────────────────┐
│ INVESTMENT MEMO                     │
│ [Company Name]                      │
│ [Date] — Prepared by [Partner]      │
├─────────────────────────────────────┤
│ EXECUTIVE SUMMARY                   │
│ [3-4 문장: 회사, 시장, 기회 요약]     │
│                                     │
│ INVESTMENT THESIS                   │
│ ✓ [핵심 투자 이유 #1]                │
│ ✓ [핵심 투자 이유 #2]                │
│ ✓ [핵심 투자 이유 #3]                │
│                                     │
│ RECOMMENDATION                      │
│ [ ] PASS  [X] PURSUE  [ ] WATCH     │
├─────────────────────────────────────┤
│ 1. COMPANY OVERVIEW                 │
│    [제품, 미션, 창립일, 팀 규모]      │
│                                     │
│ 2. MARKET OPPORTUNITY               │
│    TAM/SAM/SOM                      │
│    [시장 역학, 성장 드라이버]         │
│                                     │
│ 3. PRODUCT & TRACTION               │
│    [핵심 지표 표]                    │
│    MRR: $XX | Growth: XX% MoM       │
│    Users: XX | Retention: XX%       │
│    [주요 고객, 사례]                 │
│                                     │
│ 4. COMPETITIVE LANDSCAPE            │
│    [포지셔닝 매트릭스]               │
│    [차별화 요소]                     │
│    [경쟁사 대비 우위]                │
│                                     │
│ 5. TEAM                             │
│    [창업자 배경, 도메인 전문성]       │
│    [핵심 인력, 어드바이저]           │
│                                     │
│ 6. FINANCIALS                       │
│    [3-시나리오 요약 표]              │
│    [유닛 이코노믹스: CAC/LTV]        │
│    [런웨이 & 자금 사용 계획]          │
│                                     │
│ 7. DEAL TERMS                       │
│    Amount: $XXM                     │
│    Valuation: $XXM (Pre-money)      │
│    Equity: XX%                      │
│    Other Terms: [SAFE/Priced/...]   │
│                                     │
│ 8. RISKS & MITIGATION               │
│    ⚠️ [리스크 #1] → [대응 계획]      │
│    ⚠️ [리스크 #2] → [대응 계획]      │
│    ⚠️ [리스크 #3] → [대응 계획]      │
│                                     │
│ 9. THESIS FIT                       │
│    [우리 펀드 Thesis와의 정렬도]     │
│    [포트폴리오 시너지]               │
│    [파트너 전문성 매칭]              │
│                                     │
│ 10. NEXT STEPS                      │
│     [ ] Technical DD                │
│     [ ] Reference Checks            │
│     [ ] Financial Deep Dive         │
│     [ ] Partner Meeting             │
│     [ ] IC Presentation             │
├─────────────────────────────────────┤
│ APPENDIX                            │
│ [상세 재무 모델, 시장 리서치, 참고]   │
└─────────────────────────────────────┘
```

**파일명**: `[Company]-investment-memo-[FundName]-YYYY-MM-DD.html`

---

## 워크플로우 상세

### 0단계: 맥락 감지 및 입력 수집

#### 0.1: 창업자 맥락 감지

1. 사용자 이메일 도메인 추출
2. 웹 검색: `"[domain]" startup company product site:crunchbase.com OR site:linkedin.com`
3. 맥락 결정:

| 시나리오 | 조치 |
|---------|------|
| **식별됨** | 자동 입력 → 확인 질문 |
| **미확인** | "어떤 회사를 대표하시나요?" |
| **다중 제품** | "어떤 제품/서비스를 위한 자료인가요?" |

**창업자 맥락 저장**:
```yaml
founder:
  company: "[Company Name]"
  product: "[Product/Service]"
  stage: "[Pre-seed | Seed | Series A | B]"
  traction:
    mrr: "[If known]"
    users: "[If known]"
    growth_rate: "[If known]"
  differentiators:
    - "[Differentiator 1]"
    - "[Differentiator 2]"
```

**~~knowledge base** 연결 시: 향후 세션을 위해 저장, 기존 맥락 자동 로드

---

#### 0.2: 투자자 타겟 수집

**질문**:

| 항목 | 프롬프트 | 필수 |
|------|---------|------|
| **투자자명** | "어느 VC/AC를 타겟하시나요?" | 예 |
| **파트너** | "특정 파트너가 있나요?" | 아니오 |
| **관계 단계** | "어떤 단계인가요?" (웜인트로 / 첫미팅 / 심사 / 텀시트) | 예 |
| **대화 내용** | "논의한 핵심 질문이나 관심사가 있나요?" | 아니오 |
| **미팅 자료** | "녹취록, 이메일, 미팅 노트 업로드" | 아니오 |

**~~CRM** 연결 시: 투자자와의 과거 대화 자동 로드

---

#### 0.3: 대상 독자 확인

**질문**:

| 항목 | 프롬프트 | 필수 |
|------|---------|------|
| **독자 유형** | "누가 보나요?" (파트너 / IC / 애널리스트 / LP) | 예 |
| **주요 관심사** | "가장 중요한 관심사는?" | 예 |
| **우려사항** | "해결해야 할 우려가 있나요?" | 아니오 |

**독자 유형 옵션**:
- 파트너 (리드 심사)
- 투자위원회 (의사결정)
- 애널리스트 (DD 수행)
- LP (펀드 보고)
- 혼합

**주요 관심사 옵션**:
- 시장 기회 (TAM/SAM/SOM)
- 팀 (경험, 도메인 전문성)
- 트랙션 (성장률, 리텐션)
- 재무 (유닛 이코노믹스, 수익성 경로)
- 경쟁 우위 (차별화, 진입장벽)

---

#### 0.4: 형식 선택

**질문**: "어떤 형식이 가장 적합한가요?"

| 형식 | 관계 단계 | 독자 | 복잡도 |
|------|----------|------|--------|
| **Executive Summary** | 웜인트로, 첫미팅, 심사 | 파트너, IC | 중간 |
| **원페이저** | 웜인트로, 빠른 리뷰 | 파트너 | 낮음 |
| **데이터룸 랜딩** | 심사 DD, IC 준비 | 애널리스트, IC | 높음 |
| **투자 메모** | IC 제출, 내부 검토 | 파트너 → IC | 높음 |

---

### 1단계: 투자자 리서치

#### 필수 리서치 (모든 형식)

1. **투자자 기본 정보**
   - 검색: `"[Investor]" fund size portfolio thesis 2025 2026`
   - 추출: AUM, 체크 사이즈, 투자 단계, 섹터 포커스

2. **포트폴리오 & Thesis**
   - 검색: `"[Investor]" portfolio companies investments site:crunchbase.com`
   - 추출: 유사 투자, 섹터 테마, 포지셔닝

3. **주요 파트너**
   - 검색: `"[Partner Name]" [Investor] investments background`
   - 추출: 전문 분야, 최근 발언, 관심 주제

4. **브랜드 컬러**
   - 검색: `"[Investor]" brand guidelines logo`
   - 추출: 주요/보조 색상

#### 풍부한 맥락 시 추가 리서치

5. **최근 뉴스**
   - 검색: `"[Investor]" news announcement 2025 2026`
   - 추출: 펀드 레이즈, 전략 변화, 신규 포커스

6. **경쟁 펀드**
   - 검색: `"[Sector]" [Stage] venture capital firms`
   - 추출: 동일 섹터 투자자, 차별화 포인트

#### 미팅 자료 업로드 시

7. **대화 분석**
   - 추출: 표명된 우려, 질문, 관심 주제
   - 식별: 인용할 핵심 문구 (투자자 표현 사용)
   - 기록: 특정 용어, 약어

---

### 2단계: 콘텐츠 생성

#### 일반 원칙

모든 콘텐츠는:
- **투자자 Thesis**와 명시적으로 정렬
- **포트폴리오 패턴** 참조 (유사 투자 언급)
- **투자자 우선순위** 반영 (미팅 노트 기반)
- **데이터 중심** (가능한 한 수치화)
- **리스크 투명** (숨기지 않고 대응 제시)
- **맞춤형** (템플릿 느낌 제거)

#### 섹션별 템플릿

**히어로 / 인트로**:
```
헤드라인: "[비전 한 문장 — 투자자 Thesis 언어 사용]"
서브헤드: [시장 기회 + 타이밍] — "Why Now" 강조
핵심 지표: [MRR/사용자/성장률/팀 규모] — 가장 인상적인 3-4개
```

**시장 기회**:
```
TAM/SAM/SOM:
├── 방법론 명시 (Top-down / Bottom-up / Value Theory)
├── 데이터 소스 인용
├── 보수적 가정 강조
└── 성장 드라이버 설명
```

**트랙션**:
```
핵심 지표 대시보드:
├── 비즈니스 모델에 맞는 지표 (SaaS: MRR/NRR, 마켓플레이스: GMV/Take Rate)
├── 코호트 리텐션 곡선
├── 유닛 이코노믹스 (CAC, LTV, Payback Period)
└── 주요 고객/사례
```

**팀**:
```
창업자:
├── 도메인 전문성 강조
├── 이전 경력 (관련성)
├── 보완적 스킬셋
└── "왜 이 팀인가" 내러티브

핵심 인력:
├── 주요 채용 (CTO, VP Eng 등)
├── 어드바이저 (관련 산업 경험)
└── 채용 계획
```

**재무**:
```
3-시나리오 전망:
├── Base (가능성 높음)
├── Bull (최선)
└── Bear (보수적)

유닛 이코노믹스:
├── CAC: $XX
├── LTV: $XX (XX months)
├── Payback Period: XX months
├── Gross Margin: XX%
└── 효율성 지표 (CAC Payback, LTV/CAC ratio)

런웨이:
├── 현재: XX months
├── Raise 후: XX months
└── 다음 마일스톤까지 버퍼
```

**투자 제안**:
```
The Ask:
├── Raising: $XXM
├── Valuation: $XXM (Pre-money)
├── Equity: ~XX%
├── 구조: [SAFE / Priced Round / Convertible]
└── 타임라인: [현재 상황, 클로징 목표]

자금 사용 계획:
├── R&D: XX%
├── Sales & Marketing: XX%
├── Team Expansion: XX%
├── Operations: XX%
└── 각 카테고리별 상세 (인원, 도구, 예산)

마일스톤:
├── 12개월: [목표 지표, 제품 론칭]
├── 18개월: [확장 계획]
└── 24개월: [다음 라운드 준비]
```

**리스크 & 대응**:
```
각 리스크에 대해:
├── 리스크 명시 (투명하게)
├── 영향도 (High / Medium / Low)
├── 대응 계획 (구체적)
└── 완화 진행 상황 (이미 취한 조치)

예시 리스크:
- 시장 경쟁 심화
- 고객 집중도
- 규제 변화
- 기술 실행 리스크
- 팀 확장 리스크
```

---

### 3단계: 비주얼 디자인

#### 컬러 시스템

```css
:root {
    /* === Investor Brand (Primary) === */
    --investor-primary: #[extracted from research];
    --investor-secondary: #[extracted];

    /* === Company Accent (보조) === */
    --company-accent: #[company brand];

    /* === Dark Theme Base === */
    --bg-primary: #0a0d14;
    --bg-elevated: #0f131c;
    --bg-surface: #161b28;
    --bg-card: #1a2030;

    /* === Text === */
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.8);
    --text-muted: rgba(255, 255, 255, 0.6);

    /* === Metrics Colors === */
    --growth-positive: #10b981;
    --growth-neutral: #f59e0b;
    --growth-negative: #ef4444;

    /* === Data Viz === */
    --chart-primary: var(--investor-primary);
    --chart-secondary: var(--company-accent);
    --chart-tertiary: #8b5cf6;
}
```

#### 타이포그래피

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Headings */
h1: 2.25rem, font-weight: 700, letter-spacing: -0.02em
h2: 1.5rem, font-weight: 600
h3: 1.125rem, font-weight: 600

/* Body */
body: 1rem, font-weight: 400, line-height: 1.7

/* Metrics (큰 숫자) */
.metric-value: 2.5rem, font-weight: 700, tabular-nums
```

#### 차트 & 데이터 시각화

```javascript
// Chart.js 설정 (인라인)
const chartConfig = {
    type: 'line',
    options: {
        responsive: true,
        plugins: {
            legend: { display: true, position: 'top' },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
            x: { grid: { display: false } }
        }
    }
};

// 3-시나리오 차트
const scenarioChart = {
    labels: ['Year 1', 'Year 2', 'Year 3'],
    datasets: [
        { label: 'Base', data: [...], borderColor: '#10b981' },
        { label: 'Bull', data: [...], borderColor: '#3b82f6' },
        { label: 'Bear', data: [...], borderColor: '#f59e0b' }
    ]
};
```

---

### 4단계: 확인 질문 (필수)

**구축 전 반드시 확인**:

#### 4.1: 이해 내용 요약

```
"다음과 같이 구축할 계획입니다:

**애셋**: [형식] for [투자자명]
**독자**: [유형] — [파트너명 (파악 시)]
**관계 단계**: [웜인트로 / 첫미팅 / 심사 / 텀시트]
**핵심 메시지**: [강조할 2-3가지 투자 포인트]

[투자 메모의 경우 추가:]
**추천**: [PASS / PURSUE / WATCH]
**주요 근거**: [Thesis 적합도, 트랙션, 팀]
```

#### 4.2: 표준 질문

| 질문 | 이유 |
|------|------|
| "구상과 일치하나요?" | 이해 확인 |
| "투자자가 가장 궁금해할 한 가지는?" | 우선순위 집중 |
| "톤 선호도는? (자신감/보수적/데이터 중심)" | 스타일 정렬 |
| "리스크를 투명하게 다뤄도 될까요?" | 솔직함 수준 확인 |

#### 4.3: 형식별 질문

**Executive Summary**:
- "어떤 탭을 가장 강조할까요?"
- "인터랙티브 지표 차트를 포함할까요?"
- "경쟁 비교를 상세히 다룰까요?"

**원페이저**:
- "가장 중요한 한 가지 숫자는?"
- "어떤 증거 자료를 넣을까요? (고객 로고 / 성장 차트 / 인용)"

**데이터룸 랜딩**:
- "어떤 문서를 우선 배치할까요?"
- "실제 파일 링크를 연결할까요, 플레이스홀더로 남길까요?"

**투자 메모**:
- "추천 의견은? (PASS / PURSUE / WATCH)"
- "어떤 리스크를 강조할까요?"
- "Thesis 적합도는 어느 정도인가요?"

---

### 5단계: 구축 및 전달

#### 빌드 프로세스

1. 구조 생성 (2단계 기반)
2. 콘텐츠 생성 (3단계 기반)
3. 비주얼 디자인 적용 (4단계 기반)
4. 인터랙티브 요소 구현 (탭, 차트, 필터)
5. 반응형 테스트
6. 품질 체크리스트 실행

#### 출력 형식

**독립 실행형 HTML**:
- 모든 CSS `<style>` 태그에 인라인
- 모든 JS `<script>` 태그에 인라인
- Chart.js CDN 사용 (외부 의존성 최소화)
- Google Fonts 사용 (Inter)
- 단일 파일 공유 가능

#### 파일 명명

```
[Company]-[format]-[InvestorName]-YYYY-MM-DD.html

예시:
- Acme-executive-summary-Sequoia-2026-02-17.html
- Acme-one-pager-a16z-2026-02-17.html
- Acme-dataroom-landing-YC-2026-02-17.html
- Acme-investment-memo-Benchmark-2026-02-17.html
```

#### 전달 메시지

```markdown
## IR 애셋 생성 완료: [회사명] for [투자자명]

애셋 보기: /path/to/file.html

---

**요약**
- **형식**: [Executive Summary / 원페이저 / 데이터룸 / 투자 메모]
- **투자자**: [VC/AC명] — [파트너명]
- **독자**: [파트너 / IC / 애널리스트]
- **핵심 메시지**: [투자 포인트 2-3개]

---

**배포 옵션**

투자자에게 공유하려면:
- **정적 호스팅**: Netlify, Vercel, GitHub Pages에 업로드
  - Netlify 배포: `netlify deploy --prod --dir=.`
  - 비밀번호 보호 가능 (Netlify Site Protection)
- **보안 공유**: Docsend, DocSafe 등 트래킹 가능 플랫폼
- **직접 전송**: HTML 파일을 이메일 첨부 (완전 독립형)
- **데이터룸 통합**: Notion, Google Drive, Dropbox에 임베드

---

**다음 단계**

다음을 원하시면 알려주세요:
- 색상이나 브랜딩 조정
- 섹션 추가/제거/재배치
- 지표 업데이트 (실시간 데이터 연결)
- 다른 형식으로 변환 (예: Executive Summary → 원페이저)
- PDF 버전 생성
- 다른 투자자를 위한 맞춤 버전
```

---

## CRM 연결 시

**~~CRM** (Relate, HubSpot, Notion 등) 연결 시 자동화:

### 자동 데이터 로드

1. **투자자 프로필 자동 로드**
   - CRM에서 투자자 레코드 검색
   - 과거 대화, 미팅 노트, 이메일 스레드 추출
   - 관계 단계, 관심 주제 파악

2. **미팅 이력 분석**
   - 최근 3회 미팅 노트 읽기
   - 표명된 우려, 질문, 관심사 추출
   - 해결되지 않은 이슈 식별

3. **파이프라인 맥락**
   - 현재 단계 (웜인트로 / 첫미팅 / DD / 텀시트)
   - 다음 마일스톤
   - 담당 파트너

### 자동 업데이트 (애셋 생성 후)

```
"CRM을 업데이트하시겠습니까?"

[예] 선택 시:
✓ CRM에 새 활동 기록: "IR 애셋 생성 — [형식]"
✓ 파일 링크 첨부 (호스팅된 URL)
✓ 다음 단계 리마인더 설정
✓ 투자자 레코드에 태그 추가: "Executive Summary Sent"
```

---

## Knowledge Base 연결 시

**~~knowledge base** (Notion, Google Drive 등) 연결 시:

### 자동 자료 참조

1. **기존 피치 자료 검색**
   - 최신 피치 덱 버전
   - 재무 모델 (3-시나리오)
   - 제품 데모 영상/스크린샷

2. **DD 자료 링크**
   - 데이터룸 랜딩 페이지 생성 시 자동으로 실제 파일 경로 매핑
   - "Financial Model" → `https://notion.so/...`
   - "Cap Table" → `https://drive.google.com/...`

3. **맥락 재사용**
   - 이전에 생성한 IR 애셋에서 콘텐츠 재사용
   - "Acme-exec-summary-Sequoia"를 "Acme-exec-summary-a16z"로 빠르게 변환

---

## 팁

### 투자자 맞춤화

1. **Thesis 정렬을 명시적으로**
   - "As a [Sector] focused fund investing in [Stage] companies, [Investor] will recognize..."
   - 포트폴리오 유사 투자 언급: "Similar to your investment in [Portfolio Co], we..."

2. **파트너 언어 사용**
   - 파트너가 최근 글/트윗에서 사용한 표현 차용
   - "You mentioned [topic] in your recent post — we're solving exactly that..."

3. **포트폴리오 시너지 강조**
   - "We can create value for your portfolio cos [X], [Y] by..."
   - "Potential partnerships with [Portfolio Co]..."

### 데이터 신뢰성

1. **출처 명시**
   - 모든 시장 데이터에 출처 인용 (Gartner, IDC, CB Insights 등)
   - TAM/SAM/SOM 방법론 투명하게 설명

2. **보수적 가정**
   - 낙관적 수치보다 달성 가능한 수치
   - Bull 시나리오는 "Aggressive but Achievable" 프레임

3. **리스크 투명성**
   - 리스크를 숨기지 말고 대응 계획 제시
   - "We're aware of [risk] and here's how we're mitigating..."

### 반복 속도

1. **버전 관리**
   - 파일명에 날짜 포함: `...-2026-02-17-v2.html`
   - 주요 변경 시 버전 노트 추가

2. **빠른 업데이트**
   - 지표 업데이트만 필요 시: "지표만 업데이트해 주세요"
   - 투자자 변경 시: "Sequoia → a16z로 리브랜딩해 주세요"

3. **재사용 가능한 모듈**
   - "팀" 섹션은 모든 애셋에서 동일
   - "시장 기회" 섹션도 재사용 가능
   - → 일부 섹션만 투자자별 맞춤화

### 형식 선택 가이드

| 상황 | 권장 형식 | 이유 |
|------|----------|------|
| 웜인트로 직후 | 원페이저 | 빠른 리뷰, 낮은 부담 |
| 첫 미팅 전 | Executive Summary | 포괄적이지만 인터랙티브 |
| 첫 미팅 후 | Executive Summary | 논의한 주제 심화 |
| DD 시작 | 데이터룸 랜딩 | 체계적 자료 제공 |
| IC 준비 | 투자 메모 | 파트너가 IC에 제출 |
| 여러 파트너 병렬 | 원페이저 × N | 빠르게 여러 버전 생성 |

---

## 관련 스킬

- `investor-research` — VC/AC 펀드 조사
- `pitch-craft` — 피치 덱 구조 & 스토리텔링
- `financial-modeling` — 3-시나리오 재무 모델링
- `startup-metrics` — 핵심 지표 선택
- `market-sizing` — TAM/SAM/SOM 분석
- `competitive-landscape` — 경쟁 분석 & 포지셔닝
- `fundraise-comms` — 투자자 이메일 & 업데이트

---

## 관련 커맨드

- `/investor-outreach` — VC 리서치 + 맞춤형 아웃리치
- `/pitch-review` — 피치 덱 리뷰
- `/dd-prep` — DD/미팅 준비
- `/business-case` — 투자자용 비즈니스 케이스
- `/market-opportunity` — TAM/SAM/SOM 시장 분석
- `/investor-update` — 월간 투자자 업데이트

---

*스타트업 창업자가 VC/AC 투자자를 위한 전문적인 IR 자료를 빠르게 생성할 수 있도록 설계된 커맨드입니다.*

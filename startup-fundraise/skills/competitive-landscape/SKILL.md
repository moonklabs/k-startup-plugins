---
name: competitive-landscape
description: 경쟁 환경 분석, 포지셔닝 전략, 배틀카드 구축을 안내합니다. "경쟁 분석", "경쟁사", "포지셔닝", "차별화", "경쟁 우위", "배틀카드" 등으로 실행합니다.
---

# Competitive Landscape

> 익숙하지 않은 플레이스홀더가 보이거나 연결된 도구를 확인하려면 [CONNECTORS.md](../../CONNECTORS.md)를 참조하세요.

경쟁 환경 분석 및 전략적 포지셔닝 프레임워크입니다. Porter's 5 Forces, Blue Ocean 4-Actions, 포지셔닝 매트릭스를 활용하여 시장 내 독특한 위치를 확보하고, 배틀카드로 영업팀을 무장시킵니다.

## 작동 방식

```
┌─────────────────────────────────────────────────────────────────┐
│                 COMPETITIVE LANDSCAPE ANALYSIS                   │
├─────────────────────────────────────────────────────────────────┤
│  기본 기능 (단독 작동)                                            │
│  ✓ 웹 검색으로 경쟁사 발굴 및 정보 수집                           │
│  ✓ Porter's 5 Forces 산업 구조 분석                             │
│  ✓ 포지셔닝 매트릭스 (4가지 전략 패턴)                            │
│  ✓ 배틀카드 자동 생성 (강점/약점/대응 전략)                       │
├─────────────────────────────────────────────────────────────────┤
│  강화 모드 (도구 연결 시)                                         │
│  + ~~data enrichment: 경쟁사 펀딩, 매출, 팀 규모 자동 수집        │
│  + ~~knowledge base: Win/Loss 인터뷰에서 인사이트 추출           │
│  + ~~CRM: 실제 Deal에서 만난 경쟁사 빈도 및 승률 분석            │
└─────────────────────────────────────────────────────────────────┘
```

## 시작하기

1. **산업 구조 분석**: "한국 SaaS CRM 시장의 경쟁 강도를 분석해줘"
2. **경쟁사 매핑**: "주요 경쟁사 5개를 찾고 비교해줘"
3. **포지셔닝**: "우리만의 차별화 포지셔닝 전략을 제안해줘"
4. **배틀카드**: "Salesforce와의 배틀카드를 만들어줘"

## 경쟁 분석 프레임워크

### 1. 경쟁사 발굴 및 티어 분류

#### 4-Tier 프레임워크

```
Tier 1: Primary Competitors (직접 경쟁)
 - 같은 ICP, 같은 문제, 같은 솔루션
 - 예: 우리 = 중소기업 CRM → Pipedrive, Zoho

Tier 2: Secondary Competitors (간접 경쟁)
 - 다른 방식으로 같은 문제 해결
 - 예: 스프레드시트, 범용 SaaS

Tier 3: Emerging Competitors (신흥 경쟁)
 - 신규 진입, 빠른 성장
 - 예: Y-Combinator 최근 배치

Tier 4: Alternatives (대체재)
 - 다른 카테고리, 일부 기능 겹침
 - 예: 이메일, 수작업, 아웃소싱
```

#### 경쟁사 발굴 웹 검색 패턴

**10-Query 리서치**:
1. "[카테고리] top competitors"
2. "[우리 제품] alternatives"
3. "best [카테고리] for [ICP]"
4. "[문제] solutions"
5. "[경쟁사 A] vs [경쟁사 B]" (비교 기사)
6. "THE VC [카테고리] 스타트업"
7. "[지역] [카테고리] companies"
8. "G2 [카테고리] reviews"
9. "[투자사명] portfolio [카테고리]"
10. "Product Hunt [카테고리] launches"

#### Tier 분류 기준

| 요소 | Primary (1순위) | Secondary (2순위) | Emerging (신흥) | Alternatives (대체) |
|------|-----------------|-------------------|-----------------|---------------------|
| **ICP 중복도** | >70% | 30-70% | >70% (미래) | <30% |
| **기능 중복도** | >80% | 50-80% | >80% | <50% |
| **Deal 교집합** | >50% | 20-50% | <20% | <10% |
| **시장 점유율** | Top 5 | Top 10-20 | 신규 (<1%) | 다른 카테고리 |
| **관심 수준** | 매주 모니터링 | 월간 체크 | 분기 추적 | 연간 검토 |

### 2. Porter's 5 Forces 분석

#### 프레임워크

```
┌──────────────────────────────────────────────────────┐
│         Threat of New Entrants (진입 장벽)            │
│              ↓ (High/Medium/Low)                     │
│                                                      │
│  Bargaining Power ←─→ [시장 경쟁 강도] ←─→ Bargaining│
│  of Suppliers                               of Buyers│
│  (공급자 협상력)                             (구매자)  │
│                                                      │
│              ↑ (High/Medium/Low)                     │
│       Threat of Substitutes (대체재 위협)             │
│                                                      │
│         Competitive Rivalry (경쟁 강도)               │
│         ↓ 종합 점수: High/Medium/Low                 │
└──────────────────────────────────────────────────────┘
```

#### 각 Force 평가

**1. Competitive Rivalry (경쟁 강도)**

| 요소 | High (불리) | Medium | Low (유리) |
|------|-------------|--------|------------|
| 시장 성장률 | <5%/년 | 5-15% | >15% |
| 경쟁자 수 | >20개 | 5-20개 | <5개 |
| 차별화 | 낮음 (Commodity) | 중간 | 높음 (Unique) |
| 전환 비용 | 낮음 | 중간 | 높음 |
| 고객 집중도 | 분산 | 중간 | 집중 |

**점수 예시** (한국 CRM 시장):
- 시장 성장: 12%/년 → Medium
- 경쟁자: 15개 → Medium
- 차별화: AI 기능 독특 → Medium-High
- 전환 비용: 중간 → Medium
- **종합**: Medium-High Rivalry

**2. Threat of New Entrants (진입 장벽)**

| 요소 | High Barrier (유리) | Medium | Low Barrier (불리) |
|------|---------------------|--------|--------------------|
| 자본 요구 | >$10M | $1-10M | <$1M |
| 규제 | 강함 (라이선스) | 중간 | 약함 |
| 브랜드 | 강력한 시장 리더 | 중간 | 신규 시장 |
| 네트워크 효과 | 강함 | 중간 | 없음 |
| 전환 비용 | 높음 (Lock-in) | 중간 | 낮음 |

**점수 예시**:
- 자본: SaaS는 $1M 이하 가능 → Low
- 규제: 없음 → Low
- 브랜드: Salesforce 독주 → High
- 네트워크: CRM은 약함 → Low
- **종합**: Low-Medium Barrier (위협 높음)

**3. Bargaining Power of Buyers (구매자 협상력)**

| 요소 | High Power (불리) | Medium | Low Power (유리) |
|------|-------------------|--------|------------------|
| 구매자 집중도 | Top 3 = 50%+ | 중간 | 분산 |
| 전환 비용 | 낮음 | 중간 | 높음 |
| 정보 투명성 | 높음 (비교 쉬움) | 중간 | 낮음 |
| 가격 민감도 | 높음 | 중간 | 낮음 (Value 중시) |
| 역방향 통합 | 가능 (In-house) | 어려움 | 불가능 |

**4. Bargaining Power of Suppliers (공급자 협상력)**

SaaS/소프트웨어는 일반적으로 **Low** (인력, 클라우드 인프라는 대체 가능)

**5. Threat of Substitutes (대체재)**

| 요소 | High Threat (불리) | Medium | Low Threat (유리) |
|------|-------------------|--------|------------------|
| 대체재 성능 | 비슷하거나 우수 | 약간 떨어짐 | 많이 떨어짐 |
| 가격 | 더 저렴 | 비슷 | 더 비쌈 |
| 전환 용이성 | 쉬움 | 중간 | 어려움 |

**예시** (CRM):
- 대체재: Excel, Google Sheets, 이메일
- 성능: CRM이 월등 → Low
- 가격: 무료 vs 유료 → High
- **종합**: Medium Threat

#### Porter's 5 Forces 종합 출력

```markdown
# Porter's 5 Forces 분석: 한국 CRM 시장

## 종합 점수
**시장 매력도**: Medium (⚠️ 주의)

| Force | 점수 | 상태 | 주요 이유 |
|-------|------|------|-----------|
| Competitive Rivalry | High | 🔴 | 15개 경쟁자, 낮은 차별화 |
| Threat of New Entrants | Medium | 🟡 | 낮은 자본 요구, 브랜드 장벽 |
| Buyer Power | High | 🔴 | 전환 비용 낮음, 가격 민감 |
| Supplier Power | Low | 🟢 | 대체 가능 인프라 |
| Threat of Substitutes | Medium | 🟡 | Excel/Sheets 무료 대안 |

## 전략적 시사점
1. **차별화 필수**: 기능 동등성으로는 부족, AI/자동화로 10x 가치 창출
2. **Lock-in 강화**: 데이터 통합, 워크플로우 자동화로 전환 비용 ↑
3. **Niche 공략**: 전체 시장보다 특정 Vertical (예: 제조업 특화)
```

### 3. 포지셔닝 전략 5가지 패턴

#### 포지셔닝 매트릭스

```
         High Feature Overlap
                │
      ────────────────────────
      │         │             │
      │ Head-   │   Niche     │
      │ to-Head │             │
Broad ├─────────┼─────────────┤ Focused
ICP   │ Reframe │  Leapfrog   │  ICP
      │         │             │
      └─────────┴─────────────┘
                │
          Low Feature Overlap
```

#### 패턴 1: Head-to-Head (정면 승부)

**언제 선택**:
- 시장 리더가 약점 보유 (레거시, 느린 혁신)
- 우리가 자본/브랜드 경쟁력 보유
- 기능 동등성 + 가격 우위

**예시**:
- Zoom vs Skype (더 나은 UX, 더 저렴)
- Notion vs Confluence (더 쉬움, 더 빠름)

**위험**:
- 가격 경쟁 → 마진 압박
- 브랜드 싸움에서 불리

**전략**:
- "Better, Faster, Cheaper" 중 2개 이상
- Switching Program (경쟁사 데이터 마이그레이션 무료)

#### 패턴 2: Niche (특화)

**언제 선택**:
- 특정 Vertical/ICP에서 독보적 전문성
- 범용 솔루션이 특정 니즈 미충족

**예시**:
- Veeva (제약 CRM) vs Salesforce
- Toast (레스토랑 POS) vs Square

**장점**:
- 높은 Win Rate (전문성 인정)
- Premium Pricing
- Word-of-Mouth 강함

**전략**:
- "Salesforce for [Vertical]"
- 산업별 Workflow 템플릿
- Vertical 컨퍼런스 스폰서

#### 패턴 3: Reframe (프레임 전환)

**언제 선택**:
- 같은 문제를 다른 각도로 정의
- 기존 경쟁사와 다른 가치 제안

**예시**:
- Slack: "이메일 킬러" → "팀 커뮤니케이션 허브"
- Airbnb: "호텔 대체" → "로컬 경험"

**전략**:
- 새 카테고리 창출 ("We're not CRM, we're Revenue Operations Platform")
- 다른 Buying Center 타겟 (IT → Sales Ops)

#### 패턴 4: Leapfrog (도약)

**언제 선택**:
- 10x 혁신 기술 보유 (AI, Automation)
- 기존 솔루션이 레거시

**예시**:
- Tesla vs 내연기관 (전기차)
- ChatGPT vs Google Search (AI 답변)

**위험**:
- 시장 교육 비용 높음
- Adoption Curve 느림

**전략**:
- "Next Generation [Category]"
- Thought Leadership (블로그, 컨퍼런스)

#### 패턴 5: Coexist (공존)

**언제 선택**:
- 기존 솔루션 대체 아닌 보완
- 통합/Add-on 전략

**예시**:
- Gong (Salesforce 위에 올라가는 Revenue Intelligence)
- Zapier (모든 SaaS 연결)

**전략**:
- "Works with [Leader]" 강조
- Marketplace/App Store 전략

### 4. 배틀카드 (Battlecard)

#### 배틀카드 구조

```markdown
# [경쟁사명] Battlecard

## 📊 기본 정보
- **회사**: [이름]
- **설립**: [연도]
- **펀딩**: $[금액] ([라운드])
- **고객 수**: [수]
- **타겟**: [ICP]
- **가격**: $[ARPA]/월

## 🎯 언제 만나는가?
- Deal Type: [SMB/Mid/Ent]
- 빈도: [%] of deals
- Win Rate vs 경쟁사: [%]

## 💪 경쟁사 강점
1. **[강점 1]**: [상세]
   - 우리 대응: [전략]
2. **[강점 2]**: [상세]
   - 우리 대응: [전략]

## ⚠️ 경쟁사 약점
1. **[약점 1]**: [상세]
   - 공격 포인트: [질문/데모]
2. **[약점 2]**: [상세]
   - 공격 포인트: [질문/데모]

## 🏆 우리 차별화
1. **[차별점 1]**: [증거/데이터]
2. **[차별점 2]**: [증거/데이터]
3. **[차별점 3]**: [증거/데이터]

## 🗣️ 고객 반대 의견 & 답변
**"[경쟁사]가 더 유명한데?"**
→ [답변]

**"[경쟁사]가 더 저렴한데?"**
→ [답변]

## 📚 참고 자료
- Case Study: [링크]
- Head-to-Head 비교표: [링크]
- Win Story: [고객명]
```

#### 배틀카드 예시

```markdown
# Salesforce Battlecard

## 📊 기본 정보
- **회사**: Salesforce
- **설립**: 1999년
- **펀딩**: 상장사 (Market Cap $200B+)
- **고객 수**: 150,000+
- **타겟**: Enterprise (직원 1,000+)
- **가격**: $150-300/user/월

## 🎯 언제 만나는가?
- Deal Type: Mid-Market, Enterprise
- 빈도: 60% of deals (시장 리더)
- Win Rate vs Salesforce: 35%

## 💪 Salesforce 강점
1. **브랜드**: "CRM = Salesforce" 인식
   - 우리 대응: "중소기업에는 오버스펙, 우리는 딱 맞는 사이즈"
2. **AppExchange**: 3,000+ 통합
   - 우리 대응: "필수 통합 20개는 우리도 지원, 나머지는 안 쓰는 기능"
3. **Enterprise 기능**: 복잡한 워크플로우
   - 우리 대응: "복잡성이 장점? SMB에는 독. 우리는 5분 셋업"

## ⚠️ Salesforce 약점
1. **가격**: User당 $150+ (SMB 부담)
   - 공격: "연 ₩3,600만 (20명 기준) vs 우리 ₩1,200만. 2배 차이"
2. **복잡도**: 관리자 필요 (Admin 교육 비용)
   - 공격: "전담 Admin 없이도 운영 가능한가요?" (데모에서 30초 설정)
3. **구현 시간**: 3-6개월 (컨설팅 필요)
   - 공격: "언제 실제 사용 시작? 우리는 1주일"

## 🏆 우리 차별화
1. **SMB 최적화**: $50/user (1/3 가격)
2. **즉시 사용**: 5분 온보딩, 컨설팅 불필요
3. **한국어 지원**: UI, 고객지원 100% 한국어

## 🗣️ 고객 반대 의견 & 답변
**"Salesforce가 더 유명한데?"**
→ "맞습니다. 하지만 Ferrari가 좋다고 모두에게 맞는 건 아니죠. 중소기업에는 우리가 딱 맞는 '국민차'입니다. 실제로 20명 규모 고객은 Salesforce 쓰다가 저희로 갈아탄 경우가 70%입니다."

**"나중에 커지면 Salesforce로 갈아타야 하나?"**
→ "아닙니다. 우리 고객 중 200명 규모도 있습니다. 필요한 기능 (커스텀 워크플로우, API)은 모두 지원하되, 복잡도는 낮게 유지합니다."

## 📚 참고 자료
- Case Study: [회사명] Salesforce → 우리 전환 (비용 60% 절감)
- 비교표: Salesforce vs 우리
- Demo: 5분 온보딩 vs Salesforce 45분 영상
```

### 5. Blue Ocean 4-Actions Framework

#### 프레임워크

```
┌────────────────────┬────────────────────┐
│   Eliminate        │   Raise            │
│ (산업 표준 제거)     │ (업계 수준 이상)     │
│                    │                    │
│ - [요소 1]         │ - [요소 1]         │
│ - [요소 2]         │ - [요소 2]         │
├────────────────────┼────────────────────┤
│   Reduce           │   Create           │
│ (업계 수준 이하)     │ (신규 요소 창출)     │
│                    │                    │
│ - [요소 1]         │ - [요소 1]         │
│ - [요소 2]         │ - [요소 2]         │
└────────────────────┴────────────────────┘
```

#### 예시 (SMB CRM)

| Eliminate | Raise |
|-----------|-------|
| • 관리자 콘솔 (복잡도) | • 모바일 UX |
| • 컨설팅 서비스 필요성 | • 한국어 지원 품질 |
| • 최소 User 수 제약 | • AI 자동화 |

| Reduce | Create |
|--------|--------|
| • 구현 시간 (6개월 → 1주) | • 카카오톡 통합 알림 |
| • 가격 ($150 → $50) | • 무료 Tier (5명까지) |
| • 온보딩 교육 (3일 → 30분) | • 중소기업 특화 템플릿 |

### 6. Win/Loss 분석

#### Win Analysis (왜 이겼는가?)

```markdown
## Win: [고객명]
**Deal Size**: $[금액]
**경쟁사**: [이름]
**Win Reason**:
1. [주요 이유 1] (40%)
2. [주요 이유 2] (35%)
3. [주요 이유 3] (25%)

**고객 Quote**:
"[실제 피드백]"
```

#### Loss Analysis (왜 졌는가?)

```markdown
## Loss: [프로젝트명]
**Deal Size**: $[금액]
**Won by**: [경쟁사]
**Loss Reason**:
1. [주요 이유 1] (50%) → 개선 계획: [액션]
2. [주요 이유 2] (30%) → 개선 계획: [액션]
3. [주요 이유 3] (20%)

**Lesson Learned**:
[팀 학습 내용]
```

#### 패턴 분석

**분기별 Win/Loss Review**:
```
총 Deal: 50개
Win: 20개 (40%)
Loss: 15개 (30%)
No Decision: 15개 (30%)

Win Reasons (Top 3):
1. 가격 (60%)
2. 사용 편의성 (45%)
3. 한국어 지원 (30%)

Loss Reasons (Top 3):
1. 브랜드 인지도 (50%)
2. 기능 부족 (40%)
3. 통합 제한 (25%)

→ Action: 브랜드 마케팅 강화, [기능 X] 로드맵 우선순위 ↑
```

## 출력 형식

### 경쟁 환경 요약

```markdown
# [시장명] 경쟁 환경 분석

## 시장 구조
- **시장 매력도**: Medium (Porter's 5 Forces)
- **경쟁 강도**: High (15개 경쟁자, 낮은 차별화)
- **진입 장벽**: Low (신규 진입 위협)

## 주요 경쟁사 (Tier 1)

| 경쟁사 | ICP | 강점 | 약점 | Win Rate vs 우리 |
|--------|-----|------|------|------------------|
| A사 | Enterprise | 브랜드 | 가격 | 35% |
| B사 | SMB | 가격 | 기능 | 60% |
| C사 | Mid | 통합 | UX | 50% |

## 우리 포지셔닝
**전략**: Niche (중소 제조업 특화)

**차별화**:
1. AI 재고 예측 (독보적)
2. 한국형 ERP 통합 (더존, 영림원)
3. ₩50/user (시장 평균 1/2)

**타겟**: 직원 50-200명 제조업 (4,000개 TAM)

## 배틀카드
- A사 Battlecard: <link>
- B사 Battlecard: <link>
- C사 Battlecard: <link>

## Win/Loss 인사이트
- Win: 가격(60%), UX(45%)
- Loss: 브랜드(50%), 기능(40%)
- **Action**: 브랜드 마케팅 ↑, [기능 X] 개발 우선
```

## 실행 흐름

1. **경쟁사 발굴**: 웹 검색 10-query 패턴
2. **Tier 분류**: Primary/Secondary/Emerging/Alternatives
3. **Porter's 5 Forces**: 시장 매력도 평가
4. **포지셔닝 선택**: 5가지 패턴 중 최적 전략
5. **배틀카드 생성**: Tier 1 경쟁사 각각
6. **Win/Loss 분석**: 분기별 패턴 추적
7. **업데이트**: 월간 경쟁사 동향 모니터링

## 연결 가능한 도구

| 도구 카테고리 | 플레이스홀더 | 용도 | 예시 도구 |
|---------------|-------------|------|-----------|
| 데이터 보강 | `~~data enrichment` | 경쟁사 투자 라운드, 성장 지표 | THE VC, 혁신의숲, OpenDART |
| 지식 베이스 | `~~knowledge base` | Win/Loss 인터뷰 저장 | Notion, Confluence |
| CRM | `~~CRM` | Deal별 경쟁사, 승률 추적 | Relate, HubSpot |
| 영업 도구 | (~~knowledge base) | 배틀카드 배포 및 업데이트 | Klue, Crayon |

## 관련 스킬

- **market-sizing**: 경쟁사 대비 우리 점유율 목표 설정
- **gtm-strategy**: 포지셔닝에 맞는 GTM 모션 선택
- **sales-playbook**: 배틀카드를 영업 프로세스에 통합
- **pitch-craft**: 경쟁 우위를 피치 덱에 반영

## 팁

- **Focus on Tier 1**: 모든 경쟁사 추적 불가. Primary 3-5개에 집중
- **배틀카드 살아있게**: 분기별 업데이트, 실제 Deal 피드백 반영
- **Win/Loss 필수**: 가장 정직한 피드백. 패턴 파악 후 제품/마케팅 조정
- **경쟁사 모니터링**: G2 리뷰, 블로그, 채용 공고 (전략 힌트), 고객 이탈
- **포지셔닝 일관성**: 웹사이트, 피치, 세일즈 토크 모두 같은 메시지
- **경쟁 피하기**: 때로는 "우리는 [경쟁사] 대체가 아니라 [새 카테고리]"가 유리
- **지속 가능한 우위**: 단기 기능 우위보다 네트워크 효과, 데이터, 브랜드가 강력
- **고객 관점**: "우리가 더 나아"보다 "고객 문제를 더 잘 풀어"에 집중

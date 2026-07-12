---
description: 피치 덱 리뷰 — 100점 평가, 슬라이드별 G/Y/R, 내러티브 흐름, 예상 VC 질문 + 답변 준비
argument-hint: "<피치 덱 파일 경로 또는 '현재 덱'>"
---

# /pitch-review

> 💡 **커넥터 참조:** 이 커맨드는 [`CONNECTORS.md`](../CONNECTORS.md)에 정의된 도구 플레이스홀더를 사용합니다.

## 설명

피치 덱을 종합적으로 리뷰하여 100점 만점으로 평가하고, 슬라이드별 개선 사항을 G/Y/R 상태로 표시하며, 투자자가 물어볼 30개 예상 질문과 답변 전략을 제공합니다.

**핵심 가치:**
- 객관적 점수화 (100점 체계)
- 슬라이드별 구체적 피드백
- VC 시각에서의 리뷰
- 예상 질문 사전 준비

## 사용법

```bash
# 피치 덱 파일 업로드
/pitch-review "pitch-deck-v3.pdf"

# 현재 작업 중인 덱
/pitch-review

# 특정 투자자 대상
/pitch-review "Sequoia 미팅용 덱"

# 슬라이드 범위 지정
/pitch-review "슬라이드 5-10"
```

---

## 작동 방식

```
┌─────────────────────────────────────────────────────────────────┐
│                       PITCH REVIEW                                │
├─────────────────────────────────────────────────────────────────┤
│  기본 기능 (단독 작동)                                            │
│  ✓ 피치 덱 PDF/PPTX 읽기                                         │
│  ✓ Sequoia 12-슬라이드 구조 검증                                 │
│  ✓ 100점 평가 (10개 차원×10점)                                   │
│  ✓ 슬라이드별 G/Y/R 상태                                         │
│  ✓ 내러티브 흐름 평가                                            │
│  ✓ 30개 예상 VC 질문 + 답변 전략                                 │
├─────────────────────────────────────────────────────────────────┤
│  강화 모드 (도구 연결 시)                                         │
│  + ~~docs: Google Slides/PPTX 직접 읽기                          │
│  + ~~knowledge base: 과거 피치 덱 비교                           │
│  + ~~CRM: 타겟 투자자 thesis 반영                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 필요한 정보

### 입력 방식

**옵션 A: PDF/PPTX 파일**
```
피치 덱 파일 업로드 또는 경로 제공
→ 각 슬라이드 읽고 분석
```

**옵션 B: 슬라이드 요약 붙여넣기**
```
각 슬라이드 제목 + 핵심 내용 붙여넣기:

1. Cover: [회사명], [한 줄 설명]
2. Problem: [문제 설명]
3. Solution: [솔루션 핵심]
...
```

**옵션 C: 현재 덱 설명**
```
"12장 피치 덱입니다. 문제-솔루션-시장-제품 순서로 구성했고,
트랙션 슬라이드에 MRR 그래프, 재무 슬라이드에 3년 예측을 넣었습니다."
```

---

## 출력

```markdown
# 피치 덱 리뷰: [회사명] - [버전]
**리뷰일:** 2024-11-15 | **슬라이드 수:** 12장 | **타겟:** Series A

---

## 종합 점수: 78/100 (개선 필요)

| 평가 차원 | 점수 | 상태 | 핵심 이슈 |
|-----------|------|------|-----------|
| 구조 완결성 | 9/10 | 🟢 | Sequoia 구조 준수 |
| 문제 명확성 | 7/10 | 🟡 | 문제 크기 정량화 필요 |
| 솔루션 차별성 | 8/10 | 🟢 | 경쟁 우위 명확 |
| 시장 기회 | 6/10 | 🟡 | TAM 계산 근거 부족 |
| 트랙션 증거 | 9/10 | 🟢 | 강력한 성장 그래프 |
| 비즈니스 모델 | 7/10 | 🟡 | Unit economics 상세 부족 |
| 경쟁 분석 | 6/10 | 🟡 | 경쟁사 리스크 과소평가 |
| GTM 전략 | 7/10 | 🟡 | 채널 전략 구체성 부족 |
| 팀 신뢰성 | 8/10 | 🟢 | 강력한 팀 배경 |
| 자금 사용 | 5/10 | 🔴 | 마일스톤 불명확 |

**총평:**
- ✅ 강점: 트랙션, 팀, 구조
- ⚠️ 개선: 시장 분석, 자금 사용 계획
- 🚨 긴급: 자금 사용처 구체화 필수

---

## 슬라이드별 상세 리뷰

### Slide 1: Cover 🟢 GREEN
**현재:**
- 회사명, 로고, 한 줄 설명
- "B2B SaaS for enterprise workflow automation"

**평가:**
✅ 명확하고 전문적
✅ 한 줄 설명 구체적

**개선 제안:**
- 부제 추가 권장: "Saves 20 hours/week for operations teams"
- 연락처 추가 (이메일, 웹사이트)

---

### Slide 2: Problem 🟡 YELLOW
**현재:**
- "Enterprises struggle with manual workflows"
- 3가지 Pain Point 나열

**평가:**
✅ 문제 명확
⚠️ 규모 정량화 부족

**개선 제안:**
1. 문제 크기 정량화:
   - "$28B lost annually to inefficient workflows"
   - "Operations teams spend 60% time on manual tasks"
2. 고객 인용 추가:
   - "Our ops team was drowning in spreadsheets" - CTO, 500명 기업
3. 비용/리스크 강조:
   - 직접 비용 + 기회비용

---

### Slide 3: Solution 🟢 GREEN
**현재:**
- 제품 스크린샷
- 핵심 기능 3가지

**평가:**
✅ 명확한 가치 제안
✅ 시각적 명확성

**유지:**
- 현재 구조 우수

**마이너 개선:**
- 스크린샷에 주석 추가 (핵심 기능 하이라이트)

---

### Slide 4: Market Opportunity 🟡 YELLOW
**현재:**
- TAM: $50B
- SAM: $10B
- SOM: $1B

**평가:**
⚠️ 계산 근거 부족
⚠️ 숫자가 너무 큼 (신뢰성 저하)

**개선 제안:**
1. TAM 계산 근거 명시:
   - "500K US enterprises × $100K avg spend"
2. SAM을 더 현실적으로:
   - "50K mid-market (200-2000명) × $50K"
3. SOM 달성 경로:
   - "Year 3: 200 customers × $5M ARR"
4. Bottom-up 검증:
   - 현재 트랙션 → 3년 예측 일관성

---

### Slide 5: Product 🟢 GREEN
**현재:**
- 제품 데모 플로우
- 3-step 사용자 여정

**평가:**
✅ 우수

**유지:**
- 현재 구조 유지

---

### Slide 6: Traction 🟢 GREEN (Best Slide)
**현재:**
- MRR 성장 그래프 (6개월 +25% MoM)
- 주요 고객 로고 8개
- NPS 72

**평가:**
✅ 강력한 트랙션 증거
✅ 시각적 임팩트

**마이너 개선:**
- 코호트 Retention 추가 (투자자가 물어볼 것)

---

### Slide 7: Business Model 🟡 YELLOW
**현재:**
- SaaS 구독 모델
- 3-tier 가격 ($500/$2K/$5K)
- ARR 목표

**평가:**
⚠️ Unit economics 부족

**개선 제안:**
1. Unit economics 추가:
   - CAC: $300
   - LTV: $15K
   - LTV:CAC = 5:1
   - Payback: 6개월
2. Gross Margin 명시: 78%
3. 가격 정당성:
   - "Saves $50K/year → 10x ROI at Enterprise tier"

---

### Slide 8: Competition 🟡 YELLOW
**현재:**
- 2x2 매트릭스
- 경쟁사 3개 표시

**평가:**
⚠️ 경쟁사 리스크 과소평가

**개선 제안:**
1. 경쟁 우위 구체화:
   - "20% faster implementation (3 days vs 2 weeks)"
   - "30% lower TCO"
2. Why Now:
   - "Legacy tools can't handle modern API integrations"
3. 경쟁사 강점 인정:
   - "X has brand, but enterprise-only"
   - 우리 차별점: SMB → Enterprise land-and-expand

---

### Slide 9: GTM Strategy 🟡 YELLOW
**현재:**
- Target: Mid-market operations teams
- Channels: Inbound, partnerships

**평가:**
⚠️ 구체성 부족

**개선 제안:**
1. ICP 구체화:
   - "200-2000명 기업, Series B+ 스타트업"
   - "Operations/IT 담당자"
2. 채널 전략 상세:
   - Content marketing: SEO + ops leadership 블로그
   - Partnerships: HubSpot, Salesforce integrations
3. CAC 목표 & 경로:
   - Inbound CAC $200 (현재 $300 → 목표)

---

### Slide 10: Team 🟢 GREEN
**현재:**
- 창업자 3명 프로필
- 관련 경력 강조

**평가:**
✅ 강력한 팀 배경

**마이너 개선:**
- 핵심 Advisor 1-2명 추가

---

### Slide 11: Financials 🟡 YELLOW
**현재:**
- 3년 ARR 예측
- 성장률

**평가:**
⚠️ 가정 근거 부족

**개선 제안:**
1. 시나리오 언급:
   - "Base case: 3x YoY growth"
2. 주요 가정:
   - 고객 성장: 월 +15%
   - ARPU: $30K → $50K (upsell)
3. Burn & 런웨이:
   - "Series A $5M → 24개월 런웨이"

---

### Slide 12: The Ask 🔴 RED
**현재:**
- "Raising $5M Series A"
- 용도: Product, Sales, Marketing

**평가:**
🚨 매우 모호 — 긴급 개선 필요

**개선 제안 (필수):**
1. 구체적 용도:
   - 제품: $1.5M (엔터프라이즈 기능 3개)
   - Sales: $2M (AE 5명, SDR 3명)
   - Marketing: $1M (Content + Partnerships)
   - 운영: $0.5M
2. 12개월 마일스톤:
   - ARR $5M → $15M
   - 고객 50 → 200
   - Team 15 → 40
3. Next Round 조건:
   - "Series B at $30M ARR, 18개월 후"

---

## 내러티브 흐름 평가: 7/10

**현재 흐름:**
문제 → 솔루션 → 시장 → 제품 → 트랙션 → 모델 → 경쟁 → GTM → 팀 → 재무 → Ask

**평가:**
✅ 논리적 순서
⚠️ 초반 임팩트 부족

**개선 제안:**
1. "Traction first" 접근 고려:
   - Slide 2-3에 트랙션 요약 (1장 추가)
   - "Already $2M ARR in 12 months — here's how"
2. 스토리 아크:
   - Setup (문제): Slide 2-3
   - Confrontation (경쟁, 리스크): Slide 8-9
   - Resolution (우리 솔루션+트랙션): Slide 3-7
   - Call to Action (Ask): Slide 12

---

## 누락 요소 체크리스트

- [ ] Slide 6 (Traction): 코호트 Retention 그래프
- [ ] Slide 7 (Business Model): Unit economics 상세
- [ ] Slide 9 (GTM): CAC 목표 & 채널 ROI
- [ ] Slide 11 (Financials): 가정 문서 (Appendix 또는 각주)
- [ ] Slide 12 (Ask): 12개월 마일스톤 상세
- [ ] Appendix: 추가 고객 사례 (선택)
- [ ] Appendix: 기술 아키텍처 (엔지니어링 투자자용)

---

## 30개 예상 VC 질문 + 답변 전략

### 시장 (5개)

**Q1: TAM $50B 계산 근거는?**
답변 전략:
- Bottom-up: "500K US enterprises × avg $100K spend"
- 참고: Gartner 리포트, 유사 기업 벤치마크
- 솔직하게: "Conservative estimate — excludes Europe/Asia"

**Q2: 왜 지금인가? (Why Now)**
답변 전략:
- Macro 트렌드: Remote work → ops complexity 증가
- Tech 전환: Legacy tools can't handle modern APIs
- 증거: 3가지 고객이 모두 "pandemic 이후 급박" 언급

**Q3: 시장 성장률은?**
답변 전략:
- 10-15% CAGR (업계 평균)
- 참고: IDC, Forrester
- 우리 성장 > 시장 성장 (share 확대)

**Q4: 비슷한 회사들이 실패한 이유는?**
답변 전략:
- 2010년대: 클라우드 미성숙, API 부족
- 우리 타이밍: 클라우드 native generation
- 차별점: AI-powered automation (당시 불가능)

**Q5: 글로벌 확장 계획은?**
답변 전략:
- 현재: US market 검증 (12개월)
- Next: Europe (영어권 먼저)
- 18-24개월: APAC

---

### 제품 (5개)

**Q6: 제품 차별점은?**
답변 전략:
- 20% faster implementation
- 30% lower TCO
- Native integrations (경쟁사는 Zapier 의존)

**Q7: 기술적 해자(moat)는?**
답변 전략:
- 데이터 네트워크 효과 (workflow templates)
- Integration ecosystem (50+ 파트너)
- AI 모델 (proprietary training data)

**Q8: 확장성(scalability) 증거는?**
답변 전략:
- 현재: 8개 고객, 문제 없음
- 테스트: 100x 로드 테스트 통과
- 아키텍처: Kubernetes, auto-scaling

**Q9: 로드맵 우선순위는?**
답변 전략:
- 고객 요청 기반 (NPS 설문)
- 3가지 엔터프라이즈 기능 (12개월)
- AI automation 강화

**Q10: 기술 부채(technical debt)는?**
답변 전략:
- 솔직하게: "초기 MVP는 리팩토링 필요"
- 계획: 엔지니어 2명 배정, 6개월 완료
- 영향: 제품 속도 저하 없음

---

### 트랙션 (5개)

**Q11: MRR 성장 지속 가능한가?**
답변 전략:
- 지난 6개월: +25% MoM 일관성
- 파이프라인: 다음 3개월 +20% 가시성
- 리스크: CAC 상승 가능성 (모니터링 중)

**Q12: Churn rate은?**
답변 전략:
- 현재: 월 3% (연 36% — 목표 대비 높음)
- 원인: 초기 Product-market fit 탐색
- 계획: Enterprise focus → 2% 목표

**Q13: Net Revenue Retention(NRR)?**
답변 전략:
- 현재: 95% (Expansion - Churn)
- 목표: 110% (Upsell 강화)
- 증거: 3개 고객이 플랜 업그레이드

**Q14: 고객 획득 채널은?**
답변 전략:
- 70% Inbound (콘텐츠 마케팅)
- 20% 파트너십
- 10% 콜드 아웃리치

**Q15: 가장 큰 고객은?**
답변 전략:
- [기업 A]: $50K ARR, 500명
- 계약 조건: 연간, 자동 갱신
- 확장 가능성: 부서 추가 → $200K

---

### 비즈니스 모델 (5개)

**Q16: CAC payback이 너무 긴 것 아닌가?**
답변 전략:
- 현재: 6개월 (SaaS 표준: 12개월 이하)
- 개선 계획: Inbound 강화 → 4개월 목표

**Q17: LTV 계산 가정은?**
답변 전략:
- ARPU: $30K (현재 평균)
- Gross Margin: 78%
- Churn: 3%/월 → LTV = $780K
- 보수적: Expansion 미포함

**Q18: Gross Margin이 낮은 이유는?**
답변 전략:
- 현재: 78% (SaaS 표준: 75-85%)
- 비용: AWS 호스팅 15%, CS 7%
- 개선: 규모 경제 → 85% 목표

**Q19: 가격 인상 계획은?**
답변 전략:
- 현재: 시장 침투 가격
- 12개월 후: Enterprise tier 20% 인상
- 근거: Value 증명 (ROI 10x)

**Q20: 경쟁사와 가격 비교는?**
답변 전략:
- 우리: $500-$5K
- 경쟁사 A: $10K+ (Enterprise only)
- 포지셔닝: Premium SMB / Value Enterprise

---

### 경쟁 (5개)

**Q21: 경쟁사 X가 이 시장에 진입하면?**
답변 전략:
- 가능성: 높음 (큰 시장)
- 우리 방어: First-mover + customer lock-in
- 전환 비용: 높음 (workflow 데이터)

**Q22: 경쟁 우위가 지속 가능한가?**
답변 전략:
- 네트워크 효과: Workflow templates 공유
- 데이터 해자: Proprietary AI training
- Partnership ecosystem: 50+ integrations

**Q23: M&A 리스크는?**
답변 전략:
- Salesforce/HubSpot이 경쟁사 인수 가능
- 우리 대응: 더 빠른 혁신, niche focus
- 오히려 기회: Acquihire 가능성

**Q24: Open source 위협은?**
답변 전략:
- Enterprise는 support + SLA 필요
- Open source는 DIY → 우리 타겟 아님
- 오히려: Community 활용 (integrations)

**Q25: 가격 경쟁 시작되면?**
답변 전략:
- 경쟁 안 함 (race to bottom 회피)
- Value 강조: ROI, TCO
- Premium positioning 유지

---

### 팀 (5개)

**Q26: 누가 떠나면 가장 큰 리스크?**
답변 전략:
- 솔직하게: CTO (기술 아키텍처 핵심)
- 완화: 주요 문서화, 시니어 엔지니어 육성
- Retention: 적절한 equity + 문화

**Q27: 첫 VP of Sales는 언제?**
답변 전략:
- ARR $3M 시점 (6개월 후)
- 프로필: Enterprise SaaS 경험 10년+
- 준비: 2개월 전부터 서치 시작

**Q28: 팀 확장 계획은?**
답변 전략:
- 현재 15명 → 12개월 후 40명
- 우선순위: Engineering 10명, Sales 8명, CS 5명
- 채용 파이프라인: 이미 5명 후보 확보

**Q29: 공동창업자 갈등은?**
답변 전략:
- 현재: 없음 (3년 함께 일한 경력)
- 예방: 명확한 역할 분담, 정기 1:1
- Vesting: 4년 cliff

**Q30: Board/Advisor 구성은?**
답변 전략:
- Board: 기존 투자자 2명, 독립 1명
- Advisor: SaaS GTM 전문가, Enterprise CTO
- 추가: Series A 리드 투자자

---

## 개선 우선순위

### 🚨 긴급 (발표 전 필수)

1. Slide 12 (Ask): 자금 사용처 구체화
2. Slide 4 (Market): TAM 계산 근거
3. Slide 7 (Business Model): Unit economics 추가

### ⚠️ 중요 (이번 주 내)

4. Slide 6 (Traction): 코호트 Retention 추가
5. Slide 9 (GTM): 채널 전략 상세
6. Slide 8 (Competition): 경쟁 리스크 균형

### 💡 Nice-to-Have (다음 버전)

7. 내러티브: "Traction first" 고려
8. Appendix: 추가 고객 사례
9. 디자인: 일관된 색상/폰트

---

## 다음 단계

- [ ] 긴급 3개 슬라이드 수정 (오늘)
- [ ] 30개 VC 질문 답변 연습 (이번 주)
- [ ] `/dd-prep [투자자명]`으로 특정 투자자 맞춤 준비
- [ ] 모의 피칭 (팀/Advisor와)
- [ ] 최종 버전 v4.0 완성

---

## 에이전트 병렬 실행

이 커맨드는 실행 시 다음 에이전트를 병렬로 호출합니다:

| 에이전트 | 역할 | 담당 슬라이드 |
|---------|------|-------------|
| `market-researcher` | TAM/SAM/SOM 근거 검증 + 성장률 데이터 수집 | Slide 4 (Market Opportunity) |
| `competitor-analyst` | 경쟁사 심층 분석 + 포지셔닝 매트릭스 데이터 | Slide 8 (Competition) |
| `financial-modeler` | 재무 가정 검증 + 시나리오 일관성 점검 | Slide 11-12 (Financials/Ask) |
| `vc-question-prepper` | 이 피치 덱 기반 예상 질문 30개 생성 | 미팅 준비 자료 |

**실행 구조:**

```
[/pitch-review "pitch-v3.pdf"] 실행
         │
━━ Level 0: 병렬 분석 ━━━━━━━━━━━━━━━━━━━━━
         ├── market-researcher   ─── TAM 계산 근거 검증
         ├── competitor-analyst  ─── 경쟁 슬라이드 데이터 검증
         └── financial-modeler   ─── 재무 가정 일관성 점검
━━ Level 1: 통합 ━━━━━━━━━━━━━━━━━━━━━━━━━
         ├── 100점 평가 + 슬라이드별 G/Y/R
         └── vc-question-prepper ─── 피치 내용 기반 예상 질문 30개
```

**활용 시나리오:**

```bash
# 특정 VC 맞춤 리뷰
/pitch-review "Sequoia 미팅용 덱"
# → investor-researcher가 Sequoia thesis 파악
# → vc-question-prepper가 Sequoia 스타일 예상 질문 생성
```

---

## 관련 커맨드

- `/pitch-craft` 스킬 — 피치 덱 작성 가이드
- `/dd-prep` — 특정 투자자 미팅 준비
- `/investor-outreach` — 피치 덱 공유 전 아웃리치
- `/business-case` — 더 상세한 비즈니스 케이스 (보조 자료)
```

---

## 평가 체계 (100점)

### 1. 구조 완결성 (10점)

```
필수 슬라이드 체크:
- Cover, Problem, Solution, Market, Product, Traction
- Business Model, Competition, GTM, Team, Financials, Ask

10점: 12장 모두 + 논리적 순서
8점: 11장 (1개 누락)
6점: 10장 (2개 누락)
4점: 9장 이하
```

### 2. 문제 명확성 (10점)

```
평가 기준:
- 문제 크기 정량화 (시장 규모, 비용)
- 고객 pain point 구체성
- 현재 대안의 한계

10점: 정량화 + 고객 인용 + 비용 분석
7점: 정량화 + 고객 인용
5점: 문제 설명만
```

### 3. 솔루션 차별성 (10점)

```
평가 기준:
- 차별점 명확성
- 왜 우리인가
- 시각적 명확성

10점: 차별점 3개 + 시각화
7점: 차별점 2개
5점: 차별점 모호
```

### 4-10. [나머지 차원 동일 구조]

---

## 팁

1. **VC는 3분 안에 판단합니다** — 처음 3장(문제-솔루션-트랙션)이 핵심.

2. **숫자가 스토리를 만듭니다** — 모호한 표현 대신 구체적 메트릭스.

3. **경쟁사를 과소평가하지 마세요** — 투자자는 경쟁 리스크를 중요하게 봅니다.

4. **Ask 슬라이드가 가장 중요합니다** — 자금 사용처가 모호하면 즉시 탈락.

5. **예상 질문 연습이 필수입니다** — 30개 질문 중 20개는 반드시 나옵니다.

6. **내러티브 흐름을 테스트하세요** — 소리 내어 읽어보고 스토리가 자연스러운지 확인.

7. **간결함이 힘입니다** — 한 슬라이드에 3-5개 bullet 최대.

8. **디자인도 신뢰성입니다** — 일관된 폰트/색상/레이아웃.

9. **버전 관리하세요** — 매 수정마다 v1.0, v1.1, v2.0 저장.

10. **타겟 투자자 맞춤** — Sequoia vs YC는 다른 덱 (강조점 다름).

---

## 관련 스킬

이 커맨드 실행 시 `pitch-craft`, `startup-metrics` 스킬이 자동 활성화됩니다.

---
name: fundraise-office-hours
description: 설치 이후 투자유치 현황을 소크라테스식으로 한 질문씩 좁히고, runway를 첫 질문으로 확인한 뒤 라운드 진행 여부를 판단하며, Fundraise Operating Snapshot을 초기화/업데이트하는 founder office-hours 스킬입니다. "투자유치 현황 점검", "runway 체크", "office hour", "office-hours", "펀드레이징 상담", "소크라테스식 질문", "라운드 시작해도 될까", "현재 상태 업데이트", "투자유치 의사결정" 등으로 실행합니다.
---

# Fundraise Office Hours

`fundraise-office-hours`는 `/vc-funds-setup` 다음에 오는 운영 루틴입니다. 설치는 도구와 데이터 경로를 준비하고, 이 스킬은 창업자에게 필요한 질문을 던져 투자유치 상태를 초기화·업데이트·판단합니다.

이 스킬은 gstack `/office-hours`의 forcing question 방식과 `$deep-interview`의 소크라테스식 한 질문 진행을 차용하되, 제품 아이디어 진단이 아니라 **투자유치 readiness와 실행 의사결정**에 초점을 둡니다. 첫 질문은 반드시 runway check입니다. 또한 gstack `/plan-ceo-review`의 사고방식 중 focus as subtraction, speed calibration, inversion, founder-mode decision을 가져와 투자유치 판단에 적용합니다.

## 원칙

1. **Runway first**  
   투자유치 판단은 현재 현금잔고, 월 burn, 확정 수금, runway, 자금 공백 날짜를 먼저 확인한 뒤에만 진행합니다. runway 숫자가 없으면 다른 질문으로 넘어가지 않습니다.

2. **One question, one bottleneck**
   한 번에 여러 질문을 던지지 않습니다. 현재 투자유치 목표 달성에 가장 큰 영향을 주는 불확실성 하나를 고르고, 그 문제를 한 단계 좁히는 질문 하나만 합니다.

3. **문제 인식 지도를 유지한다**
   답변을 `알고 있고 인지하는 문제`, `모르지만 인지하는 문제`, `알고 있지만 인지 못하는 문제`, `모르고 인지도 못하는 문제`로 분류합니다. 창업자가 이미 말한 사실만 반복하지 말고, 숨은 병목을 질문으로 드러냅니다.

4. **말보다 행동 증거**
   투자자의 긍정 발언, 고객의 관심, 시장 성장률은 보조 신호입니다. 돈, 시간, 반복 사용, DD 요청, 파트너 미팅, 조건 논의 같은 행동이 우선입니다.

5. **raise now는 결론이지 기본값이 아니다**
   모든 스타트업이 지금 투자유치를 시작해야 하는 것은 아닙니다. runway, traction, 시장 타이밍, 팀 capacity를 보고 `ACCELERATE_ROUND`, `PREPARE_MORE`, `PAUSE_AND_VALIDATE`, `ALTERNATIVE_ROUTE` 중 하나로 판단합니다.

6. **공식 근거와 전략 판단을 분리**
   `~~fund disclosure` 또는 `vc-funds` MCP의 투자사/펀드 근거는 "만날 가치가 있는가"의 증거이지, "투자할 것이다"의 보장은 아닙니다.

7. **상태는 누적되어야 한다**
   매번 새로 상담하지 않습니다. `Fundraise Operating Snapshot`을 만들고, 새 사실과 결정을 업데이트합니다.

8. **다음 액션은 7일 안에 검증 가능해야 한다**
   "IR 개선"이 아니라 "수요일까지 리드 후보 5곳용 1페이지 why-now slide 작성"처럼 쪼갭니다.

## 먼저 확인할 자료

연결된 도구가 있으면 질문 전에 확인합니다.

| 출처 | 확인할 것 |
|---|---|
| `~~CRM` | 투자자 파이프라인, 단계, 최근 활동, 다음 액션, owner |
| `~~docs` / `~~knowledge base` | Fundraise Operating Snapshot, IR, 데이터룸, 이전 office-hours 기록 |
| `~~calendar` | 예정 투자자 미팅, 후속 일정 |
| `~~email` | 답장 대기, 웜인트로, 콜드아웃리치, follow-up 히스토리 |
| `~~fund disclosure` | 투자사/펀드/TIPS/창업자 가이드 evidence와 data gap |

자료가 없으면 사용자 답변으로 cold-start snapshot을 만듭니다.

## 질문 프로토콜

질문은 한 번에 모두 던지지 않습니다. 이미 답이 있으면 건너뜁니다. 단, Q1 Runway Check는 현금잔고, 월 burn, 확정 수금, runway가 명확하지 않으면 건너뛰지 않습니다. 답변이 모호하면 같은 질문을 더 구체화해서 한 번 더 묻습니다.

### Socratic Narrowing Loop

각 라운드는 아래 순서를 따릅니다.

1. 사용자의 답변을 `confirmed fact`, `evidence`, `assumption`, `decision`, `unknown`으로 분류합니다.
2. 아래 문제 인식 지도를 갱신합니다.
3. fundraising outcome에 가장 큰 영향을 주는 빈칸 하나를 고릅니다.
4. 한 질문만 합니다.
5. 답변이 vague하면 같은 주제에서 evidence, hidden assumption, boundary, tradeoff, next action 중 하나로 한 단계 더 좁힙니다.
6. 질문이 더 이상 의사결정을 바꾸지 않으면 decision mode와 다음 7일 액션으로 전환합니다.

| 분류 | 의미 | 투자유치 예시 | 처리 |
|---|---|---|---|
| 알고 있고 인지하는 문제 | 창업자가 알고 있고 말할 수 있음 | runway 4개월, 목표 20억 | confirmed fact로 기록 |
| 모르지만 인지하는 문제 | 모른다는 사실을 알고 있음 | 어떤 운영사가 TIPS 추천 가능한지 모름 | data gap과 import/search 액션 생성 |
| 알고 있지만 인지 못하는 문제 | 답변이나 자료에 드러나지만 창업자가 중요성을 못 봄 | 미팅은 많은데 next step이 없음 | 병목으로 이름 붙이고 반문 |
| 모르고 인지도 못하는 문제 | 아직 드러나지 않은 위험 | 단일 champion 의존, 펀드 목적 불일치, runway 착시 | red flag 질문으로 노출 |

질문 선택 우선순위:

1. runway와 생존 경로
2. 목표 라운드와 왜 지금 조달해야 하는지
3. 고객/매출/사용 행동 증거
4. 투자자의 실제 행동 증거
5. TIPS/운영사/펀드 목적/공식 근거 gap
6. 다음 7일 안에 검증 가능한 액션

### Q1. Runway Check

**질문:** 현재 현금잔고, 월 burn, 확정 수금/매출, 현재 runway는 몇 개월인가? 다음 자금 공백 날짜는 언제인가?

확인할 것:
- 현재 runway와 burn
- 현재 현금잔고
- 이미 확정된 매출/수금과 수금 시점
- 비용 절감 가능성과 실제 적용 가능 시점
- 3개월/6개월/12개월 생존 시나리오

Red flags:
- 현금잔고나 burn을 모름
- runway가 3개월 이하인데 정규 VC 라운드만 이야기함
- 확정되지 않은 투자/매출을 runway에 포함함
- 비용 절감 계획이 있지만 실행일/효과가 없음

### Q2. Raise Now Reality

**질문:** runway check 결과를 기준으로 지금 투자유치를 시작하거나 계속해야 하는 가장 강한 이유는 무엇인가?

확인할 것:
- 목표 조달 금액과 희석률 상한
- 라운드를 닫아야 하는 날짜
- 이 라운드가 제품/매출/팀에 만드는 구체적 변화

Red flags:
- "남들도 다 하니까"
- "VC들이 관심 있어 보인다"
- "지금 시장이 좋다"만 있고 고객/매출/runway 압력이 없음

### Q3. Demand Evidence

**질문:** 고객이나 사용자가 실제로 돈, 시간, 반복 행동을 쓰고 있다는 가장 강한 증거는 무엇인가?

확인할 것:
- 매출, MRR/ARR, 유료 전환, retention, expansion
- unpaid라도 업무 흐름에 깊이 들어간 사용 증거
- 고객이 없어졌을 때 실제로 곤란해할 이유

Red flags:
- waitlist, 좋아요, 미팅 반응만 있음
- 고객명이 없고 persona만 있음
- "AI라서 필요하다" 수준의 설명

### Q4. Investor Behavior

**질문:** 투자자들이 말이 아니라 어떤 행동을 했는가?

행동 증거:
- 다음 미팅 확정
- 파트너/심사역 추가 초대
- DD 자료 요청
- 투자 조건/금액/리드 여부 논의
- 다른 투자자 소개

Red flags:
- "좋게 봤다"만 있고 다음 행동 없음
- 14일 이상 무응답
- 한 명의 챔피언에게만 의존

### Q5. Desperate Specificity

**질문:** 이번 라운드에서 설득해야 하는 가장 중요한 투자자 유형을 특정 VC/파트너/펀드 수준으로 말할 수 있는가?

확인할 것:
- stage, sector, ticket size, TIPS 여부
- KVIC/KVCA/DIVA/data.go.kr 근거
- 왜 우리 회사가 그 펀드의 목적에 맞는지

Red flags:
- "초기 투자사 아무나"
- 이름 있는 VC 위주로만 정렬
- 공식 펀드 근거 없이 브랜드로만 판단

### Q6. Narrowest Fundraising Wedge

**질문:** 모든 VC를 동시에 만나지 않는다면, 먼저 검증해야 할 5-10곳은 어디인가?

3단계 분류:
- `PRACTICE`: 연습 미팅, 메시지 검증
- `VALIDATE`: 투자 가능성, Thesis, TIPS/펀드 목적 검증
- `CLOSE`: 진짜 리드 후보, 파트너 미팅과 DD 집중

### Q7. Observation & Surprise

**질문:** 최근 고객/투자자/파트너 대화에서 우리의 가정과 달랐던 사실은 무엇인가?

확인할 것:
- 투자자가 헷갈린 부분
- 고객이 실제로 관심 가진 기능/성과
- IR에서 방어가 약했던 질문
- 예상과 달리 강했던/약했던 thesis

### Q8. Future-Fit

**질문:** 18-36개월 뒤 세상이 어떻게 바뀌면 이 회사가 더 필수적인 회사가 되는가?

확인할 것:
- 시장 변화에 대한 구체적 thesis
- 왜 지금 이 팀이 유리한지
- VC에게 설득력 있는 narrative

## Decision Mode

최종 판단은 반드시 하나를 고릅니다.

Runway 기준은 먼저 적용합니다.

| Runway | 기본 판단 | 예외 |
|---:|---|---|
| 0-3개월 | `ALTERNATIVE_ROUTE` 또는 긴급 bridge/revenue plan | 리드 투자자가 이미 DD/조건 논의 후반이고 closing date가 명확한 경우 |
| 3-6개월 | `ACCELERATE_ROUND` 가능 | 자료/파이프라인이 비어 있으면 bridge/TIPS/전략고객 루트도 병행 |
| 6-12개월 | `PREPARE_MORE` 우선 검토 | 이미 강한 투자자 행동 증거가 있으면 `ACCELERATE_ROUND` |
| 12개월 이상 | `PREPARE_MORE` 또는 `PAUSE_AND_VALIDATE` | 강한 why-now, 성장률, 경쟁 타이밍이 있으면 예외 |

| Mode | 조건 | 다음 액션 |
|---|---|---|
| `ACCELERATE_ROUND` | runway 압력이 있고 고객/투자자 행동 증거도 충분함 | 6-8주 집중 라운드, 리드 후보 우선순위화 |
| `PREPARE_MORE` | runway 여유가 있고 자료/데이터룸/공식 VC 근거 보강이 필요함 | 2-4주 준비 sprint |
| `PAUSE_AND_VALIDATE` | runway는 버티지만 고객 수요 또는 PMF 증거가 약함 | 고객/매출/retention 검증 우선 |
| `ALTERNATIVE_ROUTE` | runway가 너무 짧거나 VC 라운드보다 TIPS/AC/전략고객/브릿지가 더 적합함 | 대체 자금/프로그램/매출 전략 실행 |

## Fundraise Operating Snapshot

새 상담 결과는 [Fundraise Operating Snapshot Template](references/fundraise-operating-snapshot-template.md)에 맞춰 업데이트합니다.

최소 필드:

- company profile
- round thesis
- target raise / runway / dilution guardrail
- cash balance / monthly burn / committed collections / runway
- traction metrics
- investor pipeline
- official evidence status
- socratic problem map
- IR/data room readiness
- decision log
- next 7-day actions

## 출력 규칙

1. 먼저 `Decision mode`와 한 줄 결론을 말합니다.
2. 근거는 `confirmed fact`, `investor behavior`, `official evidence`, `assumption`, `data gap`으로 분리합니다.
3. Socratic Problem Map에 알려진 문제, 인지된 미지, 숨은 병목, 아직 드러나지 않은 리스크를 나눕니다.
4. 창업자에게 불편한 사실이 있으면 완곡하게 숨기지 않습니다.
5. 다음 액션은 owner/date/evidence가 있는 체크리스트로 둡니다.
6. 필요한 후속 커맨드를 제안합니다: `/deal-sourcing`, `/fundraise-pipeline`, `/dd-prep`, `/daily-fundraise`, `/investor-update`.

## Related Surfaces

- `/fundraise-office-hours`
- `/vc-funds-setup`
- `fundraising-process` skill
- `/deal-sourcing`
- `/fundraise-pipeline`
- `/daily-fundraise`

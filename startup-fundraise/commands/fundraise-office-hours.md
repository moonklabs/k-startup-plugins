---
description: 투자유치 Office Hours — runway 체크, 소크라테스식 한 질문 진행, 라운드 의사결정, 운영 데이터 초기화/업데이트
argument-hint: "<회사/라운드/현황 메모>"
---

# /fundraise-office-hours

> 익숙하지 않은 플레이스홀더가 보이거나 연결된 도구를 확인하려면 [CONNECTORS.md](../CONNECTORS.md)를 참조하세요.

설치와 데이터 연결이 끝난 뒤, 창업자가 "지금 우리 투자유치 어디까지 왔고 무엇을 해야 하나?"를 물을 때 실행하는 founder office-hours 루틴입니다.

`/vc-funds-setup`은 로컬 도구와 MCP를 준비하는 최초 설치 루틴이고, `/fundraise-office-hours`는 투자유치 현황을 묻고 판단하며 계속 업데이트하는 운영 루틴입니다.

gstack의 `/office-hours`에서 가져온 forcing question 방식, `$deep-interview`의 소크라테스식 한 질문 진행, `/plan-ceo-review`의 CEO식 의사결정 모드를 투자유치에 맞게 적용합니다. 첫 질문은 항상 runway check입니다. 답변이 모호하면 질문을 여러 개 던지지 말고 가장 중요한 불확실성 하나를 좁힙니다. 근거가 약하면 근거 약함을 표시하며, 다음 액션은 7일 안에 실행 가능한 형태로 좁힙니다.

## 사용법

```bash
/fundraise-office-hours
/fundraise-office-hours "뭉클랩 Seed/Pre-A 준비 현황 점검"
/fundraise-office-hours "20억 Seed 라운드 시작해도 될까?"
/fundraise-office-hours "현재 파이프라인 업데이트하고 다음 주 액션 정리"
```

## 언제 쓰나

| 상황 | 목적 | 다음 연결 |
|---|---|---|
| 처음 투자유치를 고민함 | 라운드를 지금 시작할지, 더 준비할지 판단 | `fundraising-process` 스킬, `/fundraise-forecast` |
| 설치는 끝났지만 데이터가 비어 있음 | 회사/라운드/지표/파이프라인 스냅샷 초기화 | `~~CRM`, `~~docs`, `~~fund disclosure` |
| 투자자 미팅 전 | 실제로 만나야 할 VC와 연습/검증/리드 순서 재정렬 | `/deal-sourcing`, `/dd-prep` |
| 매주 운영 회의 | 지난주 행동 증거와 이번 주 우선순위 업데이트 | `/daily-fundraise`, `/fundraise-pipeline` |
| 큰 방향 고민 | accelerate / prepare / pause / alternative route 중 선택 | `/fundraise-forecast`, `/investor-update` |

## 작동 방식

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUNDRAISE OFFICE HOURS                        │
├─────────────────────────────────────────────────────────────────┤
│  1. Runway check                                                  │
│     현금잔고, 월 burn, 확정 수금, 현재 runway, 자금 공백 날짜      │
│  2. forcing questions                                             │
│     한 번에 하나씩, 가장 위험한 불확실성부터 질문                 │
│  3. Socratic problem map                                           │
│     알고 있는 문제/모르는 문제/인지 못한 문제 분류                │
│  4. 공식 근거 대사                                                │
│     vc-funds MCP로 VC/펀드/TIPS/공시 evidence와 data gap 확인      │
│  5. CEO decision review                                           │
│     accelerate / prepare / pause / alternative route              │
│  6. 운영 데이터 초기화·업데이트                                   │
│     Fundraise Operating Snapshot 작성 또는 갱신                   │
│  7. 다음 7일 액션                                                 │
│     미팅, 자료, 데이터룸, 딜소싱, 후속 연락                       │
└─────────────────────────────────────────────────────────────────┘
```

## 소크라테스식 진행 규칙

Office Hours는 설문지가 아닙니다. 한 번에 많은 질문을 던지지 말고, 창업자의 목표인 투자유치 성공에 가장 큰 영향을 주는 불확실성 하나를 골라 좁힙니다.

반복 루프:

1. 현재 답변을 `confirmed fact`, `evidence`, `assumption`, `decision`, `unknown`으로 분류합니다.
2. 아래 문제 지도를 업데이트합니다.
3. fundraising outcome에 가장 큰 영향을 주는 빈칸 하나를 고릅니다.
4. 한 질문만 합니다.
5. 답변을 다시 분류하고, 필요하면 같은 주제를 한 단계 더 깊게 묻습니다.
6. 충분히 좁혀지면 decision mode와 다음 7일 액션으로 전환합니다.

| 분류 | 의미 | 투자유치 예시 | 처리 |
|---|---|---|---|
| 알고 있고 인지하는 문제 | 창업자가 알고 있고 말할 수 있음 | runway가 4개월, 목표 20억 | 사실/근거로 기록 |
| 모르지만 인지하는 문제 | 모른다는 사실을 알고 있음 | 어떤 VC가 TIPS 추천 가능성이 있는지 모름 | data gap과 import/search 액션 생성 |
| 알고 있지만 인지 못하는 문제 | 자료나 행동에 드러나지만 창업자가 중요성을 못 봄 | 미팅은 많지만 next step이 없음 | 소크라테스식 반문으로 병목화 |
| 모르고 인지도 못하는 문제 | 아직 질문되지 않아 위험으로 숨어 있음 | 단일 champion 의존, 펀드 목적 불일치, runway 착시 | red flag 질문으로 노출 |

질문 우선순위:

1. runway와 생존 경로
2. 이번 라운드가 필요한 이유와 목표
3. 고객/매출/사용 행동 증거
4. 투자자 말이 아닌 행동 증거
5. TIPS/운영사/펀드 목적/공식 근거 gap
6. 다음 7일 안에 검증 가능한 액션

질문은 항상 한 문장 또는 한 덩어리로 끝냅니다. 예: "현재 확정 수금까지 반영하면 현금이 실제로 바닥나는 날짜는 언제인가요?"

## 질문 순서

질문은 한 번에 모두 던지지 말고, 이미 확인된 답은 건너뜁니다. 단, **Runway Check는 명확한 숫자가 없으면 절대 건너뛰지 않습니다.**

1. **Runway Check**  
   현재 현금잔고, 월 burn, 확정 수금/매출, 현재 runway는 몇 개월인가? 다음 자금 공백 날짜는 언제인가?

2. **Raise Now Reality**  
   runway check 결과를 기준으로 지금 투자유치를 시작해야 하는 가장 강한 이유는 무엇인가? 성장, 고객 수요, 경쟁 타이밍 중 무엇이 진짜 압력인가?

3. **Demand Evidence**  
   고객이 실제로 돈, 시간, 반복 사용, 전환 비용을 쓰고 있다는 가장 강한 증거는 무엇인가?

4. **Investor Status Quo**  
   이미 만난 투자자들은 말이 아니라 어떤 행동을 했는가? 다음 미팅, DD 요청, 파트너 소개, 조건 논의가 있었는가?

5. **Desperate Specificity**  
   이번 라운드에서 설득해야 하는 가장 중요한 투자자 유형은 누구인가? 특정 VC/파트너/펀드/Thesis로 말할 수 있는가?

6. **Narrowest Fundraising Wedge**  
   모든 VC를 동시에 만나기보다, 가장 먼저 검증해야 할 5-10곳은 어디인가? 연습 미팅, 가능성 검증, 리드 클로징 순서로 나뉘는가?

7. **Observed Surprise**  
   최근 고객, 투자자, 파트너 미팅에서 우리의 가정과 달랐던 사실은 무엇인가?

8. **Future-Fit & Ambition**  
   18-36개월 뒤 이 회사가 더 필수적인 회사가 되는 핵심 시장 변화는 무엇인가? 그 이야기가 투자자에게 선명한가?

## Runway 판단 기준

| 현재 runway | 기본 판단 | 주의 |
|---:|---|---|
| 0-3개월 | `ALTERNATIVE_ROUTE` 또는 긴급 bridge/revenue plan 우선 | 리드 투자자가 이미 확정 단계가 아니면 정규 라운드보다 생존 경로가 먼저입니다 |
| 3-6개월 | `ACCELERATE_ROUND` 가능, 단 6-8주 집중 라운드로 운영 | 자료/파이프라인이 비어 있으면 즉시 bridge/TIPS/전략고객 옵션도 병행합니다 |
| 6-12개월 | `PREPARE_MORE` 또는 선택적 라운드 | traction, 리드 후보, 데이터룸을 2-4주 안에 보강할 여지가 있습니다 |
| 12개월 이상 | 기본값은 `PREPARE_MORE` 또는 `PAUSE_AND_VALIDATE` | 특별한 why-now와 강한 투자자 행동 증거가 있을 때만 `ACCELERATE_ROUND`입니다 |

## CEO 의사결정 모드

답변과 evidence를 바탕으로 반드시 하나의 모드를 선택합니다.

| 모드 | 의미 | 권장 액션 |
|---|---|---|
| `ACCELERATE_ROUND` | runway 압력이 있고 행동 증거도 충분하다 | 6-8주 집중모드, 리드 후보 우선 |
| `PREPARE_MORE` | runway 여유가 있고 2-4주 보강이 라운드 성공률을 높인다 | 지표, 피치, 데이터룸, 공식 펀드 근거 보강 |
| `PAUSE_AND_VALIDATE` | runway는 버티지만 고객/매출/PMF 증거가 약하다 | 고객 인터뷰, 유료 전환, retention 증거 확보 |
| `ALTERNATIVE_ROUTE` | runway가 너무 짧거나 VC 라운드보다 TIPS/AC/브릿지/전략고객이 우선이다 | 운영사/AC/TIPS 가능성, 매출 기반 생존전략 |

## 데이터 초기화와 업데이트

연결 가능한 도구가 있으면 기존 자료를 먼저 확인합니다.

- `~~CRM`: 투자자 파이프라인, 단계, 최근 활동, 다음 액션
- `~~docs` / `~~knowledge base`: IR, 데이터룸, 이전 미팅 노트, 의사결정 로그
- `~~calendar`: 예정 미팅과 후속 일정
- `~~email`: 답장 대기, 웜인트로, 팔로업 이력
- `~~fund disclosure`: `vc-funds` MCP의 투자사/펀드/가이드 검색 결과

없으면 사용자의 답변을 기반으로 `Fundraise Operating Snapshot`을 생성합니다. 템플릿은 [Fundraise Operating Snapshot Template](../skills/fundraise-office-hours/references/fundraise-operating-snapshot-template.md)을 따릅니다.

업데이트 규칙:

- 새로운 사실과 기존 가정을 분리합니다.
- 투자자 발언은 행동 증거와 분리합니다.
- 공식 펀드 근거가 없으면 `needs_evidence`로 표시합니다.
- 결정은 `decision`, `why`, `revisit_trigger`, `owner`, `next_review_date`를 남깁니다.
- 다음 액션은 7일 안에 실행 가능한 단위로만 둡니다.

## 출력 형식

```markdown
# Fundraise Office Hours — [회사명] [라운드]

## 1. 현재 판단
**Decision mode:** ACCELERATE_ROUND | PREPARE_MORE | PAUSE_AND_VALIDATE | ALTERNATIVE_ROUTE
**한 줄 결론:** [지금 해야 할 결정]
**확신도:** High | Medium | Low

## 2. 근거
| 구분 | 확인된 사실 | 부족한 근거 |
|---|---|---|
| runway |  |  |
| 고객/매출 |  |  |
| 제품/사용 |  |  |
| 투자자 행동 |  |  |
| 공식 펀드 근거 |  |  |

## 3. Socratic Problem Map
| 분류 | 현재 내용 | 다음 질문/액션 |
|---|---|---|
| 알고 있고 인지하는 문제 |  |  |
| 모르지만 인지하는 문제 |  |  |
| 알고 있지만 인지 못하는 문제 |  |  |
| 모르고 인지도 못하는 문제 |  |  |

## 4. 업데이트된 Fundraise Operating Snapshot
| 영역 | 현재값 | 업데이트 |
|---|---|---|
| 라운드 목표 |  |  |
| 현금잔고/월 burn/runway |  |  |
| runway/희석률 |  |  |
| 핵심 지표 |  |  |
| 파이프라인 단계 |  |  |
| 리드 후보 |  |  |
| 데이터룸 상태 |  |  |

## 5. CEO Review
**가장 큰 병목:** [병목]
**하지 말아야 할 일:** [focus as subtraction]
**10x로 키울 선택지:** [선택지]
**줄여야 할 선택지:** [선택지]

## 6. 다음 7일 액션
1. [ ] [액션] — owner/date/evidence
2. [ ] [액션] — owner/date/evidence
3. [ ] [액션] — owner/date/evidence

## 7. 다음에 실행할 커맨드
- `/deal-sourcing "[조건]"`
- `/fundraise-pipeline`
- `/dd-prep "[투자자]"`
- `/daily-fundraise`
```

## 관련 스킬

- `fundraise-office-hours`
- `fundraising-process`
- `deal-sourcing`
- `investor-research`
- `startup-metrics`
- `financial-modeling`
- `vc-fund-disclosure-mcp`

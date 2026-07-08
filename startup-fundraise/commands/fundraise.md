---
description: 투자유치 메인 루틴 — 단기/장기 목표, 생존, VC funding 성공 경로, 다음 액션 선택
argument-hint: "<회사/라운드/현재 고민>"
---

# /fundraise

> 익숙하지 않은 플레이스홀더가 보이거나 연결된 도구를 확인하려면 [CONNECTORS.md](../CONNECTORS.md)를 참조하세요.

창업자가 투자유치 중 매번 가장 먼저 실행하는 메인 커맨드입니다. 목표는 복잡한 command 선택이 아니라, 현재 상태를 보고 **생존 목표, 펀딩 목표, 이번 주 액션**을 하나로 좁히는 것입니다.

`/fundraise`는 직접 모든 일을 하려 하지 않습니다. 상태를 판단한 뒤 `/fundraise-office-hours`, `/fundraise-data`, `/find-vc`, `/vc-meeting`, `/fundraise-pipeline` 중 필요한 다음 루틴으로 라우팅합니다.

## 사용법

```bash
/fundraise
/fundraise "뭉클랩 Seed/Pre-A 준비 중. 지금 뭐부터 해야 할까?"
/fundraise "runway 5개월, 20억 라운드 준비"
/fundraise "이번 주 VC 미팅 후속조치 정리"
```

## 기본 판단 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                         FUNDRAISE                                │
├─────────────────────────────────────────────────────────────────┤
│  1. Survival goal                                                │
│     runway, burn, 확정 수금, 다음 자금 공백 날짜                 │
│  2. Funding goal                                                 │
│     목표 라운드, 목표 금액, 마감일, milestone, 희석률 가드레일    │
│  3. Socratic problem map                                         │
│     known / unknown / hidden risk를 한 질문씩 좁힘                │
│  4. Route                                                        │
│     자료 정리, VC 탐색, 미팅 진행, 파이프라인 관리 중 하나 선택  │
│  5. Next 7 days                                                  │
│     owner/date/evidence가 있는 실행 항목으로 마감                │
└─────────────────────────────────────────────────────────────────┘
```

## 라우팅 규칙

| 상태 | 판단 | 다음 루틴 |
|---|---|---|
| runway, 목표 금액, 마감일이 불명확함 | 목표 설정이 먼저 | `/fundraise-office-hours` |
| IR, 미팅 노트, 파이프라인, 데이터룸이 흩어져 있음 | AI가 읽을 자료 구조가 없음 | `/fundraise-data` |
| 후보 VC/AC/TIPS 운영사가 부족함 | pipeline top-of-funnel 부족 | `/find-vc` |
| 특정 VC와 연락/미팅/후속조치 중 | 관계와 next step 관리 필요 | `/vc-meeting` |
| 투자자 수는 있으나 진행이 느림 | 병목과 stage 기준 확인 필요 | `/fundraise-pipeline` |
| 오늘 할 일이 불명확함 | 일일 실행 우선순위 필요 | `/daily-fundraise` |

## Decision Mode

반드시 하나를 고릅니다.

| Mode | 의미 | 기본 액션 |
|---|---|---|
| `SURVIVE_FIRST` | runway가 짧아 VC 라운드보다 생존 경로가 먼저 | 비용 절감, 매출, bridge, AC/TIPS 병행 |
| `PREPARE_ROUND` | 2-4주 자료/지표/공식 근거 보강이 필요 | snapshot, IR, data room, VC 근거 정리 |
| `START_FUNDRAISE_SPRINT` | 6-8주 집중 라운드에 들어갈 준비가 됨 | 3단계 VC 미팅 순서화, 주간 pipeline 관리 |
| `CLOSE_LEAD` | 리드 후보가 있고 DD/조건/내부절차가 진행 중 | `/vc-meeting`, `/dd-prep`, follow investor orchestration |

## 출력 형식

```markdown
# Fundraise — [회사명]

## 1. 현재 목표
| 구분 | 목표 | 상태 | 빈칸 |
|---|---|---|---|
| 생존 목표 |  |  |  |
| 30일 목표 |  |  |  |
| 6-8주 라운드 목표 |  |  |  |
| 장기 목표 |  |  |  |

## 2. Decision Mode
**Mode:** SURVIVE_FIRST | PREPARE_ROUND | START_FUNDRAISE_SPRINT | CLOSE_LEAD
**한 줄 판단:** ...

## 3. Socratic Problem Map
| 분류 | 내용 | 다음 질문/액션 |
|---|---|---|
| 알고 있고 인지하는 문제 |  |  |
| 모르지만 인지하는 문제 |  |  |
| 알고 있지만 인지 못하는 문제 |  |  |
| 모르고 인지도 못하는 문제 |  |  |

## 4. 다음 7일 액션
1. [ ] ...
2. [ ] ...
3. [ ] ...

## 5. 다음 커맨드
`/[command] "[argument]"`
```

## 관련 루틴

- `/fundraise-office-hours` — 목표/생존/decision mode를 깊게 좁힘
- `/fundraise-data` — 자료와 근거를 AI-readable 구조로 정리
- `/find-vc` — VC/AC/TIPS 운영사 후보와 공식 근거 확인
- `/vc-meeting` — 아웃리치, 미팅 준비, 후속조치, DD 관리
- `/fundraise-pipeline` — 진행속도, 커버리지, 병목 관리

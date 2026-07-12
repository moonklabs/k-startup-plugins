---
description: VC 미팅 운영 — 아웃리치, 미팅 준비, 미팅 후 기록, objection log, DD/후속조치 관리
argument-hint: "<투자자/미팅 상황>"
---

# /vc-meeting

> 익숙하지 않은 플레이스홀더가 보이거나 연결된 도구를 확인하려면 [CONNECTORS.md](../CONNECTORS.md)를 참조하세요.

특정 VC/AC/운영사와의 관계를 실제 투자 의사결정으로 이동시키는 커맨드입니다. 아웃리치 전, 미팅 전, 미팅 후, DD 단계 모두에서 사용합니다.

핵심은 “좋은 분위기”를 기록하는 것이 아니라, **투자자가 어떤 행동을 했고 다음 단계가 무엇인지**를 관리하는 것입니다.

## 사용법

```bash
/vc-meeting "프라이머 첫 미팅 준비"
/vc-meeting "블루포인트 미팅 후 후속조치 정리"
/vc-meeting "스파크랩 TIPS 가능성 질문 준비"
/vc-meeting "김철수 파트너 DD 요청 대응"
```

## 작동 방식

```
┌─────────────────────────────────────────────────────────────────┐
│                         VC MEETING                               │
├─────────────────────────────────────────────────────────────────┤
│  단독 사용 (항상 작동)                                             │
│  ✓ 모드 자동 판정: OUTREACH / PREPARE / FOLLOWUP / DD / CLOSE     │
│  ✓ 행동 기반 stage 상승 규칙 적용 (말이 아닌 행동으로만 상승)      │
│  ✓ Objection log + 미팅 후 기록 + 후속조치 체크리스트 생성         │
├─────────────────────────────────────────────────────────────────┤
│  강화 모드 (도구 연결 시)                                          │
│  + ~~email: 최근 메일, 답장 대기, follow-up 초안                   │
│  + ~~calendar: 미팅 일정, 후속 일정 자동 확인                      │
│  + ~~CRM: 투자자 stage, owner, activity 자동 업데이트              │
│  + ~~fund disclosure: VC/펀드/TIPS 운영사 공식 근거 조회           │
└─────────────────────────────────────────────────────────────────┘
```

## 모드 자동 판정

| 상황 | 모드 | 내부 루틴 |
|---|---|---|
| 아직 연락 전 | `OUTREACH` | `/investor-outreach` |
| 미팅 예정 | `PREPARE_MEETING` | `/dd-prep`, investor research |
| 미팅 직후 | `CAPTURE_FOLLOWUP` | objection log, next step, stage update |
| 자료 요청 받음 | `DD_RESPONSE` | `/dd-prep`, data room checklist |
| 조건/리드 논의 | `CLOSE_PROCESS` | pipeline, follow investor coordination |

## Stage 상승 규칙

투자자 stage는 말이 아니라 행동으로만 올립니다.

| 행동 | stage 영향 |
|---|---|
| “좋게 봤다”, “검토해보겠다” | 상승 없음 |
| 다음 미팅 날짜 확정 | 미팅 단계 유지 또는 상승 |
| 파트너/심사역 추가 초대 | 강한 행동 증거 |
| DD 자료 요청 | DD 단계 |
| check size, valuation, instrument 논의 | 조건 논의 |
| term sheet 또는 투자확약 | closing 단계 |

## 미팅 후 반드시 남길 것

| 항목 | 질문 |
|---|---|
| Next step | 다음 미팅/자료/내부 절차가 날짜와 owner까지 정해졌는가? |
| Objection | 투자자가 가장 의심한 지점은 무엇인가? |
| Evidence gap | 어떤 숫자/고객/자료가 부족했는가? |
| Champion | 내부에서 누가 우리를 밀고 있는가? 단일 champion 의존인가? |
| Fund/TIPS fit | 펀드 목적, TIPS 추천 가능성, 운영사 관점이 확인됐는가? |
| Stage update | 행동 기준으로 pipeline stage가 바뀌는가? |

## 출력 형식

```markdown
# VC Meeting — [투자자/운영사]

## 1. 현재 모드
**Mode:** OUTREACH | PREPARE_MEETING | CAPTURE_FOLLOWUP | DD_RESPONSE | CLOSE_PROCESS
**Stage:** 발굴 | 접촉 | 미팅 | DD | 조건논의 | 클로징

## 2. 미팅/관계 상태
| 항목 | 내용 | 근거 |
|---|---|---|
| 최근 행동 |  |  |
| 다음 단계 |  |  |
| Champion |  |  |
| 공식 펀드/TIPS 근거 |  |  |

## 3. Objection Log
| Objection | 중요도 | 답변/자료 | Owner | Due |
|---|---|---|---|---|

## 4. 후속조치
1. [ ] [48시간 내 보낼 follow-up] — owner/date
2. [ ] [자료 보강] — owner/date/evidence
3. [ ] [pipeline update] — owner/date

## 5. 다음 커맨드
- `/fundraise-pipeline`
- `/fundraise-data`
- `/investor-update`
```

## 연결 도구

- `~~email`: 최근 메일, 답장 대기, follow-up 초안
- `~~calendar`: 미팅 일정, 후속 일정
- `~~CRM`: 투자자 stage, owner, activity
- `~~docs` / `~~knowledge base`: 미팅 노트, IR, data room, objection log
- `~~fund disclosure`: VC/펀드/TIPS 운영사 근거

---

## 관련 스킬

이 커맨드 실행 시 `fundraising-process`, `fundraise-comms` 스킬이 자동 활성화됩니다.

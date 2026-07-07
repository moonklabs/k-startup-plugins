---
description: 투자유치 자료 정리 — IR, outreach, pipeline, data-room, official evidence 자료를 AI 분석 가능한 구조로 표준화
argument-hint: "<대상 폴더 또는 현재 자료 설명>"
---

# /fundraise-data

> 익숙하지 않은 플레이스홀더가 보이거나 연결된 도구를 확인하려면 [CONNECTORS.md](../CONNECTORS.md)를 참조하세요.

투자유치를 준비하는 팀의 임의 폴더를 AI가 읽고 분석하기 좋은 운영 데이터 구조로 정리합니다. 이 커맨드는 플러그인 소스코드 구조를 정리하는 도구가 아니라, 창업자가 실제로 쓰는 IR, 아웃리치, VC 미팅, 데이터룸, 공시 근거, 재무/런웨이 자료를 표준화하는 작업공간 정리 도구입니다.

## 사용법

```bash
/fundraise-data
/fundraise-data "./fundraise"
/fundraise-data "IR, outreach, VC 미팅 노트가 섞인 폴더 정리"
/fundraise-data "ir-outreach 폴더와 data-room 폴더를 분석 가능한 구조로 정리"
```

## 작동 방식

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FUNDRAISE DATA                                │
├──────────────────────────────────────────────────────────────────────┤
│  1. 대상 폴더와 기존 파일명을 수집                                      │
│  2. 원본, 공식 근거, 사용자 노트, AI 생성물을 구분                       │
│  3. IR/outreach/pipeline/meeting/data-room/evidence 역할로 분류         │
│  4. 표준 target path와 metadata를 제안                                  │
│  5. _index 파일로 검색·집계·후속 액션을 가능하게 만듦                    │
│  6. 사용자가 실행을 요청한 경우에만 안전하게 이동 또는 index 생성        │
└──────────────────────────────────────────────────────────────────────┘
```

## 표준 작업공간 구조

```text
fundraise-workspace/
├── _inbox/
│   └── unsorted/
├── _index/
│   ├── fundraise-operating-snapshot.md
│   ├── investor-master.csv
│   ├── evidence-register.csv
│   └── decision-log.md
├── 00-company-profile/
├── 01-runway-finance/
├── 02-ir-assets/
├── 03-investor-pipeline/
├── 04-ir-outreach/
├── 05-meetings/
├── 06-data-room/
├── 07-official-evidence/
├── 08-investor-updates/
├── 09-decisions/
└── _archive/
```

`ir-outreach` 같은 기존 폴더명은 `04-ir-outreach/`로 매핑합니다. 기존 경로를 바로 지우지 말고 `_index/evidence-register.csv`에 원본 경로와 새 target path를 함께 기록합니다.

## 분류 규칙

| 자료 | 표준 위치 | 핵심 metadata |
|---|---|---|
| 회사 소개, ICP, 제품 설명, 팀 소개 | `00-company-profile/` | owner, updated_at, source_kind |
| 현금잔고, burn, runway, cap table, 재무모델 | `01-runway-finance/` | as_of_date, metric_period, confidentiality |
| IR deck, one-pager, teaser, demo script | `02-ir-assets/` | version, audience, status |
| 투자자 리스트, 단계, 점수, thesis fit | `03-investor-pipeline/` | investor, stage, priority, next_action |
| 웜인트로, 콜드메일, 팔로업, LinkedIn 메시지 | `04-ir-outreach/` | investor, contact, sent_at, response_status |
| 미팅 노트, 질문, DD 요청, 액션아이템 | `05-meetings/` | meeting_date, attendees, asks, next_steps |
| DD 문서, 계약, 고객 근거, 보안/법무 자료 | `06-data-room/` | access_level, status, reviewer |
| KVIC/KVCA/TIPS/공시/PDF/HWP snapshot | `07-official-evidence/` | source_url, captured_at, parser, hash |
| 월간 업데이트, 뉴스레터, 리드 공유 자료 | `08-investor-updates/` | period, recipients, sent_at |
| 투자 조건, 우선순위, go/no-go 결정 | `09-decisions/` | decision_date, owner, rationale |

## 출력 형식

```markdown
# Fundraise Data

## 1. Workspace Audit
| Current Path | Classification | Source Kind | Target Path | Status |
|---|---|---|---|---|

## 2. Proposed Data Map
| Artifact | Target Folder | Required Metadata | Missing Fields | Next Action |
|---|---|---|---|---|

## 3. AI Analysis Index
- `_index/investor-master.csv`: ...
- `_index/evidence-register.csv`: ...
- `_index/decision-log.md`: ...
- `_index/fundraise-operating-snapshot.md`: ...

## 4. Safe Move Plan
| From | To | Reason | Risk |
|---|---|---|---|

## 5. Validation Checklist
- [ ] 원본 파일 보존
- [ ] 공식 근거와 사용자 노트 분리
- [ ] source_url/captured_at/hash 기록
- [ ] next_action이 비어 있는 pipeline 항목 없음
- [ ] 민감정보가 요약에 그대로 노출되지 않음
```

## 실행 규칙

- 사용자가 명시적으로 실행을 요청하기 전에는 이동 계획만 만듭니다.
- 이동하더라도 원본을 삭제하지 않고 `_archive/` 또는 원본 경로를 남깁니다.
- 공식 출처 자료와 사용자가 작성한 해석을 같은 파일로 섞지 않습니다.
- PDF/HWP/HWPX/HWPML/Office 문서는 직접 파서를 만들지 않고 `kordoc` CLI/MCP를 사용합니다.
- 확인되지 않은 값은 추정하지 말고 `needs_metadata` 또는 `unknown`으로 표시합니다.
- 이메일, 전화번호, 개인 연락처, 계좌, 토큰, 계약 원문 등 민감정보는 요약에서 마스킹합니다.

## 관련 스킬

- `fundraise-data`
- `fundraise-office-hours`
- `fundraising-process`
- `vc-fund-disclosure-mcp`

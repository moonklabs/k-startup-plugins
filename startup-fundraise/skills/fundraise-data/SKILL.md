---
name: fundraise-data
description: 투자유치 작업공간의 임의 폴더와 파일을 IR, outreach, investor pipeline, meetings, data-room, official evidence, runway/finance 등 AI 분석 가능한 표준 데이터 구조로 분류하고 정리하는 스킬입니다. "ir-outreach 폴더 정리", "투자유치 자료 폴더 구조", "fundraise data", "IR 자료 정리", "VC 미팅 노트 정리", "데이터룸 구조화", "임의 폴더를 AI 분석용으로 정리" 같은 요청에서 실행합니다.
---

# Fundraise Data

`fundraise-data`는 플러그인 소스코드 구조가 아니라 창업자가 실제로 쓰는 투자유치 운영 자료 구조를 정리합니다. 목표는 임의 폴더에 흩어진 IR, 아웃리치, 투자자 리스트, 미팅 노트, 공식 공시 근거, 데이터룸, 재무/런웨이 자료를 검색·집계·AI 분석 가능한 데이터셋으로 만드는 것입니다.

## 핵심 원칙

1. **원본 보존 우선**  
   이동이나 정리를 하더라도 원본 경로, source hash, captured_at을 남깁니다.

2. **공식 근거와 사용자 해석 분리**  
   KVIC/KVCA/TIPS/공시/PDF/HWP snapshot은 `07-official-evidence/`에 두고, 창업자의 해석·미팅 메모·AI 요약은 별도 파일로 둡니다.

3. **AI 분석은 `_index`에서 시작**  
   모든 핵심 자료는 `_index/investor-master.csv`, `_index/evidence-register.csv`, `_index/decision-log.md`, `_index/fundraise-operating-snapshot.md` 중 하나에 연결합니다.

4. **폴더명보다 역할을 본다**  
   `ir-outreach`, `vc-mail`, `warm-intro`, `followup`은 모두 `04-ir-outreach/` 후보입니다. `deck`, `onepager`, `teaser`는 `02-ir-assets/` 후보입니다.

5. **추정하지 않는다**  
   불확실한 투자자명, 라운드, 날짜, 출처는 `unknown` 또는 `needs_metadata`로 표시하고 다음 액션을 둡니다.

## 표준 작업공간

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

## 분류 규칙

| 자료 신호 | 표준 위치 | 처리 |
|---|---|---|
| profile, company, team, product, ICP | `00-company-profile/` | 회사 기본정보로 연결 |
| runway, burn, cash, cap-table, finance, model | `01-runway-finance/` | as_of_date와 confidentiality 기록 |
| deck, IR, one-pager, teaser, demo | `02-ir-assets/` | version과 audience 기록 |
| investor-list, pipeline, target, scoring | `03-investor-pipeline/` | investor-master와 연결 |
| outreach, email, warm-intro, follow-up, linkedin | `04-ir-outreach/` | investor/contact/status 기록 |
| meeting, call-note, DD-question, action-item | `05-meetings/` | meeting_date와 next_steps 기록 |
| data-room, DD, contract, customer-proof, legal | `06-data-room/` | access_level과 reviewer 기록 |
| kvic, kvca, tips, disclosure, hwp, pdf snapshot | `07-official-evidence/` | source_url, captured_at, parser, hash 기록 |
| investor-update, monthly-update, newsletter | `08-investor-updates/` | period와 recipients 기록 |
| decision, terms, priority, go-no-go | `09-decisions/` | rationale과 owner 기록 |

## Metadata Schema

각 artifact는 가능한 한 아래 필드를 갖게 합니다.

```csv
artifact_id,title,artifact_type,source_path,target_path,source_kind,owner,date,investor,round,status,confidentiality,parser,hash,summary,next_action
```

`source_kind`는 `official`, `founder_note`, `investor_reply`, `generated_summary`, `internal_model`, `unknown` 중 하나로 둡니다.

## 작업 순서

1. 대상 폴더와 사용자의 요청 범위를 확인합니다.
2. 파일명, 확장자, 상위 폴더명, 최근 수정일을 기준으로 1차 분류합니다.
3. PDF/HWP/HWPX/HWPML/Office 문서는 `kordoc` CLI/MCP 사용 계획을 세웁니다.
4. `Workspace Audit` 표를 작성합니다.
5. `_index`에 들어갈 핵심 index 파일과 필드를 제안합니다.
6. 사용자가 실행까지 요청하면 명확한 파일만 이동하고 원본 경로를 기록합니다.
7. 실행 후 누락 metadata, 중복 artifact, 민감정보 노출 여부를 검증합니다.

## 출력 규칙

Audit만 요청받으면:

```markdown
## Workspace Audit
| Current Path | Classification | Source Kind | Target Path | Status |
|---|---|---|---|---|

## Proposed Data Map
| Artifact | Target Folder | Required Metadata | Missing Fields | Next Action |
|---|---|---|---|---|

## Safe Move Plan
| From | To | Reason | Risk |
|---|---|---|---|
```

실행까지 요청받으면:

- 생성/수정한 폴더
- 이동 또는 복사한 파일
- 생성/수정한 `_index` 파일
- `needs_metadata`로 남긴 항목
- 민감정보/출처/공식근거 분리 검증 결과

## 안전 규칙

- 투자유치 자료에는 민감정보가 많으므로 개인 연락처, 계좌, 토큰, 계약 원문은 요약에서 마스킹합니다.
- 공식 출처가 없는 값은 투자자 추천 근거로 단정하지 않습니다.
- VC/AC 공시 근거는 `vc-fund-disclosure-mcp` 또는 원본 snapshot과 연결합니다.
- HWP/PDF 파싱은 `kordoc` 기반으로 계획하고, 직접 임시 파서를 만들지 않습니다.

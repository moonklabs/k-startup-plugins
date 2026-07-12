---
description: startup-fundraise 도움말 — 전체 커맨드 지도, 상황별 추천, 시작 가이드, 연결 상태 안내
argument-hint: "[상황 설명 (예: '처음 시작', 'VC 미팅 잡힘', '진행이 느려')]"
---

# /fundraise-help

startup-fundraise 플러그인의 자기 완결적 도움말입니다. README를 읽지 않아도 이 커맨드 하나로 무엇부터 할지 알 수 있습니다.

## 사용법

```bash
/fundraise-help                          # 전체 커맨드 지도 + 시작 가이드
/fundraise-help "처음 시작"               # 상황 맞춤 추천
/fundraise-help "다음 주 VC 미팅 잡힘"
/fundraise-help "3개월째 진행이 안 돼"
```

## 작동 방식

```
┌─────────────────────────────────────────────────────────────────┐
│                     FUNDRAISE HELP                               │
├─────────────────────────────────────────────────────────────────┤
│  인수 없음                                                        │
│  ✓ 첫 실행 추천 시퀀스 (4단계)                                    │
│  ✓ 전체 커맨드 지도 (기본 4 + 고급 15, 사용 빈도)                 │
│  ✓ 연결 상태 안내 (단독 작동 vs MCP 강화)                         │
├─────────────────────────────────────────────────────────────────┤
│  인수 있음 (상황 서술)                                            │
│  ✓ 상황 → 커맨드 매칭 후 1~3개만 추천                             │
│  ✓ 추천 이유와 실행 예시를 함께 제시                               │
└─────────────────────────────────────────────────────────────────┘
```

## 첫 실행 추천 시퀀스

처음 투자유치를 준비한다면 이 순서대로 실행합니다:

> **startup-apply를 함께 설치했다면** `/kb-init`을 가장 먼저 실행하세요. `.kb/`가 회사 사실(지표·시장·팀·실적)의 단일 저장소가 되어, IR 자료와 사업계획서의 수치가 어긋나지 않고 같은 질문을 반복해서 받지 않습니다. `/business-case`, `/investor-update`, `/pitch-review` 등이 `.kb/`를 자동으로 읽습니다.

| 단계 | 커맨드 | 목적 |
|---|---|---|
| 1 | `/fundraise` | runway, 생존 목표, 라운드 목표, 이번 주 액션 결정 |
| 2 | `/fundraise-data "./fundraise"` | IR·아웃리치·파이프라인·데이터룸을 AI가 읽는 구조로 정리 |
| 3 | `/find-vc "회사명 업종 단계 지역"` | VC/AC/TIPS 운영사를 연습/검증/클로징 순서로 분류 |
| 4 | `/vc-meeting "투자자명"` | 아웃리치, 미팅 준비, 후속조치, DD 관리 |

## 전체 커맨드 지도

### 기본 커맨드 (매일 사용하는 4개)

| 커맨드 | 역할 | 빈도 |
|---|---|---|
| `/fundraise` | 메인 라우터 — 목표 설정 후 다음 루틴 추천 | 매일 시작점 |
| `/fundraise-data` | 자료 폴더를 표준 구조로 정리 | 최초 1회 + 수시 |
| `/find-vc` | VC/AC/TIPS 후보 탐색 + 공식 근거 | 라운드 초반 |
| `/vc-meeting` | 투자자별 관계·미팅·DD 관리 | 미팅마다 |

### 고급 커맨드 (상황별 15개)

| 커맨드 | 역할 | 빈도 |
|---|---|---|
| `/daily-fundraise` | 일일 브리핑 — 우선순위, 팔로업, 미팅 준비 | 매일 아침 |
| `/lead-dashboard` | 빠른 스냅샷 — 단계별 현황, 오늘의 액션 | 매일/수시 |
| `/fundraise-pipeline` | 심층 건강진단 — 4차원 점수, 3x 커버리지, 병목 | 주 1회 |
| `/fundraise-office-hours` | 소크라테스식 목표/생존/의사결정 정리 | 막힐 때 |
| `/deal-sourcing` | 투자자 타겟 발굴 + Thesis 매칭 (find-vc의 원형) | 라운드 초반 |
| `/investor-outreach` | 웜인트로/콜드 이메일 작성 | 아웃리치 시 |
| `/dd-prep` | DD/미팅 준비 — 예상 질문, 데이터룸 체크리스트 | 미팅 전 |
| `/investor-update` | 월간/분기 투자자 업데이트 작성 | 월 1회 |
| `/pitch-review` | 피치 덱 100점 평가 + 슬라이드별 개선 | 덱 수정 시 |
| `/create-ir-asset` | IR HTML 아티팩트 (원페이저, 데이터룸 랜딩) | 필요시 |
| `/fundraise-forecast` | 확약/가중 예측, 런웨이 교차점, 갭 분석 | 월 1회 |
| `/business-case` | 시장·경쟁·재무를 병렬 에이전트로 한 번에 | 라운드 준비 |
| `/market-opportunity` | TAM/SAM/SOM 3방법론 교차검증 | 필요시 |
| `/gtm-plan` | GTM 전략 + 90일 실행 계획 | 필요시 |
| `/vc-funds-setup` | VC/AC 공시 로컬 MCP 설치 설계·점검 | 최초 1회 |

## 이럴 땐 이 커맨드

| 상황 | 추천 | 이유 |
|---|---|---|
| 처음이라 뭘 해야 할지 모름 | `/fundraise` | 목표부터 정하고 라우팅 받기 |
| runway가 몇 개월인지도 불확실 | `/fundraise-office-hours` | 첫 질문이 runway 체크 |
| 자료가 폴더 여기저기 흩어짐 | `/fundraise-data` | 표준 구조로 정리 |
| 만날 투자자가 부족함 | `/find-vc` | 후보 + 공식 근거 + 미팅 순서 |
| 다음 주 VC 미팅이 잡힘 | `/vc-meeting` → `/dd-prep` | 준비 → 예상 질문 |
| 미팅은 했는데 답이 없음 | `/vc-meeting` (팔로업 모드) | 행동 기반 stage 판단 |
| 전체 현황을 빠르게 보고 싶음 | `/lead-dashboard` | 스냅샷 |
| 진행이 느린 이유를 알고 싶음 | `/fundraise-pipeline` | 병목 심층 진단 |
| 라운드 마감 가능성을 예측하고 싶음 | `/fundraise-forecast` | 가중 예측 + 갭 |
| 투자자에게 근황을 알리고 싶음 | `/investor-update` | 월간 업데이트 |
| 덱을 고치고 싶음 | `/pitch-review` | 100점 평가 |

**페르소나별 중심 경로:**
- **초기 (pre-seed/seed)**: 첫 실행 시퀀스 4단계 그대로. TIPS는 `/find-vc`가 운영사 관점으로 함께 다룹니다.
- **중기 (Series A/B)**: `/fundraise-pipeline`, `/fundraise-forecast`, `/business-case`, `/investor-update` 중심으로 운영합니다.

## 연결 상태 안내

**MCP 없이 되는 것 (웹 검색만으로 단독 작동):** 모든 커맨드가 기본 작동합니다. VCS 투자자/모태출자펀드 검색과 웹 리서치 기반입니다.

**연결하면 강화되는 것:**

| 연결 | 강화 내용 | 확인 방법 |
|---|---|---|
| `~~fund disclosure` (vc-fund-disclosure, 선택 설치) | KVIC/KVCA 공식 공시를 로컬 DB에서 근거와 함께 즉시 조회 | `vc-funds doctor` |
| `~~CRM` (HubSpot, Notion 등) | 파이프라인 자동 로드/기록 | 커맨드 실행 시 자동 감지 |
| `~~email` / `~~calendar` | 아웃리치 발송, 미팅 일정 연동 | 〃 |

vc-fund-disclosure 설치는 `/vc-funds-setup`을 실행하거나 README의 curl 한 줄 설치를 따르세요. 검색 결과가 시드 데이터뿐이라면 `vc-funds setup --with-data --consent`로 데이터 부트스트랩을 실행합니다.

## 관련 스킬

이 커맨드 실행 시 `fundraising-process` 스킬이 자동 활성화됩니다.

---
description: startup-apply 도움말 — 전체 커맨드 지도, 상황별 추천, 시작 가이드, HWP 내보내기 상태 점검
argument-hint: "[상황 설명 (예: '처음 시작', '문서가 하나도 없어', 'HWP가 안 나와')]"
---

# /apply-help

startup-apply 플러그인의 자기 완결적 도움말입니다. README를 읽지 않아도 이 커맨드 하나로 무엇부터 할지 알 수 있습니다.

## 사용법

```bash
/apply-help                           # 전체 커맨드 지도 + 시작 가이드
/apply-help "처음 시작"                # 상황 맞춤 추천
/apply-help "문서가 하나도 없어"        # → /kb-init --interview 안내
/apply-help "HWP 파일이 안 만들어져"    # → 의존성 점검 안내
```

## 작동 방식

```
┌─────────────────────────────────────────────────────────────────┐
│                       APPLY HELP                                 │
├─────────────────────────────────────────────────────────────────┤
│  인수 없음                                                        │
│  ✓ 첫 경험 경로 안내 (KB 없이 바로 시작 가능)                     │
│  ✓ 전체 커맨드 지도 (8개 + 파이프라인 도식)                       │
│  ✓ hwp-generator 연결 상태 확인 방법                              │
├─────────────────────────────────────────────────────────────────┤
│  인수 있음 (상황 서술)                                            │
│  ✓ 상황 → 커맨드 매칭 후 1~3개만 추천                             │
│  ✓ 예비창업자/법인 여부를 확인해 경로 분기                         │
└─────────────────────────────────────────────────────────────────┘
```

## 첫 경험 경로 — KB 없이 바로 시작

지식베이스가 없어도 공고 소싱과 적합도 분석은 바로 됩니다:

| 단계 | 커맨드 | 목적 |
|---|---|---|
| 1 | `/apply-find "AI SaaS 초기창업"` | 지원사업 공고 소싱 (KB 불필요) |
| 2 | `/apply-check "공고명"` | 자격요건 적합도 분석 |
| 3 | `/kb-init` 또는 `/kb-init --interview` | 지식베이스 구축 (문서 없으면 인터뷰 모드) |
| 4 | `/apply-write "공고명"` → `/apply-export "공고명"` | 사업계획서 작성 → HWPX 출력 |

이후 매일 아침 `/apply-daily`로 마감 임박과 진행률을 확인합니다.

## 전체 커맨드 지도

```
[과거 문서 또는 인터뷰]
        ↓
    /kb-init ←──────── /kb-update (갱신)
        ↓
   지식베이스 (7개 카테고리)
        ↓
/apply-find → /apply-check → /apply-write → /apply-export
   (소싱)      (적합도)        (작성)         (HWPX 출력)
                                 ↑
                          /apply-update
                        (기존 계획서 재활용)

매일 아침: /apply-daily (마감·진행률·신규 공고 브리핑)
```

| 커맨드 | 역할 | 빈도 |
|---|---|---|
| `/apply-daily` | 데일리 브리핑 — 마감 임박, 진행률, 신규 공고 | 매일 아침 |
| `/apply-find` | 공고 소싱 — 정부/민간/지자체/해외 | 주 1~2회 |
| `/apply-check` | 특정 공고 적합도 상세 분석 | 공고 발견 시 |
| `/apply-write` | 사업계획서 자동 작성 | 지원 결정 시 |
| `/apply-update` | 기존 계획서를 새 공고에 맞게 변환 | 재지원 시 |
| `/apply-export` | Markdown → HWPX 출력, 양식 채우기 | 제출 전 |
| `/kb-init` | 지식베이스 초기 구축 (문서 추출 또는 인터뷰) | 최초 1회 |
| `/kb-update` | KB 갱신 — 카테고리별/파일 추출/점검 | 월 1회+ |

## 이럴 땐 이 커맨드

| 상황 | 추천 | 이유 |
|---|---|---|
| 처음이라 뭘 해야 할지 모름 | `/apply-find` | KB 없이 바로 공고부터 |
| 과거 사업계획서·IR이 있음 | `/kb-init` | 문서에서 자동 추출 |
| 문서가 하나도 없음 | `/kb-init --interview` | 질문-답변으로 구축 |
| 아직 법인 설립 전 (예비창업자) | `/kb-init --interview` → `/apply-find "예비창업패키지"` | 예비창업자 스키마 적용 |
| 이 공고에 지원해도 될지 궁금 | `/apply-check "공고명"` | 자격요건 대조 |
| 작년에 낸 계획서를 재활용하고 싶음 | `/apply-update` | diff 기반 변환 |
| 분기 실적이 바뀜 | `/kb-update financials` 또는 `/kb-update --from 분기보고서.pdf` | 카테고리 갱신 |
| 마감이 코앞인데 현황 파악이 안 됨 | `/apply-daily` | 우선순위 브리핑 |
| 제출용 HWP 파일이 필요함 | `/apply-export "공고명"` | HWPX 생성 |

**페르소나별 중심 경로:**
- **예비창업자**: `/kb-init --interview` → 예비창업패키지/청년창업사관학교 소싱. 업력·매출 항목은 채점에서 자동 제외됩니다.
- **초기 (법인 1~3년)**: 첫 경험 경로 4단계 그대로. TIPS는 startup-fundraise 플러그인의 `/find-vc`와 병행하면 운영사 관점까지 커버됩니다.
- **중기 (3~7년)**: `/apply-update`(재활용)와 `/kb-update --from`(실적 반영) 중심. 창업성장기술개발, AI 바우처 등 업력 있는 기업 대상 공고가 주 타겟입니다.

## HWP 내보내기 상태 점검

`/apply-export`는 로컬 hwp-generator MCP 서버를 사용합니다. **`/apply-export --doctor`를 실행하면 아래 항목을 자동으로 점검해 줍니다.** 수동으로 확인하려면:

| 증상 | 확인/해결 |
|---|---|
| HWPX 대신 Markdown만 나옴 | hwp-generator 미연결. Claude Code 재시작 후 재시도 |
| 첫 실행이 오래 걸림 | 정상 — 전용 venv(`~/.cache/startup-apply/hwp-venv`) 자동 생성 중 (1~2분, 최초 1회) |
| 자동 설치 실패 (오프라인 등) | `python3 -m venv ~/.cache/startup-apply/hwp-venv && ~/.cache/startup-apply/hwp-venv/bin/pip install mcp lxml` |
| .hwp 양식 변환 실패 | Java 11+ 설치 + [hwp2hwpx releases](https://github.com/neolord0/hwp2hwpx/releases)에서 `hwp2hwpx-all.jar`를 받아 플러그인 `hwp_server/`에 배치 |
| 이미지/PDF가 필요함 | 미지원 — HWPX 생성 후 한컴오피스에서 이미지 삽입, "PDF로 저장" |

## 관련 스킬

이 커맨드 실행 시 `gov-program-knowledge`, `kb-structure` 스킬이 자동 활성화됩니다.

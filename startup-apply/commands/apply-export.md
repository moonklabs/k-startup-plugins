---
description: 사업계획서를 HWPX 파일로 내보냅니다 — Markdown → HWPX 변환, {{placeholder}} 양식 채우기
argument-hint: "<공고명> [--template 양식파일] | --doctor"
---

# /apply-export

> 익숙하지 않은 플레이스홀더가 보이거나 연결된 도구를 확인하려면 [CONNECTORS.md](../CONNECTORS.md)를 참조하세요.

완성된 사업계획서 Markdown을 HWPX 파일로 변환합니다. 공고에서 제공하는 양식 파일이 있으면 해당 양식에 내용을 자동으로 채웁니다.

## 사용법

```
/apply-export 창업성장기술개발                           # HWPX 생성
/apply-export TIPS --template 양식.hwpx                # 양식 기반 (HWPX 양식)
/apply-export TIPS --template 양식.hwp                 # 양식 기반 (구형 HWP 자동 변환)
/apply-export --doctor                                 # 의존성 상태 진단
```

---

## 작동 방식

기본 엔진은 **kordoc CLI**(Node 기반, `npx`로 즉시 실행 — 별도 설치 불필요)입니다. Claude Code 환경에는 Node가 항상 있으므로 추가 의존성이 없습니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                     APPLY EXPORT (kordoc 엔진)                    │
├─────────────────────────────────────────────────────────────────┤
│  기본 모드 (양식 없음)                                            │
│  ✓ kordoc generate: Markdown → HWPX (공문서 preset)             │
│  ✓ 한국 공문서 서식 자동 적용                                     │
├─────────────────────────────────────────────────────────────────┤
│  양식 모드 (--template)                                          │
│  ✓ kordoc fill: 서식 빈칸/{{placeholder}} 자동 감지·채우기        │
│  ✓ --dry-run으로 채울 필드 목록 사전 확인                         │
│  ✓ hwpx-preserve: 원본 양식의 서식/레이아웃 보존                  │
├─────────────────────────────────────────────────────────────────┤
│  폴백 순서                                                        │
│  1순위 kordoc CLI (npx -y kordoc)                                │
│  2순위 hwp-generator MCP 서버 (레거시, Python)                   │
│  3순위 Markdown 초안 + 수동 작업 안내                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4단계 워크플로우

```
/apply-export 창업성장기술개발
        │
        ▼
1단계: 소스 확인
  사업계획서 Markdown 파일 로드
  이미지, 표, 차트 등 첨부 자료 확인
        │
        ▼
2단계: 양식 분기
  ├── --template 양식.hwpx
  │     → npx -y kordoc fill 양식.hwpx --dry-run   (필드 목록 확인)
  │     → npx -y kordoc fill 양식.hwpx -j 필드.json -o 출력.hwpx
  ├── --template 양식.hwp
  │     → kordoc fill 직접 시도, 실패 시
  │       한컴오피스에서 .hwpx로 저장 후 재시도 안내
  └── 양식 없음
        → npx -y kordoc generate 사업계획서.md -o 출력.hwpx
          (공문서 preset 서식 자동 적용)
        │
        ▼
3단계: 결과 검증
  npx -y kordoc 출력.hwpx   (라운드트립 파싱으로 내용 확인)
  ※ 이미지는 HWPX 생성 후 한컴오피스에서 수동 삽입
        │
        ▼
4단계: 출력
  파일 크기 / 라운드트립 검증 결과 리포트
  ※ 페이지 수는 렌더링 없이는 알 수 없어 한컴오피스에서 확인
  → ./output/[공고명]_[날짜].hwpx
```

---

## 엔진 참조

### 1순위: kordoc CLI (기본)

`npx -y kordoc`로 즉시 실행합니다 (`skills/hwp-format/SKILL.md` 참조):

| 명령 | 사용 시점 |
|------|---------|
| `kordoc generate 초안.md -o 출력.hwpx` | 양식 없는 신규 HWPX 생성 (공문서 preset) |
| `kordoc fill 양식.hwpx --dry-run` | 양식의 채울 필드 목록 확인 |
| `kordoc fill 양식.hwpx -f '필드=값' -o 출력.hwpx` | 양식 채우기 (원본 서식 보존) |
| `kordoc fill 양식.hwpx -j 필드.json -o 출력.hwpx` | 필드가 많을 때 JSON 파일로 채우기 |
| `kordoc 파일.hwpx` | 라운드트립 검증 (HWPX → Markdown 재파싱) |
| `kordoc patch 원본.hwpx 편집.md -o 반영.hwpx` | 기존 HWPX 문서 부분 수정 |

### 2순위: hwp-generator MCP (레거시 폴백)

Node/npx를 쓸 수 없는 환경에서만 사용합니다. `create_document` → `add_heading`/`add_paragraph`/`add_table` → `export_file` 순서로 호출하고, 양식은 `fill_template`(`{{placeholder}}` 치환)으로 처리합니다.

---

## 출력 예시

```
✅ HWPX 생성 완료

파일: ./output/창업성장기술개발_2026_[회사명].hwpx
문단 수: 142개
파일 크기: 2.1 MB

→ 한컴오피스에서 열어 페이지 수 제한(공고 요강 확인)과 서식을 최종 확인 후 제출하세요.
→ .hwp로 변환 필요 시: 한컴오피스에서 "다른 이름으로 저장 → HWP"
```

---

## 진단 모드 (--doctor)

`/apply-export --doctor`를 실행하면 파일을 생성하지 않고 엔진 상태만 점검해 보고합니다. 다음 항목을 순서대로 확인합니다:

1. **kordoc CLI (기본 엔진)**: `npx -y kordoc --version` 실행 — 성공하면 모든 기능 사용 가능. 실패하면 Node.js 상태 확인 안내
2. **kordoc 기능 시험**: 임시 Markdown으로 `kordoc generate` → 라운드트립 파싱 1회 (선택, `--doctor --full`일 때만)
3. **hwp-generator MCP (레거시 폴백)**: `get_document_info` 도구 응답 여부 — kordoc이 정상이면 참고 정보로만 표시
4. **레거시 폴백 의존성**: venv(`~/.cache/startup-apply/hwp-venv`), Java, hwp2hwpx-all.jar — kordoc이 정상이면 전부 불필요하므로 상태만 표기

출력 형식:

```markdown
# apply-export 진단 결과

| 항목 | 상태 | 조치 |
|------|------|------|
| kordoc CLI (기본 엔진) | ✅ v1.x — 생성/양식 채우기 가능 | - |
| hwp-generator MCP (폴백) | ✅ 연결됨 | - (kordoc 정상이므로 미사용) |
| 폴백 venv / Java / jar | ⚠️ 일부 없음 | kordoc 정상이므로 불필요 |

→ HWPX 생성: 가능 / 양식 채우기: 가능 / .hwp 파싱: 가능 (모두 kordoc)
```

---

## 한계 및 폴백

| 상황 | 대응 |
|------|------|
| kordoc 실행 실패 (npx 불가 등) | hwp-generator MCP 폴백 → 그것도 없으면 Markdown 초안 + 수동 작업 안내 |
| `kordoc fill --dry-run`에 필드가 안 잡힘 | 양식에 `{{마커}}` 삽입 안내 또는 섹션별 Markdown + 수동 복붙 안내 |
| .hwp 양식의 fill 실패 | 한컴오피스에서 .hwpx로 저장 후 재시도 안내 |
| 복잡한 양식 (다단, 특수 레이아웃) | `kordoc fill` 결과를 라운드트립 파싱으로 검증 후, 깨지면 수동 복붙 안내 |
| 이미지 삽입 필요 | HWPX 생성 후 한컴오피스에서 수동 삽입 안내 |
| 구형 기관 .hwp만 수락 | HWPX 생성 후 "한컴오피스에서 .hwp로 저장" 안내 |

---

## 엔진 설정

### kordoc (기본 — 설치 불필요)

`npx -y kordoc`이 첫 실행 시 자동으로 패키지를 받아 실행합니다. Claude Code가 Node 기반이므로 **아무것도 설치할 필요가 없습니다.** 자주 사용한다면 전역 설치로 첫 실행을 빠르게 할 수 있습니다: `npm install -g kordoc`

### hwp-generator MCP (레거시 폴백)

플러그인 `.mcp.json`에 stdio 서버로 등록되어 있으며, 첫 실행 시 부트스트랩 런처가 전용 venv(`~/.cache/startup-apply/hwp-venv`)를 자동 생성합니다. kordoc이 정상이면 사용되지 않으므로 신경 쓸 필요 없습니다. 관련 상세(수동 venv 생성, Java/hwp2hwpx-all.jar)는 `hwp-format` 스킬을 참조하세요.

---

## 관련 커맨드

- `/apply-write` — 사업계획서 작성
- `/apply-update` — 기존 사업계획서 재활용

## 관련 스킬

이 커맨드 실행 시 `hwp-format` 스킬이 자동 활성화됩니다.

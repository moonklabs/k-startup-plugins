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

```
┌─────────────────────────────────────────────────────────────────┐
│                     APPLY EXPORT                                 │
├─────────────────────────────────────────────────────────────────┤
│  기본 모드 (양식 없음)                                            │
│  ✓ 표준 사업계획서 HWPX 템플릿으로 신규 생성                       │
│  ✓ 한국 정부 공문서 서식 자동 적용                                │
│    (함초롬바탕, 11pt, 줄간격 160%, A4, 표준 여백)                │
├─────────────────────────────────────────────────────────────────┤
│  양식 모드 (--template)                                          │
│  ✓ .hwp 입력 → hwp2hwpx(Java)로 HWPX 자동 변환                  │
│  ✓ .hwpx 입력 → {{placeholder}} 마커 치환으로 내용 삽입          │
│    (양식에 {{회사명}} 같은 마커를 먼저 넣어야 합니다)              │
│  ✓ 원본 양식의 서식/레이아웃 유지                                  │
├─────────────────────────────────────────────────────────────────┤
│  hwp-generator MCP 서버 필요                                     │
│  MCP 서버 미실행 시: Markdown 초안 + 수동 안내로 fallback         │
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
  ├── --template 양식.hwp
  │     → convert_hwp_to_hwpx 도구로 변환
  │     → fill_template 도구로 내용 삽입
  ├── --template 양식.hwpx
  │     → fill_template 도구로 내용 삽입
  └── 양식 없음
        → create_document 도구로 신규 생성
        → 표준 서식 적용
        │
        ▼
3단계: HWPX 생성 (hwp-generator MCP 서버)
  - add_heading: 제목 구조 생성
  - add_paragraph: 본문 텍스트 삽입
  - add_table: 표 변환
  - set_page_setup: 페이지/여백 설정
  ※ 이미지는 HWPX 생성 후 한컴오피스에서 수동 삽입
        │
        ▼
4단계: 검증 및 출력
  파일 정상 생성 확인 (get_document_info)
  문단 수 / 파일 크기 리포트
  ※ 페이지 수는 렌더링 없이는 알 수 없어 한컴오피스에서 확인
  → ./output/[공고명]_[날짜].hwpx
```

---

## MCP 도구 참조

hwp-generator MCP 서버에서 제공하는 도구 (`skills/hwp-format/SKILL.md` 참조):

| 도구 | 사용 시점 |
|------|---------|
| `convert_hwp_to_hwpx` | HWP 양식 파일 변환 (Java 11+ 및 hwp2hwpx-all.jar 필요) |
| `create_document` | 양식 없는 신규 문서 생성 |
| `fill_template` | 양식의 `{{placeholder}}` 마커 치환 |
| `add_heading` | 제목/소제목 삽입 |
| `add_paragraph` | 본문 텍스트 삽입 |
| `add_table` | 표 삽입 |
| `set_page_setup` | 페이지 설정 |
| `export_file` | 최종 HWPX 파일 저장 |
| `get_document_info` | 문서 상태(문단 수 등) 확인 |

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

`/apply-export --doctor`를 실행하면 파일을 생성하지 않고 의존성 상태만 점검해 보고합니다. 다음 항목을 순서대로 확인합니다:

1. **hwp-generator MCP 연결**: `get_document_info` 도구를 호출해 응답 여부 확인. 도구 자체가 없으면 "미연결 — Claude Code 재시작 필요 또는 플러그인 재설치" 안내
2. **전용 venv 상태**: `~/.cache/startup-apply/hwp-venv/bin/python -c "import mcp, lxml"` 실행 결과 확인 (없으면 첫 export 시 자동 생성됨을 안내)
3. **Java 런타임**: `java -version` 실행 — 없으면 ".hwp 양식 변환만 불가, HWPX 직접 생성은 가능" 안내
4. **hwp2hwpx-all.jar**: 플러그인 `hwp_server/` 및 `hwp_server/lib/`에서 파일 존재 확인 — 없으면 다운로드 링크 안내

출력 형식:

```markdown
# apply-export 진단 결과

| 항목 | 상태 | 조치 |
|------|------|------|
| hwp-generator MCP | ✅ 연결됨 | - |
| 전용 venv (mcp, lxml) | ✅ 정상 | - |
| Java 런타임 | ⚠️ 없음 | .hwp 변환 필요 시 JRE 11+ 설치 |
| hwp2hwpx-all.jar | ⚠️ 없음 | github.com/neolord0/hwp2hwpx/releases에서 다운로드 |

→ 기본 HWPX 생성: 가능 / .hwp 양식 변환: 불가
```

---

## 한계 및 폴백

| 상황 | 대응 |
|------|------|
| hwp-generator MCP 서버 미연결 | Markdown 초안 출력 + 한컴오피스에서 수동 작업 안내 |
| 양식에 `{{placeholder}}` 마커 없음 | 마커 삽입 방법 안내 또는 섹션별 Markdown + 양식에 수동 복붙 안내 |
| Java 또는 hwp2hwpx-all.jar 미설치 (HWP→HWPX 변환 불가) | HWPX 직접 생성으로 fallback |
| 이미지 삽입 필요 | HWPX 생성 후 한컴오피스에서 수동 삽입 안내 |
| 구형 기관 .hwp만 수락 | HWPX 생성 후 "한컴오피스에서 .hwp로 저장" 안내 |

---

## hwp-generator MCP 서버 설정

hwp-generator 서버는 플러그인의 `.mcp.json`에 stdio 서버로 등록되어 있어 Claude Code가 자동으로 실행합니다. 첫 실행 시 부트스트랩 런처가 전용 venv(`~/.cache/startup-apply/hwp-venv`)를 자동 생성해 의존성(mcp, lxml)을 설치하므로 **사용자가 수동으로 설치할 것은 없습니다** (첫 실행만 1~2분 소요). macOS Homebrew처럼 시스템 Python이 PEP 668로 pip 설치를 막는 환경에서도 그대로 작동합니다.

자동 설치가 실패하면(예: 오프라인) 수동으로 설치할 수 있습니다:

```bash
# 플러그인 설치 경로의 hwp_server에서
python3 -m venv ~/.cache/startup-apply/hwp-venv
~/.cache/startup-apply/hwp-venv/bin/pip install -r requirements.txt
```

구형 .hwp 양식 변환(`convert_hwp_to_hwpx`)까지 쓰려면 추가로:

1. Java(JRE 11+) 설치
2. [hwp2hwpx releases](https://github.com/neolord0/hwp2hwpx/releases)에서 `hwp2hwpx-all.jar`를 받아 `hwp_server/` 디렉토리(또는 `hwp_server/lib/`)에 배치

의존성이 없어도 커맨드는 동작하며, 이 경우 Markdown 초안 생성으로 fallback합니다.

---

## 관련 커맨드

- `/apply-write` — 사업계획서 작성
- `/apply-update` — 기존 사업계획서 재활용

## 관련 스킬

이 커맨드 실행 시 `hwp-format` 스킬이 자동 활성화됩니다.

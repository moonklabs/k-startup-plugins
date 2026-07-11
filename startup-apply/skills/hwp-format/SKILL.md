---
name: hwp-format
description: HWP/HWPX 파일 형식 및 한국 공문서 서식 규칙을 안내합니다. "HWP", "HWPX", "한글 파일", "문서 내보내기", "파일 변환", "apply-export" 등의 맥락에서 자동 활성화됩니다.
---

# HWP/HWPX 파일 형식 가이드

## HWP vs HWPX

| 항목 | HWP (구형) | HWPX (신형) |
|------|-----------|------------|
| 파일 구조 | 바이너리 (OLE) | ZIP + XML (OOXML 유사) |
| 프로그래밍 처리 | 매우 어려움 | Python/Java로 생성 가능 |
| 한컴오피스 지원 | ✅ | ✅ (한컴오피스 2014+) |
| 정부 제출 | ✅ | ✅ (대부분 허용) |
| 파일 확장자 | .hwp | .hwpx |

**이 플러그인의 기본 출력 포맷:** HWPX

HWP 양식 파일이 있는 경우 `hwp2hwpx`(Java 라이브러리)로 HWPX로 변환 후 처리합니다.

---

## HWPX 파일 구조

HWPX는 ZIP 파일 안에 XML 파일들이 담긴 OCF 컨테이너 구조입니다 (EPUB과 유사):

```
document.hwpx (ZIP, OCF 컨테이너)
├── mimetype                  ← MIME 타입 선언
├── META-INF/
│   └── container.xml         ← 패키지 매니페스트
└── Contents/
    ├── content.hpf           ← 패키지 스펙 (OPF)
    ├── header.xml            ← 문서 헤더 (스타일, 페이지 설정)
    └── section0.xml          ← 본문 섹션 내용
```

한컴오피스로 저장한 실제 파일에는 `BinData/`(이미지 등 바이너리), `Preview/` 등이 추가될 수 있습니다. 이 플러그인의 생성기는 텍스트/제목/표 중심의 최소 구조를 생성합니다.

---

## 한국 정부 공문서 서식 표준

사업계획서 작성 시 다음 서식을 준수합니다:

### 글꼴

| 용도 | 글꼴 | 대체 |
|------|------|------|
| 본문 | 함초롬바탕 | 맑은 고딕, 바탕 |
| 제목/소제목 | 함초롬돋움 | 맑은 고딕, 돋움 |
| 영문/숫자 | HY중고딕 | Arial |

### 글자 크기

| 용도 | 크기 |
|------|------|
| 대제목 | 16pt |
| 소제목 | 13pt |
| 본문 | 11pt |
| 주석/캡션 | 9pt |

### 줄 간격 및 여백

| 항목 | 권장값 |
|------|-------|
| 본문 줄 간격 | 160~180% |
| 용지 | A4 (210×297mm) |
| 여백 상 | 20mm |
| 여백 하 | 15mm |
| 여백 좌/우 | 20mm |
| 머리말 | 10mm |
| 꼬리말 | 10mm |

---

## 사업계획서 레이아웃 규칙

### 표지

```
[상단 여백]
공고명 (16pt, 중앙 정렬)
사업계획서 (20pt, 굵게, 중앙 정렬)

[중앙 공백]

회사명: ○○주식회사
대표자: 홍길동
제출일: 2026년 3월 1일
[하단 여백]
```

### 목차

자동 목차 기능 사용 권장. 수동 작성 시:
- 제목 번호: 1. / 1.1 / 1.1.1 형식
- 점선(……) + 페이지 번호

### 본문

- 제목(대): H1 스타일, 굵게, 밑줄
- 제목(소): H2 스타일, 굵게
- 소제목: H3 스타일, 굵게
- 본문: 기본 스타일
- 페이지 번호: 꼬리말 중앙

---

## hwp2hwpx 변환 안내

구형 .hwp 양식 파일을 .hwpx로 변환:

```
사용 라이브러리: hwp2hwpx (Java)
GitHub: https://github.com/neolord0/hwp2hwpx
```

**요구 환경:**
- Java Runtime Environment (JRE) 11+
- `hwp2hwpx-all.jar` — [GitHub releases](https://github.com/neolord0/hwp2hwpx/releases)에서 다운로드해 `hwp_server/`(또는 `hwp_server/lib/`)에 배치

**변환 명령:**
```bash
java -jar hwp2hwpx-all.jar input.hwp output.hwpx
```

MCP 서버의 `convert_hwp_to_hwpx` 도구가 이 과정을 자동으로 처리합니다 (jar 경로를 `jar_path` 파라미터로 직접 지정할 수도 있습니다).
Java가 없는 환경에서는 변환을 건너뛰고 HWPX 직접 생성 모드로 fallback합니다.

---

## hwp-generator MCP 서버 도구 참조

`/apply-export` 커맨드에서 사용하는 MCP 도구:

| 도구명 | 기능 | 주요 파라미터 |
|-------|------|------------|
| `create_document` | 새 HWPX 문서 생성 | paper_size, margins, styles |
| `add_heading` | 제목 삽입 | text, level (1~3) |
| `add_paragraph` | 본문 텍스트 삽입 | text, bold, italic, underline |
| `add_table` | 표 삽입 | rows, cols, data, merge_cells |
| `fill_template` | 양식 HWPX의 `{{placeholder}}` 치환 | template_path, replacements |
| `set_page_setup` | 페이지 설정 | paper, margins, header, footer |
| `convert_hwp_to_hwpx` | HWP → HWPX 변환 | input_path, output_path, jar_path |
| `export_file` | 최종 HWPX 파일 저장 | output_path |
| `get_document_info` | 문서 상태(문단 수 등) 확인 | doc_id |

이미지 삽입 도구는 제공하지 않습니다. 이미지가 필요하면 HWPX 생성 후 한컴오피스에서 수동 삽입을 안내합니다. PDF 출력도 지원하지 않으며 한컴오피스의 "PDF로 저장"을 안내합니다.

---

## 양식 파일 채우기 (`{{placeholder}}` 방식)

`fill_template` 도구는 양식 HWPX 안의 `{{이름}}` 형태 마커를 문자열 치환합니다. 정부 공고 원본 양식의 빈 필드 패턴(`○○○○○`, `[ ]`, `(   )`)은 **자동 탐지하지 않습니다.**

권장 절차:

1. 공고 양식(.hwp는 먼저 `convert_hwp_to_hwpx`로 변환)을 한컴오피스에서 열어 채울 자리에 `{{회사명}}`, `{{대표자}}`, `{{사업개요}}` 같은 마커를 입력하고 HWPX로 저장
2. `fill_template`에 `template_path`와 `replacements`(마커 → 내용 매핑)를 전달
3. 마커 작업이 어려우면 섹션별 Markdown 초안을 생성해 양식에 수동 복붙

---

## 한계 및 대안

| 상황 | 대응 방법 |
|------|---------|
| 복잡한 양식 (다단, 특수 레이아웃) | 자동 채우기 실패 시 Markdown 초안 + 수동 복붙 안내 |
| Java 또는 hwp2hwpx-all.jar 미설치 | HWP 변환 건너뛰고 HWPX 직접 생성 |
| PDF 제출 요구 | HWPX 생성 후 한컴오피스에서 "PDF로 저장" 안내 |
| 구형 공공기관 .hwp만 수락 | HWPX 생성 후 한컴오피스에서 .hwp로 저장 안내 |

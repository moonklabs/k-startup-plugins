# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## 레포지토리 개요

이 레포지토리는 Codex 플러그인 마켓플레이스 모음입니다. 현재 `startup-fundraise` 플러그인이 포함되어 있으며, 스타트업 창업자의 VC/AC 투자 유치 일일 루틴을 지원합니다.

## 플러그인 설치 및 테스트

```bash
# 개발용 마켓플레이스 등록 (로컬 경로)
/plugin marketplace add /workspace/startup-plugins

# 플러그인 설치
/plugin install startup-fundraise@startup-plugins

# 플러그인 제거 (변경 후 재설치)
/plugin uninstall startup-fundraise@startup-plugins
```

> 설치 또는 제거 후 반드시 Codex를 재시작해야 변경사항이 적용됩니다.

## 레포지토리 구조

```
startup-plugins/
├── .Codex-plugin/
│   └── marketplace.json          # 마켓플레이스 정의 (이 레포가 제공하는 플러그인 목록)
└── startup-fundraise/                  # 플러그인 루트
    ├── .Codex-plugin/
    │   └── plugin.json           # 플러그인 메타데이터 (name, version, author)
    ├── .mcp.json                 # MCP 서버 사전 구성 (Slack, HubSpot, Notion, Clay 등)
    ├── commands/                 # 슬래시 커맨드 (각 파일 = 하나의 /커맨드)
    ├── skills/                   # 도메인 지식 스킬 (각 디렉토리 = 하나의 스킬)
    │   └── [skill-name]/
    │       ├── SKILL.md          # 스킬 본문
    │       └── references/       # (선택) 보조 참조 문서
    └── agents/                   # 병렬 실행 가능한 서브에이전트
        └── [agent-name].md       # 에이전트 시스템 프롬프트
```

**핵심 규칙**: `.Codex-plugin/` 디렉토리에는 `plugin.json`과 `marketplace.json` 매니페스트 파일만 위치합니다. commands, skills 등 모든 컴포넌트는 플러그인 루트에 있어야 합니다.

## 에이전트 파일 형식 (`agents/*.md`)

```markdown
---
name: agent-name
description: 자동 트리거될 상황 설명 및 키워드 (자연어로 기술)
tools: WebSearch, Read, Write
model: sonnet
---

[에이전트 시스템 프롬프트]
```

- 파일명 = 에이전트명 (`investor-researcher.md` → `investor-researcher` 에이전트)
- `tools` 필드: 에이전트가 사용할 도구 목록 (쉼표 구분)
- `model` 필드: `sonnet` 또는 `haiku` (복잡한 분석은 `sonnet` 권장)
- 에이전트는 커맨드 실행 중 병렬로 호출되어 독립적인 서브태스크를 처리합니다

## 커맨드 파일 형식 (`commands/*.md`)

```markdown
---
description: 커맨드 한 줄 설명
argument-hint: "<인수 설명>"
---

# /command-name

[커맨드 본문 — 워크플로우, 출력 형식, 단계별 안내]
```

- 파일명 = 슬래시 커맨드명 (`business-case.md` → `/business-case`)
- `argument-hint`는 선택 사항

## 스킬 파일 형식 (`skills/[name]/SKILL.md`)

```markdown
---
name: skill-name
description: 자동 트리거될 상황 설명 및 키워드 (자연어로 기술)
---

# 스킬 제목

[도메인 지식, 프레임워크, 템플릿, 체크리스트]
```

- `description` 필드의 자연어 키워드가 Codex의 자동 스킬 활성화를 결정합니다.
- `references/` 서브디렉토리에 보조 문서(벤치마크, 템플릿 등)를 추가할 수 있습니다.

## `~~category` 플레이스홀더 규칙

커맨드와 스킬 파일 내에서 MCP 도구를 참조할 때는 특정 제품명 대신 카테고리 플레이스홀더를 사용합니다:

| 플레이스홀더 | 대표 MCP 서버 |
|---|---|
| `~~CRM` | HubSpot, Notion, Affinity |
| `~~email` | Microsoft 365, Gmail |
| `~~calendar` | Microsoft 365, Google Calendar |
| `~~data enrichment` | Clay, ZoomInfo, Crunchbase |
| `~~spreadsheet` | Microsoft 365, Google Sheets |
| `~~docs` | Notion, Microsoft 365, Google Docs |
| `~~knowledge base` | Notion, Confluence |
| `~~analytics` | Mixpanel, Amplitude, ChartMogul |
| `~~chat` | Slack, Microsoft Teams |

이 규칙 덕분에 플러그인은 특정 도구에 종속되지 않습니다. `.mcp.json`에 사전 구성된 서버는 대표 예시이며, 동일 카테고리의 어떤 MCP 서버든 사용 가능합니다.

## 새 플러그인 추가 방법

1. `startup-fundraise/`를 참고하여 새 디렉토리 생성
2. `.Codex-plugin/plugin.json` 작성 (name, version, description, author)
3. `commands/` 및 `skills/` 추가
4. `.Codex-plugin/marketplace.json`에 새 플러그인 항목 추가:

```json
{
  "plugins": [
    { "name": "startup-fundraise", "source": "./startup-fundraise" },
    { "name": "new-plugin",  "source": "./new-plugin" }
  ]
}
```

## 커맨드 작성 모범 사례

커맨드 파일은 다음 구조를 따릅니다:

1. **작동 방식 ASCII 박스** — 단독 사용 vs. MCP 연결 강화 모드를 시각적으로 구분
2. **사용법 예시** — 인수 없음/있음/다양한 변형
3. **단계별 워크플로우** — 번호 목록으로 실행 순서 명시
4. **강화 모드 섹션** — `~~category` 별 추가 기능 설명
5. **관련 스킬** 섹션 — 이 커맨드가 활성화하는 스킬 목록

## 버전 관리 및 배포

```bash
# 버전 업 후 태그 생성
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

`startup-fundraise/.Codex-plugin/plugin.json`의 `version` 필드를 semantic versioning으로 관리합니다.

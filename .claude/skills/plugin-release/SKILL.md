---
name: plugin-release
description: k-startup-plugins 레포의 표준 유지보수·릴리스 루프를 실행합니다. "플러그인 릴리스", "배포해줘", "버전 올려서 재설치", "Linear에 등록하고 진행", "플러그인 수정 마무리", "커밋하고 배포", "테스트하고 릴리스" 등 플러그인 변경을 마무리·배포하는 맥락에서 활성화됩니다.
---

# Plugin Release Loop

이 레포(startup-fundraise / startup-apply 플러그인 마켓플레이스)의 변경 작업을 계획부터 배포·검증까지 일관되게 처리하는 표준 루프입니다. 모든 단계를 순서대로 따르되, 이미 완료된 단계는 건너뜁니다.

## 표준 루프 (9단계)

### 1. Linear 이슈 등록 (작업 시작 전)

- 팀: **스프린터블**, 담당: me, 제목 접두사: `[k-startup-plugins]`
- 본문에 **실측 근거**(테스트/분석 결과)와 작업 목록을 번호로 기재
- 규모가 크면 상위 이슈 + 하위 이슈로 분할

### 2. 구현

- 기계적 다건 편집(N개 파일에 동일 패턴)은 general-purpose 에이전트에 위임 — **제외 파일 목록을 명시**해 본체 작업과 충돌 방지
- 커맨드/스킬/에이전트 형식은 레포 CLAUDE.md 규약을 따름
- MCP 도구를 문서에 언급할 때는 실제 구현(server.py, kordoc CLI)과 대조 — **문서가 구현보다 앞서가면 안 됨**

### 3. 정적 검증

```bash
# JSON 매니페스트 유효성
python3 -c "import json; [json.load(open(f)) for f in ['.claude-plugin/marketplace.json','startup-apply/.claude-plugin/plugin.json','startup-apply/.codex-plugin/plugin.json','startup-apply/.mcp.json','startup-apply/.mcp.codex.json','startup-fundraise/.claude-plugin/plugin.json','startup-fundraise/.codex-plugin/plugin.json','startup-fundraise/.mcp.json']]; print('JSON OK')"
# 유령 MCP 도구 참조 (0이어야 정상; mcp/ 아카이브는 제외)
grep -rn "search_vc_database\|get_source_authority\|get_collection_health" startup-fundraise --include="*.md" | grep -v "mcp/vc-fund-disclosure/" | grep -cv "존재하지 않" || echo 0
# 커맨드 5요소 감사 (박스/사용법/관련 스킬/스킬 실존/빈 argument-hint)
# → references/audit-commands.py 실행
python3 .claude/skills/plugin-release/references/audit-commands.py
```

### 4. 기능 검증 (변경 영역에 해당하는 것만)

```bash
# kordoc 엔진 스모크 (HWP 체인 변경 시)
npx -y kordoc --version && npx -y kordoc generate <테스트.md> -o /tmp/t.hwpx --silent && npx -y kordoc /tmp/t.hwpx --silent
# hwp-generator MCP 폴백 handshake (hwp_server 변경 시)
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"t","version":"1"}}}\n' | timeout 30 python3 startup-apply/hwp_server/bootstrap.py 2>/dev/null | head -1
# help 커맨드 참조 무결성 (커맨드 추가/삭제 시): fundraise-help.md, apply-help.md가 참조하는 커맨드 파일 실존 확인
```

### 5. 버전 범프 — **반드시 두 매니페스트 동기화**

semver 기준: 문서 정정=patch, 기능 추가=minor. 플러그인마다 **두 곳**을 같은 값으로:

- `<plugin>/.claude-plugin/plugin.json` 의 `version`
- `<plugin>/.codex-plugin/plugin.json` 의 `version`

변경 없는 플러그인은 올리지 않습니다.

### 6. 커밋 & 푸시

- conventional commit (`feat:`/`fix:`/`docs:`/`chore:`), 본문에 Linear 이슈 번호(`SPR-N`) 명시
- **시크릿 게이트**: 루트 `/.mcp.json`(라이브 토큰)과 `SPRINTABLE_ONBOARDING.md`는 .gitignore 대상 — `git status`에 보이면 절대 add 금지
- `git push origin main`

### 7. 이중 배포 (Claude + Codex)

```bash
# Claude Code
claude plugin marketplace update startup-plugins
claude plugin uninstall startup-fundraise@startup-plugins; claude plugin uninstall startup-apply@startup-plugins
claude plugin install startup-fundraise@startup-plugins; claude plugin install startup-apply@startup-plugins
# Codex (GitHub 마켓플레이스 기준; add가 업데이트를 겸함)
codex plugin marketplace upgrade 2>/dev/null || true
codex plugin add startup-fundraise@startup-plugins
codex plugin add startup-apply@startup-plugins
```

### 8. 배포 검증

```bash
# Claude 설치본에 변경 반영 확인 (버전 디렉토리 + 핵심 변경 grep)
ls ~/.claude/plugins/cache/startup-plugins/*/
# Codex: hwp-generator가 상대경로+플러그인 루트 cwd로 등록됐는지
codex mcp list 2>&1 | grep hwp-generator
```

### 9. 마감

- Linear 이슈 → **Done** + `links`로 커밋 URL 첨부 (`https://github.com/moonklabs/k-startup-plugins/commit/<sha>`)
- 사용자에게 "Claude Code 재시작 시 적용" 안내
- 슬래시 커맨드/스킬 로드는 재시작 후에만 반영되므로, 재시작 전 검증은 설치 캐시 파일 기준으로 수행

## 핵심 불변식 (위반 시 배포 중단)

1. **이중 매니페스트 동기화** — 버전·설명이 `.claude-plugin`과 `.codex-plugin`에서 일치
2. **`${CLAUDE_PLUGIN_ROOT}`는 `.mcp.json`(Claude용)에만** — Codex용 `.mcp.codex.json`은 상대경로 + `"cwd": "."`
3. **문서 = 구현** — 존재하지 않는 도구/기능을 문서가 약속하면 안 됨
4. **커맨드 상호 참조 실존** — help/라우터 스킬의 커맨드 표는 파일 추가·삭제 시 함께 갱신 (`fundraise-help.md`, `apply-help.md`, `skills/*-command-router/SKILL.md`)
5. **시크릿 커밋 금지** — 루트 `.mcp.json` 등

## 관련 자료

- 검증 스크립트: `references/audit-commands.py`
- 레포 규약: 루트 `CLAUDE.md` (파일 형식, ~~category 플레이스홀더, 모범 사례 5요소)

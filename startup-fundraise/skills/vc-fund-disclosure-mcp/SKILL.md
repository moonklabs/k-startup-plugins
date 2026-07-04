---
name: vc-fund-disclosure-mcp
description: VC/AC 공시정보와 창업자 가이드 자료를 개인 로컬 DB/MCP로 설계, 설치, 검증할 때 사용합니다. 현재 P0는 KVIC FundFinder/KVCA DIVA HTML·CSV snapshot import, `vc-funds` CLI, stdio MCP, `search_vc_database`, source authority, collection health, data gap, schema doctor 검증에 집중합니다. PDF/HWP/HWPX/HWPML/Office 창업자 가이드 코퍼스, watch folder, browser capture, guide-source, founder guide import, Homebrew/GitHub Releases 설치는 planned surface로 구분하며 문서 파싱은 `kordoc` CLI/MCP adapter를 우선 사용합니다. "공시 MCP", "VC 데이터 로컬 DB", "KVIC/KVCA 수집", "vc-funds 설치", "FundFinder DB화", "투자유치 가이드 코퍼스 설계" 같은 요청에서 실행합니다.
---

# VC Fund Disclosure MCP

이 스킬은 얇은 진입점입니다. 실제 Source of Truth(SOT)는 아래 에이전트 파일입니다.

**SOT:** [vc-fund-disclosure-orchestrator](../../agents/vc-fund-disclosure-orchestrator.md)

## 사용 규칙

1. 이 스킬이 트리거되면 먼저 `startup-fundraise/agents/vc-fund-disclosure-orchestrator.md`를 읽고 그 지침을 따릅니다.
2. 스킬 본문에는 중복 정책/스키마/설치 절차를 늘리지 않습니다. 변경이 필요하면 SOT 에이전트 파일을 먼저 수정합니다.
3. 이 스킬은 `deal-sourcing`, `investor-research`, `fundraising-process`가 로컬 공시 DB나 창업자 가이드 코퍼스에 의존해야 할 때 연결 지점으로 사용합니다.
4. 실행 가능한 `vc-funds`/`vc-fund-disclosure-mcp`가 없으면 `NOT_READY`로 보고하고, `.mcp.json`에 가짜 서버를 등록하지 않습니다.
5. 구현 상세는 `startup-fundraise/mcp/vc-fund-disclosure/`의 source registry, schema, seed, tool contract, display query, quality check 파일을 canonical spec으로 봅니다.

## 빠른 라우팅

| 요청 | 처리 |
|---|---|
| 로컬 MCP 설치/검증 | SOT의 배포/설치 SOT와 검증 체크리스트를 따른다 |
| KVIC/KVCA snapshot import 설계 | SOT의 공시 evidence import 흐름을 따른다 |
| 창업자 PDF/HWP/HWPX 저장 | 현재 P0 런타임은 `NOT_READY`; SOT의 planned guide import와 `kordoc` CLI/MCP adapter 설계만 참조한다 |
| 죽은 PDF URL 등록 | 현재 P0 런타임은 `NOT_READY`; source URL 보존과 planned guide-source, `kordoc` import 설계만 참조한다 |
| 투자자 추천/리서치 | `deal-sourcing` 또는 `investor-research` 스킬과 함께 사용한다 |

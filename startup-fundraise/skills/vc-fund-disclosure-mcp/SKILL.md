---
name: vc-fund-disclosure-mcp
description: VC/AC 공시정보와 창업자 가이드 자료를 개인 로컬 DB/MCP로 설계, 설치, 검증할 때 사용합니다. canonical 구현(v0.4.1+, moonklabs/vc-fund-disclosure)은 KVIC FundFinder/KVCA DIVA HTML·CSV snapshot import, `vc-funds` CLI, stdio MCP, 조회 도구 8종(`search_investors`, `search_funds`, `search_guides`, `list_events` 등), PDF/HWP/HWPX/HWPML/Office 창업자 가이드 import(`import guide`, `guide-source add`), watch folder, Homebrew/GitHub Releases 설치, 데이터 부트스트랩(`setup --with-data --consent`)을 모두 갖췄습니다. 문서 파싱은 `kordoc` CLI/MCP adapter를 우선 사용합니다. "공시 MCP", "VC 데이터 로컬 DB", "KVIC/KVCA 수집", "vc-funds 설치", "FundFinder DB화", "투자유치 가이드 코퍼스 설계" 같은 요청에서 실행합니다.
---

# VC Fund Disclosure MCP

이 스킬은 얇은 진입점입니다. 실제 Source of Truth(SOT)는 아래 에이전트 파일입니다.

**SOT:** [vc-fund-disclosure-orchestrator](../../agents/vc-fund-disclosure-orchestrator.md)

## 사용 규칙

1. 이 스킬이 트리거되면 먼저 `startup-fundraise/agents/vc-fund-disclosure-orchestrator.md`를 읽고 그 지침을 따릅니다.
2. 스킬 본문에는 중복 정책/스키마/설치 절차를 늘리지 않습니다. 변경이 필요하면 SOT 에이전트 파일을 먼저 수정합니다.
3. 이 스킬은 `deal-sourcing`, `investor-research`, `fundraising-process`가 로컬 공시 DB나 창업자 가이드 코퍼스에 의존해야 할 때 연결 지점으로 사용합니다.
4. 실행 가능한 `vc-funds`/`vc-fund-disclosure-mcp`가 없으면 `NOT_READY`로 보고하고, `.mcp.json`에 가짜 서버를 등록하지 않습니다.
5. `startup-fundraise/mcp/vc-fund-disclosure/`는 canonical 전환 이전 설계 아카이브(참고용)입니다. 도구 계약 등 canonical spec은 `moonklabs/vc-fund-disclosure` 리포의 `docs/contracts/`를 참조합니다.

## 빠른 라우팅

| 요청 | 처리 |
|---|---|
| 로컬 MCP 설치/검증 | SOT의 배포/설치 SOT와 검증 체크리스트를 따른다 |
| KVIC/KVCA snapshot import 설계 | SOT의 공시 evidence import 흐름을 따른다 |
| 창업자 PDF/HWP/HWPX 저장 | SOT의 `import guide` + `kordoc` CLI/MCP adapter 흐름을 따른다 |
| 죽은 PDF URL 등록 | SOT의 `guide-source add` 흐름을 따른다 (source URL 보존, `access-status remote_gone_410`) |
| 투자자 리서치용 데이터가 부족함(시드만 있음) | SOT의 데이터 부트스트랩(`setup --with-data --consent`, `fetch kvic`/`fetch diva`/`fetch datago`)을 안내한다 |
| 투자자 추천/리서치 | `deal-sourcing` 또는 `investor-research` 스킬과 함께 사용한다 |

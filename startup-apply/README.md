# startup-apply

**지원사업 사업계획서 자동화 플러그인**
지식베이스를 구축하고, 공고를 소싱하며, 사업계획서를 자동 작성해 HWPX로 출력합니다.

```bash
claude plugins marketplace add moonklabs/k-startup-plugins
claude plugins install startup-apply
```

설치 또는 제거 후 Claude Code를 재시작해야 변경사항이 적용됩니다.

---

## 8개 슬래시 커맨드

```
/kb-init          # 회사 지식베이스 초기 구축 — 과거 문서에서 자동 추출
/kb-update        # 지식베이스 갱신 — 카테고리별/파일/점검
/apply-find       # 지원사업 공고 소싱 — 정부/민간/지자체/해외 전부 검색
/apply-check      # 특정 공고 적합도 상세 분석
/apply-daily      # 데일리 리포트 — 마감 임박, 작성 진행률, 신규 공고
/apply-write      # 사업계획서 자동 작성 — 공고 분석 → KB 매핑 → 섹션 작성
/apply-update     # 기존 사업계획서를 새 공고에 맞게 변환
/apply-export     # 사업계획서를 HWPX 파일로 내보내기
```

---

## 병렬 에이전트

| 에이전트 | 역할 |
|---------|------|
| `kb-extractor` | 과거 문서에서 회사 정보 자동 추출 + 카테고리별 분류 |
| `bizplan-writer` | 지식베이스 기반 사업계획서 섹션별 초안 작성 |
| `program-sourcer` | 지원사업 공고 웹 검색 + 적합도 점수 산출 |
| `suitability-analyzer` | 공고 요건 ↔ 지식베이스 상세 대조 분석 |

---

## 작동 방식

```
[과거 문서 + Notion]
        ↓
    /kb-init
        ↓
   지식베이스 (7개 카테고리)
        ↓
/apply-find → /apply-check → /apply-write → /apply-export
                                                    ↓
                                              HWPX 파일 출력
```

---

## MCP 연동

```
지식베이스   → Notion
문서·스프레드시트 → Microsoft 365, Google Docs
채팅 알림    → Slack
지원사업 소싱 → 웹 검색 (기업마당, K-Startup, TIPS)
```

자세한 내용은 [CONNECTORS.md](CONNECTORS.md)를 참조하세요.

---

## 라이선스

Apache 2.0

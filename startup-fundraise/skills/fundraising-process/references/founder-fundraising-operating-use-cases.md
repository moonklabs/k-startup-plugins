# Founder Fundraising Operating Use Cases

이 문서는 신규 스타트업 또는 Seed/Pre-A 투자유치를 준비하는 팀이 `startup-fundraise` 커맨드와 `vc-funds` CLI/MCP를 실제 운영 루틴에 어떻게 녹일지 정의한다.

핵심 관점은 세 가지다.

1. 투자유치는 자료 만들기가 아니라 "증거, 관계, 속도"를 동시에 관리하는 운영 프로세스다.
2. `vc-funds`는 투자자를 추천하는 마법 상자가 아니라 공식 펀드 근거, data gap, parser warning을 확인하는 evidence layer다.
3. 창업자는 투자자 말을 액면 그대로 기록하지 말고, 다음 행동과 일정으로 검증해야 한다.

## 외부 암묵지에서 가져온 원칙

| 원칙 | 실무 해석 | 커맨드 반영 |
|---|---|---|
| Fundraising mode를 분리한다 | 투자유치는 매우 산만하므로 라운드 시작 전 준비를 끝내고, 시작하면 짧고 집중적으로 병렬 진행한다 | `/daily-fundraise`, `/fundraise-pipeline` |
| 투자자는 "yes" 전까지는 no다 | 긍정적 말보다 다음 미팅, DD 요청, 투자 조건, 송금 일정 같은 행동을 본다 | `/fundraise-pipeline`, `/dd-prep` |
| 직렬이 아니라 병렬로 만난다 | 한 VC에 순차적으로 매달리지 말고, 기대값이 높은 후보를 동시에 진행한다 | `/deal-sourcing`, `/fundraise-pipeline` |
| 첫 커밋이 가장 어렵다 | 첫 실질 커밋 또는 강한 리드 신호가 생기면 다른 투자자 전환율이 오른다 | `/investor-outreach`, `/daily-fundraise` |
| 다음 단계를 반드시 묻는다 | 모든 미팅 끝에는 결정까지 필요한 자료, 내부 절차, 예상 일정을 확인한다 | `/dd-prep` |
| TIPS는 회사가 혼자 신청하는 트랙이 아니다 | 운영사의 투자심사, 투자 확약, 추천 가능성, T/O, R&D 과제 적합성을 함께 본다 | `/deal-sourcing`, `~~fund disclosure` |

참고 출처:

- Paul Graham, [How to Raise Money](https://paulgraham.com/fr.html): fundraising mode, introductions, parallel pipeline, no-until-yes, first commitment, close committed money.
- TIPS 공식 사이트, [TIPS Program](https://www.jointips.or.kr/about.php): 민간투자주도형 구조, 운영사 투자/멘토링/R&D 매칭, 운영사 추천 절차.
- TIPS 공식 사이트, [Apply](https://www.jointips.or.kr/bbs/apply.php): 운영사 상시 접수, 운영사 최대 3개 지정, 운영사 투자심사 및 추천, 2-3개월 선정평가.

## 단계별 운영 유즈케이스

### 0단계: 투자유치 가능 상태 판정

목표: 지금 라운드를 시작할지, 한 달 더 고객/제품 증거를 쌓을지 결정한다.

해야 할 활동:

1. 회사 한 줄 설명, 고객군, 현재 traction, runway, 목표 라운드 금액을 적는다.
2. 0원 조달, 작은 라운드, 목표 라운드 세 가지 자금 계획을 만든다.
3. 투자자가 물을 "왜 지금", "왜 이 팀", "왜 venture-scale"에 답할 증거를 모은다.
4. 라운드를 시작하면 6-8주 동안 founder calendar를 fundraising mode로 전환한다.

사용 커맨드:

```bash
/fundraise-forecast
/fundraising-process "Seed/Pre-A 준비"
/daily-fundraise
```

검증 기준:

| 항목 | PASS | FAIL |
|---|---|---|
| 라운드 목표 | 금액, runway, milestone, 희석률 가드레일이 있음 | "일단 많이" 또는 "투자자에게 물어봄" |
| 투자자 증거 | 고객, 매출, 사용 빈도, 반복 업무 절감, 기술 방어 논리가 있음 | 덱 문장만 있고 데이터가 없음 |
| 실행 모드 | 미팅 집중 기간과 제품 운영 담당이 정해짐 | 미팅이 제품 실행을 계속 갉아먹음 |

### 1단계: 창업자 학습과 자료 베이스 구축

목표: 초보 창업자가 절차, 용어, TIPS, 데이터룸, 투자계약 기본기를 모른 채 투자자를 만나지 않게 한다.

해야 할 활동:

1. 공개 가이드 PDF/HWP/HWPX/HWPML/Office 문서를 `Guides` 폴더에 저장한다.
2. `kordoc` CLI/MCP adapter로 Markdown/표를 추출하고, 원본 해시와 source URL을 보존한다.
3. 자주 헷갈리는 개념을 guidance card로 승격한다. 예: 리드 투자자, SAFE, RCPS, TIPS 추천, 데이터룸.
4. 계약/세무/법률은 일반 설명으로만 보고, 실제 의사결정은 전문가 검토로 넘긴다.

사용 커맨드:

```bash
/vc-funds-setup local-dev
npx -y kordoc setup
npx -y kordoc "./guides/seed-fundraising-guide.pdf"
```

검증 기준:

| 항목 | PASS | FAIL |
|---|---|---|
| 원본 보존 | 파일 해시, source URL, imported_at, parser warning이 있음 | 텍스트만 복사해 출처가 사라짐 |
| 답변 방식 | 요약, 체크리스트, 다음 액션 중심 | 긴 원문 재출력 |
| 분리 | 공시 evidence, guide, 사용자 note가 구분됨 | 투자자 추천과 일반 조언이 섞임 |

### 2단계: 공식 펀드 근거 수집

목표: "이 VC가 실제로 우리 단계/분야에 투자할 펀드 근거가 있는가"를 로컬 DB로 확인한다.

해야 할 활동:

1. KVIC FundFinder에서 회사 단계와 분야에 맞는 조건 코드를 고른다.
2. 사용자가 직접 저장한 FundFinder HTML/CSV snapshot을 import한다.
3. KVCA DIVA에서 VC명 또는 조합현황 snapshot을 저장해 import한다.
4. 검색 결과마다 `verified_official`, `official_needs_review`, `no_evidence`를 구분한다.
5. KVCA에 없다고 없는 펀드라고 단정하지 않는다. 개인투자조합, 신기사, PEF, CVC, 내부 계정은 별도 확인한다.

사용 커맨드:

```bash
vc-funds setup --db ~/.local/share/moonklabs/vc-funds/vc-funds.sqlite
vc-funds import kvic --file ./snapshots/fundfinder-AA02.html --source-url http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd --captured-at 2026-07-04T00:00:00.000Z
vc-funds import kvca --file ./snapshots/kvca-primer.html --source-url http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq --captured-at 2026-07-04T00:00:00.000Z
vc-funds search "뭉클랩 AI SaaS Seed Pre-A 투자사" --json
vc-funds health --json
```

검증 기준:

| 항목 | PASS | FAIL |
|---|---|---|
| source authority | KVIC/KVCA/TIPS/문서 source별 authoritative scope가 표시됨 | 웹 검색 결과를 공식 근거처럼 표시 |
| snapshot 재현성 | source URL, captured_at, hash가 남음 | 언제 어디서 가져왔는지 모름 |
| data gap | 부족한 source와 import 액션을 제안 | 빈 결과를 그럴듯한 추천으로 채움 |

### 3단계: 후보 VC/AC 3단계 미팅 순서화

목표: 정말 잡고 싶은 VC를 첫 미팅에서 소모하지 않고, 학습부터 클로징까지 순서를 설계한다.

해야 할 활동:

1. 1단계 연습 미팅: 적합하지만 최우선 리드는 아닌 VC/AC/CVC로 반박을 모은다.
2. 2단계 투자 가능성 검증: thesis, 단계, check size, 펀드 목적, TIPS 운영사 여부가 맞는 후보를 만난다.
3. 3단계 리드 클로징: 가장 잡고 싶은 리드 후보에게 정제된 메시지와 traction 업데이트를 들고 간다.
4. 각 VC에 대해 "왜 이 펀드가 지금 우리를 볼 이유가 있는가"를 1페이지로 쓴다.

사용 커맨드:

```bash
/deal-sourcing "뭉클랩 AI B2B SaaS Seed Pre-A Korea"
/investor-outreach "프라이머, 스파크랩, 블루포인트"
/fundraise-pipeline "Seed/Pre-A"
```

검증 기준:

| 항목 | PASS | FAIL |
|---|---|---|
| 1단계 | objection log가 쌓이고 덱이 개선됨 | 최우선 VC에게 미숙한 메시지로 바로 감 |
| 2단계 | DD 요청, 파트너 미팅, 명확한 next step이 있음 | "좋게 봤다"만 기록 |
| 3단계 | term sheet, 조건 논의, follow 투자자 소개로 이동 | 장기 nurture로만 남음 |

### 4단계: 아웃리치와 미팅 운영

목표: 관계 경로, 메시지, 후속 액션을 관리해 투자자를 실제 의사결정 트랙에 올린다.

해야 할 활동:

1. 웜 인트로 우선. 특히 이미 투자했거나 포트폴리오 founder인 연결자가 가장 강하다.
2. 콜드는 thesis fit과 최신 traction이 강할 때만 쓴다.
3. 모든 미팅 마지막에 다음 단계, 담당자, 자료, 일정, 내부 절차를 묻는다.
4. 투자자의 긍정 표현은 stage 상승 조건이 아니다. stage 상승은 행동으로만 한다.

사용 커맨드:

```bash
/investor-outreach "투자자명"
/dd-prep "투자자명"
/daily-fundraise
```

검증 기준:

| 항목 | PASS | FAIL |
|---|---|---|
| 인트로 | 포워딩 가능한 blurb가 7줄 이하, traction 2-3개 포함 | 긴 덱 설명을 연결자에게 떠넘김 |
| 미팅 종료 | 다음 단계와 날짜가 있음 | "검토해보겠다"로 끝남 |
| 팔로업 | 당일 감사/요약, 48시간 내 자료 전달 | 다음 주까지 방치 |

### 5단계: 파이프라인 건강 점검

목표: 라운드가 감으로 굴러가지 않게 숫자와 병목으로 관리한다.

해야 할 활동:

1. 목표 금액 대비 3x 이상의 파이프라인 커버리지를 만든다.
2. HIGH/MEDIUM/LOW를 나누고 LOW는 과감히 제거한다.
3. 14일 무응답, 30일 정체, 단일 champion 의존을 리스크로 표시한다.
4. 주간으로 신규 타겟, 진행 타겟, 정리 타겟을 나눈다.

사용 커맨드:

```bash
/fundraise-pipeline "전체"
/daily-fundraise
/lead-dashboard
```

검증 기준:

| 항목 | PASS | FAIL |
|---|---|---|
| 커버리지 | 목표 금액의 3x 이상, HIGH 비중 50% 이상 | 후보 수만 많고 금액/확률이 없음 |
| 속도 | 다음 액션이 7일 이내 있음 | 미팅 후 2주 이상 무동작 |
| 리스크 | 무응답/정체/단일 champion이 표시됨 | 파이프라인이 "좋은 분위기"로만 관리됨 |

### 6단계: DD와 리드 클로징

목표: 자료 요청을 단순 방어가 아니라 투자 조건 논의로 전환한다.

해야 할 활동:

1. 데이터룸은 요청받은 뒤 만들지 말고, 미리 최소 버전을 준비한다.
2. DD 질문은 objection log와 연결한다. 같은 질문이 반복되면 덱/FAQ를 고친다.
3. 리드 후보와는 목표 금액, instrument, valuation range, milestone, follow 구성까지 맞춘다.
4. 커밋은 돈이 들어오기 전까지 확정으로 기록하지 않는다.

사용 커맨드:

```bash
/dd-prep "리드 후보"
/fundraise-pipeline "DD"
/investor-update "라운드 진행 업데이트"
```

검증 기준:

| 항목 | PASS | FAIL |
|---|---|---|
| DD 자료 | 법인, 재무, 고객, 제품, 보안, 계약 자료가 정리됨 | 요청 때마다 새로 찾음 |
| 리드 신호 | 조건, 일정, 내부 의사결정자가 명확함 | 관심 있다는 말뿐 |
| 클로징 | 서명, 송금, 후속 투자자 일정이 관리됨 | verbal commit만 믿음 |

## 실사용 검증 시나리오

### Scenario A: 완전 초보 창업자

입력:

```text
뭉클랩은 AI 기반 B2B SaaS고 Seed-Pre-A를 준비 중이다. 투자유치를 처음 한다.
```

기대 행동:

1. `/fundraising-process`가 0단계 readiness 질문부터 시작한다.
2. guide corpus가 있으면 투자유치 용어와 체크리스트를 먼저 설명한다.
3. `/vc-funds-setup`으로 로컬 DB 준비 상태를 확인한다.
4. 공식 펀드 근거가 없으면 추천보다 snapshot import 액션을 먼저 제안한다.

PASS 기준:

- 투자자 리스트보다 먼저 readiness, 자료, runway, 목표 금액을 확인한다.
- `NOT_READY`인 document/guide import를 실행 가능한 명령처럼 말하지 않는다.
- TIPS를 "운영사 투자/추천 필요"로 설명한다.

### Scenario B: 이미 투자자 몇 명과 미팅 중

입력:

```text
프라이머, 스파크랩, 블루포인트와 이야기 중이고 20억 라운드를 준비 중이다.
```

기대 행동:

1. `/fundraise-pipeline`이 단계, 금액, 확률, 다음 액션을 묻는다.
2. `vc-funds search`로 공식 펀드 근거와 data gap을 분리한다.
3. `/dd-prep`이 각 VC별로 다음 미팅 목표와 예상 질문을 만든다.

PASS 기준:

- 긍정적 대화만으로 stage를 올리지 않는다.
- 각 투자자별 next step과 날짜가 없으면 리스크로 표시한다.
- `official_disclosure_documents` 같은 data gap을 그대로 보여준다.

### Scenario C: TIPS를 노리는 팀

입력:

```text
TIPS 연계 가능성이 있는 운영사를 만나고 싶다.
```

기대 행동:

1. TIPS는 운영사 투자심사와 추천이 선행된다고 안내한다.
2. 운영사 여부, 펀드 목적, T/O, 최근 추천 실적, R&D 과제 적합성을 함께 본다.
3. 단순 TIPS 운영사 목록보다 투자 가능성이 있는 운영사를 우선한다.

PASS 기준:

- "TIPS 신청"을 회사 단독 액션으로 단순화하지 않는다.
- `~~fund disclosure` 근거와 TIPS 공식 페이지 근거를 분리한다.
- 사업계획서보다 먼저 투자자가 투자할 이유를 점검한다.

### Scenario D: 문서/공시 첨부를 쌓는 사용자

입력:

```text
KVIC/KVCA 공시 PDF/HWP 파일을 계속 모아두고 나중에 검색하고 싶다.
```

기대 행동:

1. 원본 파일 보존, 해시, source URL, parser status를 먼저 설명한다.
2. 파싱은 `kordoc` CLI/MCP adapter를 사용한다.
3. P0 런타임에서 아직 document import 명령이 없으면 planned surface로 말한다.

PASS 기준:

- PDF/HWP/HWPX 직접 파서를 만들자고 하지 않는다.
- parser warning과 원본 확인 경로를 응답에 남긴다.
- 원문 전체를 재출력하지 않는다.

## 사용자에게 먼저 물어야 할 질문

아래 질문은 중요도 순서다. 답이 없으면 합리적으로 가정하되, 1-5번은 투자유치 전략 품질에 직접 영향을 준다.

### P0: 지금 답해야 하는 질문

1. 이번 라운드의 목표 금액, 목표 runway, 희석률 상한은 무엇인가?
2. 현재 traction 중 투자자에게 보여줄 수 있는 숫자 3개는 무엇인가? 예: 유료 고객 수, MRR, 사용 빈도, 자동화 리포트 수, 절감 시간.
3. 투자유치 시작 시점과 마감 희망일은 언제인가?
4. 지금 가장 잡고 싶은 리드 후보 VC/AC 5곳은 어디인가?
5. TIPS는 필수 목표인가, 있으면 좋은 보조 신호인가?

### P1: 후보 선정 정확도를 높이는 질문

6. 뭉클랩의 핵심 고객 세그먼트는 누구인가? 예: 초기 스타트업, SME, e-commerce, SaaS, agency.
7. 초기 wedge는 PG 매출/정산/결제상세, ads/analytics 집계, CRM/CS, 세무/문서 중 어디가 1순위인가?
8. 이미 연결된 데이터 소스 또는 실제 고객 데이터가 있는가?
9. 웜 인트로 가능한 기존 투자자, advisor, 고객, 포트폴리오 founder가 있는가?
10. 해외 진출 또는 글로벌 VC를 이번 라운드에 포함할 것인가?

### P2: 실행 품질을 높이는 질문

11. 현재 deck, financial model, data room은 각각 어떤 버전인가?
12. 투자자가 가장 많이 반박할 지점은 무엇이라고 보는가? 예: wrapper commodity, 시장 크기, 데이터 정확도, 보안, distribution.
13. 창업팀에서 누가 fundraising mode 동안 제품/고객 운영을 지키는가?
14. 고객 레퍼런스 콜에 응해줄 고객이 있는가?
15. 이번 라운드에서 절대 양보하기 어려운 조건은 무엇인가?

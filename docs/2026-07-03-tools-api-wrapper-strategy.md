# Tools API Wrapper Strategy Draft

작성일: 2026-07-03
상태: Draft
대상: `cli`, `mcp`, `skill` 형태로 제공할 API wrapper 후보군

## 핵심 판단

이 프로젝트의 tools 확장은 "모든 서비스를 직접 긁어오는 자동화"가 아니라, 공식 API가 있는 서비스는 안전한 얇은 래퍼로 만들고, 공식 API가 없거나 계약/인증/심사가 본질인 영역은 검증된 유료 서비스 또는 공식 UI 사용을 추천하는 방향이 맞다.

초기 전략은 다음 3층으로 나눈다.

1. `mcp`: 에이전트가 안전하게 호출하는 read-first 도구. 조회, 리포트, 상태 점검, 초안 생성에 우선 사용한다.
2. `cli`: 로컬 운영자가 토큰/환경을 확인하고 반복 작업을 실행하는 도구. OAuth, API key, dry-run, JSON export를 기본값으로 둔다.
3. `skill`: API 연동 자체보다 판단과 절차가 중요한 영역. 계약 필요 여부, 추천 서비스, 보류 조건, 운영 체크리스트를 제공한다.

## 제품 원칙

- 공식 API 우선: 공식 개발자 문서, 공개 OpenAPI, SDK, OAuth, webhook이 있는 서비스부터 만든다.
- Read-first: 광고 변경, 환불, 세금계산서 발행, GTM publish 같은 write action은 MVP에서 기본 비활성화한다.
- 계약형 API 존중: 은행, 카드, 국세청, PG 정산은 개인 계정 자동 로그인/스크래핑으로 풀지 않는다.
- 추천도 제품이다: 직접 연동이 위험한 영역은 Popbill, Barobill, PortOne, Open Banking 사업자, ERP 파트너 같은 유료/공식 서비스를 추천하는 skill이 더 가치 있다.
- 공통 데이터 모델 우선: 서비스별 SDK를 감싸더라도 내부 출력은 `payment`, `settlement`, `invoice`, `ad_metric`, `analytics_event`, `crm_object`, `erp_record`로 정규화한다.

## 우선순위 요약

| Priority | 영역 | 추천 액션 | 이유 |
|---|---|---|---|
| P0 | PostHog | 직접 wrapper | 인증/쿼리/이벤트 표면이 명확하고 구현 대비 가치가 가장 높다. |
| P0 | Google Analytics Data API | 공식 MCP 또는 Data API wrapper | 공식 MCP 경로가 있고 운영 리포트 자동화 가치가 크다. |
| P0 | HubSpot, Pipedrive, monday Sales CRM, ChannelTalk | 직접 wrapper | 스타트업 CRM/CS 반복 업무에 바로 쓰기 좋고 공식 API가 명확하다. |
| P1 | Google Ads | 공식 MCP/Google Ads API 기반 read wrapper | GAQL 리포팅 가치는 크지만 developer token, access level, 쿼터 관리가 필요하다. |
| P1 | PortOne | PG 기본 adapter | 여러 PG를 한 층으로 추상화하므로 직접 PG별 래퍼보다 초기 표면이 좋다. |
| P1 | KFTC 오픈뱅킹/계좌인증 | 권한 보유 고객 전용 wrapper | API는 있지만 신청, 심사, 동의, 보안 통제가 제품의 본질이다. |
| P1 | Toss Payments 매출/정산/결제상세 조회 | 직접 PG read wrapper | 공식 `llms.txt`와 코어 API 기준으로 거래·정산·결제 조회가 집계 MVP에 바로 맞다. |
| P1 | 국세청 연계 유료 API(Popbill/TrusBill/Barobill류) | provider wrapper | 이미 구현된 유료/ASP API를 감싸는 것이 현실적이다. |
| P1 | Odoo, Microsoft Business Central | ERP wrapper | API가 표준적이고 SMB 스타트업 사용 가능성이 높다. |
| P2 | KG Inicis | 고객 수요 기반 wrapper | 계약/서비스별 분기 비용이 커서 PortOne 또는 직접 가맹점 수요 확인 후 진행한다. |
| P2 | Zoho, Salesforce, NetSuite | CRM/ERP 확장 wrapper | 강력하지만 초기 고객군과 인증/권한 설정 비용이 높다. |
| P2 | Meta Ads, TikTok Ads | 검증 후 read-only reports | API/권한/앱 심사 리스크가 커서 접근권 확보 전에는 추천/가이드 중심. |
| P2 | Google Tag Manager | audit/diff wrapper | API가 좋지만 publish/write는 사고 위험이 커서 승인 게이트가 필요하다. |
| P3 | 일반 은행 계좌 통합수집, 카드매출 직접 수집 | 직접 wrapper 보류 | 자동 로그인/스크래핑은 보안, 약관, 개인정보 리스크가 높다. |
| P3 | NTS 포털 직접 자동화, HWP binary reader, Hotjar export | 제한적 지원 | 비공식 포털 자동화나 라이선스 미확인 구현은 범용 래퍼 금지. |

## 서비스별 판단

### PG/결제

#### Toss Payments

- 공식성: 코어 API, SDK, 샌드박스, 웹훅, 결제/자동결제/거래/정산/현금영수증/계좌인증 API가 문서화되어 있다.
- 근거: [Toss Payments llms.txt](https://docs.tosspayments.com/llms.txt), [Toss Payments Core API](https://docs.tosspayments.com/reference), [Toss Payments Authorization](https://docs.tosspayments.com/reference/using-api/authorization)
- wrapper 가치: 높음. 초반에는 결제 생성/취소보다 `GET /v1/transactions`, `GET /v1/settlements`, `GET /v1/payments/{paymentKey}`, `GET /v1/payments/orders/{orderId}` 기반의 매출·정산·결제상세 조회와 집계에 특화한다.
- 제한: 상점 MID, secret key, 테스트/라이브 키 분리, 거래 조회 timeout/429 가능성, 정산 조회의 D+1 성격, 환불/승인/write action 실수 리스크.
- 전략: MVP에서는 read-only 조회/집계와 webhook 후속 재조회만 제공한다. 환불, 수동정산, 현금영수증 발급은 `--dry-run`과 명시 승인 게이트 이후로 미룬다.
- 초기 산출물: `toss-sales-summary`, `toss-settlement-summary`, `toss-payment-detail`, `toss-reconcile` 네 가지 표면을 먼저 만든다. 상세 구현 범위는 [Toss Payments Aggregation MVP](./toss-payments-aggregation-mvp.md)를 기준으로 한다.

#### KG Inicis

- 공식성: KG이니시스 공식 매뉴얼에서 온라인결제, 빌링, 에스크로, 취소/환불, 계좌인증, 승인/정산대사 등을 제공한다.
- 근거: [KG Inicis Manual](https://manual.inicis.com/)
- wrapper 가치: 중간-높음. 레거시/국내 쇼핑몰 수요가 있으나 문서와 연동 방식이 Toss보다 운영 친화적이지 않을 수 있다.
- 제한: 상점 계약, MID, 결제수단별 프로토콜 차이, 백오피스 권한.
- 전략: PortOne을 통한 추상화 경로를 우선 검토하고, 직접 KG이니시스 래퍼는 고객 수요가 확인될 때 만든다.

#### PortOne

- 공식성: V1/V2 결제 연동, 인증결제, 수기결제, 빌링키, 웹훅, PG사별 가이드, API/SDK 문서를 제공한다.
- 근거: [PortOne Developer Docs](https://developers.portone.io/)
- wrapper 가치: 매우 높음. 여러 PG를 한 번에 추상화하므로 초기 제품 표면으로 가장 좋다.
- 제한: PortOne 계정/채널 설정, PG별 지원 기능 차이, 원천 PG 오류의 추상화 한계.
- 전략: `portone`을 PG MVP의 기본 어댑터로 둔다. Toss/Inicis 직접 래퍼는 "직접 계약 고객" 옵션으로 둔다.

### 은행/계좌 정보

#### Open Banking/KFTC

- 공식성: 금융결제원 오픈API 개발자센터가 있으며 은행 계좌 조회/이체 계열은 기관/이용기관 계약과 인증 절차가 필요하다.
- 근거: [KFTC Open API Center](https://openapi.kftc.or.kr/), [KFTC Developers](https://developers.kftc.or.kr/dev)
- wrapper 가치: 권한을 보유한 고객에게는 높다. 다만 일반 스타트업 플러그인으로 열어두는 범용 계좌 통합수집은 낮다. "계좌실명조회/계좌인증/거래내역 조회"처럼 목적별 wrapper로 좁혀야 한다.
- 제한: 금융기관/핀테크 사업자 요건, 보안 심사, 고객 동의, 인증서/키 관리.
- 전략: KFTC 접근권이 있는 고객 전용 P1 adapter로 둔다. 접근권이 없으면 Toss Payments 부가 API, KG이니시스 계좌인증, Popbill 예금주조회 같은 provider wrapper 또는 유료 서비스를 추천한다.

#### 카드결제 정보 수집

- 공식성: 여신금융협회 가맹점 매출거래정보 통합조회시스템은 승인/매입/입금/매출장부 조회를 제공하지만, 범용 공개 API로 보기 어렵다.
- 근거: [여신금융협회 카드매출 통합조회](https://www.cardsales.or.kr/)
- wrapper 가치: 낮음. UI 자동 로그인/스크래핑은 보안/약관/개인정보 리스크가 크다.
- 전략: PG/PortOne/Toss/KG이니시스의 결제/정산 API에서 수집 가능한 데이터를 우선 사용한다. 카드사 전체 가맹점 매출 통합은 공식 API 계약 또는 유료 사업자 확인 전까지 추천/가이드로만 둔다.

### 세무/국세청

#### 세금계산서 발행

- 공식성: 국세청 연계 기능을 구현한 유료/ASP API가 이미 있으므로, 원천 포털을 직접 자동화하기보다 해당 provider API를 감싸는 경로가 실무적이다. Popbill은 전자세금계산서 발행/전송, 테스트/운영 환경, SDK를 제공하고, KFTC 포털에는 TrusBill 전자세금계산서 서비스 경로가 있다.
- 근거: [Popbill TaxInvoice API](https://developers.popbill.com/reference/taxinvoice/node/api), [TrusBill](https://www.trusbill.or.kr/)
- wrapper 가치: 높음. 직접 NTS 포털/비공식 연동이 아니라 유료 provider wrapper로 접근해야 한다.
- 제한: 공동인증서/부서사용자/운영 전환/포인트 또는 과금, 발행 취소/수정세금계산서 리스크.
- 전략: `tax-invoice`는 Popbill, TrusBill, Barobill 같은 provider adapter로 시작한다. 명칭은 "국세청 연계 유료 API", "전자세금계산서 ASP/API", "전자세금계산서 provider API"처럼 실제 연동 주체를 드러낸다.

#### 홈택스 수집

- 공식성: Popbill은 홈택스 현금영수증 매입/매출 수집 API와 홈택스 인증 관리를 제공한다.
- 근거: [Popbill Hometax Cashbill Collection API](https://developers.popbill.com/reference/htcashbill/node/api)
- wrapper 가치: 중간. 세무 리포트 자동화 가치가 크지만 인증/위임과 과금이 본질이다.
- 전략: read-only 수집 요청, 수집 상태 조회, 세무 리포트 생성으로 한정한다.

### 문서/HWP

#### HWP/HWPX reader

- 공식성: 한컴은 공식 뷰어와 다운로드 센터, 구매형 HWP SDK를 제공한다. HWPX는 XML 기반 처리 가능성이 높지만, HWP binary는 포맷/라이선스/호환성 리스크가 크다.
- 근거: [Hancom Download Center](https://www.hancom.com/support/downloadCenter/download), [Hancom HWP SDK](https://www.hancom.com/product/sdk/hwpSdk)
- wrapper 가치: HWPX는 높음, HWP binary는 라이선스형으로 제한적.
- 전략: 초기에는 `startup-apply`의 HWPX 생성/구조 처리 경험을 재사용한다. HWP reader는 "HWPX 변환 후 파싱"을 기본 경로로 두고, HWP SDK나 Windows/한컴 기반 변환은 별도 설치형/구매형 선택지로 둔다. HWP binary parser를 포맷 추측으로 직접 새로 만드는 일은 보류한다.

### 채팅/CS

#### ChannelTalk

- 공식성: JavaScript/iOS/Android/React Native SDK, Open API, Webhook, Documents Open API를 제공한다.
- 근거: [Channel Developers](https://developers.channel.io/), [Channel Open API](https://developers.channel.io/en/categories/Open-API-060776bd), [Channel API Docs](https://api-doc.channel.io/)
- wrapper 가치: 높음. 고객 문의, 유저, 상담 태그, 상담 요약, webhook 기반 리포트에 적합하다.
- 제한: 워크스페이스 토큰, 개인정보, 상담 내용 보관 정책.
- 전략: `channel-talk` MCP는 read-only 상담 검색/요약/태그 집계부터 만든다. 메시지 발송은 초안 생성까지만 하고 실제 발송은 승인 게이트를 둔다.

### Ads

#### Google Ads

- 공식성: Google Ads API, OAuth, GAQL, REST/gRPC, client libraries, Query Builder/Validator, 공식 MCP server가 있다.
- 근거: [Google Ads API](https://developers.google.com/google-ads/api/docs/get-started/introduction)
- wrapper 가치: 매우 높음. 공식 MCP server가 있으므로 중복 구현보다 설정/쿼리 skill과 얇은 CLI를 우선한다.
- 제한: developer token, OAuth, access level, manager account, 쿼터, 정책 준수. Explorer/Basic access level별 일일 operation 한도가 다르고, mutate request와 응답 크기 제한도 고려해야 한다.
- 전략: `google-ads-report`는 GAQL 템플릿 기반 read-only 리포팅부터. 캠페인 생성/수정은 P2 이후 승인 게이트.

#### Meta/Facebook Ads

- 공식성: Meta Marketing API 진입점은 존재하지만, 이번 draft 조사에서는 공식 본문 전체를 충분히 검증하지 못했다.
- 근거: [Meta Marketing APIs](https://developers.facebook.com/docs/marketing-apis/), [Meta App Review](https://developers.facebook.com/docs/app-review/)
- wrapper 가치: 중간-높음. 성과 리포트와 광고 계정/캠페인 조회 수요가 크다.
- 제한: 앱 생성, Business Manager, 권한 심사, rate limit, 정책 변화.
- 전략: 초기는 공식 문서 링크와 설정 skill만 둔다. 실제 API 접근권과 앱 심사 조건이 확인된 고객이 있을 때 `insights` read-only부터 시작하고 write action은 보류한다.

#### TikTok Ads

- 공식성: TikTok API for Business 문서 진입점은 존재하지만, 이번 draft 조사에서는 공개 Marketing API 본문과 접근 조건을 충분히 검증하지 못했다.
- 근거: [TikTok API for Business](https://business-api.tiktok.com/portal/docs), [TikTok for Developers](https://developers.tiktok.com/doc/)
- wrapper 가치: 중간. D2C/콘텐츠 커머스 고객에게 중요하지만 앱 승인과 권한 장벽이 있다.
- 제한: developer app, advertiser authorization, endpoint별 권한.
- 전략: P2. 실제 API 접근권을 보유한 고객이 있을 때 광고 리포트 read-only부터 만들고 캠페인/크리에이티브 write는 보류.

### Analytics/Tagging

#### Google Analytics

- 공식성: Google Analytics Data API v1이 보고서 데이터 접근, runReport, batchRunReports, realtime, metadata 등을 제공하며 공식 MCP server도 안내된다.
- 근거: [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)
- wrapper 가치: 매우 높음. 스타트업 운영 리포트의 P0이며, PostHog와 함께 첫 proof 후보로 가장 좋다.
- 제한: GA4 property 권한, quota, 샘플링/모델링/identity 설정 이해. Core/Realtime/Funnel quota와 concurrent request 제한을 tool help에 노출해야 한다.
- 전략: GA MCP/CLI로 daily active users, acquisition, conversion, ecommerce, campaign attribution 리포트를 제공한다.

#### PostHog

- 공식성: capture, feature flag, private CRUD/query API, OAuth, personal API key, rate limit 문서가 명확하다.
- 근거: [PostHog API overview](https://posthog.com/docs/api)
- wrapper 가치: 최상. product analytics와 event warehouse를 직접 다루기 좋고, 인증/도메인/쿼리 표면이 간결하다.
- 제한: personal API key 범위, EU/US/self-hosted domain, private endpoint rate limit. public capture endpoint와 private query endpoint의 인증 모델을 분리해야 한다.
- 전략: `posthog-query`, `posthog-events`, `posthog-feature-flags` read wrapper를 P0 1순위로 둔다.

#### Google Tag Manager

- 공식성: REST API로 accounts, containers, workspaces, tags, triggers, variables, versions, user permissions를 관리할 수 있다.
- 근거: [Google Tag Manager API](https://developers.google.com/tag-platform/tag-manager/api/v2)
- wrapper 가치: 높지만 위험도도 높음.
- 제한: OAuth 2.0만 지원하고 project/day 및 QPS 쿼터가 빡빡하다. 잘못된 publish가 실서비스 측정/광고 전환을 망칠 수 있다.
- 전략: P1에서는 audit/diff/export만. create/update/publish는 P2 이후 `plan -> preview -> explicit approve -> publish` 흐름으로 제한한다.

#### Hotjar

- 공식성: 공개 API 표면이 제한적이고 제품 UI 중심이다.
- wrapper 가치: 낮음-중간. 이벤트/녹화/heatmap raw export가 안정적으로 열려 있지 않으면 직접 래퍼 가치가 낮다.
- 전략: 직접 wrapper는 보류한다. Hotjar UI, export, Zapier/Segment/CDP 연동 경로를 추천하는 skill로 시작한다.

### CRM

#### HubSpot

- 공식성: date-versioned API reference, CRM objects, OAuth/private app token 생태계가 명확하다.
- 근거: [HubSpot API reference](https://developers.hubspot.com/docs/api-reference/latest/overview)
- wrapper 가치: 매우 높음. 스타트업 CRM 표준 후보.
- 전략: contacts, companies, deals, notes, tasks, pipelines read/write를 P0/P1로 둔다. write는 dry-run과 diff를 기본값으로 둔다.

#### Pipedrive

- 공식성: REST API, OAuth 2.0, OpenAPI 3 spec, official Node/PHP libraries, sandbox 안내가 있다.
- 근거: [Pipedrive API Reference](https://developers.pipedrive.com/docs/api/v1)
- wrapper 가치: 매우 높음. 영업 파이프라인 중심 스타트업에 적합하다.
- 전략: HubSpot과 함께 P0 CRM adapter로 둔다.

#### monday Sales CRM

- 공식성: monday.com Platform API, Apps framework, marketplace, GraphQL 기반 API, MCP/mcli 생태계가 있다.
- 근거: [monday API basics](https://developer.monday.com/api-reference/docs/basics), [monday Apps framework](https://developer.monday.com/apps/docs/intro), [monday Marketplace](https://monday.com/marketplace)
- wrapper 가치: 매우 높음. 보드/아이템/업데이트/자동화 모델이 sales CRM 운영과 잘 맞고, MCP-first 전략과 궁합이 좋다.
- 제한: GraphQL schema 변화, OAuth/short-lived token, marketplace review.
- 전략: P0 CRM adapter 후보로 추가한다. HubSpot/Pipedrive보다 데이터 모델이 자유로우므로 `board schema inspect -> mapped sync` 흐름을 먼저 만든다.

#### Zoho CRM

- 공식성: V8 API에서 metadata, core CRUD, composite, bulk, notification, query API를 제공한다.
- 근거: [Zoho CRM V8 APIs](https://www.zoho.com/crm/developer/docs/api/v8/)
- wrapper 가치: 중간-높음.
- 전략: 국내/글로벌 SMB에서 수요가 확인되면 P1로 추가한다.

#### Salesforce

- 공식성: 광범위한 공식 API와 developer ecosystem이 있다.
- 근거: [Salesforce API Library](https://developer.salesforce.com/docs/apis)
- wrapper 가치: 높지만 초기 MVP에는 무겁다.
- 제한: 조직별 권한/스키마/custom object, connected app, enterprise governance.
- 전략: P2. "범용 Salesforce wrapper"보다 SOQL read, object schema inspect, report export처럼 좁게 시작한다.

### ERP

#### Odoo

- 공식성: External JSON-2 API, API key, access rights, dynamic documentation을 제공한다.
- 근거: [Odoo External API](https://www.odoo.com/documentation/19.0/developer/reference/external_api.html)
- wrapper 가치: 매우 높음. 오픈소스/클라우드 양쪽 모두 스타트업 도입 가능성이 있다.
- 제한: Odoo Online/플랜별 외부 API 접근 조건, legacy RPC와 JSON-2 API의 버전 차이, access rights.
- 전략: P1 ERP adapter. `res.partner`, invoice, sale order, product, stock move 등 핵심 모델 read/write를 만든다. 초기에는 read와 schema introspection을 먼저 제공한다.

#### Microsoft Dynamics 365 Business Central

- 공식성: 표준 REST API와 connect app 모델, OpenAPI specification을 제공한다.
- 근거: [Business Central API v2.0](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/)
- wrapper 가치: 높음.
- 제한: Microsoft Entra ID/OAuth v2, tenant/environment/company 라우팅, app registration.
- 전략: P1/P2. Microsoft 365 고객군을 위한 ERP adapter로 둔다. CLI는 auth bootstrap과 company/environment 확인을 가장 먼저 제공한다.

#### Oracle NetSuite

- 공식성: SuiteTalk REST Web Services로 CRUD, metadata, REST query, SuiteQL을 제공한다.
- 근거: [NetSuite SuiteTalk REST Web Services](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_1540391670.html)
- wrapper 가치: 높지만 enterprise 난도가 높다.
- 전략: P2. SuiteQL read wrapper부터 시작한다.

#### SAP / SAP Business One

- 공식성: SAP API/SDK 생태계가 있으나 Business One은 파트너/구축형 맥락이 강하다.
- 근거: [SAP API Business Hub](https://api.sap.com/)
- wrapper 가치: 고객별 편차가 크다.
- 전략: 범용 P0에서 제외한다. 고객이 SAP B1/파트너 접근권을 보유할 때만 custom adapter로 진행한다.

#### 국내 ERP 후보

- 후보: 더존/WEHAGO/Amaranth, 영림원/SystemEver, 이카운트 등.
- 판단: 공개 공식 API 확인과 계약 조건 확인이 먼저다. 국내 ERP는 "API가 있느냐"보다 "고객 계정에서 외부연동 권한이 열리느냐"가 관건이다.
- 전략: MVP에서는 직접 wrapper보다 `erp-selection` skill로 시작한다. 유료 API/파트너 프로그램 확인 후 후보별 adapter를 분리한다.

## 공통 adapter 계약

각 tool wrapper는 다음 메타데이터를 가져야 한다.

```yaml
service: google-analytics
surface:
  - cli
  - mcp
  - skill
auth:
  type: oauth2 | api_key | service_account | partner_contract
  secret_env:
    - GOOGLE_CLIENT_ID
    - GOOGLE_CLIENT_SECRET
capabilities:
  read:
    - report.run
    - metadata.list
  write: []
risk:
  pii: medium
  money_movement: false
  production_write: false
limits:
  rate_limit: documented
  sandbox: available | unavailable | unknown
output_models:
  - analytics_report
  - metric_timeseries
```

공통 CLI 규칙:

- 모든 write command는 기본 `--dry-run`.
- money movement, refund, invoice issue, ad mutate, tag publish는 `--confirm <operation-id>` 없이는 실행 금지.
- secret은 env/keychain/connector만 사용하고 파일에 저장하지 않는다.
- 출력은 사람이 읽는 표와 machine-readable JSON을 모두 지원한다.
- MCP tool은 raw secret을 절대 반환하지 않는다.

## 추천 초기 패키지

초기에는 새 repo로 빼지 말고 이 레포에 draft plugin 후보를 둔다.

```text
tools-draft/
  commands/
    tool-connect.md
    tool-audit.md
    ad-report.md
    analytics-report.md
    crm-sync.md
    payment-reconcile.md
    tax-invoice.md
  skills/
    api-wrapper-selection/SKILL.md
    credential-safety/SKILL.md
    provider-recommendation/SKILL.md
  agents/
    api-researcher.md
    integration-planner.md
```

단, 실제 실행 코드는 처음부터 plugin 안에 모두 넣지 않는다. 먼저 문서와 command/skill로 사용자 흐름을 검증하고, 고객이 붙은 adapter만 별도 패키지로 승격한다.

## 구현 로드맵

### Phase 0: 조사/설계

- 이 문서를 기준으로 서비스별 `capability matrix`를 만든다.
- 각 서비스별 공식 문서 URL, auth 방식, sandbox 여부, read/write endpoint, 위험도를 YAML로 정리한다.
- `api-wrapper-selection` skill을 만들어 "직접 구현/공식 MCP 사용/유료 서비스 추천/보류" 판단을 자동화한다.

### Phase 1: P0 read-only wrappers

- PostHog: query/events/feature flag 조회.
- Google Analytics: 공식 MCP 또는 Data API 기반 리포트.
- Google Ads: 공식 MCP 설정, GAQL report templates.
- HubSpot/Pipedrive/monday: CRM object 조회, pipeline health report.
- ChannelTalk: 상담/유저/태그 조회, 상담 요약.

### Phase 2: 결제/세무 provider wrappers

- PortOne: PG 기본 adapter, 결제/정산/웹훅 조회.
- Toss Payments: 매출/거래/정산/결제상세 조회 집계.
- KG Inicis: 고객 수요 확인 후 read wrapper.
- KFTC: 권한 보유 고객 전용 계좌인증/거래내역 wrapper.
- Popbill/TrusBill/Barobill: 전자세금계산서, 홈택스 수집, 사업자등록상태조회.

### Phase 3: ERP/CRM 확장

- Odoo, Business Central read/write.
- Zoho, Salesforce, NetSuite read/query.
- 국내 ERP는 공식 API와 계약 조건 확인 후 별도 adapter.

### Phase 4: 승인형 write operations

- 환불, 세금계산서 발행, 광고 campaign mutate, GTM publish, CRM bulk update.
- 모든 write action은 preview artifact, diff, approval token, audit log가 있어야 한다.

## 명확한 비추천

- 은행/카드/홈택스 계정 자동 로그인 스크래퍼를 범용 tool로 제공하지 않는다.
- 카드번호, 계좌번호, 공동인증서, OTP, 고객 상담 원문을 로그나 final output에 노출하지 않는다.
- PG 환불/정산/수동승인, 세금계산서 발행/취소, 광고 예산 변경을 one-shot agent action으로 열지 않는다.
- HWP binary reader를 포맷 추측으로 새로 만들지 않는다.
- "국세청 직접 API"처럼 실제 연동 주체가 provider인 경우 이름을 과장하지 않는다. "국세청 연계 유료 API" 또는 provider명을 함께 쓴다.

## 다음 실행안

1. `docs/tools-capability-matrix.yaml` 초안 작성.
2. P0 read-only 중 하나를 end-to-end proof로 선택: 추천은 `posthog` 또는 `google-analytics`.
3. `tools-draft` plugin skeleton 추가 여부 결정.
4. provider recommendation skill 작성: 은행/카드/국세청 연계 provider/국내 ERP처럼 직접 wrapper와 유료 provider wrapper를 구분해야 하는 영역부터 사용자 기대치를 바로잡는다.

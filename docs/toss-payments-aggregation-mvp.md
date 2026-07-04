# Toss Payments Aggregation MVP

작성일: 2026-07-03
상태: Draft
목표: Toss Payments tools의 첫 버전을 결제 생성이 아니라 매출, 정산, 결제상세 조회 집계에 특화한다.

## 공식 문서 기준

- [Toss Payments llms.txt](https://docs.tosspayments.com/llms.txt): LLM용 문서 인덱스. 세부 구현 전 이 파일로 정확한 가이드/레퍼런스 위치를 찾는다.
- [LLM Quick Reference](https://docs.tosspayments.com/guides/v2/get-started/llms-quick-reference): AI agent용 라우팅과 guardrail. 서버가 secret key로 상태를 검증하고, 클라이언트 제공 결제 상태를 신뢰하지 않는 모델을 따른다.
- [Core API](https://docs.tosspayments.com/reference): 결제, 거래, 정산, 현금영수증, 프로모션 등 API 레퍼런스.
- [Authorization](https://docs.tosspayments.com/reference/using-api/authorization): 일반적으로 secret key를 Basic 인증에 사용한다. `test_sk`와 `live_sk`를 분리하고 secret key는 외부에 노출하지 않는다.

## MVP 범위

초기 tool은 write action을 만들지 않는다. 결제 생성, 취소, 환불, 수동 정산, 현금영수증 발급은 제외하고, 운영자가 매출과 정산을 검증하는 read-only 흐름만 제공한다.

### 1. 매출 조회

기본 API:

- `GET /v1/transactions`

용도:

- 기간별 승인/취소/부분취소 거래 수집
- 거래 대사 원천 데이터 확보
- `paymentKey`, `transactionKey`, `orderId`, `mId`, `method`, `status`, `transactionAt`, `amount` 기준 집계

초기 CLI/MCP:

- `toss sales summary --start-date --end-date`
- `toss transactions list --start-date --end-date --starting-after --limit`
- `toss_sales_summary`
- `toss_transaction_list`

주의:

- 거래 조회는 `transactionAt` 기준이다.
- `startingAfter`는 `transactionKey` 기반 pagination에 사용한다.
- 응답 시간이 길 수 있으므로 timeout은 최소 60초로 둔다.
- 라이브 환경에서 과도한 요청은 `429`를 받을 수 있으므로 일자 단위 캐시와 backoff를 둔다.

### 2. 정산 조회

기본 API:

- `GET /v1/settlements`

용도:

- 지급 예정/지급 완료 금액 집계
- 수수료, 수수료 부가세, 지급액 검증
- 정산 매출일(`soldDate`)과 정산 지급일(`paidOutDate`) 기준 조회

초기 CLI/MCP:

- `toss settlements summary --start-date --end-date --date-type soldDate`
- `toss settlements summary --start-date --end-date --date-type paidOutDate`
- `toss_settlement_summary`

핵심 필드:

- `paymentKey`, `transactionKey`, `orderId`, `mId`
- `method`, `currency`, `amount`
- `fees[].type`, `fees[].fee`, `supplyAmount`, `vat`, `payOutAmount`
- `approvedAt`, `soldDate`, `paidOutDate`

주의:

- 정산 기록은 결제가 일어난 다음 날부터 조회된다.
- `dateType` 기본은 `soldDate`이고 지급일 기준은 `paidOutDate`를 사용한다.
- 대량 조회는 `page`와 `size`를 사용한다. `size` 최대값은 문서 기준 `5000`.
- 수동 정산 `POST /v1/settlements`는 추가 계약이 필요한 write action이므로 MVP에서 제외한다.

### 3. 결제상세 보강

기본 API:

- `GET /v1/payments/{paymentKey}`
- `GET /v1/payments/orders/{orderId}`

용도:

- 거래/정산 row에서 부족한 상세 정보를 보강
- 영수증 URL, 세금 금액, 취소 이력, 카드 매입 상태, 가상계좌/계좌이체 정산 상태 확인
- webhook 수신 후 서버에서 결제 상태를 재조회해 확정

초기 CLI/MCP:

- `toss payments detail --payment-key`
- `toss payments detail --order-id`
- `toss_payment_detail`

핵심 필드:

- 식별자: `paymentKey`, `orderId`, `mId`, `lastTransactionKey`
- 상태/시간: `status`, `requestedAt`, `approvedAt`
- 금액: `totalAmount`, `balanceAmount`, `suppliedAmount`, `vat`, `taxFreeAmount`, `taxExemptionAmount`
- 취소: `cancels[].cancelAmount`, `cancels[].canceledAt`, `cancels[].transactionKey`
- 결제수단: `method`, `card`, `easyPay`, `transfer`, `virtualAccount`, `mobilePhone`, `giftCertificate`
- 증빙: `receipt.url`, 현금영수증 관련 키

주의:

- `paymentKey`와 `orderId`는 내부 대사 키로 반드시 보존한다.
- `card.number`, 가상계좌 환불 계좌 등 민감 필드는 기본 출력에서 마스킹하거나 제외한다.
- 클라이언트 성공/실패 redirect 값만으로 상태를 확정하지 않는다. 서버 secret key로 재조회한다.

## 집계 모델

초기 출력 모델은 다음 5개로 제한한다.

```yaml
payment_detail:
  keys: [paymentKey, orderId, mId]
  time_fields: [requestedAt, approvedAt]
  dimensions: [method, status]
  money_fields: [totalAmount, balanceAmount, suppliedAmount, vat, taxFreeAmount, taxExemptionAmount]

transaction_record:
  keys: [transactionKey, paymentKey, orderId, mId]
  time_fields: [transactionAt]
  dimensions: [method, status]
  money_fields: [amount]

settlement_record:
  keys: [transactionKey, paymentKey, orderId, mId]
  time_fields: [approvedAt, soldDate, paidOutDate]
  dimensions: [method]
  money_fields: [amount, interestFee, supplyAmount, vat, payOutAmount]

sales_summary:
  grain: [date, mId, method, status]
  source: transaction_record

settlement_reconciliation:
  grain: [soldDate, paidOutDate, mId, method]
  source: settlement_record
```

계산 규칙은 원천 API 필드를 넘어 추정하지 않는다. 예를 들어 "순매출" 정의는 고객 회계 기준에 따라 다를 수 있으므로, MVP에서는 원천 합계와 취소/정산/수수료/지급액을 분리해서 보여준다.

## 보안과 운영 기본값

- secret key는 env, keychain, connector secret store에서만 읽는다.
- raw secret, Authorization header, 마스킹 전 카드번호, 계좌번호, 고객 식별자는 로그와 MCP 응답에 반환하지 않는다.
- 모든 command는 `--format table|json`을 지원한다.
- 기본 조회 기간은 짧게 제한한다. 장기간 조회는 자동으로 일 단위 또는 페이지 단위로 쪼갠다.
- `GET` 재시도는 exponential backoff를 사용한다.
- `POST` 계열 write action은 MVP에서 command 자체를 노출하지 않는다.

## 우선 구현 순서

1. `toss_payment_detail`: `paymentKey`/`orderId` 단건 조회와 민감 필드 마스킹.
2. `toss_transaction_list`: 기간별 거래 조회, pagination, timeout/backoff.
3. `toss_sales_summary`: 거래 목록 기반 일자/결제수단/status 집계.
4. `toss_settlement_summary`: 정산 조회, `soldDate`/`paidOutDate` 기준 집계.
5. `toss_reconcile`: 거래와 정산을 `paymentKey` + `transactionKey` 중심으로 대조.

## 명확한 비범위

- 결제 승인/생성 UI 연동
- 환불/취소 실행
- 수동 정산 요청
- 현금영수증 발급/취소
- 카드 원문 또는 계좌 원문 수집
- Toss 관리자 화면 자동 로그인/스크래핑

import { normalizeKey, normalizeText } from "./normalize.mjs";
import { sha256Hex } from "./snapshot-files.mjs";

export const FIELD_ALIASES = {
  fundName: ["펀드명", "조합명", "투자조합명", "펀드", "fund name", "association name"],
  associationName: ["조합명", "투자조합명", "association name", "asct name"],
  investorNames: ["운용사", "운용사명", "업무집행조합원", "업무집행조합원명", "vc명", "vc", "회사명", "operator", "operators"],
  asctId: ["조합id", "조합 id", "asct id", "asct_id", "association id"],
  formedDate: ["결성일", "결성일자", "설립일", "formed date"],
  registeredDate: ["등록일", "등록일자", "registered date"],
  expiryDate: ["만기일", "존속기간종료일", "존속만기", "expiry date", "청산예정일"],
  durationText: ["존속기간", "운용기간", "duration"],
  committedAmountKrw: ["결성총액", "결성금액", "약정총액", "출자약정액", "결성총액억원", "committed amount"],
  investedAmountKrw: ["투자금액", "투자집행", "투자집행액", "집행액", "invested amount"],
  mfundInvested: ["모태출자액", "모태펀드출자", "모태출자", "mfund invested"],
  investmentPurpose: ["투자목적", "운용목적", "목적", "investment purpose"],
  investmentField: ["투자분야", "주력투자분야", "분야", "investment field"],
  categoryCode: ["대분류코드", "그룹코드", "category code"],
  categoryName: ["대분류", "분야", "카테고리", "category"],
  subcategoryCode: ["세부분류코드", "상세코드", "subcategory code"],
  subcategoryName: ["세부분류", "상세분야", "소분류", "subcategory"],
  sectorKeyword: ["섹터", "산업", "키워드", "sector", "keyword"],
  startupStage: ["단계", "투자단계", "성장단계", "stage"],
  region: ["지역", "권역", "region"],
  purposeType: ["목적유형", "purpose type"],
  supportType: ["지원유형", "support type"],
  accountType: ["계정구분", "account type"],
  representativeFundManager: ["대표펀드매니저", "대표 펀드매니저", "fund manager"]
};

const ALIAS_TO_FIELD = new Map(
  Object.entries(FIELD_ALIASES).flatMap(([field, aliases]) => aliases.map((alias) => [normalizeHeaderName(alias), field]))
);

export function normalizeHeaderName(value) {
  return normalizeKey(String(value ?? "").replace(/\([^)]*\)/g, ""));
}

export function canonicalFieldForHeader(header) {
  const key = normalizeHeaderName(header);
  return ALIAS_TO_FIELD.get(key) ?? null;
}

export function normalizeImportedRows(rows, { sourceId } = {}) {
  return rows.map((row, index) => normalizeImportedRow(row, { sourceId, rowIndex: row._rowIndex ?? index + 1 }));
}

export function normalizeImportedRow(row, { sourceId = "unknown", rowIndex = row?._rowIndex ?? 0 } = {}) {
  const canonical = canonicalizeRow(row);
  const fields = {
    sourceId,
    rowIndex,
    fundName: firstCanonical(canonical, "fundName"),
    associationName: firstCanonical(canonical, "associationName"),
    asctId: normalizeOptionalText(firstCanonical(canonical, "asctId")),
    investorNames: splitNames(firstCanonical(canonical, "investorNames")),
    formedDate: normalizeDate(firstCanonical(canonical, "formedDate")),
    registeredDate: normalizeDate(firstCanonical(canonical, "registeredDate")),
    expiryDate: normalizeDate(firstCanonical(canonical, "expiryDate")),
    durationText: normalizeOptionalText(firstCanonical(canonical, "durationText")),
    committedAmountKrw: parseKrwAmount(firstCanonical(canonical, "committedAmountKrw")),
    investedAmountKrw: parseKrwAmount(firstCanonical(canonical, "investedAmountKrw")),
    mfundInvested: parseKrwAmount(firstCanonical(canonical, "mfundInvested")),
    investmentPurpose: normalizeOptionalText(firstCanonical(canonical, "investmentPurpose")),
    investmentField: normalizeOptionalText(firstCanonical(canonical, "investmentField")),
    categoryCode: normalizeOptionalText(firstCanonical(canonical, "categoryCode")),
    categoryName: normalizeOptionalText(firstCanonical(canonical, "categoryName")),
    subcategoryCode: normalizeOptionalText(firstCanonical(canonical, "subcategoryCode")),
    subcategoryName: normalizeOptionalText(firstCanonical(canonical, "subcategoryName")),
    sectorKeyword: normalizeOptionalText(firstCanonical(canonical, "sectorKeyword")),
    startupStage: normalizeStage(firstCanonical(canonical, "startupStage")),
    region: normalizeOptionalText(firstCanonical(canonical, "region")),
    purposeType: normalizeOptionalText(firstCanonical(canonical, "purposeType")),
    supportType: normalizeOptionalText(firstCanonical(canonical, "supportType")),
    accountType: normalizeOptionalText(firstCanonical(canonical, "accountType")),
    representativeFundManager: normalizeOptionalText(firstCanonical(canonical, "representativeFundManager"))
  };

  if (!fields.fundName && sourceId === "kvca_diva_associations") fields.fundName = fields.associationName;
  if (!fields.associationName && sourceId === "kvca_diva_associations") fields.associationName = fields.fundName;

  const warnings = rowWarnings(row, fields, canonical, sourceId);
  const rawRowKey = stableId("row", [sourceId, rowIndex, fields.fundName, fields.associationName, fields.investorNames.join("|")]);

  return {
    raw: row,
    canonical,
    fields,
    warnings,
    rawRowKey
  };
}

export function canonicalizeRow(row = {}) {
  const canonical = {};
  for (const [header, value] of Object.entries(row)) {
    if (header.startsWith("_")) continue;
    const field = canonicalFieldForHeader(header);
    if (!field) continue;
    if (!canonical[field]) canonical[field] = [];
    canonical[field].push({ header, value: normalizeOptionalText(value) });
  }
  return canonical;
}

export function stableId(prefix, parts) {
  const input = parts
    .flat()
    .map((part) => normalizeKey(part ?? ""))
    .filter(Boolean)
    .join("|");
  return `${prefix}_${sha256Hex(input || prefix).slice(0, 16)}`;
}

export function parseKrwAmount(value) {
  const raw = normalizeOptionalText(value);
  if (!raw) return null;
  const normalized = raw.normalize("NFKC").replace(/,/g, "").replace(/\s+/g, "");
  let total = 0;
  let consumedUnit = false;

  const trillion = normalized.match(/([0-9]+(?:\.[0-9]+)?)조/);
  if (trillion) {
    total += Number(trillion[1]) * 1_000_000_000_000;
    consumedUnit = true;
  }

  const billion = normalized.match(/([0-9]+(?:\.[0-9]+)?)억/);
  if (billion) {
    total += Number(billion[1]) * 100_000_000;
    consumedUnit = true;
  }

  const tenThousand = normalized.match(/([0-9]+(?:\.[0-9]+)?)만/);
  if (tenThousand && !normalized.includes("억원")) {
    total += Number(tenThousand[1]) * 10_000;
    consumedUnit = true;
  }

  if (consumedUnit) return Math.round(total);

  const numeric = normalized.match(/[0-9]+(?:\.[0-9]+)?/);
  if (!numeric) return null;
  return Math.round(Number(numeric[0]));
}

export function normalizeDate(value) {
  const raw = normalizeOptionalText(value);
  if (!raw) return null;
  const normalized = raw.normalize("NFKC");
  const ymd = normalized.match(/(20\d{2}|19\d{2})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2})/);
  if (!ymd) return null;
  const [, year, month, day] = ymd;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function splitNames(value) {
  const raw = normalizeOptionalText(value);
  if (!raw) return [];
  return raw
    .replace(/\s+외\s+\d+.*$/u, "")
    .split(/[,;/\n·ㆍ]|(?:\s및\s)|(?:\s와\s)|(?:\s과\s)/u)
    .map((name) => name.replace(/\([^)]*\)/g, "").trim())
    .filter(Boolean);
}

function firstCanonical(canonical, field) {
  return canonical[field]?.find((entry) => entry.value)?.value ?? null;
}

function normalizeOptionalText(value) {
  const text = String(value ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
  return text || null;
}

function normalizeStage(value) {
  const text = normalizeText(value ?? "");
  if (!text) return null;
  if (/pre[\s-]?seed|프리시드/u.test(text)) return "pre_seed";
  if (/pre[\s-]?a|프리\s?a/u.test(text)) return "pre_a";
  if (/seed|시드|초기/u.test(text)) return "seed";
  if (/series\s?a|시리즈\s?a/u.test(text)) return "series_a";
  return normalizeOptionalText(value);
}

function rowWarnings(row, fields, canonical, sourceId) {
  const warnings = [];
  if (row._extraCells?.length) warnings.push(`Row ${fields.rowIndex} has extra cells: ${row._extraCells.join(" | ")}`);
  if (!fields.fundName) warnings.push(`Row ${fields.rowIndex} is missing fund/association name.`);
  if (sourceId !== "kvic_fundfinder" && fields.investorNames.length === 0) {
    warnings.push(`Row ${fields.rowIndex} is missing operator/investor name.`);
  }

  for (const field of ["committedAmountKrw", "investedAmountKrw", "mfundInvested"]) {
    const raw = firstCanonical(canonical, field);
    if (raw && fields[field] === null) warnings.push(`Row ${fields.rowIndex} has unparseable amount in ${field}: ${raw}`);
  }

  for (const field of ["formedDate", "registeredDate", "expiryDate"]) {
    const raw = firstCanonical(canonical, field);
    if (raw && fields[field] === null) warnings.push(`Row ${fields.rowIndex} has unparseable date in ${field}: ${raw}`);
  }

  return warnings;
}

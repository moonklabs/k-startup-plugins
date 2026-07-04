const STAGE_TERMS = [
  ["pre_seed", ["pre-seed", "pre seed", "프리시드"]],
  ["seed", ["seed", "시드", "초기"]],
  ["pre_a", ["pre-a", "pre a", "prea", "프리a", "프리 A", "프리 에이"]],
  ["series_a", ["series a", "시리즈a", "시리즈 A"]]
];

const SECTOR_TERMS = [
  ["ai", ["ai", "인공지능", "llm", "생성형"]],
  ["saas", ["saas", "software as a service", "소프트웨어"]],
  ["b2b", ["b2b", "기업용", "엔터프라이즈"]],
  ["fintech", ["fintech", "핀테크", "금융"]],
  ["commerce", ["commerce", "커머스", "이커머스"]]
];

const STOP_WORDS = new Set([
  "and",
  "the",
  "with",
  "for",
  "가능",
  "투자",
  "투자사",
  "펀드",
  "찾아줘",
  "알려줘",
  "있어"
]);

export function normalizeText(value = "") {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[._,;:!?()[\]{}"'`~|/\\<>+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeKey(value = "") {
  return normalizeText(value).replace(/[\s\p{P}\p{S}]+/gu, "");
}

export function tokenize(value = "") {
  const normalized = normalizeText(value);
  const rawTokens = normalized.split(/\s+/).filter(Boolean);
  const tokens = rawTokens
    .map((token) => token.replace(/(가|이|은|는|을|를|와|과|의|에|에서|으로|로)$/u, ""))
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
  return [...new Set(tokens)];
}

export function extractConditions(query) {
  const normalized = normalizeText(query);
  const key = normalizeKey(query);
  const stages = [];
  const sectors = [];

  for (const [stage, aliases] of STAGE_TERMS) {
    if (aliases.some((alias) => normalized.includes(normalizeText(alias)) || key.includes(normalizeKey(alias)))) {
      stages.push(stage);
    }
  }

  for (const [sector, aliases] of SECTOR_TERMS) {
    if (aliases.some((alias) => normalized.includes(normalizeText(alias)) || key.includes(normalizeKey(alias)))) {
      sectors.push(sector);
    }
  }

  const wantsTips = /tips|팁스/i.test(query);
  const wantsRecent = /최근|신규|결성|공시|변경|만기/u.test(query);

  return {
    stages: [...new Set(stages)],
    sectors: [...new Set(sectors)],
    wantsTips,
    wantsRecent
  };
}

export function inferIntent(query, conditions = extractConditions(query)) {
  const normalized = normalizeText(query);
  if (conditions.wantsRecent) return "new_fund_event";
  if (conditions.wantsTips) return "tips_signal";
  if (conditions.stages.length > 0 || conditions.sectors.length > 0) return "startup_fund_search";
  if (normalized.includes("가이드") || normalized.includes("준비") || normalized.includes("체크리스트")) {
    return "founder_education";
  }
  return "investor_fund_holding";
}

export function scoreNameMatch(query, label) {
  const queryKey = normalizeKey(query);
  const labelKey = normalizeKey(label);
  if (!queryKey || !labelKey) return null;
  if (queryKey === labelKey) return { matchType: "exact_normalized", score: 100 };
  if (queryKey.includes(labelKey)) return { matchType: "query_contains_candidate", score: 92 };
  if (labelKey.includes(queryKey) && queryKey.length >= 2) return { matchType: "candidate_contains_query", score: 82 };
  const tokens = tokenize(query).map(normalizeKey);
  if (tokens.some((token) => token === labelKey || labelKey.includes(token) || token.includes(labelKey))) {
    return { matchType: "token_overlap", score: 76 };
  }
  return null;
}

export function uniqueBy(items, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

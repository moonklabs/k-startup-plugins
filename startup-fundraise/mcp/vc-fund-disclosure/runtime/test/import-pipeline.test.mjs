import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { VcFundsCore } from "../src/core.mjs";
import { TOOLS } from "../src/mcp-stdio.mjs";
import { DEFAULT_IMPORT_ROOT, DEFAULT_IMPORT_ROOTS } from "../src/snapshot-files.mjs";

const runtimeRoot = resolve(import.meta.dirname, "..");
const specRoot = resolve(runtimeRoot, "..");
const repoRoot = resolve(runtimeRoot, "../../../..");
const pluginRoot = resolve(runtimeRoot, "../../..");
const binPath = resolve(runtimeRoot, "bin/vc-funds.mjs");
const fixtures = resolve(runtimeRoot, "fixtures");

test("KVIC and KVCA HTML/CSV imports are searchable and idempotent", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-import-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);

    const firstKvca = runJson([
      "import",
      "kvca",
      "--file",
      resolve(fixtures, "kvca-associations-basic.csv"),
      "--source-url",
      "http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq",
      "--captured-at",
      "2026-07-04T00:00:00.000Z",
      "--db",
      dbPath,
      "--json"
    ]);
    const secondKvca = runJson([
      "import",
      "kvca",
      "--file",
      resolve(fixtures, "kvca-associations-basic.csv"),
      "--source-url",
      "http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq",
      "--captured-at",
      "2026-07-04T00:00:00.000Z",
      "--db",
      dbPath,
      "--json"
    ]);
    const kvic = runJson([
      "import",
      "kvic",
      "--file",
      resolve(fixtures, "kvic-fundfinder-basic.html"),
      "--source-url",
      "http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd",
      "--captured-at",
      "2026-07-04T00:00:00.000Z",
      "--db",
      dbPath,
      "--json"
    ]);

    assert.equal(firstKvca.status, "success");
    assert.equal(secondKvca.snapshot_id, firstKvca.snapshot_id);
    assert.equal(kvic.status, "success");
    const toolContract = readFileSync(resolve(specRoot, "tool-contract.yaml"), "utf8");
    assertImportContractMatchesRuntime(toolContractBlock(toolContract, "import_kvic_snapshot"), TOOLS.find((tool) => tool.name === "import_kvic_snapshot"), kvic);
    assertImportContractMatchesRuntime(
      toolContractBlock(toolContract, "import_kvca_snapshot"),
      TOOLS.find((tool) => tool.name === "import_kvca_snapshot"),
      firstKvca
    );

    const counts = sqliteJson(
      dbPath,
      `
      SELECT
        (SELECT COUNT(*) FROM funds) AS funds,
        (SELECT COUNT(*) FROM investors) AS investors,
        (SELECT COUNT(*) FROM fund_operator_links) AS links,
        (SELECT COUNT(*) FROM kvca_associations) AS associations,
        (SELECT COUNT(*) FROM fund_investment_focus) AS focus_rows,
        (SELECT COUNT(*) FROM raw_artifacts) AS artifacts,
        (SELECT COUNT(*) FROM collection_runs) AS runs;
      `
    )[0];
    assert.deepEqual(counts, {
      funds: 2,
      investors: 2,
      links: 2,
      associations: 1,
      focus_rows: 1,
      artifacts: 2,
      runs: 2
    });

    const search = runJson(["search", "문클랩 AI SaaS 시드 프라이머", "--db", dbPath, "--json"]);
    assert.ok(search.results.some((result) => result.title === "문클랩 AI 초기투자조합" && result.evidence_status === "verified_official"));
    assert.ok(search.results.some((result) => result.title === "문클랩 시드 SaaS 펀드" && result.evidence_status === "verified_official"));
    assert.ok(search.results.every((result) => result.source_name !== undefined));
    assert.ok(search.results.every((result) => !(["source", "label"].join("_") in result)));
    assert.ok(search.results.every((result) => ["authoritative", "supporting", "context_only", "inspect"].includes(result.authority_role)));
    assert.ok(search.data_gaps.some((gap) => gap.includes("official_disclosure_documents")));

    const searchAudit = sqliteJson(
      dbPath,
      `
      SELECT
        sq.search_query_id,
        (SELECT COUNT(*) FROM search_results sr WHERE sr.search_query_id = sq.search_query_id) AS result_count,
        (SELECT COUNT(*) FROM evidence_claims) AS evidence_claim_count
      FROM search_queries sq
      WHERE sq.user_query = '문클랩 AI SaaS 시드 프라이머'
      LIMIT 1;
      `
    )[0];
    assert.equal(searchAudit.result_count, search.results.length);
    assert.ok(searchAudit.evidence_claim_count >= search.results.filter((result) => result.source_id).length);

    const persistedGapAudit = sqliteJson(
      dbPath,
      `
      SELECT sr.missing_evidence_json
      FROM search_results sr
      WHERE sr.search_query_id = '${searchAudit.search_query_id}'
      ORDER BY sr.result_rank
      LIMIT 1;
      `
    )[0];
    const missingEvidence = JSON.parse(persistedGapAudit.missing_evidence_json);
    assert.deepEqual(missingEvidence.data_gaps, search.data_gaps);
    assert.deepEqual(missingEvidence.recommended_imports, search.recommended_imports);

    const health = runJson(["health", "--db", dbPath, "--json"]);
    const kvcaHealth = health.sources.find((source) => source.source_id === "kvca_diva_associations");
    const kvicHealth = health.sources.find((source) => source.source_id === "kvic_fundfinder");
    assert.equal(kvcaHealth.successful_runs, 1);
    assert.equal(kvicHealth.successful_runs, 1);
    assert.equal(kvcaHealth.warning_count, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("core import path policy restricts MCP-style calls but CLI keeps explicit local import usable", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-path-policy-"));
  const dbPath = join(dir, "vc.sqlite");
  const core = new VcFundsCore({ dbPath });
  try {
    core.setup();
    assert.throws(
      () => core.importKvcaSnapshot({ file: resolve(fixtures, "kvca-associations-basic.csv") }),
      /outside allowed import roots/u
    );

    const safeFixture = join(dir, "kvca-associations-basic.csv");
    copyFileSync(resolve(fixtures, "kvca-associations-basic.csv"), safeFixture);
    const imported = core.importKvcaSnapshot({
      file: safeFixture,
      allowedRoots: [dir],
      sourceUrl: "http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq",
      capturedAt: "2026-07-04T00:00:00.000Z"
    });
    assert.equal(imported.status, "success");

    const cliImported = runJson([
      "import",
      "kvic",
      "--file",
      resolve(fixtures, "kvic-fundfinder-basic.csv"),
      "--source-url",
      "http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd",
      "--captured-at",
      "2026-07-04T00:00:00.000Z",
      "--db",
      dbPath,
      "--json"
    ]);
    assert.equal(cliImported.status, "success");

    const symlinkPath = join(dir, "kvca-link.csv");
    symlinkSync(safeFixture, symlinkPath);
    runFails(["import", "kvca", "--file", symlinkPath, "--db", dbPath, "--json"], /rejects symbolic links/u);

    const hiddenDir = join(dir, ".hidden");
    mkdirSync(hiddenDir);
    const hiddenFile = join(hiddenDir, "kvca.csv");
    copyFileSync(resolve(fixtures, "kvca-associations-basic.csv"), hiddenFile);
    runFails(["import", "kvca", "--file", hiddenFile, "--db", dbPath, "--json"], /rejects hidden files/u);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("default MCP import roots only include the disclosure root", () => {
  assert.deepEqual(DEFAULT_IMPORT_ROOTS, [DEFAULT_IMPORT_ROOT]);
});

test("cross-source duplicate snapshot content keeps source-specific artifact identity", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-cross-source-artifact-"));
  const dbPath = join(dir, "vc.sqlite");
  const duplicateCsv = join(dir, "same-content.csv");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    copyFileSync(resolve(fixtures, "kvca-associations-basic.csv"), duplicateCsv);

    const kvca = runJson([
      "import",
      "kvca",
      "--file",
      duplicateCsv,
      "--source-url",
      "http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq",
      "--captured-at",
      "2026-07-04T00:00:00.000Z",
      "--db",
      dbPath,
      "--json"
    ]);
    const kvic = runJson([
      "import",
      "kvic",
      "--file",
      duplicateCsv,
      "--source-url",
      "http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd",
      "--captured-at",
      "2026-07-04T00:00:00.000Z",
      "--db",
      dbPath,
      "--json"
    ]);

    assert.equal(kvca.status, "success");
    assert.ok(["success", "partial"].includes(kvic.status));
    const artifactRows = sqliteJson(
      dbPath,
      `
      SELECT source_id, COUNT(*) AS count
      FROM raw_artifacts
      GROUP BY source_id
      ORDER BY source_id;
      `
    );
    assert.deepEqual(artifactRows, [
      { source_id: "kvca_diva_associations", count: 1 },
      { source_id: "kvic_fundfinder", count: 1 }
    ]);
    const brokenSnapshots = sqliteJson(
      dbPath,
      `
      SELECT COUNT(*) AS count
      FROM source_snapshots ss
      LEFT JOIN raw_artifacts ra ON ra.artifact_id = ss.artifact_id
      WHERE ra.artifact_id IS NULL;
      `
    )[0];
    assert.equal(brokenSnapshots.count, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("stale official snapshots downgrade verified evidence and create a fresh-import gap", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-stale-snapshot-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    run([
      "import",
      "kvca",
      "--file",
      resolve(fixtures, "kvca-associations-basic.csv"),
      "--source-url",
      "http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq",
      "--captured-at",
      "2020-01-01T00:00:00.000Z",
      "--db",
      dbPath,
      "--json"
    ]);
    run([
      "import",
      "kvic",
      "--file",
      resolve(fixtures, "kvic-fundfinder-basic.html"),
      "--source-url",
      "http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd",
      "--captured-at",
      "2020-01-01T00:00:00.000Z",
      "--db",
      dbPath,
      "--json"
    ]);

    const search = runJson(["search", "문클랩 AI SaaS 시드 프라이머", "--db", dbPath, "--json"]);
    const officialRows = search.results.filter((result) => result.source_trust_tier?.startsWith("T1"));
    assert.ok(officialRows.length >= 1);
    assert.ok(officialRows.every((result) => result.evidence_status === "official_needs_review"));
    assert.ok(officialRows.some((result) => result.caveats.some((caveat) => caveat.includes("source snapshot is stale"))));
    assert.ok(search.data_gaps.includes("Some official-like rows use stale source snapshots and need a fresh import."));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("malformed rows create quality flags and downgrade official evidence", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-malformed-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    const imported = runJson([
      "import",
      "kvca",
      "--file",
      resolve(fixtures, "kvca-malformed-row.csv"),
      "--source-url",
      "http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq",
      "--captured-at",
      "2026-07-04T00:00:00.000Z",
      "--db",
      dbPath,
      "--json"
    ]);
    assert.equal(imported.status, "partial");
    assert.equal(imported.normalized_row_count, 1);
    assert.equal(imported.skipped_row_count, 1);
    assert.ok(imported.warning_count >= 1);

    const search = runJson(["search", "문클랩 리스크 검증조합 프라이머", "--db", dbPath, "--json"]);
    const fundResult = search.results.find((result) => result.title === "문클랩 리스크 검증조합");
    assert.ok(fundResult);
    assert.equal(fundResult.evidence_status, "official_needs_review");
    assert.match(fundResult.parser_warnings, /missing fund\/association name/u);

    const health = runJson(["health", "--db", dbPath, "--json"]);
    const kvcaHealth = health.sources.find((source) => source.source_id === "kvca_diva_associations");
    assert.ok(kvcaHealth.warning_count >= 1);
    assert.ok(kvcaHealth.open_quality_flags >= 1);
    assert.ok(health.warnings.some((warning) => warning.includes("kvca_diva_associations has")));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("condition-only searches cannot receive verified_official without entity resolution", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-condition-only-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    run([
      "import",
      "kvca",
      "--file",
      resolve(fixtures, "kvca-associations-basic.csv"),
      "--source-url",
      "http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq",
      "--captured-at",
      "2026-07-04T00:00:00.000Z",
      "--db",
      dbPath,
      "--json"
    ]);

    const search = runJson(["search", "AI SaaS 시드 투자사", "--db", dbPath, "--json"]);
    assert.equal(search.resolution_status, "no_match");
    assert.ok(search.results.length >= 1);
    assert.ok(search.results.every((result) => result.evidence_status !== "verified_official"));
    assert.ok(search.results.some((result) => result.evidence_status === "official_needs_review"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("intent hints drive required source planning", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-intent-hint-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    const search = runJson(["search", "프라이머", "--intent", "new_fund_event", "--db", dbPath, "--json"]);
    assert.equal(search.interpreted_intent, "new_fund_event");
    assert.ok(search.data_gaps.some((gap) => gap.includes("official_disclosure_documents")));
    assert.ok(search.recommended_imports.some((item) => item.source_id === "official_disclosure_documents"));

    const tipsSearch = runJson(["search", "TIPS 추천", "--intent", "tips_signal", "--db", dbPath, "--json"]);
    assert.equal(tipsSearch.interpreted_intent, "tips_signal");
    assert.deepEqual(tipsSearch.recommended_imports.map((item) => item.source_id), ["tips_public_site"]);
    assert.ok(tipsSearch.data_gaps.every((gap) => !gap.includes("kvic_fundfinder") && !gap.includes("kvca_diva_associations")));
    assert.equal(
      sqliteJson(dbPath, "SELECT interpreted_intent FROM search_queries WHERE user_query = 'TIPS 추천' ORDER BY created_at DESC LIMIT 1;")[0]
        .interpreted_intent,
      "tips_signal"
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("no-hit searches persist query-level gap audit", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-no-hit-gap-audit-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    const search = runJson(["search", "완전히없는투자사 신규 펀드", "--intent", "new_fund_event", "--db", dbPath, "--json"]);
    assert.equal(search.results.length, 0);
    assert.ok(search.data_gaps.includes("No local rows matched the query."));
    assert.ok(search.data_gaps.some((gap) => gap.includes("official_disclosure_documents")));

    const audit = sqliteJson(
      dbPath,
      `
      SELECT data_gaps_json, recommended_imports_json
      FROM search_queries
      WHERE user_query = '완전히없는투자사 신규 펀드'
      ORDER BY created_at DESC
      LIMIT 1;
      `
    )[0];
    assert.deepEqual(JSON.parse(audit.data_gaps_json), search.data_gaps);
    assert.deepEqual(JSON.parse(audit.recommended_imports_json), search.recommended_imports);
    assert.equal(sqliteJson(dbPath, "SELECT COUNT(*) AS count FROM search_results;")[0].count, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("source authority classifies private notes as context-only", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-source-authority-"));
  const dbPath = join(dir, "vc.sqlite");
  const core = new VcFundsCore({ dbPath });
  try {
    core.setup();
    const authority = core.getSourceAuthority({ intentOrClaimType: "tips_signal" });
    const userNotes = authority.source_authority.find((source) => source.source_id === "user_notes");
    const tips = authority.source_authority.find((source) => source.source_id === "tips_public_site");
    assert.equal(userNotes.authority_role, "context_only");
    assert.equal(tips.authority_role, "authoritative");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("quality checks flag accepted alias candidates without explanations", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-quality-alias-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    const nonExactMatches = [
      "alias_query_contains_candidate",
      "query_contains_candidate",
      "candidate_contains_query",
      "token_overlap"
    ];
    runSql(
      dbPath,
      `
      INSERT INTO search_queries (
        search_query_id,
        user_query,
        interpreted_intent,
        resolution_status
      ) VALUES (
        'sq_alias_gap',
        '프라이머',
        'investor_fund_holding',
        'resolved_alias'
      );
      INSERT INTO entity_resolution_candidates (
        resolution_candidate_id,
        search_query_id,
        raw_text,
        entity_type,
        candidate_entity_id,
        candidate_label,
        normalized_candidate_label,
        match_type,
        match_score,
        resolution_status,
        why_candidate
      ) VALUES
      ${nonExactMatches
        .map(
          (matchType, index) => `(
        'erc_non_exact_gap_${index}',
        'sq_alias_gap',
        '프라이머',
        'investor',
        'inv_primer',
        'Primer',
        'primer',
        '${matchType}',
        95,
        'resolved_alias',
        ''
      )`
        )
        .join(",\n      ")};
      `
    );
    const qualityOutput = runSql(dbPath, readFileSync(resolve(specRoot, "quality-checks.sql"), "utf8"));
    assert.match(qualityOutput, /non_exact_resolution_without_explanation/u);
    for (let index = 0; index < nonExactMatches.length; index += 1) {
      assert.match(qualityOutput, new RegExp(`erc_non_exact_gap_${index}\\b`, "u"));
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("invalid intent hints are rejected before search output", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-invalid-intent-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    runFails(["search", "프라이머", "--intent", ["investor", "profile", "lookup"].join("_"), "--db", dbPath, "--json"], /intent_hint must be one of/u);
    runFails(["search", "프라이머", "--intent", ["unsupported", "intent"].join("_"), "--db", dbPath, "--json"], /intent_hint must be one of/u);
    assert.equal(sqliteJson(dbPath, "SELECT COUNT(*) AS count FROM search_queries;")[0].count, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("resolution statuses and interpreted intents stay on the canonical contract vocabulary", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-contract-vocab-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    run(["load-sql", resolve(fixtures, "sample-data.sql"), "--db", dbPath, "--json"]);

    const canonicalStatuses = new Set(["resolved_exact", "resolved_alias", "ambiguous", "no_match"]);
    const canonicalIntents = new Set(["investor_fund_holding", "startup_fund_search", "tips_signal", "new_fund_event", "founder_education"]);

    for (const query of ["프라이머", "Primer", "AI SaaS 시드 투자사", "최근 신규 펀드", "TIPS 추천", "투자 미팅 준비"]) {
      const resolved = runJson(["resolve", query, "--db", dbPath, "--json"]);
      assert.ok(canonicalStatuses.has(resolved.resolution_status), query);
      assert.ok(canonicalIntents.has(resolved.interpreted_intent), query);
      for (const candidate of resolved.resolution_candidates) {
        assert.ok(canonicalStatuses.has(candidate.resolution_status), `${query}: ${candidate.resolution_status}`);
      }
    }

    const searchContract = readFileSync(resolve(specRoot, "search-contract.yaml"), "utf8");
    const contractIntents = new Set([...searchContract.matchAll(/^\s+- intent: ([a-z_]+)/gm)].map((match) => match[1]));
    assert.deepEqual(contractIntents, canonicalIntents);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("SQLite schema rejects noncanonical search status and intent values", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-schema-enum-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    const badQuery = spawnSync("sqlite3", [
      dbPath,
      `INSERT INTO search_queries (search_query_id, user_query, interpreted_intent, resolution_status) VALUES ('sq_bad', 'bad', 'startup_fund_search', '${["resolved", "candidate"].join("_")}');`
    ], { encoding: "utf8" });
    assert.notEqual(badQuery.status, 0);
    assert.match(badQuery.stderr || badQuery.stdout, /CHECK constraint failed/u);

    const nullQuery = spawnSync("sqlite3", [
      dbPath,
      "INSERT INTO search_queries (search_query_id, user_query, interpreted_intent, resolution_status) VALUES ('sq_null', 'bad', 'startup_fund_search', NULL);"
    ], { encoding: "utf8" });
    assert.notEqual(nullQuery.status, 0);
    assert.match(nullQuery.stderr || nullQuery.stdout, /NOT NULL constraint failed/u);

    const badIntent = spawnSync("sqlite3", [
      dbPath,
      `INSERT INTO search_queries (search_query_id, user_query, interpreted_intent, resolution_status) VALUES ('sq_bad_intent', 'bad', '${["made", "up", "intent"].join("_")}', 'no_match');`
    ], { encoding: "utf8" });
    assert.notEqual(badIntent.status, 0);
    assert.match(badIntent.stderr || badIntent.stdout, /CHECK constraint failed/u);

    const nullIntent = spawnSync("sqlite3", [
      dbPath,
      "INSERT INTO search_queries (search_query_id, user_query, interpreted_intent, resolution_status) VALUES ('sq_null_intent', 'bad', NULL, 'no_match');"
    ], { encoding: "utf8" });
    assert.notEqual(nullIntent.status, 0);
    assert.match(nullIntent.stderr || nullIntent.stdout, /NOT NULL constraint failed/u);

    const badCandidate = spawnSync("sqlite3", [
      dbPath,
      `INSERT INTO search_queries (search_query_id, user_query, interpreted_intent, resolution_status) VALUES ('sq_ok', 'ok', 'startup_fund_search', 'no_match'); INSERT INTO entity_resolution_candidates (resolution_candidate_id, search_query_id, raw_text, entity_type, candidate_label, match_type, match_score, resolution_status) VALUES ('erc_bad', 'sq_ok', 'bad', 'fund', 'bad', 'fuzzy', 10, '${["needs", "review"].join("_")}');`
    ], { encoding: "utf8" });
    assert.notEqual(badCandidate.status, 0);
    assert.match(badCandidate.stderr || badCandidate.stdout, /CHECK constraint failed/u);

    const badSearchResult = spawnSync("sqlite3", [
      dbPath,
      `INSERT INTO search_results (search_result_id, search_query_id, result_rank, entity_type, title, score, evidence_status, resolution_status, why_ranked) VALUES ('sr_bad', 'sq_ok', 1, 'fund', 'bad', 1, 'no_evidence', '${["resolved", "candidate"].join("_")}', 'bad');`
    ], { encoding: "utf8" });
    assert.notEqual(badSearchResult.status, 0);
    assert.match(badSearchResult.stderr || badSearchResult.stdout, /CHECK constraint failed/u);

    const nullSearchResult = spawnSync("sqlite3", [
      dbPath,
      "INSERT INTO search_results (search_result_id, search_query_id, result_rank, entity_type, title, score, evidence_status, resolution_status, why_ranked) VALUES ('sr_null', 'sq_ok', 1, 'fund', 'bad', 1, 'no_evidence', NULL, 'bad');"
    ], { encoding: "utf8" });
    assert.notEqual(nullSearchResult.status, 0);
    assert.match(nullSearchResult.stderr || nullSearchResult.stdout, /NOT NULL constraint failed/u);

    const badEvidenceStatus = spawnSync("sqlite3", [
      dbPath,
      "INSERT INTO search_results (search_result_id, search_query_id, result_rank, entity_type, title, score, evidence_status, resolution_status, why_ranked) VALUES ('sr_bad_evidence', 'sq_ok', 1, 'fund', 'bad', 1, 'verified-ish', 'no_match', 'bad');"
    ], { encoding: "utf8" });
    assert.notEqual(badEvidenceStatus.status, 0);
    assert.match(badEvidenceStatus.stderr || badEvidenceStatus.stdout, /CHECK constraint failed/u);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("doctor reports missing schema instead of masking an empty DB as healthy", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-doctor-"));
  const dbPath = join(dir, "empty.sqlite");
  try {
    const beforeSetup = runJson(["doctor", "--db", dbPath, "--json"]);
    assert.equal(beforeSetup.ok, false);
    assert.ok(beforeSetup.missing_schema_objects.some((item) => item.name === "sources"));

    run(["setup", "--db", dbPath, "--json"]);
    const afterSetup = runJson(["doctor", "--db", dbPath, "--json"]);
    assert.equal(afterSetup.ok, true);
    assert.deepEqual(afterSetup.missing_schema_objects, []);

    runSql(dbPath, "DROP TABLE evidence_claims;");
    const partialMigration = runJson(["doctor", "--db", dbPath, "--json"]);
    assert.equal(partialMigration.ok, false);
    assert.ok(partialMigration.missing_schema_objects.some((item) => item.type === "table" && item.name === "evidence_claims"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("doctor reports old partial schemas with missing required columns as unhealthy", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-doctor-old-schema-"));
  const dbPath = join(dir, "old.sqlite");
  try {
    runSql(
      dbPath,
      `
      CREATE TABLE sources (
        source_id TEXT PRIMARY KEY,
        source_name TEXT NOT NULL,
        owner TEXT,
        source_type TEXT NOT NULL,
        base_url TEXT,
        base_path TEXT,
        policy_status TEXT NOT NULL,
        default_collection_modes TEXT,
        disabled_collection_modes TEXT,
        privacy_level TEXT NOT NULL DEFAULT 'public',
        last_policy_checked_at TEXT,
        notes TEXT
      );
      `
    );

    runFails(["setup", "--db", dbPath, "--json"], /trust_tier|no column/u);
    const doctor = runJson(["doctor", "--db", dbPath, "--json"]);
    assert.equal(doctor.ok, false);
    assert.ok(doctor.missing_schema_objects.some((item) => item.type === "column" && item.name === "sources.trust_tier"));
    assert.ok(doctor.missing_schema_objects.some((item) => item.type === "column" && item.name === "sources.authoritative_scope"));
    assert.ok(doctor.missing_schema_objects.some((item) => item.type === "column" && item.name === "sources.freshness_days"));
    assert.ok(doctor.missing_schema_objects.some((item) => item.type === "view_query" && item.name === "v_source_authority"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("doctor validates columns on audit-only tables", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-doctor-audit-columns-"));
  const dbPath = join(dir, "audit.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    runSql(
      dbPath,
      `
      ALTER TABLE review_queue RENAME TO review_queue_old;
      CREATE TABLE review_queue (
        review_id TEXT PRIMARY KEY,
        item_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'normal',
        status TEXT NOT NULL DEFAULT 'open',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TEXT
      );
      DROP TABLE review_queue_old;
      `
    );

    const doctor = runJson(["doctor", "--db", dbPath, "--json"]);
    assert.equal(doctor.ok, false);
    assert.ok(doctor.missing_schema_objects.some((item) => item.type === "column" && item.name === "review_queue.review_note"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("malformed authoritative_scope cannot produce verified_official", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-scope-fail-closed-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    run(["load-sql", resolve(fixtures, "sample-data.sql"), "--db", dbPath, "--json"]);
    runSql(dbPath, "UPDATE sources SET authoritative_scope = 'startup_fund_search' WHERE source_id = 'kvca_diva_associations';");

    const search = runJson(["search", "프라이머 AI SaaS Seed Pre-A 투자사", "--db", dbPath, "--json"]);
    const primerFund = search.results.find((result) => result.title === "프라이머 초기 AI SaaS 펀드");
    assert.ok(primerFund);
    assert.equal(primerFund.authority_role, "supporting");
    assert.equal(primerFund.authority_scope_error, "malformed_authoritative_scope");
    assert.equal(primerFund.evidence_status, "official_needs_review");
    assert.match(primerFund.caveats.join(" "), /authoritative scope metadata is malformed/u);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("document chunks follow source trust tier for evidence status", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-document-evidence-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    run(["load-sql", resolve(fixtures, "sample-data.sql"), "--db", dbPath, "--json"]);
    runSql(
      dbPath,
      `
      INSERT INTO funds (
        fund_id,
        fund_name,
        normalized_fund_name,
        fund_type,
        formed_date,
        committed_amount_krw,
        investment_purpose,
        trust_level,
        latest_evidence_at
      ) VALUES (
        'fund_official_doc_only',
        '문클랩 공식문서 검증 펀드',
        '문클랩공식문서검증펀드',
        '벤처투자조합',
        '2026-07-04',
        10000000000,
        'AI SaaS Seed Pre-A 공식문서 검증',
        'official',
        '2026-07-04T00:00:00Z'
      );
      INSERT INTO documents (
        document_id,
        source_id,
        title,
        document_role,
        publisher,
        source_url,
        published_date,
        file_name,
        file_type,
        file_sha256,
        storage_uri,
        trust_level,
        parser_status
      ) VALUES (
        'doc_official_primer_event',
        'official_disclosure_documents',
        '문클랩 공식문서 검증 펀드 결성 공시',
        'fund_event',
        'official_sources',
        'https://example.invalid/disclosures/moonklabs-official-doc-fund.pdf',
        '2026-07-04',
        'moonklabs-official-doc-fund.pdf',
        'pdf',
        'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        'fixture://moonklabs-official-doc-fund.pdf',
        'official',
        'success'
      );
      INSERT INTO document_chunks (
        chunk_id,
        document_id,
        chunk_index,
        heading,
        body_text,
        body_text_sha256,
        startup_stage,
        topic_tags
      ) VALUES (
        'chunk_official_primer_event',
        'doc_official_primer_event',
        1,
        '문클랩 공식문서 검증 펀드 결성',
        '문클랩 공식문서 검증 펀드 결성 공시 문서이며 Seed Pre-A AI SaaS 투자 목적을 포함한다.',
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        'seed pre_a',
        'official_disclosure,startup_fund_search,new_fund_event'
      );
      `
    );

    const officialSearch = runJson(["search", "문클랩 공식문서 검증 펀드", "--intent", "startup_fund_search", "--db", dbPath, "--json"]);
    assert.equal(officialSearch.resolution_status, "resolved_exact");
    const officialChunk = officialSearch.results.find((result) => result.entity_id === "chunk_official_primer_event");
    assert.ok(officialChunk);
    assert.equal(officialChunk.source_id, "official_disclosure_documents");
    assert.equal(officialChunk.authority_role, "authoritative");
    assert.equal(officialChunk.evidence_status, "verified_official");

    const guideSearch = runJson(["search", "Seed 투자 미팅 준비", "--intent", "founder_education", "--db", dbPath, "--json"]);
    const guideChunk = guideSearch.results.find((result) => result.entity_id === "chunk_seed_meeting_prep");
    assert.ok(guideChunk);
    assert.equal(guideChunk.source_id, "founder_guide_library");
    assert.equal(guideChunk.evidence_status, "guide_only");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("XLS and XLSX snapshots return unsupported_format without DB writes", () => {
  const dir = mkdtempSync(join(tmpdir(), "vc-funds-unsupported-"));
  const dbPath = join(dir, "vc.sqlite");
  try {
    run(["setup", "--db", dbPath, "--json"]);
    const xls = runJson(["import", "kvca", "--file", resolve(fixtures, "unsupported.xls"), "--db", dbPath, "--json"]);
    const xlsx = runJson(["import", "kvic", "--file", resolve(fixtures, "unsupported.xlsx"), "--db", dbPath, "--json"]);
    assert.equal(xls.status, "unsupported_format");
    assert.equal(xlsx.status, "unsupported_format");
    assert.match(xls.reason, /HTML or CSV/u);
    assert.match(xlsx.reason, /HTML or CSV/u);
    assert.equal(xls.source_name, "KVCA DIVA 조합현황");
    assert.equal(xlsx.source_name, "KVIC FundFinder");
    assert.equal(xls.run_id, null);
    assert.equal(xlsx.artifact_id, null);
    assert.equal(xls.warning_count, 1);
    assert.deepEqual(xls.warnings, [xls.reason]);
    assert.deepEqual(xls.imported, emptyImportCounters());
    assert.deepEqual(xlsx.imported, emptyImportCounters());

    const toolContract = readFileSync(resolve(specRoot, "tool-contract.yaml"), "utf8");
    assertImportContractMatchesRuntime(
      toolContractBlock(toolContract, "import_kvca_snapshot"),
      TOOLS.find((tool) => tool.name === "import_kvca_snapshot"),
      xls
    );
    assertImportContractMatchesRuntime(
      toolContractBlock(toolContract, "import_kvic_snapshot"),
      TOOLS.find((tool) => tool.name === "import_kvic_snapshot"),
      xlsx
    );

    const counts = sqliteJson(
      dbPath,
      `
      SELECT
        (SELECT COUNT(*) FROM collection_runs) AS runs,
        (SELECT COUNT(*) FROM raw_artifacts) AS artifacts,
        (SELECT COUNT(*) FROM source_snapshots) AS snapshots,
        (SELECT COUNT(*) FROM funds) AS funds;
      `
    )[0];
    assert.deepEqual(counts, { runs: 0, artifacts: 0, snapshots: 0, funds: 0 });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("P1 contract docs do not claim XLS table parsing support", () => {
  const stalePatterns = [
    ["HTML", "CSV", "XLS"].join("/"),
    ["CSV", "XLS"].join("/"),
    ["CSV", " XLS"].join(","),
    ["엑셀", "CSV"].join("/"),
    ["xls", "Table"].join("")
  ];
  const staleContractRe = new RegExp(stalePatterns.map(escapeRegExp).join("|"), "u");
  const staleImportFieldRe = /imported_funds|imported_associations|categories:\s*number|operators:\s*number/u;
  const paths = [
    resolve(specRoot, "README.md"),
    resolve(specRoot, "server-cli-usage.md"),
    resolve(specRoot, "search-contract.yaml"),
    resolve(specRoot, "tool-contract.yaml"),
    resolve(specRoot, "implementation-blueprint.md"),
    resolve(pluginRoot, "commands/vc-funds-setup.md"),
    resolve(repoRoot, "docs/2026-07-04-kvic-kvca-fund-data-mcp.md"),
    resolve(repoRoot, "docs/tools-capability-matrix.yaml")
  ];

  for (const path of paths) {
    const text = readFileSync(path, "utf8");
    assert.doesNotMatch(text, staleContractRe, path);
    assert.doesNotMatch(text, staleImportFieldRe, path);
  }

  const toolContract = readFileSync(resolve(specRoot, "tool-contract.yaml"), "utf8");
  assert.match(toolContract, /unsupported_format/u);
  assert.match(toolContract, /cli_explicit_import_root_exception/u);
  assert.match(toolContract, /rejects symlinks, hidden path segments, non-files, and files over the size limit/u);

  const searchContract = readFileSync(resolve(specRoot, "search-contract.yaml"), "utf8");
  const dataTrustContract = readFileSync(resolve(specRoot, "data-trust-resolution-contract.yaml"), "utf8");
  assert.doesNotMatch(searchContract, /primary_tool:\s+search_tips_signal/u);
  assert.match(searchContract, /intent: tips_signal[\s\S]*primary_tool: search_vc_database[\s\S]*intent_hint: tips_signal/u);

  const searchTool = TOOLS.find((tool) => tool.name === "search_vc_database");
  assert.deepEqual(searchTool.inputSchema.properties.intent_hint.enum, [
    "investor_fund_holding",
    "startup_fund_search",
    "tips_signal",
    "new_fund_event",
    "founder_education"
  ]);

  const runtimeToolNames = new Set(TOOLS.map((tool) => tool.name));
  const contractToolNames = new Set([...toolContract.matchAll(/^\s+- name: ([a-z_]+)/gm)].map((match) => match[1]));
  assert.deepEqual(contractToolNames, runtimeToolNames);

  const routedToolNames = routedToolsFromSearchContract(searchContract);
  for (const toolName of routedToolNames) {
    assert.ok(runtimeToolNames.has(toolName), `${toolName} must be exposed by the runtime MCP server`);
  }

  const dataTrustToolBlock = dataTrustContract.match(/mcp_tool_requirements:\n([\s\S]*?)\n\nquality_checks:/u)?.[1] ?? "";
  const dataTrustToolNames = new Set([...dataTrustToolBlock.matchAll(/^\s+- "([a-z_]+)"/gm)].map((match) => match[1]));
  assert.deepEqual(dataTrustToolNames, runtimeToolNames);

  const canonicalRankingBlock = searchContract.match(/ranking_model:\n([\s\S]*?)\n\nevidence_statuses:/u)?.[1] ?? "";
  assert.match(canonicalRankingBlock, /draft_heuristic_matches_runtime/u);
  assert.match(canonicalRankingBlock, /entity_candidate_bonus/u);
  assert.match(canonicalRankingBlock, /lexical_term_hit/u);
  assert.match(canonicalRankingBlock, /condition_hit/u);
  assert.match(canonicalRankingBlock, /trust_score/u);
  assert.doesNotMatch(canonicalRankingBlock, /^\s{4}recency_and_dry_powder_signal:/m);
  assert.doesNotMatch(canonicalRankingBlock, /^\s{4}parser_quality:/m);
  assert.doesNotMatch(canonicalRankingBlock, /^\s{4}data_completeness:/m);
  const searchPrinciples = searchContract.match(/search_principles:\n([\s\S]*?)\n\nquery_intents:/u)?.[1] ?? "";
  assert.match(searchPrinciples, /entity\/condition hit|entity 후보|lexical hit|source trust score/u);
  assert.doesNotMatch(searchPrinciples, /source coverage|최신성, parser 품질|FundFinder\/KVCA\/TIPS 근거/u);
  const searchResultShape = searchContract.match(/result_shape:\n([\s\S]*?)\n\nempty_state_rules:/u)?.[1] ?? "";
  const requiredFieldsBlock = searchResultShape.match(/required_fields:\n([\s\S]*?)\n\s+optional_fields:/u)?.[1] ?? "";
  const requiredResultFields = [...requiredFieldsBlock.matchAll(/^\s{4}- ([a-z0-9_]+)/gm)].map((match) => match[1]);
  assert.ok(requiredResultFields.length > 0);
  for (const field of requiredResultFields) {
    assert.match(toolContract, new RegExp(`\\b${field}\\b`, "u"), `${field} must be declared in tool-contract.yaml`);
  }

  const cliRequirementBlock = dataTrustContract.match(/cli_requirements:\n\s+commands:\n([\s\S]*?)\n\s+noncanonical_planned_commands:/u)?.[1] ?? "";
  const canonicalCliCommands = [...cliRequirementBlock.matchAll(/^\s{4}- name: "vc-funds ([^" <]+)/gm)].map((match) => match[1]);
  assert.deepEqual(canonicalCliCommands, ["resolve", "sources", "search"]);
  assert.doesNotMatch(cliRequirementBlock, /^\s{4}- name: "vc-funds gaps/m);

  const currentSurfaceDocs = [
    resolve(repoRoot, "docs/tools-capability-matrix.yaml"),
    resolve(repoRoot, "docs/2026-07-04-kvic-kvca-fund-data-mcp.md"),
    resolve(pluginRoot, "commands/vc-funds-setup.md"),
    resolve(specRoot, "implementation-blueprint.md"),
    resolve(specRoot, "server-cli-usage.md")
  ]
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  assert.doesNotMatch(currentSurfaceDocs, /vc-funds gaps/u);
  assert.doesNotMatch(currentSurfaceDocs, /recency\/dry powder signal|parser quality:\s*10|data completeness:\s*10/u);
});

function run(args) {
  const result = spawnSync(process.execPath, [binPath, ...args], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}

function runJson(args) {
  return JSON.parse(run(args));
}

function runFails(args, pattern) {
  const result = spawnSync(process.execPath, [binPath, ...args], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr || result.stdout, pattern);
  return result;
}

function sqliteJson(dbPath, sql) {
  const result = spawnSync("sqlite3", ["-json", dbPath, sql], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function runSql(dbPath, sql) {
  const result = spawnSync("sqlite3", [dbPath], {
    input: sql,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function routedToolsFromSearchContract(searchContract) {
  const tools = new Set([...searchContract.matchAll(/^\s+primary_tool:\s+([a-z_]+)/gm)].map((match) => match[1]));
  const lines = searchContract.split(/\r?\n/u);
  let inFallbackTools = false;
  for (const line of lines) {
    if (/^\s+fallback_tools:\s*$/u.test(line)) {
      inFallbackTools = true;
      continue;
    }
    const fallbackTool = inFallbackTools ? line.match(/^\s{6}-\s+([a-z_]+)\s*$/u)?.[1] : null;
    if (fallbackTool) {
      tools.add(fallbackTool);
      continue;
    }
    if (inFallbackTools && !/^\s{6}-/u.test(line)) {
      inFallbackTools = false;
    }
  }
  return tools;
}

function toolContractBlock(toolContract, toolName) {
  const block = toolContract.match(new RegExp(`^  - name: ${escapeRegExp(toolName)}\\n([\\s\\S]*?)(?=\\n  - name:|\\nresponse_rules:)`, "m"))?.[1];
  assert.ok(block, `${toolName} contract block must exist`);
  return block;
}

function assertImportContractMatchesRuntime(contractBlock, runtimeTool, response) {
  assert.ok(runtimeTool);
  assert.deepEqual(runtimeTool.inputSchema.required, ["file_path"]);
  const inputBlock = contractBlock.match(/input_schema:\n([\s\S]*?)\n    output_schema:/u)?.[1] ?? "";
  for (const field of Object.keys(runtimeTool.inputSchema.properties)) {
    assert.match(inputBlock, new RegExp(`^      ${escapeRegExp(field)}:`, "m"), `${runtimeTool.name} input ${field} must be declared`);
    if (!runtimeTool.inputSchema.required.includes(field)) {
      assert.match(inputBlock, new RegExp(`^      ${escapeRegExp(field)}: \\{[^\\n}]*optional: true`, "m"), `${runtimeTool.name} input ${field} must be optional`);
    }
  }

  const outputBlock = contractBlock.match(/output_schema:\n([\s\S]*?)\n    writes:/u)?.[1] ?? "";
  const requiredTopLevelFields = [...outputBlock.matchAll(/^      ([a-z_]+):(.+)$/gmu)]
    .filter(([, , declaration]) => !declaration.includes("optional: true"))
    .map(([_, field]) => field);
  for (const field of requiredTopLevelFields) {
    assert.ok(Object.hasOwn(response, field), `${runtimeTool.name} response must include required output ${field}`);
  }

  for (const [field, value] of Object.entries(response)) {
    assert.match(outputBlock, new RegExp(`^      ${escapeRegExp(field)}:`, "m"), `${runtimeTool.name} output ${field} must be declared`);
    if (field === "imported") {
      const importedBlock = outputBlock.match(/^      imported:\n([\s\S]*?)(?=^      [a-z_]+:)/mu)?.[1] ?? "";
      const requiredImportedFields = [...importedBlock.matchAll(/^        ([a-z_]+):/gmu)].map(([_, importedField]) => importedField);
      for (const importedField of requiredImportedFields) {
        assert.ok(Object.hasOwn(value, importedField), `${runtimeTool.name} response must include required output imported.${importedField}`);
      }
      for (const importedField of Object.keys(value)) {
        assert.match(outputBlock, new RegExp(`^        ${escapeRegExp(importedField)}:`, "m"), `${runtimeTool.name} imported.${importedField} must be declared`);
      }
    }
  }
}

function emptyImportCounters() {
  return {
    funds: 0,
    investors: 0,
    operator_links: 0,
    kvic_focus_rows: 0,
    kvca_associations: 0,
    data_quality_flags: 0
  };
}

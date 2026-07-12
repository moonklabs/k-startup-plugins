import { normalizeKey } from "./normalize.mjs";
import { normalizeImportedRows, stableId } from "./import-normalizers.mjs";
import { readSnapshotFile } from "./snapshot-files.mjs";
import { parseSnapshotTable } from "./table-parser.mjs";
import { execSql, queryJson, sqlJson, sqlString } from "./sqlite.mjs";

const PARSER_VERSION = "vc-funds-snapshot-import-v1";

const SOURCE_CONFIGS = {
  kvic_fundfinder: {
    collectionMode: "manual_snapshot_import",
    snapshotKind: "kvic_fundfinder_list",
    artifactTypePrefix: "kvic_fundfinder"
  },
  kvca_diva_associations: {
    collectionMode: "manual_snapshot_import",
    snapshotKind: "kvca_association_list",
    artifactTypePrefix: "kvca_diva_associations"
  }
};

export function importKvicSnapshot(dbPath, options = {}) {
  return importOfficialSnapshot(dbPath, {
    ...options,
    sourceId: "kvic_fundfinder"
  });
}

export function importKvcaSnapshot(dbPath, options = {}) {
  return importOfficialSnapshot(dbPath, {
    ...options,
    sourceId: "kvca_diva_associations"
  });
}

export function importOfficialSnapshot(dbPath, options = {}) {
  if (!options.file) throw new Error("import requires --file <path>");

  const config = SOURCE_CONFIGS[options.sourceId];
  if (!config) throw new Error(`Unsupported import source: ${options.sourceId}`);

  const source = first(
    queryJson(
      dbPath,
      `
      SELECT source_id, source_name, base_url
      FROM sources
      WHERE source_id = ${sqlString(options.sourceId)}
      LIMIT 1;
      `
    )
  );
  if (!source.source_id) throw new Error(`Source ${options.sourceId} is missing. Run setup first.`);

  const snapshotFile = readSnapshotFile(options.file, {
    enforceAllowedRoots: options.enforceAllowedRoots !== false,
    allowedRoots: options.allowedRoots,
    maxBytes: options.maxBytes
  });
  const capturedAt = options.capturedAt || new Date().toISOString();
  const sourceUrl = options.sourceUrl || source.base_url;

  if (!snapshotFile.supported) {
    const reason = snapshotFile.unsupportedReason;
    return {
      ok: false,
      status: "unsupported_format",
      source_id: options.sourceId,
      source_name: source.source_name,
      source_url: sourceUrl,
      file: snapshotFile.path,
      format: snapshotFile.format,
      content_sha256: snapshotFile.contentSha256,
      run_id: null,
      artifact_id: null,
      snapshot_id: null,
      raw_row_count: 0,
      normalized_row_count: 0,
      skipped_row_count: 0,
      warning_count: 1,
      imported: emptyImportCounters(),
      warnings: [reason],
      reason,
      supported_formats: ["html", "csv"]
    };
  }

  const parsed = parseSnapshotTable({ text: snapshotFile.text, format: snapshotFile.format });
  const normalizedRows = normalizeImportedRows(parsed.rows, { sourceId: options.sourceId });
  const validRows = normalizedRows.filter((row) => row.fields.fundName);
  const skippedRows = normalizedRows.filter((row) => !row.fields.fundName);
  const existingIds = {
    funds: new Map(queryJson(dbPath, "SELECT fund_id, normalized_fund_name FROM funds;").map((row) => [row.normalized_fund_name, row.fund_id])),
    investors: new Map(queryJson(dbPath, "SELECT investor_id, normalized_name FROM investors;").map((row) => [row.normalized_name, row.investor_id]))
  };
  const parserWarnings = compact([
    ...parsed.warnings,
    ...normalizedRows.flatMap((row) => row.warnings)
  ]);
  const parserStatus = parserWarnings.length > 0 ? "partial" : "success";

  const ids = {
    runId: stableId("run", [options.sourceId, snapshotFile.contentSha256, config.collectionMode]),
    artifactId: stableId("artifact", [options.sourceId, snapshotFile.contentSha256]),
    snapshotId: stableId("snapshot", [options.sourceId, snapshotFile.contentSha256, config.snapshotKind])
  };

  const counters = {
    funds: new Set(),
    investors: new Set(),
    operatorLinks: new Set(),
    focusRows: new Set(),
    associations: new Set(),
    qualityFlags: new Set()
  };

  const statements = [
    "PRAGMA foreign_keys = ON;",
    collectionRunSql({
      runId: ids.runId,
      sourceId: options.sourceId,
      collectionMode: config.collectionMode,
      startedAt: capturedAt,
      status: parserStatus,
      itemsSeen: parsed.rows.length,
      itemsImported: validRows.length,
      itemsSkipped: skippedRows.length,
      warningCount: parserWarnings.length,
      runConfig: importRunConfig(options, snapshotFile)
    }),
    rawArtifactSql({
      artifactId: ids.artifactId,
      sourceId: options.sourceId,
      runId: ids.runId,
      artifactType: `${config.artifactTypePrefix}_${snapshotFile.format}_snapshot`,
      sourceUrl,
      filePath: snapshotFile.path,
      contentSha256: snapshotFile.contentSha256,
      contentType: snapshotFile.contentType,
      fileName: snapshotFile.fileName,
      capturedAt,
      acquisitionMode: config.collectionMode,
      parserStatus,
      parserWarnings
    }),
    sourceSnapshotSql({
      snapshotId: ids.snapshotId,
      artifactId: ids.artifactId,
      sourceId: options.sourceId,
      sourceUrl,
      snapshotKind: config.snapshotKind,
      capturedAt,
      rawRowCount: parsed.rows.length,
      normalizedRowCount: validRows.length,
      snapshotParams: importSnapshotParams(options)
    })
  ];

  for (const row of normalizedRows) {
    const rowStatements = normalizedRowSql(row, { sourceId: options.sourceId, ids, capturedAt, counters, existingIds });
    statements.push(...rowStatements);
  }

  execSql(dbPath, statements.join("\n"));

  return {
    ok: parserStatus !== "failed",
    status: parserStatus,
    source_id: options.sourceId,
    source_name: source.source_name,
    source_url: sourceUrl,
    file: snapshotFile.path,
    format: snapshotFile.format,
    content_sha256: snapshotFile.contentSha256,
    run_id: ids.runId,
    artifact_id: ids.artifactId,
    snapshot_id: ids.snapshotId,
    raw_row_count: parsed.rows.length,
    normalized_row_count: validRows.length,
    skipped_row_count: skippedRows.length,
    warning_count: parserWarnings.length,
    imported: {
      funds: counters.funds.size,
      investors: counters.investors.size,
      operator_links: counters.operatorLinks.size,
      kvic_focus_rows: counters.focusRows.size,
      kvca_associations: counters.associations.size,
      data_quality_flags: counters.qualityFlags.size
    },
    warnings: parserWarnings
  };
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

function normalizedRowSql(row, { sourceId, ids, capturedAt, counters, existingIds }) {
  const { fields } = row;
  const statements = [];

  if (!fields.fundName) {
    statements.push(
      ...qualityFlagSqls({
        warnings: row.warnings,
        entityType: "source_snapshot",
        entityId: ids.snapshotId,
        sourceId,
        rowKey: row.rawRowKey,
        counters
      })
    );
    return statements;
  }

  const fundNameKey = normalizeKey(fields.fundName);
  const fundId = existingIds.funds.get(fundNameKey) || stableId("fund", [fields.fundName]);
  existingIds.funds.set(fundNameKey, fundId);
  counters.funds.add(fundId);
  statements.push(fundSql({ fundId, fields, capturedAt }));

  for (const investorName of fields.investorNames) {
    const investorNameKey = normalizeKey(investorName);
    const investorId = existingIds.investors.get(investorNameKey) || stableId("inv", [investorName]);
    const linkId = stableId("link", [fundId, investorId, "operator"]);
    existingIds.investors.set(investorNameKey, investorId);
    counters.investors.add(investorId);
    counters.operatorLinks.add(linkId);
    statements.push(investorSql({ investorId, investorName, capturedAt }));
    statements.push(
      fundOperatorLinkSql({
        linkId,
        fundId,
        investorId,
        snapshotId: ids.snapshotId,
        artifactId: ids.artifactId
      })
    );
  }

  if (sourceId === "kvic_fundfinder") {
    const focusSql = fundFocusSql({ fundId, fields, snapshotId: ids.snapshotId });
    if (focusSql) {
      counters.focusRows.add(stableId("focus", [ids.snapshotId, fundId, fields.categoryCode, fields.categoryName, fields.subcategoryName]));
      statements.push(focusSql);
    }
  }

  if (sourceId === "kvca_diva_associations") {
    const associationId = stableId("assoc", [fields.asctId || fundId, fields.associationName || fields.fundName]);
    counters.associations.add(associationId);
    statements.push(
      kvcaAssociationSql({
        associationId,
        fundId,
        fields,
        snapshotId: ids.snapshotId,
        artifactId: ids.artifactId
      })
    );
  }

  statements.push(
    ...qualityFlagSqls({
      warnings: row.warnings,
      entityType: "fund",
      entityId: fundId,
      sourceId,
      rowKey: row.rawRowKey,
      counters
    })
  );

  return statements;
}

function collectionRunSql({ runId, sourceId, collectionMode, startedAt, status, itemsSeen, itemsImported, itemsSkipped, warningCount, runConfig }) {
  return `
  INSERT INTO collection_runs (
    run_id, source_id, collection_mode, started_at, ended_at, status,
    items_seen, items_imported, items_updated, items_skipped, warning_count, run_config_json
  ) VALUES (
    ${sqlString(runId)}, ${sqlString(sourceId)}, ${sqlString(collectionMode)}, ${sqlString(startedAt)}, ${sqlString(startedAt)}, ${sqlString(status)},
    ${sqlNumber(itemsSeen)}, ${sqlNumber(itemsImported)}, 0, ${sqlNumber(itemsSkipped)}, ${sqlNumber(warningCount)}, ${sqlJson(runConfig)}
  )
  ON CONFLICT(run_id) DO UPDATE SET
    ended_at = excluded.ended_at,
    status = excluded.status,
    items_seen = excluded.items_seen,
    items_imported = excluded.items_imported,
    items_skipped = excluded.items_skipped,
    warning_count = excluded.warning_count,
    run_config_json = excluded.run_config_json;
  `;
}

function rawArtifactSql({ artifactId, sourceId, runId, artifactType, sourceUrl, filePath, contentSha256, contentType, fileName, capturedAt, acquisitionMode, parserStatus, parserWarnings }) {
  return `
  INSERT INTO raw_artifacts (
    artifact_id, source_id, run_id, artifact_type, source_url, local_path, storage_uri,
    content_sha256, content_type, file_name, captured_at, acquisition_mode,
    parser_version, parser_status, parser_warnings
  ) VALUES (
    ${sqlString(artifactId)}, ${sqlString(sourceId)}, ${sqlString(runId)}, ${sqlString(artifactType)}, ${sqlString(sourceUrl)}, ${sqlString(filePath)}, ${sqlString(`local:${filePath}`)},
    ${sqlString(contentSha256)}, ${sqlString(contentType)}, ${sqlString(fileName)}, ${sqlString(capturedAt)}, ${sqlString(acquisitionMode)},
    ${sqlString(PARSER_VERSION)}, ${sqlString(parserStatus)}, ${sqlString(parserWarnings.join("; ") || null)}
  )
  ON CONFLICT(source_id, content_sha256) DO UPDATE SET
    run_id = excluded.run_id,
    source_url = excluded.source_url,
    local_path = excluded.local_path,
    storage_uri = excluded.storage_uri,
    content_type = excluded.content_type,
    file_name = excluded.file_name,
    captured_at = excluded.captured_at,
    parser_version = excluded.parser_version,
    parser_status = excluded.parser_status,
    parser_warnings = excluded.parser_warnings;
  `;
}

function sourceSnapshotSql({ snapshotId, artifactId, sourceId, sourceUrl, snapshotKind, capturedAt, rawRowCount, normalizedRowCount, snapshotParams }) {
  return `
  INSERT INTO source_snapshots (
    snapshot_id, artifact_id, source_id, source_url, snapshot_kind, captured_at,
    raw_row_count, normalized_row_count, snapshot_params_json
  ) VALUES (
    ${sqlString(snapshotId)}, ${sqlString(artifactId)}, ${sqlString(sourceId)}, ${sqlString(sourceUrl)}, ${sqlString(snapshotKind)}, ${sqlString(capturedAt)},
    ${sqlNumber(rawRowCount)}, ${sqlNumber(normalizedRowCount)}, ${sqlJson(snapshotParams)}
  )
  ON CONFLICT(snapshot_id) DO UPDATE SET
    source_url = excluded.source_url,
    captured_at = excluded.captured_at,
    raw_row_count = excluded.raw_row_count,
    normalized_row_count = excluded.normalized_row_count,
    snapshot_params_json = excluded.snapshot_params_json;
  `;
}

function fundSql({ fundId, fields, capturedAt }) {
  return `
  INSERT INTO funds (
    fund_id, fund_name, normalized_fund_name, fund_type, formed_date, registered_date,
    expiry_date, committed_amount_krw, invested_amount_krw, mfund_invested,
    duration_text, investment_purpose, trust_level, latest_evidence_at
  ) VALUES (
    ${sqlString(fundId)}, ${sqlString(fields.fundName)}, ${sqlString(normalizeKey(fields.fundName))}, ${sqlString("venture_fund")},
    ${sqlString(fields.formedDate)}, ${sqlString(fields.registeredDate)}, ${sqlString(fields.expiryDate)},
    ${sqlNumber(fields.committedAmountKrw)}, ${sqlNumber(fields.investedAmountKrw)}, ${sqlNumber(fields.mfundInvested)},
    ${sqlString(fields.durationText)}, ${sqlString(fields.investmentPurpose || fields.investmentField)}, ${sqlString("official_snapshot")}, ${sqlString(capturedAt)}
  )
  ON CONFLICT(fund_id) DO UPDATE SET
    fund_name = excluded.fund_name,
    normalized_fund_name = excluded.normalized_fund_name,
    fund_type = excluded.fund_type,
    formed_date = COALESCE(excluded.formed_date, funds.formed_date),
    registered_date = COALESCE(excluded.registered_date, funds.registered_date),
    expiry_date = COALESCE(excluded.expiry_date, funds.expiry_date),
    committed_amount_krw = COALESCE(excluded.committed_amount_krw, funds.committed_amount_krw),
    invested_amount_krw = COALESCE(excluded.invested_amount_krw, funds.invested_amount_krw),
    mfund_invested = COALESCE(excluded.mfund_invested, funds.mfund_invested),
    duration_text = COALESCE(excluded.duration_text, funds.duration_text),
    investment_purpose = COALESCE(excluded.investment_purpose, funds.investment_purpose),
    trust_level = excluded.trust_level,
    latest_evidence_at = excluded.latest_evidence_at,
    updated_at = CURRENT_TIMESTAMP;
  `;
}

function investorSql({ investorId, investorName, capturedAt }) {
  return `
  INSERT INTO investors (
    investor_id, investor_name, normalized_name, investor_type, latest_evidence_at, trust_level
  ) VALUES (
    ${sqlString(investorId)}, ${sqlString(investorName)}, ${sqlString(normalizeKey(investorName))}, ${sqlString("VC/AC")},
    ${sqlString(capturedAt)}, ${sqlString("official_snapshot")}
  )
  ON CONFLICT(normalized_name) DO UPDATE SET
    investor_name = excluded.investor_name,
    investor_type = COALESCE(investors.investor_type, excluded.investor_type),
    latest_evidence_at = excluded.latest_evidence_at,
    trust_level = excluded.trust_level,
    updated_at = CURRENT_TIMESTAMP;
  `;
}

function fundOperatorLinkSql({ linkId, fundId, investorId, snapshotId, artifactId }) {
  return `
  INSERT INTO fund_operator_links (
    link_id, fund_id, investor_id, role, source_snapshot_id, source_artifact_id, confidence
  ) VALUES (
    ${sqlString(linkId)}, ${sqlString(fundId)}, ${sqlString(investorId)}, ${sqlString("operator")},
    ${sqlString(snapshotId)}, ${sqlString(artifactId)}, ${sqlString("high")}
  )
  ON CONFLICT(fund_id, investor_id, role) DO UPDATE SET
    source_snapshot_id = excluded.source_snapshot_id,
    source_artifact_id = excluded.source_artifact_id,
    confidence = excluded.confidence;
  `;
}

function fundFocusSql({ fundId, fields, snapshotId }) {
  const hasFocus = [
    fields.categoryCode,
    fields.subcategoryCode,
    fields.categoryName,
    fields.subcategoryName,
    fields.sectorKeyword,
    fields.startupStage,
    fields.region,
    fields.investmentField
  ].some(Boolean);
  if (!hasFocus) return null;

  const focusId = stableId("focus", [snapshotId, fundId, fields.categoryCode, fields.categoryName, fields.subcategoryName, fields.sectorKeyword, fields.startupStage]);
  return `
  INSERT INTO fund_investment_focus (
    focus_id, fund_id, category_code, subcategory_code, category_name, subcategory_name,
    sector_keyword, startup_stage, region, source_snapshot_id, confidence
  ) VALUES (
    ${sqlString(focusId)}, ${sqlString(fundId)}, ${sqlString(fields.categoryCode)}, ${sqlString(fields.subcategoryCode)},
    ${sqlString(fields.categoryName || fields.investmentField)}, ${sqlString(fields.subcategoryName)},
    ${sqlString(fields.sectorKeyword || fields.investmentField)}, ${sqlString(fields.startupStage)}, ${sqlString(fields.region)},
    ${sqlString(snapshotId)}, ${sqlString("medium")}
  )
  ON CONFLICT(focus_id) DO UPDATE SET
    category_code = excluded.category_code,
    subcategory_code = excluded.subcategory_code,
    category_name = excluded.category_name,
    subcategory_name = excluded.subcategory_name,
    sector_keyword = excluded.sector_keyword,
    startup_stage = excluded.startup_stage,
    region = excluded.region,
    confidence = excluded.confidence;
  `;
}

function kvcaAssociationSql({ associationId, fundId, fields, snapshotId, artifactId }) {
  return `
  INSERT INTO kvca_associations (
    association_id, asct_id, fund_id, association_name, operator_names_text, registered_date,
    expiry_date, committed_amount_krw, investment_field, purpose_type, support_type,
    account_type, representative_fund_manager, mfund_invested, source_snapshot_id, source_artifact_id
  ) VALUES (
    ${sqlString(associationId)}, ${sqlString(fields.asctId)}, ${sqlString(fundId)}, ${sqlString(fields.associationName || fields.fundName)},
    ${sqlString(fields.investorNames.join(", ") || null)}, ${sqlString(fields.registeredDate || fields.formedDate)},
    ${sqlString(fields.expiryDate)}, ${sqlNumber(fields.committedAmountKrw)}, ${sqlString(fields.investmentField)},
    ${sqlString(fields.purposeType)}, ${sqlString(fields.supportType)}, ${sqlString(fields.accountType)},
    ${sqlString(fields.representativeFundManager)}, ${sqlNumber(fields.mfundInvested)}, ${sqlString(snapshotId)}, ${sqlString(artifactId)}
  )
  ON CONFLICT(association_id) DO UPDATE SET
    asct_id = COALESCE(excluded.asct_id, kvca_associations.asct_id),
    fund_id = excluded.fund_id,
    association_name = excluded.association_name,
    operator_names_text = excluded.operator_names_text,
    registered_date = COALESCE(excluded.registered_date, kvca_associations.registered_date),
    expiry_date = COALESCE(excluded.expiry_date, kvca_associations.expiry_date),
    committed_amount_krw = COALESCE(excluded.committed_amount_krw, kvca_associations.committed_amount_krw),
    investment_field = COALESCE(excluded.investment_field, kvca_associations.investment_field),
    purpose_type = COALESCE(excluded.purpose_type, kvca_associations.purpose_type),
    support_type = COALESCE(excluded.support_type, kvca_associations.support_type),
    account_type = COALESCE(excluded.account_type, kvca_associations.account_type),
    representative_fund_manager = COALESCE(excluded.representative_fund_manager, kvca_associations.representative_fund_manager),
    mfund_invested = COALESCE(excluded.mfund_invested, kvca_associations.mfund_invested),
    source_snapshot_id = excluded.source_snapshot_id,
    source_artifact_id = excluded.source_artifact_id;
  `;
}

function qualityFlagSqls({ warnings, entityType, entityId, sourceId, rowKey, counters }) {
  return compact(warnings).map((warning) => {
    const severity = warning.includes("missing fund/association") ? "critical" : "warning";
    const flagId = stableId("dq", [rowKey, entityType, entityId, warning]);
    counters.qualityFlags.add(flagId);
    return `
    INSERT INTO data_quality_flags (
      flag_id, entity_type, entity_id, severity, flag_type, message, source_id
    ) VALUES (
      ${sqlString(flagId)}, ${sqlString(entityType)}, ${sqlString(entityId)}, ${sqlString(severity)}, ${sqlString("snapshot_import_warning")},
      ${sqlString(warning)}, ${sqlString(sourceId)}
    )
    ON CONFLICT(flag_id) DO UPDATE SET
      severity = excluded.severity,
      message = excluded.message,
      source_id = excluded.source_id,
      resolved_at = NULL,
      resolution_note = NULL;
    `;
  });
}

function importRunConfig(options, snapshotFile) {
  return {
    source_id: options.sourceId,
    file: snapshotFile.path,
    format: snapshotFile.format,
    parser_version: PARSER_VERSION,
    snapshot_params: importSnapshotParams(options)
  };
}

function importSnapshotParams(options) {
  return compactObject({
    group: options.group,
    code: options.code,
    category: options.category,
    vc_name: options.vcName,
    source_url: options.sourceUrl,
    captured_at: options.capturedAt
  });
}

function sqlNumber(value) {
  if (value === null || value === undefined || value === "") return "NULL";
  const number = Number(value);
  return Number.isFinite(number) ? String(Math.trunc(number)) : "NULL";
}

function first(rows) {
  return rows[0] ?? {};
}

function compact(values) {
  return values.filter((value) => value !== null && value !== undefined && String(value).trim() !== "");
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== null && entry !== undefined && entry !== ""));
}

import { randomUUID } from "node:crypto";
import { importKvcaSnapshot, importKvicSnapshot } from "./importers.mjs";
import { assertSqliteAvailable, execSql, expandPath, initDatabase, queryJson, sqlJson, sqlString } from "./sqlite.mjs";
import { extractConditions, inferIntent, normalizeKey, normalizeText, scoreNameMatch, tokenize, uniqueBy } from "./normalize.mjs";

export const REQUIRED_SOURCES_BY_INTENT = {
  investor_fund_holding: ["kvca_diva_associations", "kvic_fundfinder"],
  startup_fund_search: ["kvic_fundfinder", "kvca_diva_associations", "official_disclosure_documents"],
  tips_signal: ["tips_public_site"],
  new_fund_event: ["official_disclosure_documents", "kvca_diva_associations", "kvic_fundfinder"],
  founder_education: ["founder_guide_library"]
};

export const CANONICAL_QUERY_INTENTS = Object.freeze(Object.keys(REQUIRED_SOURCES_BY_INTENT));
const CANONICAL_RESOLUTION_STATUSES = Object.freeze(["resolved_exact", "resolved_alias", "ambiguous", "no_match"]);

const TRUST_SCORE = {
  official_snapshot: 35,
  official: 35,
  high: 25,
  medium: 15,
  guide: 12,
  derived: 10
};

const REQUIRED_SCHEMA_OBJECTS = {
  table: [
    "schema_migrations",
    "sources",
    "collection_runs",
    "raw_artifacts",
    "source_snapshots",
    "investors",
    "investor_aliases",
    "funds",
    "fund_operator_links",
    "fund_investment_focus",
    "kvic_fundfinder_categories",
    "kvca_associations",
    "tips_operator_snapshots",
    "founder_guide_sources",
    "documents",
    "document_chunks",
    "fundraising_concepts",
    "guidance_cards",
    "search_queries",
    "entity_resolution_candidates",
    "evidence_claims",
    "search_results",
    "events",
    "evidence_edges",
    "watchlist_targets",
    "data_quality_flags",
    "review_queue",
    "user_notes",
    "query_cache"
  ],
  view: [
    "v_source_authority",
    "v_entity_resolution_summary",
    "v_searchable_entities",
    "v_source_health",
    "v_investor_profile_summary",
    "v_recent_fund_events"
  ]
};

const REQUIRED_SCHEMA_COLUMNS = {
  schema_migrations: [
    "version",
    "applied_at",
    "notes"
  ],
  sources: [
    "source_id",
    "source_name",
    "owner",
    "source_type",
    "base_url",
    "base_path",
    "policy_status",
    "trust_tier",
    "authoritative_scope",
    "freshness_days",
    "default_collection_modes",
    "disabled_collection_modes",
    "privacy_level",
    "last_policy_checked_at",
    "notes"
  ],
  search_queries: [
    "search_query_id",
    "user_query",
    "normalized_query",
    "interpreted_intent",
    "resolution_status",
    "resolved_entities_json",
    "company_context_json",
    "data_gaps_json",
    "recommended_imports_json",
    "created_at"
  ],
  entity_resolution_candidates: [
    "resolution_candidate_id",
    "search_query_id",
    "raw_text",
    "entity_type",
    "candidate_entity_id",
    "candidate_label",
    "normalized_candidate_label",
    "match_type",
    "match_score",
    "source_id",
    "source_artifact_id",
    "resolution_status",
    "why_candidate",
    "created_at"
  ],
  evidence_claims: [
    "evidence_claim_id",
    "claim_type",
    "subject_type",
    "subject_id",
    "predicate",
    "object_value",
    "source_id",
    "source_snapshot_id",
    "source_artifact_id",
    "document_id",
    "source_trust_tier",
    "authority_scope",
    "confidence",
    "parser_status",
    "parser_warnings",
    "created_at"
  ],
  search_results: [
    "search_result_id",
    "search_query_id",
    "result_rank",
    "entity_type",
    "entity_id",
    "title",
    "snippet",
    "source_id",
    "source_snapshot_id",
    "source_artifact_id",
    "document_id",
    "score",
    "evidence_status",
    "resolution_status",
    "source_trust_tier",
    "authority_scope",
    "why_ranked",
    "match_reasons_json",
    "missing_evidence_json",
    "caveats",
    "created_at"
  ],
  raw_artifacts: [
    "artifact_id",
    "source_id",
    "run_id",
    "artifact_type",
    "source_url",
    "local_path",
    "storage_uri",
    "content_sha256",
    "content_type",
    "file_name",
    "captured_at",
    "acquisition_mode",
    "parser_version",
    "parser_status",
    "parser_warnings"
  ],
  source_snapshots: [
    "snapshot_id",
    "artifact_id",
    "source_id",
    "source_url",
    "snapshot_kind",
    "captured_at",
    "raw_row_count",
    "normalized_row_count",
    "snapshot_params_json",
    "notes"
  ],
  collection_runs: [
    "run_id",
    "source_id",
    "collection_mode",
    "started_at",
    "ended_at",
    "status",
    "items_seen",
    "items_imported",
    "items_updated",
    "items_skipped",
    "warning_count",
    "error_message",
    "run_config_json"
  ],
  investors: [
    "investor_id",
    "investor_name",
    "normalized_name",
    "investor_type",
    "homepage",
    "headquarters",
    "tips_operator_status",
    "latest_evidence_at",
    "trust_level",
    "created_at",
    "updated_at"
  ],
  investor_aliases: [
    "alias_id",
    "investor_id",
    "alias",
    "normalized_alias",
    "source_id",
    "source_artifact_id",
    "confidence"
  ],
  funds: [
    "fund_id",
    "fund_name",
    "normalized_fund_name",
    "fund_type",
    "formed_date",
    "registered_date",
    "expiry_date",
    "committed_amount_krw",
    "invested_amount_krw",
    "mfund_invested",
    "duration_text",
    "investment_purpose",
    "trust_level",
    "latest_evidence_at",
    "created_at",
    "updated_at"
  ],
  fund_operator_links: [
    "link_id",
    "fund_id",
    "investor_id",
    "role",
    "source_snapshot_id",
    "source_artifact_id",
    "confidence",
    "created_at"
  ],
  fund_investment_focus: [
    "focus_id",
    "fund_id",
    "category_code",
    "subcategory_code",
    "category_name",
    "subcategory_name",
    "sector_keyword",
    "startup_stage",
    "region",
    "source_snapshot_id",
    "confidence"
  ],
  kvic_fundfinder_categories: [
    "category_id",
    "category_code",
    "category_name",
    "parent_code",
    "parent_name",
    "source_url",
    "snapshot_at"
  ],
  kvca_associations: [
    "association_id",
    "asct_id",
    "fund_id",
    "association_name",
    "operator_names_text",
    "registered_date",
    "expiry_date",
    "committed_amount_krw",
    "investment_field",
    "purpose_type",
    "support_type",
    "account_type",
    "representative_fund_manager",
    "mfund_invested",
    "source_snapshot_id",
    "source_artifact_id"
  ],
  tips_operator_snapshots: [
    "tips_snapshot_id",
    "investor_id",
    "operator_name",
    "status",
    "source_url",
    "captured_at",
    "evidence_text",
    "source_artifact_id",
    "confidence"
  ],
  founder_guide_sources: [
    "guide_source_id",
    "publisher",
    "source_url",
    "suggested_role",
    "access_status",
    "last_checked_at",
    "local_file_hint",
    "notes",
    "created_at",
    "updated_at"
  ],
  documents: [
    "document_id",
    "source_id",
    "guide_source_id",
    "artifact_id",
    "title",
    "document_role",
    "publisher",
    "source_url",
    "published_date",
    "file_name",
    "file_type",
    "file_sha256",
    "storage_uri",
    "license_note",
    "trust_level",
    "parser_status",
    "parser_warnings",
    "imported_at"
  ],
  document_chunks: [
    "chunk_id",
    "document_id",
    "chunk_index",
    "heading",
    "body_text",
    "body_text_sha256",
    "token_count",
    "startup_stage",
    "topic_tags",
    "embedding_ref",
    "created_at"
  ],
  fundraising_concepts: [
    "concept_id",
    "concept_name",
    "aliases",
    "plain_language_summary",
    "why_it_matters",
    "common_mistakes",
    "source_chunk_ids",
    "trust_level",
    "updated_at"
  ],
  guidance_cards: [
    "guidance_card_id",
    "card_type",
    "title",
    "startup_stage",
    "body_markdown",
    "source_chunk_ids",
    "review_status",
    "updated_at"
  ],
  events: [
    "event_id",
    "event_type",
    "event_date",
    "investor_id",
    "fund_id",
    "document_id",
    "source_snapshot_id",
    "title",
    "evidence_text",
    "amount_krw",
    "confidence",
    "review_status",
    "created_at"
  ],
  evidence_edges: [
    "edge_id",
    "from_type",
    "from_id",
    "to_type",
    "to_id",
    "relation_type",
    "source_snapshot_id",
    "source_artifact_id",
    "document_id",
    "confidence",
    "created_at"
  ],
  watchlist_targets: [
    "target_id",
    "target_type",
    "target_value",
    "normalized_value",
    "tags",
    "created_at",
    "notes"
  ],
  data_quality_flags: [
    "flag_id",
    "entity_type",
    "entity_id",
    "severity",
    "flag_type",
    "message",
    "source_id",
    "created_at",
    "resolved_at",
    "resolution_note"
  ],
  review_queue: [
    "review_id",
    "item_type",
    "item_id",
    "reason",
    "priority",
    "status",
    "created_at",
    "reviewed_at",
    "review_note"
  ],
  user_notes: [
    "note_id",
    "note_type",
    "title",
    "body_markdown",
    "related_investor_id",
    "related_fund_id",
    "privacy_level",
    "created_at",
    "updated_at"
  ],
  query_cache: [
    "query_cache_id",
    "query_kind",
    "query_input_sha256",
    "response_json",
    "created_at",
    "expires_at"
  ]
};

export class VcFundsCore {
  constructor({ dbPath }) {
    this.dbPath = expandPath(dbPath);
  }

  setup() {
    return initDatabase(this.dbPath);
  }

  doctor() {
    const sqliteVersion = assertSqliteAvailable();
    const schemaHealth = this.schemaHealth();
    const sourceCount = this.safeCount("sources");
    const investorCount = this.safeCount("investors");
    const fundCount = this.safeCount("funds");
    return {
      ok: schemaHealth.ok,
      dbPath: this.dbPath,
      sqliteVersion,
      missing_schema_objects: schemaHealth.missing,
      schema_error: schemaHealth.error,
      sourceCount,
      investorCount,
      fundCount,
      caveats: [
        "This is a draft local runtime. It does not crawl KVIC/KVCA sites.",
        "Search quality depends on user-imported official snapshots and documents."
      ]
    };
  }

  schemaHealth() {
    try {
      const rows = queryJson(
        this.dbPath,
        `
        SELECT type, name
        FROM sqlite_master
        WHERE type IN ('table', 'view');
        `
      );
      const present = new Set(rows.map((row) => `${row.type}:${row.name}`));
      const missing = Object.entries(REQUIRED_SCHEMA_OBJECTS).flatMap(([type, names]) => {
        return names.filter((name) => !present.has(`${type}:${name}`)).map((name) => ({ type, name }));
      });
      const missingColumns = this.missingSchemaColumns(present);
      const invalidViews = this.invalidSchemaViews(present);
      const allMissing = [...missing, ...missingColumns, ...invalidViews];
      return { ok: allMissing.length === 0, missing: allMissing, error: null };
    } catch (error) {
      return { ok: false, missing: [], error: error.message };
    }
  }

  missingSchemaColumns(present) {
    const missing = [];
    for (const [tableName, requiredColumns] of Object.entries(REQUIRED_SCHEMA_COLUMNS)) {
      if (!present.has(`table:${tableName}`)) continue;
      try {
        const rows = queryJson(this.dbPath, `SELECT name FROM pragma_table_info(${sqlString(tableName)});`);
        const columns = new Set(rows.map((row) => row.name));
        for (const columnName of requiredColumns) {
          if (!columns.has(columnName)) {
            missing.push({
              type: "column",
              name: `${tableName}.${columnName}`,
              table: tableName,
              column: columnName
            });
          }
        }
      } catch (error) {
        missing.push({
          type: "table_columns",
          name: tableName,
          table: tableName,
          error: error.message
        });
      }
    }
    return missing;
  }

  invalidSchemaViews(present) {
    const invalid = [];
    for (const viewName of REQUIRED_SCHEMA_OBJECTS.view) {
      if (!present.has(`view:${viewName}`)) continue;
      try {
        execSql(this.dbPath, `SELECT * FROM ${sqlIdentifier(viewName)} LIMIT 0;`);
      } catch (error) {
        invalid.push({
          type: "view_query",
          name: viewName,
          error: error.message
        });
      }
    }
    return invalid;
  }

  safeCount(tableName) {
    try {
      const rows = queryJson(this.dbPath, `SELECT COUNT(*) AS count FROM ${tableName};`);
      return rows[0]?.count ?? 0;
    } catch {
      return 0;
    }
  }

  getSourceAuthority({ intentOrClaimType } = {}) {
    const rows = queryJson(
      this.dbPath,
      `
      SELECT
        source_id,
        source_name,
        source_type,
        policy_status,
        trust_tier,
        authoritative_scope,
        freshness_days,
        last_policy_checked_at,
        privacy_level
      FROM v_source_authority
      ORDER BY
        CASE trust_tier
          WHEN 'T0_permissioned_official_feed' THEN 1
          WHEN 'T1_user_captured_official_snapshot' THEN 2
          WHEN 'T2_official_disclosure_document' THEN 3
          WHEN 'T3_official_public_guide' THEN 4
          WHEN 'T4_user_private_note' THEN 5
          WHEN 'T5_commercial_manual_fact' THEN 6
          ELSE 9
        END,
        source_name ASC;
      `
    );

    return {
      source_authority: rows
        .map((row) => ({
          ...row,
          authority_role: authorityRole(row, intentOrClaimType)
        }))
        .sort((a, b) => roleRank(a.authority_role) - roleRank(b.authority_role)),
      caveats: [
        "permission_required sources require user-captured snapshots or explicit collection permission.",
        "blocked_by_default sources should only be used from manual exports or paid/official agreements."
      ]
    };
  }

  getCollectionHealth({ includeDisabled = true } = {}) {
    const rows = queryJson(
      this.dbPath,
      `
      SELECT
        source_id,
        source_name,
        policy_status,
        trust_tier,
        authoritative_scope,
        COALESCE(last_run_at, 'never') AS last_run_at,
        COALESCE(successful_runs, 0) AS successful_runs,
        COALESCE(non_success_runs, 0) AS non_success_runs,
        COALESCE(warning_count, 0) AS warning_count,
        COALESCE(open_quality_flags, 0) AS open_quality_flags
      FROM v_source_health
      ${includeDisabled ? "" : "WHERE policy_status != 'blocked_by_default'"}
      ORDER BY
        CASE policy_status
          WHEN 'allowed_local_import' THEN 1
          WHEN 'requires_check' THEN 2
          WHEN 'permission_required' THEN 3
          ELSE 4
        END,
        source_name ASC;
      `
    );

    return {
      sources: rows,
      warnings: [
        ...rows
          .filter((row) => row.last_run_at === "never")
          .map((row) => `${row.source_id} has no imported snapshot yet.`),
        ...rows
          .filter((row) => Number(row.warning_count) > 0 || Number(row.open_quality_flags) > 0)
          .map((row) => `${row.source_id} has ${row.warning_count} import warnings and ${row.open_quality_flags} open quality flags.`)
      ]
    };
  }

  importKvicSnapshot(options = {}) {
    return importKvicSnapshot(this.dbPath, options);
  }

  importKvcaSnapshot(options = {}) {
    return importKvcaSnapshot(this.dbPath, options);
  }

  resolveUserInput({ query, companyContext = null, includeAmbiguousCandidates = true, intentOverride = null } = {}) {
    if (!query || !String(query).trim()) {
      throw new Error("query is required");
    }

    const conditions = extractConditions(query);
    const interpretedIntent = intentOverride || inferIntent(query, conditions);
    const searchQueryId = `sq_${randomUUID()}`;
    const candidates = this.findResolutionCandidates(query, includeAmbiguousCandidates);
    const highConfidence = candidates.filter((candidate) => candidate.match_score >= 80);
    const resolvedEntities = highConfidence.length === 1 && highConfidence[0].match_score >= 90 ? [highConfidence[0]] : [];
    const resolutionStatus = resolveStatus(candidates, conditions);
    const requiredSources = REQUIRED_SOURCES_BY_INTENT[interpretedIntent] ?? ["kvic_fundfinder", "kvca_diva_associations"];

    execSql(
      this.dbPath,
      `
      INSERT INTO search_queries (
        search_query_id,
        user_query,
        normalized_query,
        interpreted_intent,
        resolution_status,
        resolved_entities_json,
        company_context_json
      ) VALUES (
        ${sqlString(searchQueryId)},
        ${sqlString(query)},
        ${sqlString(normalizeText(query))},
        ${sqlString(interpretedIntent)},
        ${sqlString(resolutionStatus)},
        ${sqlJson(resolvedEntities)},
        ${sqlJson(companyContext)}
      );
      ${candidates
        .map(
          (candidate) => `
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
            source_id,
            resolution_status,
            why_candidate
          ) VALUES (
            ${sqlString(`erc_${randomUUID()}`)},
            ${sqlString(searchQueryId)},
            ${sqlString(query)},
            ${sqlString(candidate.entity_type)},
            ${sqlString(candidate.candidate_entity_id)},
            ${sqlString(candidate.candidate_label)},
            ${sqlString(normalizeKey(candidate.candidate_label))},
            ${sqlString(candidate.match_type)},
            ${candidate.match_score},
            ${sqlString(candidate.source_id ?? null)},
            ${sqlString(candidate.resolution_status)},
            ${sqlString(candidate.why_candidate)}
          );`
        )
        .join("\n")}
      `
    );

    return {
      search_query_id: searchQueryId,
      interpreted_intent: interpretedIntent,
      resolution_status: resolutionStatus,
      resolved_entities: resolvedEntities,
      resolution_candidates: candidates,
      structured_query_plan: {
        conditions,
        recall_order: [
          "exact investor/fund aliases",
          "fund operator links",
          "fund focus rows",
          "event/document lexical recall",
          "founder guide chunks"
        ]
      },
      required_sources: requiredSources,
      caveats: resolutionCaveats(resolutionStatus, requiredSources)
    };
  }

  findResolutionCandidates(query, includeAmbiguousCandidates = true) {
    const investorRows = queryJson(
      this.dbPath,
      `
      SELECT investor_id, investor_name AS label, normalized_name, trust_level, NULL AS alias
      FROM investors
      UNION ALL
      SELECT i.investor_id, i.investor_name AS label, i.normalized_name, i.trust_level, ia.alias AS alias
      FROM investor_aliases ia
      JOIN investors i ON i.investor_id = ia.investor_id;
      `
    );

    const fundRows = queryJson(
      this.dbPath,
      `
      SELECT fund_id, fund_name AS label, normalized_fund_name, trust_level
      FROM funds;
      `
    );

    const investorCandidates = investorRows.flatMap((row) => {
      const label = row.alias || row.label;
      const match = scoreNameMatch(query, label);
      if (!match) return [];
      return [
        {
          entity_type: "investor",
          candidate_entity_id: row.investor_id,
          candidate_label: row.label,
          match_type: row.alias ? `alias_${match.matchType}` : match.matchType,
          match_score: row.alias ? Math.min(100, match.score + 2) : match.score,
          source_id: null,
          resolution_status: candidateResolutionStatus(match, row.alias),
          why_candidate: row.alias ? `Matched investor alias "${row.alias}".` : `Matched investor name "${row.label}".`
        }
      ];
    });

    const fundCandidates = fundRows.flatMap((row) => {
      const match = scoreNameMatch(query, row.label);
      if (!match) return [];
      return [
        {
          entity_type: "fund",
          candidate_entity_id: row.fund_id,
          candidate_label: row.label,
          match_type: match.matchType,
          match_score: match.score,
          source_id: null,
          resolution_status: candidateResolutionStatus(match, null),
          why_candidate: `Matched fund name "${row.label}".`
        }
      ];
    });

    const merged = uniqueBy([...investorCandidates, ...fundCandidates], (candidate) => {
      return `${candidate.entity_type}:${candidate.candidate_entity_id}:${candidate.match_type}`;
    }).sort((a, b) => b.match_score - a.match_score || a.candidate_label.localeCompare(b.candidate_label));

    return includeAmbiguousCandidates ? merged.slice(0, 10) : merged.filter((candidate) => candidate.match_score >= 90).slice(0, 5);
  }

  searchVcDatabase({ query, companyContext = null, intentHint = null, limit = 10 } = {}) {
    const normalizedIntentHint = normalizeIntentHint(intentHint);
    const resolution = this.resolveUserInput({ query, companyContext, includeAmbiguousCandidates: true, intentOverride: normalizedIntentHint });
    const interpretedIntent = resolution.interpreted_intent;
    const requiredSources = REQUIRED_SOURCES_BY_INTENT[interpretedIntent] ?? ["kvic_fundfinder", "kvca_diva_associations"];
    const rows = this.recallRows();
    const terms = tokenize(query);
    const candidateKeys = new Set(
      resolution.resolution_candidates.map((candidate) => `${candidate.entity_type}:${candidate.candidate_entity_id}`)
    );
    const conditions = resolution.structured_query_plan.conditions;

    const scored = rows
      .map((row) => {
        const searchable = normalizeText(`${row.title} ${row.searchable_text ?? ""}`);
        const entityKey = `${row.entity_type}:${row.entity_id}`;
        const termHits = terms.filter((term) => searchable.includes(normalizeText(term)));
        const conditionHits = conditionMatches(row, conditions);
        const entityBonus = candidateKeys.has(entityKey) ? 35 : 0;
        const termScore = termHits.length * 12;
        const conditionScore = conditionHits.length * 10;
        const trustScore = TRUST_SCORE[row.trust_level] ?? 8;
        const score = entityBonus + termScore + conditionScore + trustScore;
        return {
          ...row,
          score,
          termHits,
          conditionHits
        };
      })
      .filter((row) => row.score > 12 || candidateKeys.has(`${row.entity_type}:${row.entity_id}`))
      .sort((a, b) => b.score - a.score || String(b.evidence_at ?? "").localeCompare(String(a.evidence_at ?? "")))
      .slice(0, Number(limit) || 10);

    const auditedResults = scored.map((row, index) => {
      const evidence = this.evidenceFor(row);
      const authority = authorityRole(evidence, interpretedIntent);
      const evidenceStatus = evidenceStatusFor(row, evidence, {
        interpretedIntent,
        resolutionStatus: resolution.resolution_status,
        authorityRole: authority
      });
      const caveats = resultCaveats(row, evidence, evidenceStatus, {
        resolutionStatus: resolution.resolution_status,
        authorityRole: authority
      });
      const result = {
        rank: index + 1,
        title: row.title,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        evidence_status: evidenceStatus,
        resolution_status: resolution.resolution_status,
        score: row.score,
        why_ranked: whyRanked(row, evidence),
        source_id: evidence.source_id ?? row.source_id ?? null,
        source_name: evidence.source_name ?? null,
        source_trust_tier: evidence.trust_tier ?? null,
        authority_scope: evidence.authoritative_scope ?? null,
        authority_role: authority,
        authority_scope_error: evidence.authority_scope_error ?? null,
        source_url: evidence.source_url ?? null,
        content_sha256_or_file_sha256: evidence.content_sha256 ?? evidence.file_sha256 ?? null,
        captured_or_imported_at: evidence.captured_or_imported_at ?? row.evidence_at ?? null,
        parser_warnings: evidence.parser_warnings ?? null,
        quality_flags: evidence.quality_flags ?? [],
        caveats,
        next_action: nextActionFor(evidenceStatus, row)
      };
      return { result, row, evidence };
    });
    const results = auditedResults.map((item) => item.result);
    const collectionSources = this.getCollectionHealth({ includeDisabled: true }).sources;
    const dataGaps = dataGapsFor(results, requiredSources, collectionSources);
    const recommendedImports = recommendedImportsFor(results, requiredSources);
    this.persistSearchGapAudit(resolution.search_query_id, { dataGaps, recommendedImports });
    this.persistSearchAudit(resolution.search_query_id, auditedResults, { dataGaps, recommendedImports });

    return {
      interpreted_intent: interpretedIntent,
      resolution_status: resolution.resolution_status,
      resolved_entities: resolution.resolved_entities,
      results,
      data_gaps: dataGaps,
      recommended_imports: recommendedImports,
      caveats: [
        "Results are limited to the local SQLite database.",
        "A VC/AC being linked to a fund is evidence for fund holding, not a guarantee of fit or current dry powder."
      ]
    };
  }

  persistSearchGapAudit(searchQueryId, { dataGaps = [], recommendedImports = [] } = {}) {
    execSql(
      this.dbPath,
      `
      UPDATE search_queries
      SET
        data_gaps_json = ${sqlJson(dataGaps)},
        recommended_imports_json = ${sqlJson(recommendedImports)}
      WHERE search_query_id = ${sqlString(searchQueryId)};
      `
    );
  }

  persistSearchAudit(searchQueryId, auditedResults, { dataGaps = [], recommendedImports = [] } = {}) {
    if (!auditedResults.length) return;
    execSql(
      this.dbPath,
      auditedResults
        .map(({ result, row, evidence }) => {
          const searchResultId = `sr_${randomUUID()}`;
          const sourceId = result.source_id ?? null;
          const claimSql =
            sourceId && result.source_trust_tier
              ? `
              INSERT INTO evidence_claims (
                evidence_claim_id,
                claim_type,
                subject_type,
                subject_id,
                predicate,
                object_value,
                source_id,
                source_snapshot_id,
                source_artifact_id,
                document_id,
                source_trust_tier,
                authority_scope,
                confidence,
                parser_status,
                parser_warnings
              ) VALUES (
                ${sqlString(`ec_${randomUUID()}`)},
                'search_result',
                ${sqlString(result.entity_type)},
                ${sqlString(result.entity_id)},
                'evidence_status',
                ${sqlString(result.evidence_status)},
                ${sqlString(sourceId)},
                ${sqlString(row.source_snapshot_id ?? null)},
                ${sqlString(row.source_artifact_id ?? null)},
                ${sqlString(row.document_id ?? null)},
                ${sqlString(result.source_trust_tier)},
                ${sqlString(result.authority_scope ?? null)},
                ${sqlString(result.evidence_status === "verified_official" ? "high" : "medium")},
                ${sqlString(evidence.parser_status ?? null)},
                ${sqlString(evidence.parser_warnings ?? null)}
              );`
              : "";
          return `
            INSERT INTO search_results (
              search_result_id,
              search_query_id,
              result_rank,
              entity_type,
              entity_id,
              title,
              snippet,
              source_id,
              source_snapshot_id,
              source_artifact_id,
              document_id,
              score,
              evidence_status,
              resolution_status,
              source_trust_tier,
              authority_scope,
              why_ranked,
              match_reasons_json,
              missing_evidence_json,
              caveats
            ) VALUES (
              ${sqlString(searchResultId)},
              ${sqlString(searchQueryId)},
              ${result.rank},
              ${sqlString(result.entity_type)},
              ${sqlString(result.entity_id)},
              ${sqlString(result.title)},
              ${sqlString(null)},
              ${sqlString(sourceId)},
              ${sqlString(row.source_snapshot_id ?? null)},
              ${sqlString(row.source_artifact_id ?? null)},
              ${sqlString(row.document_id ?? null)},
              ${Number(result.score) || 0},
              ${sqlString(result.evidence_status)},
              ${sqlString(result.resolution_status)},
              ${sqlString(result.source_trust_tier ?? null)},
              ${sqlString(result.authority_scope ?? null)},
              ${sqlJson(result.why_ranked)},
              ${sqlJson({ authority_role: result.authority_role, next_action: result.next_action })},
              ${sqlJson({ data_gaps: dataGaps, recommended_imports: recommendedImports })},
              ${sqlJson(result.caveats)}
            );
            ${claimSql}
          `;
        })
        .join("\n")
    );
  }

  recallRows() {
    return queryJson(
      this.dbPath,
      `
      SELECT
        'investor' AS entity_type,
        i.investor_id AS entity_id,
        i.investor_name AS title,
        i.normalized_name || ' ' || COALESCE(i.investor_type, '') || ' ' || COALESCE(i.tips_operator_status, '') || ' ' ||
          COALESCE(GROUP_CONCAT(DISTINCT f.fund_name), '') AS searchable_text,
        i.latest_evidence_at AS evidence_at,
        NULL AS source_id,
        MIN(fol.source_snapshot_id) AS source_snapshot_id,
        MIN(fol.source_artifact_id) AS source_artifact_id,
        NULL AS document_id,
        i.trust_level AS trust_level
      FROM investors i
      LEFT JOIN fund_operator_links fol ON fol.investor_id = i.investor_id
      LEFT JOIN funds f ON f.fund_id = fol.fund_id
      GROUP BY i.investor_id
      UNION ALL
      SELECT
        'fund' AS entity_type,
        f.fund_id AS entity_id,
        f.fund_name AS title,
        f.normalized_fund_name || ' ' || COALESCE(f.investment_purpose, '') || ' ' ||
          COALESCE(GROUP_CONCAT(DISTINCT i.investor_name), '') || ' ' ||
          COALESCE(GROUP_CONCAT(DISTINCT fif.sector_keyword), '') || ' ' ||
          COALESCE(GROUP_CONCAT(DISTINCT fif.startup_stage), '') || ' ' ||
          COALESCE(GROUP_CONCAT(DISTINCT fif.category_name), '') AS searchable_text,
        COALESCE(f.latest_evidence_at, f.formed_date, f.registered_date) AS evidence_at,
        NULL AS source_id,
        MIN(fol.source_snapshot_id) AS source_snapshot_id,
        MIN(fol.source_artifact_id) AS source_artifact_id,
        NULL AS document_id,
        f.trust_level AS trust_level
      FROM funds f
      LEFT JOIN fund_operator_links fol ON fol.fund_id = f.fund_id
      LEFT JOIN investors i ON i.investor_id = fol.investor_id
      LEFT JOIN fund_investment_focus fif ON fif.fund_id = f.fund_id
      GROUP BY f.fund_id
      UNION ALL
      SELECT
        'event' AS entity_type,
        e.event_id AS entity_id,
        e.title AS title,
        e.title || ' ' || e.evidence_text AS searchable_text,
        COALESCE(e.event_date, e.created_at) AS evidence_at,
        NULL AS source_id,
        e.source_snapshot_id AS source_snapshot_id,
        NULL AS source_artifact_id,
        e.document_id AS document_id,
        e.confidence AS trust_level
      FROM events e
      UNION ALL
      SELECT
        'document_chunk' AS entity_type,
        dc.chunk_id AS entity_id,
        COALESCE(dc.heading, d.title) AS title,
        COALESCE(dc.heading, '') || ' ' || dc.body_text || ' ' || COALESCE(dc.topic_tags, '') AS searchable_text,
        d.imported_at AS evidence_at,
        d.source_id AS source_id,
        NULL AS source_snapshot_id,
        d.artifact_id AS source_artifact_id,
        d.document_id AS document_id,
        d.trust_level AS trust_level
      FROM document_chunks dc
      JOIN documents d ON d.document_id = dc.document_id;
      `
    );
  }

  evidenceFor(row) {
    if (row.source_snapshot_id) {
      return this.withQualitySignals(
        row,
        first(
          queryJson(
            this.dbPath,
            `
            SELECT
              s.source_id,
              s.source_name,
              s.trust_tier,
              s.authoritative_scope,
              s.freshness_days,
              s.policy_status,
              ss.source_url,
              ra.content_sha256,
              ra.captured_at AS captured_or_imported_at,
              ra.parser_status,
              ra.parser_warnings
            FROM source_snapshots ss
            JOIN sources s ON s.source_id = ss.source_id
            LEFT JOIN raw_artifacts ra ON ra.artifact_id = ss.artifact_id
            WHERE ss.snapshot_id = ${sqlString(row.source_snapshot_id)}
            LIMIT 1;
            `
          )
        )
      );
    }

    if (row.source_artifact_id) {
      return this.withQualitySignals(
        row,
        first(
          queryJson(
            this.dbPath,
            `
            SELECT
              s.source_id,
              s.source_name,
              s.trust_tier,
              s.authoritative_scope,
              s.freshness_days,
              s.policy_status,
              ra.source_url,
              ra.content_sha256,
              ra.captured_at AS captured_or_imported_at,
              ra.parser_status,
              ra.parser_warnings
            FROM raw_artifacts ra
            JOIN sources s ON s.source_id = ra.source_id
            WHERE ra.artifact_id = ${sqlString(row.source_artifact_id)}
            LIMIT 1;
            `
          )
        )
      );
    }

    if (row.document_id) {
      return this.withQualitySignals(
        row,
        first(
          queryJson(
            this.dbPath,
            `
            SELECT
              s.source_id,
              s.source_name,
              s.trust_tier,
              s.authoritative_scope,
              s.freshness_days,
              s.policy_status,
              d.source_url,
              d.file_sha256,
              d.imported_at AS captured_or_imported_at,
              d.parser_status,
              d.parser_warnings
            FROM documents d
            JOIN sources s ON s.source_id = d.source_id
            WHERE d.document_id = ${sqlString(row.document_id)}
            LIMIT 1;
            `
          )
        )
      );
    }

    if (row.source_id) {
      return first(
        queryJson(
          this.dbPath,
          `
          SELECT
            source_id,
            source_name,
            trust_tier,
            authoritative_scope,
            freshness_days,
            policy_status,
            base_url AS source_url
          FROM sources
          WHERE source_id = ${sqlString(row.source_id)}
          LIMIT 1;
          `
        )
      );
    }

    return {};
  }

  withQualitySignals(row, evidence = {}) {
    const predicates = [];
    if (row.entity_type && row.entity_id) {
      predicates.push(`(entity_type = ${sqlString(row.entity_type)} AND entity_id = ${sqlString(row.entity_id)})`);
    }
    if (row.source_snapshot_id) {
      predicates.push(`(entity_type = 'source_snapshot' AND entity_id = ${sqlString(row.source_snapshot_id)})`);
    }
    if (row.source_artifact_id) {
      predicates.push(`(entity_type = 'raw_artifact' AND entity_id = ${sqlString(row.source_artifact_id)})`);
    }
    if (row.document_id) {
      predicates.push(`(entity_type = 'document' AND entity_id = ${sqlString(row.document_id)})`);
    }
    if (predicates.length === 0) return evidence;

    const flags = queryJson(
      this.dbPath,
      `
      SELECT severity, flag_type, message
      FROM data_quality_flags
      WHERE resolved_at IS NULL
        AND (${predicates.join(" OR ")})
      ORDER BY
        CASE severity WHEN 'critical' THEN 1 WHEN 'error' THEN 2 WHEN 'warning' THEN 3 ELSE 4 END,
        created_at DESC
      LIMIT 20;
      `
    );

    return {
      ...evidence,
      open_quality_flag_count: flags.length,
      critical_quality_flag_count: flags.filter((flag) => flag.severity === "critical" || flag.severity === "error").length,
      quality_flags: flags
    };
  }
}

function first(rows) {
  return rows[0] ?? {};
}

function authorityRole(row, scope) {
  if (!scope) return "inspect";
  if (row.policy_status === "blocked_by_default") return "context_only";
  try {
    const scopes = JSON.parse(row.authoritative_scope || "[]");
    if (Array.isArray(scopes) && scopes.includes(scope)) return "authoritative";
    if (row.trust_tier === "T4_user_private_note" || row.privacy_level === "restricted" || scopes.length === 0) return "context_only";
    return "supporting";
  } catch {
    row.authority_scope_error = "malformed_authoritative_scope";
    return "supporting";
  }
}

function roleRank(role) {
  if (role === "authoritative") return 1;
  if (role === "supporting") return 2;
  if (role === "inspect") return 3;
  return 4;
}

function resolveStatus(candidates, conditions) {
  const high = candidates.filter((candidate) => candidate.match_score >= 80);
  if (high.length === 1 && high[0].match_score >= 90) {
    return high[0].match_type?.startsWith("alias_") ? "resolved_alias" : "resolved_exact";
  }
  if (high.length > 1) return "ambiguous";
  return "no_match";
}

function normalizeIntentHint(intentHint) {
  if (!intentHint) return null;
  if (CANONICAL_QUERY_INTENTS.includes(intentHint)) return intentHint;
  throw new Error(`intent_hint must be one of: ${CANONICAL_QUERY_INTENTS.join(", ")}`);
}

function candidateResolutionStatus(match, alias) {
  const status = match.score >= 90 ? (alias ? "resolved_alias" : "resolved_exact") : "ambiguous";
  if (!CANONICAL_RESOLUTION_STATUSES.includes(status)) throw new Error(`Noncanonical resolution status: ${status}`);
  return status;
}

function resolutionCaveats(status, requiredSources) {
  const caveats = [];
  if (status === "ambiguous") caveats.push("Multiple entities matched. Ask the user to choose before making a firm recommendation.");
  if (status === "no_match") {
    caveats.push("No investor/fund entity was resolved; search will rely on conditions, lexical recall, and imported source gaps.");
  }
  caveats.push(`Required source families: ${requiredSources.join(", ")}.`);
  return caveats;
}

function conditionMatches(row, conditions) {
  const searchable = normalizeText(`${row.title} ${row.searchable_text ?? ""}`);
  const hits = [];
  for (const stage of conditions.stages) {
    if (searchable.includes(stage.replace("_", " ")) || searchable.includes(stage)) hits.push(`stage:${stage}`);
    if (stage === "pre_a" && /pre[\s-]?a|프리\s?A|프리a/i.test(row.searchable_text ?? "")) hits.push("stage:pre_a");
    if (stage === "seed" && /seed|시드|초기/i.test(row.searchable_text ?? "")) hits.push("stage:seed");
  }
  for (const sector of conditions.sectors) {
    if (searchable.includes(sector)) hits.push(`sector:${sector}`);
  }
  if (conditions.wantsTips && /tips|팁스/i.test(row.searchable_text ?? "")) hits.push("tips");
  return [...new Set(hits)];
}

function evidenceStatusFor(row, evidence, { resolutionStatus, authorityRole: evidenceAuthorityRole } = {}) {
  if (evidence.trust_tier?.startsWith("T4")) return "user_note_only";
  if (evidence.trust_tier?.startsWith("T3")) return "guide_only";
  const hasReviewSignals =
    Boolean(evidence.parser_warnings) ||
    ["partial", "failed"].includes(evidence.parser_status) ||
    Number(evidence.critical_quality_flag_count || 0) > 0 ||
    sourceIsStale(evidence);
  const hasOfficialSource =
    (evidence.trust_tier?.startsWith("T1") || evidence.trust_tier?.startsWith("T2")) &&
    (evidence.content_sha256 || evidence.file_sha256) &&
    evidence.source_url &&
    evidenceAuthorityRole === "authoritative";
  const hasAcceptedResolution = ["resolved_exact", "resolved_alias"].includes(resolutionStatus);
  if (evidence.trust_tier?.startsWith("T1") || evidence.trust_tier?.startsWith("T2")) {
    return hasOfficialSource && hasAcceptedResolution && !hasReviewSignals ? "verified_official" : "official_needs_review";
  }
  if (row.trust_level === "official_snapshot" || row.trust_level === "official") {
    return "official_needs_review";
  }
  return "no_evidence";
}

function whyRanked(row, evidence) {
  const why = [];
  if (row.termHits?.length) why.push(`lexical match: ${row.termHits.join(", ")}`);
  if (row.conditionHits?.length) why.push(`condition match: ${row.conditionHits.join(", ")}`);
  if (row.score >= 35) why.push("high local relevance score");
  if (evidence.trust_tier) why.push(`source trust tier: ${evidence.trust_tier}`);
  if (evidence.content_sha256 || evidence.file_sha256) why.push("source hash is present");
  if (why.length === 0) why.push("included by local recall baseline");
  return why;
}

function resultCaveats(row, evidence, evidenceStatus, { resolutionStatus, authorityRole: evidenceAuthorityRole } = {}) {
  const caveats = [];
  if (evidenceStatus === "official_needs_review") {
    const reviewReasons = [];
    if (!evidence.content_sha256 && !evidence.file_sha256) reviewReasons.push("source hash is missing");
    if (!evidence.source_url) reviewReasons.push("source URL is missing");
    if (sourceIsStale(evidence)) reviewReasons.push("source snapshot is stale");
    if (evidence.authority_scope_error) reviewReasons.push("source authoritative scope metadata is malformed");
    if (evidenceAuthorityRole && evidenceAuthorityRole !== "authoritative") reviewReasons.push("source is not authoritative for this query intent");
    if (!["resolved_exact", "resolved_alias"].includes(resolutionStatus)) reviewReasons.push("entity resolution is not exact or alias-confirmed");
    if (reviewReasons.length) {
      caveats.push(`Official-like row needs review: ${reviewReasons.join(", ")}.`);
    } else {
      caveats.push("Official-like row needs review before using as confirmed evidence.");
    }
  }
  if (evidenceStatus === "no_evidence") caveats.push("No official evidence link was attached in the local DB.");
  if (evidence.parser_warnings) caveats.push(`Parser warnings: ${evidence.parser_warnings}`);
  if (evidence.critical_quality_flag_count > 0) caveats.push("Open critical quality flags are attached to this evidence.");
  if (row.entity_type === "investor") caveats.push("Investor profile rows are not proof of current investment appetite by themselves.");
  return caveats;
}

function nextActionFor(evidenceStatus, row) {
  if (evidenceStatus === "verified_official") return "Create an evidence pack before outreach.";
  if (evidenceStatus === "official_needs_review") return "Import or re-link the original official snapshot/document.";
  if (row.entity_type === "document_chunk") return "Use as guide context, not as fund evidence.";
  return "Import KVIC/KVCA/TIPS or official disclosure evidence.";
}

function dataGapsFor(results, requiredSources, healthRows) {
  const gaps = [];
  if (results.length === 0) gaps.push("No local rows matched the query.");
  for (const sourceId of requiredSources) {
    const health = healthRows.find((row) => row.source_id === sourceId);
    if (!health || health.last_run_at === "never") {
      gaps.push(`${sourceId} has no imported snapshot in this DB.`);
    }
  }
  if (results.some((result) => result.evidence_status === "official_needs_review")) {
    gaps.push("Some official-like rows need source review before confirmation.");
  }
  if (results.some((result) => result.caveats?.some((caveat) => caveat.includes("source snapshot is stale")))) {
    gaps.push("Some official-like rows use stale source snapshots and need a fresh import.");
  }
  return [...new Set(gaps)];
}

function sourceIsStale(evidence = {}, now = new Date()) {
  const freshnessDays = Number(evidence.freshness_days);
  if (!Number.isFinite(freshnessDays) || freshnessDays <= 0) return false;
  const capturedAt = evidence.captured_or_imported_at ? new Date(evidence.captured_or_imported_at) : null;
  if (!capturedAt || Number.isNaN(capturedAt.getTime())) return true;
  return now.getTime() - capturedAt.getTime() > freshnessDays * 24 * 60 * 60 * 1000;
}

function recommendedImportsFor(results, requiredSources) {
  const imports = requiredSources.map((sourceId) => ({
    source_id: sourceId,
    action: recommendedAction(sourceId)
  }));
  if (results.some((result) => result.entity_type === "document_chunk")) {
    imports.push({
      source_id: "official_disclosure_documents",
      action: "Import source PDF/HWPX disclosures when making fund evidence claims."
    });
  }
  return uniqueBy(imports, (item) => item.source_id);
}

function recommendedAction(sourceId) {
  if (sourceId === "kvic_fundfinder") return "Capture or import a KVIC FundFinder snapshot for the target fund category.";
  if (sourceId === "kvca_diva_associations") return "Capture or import a KVCA DIVA association snapshot for the VC/AC name.";
  if (sourceId === "tips_public_site") return "Capture or import a TIPS operator/program snapshot after policy check.";
  if (sourceId === "official_disclosure_documents") return "Import official disclosure PDF/HWPX/HTML files into the local archive.";
  if (sourceId === "founder_guide_library") return "Import founder guide PDFs/HWPX/markdown into the local guide library.";
  return "Import a current source snapshot.";
}

function sqlIdentifier(name) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/u.test(name)) throw new Error(`Unsafe SQL identifier: ${name}`);
  return `"${name}"`;
}

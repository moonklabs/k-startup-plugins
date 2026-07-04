-- Quality check query pack for vc-fund-disclosure-mcp.
-- The CLI can run these after each import and write failures to data_quality_flags.

-- 1. Sources without any collection run.
SELECT
  'source_never_collected' AS check_name,
  s.source_id,
  s.source_name,
  s.policy_status,
  'Source has no collection run yet.' AS message
FROM sources s
LEFT JOIN collection_runs cr ON cr.source_id = s.source_id
GROUP BY s.source_id
HAVING COUNT(cr.run_id) = 0;

-- 2. Raw artifacts missing hash, storage, or acquisition mode.
SELECT
  'raw_artifact_integrity' AS check_name,
  artifact_id,
  source_id,
  source_url,
  file_name,
  'Raw artifact must retain hash, storage URI, captured time, and acquisition mode.' AS message
FROM raw_artifacts
WHERE content_sha256 IS NULL
   OR content_sha256 = ''
   OR storage_uri IS NULL
   OR storage_uri = ''
   OR captured_at IS NULL
   OR acquisition_mode IS NULL;

-- 3. Snapshots that parsed zero normalized rows.
SELECT
  'zero_normalized_rows' AS check_name,
  ss.snapshot_id,
  ss.source_id,
  ss.source_url,
  ss.raw_row_count,
  ss.normalized_row_count,
  'Snapshot produced no normalized rows; parser or source layout may have drifted.' AS message
FROM source_snapshots ss
WHERE COALESCE(ss.raw_row_count, 0) > 0
  AND COALESCE(ss.normalized_row_count, 0) = 0;

-- 4. Funds without an operator link.
SELECT
  'fund_without_operator' AS check_name,
  f.fund_id,
  f.fund_name,
  f.latest_evidence_at,
  'Fund exists without an investor/operator link.' AS message
FROM funds f
LEFT JOIN fund_operator_links fol ON fol.fund_id = f.fund_id
WHERE fol.link_id IS NULL;

-- 5. Investors without official fund evidence.
SELECT
  'investor_without_fund_evidence' AS check_name,
  i.investor_id,
  i.investor_name,
  i.tips_operator_status,
  'Investor has no linked fund evidence yet.' AS message
FROM investors i
LEFT JOIN fund_operator_links fol ON fol.investor_id = i.investor_id
WHERE fol.link_id IS NULL;

-- 6. Parser warnings that should be visible in MCP answers.
SELECT
  'parser_warning' AS check_name,
  artifact_id,
  source_id,
  source_url,
  parser_status,
  parser_warnings AS message
FROM raw_artifacts
WHERE parser_warnings IS NOT NULL
  AND parser_warnings != '';

-- 7. Potential personal contact leakage in searchable guide chunks.
SELECT
  'possible_pii_in_document_chunk' AS check_name,
  dc.chunk_id,
  d.document_id,
  d.title,
  'Chunk may contain an email address or Korean mobile number pattern; redact before default responses.' AS message
FROM document_chunks dc
JOIN documents d ON d.document_id = dc.document_id
WHERE dc.body_text LIKE '%@%'
   OR dc.body_text LIKE '%010-%'
   OR dc.body_text LIKE '%010 %';

-- 8. Open quality flags by source.
SELECT
  'open_quality_flags_by_source' AS check_name,
  COALESCE(dq.source_id, 'unscoped') AS source_id,
  COUNT(*) AS open_flag_count,
  GROUP_CONCAT(DISTINCT dq.severity) AS severities,
  'Open data quality flags remain unresolved.' AS message
FROM data_quality_flags dq
WHERE dq.resolved_at IS NULL
GROUP BY COALESCE(dq.source_id, 'unscoped')
HAVING COUNT(*) > 0;

-- 9. Search results without evidence explanation.
SELECT
  'search_result_without_explanation' AS check_name,
  search_result_id,
  search_query_id,
  title,
  'Search result must include why_ranked and evidence_status for user trust.' AS message
FROM search_results
WHERE why_ranked IS NULL
   OR why_ranked = ''
   OR evidence_status IS NULL
   OR evidence_status = '';

-- 10. Verified result without authoritative source metadata.
SELECT
  'verified_result_without_authority' AS check_name,
  sr.search_result_id,
  sr.search_query_id,
  sr.title,
  'verified_official result must include source_trust_tier and authority_scope.' AS message
FROM search_results sr
WHERE sr.evidence_status = 'verified_official'
  AND (
    sr.source_trust_tier IS NULL
    OR sr.authority_scope IS NULL
    OR sr.source_id IS NULL
  );

-- 11. Search query without resolution record.
SELECT
  'search_query_without_resolution' AS check_name,
  sq.search_query_id,
  sq.user_query,
  sq.interpreted_intent,
  'Every user query must record resolution_status before search results are trusted.' AS message
FROM search_queries sq
WHERE sq.resolution_status IS NULL
   OR sq.resolution_status = '';

-- 12. Accepted non-exact candidate without explanation.
SELECT
  'non_exact_resolution_without_explanation' AS check_name,
  erc.resolution_candidate_id,
  erc.search_query_id,
  erc.candidate_label,
  'Alias or non-exact resolution must explain why this candidate was accepted.' AS message
FROM entity_resolution_candidates erc
WHERE (
    erc.resolution_status = 'resolved_alias'
    OR erc.match_type LIKE 'alias_%'
    OR erc.match_type IN (
      'query_contains_candidate',
      'candidate_contains_query',
      'token_overlap',
      'fuzzy',
      'alias'
    )
  )
  AND erc.resolution_status IN ('resolved_alias', 'resolved_exact')
  AND (erc.why_candidate IS NULL OR erc.why_candidate = '');

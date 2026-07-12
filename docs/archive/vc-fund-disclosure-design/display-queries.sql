-- Display query templates for vc-fund-disclosure-mcp.
-- Bind parameters using the host language; SQLite CLI-style names are illustrative.

-- 1. Investor profile report: official fund evidence + recent events.
-- Parameters: :normalized_investor_name
SELECT
  i.investor_id,
  i.investor_name,
  i.investor_type,
  i.homepage,
  i.tips_operator_status,
  f.fund_id,
  f.fund_name,
  f.fund_type,
  f.formed_date,
  f.registered_date,
  f.expiry_date,
  f.committed_amount_krw,
  f.invested_amount_krw,
  f.mfund_invested,
  fol.confidence AS operator_link_confidence,
  ss.source_url,
  ra.content_sha256,
  ra.captured_at,
  ra.parser_warnings
FROM investors i
LEFT JOIN fund_operator_links fol ON fol.investor_id = i.investor_id
LEFT JOIN funds f ON f.fund_id = fol.fund_id
LEFT JOIN source_snapshots ss ON ss.snapshot_id = fol.source_snapshot_id
LEFT JOIN raw_artifacts ra ON ra.artifact_id = fol.source_artifact_id
WHERE i.normalized_name = :normalized_investor_name
ORDER BY COALESCE(f.formed_date, f.registered_date, f.latest_evidence_at) DESC;

-- 2. Recent fund event feed.
-- Parameters: :since_date, :event_type
SELECT
  e.event_id,
  e.event_type,
  e.event_date,
  i.investor_name,
  f.fund_name,
  e.title,
  e.amount_krw,
  e.confidence,
  e.review_status,
  e.evidence_text,
  d.title AS source_document_title,
  d.source_url AS source_document_url,
  d.file_sha256
FROM events e
LEFT JOIN investors i ON i.investor_id = e.investor_id
LEFT JOIN funds f ON f.fund_id = e.fund_id
LEFT JOIN documents d ON d.document_id = e.document_id
WHERE COALESCE(e.event_date, e.created_at) >= :since_date
  AND (:event_type IS NULL OR e.event_type = :event_type)
ORDER BY COALESCE(e.event_date, e.created_at) DESC;

-- 3. Startup fund search. Keep scoring simple in SQL; final ranking can be
-- adjusted in application code using company context.
-- Parameters: :stage, :sector_like, :region_like
SELECT
  i.investor_name,
  f.fund_name,
  f.committed_amount_krw,
  f.invested_amount_krw,
  f.formed_date,
  f.expiry_date,
  fif.category_code,
  fif.subcategory_code,
  fif.category_name,
  fif.subcategory_name,
  fif.sector_keyword,
  fif.startup_stage,
  fif.region,
  CASE
    WHEN fif.startup_stage = :stage THEN 2
    WHEN fif.startup_stage IS NULL THEN 0
    ELSE 1
  END AS stage_score,
  CASE
    WHEN fif.sector_keyword LIKE :sector_like THEN 2
    WHEN f.investment_purpose LIKE :sector_like THEN 1
    ELSE 0
  END AS sector_score,
  CASE
    WHEN :region_like IS NULL THEN 0
    WHEN fif.region LIKE :region_like THEN 1
    ELSE 0
  END AS region_score
FROM funds f
JOIN fund_operator_links fol ON fol.fund_id = f.fund_id
JOIN investors i ON i.investor_id = fol.investor_id
LEFT JOIN fund_investment_focus fif ON fif.fund_id = f.fund_id
ORDER BY (stage_score + sector_score + region_score) DESC,
  COALESCE(f.formed_date, f.registered_date) DESC;

-- 4. Founder guide search. This is a lexical baseline; vector search can be
-- added later using embedding_ref.
-- Parameters: :query_like, :startup_stage
SELECT
  d.document_id,
  d.title,
  d.publisher,
  d.document_role,
  d.trust_level,
  d.source_url,
  d.file_sha256,
  dc.chunk_id,
  dc.heading,
  dc.body_text,
  dc.topic_tags,
  dc.startup_stage
FROM document_chunks dc
JOIN documents d ON d.document_id = dc.document_id
WHERE d.document_role IN ('founder_education', 'program_guide', 'legal_guide', 'template', 'meeting_prep')
  AND (:startup_stage IS NULL OR dc.startup_stage IS NULL OR dc.startup_stage = :startup_stage)
  AND (dc.body_text LIKE :query_like OR dc.heading LIKE :query_like OR dc.topic_tags LIKE :query_like)
ORDER BY
  CASE d.trust_level
    WHEN 'official' THEN 1
    WHEN 'investor_public' THEN 2
    WHEN 'user_owned' THEN 3
    ELSE 4
  END,
  d.imported_at DESC,
  dc.chunk_index ASC
LIMIT 20;

-- 5. Data gap report for a specific investor.
-- Parameters: :normalized_investor_name
SELECT
  i.investor_name,
  CASE WHEN COUNT(DISTINCT fol.fund_id) = 0 THEN 'missing_fund_links' END AS fund_gap,
  CASE WHEN MAX(tos.captured_at) IS NULL THEN 'missing_tips_operator_snapshot' END AS tips_gap,
  CASE WHEN COUNT(dq.flag_id) > 0 THEN 'open_quality_flags' END AS quality_gap,
  COUNT(dq.flag_id) AS open_quality_flag_count
FROM investors i
LEFT JOIN fund_operator_links fol ON fol.investor_id = i.investor_id
LEFT JOIN tips_operator_snapshots tos ON tos.investor_id = i.investor_id
LEFT JOIN data_quality_flags dq
  ON dq.entity_type = 'investor'
  AND dq.entity_id = i.investor_id
  AND dq.resolved_at IS NULL
WHERE i.normalized_name = :normalized_investor_name
GROUP BY i.investor_id, i.investor_name;

-- 6. Collection health dashboard.
SELECT
  source_id,
  source_name,
  policy_status,
  trust_tier,
  authoritative_scope,
  last_run_at,
  successful_runs,
  non_success_runs,
  open_quality_flags
FROM v_source_health
ORDER BY
  CASE policy_status
    WHEN 'allowed_local_import' THEN 1
    WHEN 'requires_check' THEN 2
    WHEN 'permission_required' THEN 3
    ELSE 4
  END,
  source_name ASC;

-- 7. Unified searchable entity baseline. Application code should apply the
-- ranking model from search-contract.yaml after this recall stage.
-- Parameters: :query_like, :limit
SELECT
  entity_type,
  entity_id,
  title,
  trust_level,
  evidence_at,
  source_id,
  source_snapshot_id,
  source_artifact_id,
  document_id,
  CASE
    WHEN searchable_text LIKE :query_like THEN 1
    ELSE 0
  END AS lexical_match
FROM v_searchable_entities
WHERE searchable_text LIKE :query_like
ORDER BY
  CASE trust_level
    WHEN 'official_snapshot' THEN 1
    WHEN 'official' THEN 2
    WHEN 'high' THEN 3
    WHEN 'medium' THEN 4
    ELSE 5
  END,
  evidence_at DESC
LIMIT COALESCE(:limit, 20);

-- 8. Entity resolution candidates for a user query.
-- Parameters: :search_query_id
SELECT
  search_query_id,
  raw_text,
  entity_type,
  candidate_label,
  match_type,
  match_score,
  resolution_status,
  source_id,
  why_candidate
FROM entity_resolution_candidates
WHERE search_query_id = :search_query_id
ORDER BY match_score DESC, candidate_label ASC;

-- 9. Source authority matrix for UI/CLI diagnostics.
-- Parameters: :scope_like
SELECT
  source_id,
  source_name,
  source_type,
  policy_status,
  trust_tier,
  authoritative_scope,
  freshness_days,
  last_policy_checked_at
FROM v_source_authority
WHERE :scope_like IS NULL
   OR authoritative_scope LIKE :scope_like
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

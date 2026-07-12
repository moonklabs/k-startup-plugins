-- VC Fund Disclosure local evidence database
-- Draft schema for SQLite. Store raw artifacts, normalized evidence, guide chunks,
-- quality flags, and user-facing query views separately.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sources (
  source_id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  owner TEXT,
  source_type TEXT NOT NULL,
  base_url TEXT,
  base_path TEXT,
  policy_status TEXT NOT NULL,
  trust_tier TEXT NOT NULL DEFAULT 'T9_unverified_web',
  authoritative_scope TEXT,
  freshness_days INTEGER,
  default_collection_modes TEXT,
  disabled_collection_modes TEXT,
  privacy_level TEXT NOT NULL DEFAULT 'public',
  last_policy_checked_at TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS collection_runs (
  run_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  collection_mode TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TEXT,
  status TEXT NOT NULL,
  items_seen INTEGER NOT NULL DEFAULT 0,
  items_imported INTEGER NOT NULL DEFAULT 0,
  items_updated INTEGER NOT NULL DEFAULT 0,
  items_skipped INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  run_config_json TEXT
);

CREATE TABLE IF NOT EXISTS raw_artifacts (
  artifact_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  run_id TEXT REFERENCES collection_runs(run_id),
  artifact_type TEXT NOT NULL,
  source_url TEXT,
  local_path TEXT,
  storage_uri TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  content_type TEXT,
  file_name TEXT,
  captured_at TEXT NOT NULL,
  acquisition_mode TEXT NOT NULL,
  parser_version TEXT,
  parser_status TEXT NOT NULL DEFAULT 'pending',
  parser_warnings TEXT,
  UNIQUE(source_id, content_sha256)
);

CREATE TABLE IF NOT EXISTS source_snapshots (
  snapshot_id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES raw_artifacts(artifact_id),
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  source_url TEXT,
  snapshot_kind TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  raw_row_count INTEGER,
  normalized_row_count INTEGER,
  snapshot_params_json TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS investors (
  investor_id TEXT PRIMARY KEY,
  investor_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  investor_type TEXT,
  homepage TEXT,
  headquarters TEXT,
  tips_operator_status TEXT,
  latest_evidence_at TEXT,
  trust_level TEXT NOT NULL DEFAULT 'derived',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(normalized_name)
);

CREATE TABLE IF NOT EXISTS investor_aliases (
  alias_id TEXT PRIMARY KEY,
  investor_id TEXT NOT NULL REFERENCES investors(investor_id),
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  source_id TEXT,
  source_artifact_id TEXT,
  confidence TEXT NOT NULL DEFAULT 'medium',
  UNIQUE(normalized_alias, investor_id)
);

CREATE TABLE IF NOT EXISTS funds (
  fund_id TEXT PRIMARY KEY,
  fund_name TEXT NOT NULL,
  normalized_fund_name TEXT NOT NULL,
  fund_type TEXT,
  formed_date TEXT,
  registered_date TEXT,
  expiry_date TEXT,
  committed_amount_krw INTEGER,
  invested_amount_krw INTEGER,
  mfund_invested INTEGER,
  duration_text TEXT,
  investment_purpose TEXT,
  trust_level TEXT NOT NULL DEFAULT 'official_snapshot',
  latest_evidence_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fund_operator_links (
  link_id TEXT PRIMARY KEY,
  fund_id TEXT NOT NULL REFERENCES funds(fund_id),
  investor_id TEXT NOT NULL REFERENCES investors(investor_id),
  role TEXT NOT NULL DEFAULT 'operator',
  source_snapshot_id TEXT REFERENCES source_snapshots(snapshot_id),
  source_artifact_id TEXT REFERENCES raw_artifacts(artifact_id),
  confidence TEXT NOT NULL DEFAULT 'medium',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(fund_id, investor_id, role)
);

CREATE TABLE IF NOT EXISTS fund_investment_focus (
  focus_id TEXT PRIMARY KEY,
  fund_id TEXT NOT NULL REFERENCES funds(fund_id),
  category_code TEXT,
  subcategory_code TEXT,
  category_name TEXT,
  subcategory_name TEXT,
  sector_keyword TEXT,
  startup_stage TEXT,
  region TEXT,
  source_snapshot_id TEXT REFERENCES source_snapshots(snapshot_id),
  confidence TEXT NOT NULL DEFAULT 'medium'
);

CREATE TABLE IF NOT EXISTS kvic_fundfinder_categories (
  category_id TEXT PRIMARY KEY,
  category_code TEXT NOT NULL,
  category_name TEXT NOT NULL,
  parent_code TEXT,
  parent_name TEXT,
  source_url TEXT NOT NULL,
  snapshot_at TEXT NOT NULL,
  UNIQUE(category_code, parent_code)
);

CREATE TABLE IF NOT EXISTS kvca_associations (
  association_id TEXT PRIMARY KEY,
  asct_id TEXT,
  fund_id TEXT REFERENCES funds(fund_id),
  association_name TEXT NOT NULL,
  operator_names_text TEXT,
  registered_date TEXT,
  expiry_date TEXT,
  committed_amount_krw INTEGER,
  investment_field TEXT,
  purpose_type TEXT,
  support_type TEXT,
  account_type TEXT,
  representative_fund_manager TEXT,
  mfund_invested INTEGER,
  source_snapshot_id TEXT REFERENCES source_snapshots(snapshot_id),
  source_artifact_id TEXT REFERENCES raw_artifacts(artifact_id),
  UNIQUE(asct_id)
);

CREATE TABLE IF NOT EXISTS tips_operator_snapshots (
  tips_snapshot_id TEXT PRIMARY KEY,
  investor_id TEXT REFERENCES investors(investor_id),
  operator_name TEXT NOT NULL,
  status TEXT NOT NULL,
  source_url TEXT,
  captured_at TEXT NOT NULL,
  evidence_text TEXT,
  source_artifact_id TEXT REFERENCES raw_artifacts(artifact_id),
  confidence TEXT NOT NULL DEFAULT 'medium'
);

CREATE TABLE IF NOT EXISTS founder_guide_sources (
  guide_source_id TEXT PRIMARY KEY,
  publisher TEXT NOT NULL,
  source_url TEXT NOT NULL,
  suggested_role TEXT NOT NULL,
  access_status TEXT NOT NULL,
  last_checked_at TEXT,
  local_file_hint TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_url)
);

CREATE TABLE IF NOT EXISTS documents (
  document_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  guide_source_id TEXT REFERENCES founder_guide_sources(guide_source_id),
  artifact_id TEXT REFERENCES raw_artifacts(artifact_id),
  title TEXT NOT NULL,
  document_role TEXT NOT NULL,
  publisher TEXT,
  source_url TEXT,
  published_date TEXT,
  file_name TEXT,
  file_type TEXT,
  file_sha256 TEXT,
  storage_uri TEXT,
  license_note TEXT,
  trust_level TEXT NOT NULL,
  parser_status TEXT NOT NULL DEFAULT 'pending',
  parser_warnings TEXT,
  imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_chunks (
  chunk_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(document_id),
  chunk_index INTEGER NOT NULL,
  heading TEXT,
  body_text TEXT NOT NULL,
  body_text_sha256 TEXT,
  token_count INTEGER,
  startup_stage TEXT,
  topic_tags TEXT,
  embedding_ref TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, chunk_index)
);

CREATE TABLE IF NOT EXISTS fundraising_concepts (
  concept_id TEXT PRIMARY KEY,
  concept_name TEXT NOT NULL,
  aliases TEXT,
  plain_language_summary TEXT NOT NULL,
  why_it_matters TEXT,
  common_mistakes TEXT,
  source_chunk_ids TEXT,
  trust_level TEXT NOT NULL DEFAULT 'guide',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(concept_name)
);

CREATE TABLE IF NOT EXISTS guidance_cards (
  guidance_card_id TEXT PRIMARY KEY,
  card_type TEXT NOT NULL,
  title TEXT NOT NULL,
  startup_stage TEXT,
  body_markdown TEXT NOT NULL,
  source_chunk_ids TEXT,
  review_status TEXT NOT NULL DEFAULT 'draft',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_queries (
  search_query_id TEXT PRIMARY KEY,
  user_query TEXT NOT NULL,
  normalized_query TEXT,
  interpreted_intent TEXT NOT NULL CHECK (interpreted_intent IN ('investor_fund_holding', 'startup_fund_search', 'tips_signal', 'new_fund_event', 'founder_education')),
  resolution_status TEXT NOT NULL CHECK (resolution_status IN ('resolved_exact', 'resolved_alias', 'ambiguous', 'no_match')),
  resolved_entities_json TEXT,
  company_context_json TEXT,
  data_gaps_json TEXT,
  recommended_imports_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entity_resolution_candidates (
  resolution_candidate_id TEXT PRIMARY KEY,
  search_query_id TEXT NOT NULL REFERENCES search_queries(search_query_id),
  raw_text TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  candidate_entity_id TEXT,
  candidate_label TEXT NOT NULL,
  normalized_candidate_label TEXT,
  match_type TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  source_id TEXT REFERENCES sources(source_id),
  source_artifact_id TEXT REFERENCES raw_artifacts(artifact_id),
  resolution_status TEXT NOT NULL CHECK (resolution_status IN ('resolved_exact', 'resolved_alias', 'ambiguous', 'no_match')),
  why_candidate TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evidence_claims (
  evidence_claim_id TEXT PRIMARY KEY,
  claim_type TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT,
  predicate TEXT NOT NULL,
  object_value TEXT,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  source_snapshot_id TEXT REFERENCES source_snapshots(snapshot_id),
  source_artifact_id TEXT REFERENCES raw_artifacts(artifact_id),
  document_id TEXT REFERENCES documents(document_id),
  source_trust_tier TEXT NOT NULL,
  authority_scope TEXT,
  confidence TEXT NOT NULL DEFAULT 'medium',
  parser_status TEXT,
  parser_warnings TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_results (
  search_result_id TEXT PRIMARY KEY,
  search_query_id TEXT NOT NULL REFERENCES search_queries(search_query_id),
  result_rank INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  title TEXT NOT NULL,
  snippet TEXT,
  source_id TEXT REFERENCES sources(source_id),
  source_snapshot_id TEXT REFERENCES source_snapshots(snapshot_id),
  source_artifact_id TEXT REFERENCES raw_artifacts(artifact_id),
  document_id TEXT REFERENCES documents(document_id),
  score INTEGER NOT NULL,
  evidence_status TEXT NOT NULL CHECK (evidence_status IN ('verified_official', 'official_needs_review', 'guide_only', 'user_note_only', 'no_evidence')),
  resolution_status TEXT NOT NULL CHECK (resolution_status IN ('resolved_exact', 'resolved_alias', 'ambiguous', 'no_match')),
  source_trust_tier TEXT,
  authority_scope TEXT,
  why_ranked TEXT NOT NULL,
  match_reasons_json TEXT,
  missing_evidence_json TEXT,
  caveats TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(search_query_id, result_rank)
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_date TEXT,
  investor_id TEXT REFERENCES investors(investor_id),
  fund_id TEXT REFERENCES funds(fund_id),
  document_id TEXT REFERENCES documents(document_id),
  source_snapshot_id TEXT REFERENCES source_snapshots(snapshot_id),
  title TEXT NOT NULL,
  evidence_text TEXT NOT NULL,
  amount_krw INTEGER,
  confidence TEXT NOT NULL DEFAULT 'medium',
  review_status TEXT NOT NULL DEFAULT 'unreviewed',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evidence_edges (
  edge_id TEXT PRIMARY KEY,
  from_type TEXT NOT NULL,
  from_id TEXT NOT NULL,
  to_type TEXT NOT NULL,
  to_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  source_snapshot_id TEXT REFERENCES source_snapshots(snapshot_id),
  source_artifact_id TEXT REFERENCES raw_artifacts(artifact_id),
  document_id TEXT REFERENCES documents(document_id),
  confidence TEXT NOT NULL DEFAULT 'medium',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlist_targets (
  target_id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_value TEXT NOT NULL,
  normalized_value TEXT NOT NULL,
  tags TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  UNIQUE(target_type, normalized_value)
);

CREATE TABLE IF NOT EXISTS data_quality_flags (
  flag_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  severity TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  message TEXT NOT NULL,
  source_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  resolution_note TEXT
);

CREATE TABLE IF NOT EXISTS review_queue (
  review_id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  review_note TEXT
);

CREATE TABLE IF NOT EXISTS user_notes (
  note_id TEXT PRIMARY KEY,
  note_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  related_investor_id TEXT REFERENCES investors(investor_id),
  related_fund_id TEXT REFERENCES funds(fund_id),
  privacy_level TEXT NOT NULL DEFAULT 'restricted',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS query_cache (
  query_cache_id TEXT PRIMARY KEY,
  query_kind TEXT NOT NULL,
  query_input_sha256 TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_investors_normalized_name ON investors(normalized_name);
CREATE INDEX IF NOT EXISTS idx_funds_normalized_name ON funds(normalized_fund_name);
CREATE INDEX IF NOT EXISTS idx_funds_dates ON funds(formed_date, expiry_date);
CREATE INDEX IF NOT EXISTS idx_events_type_date ON events(event_type, event_date);
CREATE INDEX IF NOT EXISTS idx_events_review ON events(review_status, created_at);
CREATE INDEX IF NOT EXISTS idx_documents_role ON documents(document_role, trust_level);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_quality_flags_open ON data_quality_flags(entity_type, entity_id, resolved_at);
CREATE INDEX IF NOT EXISTS idx_raw_artifacts_source ON raw_artifacts(source_id, captured_at);
CREATE INDEX IF NOT EXISTS idx_search_queries_intent ON search_queries(interpreted_intent, created_at);
CREATE INDEX IF NOT EXISTS idx_resolution_candidates_query ON entity_resolution_candidates(search_query_id, match_score);
CREATE INDEX IF NOT EXISTS idx_resolution_candidates_entity ON entity_resolution_candidates(entity_type, candidate_entity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_claims_subject ON evidence_claims(subject_type, subject_id, claim_type);
CREATE INDEX IF NOT EXISTS idx_evidence_claims_source ON evidence_claims(source_id, source_trust_tier);
CREATE INDEX IF NOT EXISTS idx_search_results_query_rank ON search_results(search_query_id, result_rank);
CREATE INDEX IF NOT EXISTS idx_search_results_entity ON search_results(entity_type, entity_id);

CREATE VIEW IF NOT EXISTS v_source_authority AS
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
FROM sources;

CREATE VIEW IF NOT EXISTS v_entity_resolution_summary AS
SELECT
  sq.search_query_id,
  sq.user_query,
  sq.interpreted_intent,
  sq.resolution_status AS query_resolution_status,
  erc.raw_text,
  erc.entity_type,
  erc.candidate_entity_id,
  erc.candidate_label,
  erc.match_type,
  erc.match_score,
  erc.resolution_status AS candidate_resolution_status,
  erc.why_candidate
FROM search_queries sq
LEFT JOIN entity_resolution_candidates erc ON erc.search_query_id = sq.search_query_id;

CREATE VIEW IF NOT EXISTS v_searchable_entities AS
SELECT
  'investor' AS entity_type,
  i.investor_id AS entity_id,
  i.investor_name AS title,
  i.normalized_name AS searchable_text,
  i.latest_evidence_at AS evidence_at,
  NULL AS source_id,
  NULL AS source_snapshot_id,
  NULL AS source_artifact_id,
  NULL AS document_id,
  i.trust_level AS trust_level
FROM investors i
UNION ALL
SELECT
  'fund' AS entity_type,
  f.fund_id AS entity_id,
  f.fund_name AS title,
  f.normalized_fund_name || ' ' || COALESCE(f.investment_purpose, '') AS searchable_text,
  f.latest_evidence_at AS evidence_at,
  NULL AS source_id,
  NULL AS source_snapshot_id,
  NULL AS source_artifact_id,
  NULL AS document_id,
  f.trust_level AS trust_level
FROM funds f
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

DROP VIEW IF EXISTS v_source_health;
CREATE VIEW v_source_health AS
SELECT
  s.source_id,
  s.source_name,
  s.policy_status,
  s.trust_tier,
  s.authoritative_scope,
  (SELECT MAX(cr.started_at) FROM collection_runs cr WHERE cr.source_id = s.source_id) AS last_run_at,
  (SELECT COUNT(*) FROM collection_runs cr WHERE cr.source_id = s.source_id AND cr.status = 'success') AS successful_runs,
  (SELECT COUNT(*) FROM collection_runs cr WHERE cr.source_id = s.source_id AND cr.status != 'success') AS non_success_runs,
  (SELECT COALESCE(SUM(cr.warning_count), 0) FROM collection_runs cr WHERE cr.source_id = s.source_id) AS warning_count,
  (SELECT COUNT(*) FROM data_quality_flags dq WHERE dq.source_id = s.source_id AND dq.resolved_at IS NULL) AS open_quality_flags
FROM sources s;

CREATE VIEW IF NOT EXISTS v_investor_profile_summary AS
SELECT
  i.investor_id,
  i.investor_name,
  i.investor_type,
  i.homepage,
  i.tips_operator_status,
  COUNT(DISTINCT fol.fund_id) AS linked_fund_count,
  MAX(f.latest_evidence_at) AS latest_fund_evidence_at,
  GROUP_CONCAT(DISTINCT f.fund_name) AS fund_names
FROM investors i
LEFT JOIN fund_operator_links fol ON fol.investor_id = i.investor_id
LEFT JOIN funds f ON f.fund_id = fol.fund_id
GROUP BY i.investor_id, i.investor_name, i.investor_type, i.homepage, i.tips_operator_status;

CREATE VIEW IF NOT EXISTS v_recent_fund_events AS
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
  e.created_at
FROM events e
LEFT JOIN investors i ON i.investor_id = e.investor_id
LEFT JOIN funds f ON f.fund_id = e.fund_id
ORDER BY COALESCE(e.event_date, e.created_at) DESC;

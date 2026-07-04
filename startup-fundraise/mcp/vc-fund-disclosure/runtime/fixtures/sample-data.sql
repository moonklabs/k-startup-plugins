INSERT INTO collection_runs (
  run_id,
  source_id,
  collection_mode,
  started_at,
  ended_at,
  status,
  items_seen,
  items_imported
) VALUES
  ('run_kvic_sample_20260704', 'kvic_fundfinder', 'manual_snapshot_import', '2026-07-04T00:00:00Z', '2026-07-04T00:01:00Z', 'success', 2, 2),
  ('run_kvca_sample_20260704', 'kvca_diva_associations', 'manual_snapshot_import', '2026-07-04T00:02:00Z', '2026-07-04T00:03:00Z', 'success', 2, 2);

INSERT INTO raw_artifacts (
  artifact_id,
  source_id,
  run_id,
  artifact_type,
  source_url,
  local_path,
  storage_uri,
  content_sha256,
  content_type,
  file_name,
  captured_at,
  acquisition_mode,
  parser_version,
  parser_status
) VALUES
  (
    'artifact_kvic_seed_ai',
    'kvic_fundfinder',
    'run_kvic_sample_20260704',
    'html_snapshot',
    'http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd',
    './fixtures/kvic-seed-ai.html',
    'fixture://kvic-seed-ai.html',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'text/html',
    'kvic-seed-ai.html',
    '2026-07-04T00:00:00Z',
    'manual_snapshot_import',
    'fixture-v1',
    'success'
  ),
  (
    'artifact_kvca_primer',
    'kvca_diva_associations',
    'run_kvca_sample_20260704',
    'html_snapshot',
    'http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq',
    './fixtures/kvca-primer.html',
    'fixture://kvca-primer.html',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'text/html',
    'kvca-primer.html',
    '2026-07-04T00:02:00Z',
    'manual_snapshot_import',
    'fixture-v1',
    'success'
  );

INSERT INTO source_snapshots (
  snapshot_id,
  artifact_id,
  source_id,
  source_url,
  snapshot_kind,
  captured_at,
  raw_row_count,
  normalized_row_count,
  snapshot_params_json
) VALUES
  (
    'snap_kvic_seed_ai',
    'artifact_kvic_seed_ai',
    'kvic_fundfinder',
    'http://fundfinder.k-vic.co.kr/rsh/rsh/RshMacFnd',
    'fundfinder_category',
    '2026-07-04T00:00:00Z',
    2,
    2,
    '{"category_code":"AA02","category_name":"초기기업","sector":"AI SaaS"}'
  ),
  (
    'snap_kvca_primer',
    'artifact_kvca_primer',
    'kvca_diva_associations',
    'http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq',
    'association_by_vc',
    '2026-07-04T00:02:00Z',
    2,
    2,
    '{"vc_name":"프라이머"}'
  );

INSERT INTO investors (
  investor_id,
  investor_name,
  normalized_name,
  investor_type,
  tips_operator_status,
  latest_evidence_at,
  trust_level
) VALUES
  ('inv_primer', '프라이머', '프라이머', 'AC', 'operator_candidate', '2026-07-04T00:02:00Z', 'official_snapshot'),
  ('inv_bass', '베이스벤처스', '베이스벤처스', 'VC', 'unknown', '2026-07-04T00:00:00Z', 'official_snapshot');

INSERT INTO investor_aliases (
  alias_id,
  investor_id,
  alias,
  normalized_alias,
  confidence
) VALUES
  ('alias_primer_en', 'inv_primer', 'Primer', 'primer', 'high'),
  ('alias_bass_en', 'inv_bass', 'Bass Ventures', 'bassventures', 'high');

INSERT INTO funds (
  fund_id,
  fund_name,
  normalized_fund_name,
  fund_type,
  formed_date,
  expiry_date,
  committed_amount_krw,
  invested_amount_krw,
  investment_purpose,
  trust_level,
  latest_evidence_at
) VALUES
  (
    'fund_primer_seed_ai',
    '프라이머 초기 AI SaaS 펀드',
    '프라이머초기aisaas펀드',
    '벤처투자조합',
    '2026-04-01',
    '2034-03-31',
    30000000000,
    6000000000,
    'AI SaaS 초기기업 Seed Pre-A 투자',
    'official_snapshot',
    '2026-07-04T00:02:00Z'
  ),
  (
    'fund_bass_b2b_seed',
    '베이스 B2B SaaS 시드 펀드',
    '베이스b2bsaas시드펀드',
    '벤처투자조합',
    '2025-11-20',
    '2033-11-19',
    45000000000,
    12000000000,
    'B2B SaaS 초기기업 Seed 투자',
    'official_snapshot',
    '2026-07-04T00:00:00Z'
  );

INSERT INTO fund_operator_links (
  link_id,
  fund_id,
  investor_id,
  role,
  source_snapshot_id,
  source_artifact_id,
  confidence
) VALUES
  ('link_primer_seed_ai', 'fund_primer_seed_ai', 'inv_primer', 'operator', 'snap_kvca_primer', 'artifact_kvca_primer', 'high'),
  ('link_bass_b2b_seed', 'fund_bass_b2b_seed', 'inv_bass', 'operator', 'snap_kvic_seed_ai', 'artifact_kvic_seed_ai', 'high');

INSERT INTO fund_investment_focus (
  focus_id,
  fund_id,
  category_code,
  subcategory_code,
  category_name,
  subcategory_name,
  sector_keyword,
  startup_stage,
  region,
  source_snapshot_id,
  confidence
) VALUES
  ('focus_primer_seed_ai', 'fund_primer_seed_ai', 'AA', 'AA02', '창업초기', '초기기업', 'AI SaaS', 'seed pre_a', 'Korea', 'snap_kvic_seed_ai', 'high'),
  ('focus_bass_b2b_seed', 'fund_bass_b2b_seed', 'AA', 'AA02', '창업초기', '초기기업', 'B2B SaaS', 'seed', 'Korea', 'snap_kvic_seed_ai', 'high');

INSERT INTO documents (
  document_id,
  source_id,
  artifact_id,
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
) VALUES
  (
    'doc_founder_seed_guide',
    'founder_guide_library',
    NULL,
    '초기 스타트업 투자유치 가이드',
    'founder_education',
    'KVIC',
    'https://www.kvic.or.kr/upload/investment/20210114/20210114155945_63291.pdf',
    '2021-01-14',
    'seed-fundraising-guide.pdf',
    'pdf',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'fixture://seed-fundraising-guide.pdf',
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
) VALUES
  (
    'chunk_seed_meeting_prep',
    'doc_founder_seed_guide',
    1,
    'Seed 투자 미팅 준비',
    'Seed Pre-A 투자 미팅 전에는 팀, 문제, 시장, 초기 고객 증거, 사용 지표, 자금 사용 계획, 후속 자료를 준비한다.',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'seed',
    'meeting_prep,seed,pre_a,checklist'
  );

"""Add HNSW vector indexes, GIN indexes, pg_trgm, and remaining constraints

Revision ID: 012_indexes
Revises: 011_eval
Create Date: 2026-09-16
"""
from alembic import op

revision = '012_indexes'
down_revision = '011_eval'
branch_labels = None
depends_on = None

def upgrade():
    op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm')
    
    # HNSW vector indexes for ANN search
    op.execute("""
        CREATE INDEX ix_report_embeddings_hnsw ON report_embeddings
            USING hnsw (embedding vector_cosine_ops)
            WITH (m = 16, ef_construction = 64);
    """)
    
    op.execute("""
        CREATE INDEX ix_knowledge_embeddings_hnsw ON knowledge_embeddings
            USING hnsw (embedding vector_cosine_ops)
            WITH (m = 16, ef_construction = 64);
    """)
    
    # GIN trigram indexes for text search
    op.execute("""
        CREATE INDEX ix_reports_text_trgm ON reports
            USING gin (report_text gin_trgm_ops);
    """)
    
    op.execute("""
        CREATE INDEX ix_reports_cleaned_text_trgm ON reports
            USING gin (cleaned_text gin_trgm_ops);
    """)
    
    # GIN indexes on JSONB columns
    op.execute('CREATE INDEX ix_patterns_evidence_gin ON patterns USING gin (evidence)')
    op.execute('CREATE INDEX ix_assets_metadata_gin ON assets USING gin (metadata)')
    op.execute('CREATE INDEX ix_ruleset_weights_gin ON ruleset_versions USING gin (weights)')
    op.execute('CREATE INDEX ix_ruleset_thresholds_gin ON ruleset_versions USING gin (thresholds)')
    
    # Join table reverse-lookup indexes
    op.execute('CREATE INDEX ix_report_energy_sources_energy ON report_energy_sources(energy_source_id)')
    op.execute('CREATE INDEX ix_report_barriers_barrier ON report_barriers(barrier_id)')
    op.execute('CREATE INDEX ix_report_iogp_rules_rule ON report_iogp_rules(iogp_rule_id)')
    op.execute('CREATE INDEX ix_report_oisd_refs_ref ON report_oisd_references(oisd_reference_id)')

def downgrade():
    op.execute('DROP INDEX IF EXISTS ix_report_oisd_refs_ref')
    op.execute('DROP INDEX IF EXISTS ix_report_iogp_rules_rule')
    op.execute('DROP INDEX IF EXISTS ix_report_barriers_barrier')
    op.execute('DROP INDEX IF EXISTS ix_report_energy_sources_energy')
    op.execute('DROP INDEX IF EXISTS ix_ruleset_thresholds_gin')
    op.execute('DROP INDEX IF EXISTS ix_ruleset_weights_gin')
    op.execute('DROP INDEX IF EXISTS ix_assets_metadata_gin')
    op.execute('DROP INDEX IF EXISTS ix_patterns_evidence_gin')
    op.execute('DROP INDEX IF EXISTS ix_reports_cleaned_text_trgm')
    op.execute('DROP INDEX IF EXISTS ix_reports_text_trgm')
    op.execute('DROP INDEX IF EXISTS ix_knowledge_embeddings_hnsw')
    op.execute('DROP INDEX IF EXISTS ix_report_embeddings_hnsw')

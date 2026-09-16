"""Extend patterns, create sweep_runs

Revision ID: 009_patterns
Revises: 008_alerts
Create Date: 2026-09-16
"""
from alembic import op

revision = '009_patterns'
down_revision = '008_alerts'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        ALTER TABLE patterns
            ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
            ADD COLUMN asset_uuid UUID REFERENCES assets(id) ON DELETE SET NULL,
            ADD COLUMN shared_energy_type energy_type,
            ADD COLUMN ruleset_version_id UUID REFERENCES ruleset_versions(id) ON DELETE RESTRICT;
        
        -- Cast pattern_type to ENUM
        UPDATE patterns SET pattern_type = 'RECURRING' WHERE pattern_type NOT IN ('RECURRING', 'EMERGING', 'COMPOUNDING', 'SYSTEMIC');
        ALTER TABLE patterns ALTER COLUMN pattern_type TYPE pattern_type USING pattern_type::pattern_type;
        
        -- Cast priority to ENUM
        UPDATE patterns SET priority = 'MEDIUM' WHERE priority NOT IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
        ALTER TABLE patterns ALTER COLUMN priority TYPE pattern_priority USING priority::pattern_priority;
        
        COMMENT ON TABLE patterns IS 'Tier-2 safety patterns discovered by semantic clustering and LLM reasoning.';
        
        CREATE INDEX ix_patterns_pattern_type ON patterns(pattern_type);
        CREATE INDEX ix_patterns_priority ON patterns(priority);
        CREATE INDEX ix_patterns_last_seen_desc ON patterns(last_seen DESC);
        CREATE INDEX ix_patterns_asset_uuid ON patterns(asset_uuid);
        CREATE INDEX ix_patterns_location_id ON patterns(location_id);
    """)
    
    # Add CHECK on pattern_reports
    op.execute("""
        ALTER TABLE pattern_reports
            ADD CONSTRAINT chk_similarity_score CHECK (similarity_score >= 0 AND similarity_score <= 1);
    """)
    
    # Create sweep_runs
    op.execute("""
        CREATE TABLE sweep_runs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            params JSONB,
            ruleset_version_id UUID REFERENCES ruleset_versions(id) ON DELETE RESTRICT,
            candidates INTEGER,
            clusters_found INTEGER,
            patterns_created INTEGER,
            started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            finished_at TIMESTAMPTZ,
            status VARCHAR NOT NULL DEFAULT 'RUNNING',
            triggered_by VARCHAR
        );
        COMMENT ON TABLE sweep_runs IS 'Audit trail for each Tier-2 pattern sweep execution.';
    """)

def downgrade():
    op.execute('DROP TABLE IF EXISTS sweep_runs')
    op.execute('ALTER TABLE pattern_reports DROP CONSTRAINT IF EXISTS chk_similarity_score')
    op.execute("""
        DROP INDEX IF EXISTS ix_patterns_location_id;
        DROP INDEX IF EXISTS ix_patterns_asset_uuid;
        DROP INDEX IF EXISTS ix_patterns_last_seen_desc;
        DROP INDEX IF EXISTS ix_patterns_priority;
        DROP INDEX IF EXISTS ix_patterns_pattern_type;
        ALTER TABLE patterns ALTER COLUMN priority TYPE VARCHAR(20);
        ALTER TABLE patterns ALTER COLUMN pattern_type TYPE VARCHAR(100);
        ALTER TABLE patterns
            DROP COLUMN IF EXISTS ruleset_version_id,
            DROP COLUMN IF EXISTS shared_energy_type,
            DROP COLUMN IF EXISTS asset_uuid,
            DROP COLUMN IF EXISTS location_id,
            DROP COLUMN IF EXISTS org_id;
    """)

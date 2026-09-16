"""Extend reports and analysis, create extraction and join tables

Revision ID: 006_reports
Revises: 005_locations
Create Date: 2026-09-16
"""
from alembic import op

revision = '006_reports'
down_revision = '005_locations'
branch_labels = None
depends_on = None

def upgrade():
    # --- Extend reports table (keep legacy columns) ---
    op.execute("""
        ALTER TABLE reports
            ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            ADD COLUMN cleaned_text TEXT,
            ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
            ADD COLUMN asset_uuid UUID REFERENCES assets(id) ON DELETE SET NULL,
            ADD COLUMN reporter_name VARCHAR,
            ADD COLUMN reporter_role VARCHAR,
            ADD COLUMN is_synthetic BOOLEAN NOT NULL DEFAULT false,
            ADD COLUMN source VARCHAR;
        
        -- Cast report_type VARCHAR -> report_type ENUM
        -- First map existing values  
        UPDATE reports SET report_type = 'UNSAFE_ACT' WHERE report_type = 'UNSAFE_ACT';
        UPDATE reports SET report_type = 'UNSAFE_CONDITION' WHERE report_type = 'UNSAFE_CONDITION';
        UPDATE reports SET report_type = 'NEAR_MISS' WHERE report_type = 'NEAR_MISS';
        UPDATE reports SET report_type = 'SAFETY_OBSERVATION' WHERE report_type NOT IN ('UNSAFE_ACT', 'UNSAFE_CONDITION', 'NEAR_MISS', 'SAFETY_OBSERVATION', 'INCIDENT', 'HIPO_NEAR_MISS');
        ALTER TABLE reports ALTER COLUMN report_type TYPE report_type USING report_type::report_type;
        
        -- Cast status VARCHAR -> report_status ENUM
        UPDATE reports SET status = 'PENDING' WHERE status NOT IN ('PENDING', 'ANALYZED', 'REVIEW', 'CLOSED');
        ALTER TABLE reports ALTER COLUMN status TYPE report_status USING status::report_status;
        
        COMMENT ON TABLE reports IS 'Safety reports submitted by field personnel.';
        
        CREATE INDEX ix_reports_org_id ON reports(org_id);
        CREATE INDEX ix_reports_created_at_desc ON reports(created_at DESC);
        CREATE INDEX ix_reports_status ON reports(status);
        CREATE INDEX ix_reports_report_type ON reports(report_type);
        CREATE INDEX ix_reports_asset_uuid ON reports(asset_uuid);
        CREATE INDEX ix_reports_location_id ON reports(location_id);
        CREATE INDEX ix_reports_status_review ON reports(status) WHERE status = 'REVIEW';
    """)
    
    # --- Extend report_analysis ---
    op.execute("""
        ALTER TABLE report_analysis
            ADD COLUMN high_energy_present BOOLEAN,
            ADD COLUMN person_in_danger_zone BOOLEAN,
            ADD COLUMN barrier_compromised BOOLEAN,
            ADD COLUMN sif_classification sif_classification,
            ADD COLUMN escalation_level escalation_level,
            ADD COLUMN ruleset_version_id UUID REFERENCES ruleset_versions(id) ON DELETE RESTRICT;
        
        -- Cast severity VARCHAR -> severity ENUM
        UPDATE report_analysis SET severity = 'MEDIUM' WHERE severity IS NOT NULL AND severity NOT IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
        ALTER TABLE report_analysis ALTER COLUMN severity TYPE severity USING severity::severity;
        
        -- Add constraints
        ALTER TABLE report_analysis ADD CONSTRAINT chk_risk_score_range CHECK (risk_score >= 0 AND risk_score <= 100);
        ALTER TABLE report_analysis ADD CONSTRAINT chk_confidence_range CHECK (confidence >= 0 AND confidence <= 1);
        
        COMMENT ON TABLE report_analysis IS 'SIF classification and deterministic risk analysis for reports.';
        COMMENT ON COLUMN report_analysis.high_energy_present IS 'Factor 1 of the three-factor SIF test.';
        COMMENT ON COLUMN report_analysis.person_in_danger_zone IS 'Factor 2: person in line of fire.';
        COMMENT ON COLUMN report_analysis.barrier_compromised IS 'Factor 3: barrier degraded/missing/bypassed/failed.';
        
        CREATE INDEX ix_report_analysis_escalation ON report_analysis(escalation_level);
        CREATE INDEX ix_report_analysis_sif ON report_analysis(sif_classification);
        CREATE INDEX ix_report_analysis_risk_score ON report_analysis(risk_score);
    """)
    
    # --- Report extractions (new) ---
    op.execute("""
        CREATE TABLE report_extractions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            report_id UUID NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
            pass_a_json JSONB NOT NULL,
            pass_b_json JSONB,
            rag_chunk_ids UUID[],
            llm_invocation_id UUID,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        COMMENT ON TABLE report_extractions IS 'Raw LLM extraction passes for audit trail. Pass A = structured extraction, Pass B = gated SIF reasoning.';
    """)
    
    # --- Join tables (multi-valued relationships) ---
    op.execute("""
        CREATE TABLE report_energy_sources (
            report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
            energy_source_id UUID NOT NULL REFERENCES energy_sources(id) ON DELETE RESTRICT,
            magnitude VARCHAR,
            is_high_energy BOOLEAN,
            PRIMARY KEY (report_id, energy_source_id)
        );
        COMMENT ON TABLE report_energy_sources IS 'Multi-valued: energy sources identified in a report.';
    """)
    
    op.execute("""
        CREATE TABLE report_barriers (
            report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
            barrier_id UUID NOT NULL REFERENCES barriers(id) ON DELETE RESTRICT,
            status barrier_status NOT NULL,
            PRIMARY KEY (report_id, barrier_id)
        );
        COMMENT ON TABLE report_barriers IS 'Multi-valued: barriers and their status per report.';
    """)
    
    op.execute("""
        CREATE TABLE report_iogp_rules (
            report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
            iogp_rule_id UUID NOT NULL REFERENCES iogp_rules(id) ON DELETE RESTRICT,
            PRIMARY KEY (report_id, iogp_rule_id)
        );
        COMMENT ON TABLE report_iogp_rules IS 'Multi-valued: IOGP Life-Saving Rules mapped to a report.';
    """)
    
    op.execute("""
        CREATE TABLE report_oisd_references (
            report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
            oisd_reference_id UUID NOT NULL REFERENCES oisd_references(id) ON DELETE RESTRICT,
            is_hipo BOOLEAN NOT NULL DEFAULT false,
            PRIMARY KEY (report_id, oisd_reference_id)
        );
        COMMENT ON TABLE report_oisd_references IS 'Multi-valued: OISD standard references and Hi-Po flag per report.';
    """)

def downgrade():
    op.execute('DROP TABLE IF EXISTS report_oisd_references')
    op.execute('DROP TABLE IF EXISTS report_iogp_rules')
    op.execute('DROP TABLE IF EXISTS report_barriers')
    op.execute('DROP TABLE IF EXISTS report_energy_sources')
    op.execute('DROP TABLE IF EXISTS report_extractions')
    
    op.execute("""
        DROP INDEX IF EXISTS ix_report_analysis_risk_score;
        DROP INDEX IF EXISTS ix_report_analysis_sif;
        DROP INDEX IF EXISTS ix_report_analysis_escalation;
        ALTER TABLE report_analysis
            DROP CONSTRAINT IF EXISTS chk_confidence_range,
            DROP CONSTRAINT IF EXISTS chk_risk_score_range,
            DROP COLUMN IF EXISTS ruleset_version_id,
            DROP COLUMN IF EXISTS escalation_level,
            DROP COLUMN IF EXISTS sif_classification,
            DROP COLUMN IF EXISTS barrier_compromised,
            DROP COLUMN IF EXISTS person_in_danger_zone,
            DROP COLUMN IF EXISTS high_energy_present;
        ALTER TABLE report_analysis ALTER COLUMN severity TYPE VARCHAR(20);
    """)
    
    op.execute("""
        DROP INDEX IF EXISTS ix_reports_status_review;
        DROP INDEX IF EXISTS ix_reports_location_id;
        DROP INDEX IF EXISTS ix_reports_asset_uuid;
        DROP INDEX IF EXISTS ix_reports_report_type;
        DROP INDEX IF EXISTS ix_reports_status;
        DROP INDEX IF EXISTS ix_reports_created_at_desc;
        DROP INDEX IF EXISTS ix_reports_org_id;
        ALTER TABLE reports ALTER COLUMN status TYPE VARCHAR(50);
        ALTER TABLE reports ALTER COLUMN report_type TYPE VARCHAR(50);
        ALTER TABLE reports
            DROP COLUMN IF EXISTS source,
            DROP COLUMN IF EXISTS is_synthetic,
            DROP COLUMN IF EXISTS reporter_role,
            DROP COLUMN IF EXISTS reporter_name,
            DROP COLUMN IF EXISTS asset_uuid,
            DROP COLUMN IF EXISTS location_id,
            DROP COLUMN IF EXISTS cleaned_text,
            DROP COLUMN IF EXISTS org_id;
    """)

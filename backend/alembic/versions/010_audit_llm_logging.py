"""Create audit_logs and llm_invocations tables (append-only)

Revision ID: 010_audit
Revises: 009_patterns
Create Date: 2026-09-16
"""
from alembic import op

revision = '010_audit'
down_revision = '009_patterns'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        CREATE TABLE audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            actor_id UUID,
            actor_role VARCHAR,
            action VARCHAR NOT NULL,
            entity_type VARCHAR NOT NULL,
            entity_id VARCHAR NOT NULL,
            before JSONB,
            after JSONB,
            ruleset_version_id UUID,
            request_id VARCHAR,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        COMMENT ON TABLE audit_logs IS 'Append-only audit trail. No UPDATE/DELETE allowed.';
        
        CREATE INDEX ix_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
        
        -- Prevent UPDATE/DELETE on audit_logs
        CREATE OR REPLACE FUNCTION prevent_audit_modification()
        RETURNS TRIGGER AS $$
        BEGIN
            RAISE EXCEPTION 'audit_logs is append-only. UPDATE and DELETE are not permitted.';
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE TRIGGER trg_audit_logs_no_update
            BEFORE UPDATE ON audit_logs
            FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
        
        CREATE TRIGGER trg_audit_logs_no_delete
            BEFORE DELETE ON audit_logs
            FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
    """)
    
    op.execute("""
        CREATE TABLE llm_invocations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
            provider VARCHAR NOT NULL,
            model VARCHAR NOT NULL,
            purpose VARCHAR NOT NULL,
            prompt_hash VARCHAR,
            prompt_tokens INTEGER,
            completion_tokens INTEGER,
            latency_ms INTEGER,
            cost_estimate DOUBLE PRECISION,
            status VARCHAR NOT NULL,
            fallback_used BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        COMMENT ON TABLE llm_invocations IS 'Append-only log of every LLM/embedding API call for cost tracking and audit.';
        COMMENT ON COLUMN llm_invocations.purpose IS 'EXTRACT_A, EXTRACT_B, PATTERN, EMBED';
        
        CREATE INDEX ix_llm_invocations_report_id ON llm_invocations(report_id);
        CREATE INDEX ix_llm_invocations_created_at_desc ON llm_invocations(created_at DESC);
        
        -- Prevent UPDATE/DELETE on llm_invocations
        CREATE TRIGGER trg_llm_invocations_no_update
            BEFORE UPDATE ON llm_invocations
            FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
        
        CREATE TRIGGER trg_llm_invocations_no_delete
            BEFORE DELETE ON llm_invocations
            FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
    """)
    
    # Now wire report_extractions FK to llm_invocations
    op.execute("""
        ALTER TABLE report_extractions
            ADD CONSTRAINT fk_extraction_llm_invocation
            FOREIGN KEY (llm_invocation_id) REFERENCES llm_invocations(id) ON DELETE SET NULL;
    """)

def downgrade():
    op.execute('ALTER TABLE report_extractions DROP CONSTRAINT IF EXISTS fk_extraction_llm_invocation')
    op.execute('DROP TRIGGER IF EXISTS trg_llm_invocations_no_delete ON llm_invocations')
    op.execute('DROP TRIGGER IF EXISTS trg_llm_invocations_no_update ON llm_invocations')
    op.execute('DROP TABLE IF EXISTS llm_invocations')
    op.execute('DROP TRIGGER IF EXISTS trg_audit_logs_no_delete ON audit_logs')
    op.execute('DROP TRIGGER IF EXISTS trg_audit_logs_no_update ON audit_logs')
    op.execute('DROP TABLE IF EXISTS audit_logs')
    op.execute('DROP FUNCTION IF EXISTS prevent_audit_modification()')

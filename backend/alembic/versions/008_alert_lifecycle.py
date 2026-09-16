"""Extend alerts with lifecycle status, create alert_events

Revision ID: 008_alerts
Revises: 007_embeddings
Create Date: 2026-09-16
"""
from alembic import op

revision = '008_alerts'
down_revision = '007_embeddings'
branch_labels = None
depends_on = None

def upgrade():
    # Extend alerts
    op.execute("""
        ALTER TABLE alerts
            ADD COLUMN status alert_status DEFAULT 'OPEN',
            ADD COLUMN source alert_source,
            ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            ADD COLUMN assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
            ADD COLUMN sla_due_at TIMESTAMPTZ,
            ADD COLUMN acknowledged_at TIMESTAMPTZ,
            ADD COLUMN escalated_at TIMESTAMPTZ,
            ADD COLUMN closed_at TIMESTAMPTZ;
        
        -- Migrate existing is_read data
        UPDATE alerts SET status = 'CLOSED' WHERE is_read = true;
        UPDATE alerts SET status = 'OPEN' WHERE is_read = false OR is_read IS NULL;
        
        -- Set source based on existing data
        UPDATE alerts SET source = 'REPORT' WHERE report_id IS NOT NULL;
        UPDATE alerts SET source = 'PATTERN' WHERE pattern_id IS NOT NULL AND report_id IS NULL;
        
        -- Cast severity to enum
        UPDATE alerts SET severity = 'MEDIUM' WHERE severity NOT IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
        ALTER TABLE alerts ALTER COLUMN severity TYPE severity USING severity::severity;
        
        -- Drop legacy columns
        ALTER TABLE alerts DROP COLUMN IF EXISTS is_read;
        ALTER TABLE alerts DROP COLUMN IF EXISTS alert_type;
        
        COMMENT ON TABLE alerts IS 'Operational alerts with lifecycle tracking and SLA timers.';
        
        CREATE INDEX ix_alerts_status ON alerts(status);
        CREATE INDEX ix_alerts_assignee ON alerts(assignee_id);
        CREATE INDEX ix_alerts_created_at_desc ON alerts(created_at DESC);
        CREATE INDEX ix_alerts_severity ON alerts(severity);
    """)
    
    # Alert events (lifecycle audit)
    op.execute("""
        CREATE TABLE alert_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
            from_status alert_status,
            to_status alert_status NOT NULL,
            actor_id UUID REFERENCES users(id),
            note TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        COMMENT ON TABLE alert_events IS 'Audit trail for alert lifecycle transitions.';
        CREATE INDEX ix_alert_events_alert_id ON alert_events(alert_id);
    """)

def downgrade():
    op.execute('DROP TABLE IF EXISTS alert_events')
    op.execute("""
        DROP INDEX IF EXISTS ix_alerts_severity;
        DROP INDEX IF EXISTS ix_alerts_created_at_desc;
        DROP INDEX IF EXISTS ix_alerts_assignee;
        DROP INDEX IF EXISTS ix_alerts_status;
        ALTER TABLE alerts
            ADD COLUMN is_read BOOLEAN DEFAULT false,
            ADD COLUMN alert_type VARCHAR(50);
        UPDATE alerts SET is_read = true WHERE status IN ('CLOSED', 'DISMISSED');
        UPDATE alerts SET is_read = false WHERE status NOT IN ('CLOSED', 'DISMISSED');
        ALTER TABLE alerts ALTER COLUMN severity TYPE VARCHAR(20);
        ALTER TABLE alerts
            DROP COLUMN IF EXISTS closed_at,
            DROP COLUMN IF EXISTS escalated_at,
            DROP COLUMN IF EXISTS acknowledged_at,
            DROP COLUMN IF EXISTS sla_due_at,
            DROP COLUMN IF EXISTS assignee_id,
            DROP COLUMN IF EXISTS org_id,
            DROP COLUMN IF EXISTS source,
            DROP COLUMN IF EXISTS status;
    """)

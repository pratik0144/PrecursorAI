"""Enable Row-Level Security on all org_id-scoped tables

Revision ID: 013_rls
Revises: 012_indexes
Create Date: 2026-09-16

RLS uses app-managed GUC: backend sets SET LOCAL app.current_org and app.current_role
per transaction. Policies filter by current_setting('app.current_org').
"""
from alembic import op

revision = '013_rls'
down_revision = '012_indexes'
branch_labels = None
depends_on = None

# Tables that have org_id and need RLS
ORG_SCOPED_TABLES = [
    'users', 'reports', 'report_analysis', 'report_extractions',
    'locations', 'assets', 'patterns', 'alerts', 'alert_events',
    'audit_logs', 'llm_invocations', 'sweep_runs',
]

def upgrade():
    # Enable RLS on all org-scoped tables
    for table in ORG_SCOPED_TABLES:
        op.execute(f'ALTER TABLE {table} ENABLE ROW LEVEL SECURITY')
    
    # Read policy: users can only see rows from their org
    for table in ORG_SCOPED_TABLES:
        op.execute(f"""
            CREATE POLICY {table}_org_isolation ON {table}
                FOR ALL
                USING (org_id::text = current_setting('app.current_org', true))
                WITH CHECK (org_id::text = current_setting('app.current_org', true));
        """)
    
    # Audit tables: read-only for ADMIN/CORPORATE_LEADERSHIP
    op.execute("""
        CREATE POLICY audit_logs_admin_read ON audit_logs
            FOR SELECT
            USING (
                current_setting('app.current_role', true) IN ('ADMIN', 'CORPORATE_LEADERSHIP')
                AND org_id::text = current_setting('app.current_org', true)
            );
    """)
    
    op.execute("""
        CREATE POLICY llm_invocations_admin_read ON llm_invocations
            FOR SELECT
            USING (
                current_setting('app.current_role', true) IN ('ADMIN', 'CORPORATE_LEADERSHIP')
                AND org_id::text = current_setting('app.current_org', true)
            );
    """)
    
    # Alert transitions: only HSSE_OFFICER/ADMIN can escalate/close
    op.execute("""
        CREATE POLICY alerts_write_restricted ON alerts
            FOR UPDATE
            USING (
                current_setting('app.current_role', true) IN ('HSSE_OFFICER', 'ADMIN', 'SITE_MANAGER')
                AND org_id::text = current_setting('app.current_org', true)
            )
            WITH CHECK (
                current_setting('app.current_role', true) IN ('HSSE_OFFICER', 'ADMIN', 'SITE_MANAGER')
                AND org_id::text = current_setting('app.current_org', true)
            );
    """)
    
    # Reference tables (no org_id) - allow read for all authenticated
    for ref_table in ['iogp_rules', 'oisd_references', 'energy_sources', 'barriers', 'ruleset_versions']:
        op.execute(f'ALTER TABLE {ref_table} ENABLE ROW LEVEL SECURITY')
        op.execute(f"""
            CREATE POLICY {ref_table}_read_all ON {ref_table}
                FOR SELECT USING (true);
        """)
        op.execute(f"""
            CREATE POLICY {ref_table}_admin_write ON {ref_table}
                FOR ALL
                USING (current_setting('app.current_role', true) = 'ADMIN')
                WITH CHECK (current_setting('app.current_role', true) = 'ADMIN');
        """)

def downgrade():
    ref_tables = ['iogp_rules', 'oisd_references', 'energy_sources', 'barriers', 'ruleset_versions']
    for ref_table in ref_tables:
        op.execute(f'DROP POLICY IF EXISTS {ref_table}_admin_write ON {ref_table}')
        op.execute(f'DROP POLICY IF EXISTS {ref_table}_read_all ON {ref_table}')
        op.execute(f'ALTER TABLE {ref_table} DISABLE ROW LEVEL SECURITY')
    
    op.execute('DROP POLICY IF EXISTS alerts_write_restricted ON alerts')
    op.execute('DROP POLICY IF EXISTS llm_invocations_admin_read ON llm_invocations')
    op.execute('DROP POLICY IF EXISTS audit_logs_admin_read ON audit_logs')
    
    for table in reversed(ORG_SCOPED_TABLES):
        op.execute(f'DROP POLICY IF EXISTS {table}_org_isolation ON {table}')
        op.execute(f'ALTER TABLE {table} DISABLE ROW LEVEL SECURITY')

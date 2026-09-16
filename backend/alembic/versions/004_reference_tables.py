"""Create reference/taxonomy tables: IOGP rules, OISD refs, energy sources, barriers

Revision ID: 004_reference
Revises: 003_tenancy
Create Date: 2026-09-16
"""
from alembic import op

revision = '004_reference'
down_revision = '003_tenancy'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        CREATE TABLE iogp_rules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR NOT NULL UNIQUE,
            name VARCHAR NOT NULL,
            description TEXT NOT NULL,
            icon VARCHAR
        );
        COMMENT ON TABLE iogp_rules IS 'The 9 IOGP Life-Saving Rules reference table.';
        COMMENT ON COLUMN iogp_rules.code IS 'Unique identifier code, e.g. ENERGY_ISOLATION';
    """)
    
    op.execute("""
        CREATE TABLE oisd_references (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            standard_no VARCHAR NOT NULL UNIQUE,
            title VARCHAR NOT NULL,
            summary TEXT NOT NULL,
            concept_tag VARCHAR,
            url VARCHAR,
            verified BOOLEAN NOT NULL DEFAULT false
        );
        COMMENT ON TABLE oisd_references IS 'OISD standard references and safety concepts. verified=false until confirmed against official catalog.';
    """)
    
    op.execute("""
        CREATE TABLE energy_sources (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR NOT NULL UNIQUE,
            name VARCHAR NOT NULL,
            energy_type energy_type NOT NULL,
            typical_context VARCHAR,
            is_high_energy BOOLEAN NOT NULL DEFAULT false,
            threshold_joules FLOAT
        );
        COMMENT ON TABLE energy_sources IS 'Energy source taxonomy for oil and gas operations.';
        COMMENT ON COLUMN energy_sources.is_high_energy IS 'True if energy ≥1500J threshold (Hallowell/CSRA).';
    """)
    
    op.execute("""
        CREATE TABLE barriers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR NOT NULL UNIQUE,
            name VARCHAR NOT NULL,
            description TEXT NOT NULL,
            is_direct_control BOOLEAN NOT NULL DEFAULT false,
            related_energy_type energy_type
        );
        COMMENT ON TABLE barriers IS 'Barrier and safety control catalog (EEI-SCL direct controls marked).';
        COMMENT ON COLUMN barriers.is_direct_control IS 'EEI Safety Classification & Learning direct control flag.';
    """)

def downgrade():
    op.execute('DROP TABLE IF EXISTS barriers')
    op.execute('DROP TABLE IF EXISTS energy_sources')
    op.execute('DROP TABLE IF EXISTS oisd_references')
    op.execute('DROP TABLE IF EXISTS iogp_rules')

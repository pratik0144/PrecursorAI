"""Create all PostgreSQL ENUM types

Revision ID: 002_enums
Revises: 001_initial
Create Date: 2026-09-16
"""
from alembic import op

revision = '002_enums'
down_revision = '001_initial'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS citext")
    
    op.execute("""
        CREATE TYPE user_role AS ENUM (
            'HSSE_OFFICER', 'SITE_MANAGER', 'OPS_MANAGER', 'CORPORATE_LEADERSHIP', 'ADMIN'
        )
    """)
    op.execute("""
        CREATE TYPE report_type AS ENUM (
            'SAFETY_OBSERVATION', 'NEAR_MISS', 'UNSAFE_ACT', 'UNSAFE_CONDITION', 'INCIDENT', 'HIPO_NEAR_MISS'
        )
    """)
    op.execute("""
        CREATE TYPE report_status AS ENUM ('PENDING', 'ANALYZED', 'REVIEW', 'CLOSED')
    """)
    op.execute("""
        CREATE TYPE energy_type AS ENUM (
            'GRAVITY', 'MOTION', 'MECHANICAL', 'ELECTRICAL', 'PRESSURE',
            'TEMPERATURE', 'CHEMICAL', 'RADIATION', 'FIRE_EXPLOSION', 'SOUND', 'BIOLOGICAL'
        )
    """)
    op.execute("""
        CREATE TYPE barrier_status AS ENUM (
            'INTACT', 'DEGRADED', 'MISSING', 'BYPASSED', 'FAILED', 'UNKNOWN'
        )
    """)
    op.execute("""
        CREATE TYPE sif_classification AS ENUM (
            'HSIF', 'PSIF', 'LSIF', 'CAPACITY', 'EXPOSURE', 'LOW_ENERGY', 'UNDETERMINED'
        )
    """)
    op.execute("""
        CREATE TYPE escalation_level AS ENUM ('CRITICAL', 'HIGH', 'REVIEW', 'ROUTINE')
    """)
    op.execute("""
        CREATE TYPE severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    """)
    op.execute("""
        CREATE TYPE pattern_type AS ENUM ('RECURRING', 'EMERGING', 'COMPOUNDING', 'SYSTEMIC')
    """)
    op.execute("""
        CREATE TYPE pattern_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    """)
    op.execute("""
        CREATE TYPE alert_status AS ENUM (
            'OPEN', 'ACKNOWLEDGED', 'IN_REVIEW', 'ESCALATED', 'CLOSED', 'DISMISSED'
        )
    """)
    op.execute("""
        CREATE TYPE alert_source AS ENUM ('REPORT', 'PATTERN')
    """)
    op.execute("""
        CREATE TYPE embedding_status AS ENUM ('OK', 'DEGRADED', 'PENDING')
    """)
    op.execute("""
        CREATE TYPE location_level AS ENUM ('WORLD', 'COUNTRY', 'REGION', 'FIELD', 'SITE')
    """)
    op.execute("""
        CREATE TYPE asset_type AS ENUM (
            'DRILLING_RIG', 'WORKOVER_RIG', 'WELLHEAD', 'BOP_WELL_CONTROL',
            'PRODUCTION_FIELD', 'COMPRESSOR_STATION', 'PUMPING_UNIT',
            'OIL_COLLECTION_STATION', 'GGS', 'PIPELINE'
        )
    """)

def downgrade():
    for t in ['asset_type', 'location_level', 'embedding_status', 'alert_source',
              'alert_status', 'pattern_priority', 'pattern_type', 'severity',
              'escalation_level', 'sif_classification', 'barrier_status',
              'energy_type', 'report_status', 'report_type', 'user_role']:
        op.execute(f'DROP TYPE IF EXISTS {t}')
    op.execute('DROP EXTENSION IF EXISTS citext')

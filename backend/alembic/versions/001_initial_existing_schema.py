"""Capture existing schema as baseline

Revision ID: 001_initial
Revises: None
Create Date: 2026-09-16
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')
    
    # Users table (original)
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='worker'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
    
    # Reports table (original)
    op.create_table(
        'reports',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('report_text', sa.Text, nullable=False),
        sa.Column('report_type', sa.String(50), nullable=False),
        sa.Column('asset_id', sa.String(100), nullable=True),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('submitted_by', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('status', sa.String(50), nullable=False, server_default='PENDING'),
    )
    
    # Report analysis (original)
    op.create_table(
        'report_analysis',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('report_id', UUID(as_uuid=True), sa.ForeignKey('reports.id'), nullable=False, unique=True),
        sa.Column('sif_potential', sa.Boolean, nullable=True),
        sa.Column('confidence', sa.Float, nullable=True),
        sa.Column('risk_score', sa.Integer, nullable=True),
        sa.Column('risk_level', sa.String(20), nullable=True),
        sa.Column('activity', sa.String(255), nullable=True),
        sa.Column('hazard', sa.String(255), nullable=True),
        sa.Column('energy_source', sa.String(255), nullable=True),
        sa.Column('barrier', sa.String(255), nullable=True),
        sa.Column('barrier_status', sa.String(50), nullable=True),
        sa.Column('iogp_rule', sa.String(255), nullable=True),
        sa.Column('severity', sa.String(20), nullable=True),
        sa.Column('rationale', sa.Text, nullable=True),
        sa.Column('requires_followup', sa.Boolean, nullable=True, server_default=sa.text('false')),
        sa.Column('followup_question', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
    
    # Report embeddings (original - 3072 dim)
    op.execute("""
        CREATE TABLE report_embeddings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            report_id UUID NOT NULL UNIQUE REFERENCES reports(id),
            embedding vector(3072) NOT NULL,
            model VARCHAR(100) NOT NULL DEFAULT 'gemini-embedding-001',
            created_at TIMESTAMPTZ DEFAULT now()
        )
    """)
    
    # Knowledge chunks (original)
    op.create_table(
        'knowledge_chunks',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('chunk_id', sa.String(255), unique=True, nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('chunk_text', sa.Text, nullable=False),
        sa.Column('source', sa.String(500), nullable=False),
    )
    
    # Knowledge embeddings (original - 3072 dim)
    op.execute("""
        CREATE TABLE knowledge_embeddings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            chunk_id VARCHAR(255) NOT NULL REFERENCES knowledge_chunks(chunk_id),
            embedding vector(3072) NOT NULL,
            model VARCHAR(100) NOT NULL DEFAULT 'gemini-embedding-001'
        )
    """)
    
    # Patterns (original)
    op.create_table(
        'patterns',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('pattern_type', sa.String(100), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('asset_id', sa.String(100), nullable=True),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('hazard', sa.String(255), nullable=True),
        sa.Column('barrier', sa.String(255), nullable=True),
        sa.Column('priority', sa.String(20), nullable=False, server_default='MEDIUM'),
        sa.Column('confidence', sa.Float, nullable=True),
        sa.Column('report_count', sa.Integer, nullable=False, server_default=sa.text('0')),
        sa.Column('first_seen', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_seen', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='ACTIVE'),
        sa.Column('evidence', JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
    
    # Pattern reports join (original)
    op.create_table(
        'pattern_reports',
        sa.Column('pattern_id', UUID(as_uuid=True), sa.ForeignKey('patterns.id'), primary_key=True),
        sa.Column('report_id', UUID(as_uuid=True), sa.ForeignKey('reports.id'), primary_key=True),
        sa.Column('similarity_score', sa.Float, nullable=True),
    )
    
    # Alerts (original)
    op.create_table(
        'alerts',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('report_id', UUID(as_uuid=True), sa.ForeignKey('reports.id'), nullable=True),
        sa.Column('pattern_id', UUID(as_uuid=True), sa.ForeignKey('patterns.id'), nullable=True),
        sa.Column('alert_type', sa.String(50), nullable=False),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('is_read', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

def downgrade():
    op.drop_table('alerts')
    op.drop_table('pattern_reports')
    op.drop_table('patterns')
    op.execute('DROP TABLE IF EXISTS knowledge_embeddings')
    op.drop_table('knowledge_chunks')
    op.execute('DROP TABLE IF EXISTS report_embeddings')
    op.drop_table('report_analysis')
    op.drop_table('reports')
    op.drop_table('users')

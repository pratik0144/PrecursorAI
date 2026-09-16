"""Create evaluation tables

Revision ID: 011_eval
Revises: 010_audit
Create Date: 2026-09-16
"""
from alembic import op

revision = '011_eval'
down_revision = '010_audit'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        CREATE TABLE eval_examples (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            narrative TEXT NOT NULL,
            source VARCHAR NOT NULL,
            gold_sif_classification VARCHAR NOT NULL,
            gold_iogp_rule_id UUID,
            gold_high_energy BOOLEAN NOT NULL,
            gold_barrier_status VARCHAR,
            notes TEXT,
            is_synthetic BOOLEAN NOT NULL DEFAULT false
        );
        COMMENT ON TABLE eval_examples IS 'Gold-standard labeled examples for evaluating pipeline accuracy.';
        COMMENT ON COLUMN eval_examples.source IS 'SYNTHETIC or OSHA';
    """)
    
    op.execute("""
        CREATE TABLE eval_runs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            ruleset_version_id UUID NOT NULL REFERENCES ruleset_versions(id) ON DELETE CASCADE,
            model VARCHAR NOT NULL,
            precision DOUBLE PRECISION,
            recall DOUBLE PRECISION,
            f2 DOUBLE PRECISION,
            confusion JSONB,
            review_burden_estimate DOUBLE PRECISION,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        COMMENT ON TABLE eval_runs IS 'Evaluation run results against a ruleset version.';
        COMMENT ON COLUMN eval_runs.f2 IS 'F2 score (recall-weighted) per VelocityEHS precedent.';
    """)
    
    op.execute("""
        CREATE TABLE eval_results (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            eval_run_id UUID NOT NULL REFERENCES eval_runs(id) ON DELETE CASCADE,
            eval_example_id UUID NOT NULL REFERENCES eval_examples(id) ON DELETE CASCADE,
            predicted_json JSONB NOT NULL,
            correct BOOLEAN NOT NULL
        );
        COMMENT ON TABLE eval_results IS 'Per-example prediction results for an evaluation run.';
    """)

def downgrade():
    op.execute('DROP TABLE IF EXISTS eval_results')
    op.execute('DROP TABLE IF EXISTS eval_runs')
    op.execute('DROP TABLE IF EXISTS eval_examples')

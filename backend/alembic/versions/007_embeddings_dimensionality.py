"""Change embedding dimensionality from 3072 to 1536 (Option A: Matryoshka)

Revision ID: 007_embeddings
Revises: 006_reports
Create Date: 2026-09-16

NOTE: This changes the vector dimension from 3072 to 1536.
Existing embeddings will need to be re-generated via the backend backfill job.
Rows are preserved but their embedding column is set to NULL pending re-embedding.
"""
from alembic import op

revision = '007_embeddings'
down_revision = '006_reports'
branch_labels = None
depends_on = None

def upgrade():
    # --- Report embeddings: 3072 -> 1536 ---
    op.execute("""
        -- Add new columns
        ALTER TABLE report_embeddings
            ADD COLUMN dimension INTEGER,
            ADD COLUMN embedding_status embedding_status DEFAULT 'PENDING';
        
        -- Mark existing 3072-dim embeddings as needing re-embedding
        UPDATE report_embeddings SET dimension = 3072, embedding_status = 'PENDING';
        
        -- Change vector dimension: drop and recreate the column
        -- (pgvector doesn't support ALTER COLUMN TYPE for vector dimensions)
        ALTER TABLE report_embeddings 
            ALTER COLUMN embedding DROP NOT NULL;
        ALTER TABLE report_embeddings
            DROP COLUMN embedding;
        ALTER TABLE report_embeddings
            ADD COLUMN embedding vector(1536);
        
        -- Add unique constraint on (report_id, model)
        ALTER TABLE report_embeddings
            ADD CONSTRAINT uq_report_embeddings_report_model UNIQUE (report_id, model);
        -- Drop the old unique on just report_id (now can have multiple models)
        ALTER TABLE report_embeddings DROP CONSTRAINT IF EXISTS report_embeddings_report_id_key;
        
        COMMENT ON TABLE report_embeddings IS 'Vector embeddings for reports. Dimension 1536 via Matryoshka truncation (Option A).';
    """)
    
    # --- Knowledge embeddings: same change ---
    op.execute("""
        ALTER TABLE knowledge_embeddings
            ADD COLUMN dimension INTEGER,
            ADD COLUMN model_name VARCHAR;
        
        UPDATE knowledge_embeddings SET dimension = 3072;
        
        ALTER TABLE knowledge_embeddings
            DROP COLUMN embedding;
        ALTER TABLE knowledge_embeddings
            ADD COLUMN embedding vector(1536);
        
        COMMENT ON TABLE knowledge_embeddings IS 'Vector embeddings for knowledge/RAG chunks. Dimension 1536.';
    """)
    
    # --- Extend knowledge_chunks ---
    op.execute("""
        ALTER TABLE knowledge_chunks
            ADD COLUMN framework VARCHAR,
            ADD COLUMN section VARCHAR,
            ADD COLUMN token_count INTEGER;
        
        COMMENT ON COLUMN knowledge_chunks.framework IS 'Source framework: IOGP, OISD, EEI_SCL, DEKRA, ENERGY_BASED, OIL_SOP';
    """)

def downgrade():
    op.execute("""
        ALTER TABLE knowledge_chunks
            DROP COLUMN IF EXISTS token_count,
            DROP COLUMN IF EXISTS section,
            DROP COLUMN IF EXISTS framework;
    """)
    op.execute("""
        ALTER TABLE knowledge_embeddings
            DROP COLUMN IF EXISTS embedding,
            ADD COLUMN embedding vector(3072),
            DROP COLUMN IF EXISTS model_name,
            DROP COLUMN IF EXISTS dimension;
    """)
    op.execute("""
        ALTER TABLE report_embeddings
            DROP CONSTRAINT IF EXISTS uq_report_embeddings_report_model,
            DROP COLUMN IF EXISTS embedding,
            ADD COLUMN embedding vector(3072) NOT NULL,
            ADD CONSTRAINT report_embeddings_report_id_key UNIQUE (report_id),
            DROP COLUMN IF EXISTS embedding_status,
            DROP COLUMN IF EXISTS dimension;
    """)

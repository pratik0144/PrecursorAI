"""
scripts/ingest_knowledge.py — Load IOGP Life-Saving Rules and other approved
HSSE reference material into knowledge_chunks and generate embeddings.

Usage:
    python -m scripts.ingest_knowledge --source data/knowledge/iogp_lsr.pdf

Steps:
  1. Parse source document
  2. Chunk into sections
  3. Generate embedding per chunk (ai/embeddings.py)
  4. Upsert into knowledge_chunks and knowledge_embeddings tables
"""
# TODO: implement knowledge ingestion

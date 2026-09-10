"""
scripts/ingest_knowledge.py — ONE-OFF script to chunk PDFs and load them into
the knowledge_chunks + knowledge_embeddings tables for RAG retrieval.

!! NOT imported by any live application code !!
!! This file is .gitignored — do not commit !!

Usage (from c:\\PrecursorAI\\backend):
    python -m scripts.ingest_knowledge

Requirements:
  - PostgreSQL running with pgvector extension enabled
  - GEMINI_API_KEY set in backend/.env
  - PDFs present in data/knowledge/

What it does:
  1. Reads every .pdf in data/knowledge/
  2. Extracts text with pymupdf (fitz)
  3. Splits into ~300-word chunks with 50-word overlap
  4. Embeds each chunk via Gemini text-embedding-004 (768-dim)
  5. Upserts chunk text into knowledge_chunks
  6. Upserts embedding into knowledge_embeddings
  7. Skips chunks that already exist (idempotent)
"""

from __future__ import annotations

import asyncio
import hashlib
import os
import re
import sys
import time
from pathlib import Path
from typing import List

# Add project root to sys.path so imports work when run with -m
ROOT = Path(__file__).resolve().parents[2]     # c:\PrecursorAI
BACKEND = Path(__file__).resolve().parents[1]  # c:\PrecursorAI\backend
sys.path.insert(0, str(BACKEND))

import asyncpg
import pymupdf as fitz  # pymupdf (replaces deprecated 'import fitz')
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(BACKEND / ".env")

# ── Config ───────────────────────────────────────────────────────────────────

KNOWLEDGE_DIR  = ROOT / "data" / "knowledge"
DATABASE_URL   = os.environ["DATABASE_URL"]
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
EMBEDDING_MODEL = "models/gemini-embedding-001"

CHUNK_WORDS   = 300   # target words per chunk
OVERLAP_WORDS = 50    # word overlap between consecutive chunks
BATCH_SIZE    = 20    # chunks per Gemini embed_content call
BATCH_DELAY   = 1.0   # seconds between batch calls (rate-limit courtesy)
MAX_RETRIES   = 5     # exponential backoff attempts on 429

# ── Text helpers ─────────────────────────────────────────────────────────────

def _asyncpg_dsn(url: str) -> str:
    """Convert SQLAlchemy-style asyncpg URL to plain asyncpg DSN."""
    return url.replace("postgresql+asyncpg://", "postgresql://")


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract all text from a PDF using pymupdf."""
    doc = fitz.open(str(pdf_path))
    pages = [page.get_text("text") for page in doc]
    doc.close()
    raw = "\n".join(pages)
    raw = re.sub(r"[\r\f]", "\n", raw)
    raw = re.sub(r"\n{3,}", "\n\n", raw)
    raw = re.sub(r"[ \t]+", " ", raw)
    return raw.strip()


def chunk_text(text: str, chunk_words: int = CHUNK_WORDS, overlap_words: int = OVERLAP_WORDS) -> List[str]:
    """
    Split text into overlapping windows of ~chunk_words words.
    Overlap: the tail `overlap_words` words of chunk N become the head of chunk N+1.
    """
    words = text.split()
    chunks: List[str] = []
    start = 0
    while start < len(words):
        end = min(start + chunk_words, len(words))
        chunks.append(" ".join(words[start:end]).strip())
        if end == len(words):
            break
        start = end - overlap_words
    return [c for c in chunks if len(c) > 50]  # drop tiny trailing chunks


def make_chunk_id(source: str, index: int, chunk: str) -> str:
    """Deterministic 32-char ID based on source + index + chunk prefix."""
    key = f"{source}::{index}::{chunk[:100]}"
    return hashlib.sha256(key.encode()).hexdigest()[:32]


def embed_batch(texts: List[str]) -> List[List[float]]:
    """
    Embed a list of texts in a single Gemini call.
    Retries up to MAX_RETRIES times on 429 with exponential backoff.
    """
    for attempt in range(MAX_RETRIES):
        try:
            result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=texts,
                task_type="retrieval_document",
            )
            return result["embedding"]
        except Exception as e:
            if "429" in str(e) and attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt * 5  # 5s, 10s, 20s, 40s...
                print(f"\n  rate-limited, waiting {wait}s...", end=" ", flush=True)
                time.sleep(wait)
            else:
                raise
    raise RuntimeError("Max retries exceeded")


# ── DB helpers ────────────────────────────────────────────────────────────────

async def ensure_pgvector(conn: asyncpg.Connection):
    await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")


async def ensure_unique_index(conn: asyncpg.Connection):
    """Add UNIQUE constraint on knowledge_embeddings.chunk_id if missing."""
    await conn.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_indexes
                WHERE tablename = 'knowledge_embeddings'
                  AND indexname = 'uq_ke_chunk_id'
            ) THEN
                ALTER TABLE knowledge_embeddings
                ADD CONSTRAINT uq_ke_chunk_id UNIQUE (chunk_id);
            END IF;
        END
        $$;
    """)


async def upsert_chunk(conn, chunk_id, title, chunk_text, source) -> bool:
    """Returns True if newly inserted, False if already existed."""
    result = await conn.execute(
        """
        INSERT INTO knowledge_chunks (id, chunk_id, title, chunk_text, source)
        VALUES (gen_random_uuid(), $1, $2, $3, $4)
        ON CONFLICT (chunk_id) DO NOTHING
        """,
        chunk_id, title, chunk_text, source,
    )
    return result.endswith("1")


async def upsert_embedding(conn, chunk_id, embedding: List[float]):
    vec_str = "[" + ",".join(str(x) for x in embedding) + "]"
    await conn.execute(
        """
        INSERT INTO knowledge_embeddings (id, chunk_id, embedding, model)
        VALUES (gen_random_uuid(), $1, $2::vector, $3)
        ON CONFLICT (chunk_id) DO UPDATE
            SET embedding = EXCLUDED.embedding,
                model     = EXCLUDED.model
        """,
        chunk_id, vec_str, "gemini-embedding-001",
    )


# ── Ingestion loop ────────────────────────────────────────────────────────────

async def ingest_pdf(conn: asyncpg.Connection, pdf_path: Path):
    source_name = pdf_path.stem
    print(f"\n{'='*60}")
    print(f"  PDF: {pdf_path.name}")

    print("  -> Extracting text...", end=" ", flush=True)
    raw_text = extract_text_from_pdf(pdf_path)
    print(f"{len(raw_text.split()):,} words")

    chunks = chunk_text(raw_text)
    print(f"  -> {len(chunks)} chunks ({CHUNK_WORDS}-word windows, {OVERLAP_WORDS}-word overlap)")

    # --- Phase 1: upsert all chunk texts, collect those needing embeddings ---
    to_embed: List[tuple] = []   # (chunk_id, chunk_text)
    for i, chunk in enumerate(chunks):
        chunk_id = make_chunk_id(source_name, i, chunk)
        title = f"{source_name} — chunk {i+1}/{len(chunks)}"
        await upsert_chunk(conn, chunk_id, title, chunk, source_name)
        has_emb = await conn.fetchval(
            "SELECT 1 FROM knowledge_embeddings WHERE chunk_id = $1", chunk_id
        )
        if not has_emb:
            to_embed.append((chunk_id, chunk))

    skipped = len(chunks) - len(to_embed)
    print(f"  -> {skipped} already embedded, {len(to_embed)} need embedding")

    if not to_embed:
        print(f"  DONE: nothing to do")
        return

    # --- Phase 2: batch embed in groups of BATCH_SIZE ---
    embedded = 0
    failed = 0
    for batch_start in range(0, len(to_embed), BATCH_SIZE):
        batch = to_embed[batch_start: batch_start + BATCH_SIZE]
        batch_ids   = [b[0] for b in batch]
        batch_texts = [b[1] for b in batch]
        batch_num   = batch_start // BATCH_SIZE + 1
        total_batches = (len(to_embed) + BATCH_SIZE - 1) // BATCH_SIZE

        print(f"  batch {batch_num}/{total_batches} ({len(batch)} chunks)...", end=" ", flush=True)
        try:
            vectors = embed_batch(batch_texts)
            for chunk_id, vec in zip(batch_ids, vectors):
                await upsert_embedding(conn, chunk_id, vec)
            embedded += len(batch)
            print(f"done ({embedded}/{len(to_embed)} total)")
        except Exception as e:
            failed += len(batch)
            print(f"FAILED: {e}")

        time.sleep(BATCH_DELAY)

    print(f"  DONE: {embedded} embedded, {failed} failed, {skipped} already existed")



async def main():
    print("PrecursorAI — Knowledge Ingestion")
    print("=" * 60)

    genai.configure(api_key=GEMINI_API_KEY)
    print(f"Gemini ready ({EMBEDDING_MODEL})")

    pdfs = sorted(KNOWLEDGE_DIR.glob("*.pdf"))
    if not pdfs:
        print(f"No PDFs found in {KNOWLEDGE_DIR}")
        return
    print(f"Found {len(pdfs)} PDF(s): {[p.name for p in pdfs]}")

    dsn = _asyncpg_dsn(DATABASE_URL)
    conn = await asyncpg.connect(dsn)
    print("DB connected")

    try:
        await ensure_pgvector(conn)
        await ensure_unique_index(conn)
        for pdf_path in pdfs:
            await ingest_pdf(conn, pdf_path)

        total_c = await conn.fetchval("SELECT COUNT(*) FROM knowledge_chunks")
        total_e = await conn.fetchval("SELECT COUNT(*) FROM knowledge_embeddings")
        print(f"\n{'='*60}")
        print(f"knowledge_chunks:     {total_c} rows")
        print(f"knowledge_embeddings: {total_e} rows")
        print(f"RAG is ready.")
        print(f"{'='*60}\n")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())

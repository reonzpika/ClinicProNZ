#!/usr/bin/env python3
import json
import os
from pathlib import Path
from datetime import datetime

from llama_index.core import Document
from llama_index.core.node_parser import SemanticSplitterNodeParser
try:
    from llama_index.embeddings.openai import OpenAIEmbedding
except Exception:
    OpenAIEmbedding = None  # type: ignore

DATA_DIR = Path("data")
OUT_DIR = Path("data_chunks")

def load_items() -> list[dict]:
    items: list[dict] = []
    if not DATA_DIR.exists():
        print(f"[CHUNK] Data dir not found: {DATA_DIR}")
        return items
    for p in sorted(DATA_DIR.glob("*.json")):
        try:
            items.append(json.loads(p.read_text(encoding="utf-8")))
        except Exception as e:
            print(f"[CHUNK] Skip malformed {p.name}: {e}")
    return items

def coerce_date(meta: dict | None) -> str | None:
    if not meta:
        return None
    for key in ["crawledAt", "crawled_at", "lastModified", "date"]:
        val = meta.get(key)
        if not val:
            continue
        try:
            d = datetime.fromisoformat(str(val).replace("Z", "+00:00"))
            return d.isoformat()
        except Exception:
            continue
    return None

def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Reasonable defaults; adjust if needed
    embed_model = None
    if OpenAIEmbedding is not None:
        embed_model = OpenAIEmbedding(model="text-embedding-3-small")
    splitter = SemanticSplitterNodeParser.from_defaults(
        buffer_size=2,
        breakpoint_percentile_threshold=95,
        embed_model=embed_model,
    )

    items = load_items()
    print(f"[CHUNK] Loaded {len(items)} items from {DATA_DIR}")

    total_chunks = 0
    for item in items:
        url = item.get("url")
        title = item.get("title") or "Untitled"
        text = (item.get("markdown") or item.get("content") or "").strip()
        if not url or not text:
            continue

        meta = item.get("metadata") or {}
        last_updated = coerce_date(meta)

        doc = Document(text=text, metadata={"url": url, "title": title})
        nodes = splitter.get_nodes_from_documents([doc])

        # Write one file per chunk
        chunk_idx = 0
        for node in nodes:
            content = getattr(node, "text", None) or (node.get_content() if hasattr(node, "get_content") else "")
            if not content or not content.strip():
                continue
            out = {
                "url": url,
                "title": title,
                "content": content,
                "chunkIndex": chunk_idx,
                "metadata": {
                    "lastUpdated": last_updated,
                    "source": "healthify",
                },
            }
            safe_name = url.strip("/").replace("https://", "").replace("http://", "").replace("/", "-")
            out_path = OUT_DIR / f"{safe_name}-chunk-{chunk_idx}.json"
            out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
            chunk_idx += 1
            total_chunks += 1

    print(f"[CHUNK] Wrote {total_chunks} chunks into {OUT_DIR}")

if __name__ == "__main__":
    main()


import type { RagQueryResult } from './types';

export type SourceRef = { title: string; url: string };

export function clinicalSystemPrompt(): string {
  return `You are a clinical assistant for New Zealand GPs and healthcare professionals.

Instructions:
- Answer based ONLY on the provided context from NZ clinical guidance
- Render output as Markdown (headings, lists, bold where helpful)
- Always cite sources inline using exact source title and URL from context: [<exact title from context>](<exact URL>)
- End with a short "Sources" section listing each source as [Title](URL)
- If no relevant information is found, state this clearly
- Use NZ medical terminology and spelling; be concise but thorough; focus on evidence-based recommendations`;
}

function dedupeByUrl(items: SourceRef[], limit: number): SourceRef[] {
  const map = new Map<string, SourceRef>();
  for (const s of items) {
    if (!s.url) continue;
    if (!map.has(s.url)) map.set(s.url, { title: s.title || s.url, url: s.url });
  }
  return Array.from(map.values()).slice(0, limit);
}

export function sourcesFromRagResults(results: RagQueryResult[], limit: number = 8): SourceRef[] {
  const items: SourceRef[] = results.map((r) => ({ title: r.title, url: r.source }));
  return dedupeByUrl(items, limit);
}

export function sourcesFromLiNodes(nodes: any[], limit: number = 8): SourceRef[] {
  const items: SourceRef[] = nodes
    .map((n) => {
      const meta = n?.node?.metadata ?? n?.metadata ?? {};
      const url = String(meta.url || '') || '';
      const title = String(meta.title || '') || url || 'Untitled';
      return { title, url } as SourceRef;
    })
    .filter((s) => !!s.url);
  return dedupeByUrl(items, limit);
}

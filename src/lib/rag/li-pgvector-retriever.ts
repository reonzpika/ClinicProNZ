import type { RagQueryResult } from './types';
import { searchSimilarDocuments } from './index';

// We use LlamaIndex types dynamically to avoid build fragility across versions
type NodeWithScore = { node: any; score?: number };

function buildTextNodes(LI: any, results: RagQueryResult[]): NodeWithScore[] {
  return results.map((r) => {
    const text = `Title: ${r.title}\nURL: ${r.source}\n\n${r.content}`;
    const node = new LI.TextNode({ text, metadata: { url: r.source, title: r.title, sourceType: r.sourceType } });
    return { node, score: r.score } as NodeWithScore;
  });
}

export function createPgVectorRetriever(params?: { topK?: number; threshold?: number }) {
  const topK = params?.topK ?? 3;
  const threshold = params?.threshold ?? 0.3;

  return {
    // LlamaIndex retrievers implement an async retrieve method
    async retrieve(query: string): Promise<NodeWithScore[]> {
      const results = await searchSimilarDocuments(query, topK, threshold);
      const LI: any = await import('llamaindex');
      return buildTextNodes(LI, results);
    },
  };
}

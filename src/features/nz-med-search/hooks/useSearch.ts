"use client";

import { useState } from 'react';
import type { SearchResult } from '../components/SearchResultItem';

export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);

  async function search(q: string) {
    setError(null);
    setLoading(true);
    setResults([]);
    try {
      const params = new URLSearchParams({ q, perPage: '10', withSnippet: 'true' });
      const res = await fetch(`/api/nz-med-search/query?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Search failed');
      const data = (await res.json()) as { items: SearchResult[] };
      setResults(data.items);
    } catch (e: any) {
      setError(e?.message || 'Failed to search');
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, results, search };
}
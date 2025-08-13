"use client";

import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { SearchResultItem } from './SearchResultItem';
import { useSearch } from '../hooks/useSearch';
import { Button } from '@/src/shared/components/ui/button';

export function NzMedSearchClient() {
  const [query, setQuery] = useState('');
  const { loading, error, results, search } = useSearch();

  async function onSubmit(q: string) {
    setQuery(q);
    if (q) await search(q);
  }

  async function askAi() {
    if (!query) return;
    const res = await fetch('/api/nz-med-search/summarize', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ q: query, topK: 5 }),
    });
    if (!res.ok) return alert('AI failed');
    const data = await res.json();
    const references = (data.references as Array<{ id: number; title: string; url: string }>);
    const refList = references.map(r => `[${r.id}] ${r.title} - ${r.url}`).join('\n');
    alert(`${data.summary}\n\nReferences:\n${refList}`);
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-semibold">NZ Medical Search</h1>
      <SearchBar onSearch={onSubmit} />
      {loading ? <div className="text-sm text-muted-foreground">Searching…</div> : null}
      {error ? <div className="text-sm text-red-500">{error}</div> : null}

      <div className="space-y-3">
        {results.map((r, i) => (
          <SearchResultItem key={`${r.url}-${i}`} item={r} />
        ))}
      </div>

      {results.length > 0 ? (
        <div>
          <Button variant="secondary" onClick={askAi}>Ask AI about these results</Button>
        </div>
      ) : null}

      <div className="text-xs text-muted-foreground">
        Sources: Healthify, NZF, NZF Children, DermNet, CDC, Ministry of Health. Paywalled sources excluded.
      </div>
    </div>
  );
}
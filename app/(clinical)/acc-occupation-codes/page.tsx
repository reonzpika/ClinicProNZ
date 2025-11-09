'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Input } from '@/src/shared/components/ui/input';

type OccupationCode = {
  code: string;
  title: string;
  anzscoCode?: string | null;
  notes?: string | null;
};

export default function AccOccupationCodesPage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const { data, isFetching, error } = useQuery<{ results: OccupationCode[] }>(
    {
      queryKey: ['acc-occupation-codes', submittedQuery],
      queryFn: async () => {
        const res = await fetch(`/api/acc-occupation-codes/search?q=${encodeURIComponent(submittedQuery)}`);
        if (!res.ok) {
          throw new Error('Search failed');
        }
        return res.json();
      },
      enabled: submittedQuery.trim().length >= 2,
    },
  );

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-3 text-xl font-semibold text-slate-900">ACC Occupation Codes</h1>
      <p className="mb-4 text-sm text-slate-600">Type an occupation (typos ok). Copy the code.</p>

      <div className="mb-4 flex items-center gap-2">
        <form
          className="flex w-full items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedQuery(query);
          }}
        >
          <Input
            placeholder="e.g., Plumber, Nurse, Software Enginer"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Button type="submit" size="sm">Search</Button>
        </form>
      </div>

      {isFetching && (
        <div className="mb-3 text-xs text-slate-500">Searching…</div>
      )}
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          Search failed. Please try again.
        </div>
      )}

      <div className="space-y-2">
        {data?.results?.map(r => (
          <div key={r.code} className="w-full overflow-hidden rounded-md border p-3">
            <div className="flex items-center justify-between gap-3 overflow-hidden">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-900">{r.title}</div>
                <div className="truncate text-xs text-slate-600">
Code:
{r.code}
{r.anzscoCode ? ` · ANZSCO: ${r.anzscoCode}` : ''}
                </div>
                {r.notes && <div className="truncate text-[11px] text-slate-500">{r.notes}</div>}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" onClick={() => handleCopy(r.code)}>Copy code</Button>
              </div>
            </div>
          </div>
        ))}

        {!isFetching && submittedQuery && (data?.results?.length ?? 0) === 0 && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
            No matches. Try a broader term or alternate spelling.
          </div>
        )}
      </div>
    </div>
  );
}

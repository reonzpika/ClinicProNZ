// @ts-nocheck
'use client';

import { Loader2, RefreshCcw, Search } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { useAuth } from '@clerk/nextjs';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeaders } from '@/src/shared/utils';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';

type SearchItem = { title: string; link: string };

export const PatientAdviceTab: React.FC = () => {
  const { generatedNotes } = useConsultationStores();
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();

  const [manualQuery, setManualQuery] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingKW, setLoadingKW] = useState(false);
  const [loadingTerm, setLoadingTerm] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, SearchItem[]>>({});
  const [error, setError] = useState<string | null>(null);

  const canSearchSelected = selected.size > 0;
  const visibleKeywords = useMemo(() => keywords.slice(0, 10), [keywords]);

  const extractFromNote = useCallback(async () => {
    setLoadingKW(true);
    setError(null);
    try {
      const res = await fetch('/api/patient-advice/keywords', {
        method: 'POST',
        headers: createAuthHeaders(userId || undefined, userTier),
        body: JSON.stringify({ note: generatedNotes, max: 10 }),
      });
      if (!res.ok) {
        throw new Error('Failed to extract keywords');
      }
      const data = await res.json();
      const list: string[] = Array.isArray(data?.keywords) ? data.keywords : [];
      setKeywords(list);
      setSelected(new Set(list.slice(0, Math.min(5, list.length))));
    } catch (e) {
      setError('Keyword extraction failed');
    } finally {
      setLoadingKW(false);
    }
  }, [generatedNotes, userId, userTier]);

  const toggle = useCallback((term: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(term)) next.delete(term); else next.add(term);
      return next;
    });
  }, []);

  const searchTerm = useCallback(async (term: string, forceRefresh = false) => {
    const key = term.trim();
    if (!key) return;
    if (!forceRefresh && results[key]) return;
    setLoadingTerm(key);
    setError(null);
    try {
      const res = await fetch(`/api/patient-advice/search?q=${encodeURIComponent(key)}${forceRefresh ? '&refresh=1' : ''}`, {
        headers: createAuthHeaders(userId || undefined, userTier),
      });
      if (!res.ok) {
        throw new Error('Search failed');
      }
      const data = await res.json();
      const items: SearchItem[] = Array.isArray(data?.items) ? data.items : [];
      setResults(prev => ({ ...prev, [key]: items }));
    } catch (e) {
      setError('Search failed');
    } finally {
      setLoadingTerm(null);
    }
  }, [results, userId, userTier]);

  const searchSelected = useCallback(async () => {
    const terms = Array.from(selected.values());
    for (const t of terms) {
      // Limit concurrency to avoid UI jank; sequential is fine here
      // eslint-disable-next-line no-await-in-loop
      await searchTerm(t);
    }
  }, [selected, searchTerm]);

  const handleManualSearch = useCallback(async () => {
    const q = manualQuery.trim();
    if (!q) return;
    await searchTerm(q, false);
  }, [manualQuery, searchTerm]);

  return (
    <Card className="flex h-full flex-col border-slate-200 bg-white shadow-sm">
      <CardContent className="flex flex-1 flex-col gap-3 p-3">
        {/* Header Controls */}
        <div className="flex items-center gap-2">
          <Input
            value={manualQuery}
            onChange={(e) => setManualQuery(e.target.value)}
            placeholder="Search Healthify"
            className="h-8 text-sm"
          />
          <Button size="sm" className="h-8" onClick={handleManualSearch}>
            <Search size={14} className="mr-1" /> Search
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={extractFromNote}
            disabled={loadingKW || !generatedNotes}
            title={!generatedNotes ? 'No consultation note available' : 'Extract keywords from note'}
          >
            {loadingKW ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Search size={14} className="mr-1" />}
            Use note
          </Button>
        </div>

        {/* Keyword Chips */}
        {visibleKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {visibleKeywords.map((k) => {
              const isSel = selected.has(k);
              return (
                <button
                  key={k}
                  onClick={() => toggle(k)}
                  className={`rounded-full border px-2 py-1 text-xs ${
                    isSel ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                  title={k}
                >
                  {k}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7" disabled={!canSearchSelected} onClick={searchSelected}>
                Search selected ({selected.size})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7"
                onClick={() => setSelected(new Set())}
                disabled={selected.size === 0}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded bg-red-50 p-2 text-xs text-red-600">{error}</div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {/* Manual or single keyword result */}
          {loadingTerm && (
            <div className="flex items-center gap-2 p-2 text-sm text-slate-600">
              <Loader2 size={14} className="animate-spin" /> Loading {loadingTerm}...
            </div>
          )}
          {Object.keys(results).length === 0 && !loadingTerm && (
            <div className="p-2 text-sm text-slate-500">Type a term or use the note to extract keywords.</div>
          )}

          {Object.entries(results).map(([term, items]) => (
            <div key={term} className="mb-3 rounded border border-slate-200">
              <div className="flex items-center justify-between border-b bg-slate-50 px-2 py-1">
                <div className="text-xs font-medium text-slate-700">Top results for “{term}”</div>
                <Button size="icon" variant="ghost" className="size-6" title="Refresh" onClick={() => searchTerm(term, true)}>
                  <RefreshCcw size={14} />
                </Button>
              </div>
              <ul className="divide-y">
                {items.length === 0 && (
                  <li className="p-2 text-xs text-slate-500">No Healthify pages found</li>
                )}
                {items.map((it) => (
                  <li key={it.link} className="p-2 text-sm">
                    <a href={it.link} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                      {it.title || it.link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { Button } from '@/src/shared/components/ui/button';
import { Input } from '@/src/shared/components/ui/input';

type SearchResult = {
  id: string; // Google place_id
  name: string;
  formattedAddress: string;
};

type PlaceDetails = {
  name: string;
  formattedAddress: string;
  addressComponents: Array<{ long_name: string; short_name: string; types: string[] }>; // Google format
};

export default function EmployerLookupPage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Debounce no longer used for cost optimisation; keep function for potential reuse

  const { data: results, isFetching: isSearching, error: searchError } = useQuery<{ results: SearchResult[]; googleStatus?: string }>({
    queryKey: ['employer-lookup', 'search', submittedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/employer-lookup/search?q=${encodeURIComponent(submittedQuery)}`);
      if (!res.ok) {
        throw new Error('Search failed');
      }
      return res.json();
    },
    enabled: submittedQuery.trim().length >= 2,
  });

  const { data: detailsData, isFetching: isLoadingDetails } = useQuery<{ details: PlaceDetails; googleStatus?: string } | null>({
    queryKey: ['employer-lookup', 'details', selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      const res = await fetch(`/api/employer-lookup/details?id=${encodeURIComponent(selectedId)}`);
      if (!res.ok) {
        throw new Error('Details failed');
      }
      return res.json();
    },
    enabled: Boolean(selectedId),
  });

  // Derived fields for copy once details loaded
  const fields = useMemo(() => {
    if (!detailsData?.details) return null;
    const d = detailsData.details;
    const byType = (type: string) => d.addressComponents.find(c => c.types.includes(type));
    const part = (type: string, preferShort = false) => {
      const c = byType(type);
      if (!c) return '';
      return preferShort ? c.short_name : c.long_name;
    };

    const unit = part('subpremise');
    const streetNumber = part('street_number');
    const route = part('route');
    const addressLine = [unit && `Unit ${unit}`, [streetNumber, route].filter(Boolean).join(' ')].filter(Boolean).join(', ');

    const city = part('locality') || part('sublocality_level_1') || part('administrative_area_level_2') || '';
    const postal = part('postal_code');

    return {
      name: d.name,
      address: addressLine,
      city,
      postal,
      country: 'New Zealand',
    };
  }, [detailsData]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore copy errors
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-3 text-xl font-semibold text-slate-900">Employer Lookup (ACC45)</h1>
      <p className="mb-4 text-sm text-slate-600">Public tool to quickly find and copy employer address fields.</p>

      <div className="mb-4 flex items-center gap-2">
        <form
          className="flex w-full items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedQuery(query);
          }}
        >
          <Input
            placeholder="Search employer name (e.g., Countdown Ponsonby)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Button type="submit" size="sm">Search</Button>
        </form>
      </div>

      {isSearching && (
        <div className="mb-3 text-xs text-slate-500">Searching…</div>
      )}
      {searchError && (
        <div className="mb-3 text-xs text-red-600">Search error. Please try again.</div>
      )}
      {!isSearching && results && results.googleStatus && (
        <div className="mb-2 text-[10px] text-slate-400">Debug: search status {results.googleStatus}</div>
      )}

      <div className="space-y-2">
        {results?.results?.map((r) => (
          <div key={r.id} className={`rounded-md border p-3`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-600">{r.formattedAddress}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setSelectedId(prev => (prev === r.id ? null : r.id))}>
                  {selectedId === r.id ? 'Hide' : 'Select'}
                </Button>
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + r.formattedAddress)}`}
                  target="_blank"
                  className="text-xs text-slate-600 underline"
                >
                  Open in Maps
                </Link>
                <Link
                  href={`https://www.google.com/search?q=${encodeURIComponent('site:nzbn.govt.nz ' + r.name)}`}
                  target="_blank"
                  className="text-xs text-slate-600 underline"
                >
                  NZBN
                </Link>
              </div>
            </div>

            {selectedId === r.id && (
              <div className="mt-3 rounded-md bg-slate-50 p-3">
                {isLoadingDetails && <div className="text-xs text-slate-500">Loading details…</div>}
                {!isLoadingDetails && fields && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-32 text-xs font-semibold text-slate-700">Employer name</div>
                      <div className="flex-1 truncate text-xs text-slate-800">{fields.name}</div>
                      <Button size="sm" onClick={() => handleCopy(fields.name)}>Copy</Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 text-xs font-semibold text-slate-700">Address</div>
                      <div className="flex-1 truncate text-xs text-slate-800">{fields.address}</div>
                      <Button size="sm" onClick={() => handleCopy(fields.address)}>Copy</Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 text-xs font-semibold text-slate-700">City</div>
                      <div className="flex-1 truncate text-xs text-slate-800">{fields.city}</div>
                      <Button size="sm" onClick={() => handleCopy(fields.city)}>Copy</Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 text-xs font-semibold text-slate-700">Postal</div>
                      <div className="flex-1 truncate text-xs text-slate-800">{fields.postal}</div>
                      <Button size="sm" onClick={() => handleCopy(fields.postal)}>Copy</Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 text-xs font-semibold text-slate-700">Country</div>
                      <div className="flex-1 truncate text-xs text-slate-800">New Zealand</div>
                      <Button size="sm" onClick={() => handleCopy('New Zealand')}>Copy</Button>
                    </div>
                  </div>
                )}
                {!isLoadingDetails && !fields && (
                  <div className="text-xs text-red-600">Failed to load details</div>
                )}
                {!isLoadingDetails && detailsData && detailsData.googleStatus && (
                  <div className="mt-2 text-[10px] text-slate-400">Debug: details status {detailsData.googleStatus}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

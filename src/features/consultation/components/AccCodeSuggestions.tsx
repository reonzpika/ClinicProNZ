import React, { useState } from 'react';

import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

export const AccCodeSuggestions: React.FC = () => {
  const { generatedNotes } = useConsultation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{
    text: string;
    read_code: string;
    injury_description: string | null;
    missing_info: string[];
  } | null>(null);

  // State for simple search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<
    { text: string; read_code: string; read_term: string }[]
  >([]);

  const handleSuggest = async () => {
    if (!generatedNotes) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const res = await fetch('/api/tools/acc_read_codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: generatedNotes }),
      });
      let data = await res.json();
      // TODO: Update the API to return a JSON object, not a stringified JSON object
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        // eslint-disable-next-line unused-imports/no-unused-vars
        } catch (e) {
          setError('Failed to parse suggestion from API.');
          setLoading(false);
          return;
        }
      }
      setSuggestion(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const res = await fetch('/api/tools/acc_code_search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to search ACC codes');
      }
      setSearchResults(data.results || []);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to search ACC codes');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-md font-semibold">ACC Code Suggestions</h3>
      </CardHeader>
      <CardContent>
        {/* Simple Search UI */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search ACC codes (e.g. ulcer, radiation)"
            className="flex-1 rounded border px-2 py-1 text-sm"
            disabled={searchLoading}
          />
          <Button type="submit" disabled={searchLoading || !searchQuery.trim()}>
            {searchLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>
        {searchError && <Alert variant="destructive" className="mb-2">{searchError}</Alert>}
        {searchResults.length > 0 && (
          <div className="mb-4 space-y-2">
            {searchResults.map((s, i) => (
              <div key={i} className="flex flex-col rounded border bg-gray-50 p-2">
                <span className="font-medium">{s.text}</span>
                <span className="text-xs text-muted-foreground">
                  Read code:
                  {s.read_code}
                </span>
                <span className="text-xs text-muted-foreground">
                  Read term:
                  {s.read_term}
                </span>
              </div>
            ))}
          </div>
        )}
        {searchResults.length === 0 && searchQuery && !searchLoading && !searchError && (
          <div className="mb-4 text-xs text-muted-foreground">No matches found.</div>
        )}
        {/* Divider */}
        <div className="my-4 border-b" />
        {/* AI Suggestions */}
        <Button onClick={handleSuggest} disabled={!generatedNotes || loading} className="mb-2 w-full">
          {loading ? 'Suggesting...' : 'Suggest ACC Codes'}
        </Button>
        {!generatedNotes && (
          <Alert variant="default" className="mb-2">Generate a note first to get ACC code suggestions.</Alert>
        )}
        {error && <Alert variant="destructive" className="mb-2">{error}</Alert>}
        {suggestion && (
          <div className="flex flex-col space-y-2 rounded border bg-gray-50 p-3">
            <span className="font-medium">{suggestion.text}</span>
            <span className="text-xs text-muted-foreground">
              Read code:
              {suggestion.read_code}
            </span>
            {suggestion.injury_description
              ? (
                  <span className="mt-2 text-sm">{suggestion.injury_description}</span>
                )
              : (
                  <div className="mt-2">
                    <span className="text-warning-foreground text-sm">Injury description missing.</span>
                    {suggestion.missing_info && suggestion.missing_info.length > 0 && (
                      <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                        {suggestion.missing_info.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
          </div>
        )}
        {/* TODO: Add callback for selection, props for note override, etc. for future extensibility */}
      </CardContent>
    </Card>
  );
};

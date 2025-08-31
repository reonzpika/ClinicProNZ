'use client';

import { AlertCircle, Loader2, Search } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';

type SearchResult = {
  title: string;
  source: string;
  content: string[];
  score: number;
};

type SearchResponse = {
  results: SearchResult[];
  message?: string;
  enhancing?: boolean;
  enhancedCount?: number;
  error?: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
 return;
}

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search/healthify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const responseData: SearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Search failed');
      }

      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Clinical Information Search</h1>
        <p className="text-muted-foreground">
          Search trusted medical resources for clinical information
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6 flex gap-2">
        <Input
          type="text"
          placeholder="e.g., headache management, diabetes treatment..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
          disabled={loading}
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-6"
        >
          {loading
? (
            <Loader2 className="size-4 animate-spin" />
          )
: (
            <Search className="size-4" />
          )}
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 size-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">
              Searching medical resources and generating summary...
            </p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {data && !loading && data.results.length > 0 && (
        <div className="space-y-4">
          <h2 className="mb-4 text-xl font-semibold">
            Search Results (
{data.results.length}
)
          </h2>

          {data.results.map((result, index) => (
            <Card key={`${result.source}-${index}`} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  <a
                    href={result.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {result.title}
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {result.content.map((point, pointIndex) => (
                    <div key={`${point.slice(0, 20)}-${pointIndex}`} className="flex items-start gap-2">
                      <span className="mt-1.5 text-xs text-muted-foreground">•</span>
                      <p className="text-sm leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-muted pt-3">
                  <span className="text-xs text-muted-foreground">
                    Source:
{' '}
{new URL(result.source).hostname}
                    {result.score && ` • Relevance: ${Math.round(result.score * 100)}%`}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && data && data.results.length === 0 && query && !error && (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No results found</h3>
          <p className="text-muted-foreground">
            Try a different search term or check your spelling
          </p>
        </div>
      )}
    </div>
  );
}

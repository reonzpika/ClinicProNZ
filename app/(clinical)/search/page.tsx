'use client';

import { AlertCircle, Loader2, Search } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';

type SearchResponse = {
  paragraph?: string; // For summary mode
  sources: Array<{ title: string; url: string; index: number }>;
  titles?: Array<{ title: string; url: string }>; // For list mode
  message?: string;
  error?: string;
};

// Function to parse bullet points and make citations clickable
function parseBulletPointsWithCitations(
  text: string,
  sources: Array<{ title: string; url: string; index: number }>,
): React.ReactElement[] {
  const citationProcessingStart = performance.now();
  const lines = text.split('\n').filter(line => line.trim());

  const result = lines.map((line, lineIndex) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
 return null;
}

    // Remove bullet point if present and parse citations
    const cleanLine = trimmedLine.replace(/^[•\-*]\s*/, '');

    // Split by citation patterns like [1], [2], [1][2], etc.
    const parts = cleanLine.split(/(\[\d+\])/g);

    return (
      <li key={lineIndex} className="mb-2">
        {parts.map((part, partIndex) => {
          const citationMatch = part.match(/^\[(\d+)\]$/);
          if (citationMatch?.[1]) {
            const citationNumber = Number.parseInt(citationMatch[1], 10);
            const source = sources.find(s => s.index === citationNumber);
            if (source) {
              return (
                <a
                  key={partIndex}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center text-primary hover:underline"
                  title={source.title}
                >
                  [
{citationNumber}
]
                </a>
              );
            }
          }
          return part;
        })}
      </li>
    );
  }).filter(Boolean) as React.ReactElement[];

  const citationProcessingEnd = performance.now();
  // eslint-disable-next-line no-console
  console.log(`[CITATION TIMING] Frontend citation hyperlink processing: ${Math.round(citationProcessingEnd - citationProcessingStart)}ms`);
  // eslint-disable-next-line no-console
  console.log(`[CITATION DEBUG] Processed ${lines.length} bullet points with ${sources.length} total sources`);

  return result;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'list' | 'summary'>('list'); // List as default

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
        body: JSON.stringify({ query: query.trim(), mode }),
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

      {/* Mode Toggle */}
      <div className="mb-4 flex justify-center">
        <div className="inline-flex rounded-md border border-input bg-background p-1">
          <button
            type="button"
            onClick={() => setMode('list')}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'list'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setMode('summary')}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'summary'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Summary
          </button>
        </div>
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
              Searching medical resources and synthesising clinical information...
            </p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {data && !loading && (
        <div className="space-y-8">
          {/* List Results Section (Full Width) */}
          {data.titles && data.titles.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Top Results</h2>
              <Card>
                <CardContent className="pt-6">
                  <ol className="space-y-3">
                    {data.titles.map((title, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0 text-sm font-medium text-muted-foreground">
                          {index + 1}
.
                        </span>
                        <a
                          href={title.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {title.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Summary Results Section (Full Width) */}
          {data.paragraph && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Clinical Summary</h2>
              <div className="space-y-6">
                {/* Bullet Points Summary */}
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="pt-6">
                    <ul className="space-y-3 text-sm leading-relaxed text-foreground">
                      {parseBulletPointsWithCitations(data.paragraph, data.sources)}
                    </ul>
                  </CardContent>
                </Card>

                {/* Sources */}
                {data.sources && data.sources.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {data.sources.map(source => (
                          <div key={source.index} className="flex items-start gap-3">
                            <span className="mt-0.5 shrink-0 text-sm font-medium text-muted-foreground">
                              {source.index}
.
                            </span>
                            <div className="min-w-0 flex-1">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                {source.title}
                              </a>
                              <p className="text-xs text-muted-foreground">
                                {new URL(source.url).hostname}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* No Results */}
          {(!data.titles || data.titles.length === 0) && !data.paragraph && (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 size-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No results found</h3>
              <p className="text-muted-foreground">
                {data.message || 'Try a different search term or check your spelling'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Message */}
      {data && data.message && (
        <Alert className="mb-6">
          <AlertDescription>{data.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

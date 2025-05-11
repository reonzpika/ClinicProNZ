import React, { useState } from 'react';
import { useConsultation } from '@/shared/ConsultationContext';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/card';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';

export const AccCodeSuggestions: React.FC = () => {
  const { generatedNotes } = useConsultation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ text: string; read_code: string }[]>([]);

  const handleSuggest = async () => {
    if (!generatedNotes) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const res = await fetch('/api/tools/acc_read_codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: generatedNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch suggestions');
      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-md font-semibold">ACC Code Suggestions</h3>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSuggest} disabled={!generatedNotes || loading} className="mb-2 w-full">
          {loading ? 'Suggesting...' : 'Suggest ACC Codes'}
        </Button>
        {!generatedNotes && (
          <Alert variant="default" className="mb-2">Generate a note first to get ACC code suggestions.</Alert>
        )}
        {error && <Alert variant="destructive" className="mb-2">{error}</Alert>}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="border rounded p-2 flex flex-col">
                <span className="font-medium">{s.text}</span>
                <span className="text-xs text-muted-foreground">Read code: {s.read_code}</span>
              </div>
            ))}
          </div>
        )}
        {/* TODO: Add callback for selection, props for note override, etc. for future extensibility */}
      </CardContent>
    </Card>
  );
}; 
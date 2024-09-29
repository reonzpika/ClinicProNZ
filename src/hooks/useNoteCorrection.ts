import { useCallback, useState } from 'react';

export function useNoteCorrection() {
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const correctNote = useCallback(async (patientSummary: string) => {
    setIsCorrecting(true);
    setError(null);

    try {
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Rewrite this consultation note to correct any errors or improve clarity. Do not add new information.',
          patientSummary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to correct the note');
      }

      const data = await response.json();
      return data.content;
    } catch (err) {
      console.error('Error correcting note:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsCorrecting(false);
    }
  }, []);

  return { correctNote, isCorrecting, error };
}

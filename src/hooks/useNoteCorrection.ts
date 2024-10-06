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
          prompt: `
            Correct any grammatical errors and improve clarity in the following consultation note, with these specific instructions:
            1. Preserve all medical abbreviations, especially 'obs' and other common GP abbreviations.
            2. Do not expand or modify any abbreviations.
            3. Maintain the original formatting and structure of the note. If there is no structure, use the subjective "Subjective" and objective "Objective" sections.
            4. Do not add new information or content.
            5. Focus only on grammatical corrections and clarity improvements.
            6. Return the corrected note in the exact same format as the original.

            Original note:
            ${patientSummary}
          `,
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

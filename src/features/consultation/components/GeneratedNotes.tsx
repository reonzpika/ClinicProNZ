'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

// TODO: Fix button enable logic so Generate Notes is clickable when there is only a transcription (without requiring a quick note). Currently, it only enables after a quick note is added.

export function GeneratedNotes({ onGenerate, onClearAll, loading, isNoteFocused }: { onGenerate?: () => void; onClearAll?: () => void; loading?: boolean; isNoteFocused?: boolean }) {
  const {
    generatedNotes,
    error,
    transcription,
    quickNotes,
    resetConsultation,
    lastGeneratedTranscription,
    lastGeneratedQuickNotes,
    setGeneratedNotes,
    setQuickNotes,
    consentObtained,
  } = useConsultation();

  // Local UI state
  const [copySuccess, setCopySuccess] = useState(false);

  // Refs for auto-expanding textareas
  const mainTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Consent statement to append when consent was obtained
  const CONSENT_STATEMENT = '\n\nPatient informed and consented verbally to the use of a digital assistant for recording and transcription during this consultation, in line with NZ Health Information Privacy Principles. The patient retains the right to pause or stop the recording at any time.';

  // Computed value: generated notes with consent statement appended if consent was obtained
  const displayNotes = React.useMemo(() => {
    if (!generatedNotes) {
      return '';
    }
    if (!consentObtained) {
      return generatedNotes;
    }

    // Check if consent statement is already included to avoid duplication
    if (generatedNotes.includes('Patient informed and consented verbally to the use of a digital assistant')) {
      return generatedNotes;
    }

    return generatedNotes + CONSENT_STATEMENT;
  }, [generatedNotes, consentObtained]);

  // Helper: deep equality for quickNotes
  const areQuickNotesEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

  // Button enable logic
  const hasInput
    = (transcription.transcript && transcription.transcript.trim() !== '')
      || (quickNotes && quickNotes.length > 0);
  const isInputChanged
    = transcription.transcript !== (lastGeneratedTranscription || '')
      || !areQuickNotesEqual(quickNotes, lastGeneratedQuickNotes || []);
  const canGenerate = hasInput && isInputChanged;

  const hasContent = !!(displayNotes && displayNotes.trim() !== '');
  const hasAnyState
    = hasContent
      || (transcription.transcript && transcription.transcript.trim() !== '')
      || (quickNotes && quickNotes.length > 0);

  // Copy to clipboard logic - use displayNotes which includes consent statement
  const handleCopy = async () => {
    if (!displayNotes) {
      return;
    }
    try {
      await navigator.clipboard.writeText(displayNotes);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    } catch {
      setCopySuccess(false);
    }
  };

  // Handle textarea changes - update the raw generated notes (without consent statement)
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Remove consent statement if user manually edits it out
    const cleanedValue = value.replace(CONSENT_STATEMENT, '');
    setGeneratedNotes(cleanedValue);
  };

  // Clear all handler: reset consultation context (transcript is now managed globally)
  const handleClearAll = () => {
    resetConsultation(); // Clears all consultation data including transcript
    setQuickNotes([]);
    if (onClearAll) {
      onClearAll();
    }
  };

  // Auto-expand logic for main textarea
  useEffect(() => {
    const textarea = mainTextareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const minHeight = 100;
      const maxHeight = 1000;
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [displayNotes, isNoteFocused]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-1 pb-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold">Generated Notes</h2>
          {loading && (
            <span className="ml-2 flex items-center" aria-busy="true">
              <svg className="mr-1 size-4 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-xs text-blue-600">Generating...</span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-1 pt-0">
        <Stack spacing="sm">
          {error && <div className="text-xs text-red-500">{error}</div>}
          <Section>
            <textarea
              ref={mainTextareaRef}
              value={displayNotes || ''}
              onChange={handleNotesChange}
              className="w-full rounded border bg-muted p-1 text-xs leading-tight text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary"
              placeholder="Generated notes will appear here..."
              style={{ minHeight: 100, maxHeight: 1000, resize: 'none', overflowY: 'auto' }}
              disabled={loading}
              spellCheck={false}
            />
          </Section>
          <Section>
            <div className="flex space-x-1">
              <Button
                type="button"
                variant="default"
                onClick={onGenerate}
                disabled={!canGenerate || loading}
                className="h-8 px-2 py-1 text-xs"
              >
                Generate Notes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopy}
                disabled={!hasContent || loading}
                className="h-8 px-2 py-1 text-xs"
              >
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleClearAll}
                disabled={!hasAnyState || loading}
                title="Clear all consultation data"
                aria-label="Clear all consultation data"
                className="h-8 px-2 py-1 text-xs"
              >
                Clear All
              </Button>
            </div>
          </Section>
        </Stack>
      </CardContent>
    </Card>
  );
}

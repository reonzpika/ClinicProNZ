'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

// TODO: Fix button enable logic so Generate Notes is clickable when there is only a transcription (without requiring a quick note). Currently, it only enables after a quick note is added.

export function GeneratedNotes({ onGenerate, onClearAll, loading, isNoteFocused, isDocumentationMode }: { onGenerate?: () => void; onClearAll?: () => void; loading?: boolean; isNoteFocused?: boolean; isDocumentationMode?: boolean }) {
  const {
    generatedNotes,
    error,
    transcription,
    resetConsultation,
    lastGeneratedTranscription,
    lastGeneratedTypedInput,
    setGeneratedNotes,
    consentObtained,
    inputMode,
    typedInput,
  } = useConsultation();

  // Local UI state
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Refs for auto-expanding textareas
  const mainTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Consent statement to append when consent was obtained
  const CONSENT_STATEMENT = '\n\nPatient informed and consented verbally to the use of digital documentation assistance during this consultation, in line with NZ Health Information Privacy Principles. The patient retains the right to pause or stop the recording at any time.';

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

  // Button enable logic - updated for both input modes
  const hasInput = inputMode === 'typed'
    ? (typedInput && typedInput.trim() !== '')
    : (transcription.transcript && transcription.transcript.trim() !== '');

  const isInputChanged = inputMode === 'typed'
    ? typedInput !== (lastGeneratedTypedInput || '')
    : transcription.transcript !== (lastGeneratedTranscription || '');

  const canGenerate = hasInput && isInputChanged;

  const hasContent = !!(displayNotes && displayNotes.trim() !== '');
  const hasAnyState = hasContent
    || (inputMode === 'typed' && typedInput && typedInput.trim() !== '')
    || (inputMode === 'audio' && (transcription.transcript && transcription.transcript.trim() !== ''));

  // Determine if we should show minimal or expanded view
  const shouldShowMinimal = !isExpanded && !hasContent && !loading;

  // Expand when generation starts or when there are notes
  useEffect(() => {
    if (loading || hasContent) {
      setIsExpanded(true);
    }
  }, [loading, hasContent]);

  // Reset to minimal when content is cleared
  useEffect(() => {
    if (!hasAnyState && !loading) {
      setIsExpanded(false);
    }
  }, [hasAnyState, loading]);

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

  // Enhanced generate handler that expands the interface
  const handleGenerate = () => {
    setIsExpanded(true);
    if (onGenerate) {
      onGenerate();
    }
  };

  // Clear all handler: reset consultation context and return to minimal state
  const handleClearAll = () => {
    resetConsultation(); // Clears all consultation data including transcript
    setIsExpanded(false);
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

  // Minimal state - just the generate button
  if (shouldShowMinimal) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="default"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="h-10 flex-1 px-4 py-2 text-sm bg-slate-600 hover:bg-slate-700 text-white"
          >
            Process Notes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClearAll}
            disabled={!hasAnyState}
            className="h-10 px-4 py-2 text-sm border-slate-300 text-slate-600 hover:bg-slate-50"
            title="Clear all consultation data"
            aria-label="Clear all consultation data"
          >
            Clear All
          </Button>
        </div>
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
      </div>
    );
  }

  // Expanded state - full interface
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-slate-700">Clinical Documentation</h2>
          {loading && (
            <span className="ml-2 flex items-center" aria-busy="true">
              <svg className="mr-1 size-4 animate-spin text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-sm text-slate-600">Processing...</span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Stack spacing="sm">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Section>
            <textarea
              ref={mainTextareaRef}
              value={displayNotes || ''}
              onChange={handleNotesChange}
              className="w-full rounded border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 focus:border-slate-400 focus:ring-2 focus:ring-slate-400"
              placeholder="Clinical documentation will appear here..."
              style={isDocumentationMode 
                ? { minHeight: '400px', height: 'calc(100vh - 300px)', maxHeight: 'calc(100vh - 300px)', resize: 'none', overflowY: 'auto' }
                : { minHeight: 120, maxHeight: 1000, resize: 'none', overflowY: 'auto' }
              }
              disabled={loading}
              spellCheck={false}
            />
          </Section>
          <Section>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="default"
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                className="h-9 px-4 py-2 text-sm bg-slate-600 hover:bg-slate-700 text-white"
              >
                Process Notes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopy}
                disabled={!hasContent || loading}
                className="h-9 px-4 py-2 text-sm border-slate-300 text-slate-600 hover:bg-slate-50"
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
                className="h-9 px-4 py-2 text-sm"
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

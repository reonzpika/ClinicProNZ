'use client';

import React, { useState } from 'react';

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
  } = useConsultation();

  // Local UI state
  const [expanded, setExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Helper: deep equality for quickNotes
  const areQuickNotesEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

  // Button enable logic
  const hasInput
    = (transcription.interimBuffer && transcription.interimBuffer.trim() !== '')
      || (transcription.interim && transcription.interim.trim() !== '')
      || (quickNotes && quickNotes.length > 0);
  const isInputChanged
    = transcription.interimBuffer !== (lastGeneratedTranscription || '')
      || transcription.interim !== ''
      || !areQuickNotesEqual(quickNotes, lastGeneratedQuickNotes || []);
  const canGenerate = hasInput && isInputChanged;

  const hasContent = !!(generatedNotes && generatedNotes.trim() !== '');
  const hasAnyState
    = hasContent
      || (transcription.interimBuffer && transcription.interimBuffer.trim() !== '')
      || (transcription.interim && transcription.interim.trim() !== '')
      || (quickNotes && quickNotes.length > 0);

  // Copy to clipboard logic
  const handleCopy = async () => {
    if (!generatedNotes) {
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedNotes);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    } catch {
      setCopySuccess(false);
    }
  };

  // Clear all handler: also reset last generated input
  const handleClearAll = () => {
    resetConsultation();
    setQuickNotes([]);
    if (onClearAll) {
      onClearAll();
    }
  };

  // Expanded modal style
  const modalStyle
    = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
  const expandedCardStyle
    = 'w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 relative';

  return (
    <>
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            disabled={!hasContent}
            title="Expand notes view"
            aria-label="Expand notes view"
            className="h-8 px-2 py-1 text-xs"
          >
            Expand
          </Button>
        </CardHeader>
        <CardContent className="p-1 pt-0">
          <Stack spacing="sm">
            {error && <div className="text-xs text-red-500">{error}</div>}
            <Section>
              <textarea
                value={generatedNotes || ''}
                onChange={e => setGeneratedNotes(e.target.value)}
                className="w-full resize-y overflow-y-auto rounded border bg-muted p-1 text-xs leading-tight text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary"
                placeholder="Generated notes will appear here..."
                style={isNoteFocused ? { minHeight: '60vh' } : { minHeight: 80, maxHeight: 120 }}
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

      {/* Expanded Modal */}
      {expanded && (
        <div
          className={modalStyle}
          role="presentation"
          tabIndex={-1}
          onClick={() => setExpanded(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setExpanded(false);
            }
          }}
        >
          <div
            className={expandedCardStyle}
            role="presentation"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setExpanded(false);
              }
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Generated Notes (Expanded)</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(false)}
                aria-label="Close expanded notes"
              >
                Close
              </Button>
            </div>
            <textarea
              value={generatedNotes || ''}
              onChange={e => setGeneratedNotes(e.target.value)}
              className="min-h-[400px] w-full resize-y overflow-y-auto rounded border bg-muted p-1 text-xs leading-tight text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary"
              style={{ height: 400, maxHeight: 600 }}
              spellCheck={false}
            />
            <div className="mt-6 flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopy}
                disabled={!hasContent}
              >
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleClearAll}
                disabled={!hasAnyState}
              >
                Clear All
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => setExpanded(false)}
              >
                Collapse
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

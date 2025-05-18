'use client';

import React, { useState } from 'react';

import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';
import { useConsultation } from '@/shared/ConsultationContext';

// TODO: Fix button enable logic so Generate Notes is clickable when there is only a transcription (without requiring a quick note). Currently, it only enables after a quick note is added.

export function GeneratedNotes({ onGenerate, onClearAll }: { onGenerate?: () => void, onClearAll?: () => void }) {
  const {
    generatedNotes,
    error,
    transcription,
    quickNotes,
    resetConsultation,
    lastGeneratedTranscription,
    lastGeneratedQuickNotes,
    setLastGeneratedInput,
    resetLastGeneratedInput,
    setGeneratedNotes,
  } = useConsultation();

  // Local UI state
  const [expanded, setExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Helper: deep equality for quickNotes
  const areQuickNotesEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

  // Button enable logic
  const hasInput =
    (transcription.final && transcription.final.trim() !== '') ||
    (transcription.interim && transcription.interim.trim() !== '') ||
    (quickNotes && quickNotes.length > 0);
  const isInputChanged =
    transcription.final !== (lastGeneratedTranscription || '') ||
    transcription.interim !== '' ||
    !areQuickNotesEqual(quickNotes, lastGeneratedQuickNotes || []);
  const canGenerate = hasInput && isInputChanged;

  const hasContent = !!(generatedNotes && generatedNotes.trim() !== '');
  const hasAnyState =
    hasContent ||
    (transcription.final && transcription.final.trim() !== '') ||
    (transcription.interim && transcription.interim.trim() !== '') ||
    (quickNotes && quickNotes.length > 0);

  // Copy to clipboard logic
  const handleCopy = async () => {
    if (!generatedNotes) return;
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
    resetLastGeneratedInput();
    if (onClearAll) onClearAll();
  };

  // Expanded modal style
  const modalStyle =
    'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
  const expandedCardStyle =
    'w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 relative';

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-1">
          <h2 className="text-xs font-semibold">Generated Notes</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            disabled={!hasContent}
            title="Expand notes view"
            aria-label="Expand notes view"
            className="text-xs px-2 py-1 h-8"
          >
            Expand
          </Button>
        </CardHeader>
        <CardContent className="p-1">
          <Stack spacing="xs">
            {error && <div className="text-red-500 text-xs">{error}</div>}
            <Section>
              <Textarea
                placeholder="Generated notes will appear here..."
                value={generatedNotes || ''}
                onChange={e => setGeneratedNotes(e.target.value)}
                className="min-h-[80px] text-xs leading-tight resize-vertical"
                style={{ maxHeight: 120 }}
              />
            </Section>
            <Section>
              <div className="flex space-x-1">
                <Button
                  type="button"
                  variant="default"
                  onClick={onGenerate}
                  disabled={!canGenerate}
                  className="text-xs px-2 py-1 h-8"
                >
                  Generate Notes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCopy}
                  disabled={!hasContent}
                  className="text-xs px-2 py-1 h-8"
                >
                  {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleClearAll}
                  disabled={!hasAnyState}
                  title="Clear all consultation data"
                  aria-label="Clear all consultation data"
                  className="text-xs px-2 py-1 h-8"
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
        <div className={modalStyle}>
          <div className={expandedCardStyle}>
            <div className="flex justify-between items-center mb-4">
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
            <Textarea
              value={generatedNotes || ''}
              onChange={e => setGeneratedNotes(e.target.value)}
              className="min-h-[400px] text-lg leading-relaxed resize-vertical"
              style={{ height: 400, maxHeight: 600 }}
            />
            <div className="flex space-x-4 mt-6">
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

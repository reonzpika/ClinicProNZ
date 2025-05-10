'use client';

import React, { useState } from 'react';

import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';
import { useConsultation } from '@/shared/ConsultationContext';
import { useTranscription } from '../hooks/useTranscription';

export function GeneratedNotes({ onGenerate }: { onGenerate?: () => void }) {
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
  } = useConsultation();
  const { resetTranscription } = useTranscription();

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

  // Clear all handler: reset both global and local transcription state
  const handleClearAll = () => {
    resetConsultation();
    resetTranscription();
  };

  // Expanded modal style
  const modalStyle =
    'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
  const expandedCardStyle =
    'w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 relative';

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">Generated Notes</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            disabled={!hasContent}
            title="Expand notes view"
            aria-label="Expand notes view"
          >
            Expand
          </Button>
        </CardHeader>
        <CardContent>
          <Stack spacing="md">
            {error && <div className="text-red-500">{error}</div>}
            <Section>
              <Textarea
                placeholder="Generated notes will appear here..."
                value={generatedNotes || ''}
                readOnly
                className="min-h-[220px] text-base leading-relaxed resize-vertical"
                style={{ maxHeight: 300 }}
              />
            </Section>
            <Section>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="default"
                  onClick={onGenerate}
                  disabled={!canGenerate}
                >
                  Generate Notes
                </Button>
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
                  title="Clear all consultation data"
                  aria-label="Clear all consultation data"
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
              readOnly
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

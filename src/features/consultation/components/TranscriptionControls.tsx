'use client';

import React from 'react';

import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

import { useTranscription } from '../hooks/useTranscription';

export function TranscriptionControls() {
  const {
    transcription,
    error,
    setTranscription,
    getCurrentTranscript,
    quickNotes,
    templateId,
    setGeneratedNotes,
    setLastGeneratedInput,
    setError,
  } = useConsultation();
  const {
    isRecording,
    isPaused,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useTranscription();

  // Custom stop handler: finalize transcript and trigger note generation
  const handleStopRecording = async () => {
    stopRecording();
    setTranscription('', '', false); // Finalize transcript in context
    // Wait a tick to ensure context is updated
    setTimeout(async () => {
      const transcript = getCurrentTranscript();
      try {
        const res = await fetch('/api/consultation/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcription: transcript,
            templateId,
            quickNotes,
          }),
        });
        const data = await res.json();
        if (res.ok && data.notes) {
          setGeneratedNotes(data.notes);
          setLastGeneratedInput(transcript, quickNotes);
        } else {
          setError(data.error || 'Failed to generate notes');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate notes');
      }
    }, 0);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Stack spacing="md">
          {error && (
            <Alert variant="destructive">
              {error}
            </Alert>
          )}

          <Section>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="default"
                onClick={startRecording}
                disabled={isRecording}
              >
                Start Recording
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={isPaused ? resumeRecording : pauseRecording}
                disabled={!isRecording}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleStopRecording}
                disabled={!isRecording}
              >
                Stop
              </Button>
            </div>
          </Section>

          <Section title="Transcription">
            <div className="space-y-4">
              {/* Final Transcript Block */}
              {transcription.final && (
                <div className="bg-muted rounded-md p-4">
                  <p className="text-sm">
                    {transcription.final}
                  </p>
                </div>
              )}

              {/* Interim Transcript */}
              {transcription.interim && (
                <div className="bg-muted/50 rounded-md p-4">
                  <p className="text-muted-foreground text-sm italic">
                    {transcription.interim}
                  </p>
                </div>
              )}

              {/* No Transcription Message */}
              {!transcription.final && !transcription.interim && (
                <div className="bg-muted rounded-md p-4">
                  <p className="text-muted-foreground text-sm">
                    No transcription available
                  </p>
                </div>
              )}
            </div>
          </Section>
        </Stack>
      </CardContent>
    </Card>
  );
}

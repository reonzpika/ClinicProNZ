'use client';

import React from 'react';

import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

import { useTranscription } from '../hooks/useTranscription';

export function TranscriptionControls({ resetSignal, collapsed, onExpand }: { resetSignal?: any; collapsed?: boolean; onExpand?: () => void }) {
  const {
    transcription,
    error,
  } = useConsultation();
  const {
    isRecording,
    isPaused,
    segments,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useTranscription(resetSignal);

  // Get the latest confidence from the last segment
  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : undefined;
  const latestConfidence = lastSegment && lastSegment.confidence !== undefined ? lastSegment.confidence * 100 : null;

  // Pulsing dot for recording feedback
  const RecordingDot = () => (
    <span className="mr-2 inline-block size-3 animate-pulse rounded-full bg-red-500 align-middle" title="Recording" />
  );

  if (collapsed) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-1 pb-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">Transcription</span>
          </div>
          <Button type="button" size="sm" className="text-xs" onClick={onExpand}>Expand</Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-1 pt-0">
        <Stack spacing="sm">
          {error && (
            <Alert variant="destructive" className="p-1 text-xs">
              {error}
            </Alert>
          )}

          <Section title="Transcription">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-1">
                {isRecording && <RecordingDot />}
                <span className="text-xs font-semibold">Transcription</span>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={startRecording}
                  disabled={isRecording}
                  className="h-7 min-w-0 rounded border bg-white px-1 py-0.5 text-xs hover:bg-gray-100"
                >
                  Start
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  disabled={!isRecording}
                  className="h-7 min-w-0 rounded border bg-white px-1 py-0.5 text-xs hover:bg-gray-100"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="h-7 min-w-0 rounded border bg-white px-1 py-0.5 text-xs hover:bg-gray-100"
                >
                  Stop
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {/* Final Transcript Block */}
              {transcription.interimBuffer && (
                <div className="rounded-md bg-muted p-1">
                  <p className="text-xs">
                    {transcription.interimBuffer}
                  </p>
                  {/* Show latest confidence only while recording */}
                  {isRecording && latestConfidence !== null && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Confidence:
                      {' '}
                      {latestConfidence.toFixed(1)}
                      %
                    </div>
                  )}
                </div>
              )}

              {/* Interim Transcript */}
              {transcription.interim && (
                <div className="rounded-md bg-muted/50 p-1">
                  <p className="text-xs italic text-muted-foreground">
                    {transcription.interim}
                  </p>
                </div>
              )}

              {/* No Transcription Message */}
              {!transcription.interimBuffer && !transcription.interim && (
                <div className="rounded-md bg-muted p-1">
                  <p className="text-xs text-muted-foreground">
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

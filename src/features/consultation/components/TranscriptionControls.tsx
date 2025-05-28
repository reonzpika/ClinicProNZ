'use client';

import React from 'react';

import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

import { useTranscription } from '../hooks/useTranscription';

export function TranscriptionControls({ collapsed, onExpand }: { collapsed?: boolean; onExpand?: () => void }) {
  const { error: contextError } = useConsultation();
  const {
    isRecording,
    isTranscribing,
    transcript,
    error,
    startRecording,
    stopRecording,
    resetTranscription,
  } = useTranscription();

  // Pulsing dot for recording feedback
  // eslint-disable-next-line react/no-nested-components
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
          {(error || contextError) && (
            <Alert variant="destructive" className="p-1 text-xs">
              {error || contextError}
            </Alert>
          )}

          <Section title="Transcription">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-1">
                {isRecording && <RecordingDot />}
                <span className="text-xs font-semibold">Transcription</span>
              </div>
              <div className="flex gap-1">
                {!isRecording && !isTranscribing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startRecording}
                    className="h-7 min-w-0 rounded border bg-white px-1 py-0.5 text-xs hover:bg-gray-100"
                  >
                    Start Recording
                  </Button>
                )}
                {isRecording && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={stopRecording}
                    className="h-7 min-w-0 rounded border bg-white px-1 py-0.5 text-xs hover:bg-gray-100"
                  >
                    Stop Recording
                  </Button>
                )}
                {!isRecording && !isTranscribing && transcript && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetTranscription}
                    className="h-7 min-w-0 rounded border bg-white px-1 py-0.5 text-xs hover:bg-gray-100"
                  >
                    Re-record
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {isTranscribing && (
                <div className="flex items-center gap-2">
                  <span className="inline-block size-3 animate-pulse rounded-full bg-blue-500" />
                  <span className="text-xs">Transcribing audio...</span>
                </div>
              )}
              {/* Transcript display */}
              {transcript && !isTranscribing && (
                <div className="rounded-md bg-muted p-1">
                  <p className="whitespace-pre-wrap text-xs">{transcript}</p>
                </div>
              )}
              {/* No Transcription Message */}
              {!transcript && !isTranscribing && !isRecording && (
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

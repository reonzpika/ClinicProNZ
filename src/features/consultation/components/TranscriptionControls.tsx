'use client';

import React from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Alert } from '@/shared/components/ui/alert';

import { useConsultation } from '@/shared/ConsultationContext';
import { useTranscription } from '../hooks/useTranscription';

export function TranscriptionControls({ resetSignal }: { resetSignal?: any }) {
  const {
    transcription,
    error,
    status,
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

  // Combine all final segments into one transcript string
  const finalTranscript = segments.map(s => s.text).join(' ').trim();
  // Get the latest confidence from the last segment
  const latestConfidence = segments.length > 0 ? segments[segments.length - 1].confidence * 100 : null;

  return (
    <Card>
      <CardContent className="p-1 pt-0">
        <Stack spacing="xs">
          {error && (
            <Alert variant="destructive" className="text-xs p-1">
              {error}
            </Alert>
          )}
          
          <Section title={<span className="text-xs font-semibold">Transcription</span>}>
            <div className="flex space-x-1 mb-1">
              <Button
                type="button"
                variant="default"
                onClick={startRecording}
                disabled={isRecording}
                className="text-xs px-2 py-1 h-8"
              >
                Start Recording
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={isPaused ? resumeRecording : pauseRecording}
                disabled={!isRecording}
                className="text-xs px-2 py-1 h-8"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={stopRecording}
                disabled={!isRecording}
                className="text-xs px-2 py-1 h-8"
              >
                Stop
              </Button>
            </div>
            <div className="space-y-1">
              {/* Final Transcript Block */}
              {(finalTranscript || transcription.final) && (
                <div className="bg-muted rounded-md p-1">
                  <p className="text-xs">
                    {finalTranscript || transcription.final}
                  </p>
                  {/* Show latest confidence only while recording */}
                  {isRecording && latestConfidence !== null && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Confidence: {latestConfidence.toFixed(1)}%
                    </div>
                  )}
                </div>
              )}

              {/* Interim Transcript */}
              {transcription.interim && (
                <div className="bg-muted/50 rounded-md p-1">
                  <p className="text-xs text-muted-foreground italic">
                    {transcription.interim}
                  </p>
                </div>
              )}

              {/* No Transcription Message */}
              {!finalTranscript && !transcription.final && !transcription.interim && (
                <div className="bg-muted rounded-md p-1">
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

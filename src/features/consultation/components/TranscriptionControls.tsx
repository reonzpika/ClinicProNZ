'use client';

import React from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Alert } from '@/shared/components/ui/alert';

import { useTranscription } from '../hooks/useTranscription';

export function TranscriptionControls() {
  const {
    isRecording,
    isPaused,
    transcript,
    interimTranscript,
    segments,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useTranscription();

  // Combine all final segments into one transcript string
  const finalTranscript = segments.map(s => s.text).join(' ').trim();
  // Get the latest confidence from the last segment
  const latestConfidence = segments.length > 0 ? segments[segments.length - 1].confidence * 100 : null;

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
                onClick={stopRecording}
                disabled={!isRecording}
              >
                Stop
              </Button>
            </div>
          </Section>

          <Section title="Transcription">
            <div className="space-y-4">
              {/* Final Transcript Block */}
              {(finalTranscript || transcript) && (
                <div className="bg-muted rounded-md p-4">
                  <p className="text-sm">
                    {finalTranscript || transcript}
                  </p>
                  {/* Show latest confidence only while recording */}
                  {isRecording && latestConfidence !== null && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Confidence: {latestConfidence.toFixed(1)}%
                    </div>
                  )}
                </div>
              )}

              {/* Interim Transcript */}
              {interimTranscript && (
                <div className="bg-muted/50 rounded-md p-4">
                  <p className="text-sm text-muted-foreground italic">
                    {interimTranscript}
                  </p>
                </div>
              )}

              {/* No Transcription Message */}
              {!finalTranscript && !transcript && !interimTranscript && (
            <div className="bg-muted rounded-md p-4">
              <p className="text-sm text-muted-foreground">
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

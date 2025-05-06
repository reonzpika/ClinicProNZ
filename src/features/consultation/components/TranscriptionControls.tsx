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
    latestTranscription,
  error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useTranscription();

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

          <Section title="Latest Transcription">
            <div className="bg-muted rounded-md p-4">
              <p className="text-sm text-muted-foreground">
                {latestTranscription || 'No transcription available'}
              </p>
            </div>
          </Section>
        </Stack>
      </CardContent>
    </Card>
  );
}

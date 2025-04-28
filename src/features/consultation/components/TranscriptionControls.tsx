'use client';

import React, { useCallback, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Alert } from '@/shared/components/ui/alert';

type TranscriptionControlsProps = {
  onStartRecording?: () => void;
  onPauseRecording?: () => void;
  onStopRecording?: () => void;
  latestTranscription?: string;
  error?: string;
};

export function TranscriptionControls({
  onStartRecording,
  onPauseRecording,
  onStopRecording,
  latestTranscription = '',
  error,
}: TranscriptionControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleStartRecording = useCallback(() => {
    try {
      setIsRecording(true);
      setIsPaused(false);
      onStartRecording?.();
    } catch (err) {
      console.error('Failed to start recording:', err);
      setIsRecording(false);
      throw err;
    }
  }, [onStartRecording]);

  const handlePauseRecording = useCallback(() => {
    try {
      setIsPaused(!isPaused);
      onPauseRecording?.();
    } catch (err) {
      console.error('Failed to pause recording:', err);
      throw err;
    }
  }, [isPaused, onPauseRecording]);

  const handleStopRecording = useCallback(() => {
    try {
      setIsRecording(false);
      setIsPaused(false);
      onStopRecording?.();
    } catch (err) {
      console.error('Failed to stop recording:', err);
      throw err;
    }
  }, [onStopRecording]);

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
                onClick={handleStartRecording}
                disabled={isRecording}
              >
                Start Recording
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePauseRecording}
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

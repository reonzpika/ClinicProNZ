/* eslint-disable react/no-nested-components */
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
    isPaused,
    isTranscribing,
    transcript,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetTranscription,
    volumeLevel,
    noInputWarning,
    chunksCompleted,
    totalChunks,
  } = useTranscription();

  // Determine if we're waiting for speech to start
  const isWaitingForSpeech = isRecording && totalChunks === 0;

  // Pulsing dot for recording feedback
  const RecordingDot = () => (
    <span className="mr-2 inline-block size-3 animate-pulse rounded-full bg-red-500 align-middle" title="Recording" />
  );

  // Simple volume meter bar
  const VolumeMeter = () => (
    <div className="mb-1 mt-2 h-2 w-full rounded bg-gray-200">
      <div
        className="h-2 rounded bg-green-500"
        style={{ width: `${Math.min(volumeLevel * 20, 100)}%`, transition: 'width 0.1s' }}
      />
    </div>
  );

  if (collapsed) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-1 pb-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">Transcription</span>
            {isRecording && <RecordingDot />}
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

          <Section>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-1">
                {isRecording && <RecordingDot />}
                <span className="text-xs font-semibold">Transcription</span>
                {noInputWarning && !isWaitingForSpeech && (
                  <span className="ml-2 text-xs text-red-500">We're not hearing anything—check your mic.</span>
                )}
                {!transcript && !isRecording && totalChunks === 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    Click "Start Recording" to begin voice-activated transcription
                  </span>
                )}
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
                {isRecording && !isPaused && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={pauseRecording}
                    className="h-7 min-w-0 rounded border bg-white px-1 py-0.5 text-xs hover:bg-gray-100"
                  >
                    Pause
                  </Button>
                )}
                {isRecording && isPaused && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resumeRecording}
                    className="h-7 min-w-0 rounded border bg-white px-1 py-0.5 text-xs hover:bg-gray-100"
                  >
                    Resume
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

            {/* Volume meter and warning */}
            {isRecording && (
              <>
                <VolumeMeter />
                {isWaitingForSpeech && (
                  <div className="mt-1 text-xs font-medium text-blue-600">
                    🎤 Ready to record - speak to start recording
                  </div>
                )}
              </>
            )}

            {/* Live transcript stream */}
            {transcript && (isRecording || chunksCompleted > 0) && (
              <div className="mt-2">
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  Live Transcript
                  {' '}
                  {isRecording && '(updating as you speak)'}
                </div>
                <div className="max-h-64 overflow-y-auto rounded-md bg-muted p-2">
                  <p className="whitespace-pre-wrap text-xs leading-relaxed">{transcript}</p>
                  {isRecording && (
                    <span className="mt-1 inline-block h-3 w-1 animate-pulse bg-blue-500" />
                  )}
                </div>
              </div>
            )}

            <div className="mt-2 space-y-1">
              {/* Waiting for speech message */}
              {isWaitingForSpeech && (
                <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-800">
                  <p className="font-medium">🎤 Listening for your voice...</p>
                  <p className="mt-1">Recording will start automatically when you begin speaking.</p>
                </div>
              )}

              {/* Instructions for first-time users */}
              {!transcript && !isRecording && totalChunks === 0 && (
                <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-800">
                  <p className="font-medium">How it works:</p>
                  <ul className="ml-3 mt-1 list-disc space-y-0.5">
                    <li>Start recording - system waits for your voice</li>
                    <li>Speak naturally during your consultation</li>
                    <li>Transcript builds in real-time as you speak</li>
                    <li>Hit "Stop" when consultation is complete</li>
                  </ul>
                </div>
              )}
            </div>
          </Section>
        </Stack>
      </CardContent>
    </Card>
  );
}

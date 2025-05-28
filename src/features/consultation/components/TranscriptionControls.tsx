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

function formatTime(ms: number) {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

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
    chunkTranscripts,
    chunksCompleted,
    totalChunks,
  } = useTranscription();

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

  // Chunk status indicator
  const ChunkStatusBadge = ({ status }: { status: 'uploading' | 'transcribing' | 'completed' | 'failed' }) => {
    const colors = {
      uploading: 'bg-yellow-100 text-yellow-800',
      transcribing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    const labels = {
      uploading: 'Uploading',
      transcribing: 'Transcribing',
      completed: 'Done',
      failed: 'Failed',
    };

    return (
      <span className={`inline-block rounded px-1 py-0.5 text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (collapsed) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-1 pb-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">Transcription</span>
            {totalChunks > 0 && (
              <span className="text-xs text-muted-foreground">
                (
                {chunksCompleted}
                /
                {totalChunks}
                {' '}
                chunks)
              </span>
            )}
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
                {totalChunks > 0 && (
                  <span className="text-xs text-muted-foreground">
                    (
                    {chunksCompleted}
                    /
                    {totalChunks}
                    {' '}
                    chunks)
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
                {noInputWarning && (
                  <div className="mt-1 text-xs text-red-500">We're not hearing anything—check your mic.</div>
                )}
              </>
            )}

            {/* Real-time chunk status display */}
            {totalChunks > 0 && (
              <div className="mt-2">
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Auto-chunking on natural pauses (2s silence)
                </div>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {chunkTranscripts.map(chunk => (
                    <div key={chunk.chunk} className="flex items-center justify-between rounded border p-1">
                      <span className="font-mono text-xs">
                        Chunk
                        {' '}
                        {chunk.chunk}
                        {chunk.status === 'completed' && (
                          <>
                            {' '}
                            • Completed
                          </>
                        )}
                        {chunk.status !== 'completed' && (
                          <>
                            {' '}
                            •
                            {' '}
                            {formatTime(Date.now() - chunk.timestamp)}
                            {' '}
                            ago
                          </>
                        )}
                      </span>
                      <ChunkStatusBadge status={chunk.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live transcript stream as chunks complete */}
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

            {/* Individual chunk transcripts (expandable detail view) */}
            {chunkTranscripts.length > 0 && chunkTranscripts.some(c => c.status === 'completed' && c.text) && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                  View Individual Chunks (
                  {chunkTranscripts.filter(c => c.status === 'completed').length}
                  )
                </summary>
                <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                  {chunkTranscripts
                    .filter(chunk => chunk.status === 'completed' && chunk.text)
                    .map(chunk => (
                      <div key={chunk.chunk} className="rounded border p-2">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-mono text-xs text-muted-foreground">
                            Chunk
                            {' '}
                            {chunk.chunk}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Completed
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap text-xs">{chunk.text}</div>
                      </div>
                    ))}
                </div>
              </details>
            )}

            <div className="mt-2 space-y-1">
              {/* No Transcription Message */}
              {!transcript && !isRecording && totalChunks === 0 && (
                <div className="rounded-md bg-muted p-1">
                  <p className="text-xs text-muted-foreground">
                    Click "Start Recording" to begin voice-activated transcription
                  </p>
                </div>
              )}

              {/* Instructions for first-time users */}
              {!transcript && !isRecording && totalChunks === 0 && (
                <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-800">
                  <p className="font-medium">How it works:</p>
                  <ul className="ml-3 mt-1 list-disc space-y-0.5">
                    <li>Recording auto-splits on 2+ seconds of silence</li>
                    <li>Each chunk transcribes in real-time as you speak</li>
                    <li>Full transcript builds progressively</li>
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

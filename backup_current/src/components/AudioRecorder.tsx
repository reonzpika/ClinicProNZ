'use client';

import { ChevronDown, ChevronUp, Mic, MicOff } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ExpandableCard } from '@/components/ExpandableCard';
import { LiveTranscript } from '@/components/LiveTranscript';
import type { NoteGenerationConfig } from '@/components/note-generator/NoteGenerationControls';
import { Button } from '@/components/ui/button';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useConsultTimer } from '@/hooks/useConsultTimer';
import type { NoteGenerationSettings } from '@/hooks/useNoteGenerationSettings';

// Add specific error types
type NoteGenerationError =
  | 'EMPTY_TRANSCRIPT'
  | 'INVALID_TEMPLATE'
  | 'API_ERROR'
  | 'GENERATION_FAILED';

// Add error handling utility
const getNoteGenerationErrorMessage = (type: NoteGenerationError): string => {
  switch (type) {
    case 'EMPTY_TRANSCRIPT':
      return 'No transcript available to generate note';
    case 'INVALID_TEMPLATE':
      return 'Selected template is invalid';
    case 'API_ERROR':
      return 'Failed to connect to note generation service';
    case 'GENERATION_FAILED':
      return 'Failed to generate note. Please try again';
    default:
      return 'An unexpected error occurred';
  }
};

type AudioRecorderProps = {
  disabled?: boolean;
  settings: NoteGenerationSettings;
  onNoteGenerated: (formattedNote: string) => void;
  onTranscriptChange: (transcript: string) => void;
  onGenerateNote: (config: NoteGenerationConfig) => Promise<void>;
};

export function AudioRecorder({
  disabled,
  settings,
  onNoteGenerated,
  onTranscriptChange,
  onGenerateNote,
}: AudioRecorderProps) {
  const {
    isRecording,
    finalTranscript,
    interimTranscript,
    error: recordingError,
    startRecording,
    stopRecording: stopRecordingBase,
  } = useAudioRecording();

  const [showTranscript, setShowTranscript] = useState(false);
  const [_expandedCard, setExpandedCard] = useState<'transcript' | 'findings' | null>(null);
  const { startTimer, stopTimer } = useConsultTimer();

  // Wrap stopRecording to handle note generation
  const handleStopRecording = async () => {
    await stopRecordingBase();
    stopTimer();

    // Only generate if we have a transcript
    if (finalTranscript.trim()) {
      try {
        await onGenerateNote({
          ...settings,
          forceRegenerate: true,
        });
      } catch (error) {
        console.error('Failed to generate note after recording:', error);
      }
    }
  };

  const handleCardExpand = (cardType: 'transcript' | 'findings', expanded: boolean) => {
    if (expanded) {
      setExpandedCard(cardType);
    } else {
      setExpandedCard(null);
    }
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
      startTimer(); // Start the timer when recording starts
    } catch (error) {
      // Handle any recording start errors
      console.error('Failed to start recording:', error);
    }
  };

  // Add effect to send transcript updates
  useEffect(() => {
    onTranscriptChange(finalTranscript);
  }, [finalTranscript, onTranscriptChange]);

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            variant={isRecording ? 'destructive' : 'default'}
            className="gap-2"
            disabled={disabled || !settings.templateId}
          >
            {isRecording
              ? (
                  <>
                    <MicOff className="size-4" />
                    Stop Recording
                  </>
                )
              : (
                  <>
                    <Mic className="size-4" />
                    Start Recording
                  </>
                )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className="gap-1"
          >
            {showTranscript ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            Transcript
          </Button>
        </div>
      </div>

      {/* Live Transcript - Hidden by Default */}
      {showTranscript && (
        <ExpandableCard
          title="Live Transcript"
          onExpand={expanded => handleCardExpand('transcript', expanded)}
        >
          <LiveTranscript
            final={finalTranscript}
            interim={interimTranscript}
          />
        </ExpandableCard>
      )}

      {/* Error Messages */}
      {recordingError && (
        <div className="text-sm text-red-500">
          {recordingError}
        </div>
      )}
    </div>
  );
}

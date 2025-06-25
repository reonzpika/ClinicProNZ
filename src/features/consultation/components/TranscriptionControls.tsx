/* eslint-disable react/no-nested-components */
'use client';

import { Settings, Smartphone } from 'lucide-react';
import React, { useState } from 'react';

import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

import { useTranscription } from '../hooks/useTranscription';
import { AudioSettingsModal } from './AudioSettingsModal';
import { ConsentModal } from './ConsentModal';
import { MobileRecordingQR } from './MobileRecordingQR';

export function TranscriptionControls({ collapsed, onExpand, isMinimized }: { collapsed?: boolean; onExpand?: () => void; isMinimized?: boolean }) {
  const {
    error: contextError,
    consentObtained,
    setConsentObtained,
    mobileRecording,
    isDesktopRecordingDisabled,
  } = useConsultation();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showMobileRecording, setShowMobileRecording] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isMinimized);

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

  // Handle start recording - show consent modal first if consent not obtained
  const handleStartRecording = () => {
    if (!consentObtained) {
      setShowConsentModal(true);
    } else {
      startRecording();
    }
  };

  // Handle consent confirmation
  const handleConsentConfirm = () => {
    setConsentObtained(true);
    setShowConsentModal(false);
    startRecording();
  };

  // Handle consent cancellation
  const handleConsentCancel = () => {
    setShowConsentModal(false);
  };

  // Mobile recording button status and styling
  const getMobileButtonStyle = () => {
    if (mobileRecording.isActive) {
      // Check if QR is expired
      const now = new Date().getTime();
      const expiry = mobileRecording.qrExpiry ? new Date(mobileRecording.qrExpiry).getTime() : 0;
      const isExpired = expiry > 0 && now >= expiry;

      if (isExpired) {
        return {
          className: 'h-7 min-w-0 rounded border bg-orange-100 px-1 py-0.5 text-xs text-orange-700 hover:bg-orange-200',
          title: 'Mobile recording expired - click to reconnect',
        };
      }

      return {
        className: 'h-7 min-w-0 rounded border bg-green-100 px-1 py-0.5 text-xs text-green-700 hover:bg-green-200',
        title: 'Mobile recording active - click to manage',
      };
    }

    return {
      className: 'h-7 min-w-0 rounded border bg-white px-1 py-0.5 text-xs hover:bg-gray-100',
      title: 'Connect mobile device for recording',
    };
  };

  // Determine if we're waiting for speech to start
  const isWaitingForSpeech = isRecording && totalChunks === 0;

  // Pulsing dot for recording feedback
  const RecordingDot = () => (
    <span className="mr-2 inline-block size-3 animate-pulse rounded-full bg-red-500 align-middle" title="Recording" />
  );

  // Audio input indicator - pulsing circle
  const AudioIndicator = () => {
    const intensity = Math.min(volumeLevel, 1);
    const scale = 1 + intensity * 0.5; // Scale from 1 to 1.5
    const opacity = 0.4 + intensity * 0.6; // Opacity from 0.4 to 1

    return (
      <div className="flex justify-center py-1">
        <div
          className="size-3 rounded-full bg-green-500 transition-all duration-100"
          style={{
            transform: `scale(${scale})`,
            opacity,
            boxShadow: intensity > 0.3 ? `0 0 ${4 + intensity * 8}px rgba(34, 197, 94, 0.6)` : 'none',
          }}
        />
      </div>
    );
  };

  // Handle minimized state (in documentation mode)
  if (isMinimized) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">Consultation Notes</span>
            {isRecording && <RecordingDot />}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </CardHeader>
        {isExpanded && (
          <CardContent className="p-2 pt-0">
            <Stack spacing="sm">
              {(error || contextError) && (
                <Alert variant="destructive" className="p-2 text-xs">
                  {error || contextError}
                </Alert>
              )}

              <Section>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-1">
                    {isRecording && <RecordingDot />}
                    <span className="text-xs font-semibold">Audio Recording</span>
                  </div>
                  <div className="flex gap-1">
                    {!isRecording && !isTranscribing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleStartRecording}
                        disabled={isDesktopRecordingDisabled()}
                        className="h-7 min-w-0 rounded border bg-white px-2 py-0.5 text-xs hover:bg-gray-100"
                      >
                        Start Recording
                      </Button>
                    )}
                    {isRecording && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={stopRecording}
                        className="h-7 min-w-0 rounded border bg-white px-2 py-0.5 text-xs hover:bg-gray-100"
                      >
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
              </Section>

              {transcript && (
                <Section>
                  <div className="rounded border border-slate-200 bg-white p-2 text-xs">
                    <div className="max-h-20 overflow-y-auto text-slate-700">
                      {transcript}
                    </div>
                  </div>
                </Section>
              )}
            </Stack>
          </CardContent>
        )}
      </Card>
    );
  }

  // Handle original collapsed state (backwards compatibility)
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

          {/* Mobile Recording Status */}
          {mobileRecording.isActive && (
            <Alert variant="default" className="border-blue-200 bg-blue-50 p-1 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Mobile recording active</div>
                  <div className="text-xs text-muted-foreground">
                    Desktop recording disabled while mobile session is active
                  </div>
                </div>
                <div className="size-2 animate-pulse rounded-full bg-blue-500" />
              </div>
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
                    onClick={handleStartRecording}
                    disabled={isDesktopRecordingDisabled()}
                    className="h-7 min-w-0 rounded border bg-white px-1 py-0.5 text-xs hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                <Button
                  onClick={() => setShowMobileRecording(true)}
                  variant="outline"
                  size="sm"
                  className={getMobileButtonStyle().className}
                  title={getMobileButtonStyle().title}
                >
                  <Smartphone className="size-3" />
                  {mobileRecording.isActive && (
                    <span className="ml-1 size-1.5 animate-pulse rounded-full bg-current" />
                  )}
                </Button>
                <Button
                  onClick={() => setShowAudioSettings(true)}
                  variant="outline"
                  size="sm"
                  className="h-7 min-w-0 rounded border bg-white px-1 py-0.5 text-xs hover:bg-gray-100"
                  title="Audio Settings"
                >
                  <Settings className="size-3" />
                </Button>
              </div>
            </div>

            {/* Audio input indicator */}
            {isRecording && (
              <AudioIndicator />
            )}

            {/* Live transcript stream */}
            {transcript && (isRecording || chunksCompleted > 0 || mobileRecording.isActive) && (
              <div className="mt-2">
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  {mobileRecording.isActive ? 'Mobile Recording Transcript' : 'Live Transcript'}
                  {' '}
                  {isRecording && '(updating as you speak)'}
                  {mobileRecording.isActive && '(from mobile device)'}
                </div>
                <div className="max-h-64 overflow-y-auto rounded-md bg-muted p-2">
                  <p className="whitespace-pre-wrap text-xs leading-relaxed">{transcript}</p>
                  {isRecording && (
                    <span className="mt-1 inline-block h-3 w-1 animate-pulse bg-blue-500" />
                  )}
                  {mobileRecording.isActive && !isRecording && (
                    <span className="mt-1 inline-block h-3 w-1 animate-pulse bg-blue-500" />
                  )}
                </div>
              </div>
            )}

            <div className="mt-2 space-y-1">
              {/* Instructions for first-time users */}
              {!transcript && !isRecording && totalChunks === 0 && (
                <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-800">
                  <p className="font-medium">Audio Input Mode:</p>
                  <ul className="ml-3 mt-1 list-disc space-y-0.5">
                    <li>Click "Start Recording" - system waits for your voice</li>
                    <li>Speak naturally during consultation - transcript builds in real-time</li>
                    <li>Use "Additional Info" below to type vitals, observations, or assessment details</li>
                    <li>Click "Stop" when complete, then "Generate Notes" for your final consultation note</li>
                  </ul>
                </div>
              )}
            </div>
          </Section>
        </Stack>
      </CardContent>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onConfirm={handleConsentConfirm}
        onCancel={handleConsentCancel}
      />

      {/* Audio Settings Modal */}
      <AudioSettingsModal
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
      />

      {/* Mobile Recording Modal */}
      <MobileRecordingQR
        isOpen={showMobileRecording}
        onClose={() => setShowMobileRecording(false)}
      />
    </Card>
  );
}

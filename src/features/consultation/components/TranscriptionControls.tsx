/* eslint-disable react/no-nested-components */
'use client';

import { ChevronDown, ChevronUp, Settings, Smartphone, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Stack } from '@/shared/components/layout/Stack';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

import { useTranscription } from '../hooks/useTranscription';
import { AudioSettingsModal } from './AudioSettingsModal';
import { ConsentModal } from './ConsentModal';
import { ConsultationInputHeader } from './ConsultationInputHeader';
import { MobileRecordingQRV2 } from './MobileRecordingQRV2';

export function TranscriptionControls({
  collapsed,
  onExpand,
  isMinimized,
  onForceDisconnectDevice,
}: {
  collapsed?: boolean;
  onExpand?: () => void;
  isMinimized?: boolean;
  onForceDisconnectDevice?: (deviceId: string) => void;
}) {
  const {
    error: contextError,
    consentObtained,
    setConsentObtained,
    mobileV2 = { isEnabled: false, token: null, connectedDevices: [], connectionStatus: 'disconnected' },
    transcription: contextTranscription,
    removeMobileV2Device,
  } = useConsultation();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showMobileRecordingV2, setShowMobileRecordingV2] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isMinimized);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [showNoTranscriptWarning, setShowNoTranscriptWarning] = useState(false);
  const useMobileV2 = true; // Mobile V2 is now enabled by default

  const {
    isRecording,
    isPaused,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetTranscription,
    volumeLevel,
    noInputWarning,
    totalChunks,
  } = useTranscription();

  // Always use context transcript for unified display (includes both desktop and mobile)
  const transcript = contextTranscription.transcript;

  // Filter to only mobile devices for UI display
  const connectedMobileDevices = mobileV2.connectedDevices.filter(d => d.deviceType === 'Mobile');
  const hasMobileDevices = connectedMobileDevices.length > 0;

  // Track recording time and transcript warning
  useEffect(() => {
    if (isRecording && !recordingStartTime) {
      setRecordingStartTime(Date.now());
      setShowNoTranscriptWarning(false);
      setTranscriptExpanded(false); // Start minimized
    } else if (!isRecording && recordingStartTime) {
      setRecordingStartTime(null);
      setShowNoTranscriptWarning(false);
      setTranscriptExpanded(true); // Auto-expand after recording for review
    }
  }, [isRecording, recordingStartTime]);

  // Check for no transcript warning after 40 seconds
  useEffect(() => {
    if (isRecording && recordingStartTime && !transcript.trim()) {
      const timer = setTimeout(() => {
        setShowNoTranscriptWarning(true);
      }, 40000); // 40 seconds

      return () => clearTimeout(timer);
    } else if (transcript.trim()) {
      setShowNoTranscriptWarning(false);
    }

    return undefined;
  }, [isRecording, recordingStartTime, transcript]);

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

  // Mobile V2 recording button status and styling
  const getMobileButtonStyle = () => {
    if (hasMobileDevices) {
      return {
        className: 'h-7 min-w-0 rounded border bg-green-100 px-1 py-0.5 text-xs text-green-700 hover:bg-green-200',
        title: `${connectedMobileDevices.length} mobile device(s) connected - click to manage`,
      };
    }
    return {
      className: 'h-7 min-w-0 rounded border bg-blue-100 px-1 py-0.5 text-xs text-blue-700 hover:bg-blue-200',
      title: 'Mobile Recording V2 - click to connect',
    };
  };

  // Handle mobile button click
  const handleMobileClick = () => {
    setShowMobileRecordingV2(true);
  };

  // Handle device disconnect
  const handleDeviceDisconnect = (deviceId: string) => {
    if (onForceDisconnectDevice) {
      // Use the prop function which handles both sending disconnect message and local state removal
      onForceDisconnectDevice(deviceId);
    } else {
      // Fallback to just removing from local state
      removeMobileV2Device?.(deviceId);
    }
  };

  // Determine if we're waiting for speech to start
  const isWaitingForSpeech = isRecording && totalChunks === 0;

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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">Consultation Note</span>
          </div>
          <button
            type="button"
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
        {isExpanded && transcript && (
          <div className="rounded border border-slate-200 bg-white p-3">
            <div className="max-h-20 overflow-y-auto text-sm text-slate-700">
              {transcript}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle original collapsed state (backwards compatibility)
  if (collapsed) {
    return (
      <Card>
        <CardHeader className="p-2">
          <div className="flex items-center justify-between">
            <ConsultationInputHeader
              mode="audio"
              isRecording={isRecording}
              status={transcript ? 'Ready for review' : undefined}
            />
            <Button type="button" size="sm" className="text-xs" onClick={onExpand}>
              Expand
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ConsultationInputHeader
        mode="audio"
        isRecording={isRecording}
        status={transcript && !isRecording ? 'Ready for review' : undefined}
        onHelpToggle={() => setShowHelp(!showHelp)}
        showHelp={showHelp}
      />

      <div>
        <Stack spacing="sm">
          {(error || contextError) && (
            <Alert variant="destructive" className="p-2 text-xs">
              {error || contextError}
            </Alert>
          )}

          {/* Mobile Recording Status - V2 */}
          {useMobileV2 && hasMobileDevices && (
            <Alert variant="default" className="border-green-200 bg-green-50 p-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    Mobile V2 connected (
                    {connectedMobileDevices.length}
                    )
                  </div>
                  <div className="size-2 animate-pulse rounded-full bg-green-500" />
                </div>
                <div className="space-y-1">
                  {connectedMobileDevices.map(device => (
                    <div key={device.deviceId} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{device.deviceName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeviceDisconnect(device.deviceId)}
                        className="size-4 p-0 text-muted-foreground hover:text-red-500"
                        title="Disconnect device"
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Alert>
          )}

          {/* Recording Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {noInputWarning && !isWaitingForSpeech && (
                <span className="text-xs text-red-500">No audio detected—check your mic</span>
              )}
              {!transcript && !isRecording && totalChunks === 0 && (
                <span className="text-xs text-slate-500">
                  Ready to record voice-activated transcription
                </span>
              )}
            </div>

            <div className="flex gap-1">
              {!isRecording && !isTranscribing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStartRecording}
                  className="h-8 px-3 text-xs"
                >
                  Start Recording
                </Button>
              )}
              {isRecording && !isPaused && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={pauseRecording}
                  className="h-8 px-3 text-xs"
                >
                  Pause
                </Button>
              )}
              {isRecording && isPaused && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resumeRecording}
                  className="h-8 px-3 text-xs"
                >
                  Resume
                </Button>
              )}
              {isRecording && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={stopRecording}
                  className="h-8 px-3 text-xs"
                >
                  Stop Recording
                </Button>
              )}
              {!isRecording && !isTranscribing && transcript && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetTranscription}
                  className="h-8 px-3 text-xs"
                >
                  Re-record
                </Button>
              )}
              <Button
                onClick={handleMobileClick}
                variant="outline"
                size="sm"
                className={getMobileButtonStyle().className}
                title={getMobileButtonStyle().title}
              >
                <Smartphone className="size-3" />
                {hasMobileDevices && (
                  <span className="ml-1 size-1.5 animate-pulse rounded-full bg-current" />
                )}
              </Button>
              <Button
                onClick={() => setShowAudioSettings(true)}
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                title="Audio Settings"
              >
                <Settings className="size-3" />
              </Button>
            </div>
          </div>

          {/* Audio input indicator */}
          {isRecording && <AudioIndicator />}

          {/* Minimized transcript bar while recording */}
          {isRecording && !transcriptExpanded && (
            <div
              className={`cursor-pointer rounded-md border p-3 transition-colors hover:bg-slate-50 ${
                showNoTranscriptWarning ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-slate-50'
              }`}
              onClick={() => setTranscriptExpanded(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setTranscriptExpanded(true);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Show live transcript"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block size-2 animate-pulse rounded-full bg-blue-500" />
                  <span className="text-sm text-slate-700">
                    {transcript.trim() ? 'Transcription running...' : 'Listening for speech...'}
                  </span>
                  {showNoTranscriptWarning && (
                    <span className="text-xs text-orange-600">No transcript processed</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span>Click to show live transcript</span>
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          )}

          {/* Transcript area - conditionally visible */}
          <div className="space-y-2">
            {isRecording && transcriptExpanded && (
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-slate-600">
                  Live Transcript
                  {' '}
                  {(useMobileV2 && hasMobileDevices) && '(from mobile device)'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTranscriptExpanded(false)}
                  className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                >
                  Minimize
                  {' '}
                  <ChevronUp size={12} className="ml-1" />
                </Button>
              </div>
            )}
            {!isRecording && transcript && (
              <div className="text-xs font-medium text-slate-600">
                Transcribed Text — Edit as needed
              </div>
            )}
            {!isRecording && !transcript && (
              <div className="text-xs font-medium text-slate-600">
                Transcript
              </div>
            )}

            {/* Show text box only when there's transcription or currently recording */}
            {(transcript || isRecording)
              ? (
                  <div className="max-h-64 overflow-y-auto rounded-md border bg-white p-3">
                    {!isRecording
                      ? (
                          <textarea
                            value={transcript}
                            onChange={(_e) => {
                              // Allow editing after recording stops
                              // This would need to be connected to a context method to update transcript
                            }}
                            className="w-full resize-none border-none text-sm leading-relaxed focus:outline-none"
                            placeholder="Transcription will appear here..."
                            rows={Math.min(Math.max(transcript.split('\n').length || 3, 3), 12)}
                          />
                        )
                      : (
                          <div>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{transcript || 'Listening for speech...'}</p>
                            <span className="mt-1 inline-block h-3 w-1 animate-pulse bg-blue-500" />
                          </div>
                        )}
                  </div>
                )
              : (
                /* Show message when no transcription and not recording */
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">Transcription will appear here</p>
                  </div>
                )}
          </div>

          {/* Help section (hidden by default) */}
          {showHelp && (
            <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
              <p className="font-medium">Audio Input Mode:</p>
              <ul className="ml-3 mt-1 list-disc space-y-0.5">
                <li>Click "Start Recording" - system waits for your voice</li>
                <li>Speak naturally during consultation - transcript builds in real-time</li>
                <li>Use "Additional Info" below to type vitals, observations, or assessment details</li>
                <li>Click "Stop" when complete, then "Generate Notes" for your final consultation note</li>
              </ul>
            </div>
          )}
        </Stack>
      </div>

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

      {/* Mobile Recording Modal - V2 */}
      <MobileRecordingQRV2
        isOpen={showMobileRecordingV2}
        onClose={() => setShowMobileRecordingV2(false)}
      />
    </div>
  );
}

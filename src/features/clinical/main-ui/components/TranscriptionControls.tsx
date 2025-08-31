/* eslint-disable react/no-nested-components */
'use client';

import { useAuth } from '@clerk/nextjs';
import { ChevronDown, ChevronUp, Info, Mic, Settings, Smartphone } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { FeatureFeedbackButton } from '@/src/shared/components/FeatureFeedbackButton';
import { Stack } from '@/src/shared/components/layout/Stack';
import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardHeader } from '@/src/shared/components/ui/card';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';

// import { createAuthHeaders } from '@/src/shared/utils';
import { AudioSettingsModal } from '../../mobile/components/AudioSettingsModal';
import { MobileRecordingQRV2 } from '../../mobile/components/MobileRecordingQRV2';
import { ConsentModal } from '../../session-management/components/ConsentModal';
import { useTranscription } from '../hooks/useTranscription';
import { ConsultationInputHeader } from './ConsultationInputHeader';
import { EnhancedTranscriptionDisplay } from './EnhancedTranscriptionDisplay';

export function TranscriptionControls({
  collapsed,
  onExpand,
  isMinimized,
  mobileIsRecording = false,
}: {
  collapsed?: boolean;
  onExpand?: () => void;
  isMinimized?: boolean;
  mobileIsRecording?: boolean;
}) {
  const { isSignedIn } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();

  // 🆕 FEATURE FLAG: Enhanced transcription for admin tier only
  const showEnhancedTranscription = userTier === 'admin';

  const {
    error: contextError,
    consentObtained,
    setConsentObtained,
    transcription: contextTranscription,
    inputMode,
    setInputMode,
  } = useConsultationStores();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showMobileRecordingV2, setShowMobileRecordingV2] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isMinimized);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [showNoTranscriptWarning, setShowNoTranscriptWarning] = useState(false);
  const [canCreateSession, setCanCreateSession] = useState<boolean>(true);

  // Reset expansion state when isMinimized prop changes
  useEffect(() => {
    setIsExpanded(!isMinimized);
  }, [isMinimized]);
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
    clearTranscription,

    volumeLevel,
    noInputWarning,
    totalChunks,
  } = useTranscription();

  // Use regular transcript since diarization is disabled
  const transcript = contextTranscription.transcript;

  // 🐛 DEBUG: Log tier and enhanced transcription status
  // debug removed

  // Simplified: always show mobile controls and QR
  const hasMobileDevices = true;
  const [pendingControl, setPendingControl] = useState<null | 'start' | 'stop'>(null);
  const [controlError, setControlError] = useState<string | null>(null);
  const [controlAckTimer, setControlAckTimer] = useState<any>(null);

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

  // Acknowledge timer cleanup
  useEffect(() => {
    return () => {
      if (controlAckTimer) {
 clearTimeout(controlAckTimer);
}
    };
  }, [controlAckTimer]);

  // Observe recording status to acknowledge control
  useEffect(() => {
    if (pendingControl === 'start' && mobileIsRecording) {
      setPendingControl(null);
      setControlError(null);
      if (controlAckTimer) {
 clearTimeout(controlAckTimer);
}
    }
    if (pendingControl === 'stop' && !mobileIsRecording) {
      setPendingControl(null);
      setControlError(null);
      if (controlAckTimer) {
 clearTimeout(controlAckTimer);
}
    }
  }, [mobileIsRecording, pendingControl, controlAckTimer]);

  // Remote control handlers (send via global Ably bridge exposed in ConsultationPage)
  const sendMobileControl = async (action: 'start' | 'stop') => {
    try {
      setControlError(null);
      setPendingControl(action);
      // Send via global bridge (set in ConsultationPage)
      const ok = typeof window !== 'undefined'
        && (window as any).ablySyncHook
        && (window as any).ablySyncHook.sendRecordingControl
        && (window as any).ablySyncHook.sendRecordingControl(action);
      if (!ok) {
        setPendingControl(null);
        setControlError('Mobile not connected. Please open the mobile page and unlock the screen.');
        return;
      }
      // Start ack timeout (3s)
      const t = setTimeout(() => {
        setPendingControl(null);
        setControlError('Mobile did not respond. Ensure the phone is unlocked and the mobile page is active.');
      }, 3000);
      setControlAckTimer(t);
    } catch (e) {
      setPendingControl(null);
      setControlError(e instanceof Error ? e.message : 'Failed to send control command');
    }
  };

  // Only authenticated users can create sessions
  useEffect(() => {
    setCanCreateSession(!!isSignedIn);
  }, [isSignedIn]);

  // Handle start recording - show consent modal first if consent not obtained
  const handleStartRecording = () => {
    // Check authentication status
    if (!isSignedIn && !canCreateSession) {
      // Session limit reached - UI will show appropriate feedback
      return;
    }

    if (!consentObtained) {
      setShowConsentModal(true);
    } else {
      startRecording();
    }
  };

  // Handle consent confirmation
  const handleConsentConfirm = () => {
    // Check authentication status
    if (!isSignedIn && !canCreateSession) {
      console.warn('Cannot start recording: session limit reached');
      setShowConsentModal(false);
      return;
    }

    setConsentObtained(true);
    setShowConsentModal(false);
    startRecording();
  };

  // Handle consent cancellation
  const handleConsentCancel = () => {
    setShowConsentModal(false);
  };

  // Mobile V2 recording button status and styling - removed unused function

  // Handle mobile button click
  const handleMobileClick = () => {
    setShowMobileRecordingV2(true);
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
    const hasTranscript = transcript && transcript.trim().length > 0;
    const wordCount = hasTranscript ? transcript.split(/\s+/).filter((word: string) => word.length > 0).length : 0;
    const charCount = hasTranscript ? transcript.length : 0;
    const previewText = hasTranscript ? transcript.substring(0, 150) : '';
    const needsTruncation = hasTranscript && transcript.length > 150;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Mic size={12} className="text-slate-600" />
              <span className="text-xs font-medium text-slate-700">Audio Transcription</span>
            </div>
            {isMobileConnected && (
              <span className="text-xs text-green-600">📱 Mobile Synced</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasTranscript && (
              <span className="text-xs text-slate-500">
                {wordCount}
                {' '}
                words,
                {charCount}
                {' '}
                chars
              </span>
            )}
            <button
              type="button"
              className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>
        </div>

        {/* Preview when collapsed */}
        {!isExpanded && hasTranscript && (
          <div className="rounded border border-slate-200 bg-slate-50 p-2">
            <div className="text-sm leading-relaxed text-slate-700">
              {previewText}
              {needsTruncation && (
                <span className="text-slate-500">
                  ...
                  {' '}
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    (click to expand)
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* No content state */}
        {!isExpanded && !hasTranscript && (
          <div className="rounded border border-slate-200 bg-slate-50 p-2">
            <div className="text-sm italic text-slate-500">
              No audio transcription yet...
            </div>
          </div>
        )}

        {/* Full content when expanded */}
        {isExpanded && (
          <div className="rounded border border-slate-200 bg-white p-3">
            <div className="max-h-32 overflow-y-auto text-sm leading-relaxed text-slate-700">
              {hasTranscript ? transcript : 'No audio transcription available yet...'}
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Mic size={16} className="text-slate-600" />
            <h3 className="text-sm font-medium text-slate-700">Consultation Note</h3>
          </div>
          <div className="flex items-center gap-1">
            {isRecording && (
              <>
                <span className="inline-block size-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs text-red-600">Recording...</span>
              </>
            )}
            {mobileIsRecording && !isRecording && (
              <>
                <span className="inline-block size-2 animate-pulse rounded-full bg-blue-500" />
                <span className="animate-pulse text-xs text-blue-600">Mobile device recording...</span>
              </>
            )}
            {transcript && !isRecording && (
              <span className="text-xs text-slate-600">Ready for review</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newInputMode = inputMode === 'audio' ? 'typed' : 'audio';
              setInputMode(newInputMode);
            }}
            className="cursor-pointer text-xs font-medium text-green-600 hover:text-green-800 hover:underline"
            title={`Click to switch to ${inputMode === 'audio' ? 'typed' : 'audio'} mode`}
          >
            {inputMode === 'audio' ? 'Audio' : 'Typed'}
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="size-6 p-0 text-slate-500 hover:text-slate-700"
            title="Show help"
          >
            <Info size={14} />
          </Button>
          <FeatureFeedbackButton
            feature="transcription"
            context={`Transcript length: ${transcript?.length || 0} chars, Recording time: ${recordingStartTime ? Math.round((Date.now() - recordingStartTime) / 1000) : 0}s, Recording state: ${isRecording ? 'active' : 'stopped'}`}
            variant="minimal"
          />
        </div>
      </div>

      <div>
        <Stack spacing="none" className="space-y-2">
          {(error || contextError) && (
            <Alert variant="destructive" className="p-3 text-xs">
              <div className="space-y-2">
                <div className="whitespace-pre-line leading-relaxed">
                  {error || contextError}
                </div>
                {/* Show Reset Audio button for audio initialization errors */}
                {(error?.includes('Microphone not available')
                  || error?.includes('device not found')
                  || error?.includes('Failed to initialize audio')) && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        // Reset audio permissions if needed
                        window.location.reload();
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      Reset Audio & Refresh
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => clearTranscription()}
                      className="h-7 px-2 text-xs"
                    >
                      Clear Error
                    </Button>
                  </div>
                )}
              </div>
            </Alert>
          )}

          {/* Recording Controls */}
          <div className="space-y-2">
            {/* Status and Warnings */}
            {noInputWarning && !isWaitingForSpeech && (
              <div className="text-xs text-red-500">No audio detected—check your mic</div>
            )}

            {/* Primary Recording Options */}
            {!isRecording && !isTranscribing
              ? (
                  <div className="space-y-2">
                    {/* Description and Mobile Recording Button - Same Line */}
                    <div className="flex items-center justify-between">
                      <div className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                        Better audio with mobile recording - 30 second setup
                      </div>

                      {/* Right side: Status indicator + Mobile buttons */}
                      <div className="flex items-center gap-2">
                        {/* Mobile Recording Button */}
                        <Button
                          type="button"
                          onClick={handleMobileClick}
                          disabled={(!isSignedIn && !canCreateSession)}
                          className="h-8 bg-blue-600 px-3 text-xs text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                          title={!isSignedIn && !canCreateSession ? 'Session limit reached - see Usage Dashboard for upgrade options' : ''}
                        >
                          <Smartphone className="mr-1 size-3" />
                          Connect Mobile
                        </Button>
                        {/* Remote control buttons when connected */}
                        {!mobileIsRecording && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => sendMobileControl('start')}
                            disabled={!!pendingControl}
                            className="h-8 px-3 text-xs"
                          >
                            Start on mobile
                          </Button>
                        )}
                        {mobileIsRecording && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => sendMobileControl('stop')}
                            disabled={!!pendingControl}
                            className="h-8 px-3 text-xs"
                          >
                            Stop on mobile
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Desktop Recording Option */}
                    <div className="flex justify-end">
                      <div className="relative">
                        <details className="group">
                          <summary className="flex cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
                            <span>Or use desktop recording</span>
                            <ChevronDown className="size-3 transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="absolute right-0 z-10 mt-1 min-w-[200px] rounded-md border bg-white p-2 shadow-lg">
                            <div className="space-y-1">
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-xs text-slate-600">Desktop Recording</span>
                                <Button
                                  onClick={() => setShowAudioSettings(true)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 px-1 text-xs text-slate-500 hover:text-slate-700"
                                  title="Audio Settings"
                                >
                                  <Settings className="mr-1 size-3" />
                                  Settings
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleStartRecording}
                                disabled={!canCreateSession} // Removed canStartRecording check
                                className="h-7 w-full border-slate-300 text-xs disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                title={!isSignedIn && !canCreateSession ? 'Session limit reached - see Usage Dashboard for upgrade options' : ''}
                              >
                                Start Desktop Recording
                              </Button>
                              <p className="text-center text-xs text-slate-500">
                                Backup option - stay near computer
                              </p>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                )
              : (
            /* Recording Controls (Active State) */
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {hasMobileDevices && isRecording && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <div className="size-2 animate-pulse rounded-full bg-green-500" />
                          Recording from mobile
                        </div>
                      )}
                      {!hasMobileDevices && isRecording && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <div className="size-2 animate-pulse rounded-full bg-blue-500" />
                          Recording from desktop
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!isRecording && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => sendMobileControl('start')}
                          disabled={!!pendingControl}
                          className="h-8 px-3 text-xs"
                        >
                          Start on mobile
                        </Button>
                      )}
                      {isRecording && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => sendMobileControl('stop')}
                          disabled={!!pendingControl}
                          className="h-8 px-3 text-xs"
                        >
                          Stop on mobile
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
                      {transcript && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearTranscription}
                          className="h-8 px-3 text-xs"
                        >
                          Re-record
                        </Button>
                      )}
                    </div>
                  </div>
                )}
          </div>

          {/* Remote control errors */}
          {controlError && (
            <Alert variant="destructive" className="p-2 text-xs">
              {controlError}
            </Alert>
          )}

          {/* Audio input indicator */}
          {isRecording && <AudioIndicator />}

          {/* Minimized transcript bar while recording */}
          {isRecording && !transcriptExpanded && (
            <div
              className={`cursor-pointer rounded-md border p-2 transition-colors hover:bg-slate-50 ${
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
                    {transcript.trim() ? 'Transcribing...' : 'Listening...'}
                  </span>
                  {showNoTranscriptWarning && (
                    <span className="text-xs text-orange-600">No transcript</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span>Show transcript</span>
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          )}

          {/* Transcript area - conditionally visible */}
          <div className="space-y-1">
            {isRecording && transcriptExpanded && (
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-slate-600">
                  Live Transcript
                  {' '}
                  {(useMobileV2 && hasMobileDevices) && '(mobile)'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTranscriptExpanded(false)}
                  className="h-5 px-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Minimize
                  {' '}
                  <ChevronUp size={12} className="ml-1" />
                </Button>
              </div>
            )}
            {!isRecording && transcript && (
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-slate-600">
                  Transcribed Text — Edit as needed
                </div>
              </div>
            )}

            {/* 🆕 UPDATED: Transcription display with tier-based feature flag */}
            {(transcript || isRecording)
              ? (
                  showEnhancedTranscription
                    ? (
                        <EnhancedTranscriptionDisplay
                          transcript={transcript}
                          confidence={contextTranscription.confidence}
                          words={contextTranscription.words}
                          isRecording={isRecording}
                          onEdit={(newText) => {
                            // TODO: Implement transcript editing
                            void newText;
                          }}
                        />
                      )
                    : (
                        // ✅ EXACT EXISTING CODE - unchanged for non-admin users
                        <div className="max-h-64 overflow-y-auto rounded-md border bg-white p-2">
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
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {transcript || 'Listening for speech...'}
                                  </p>
                                  <span className="mt-1 inline-block h-3 w-1 animate-pulse bg-blue-500" />
                                </div>
                              )}
                        </div>
                      )
                )
              : (
            // ✅ UNCHANGED: Empty state
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                    <p className="text-sm text-slate-500">Transcription will appear here</p>
                  </div>
                )}
          </div>

          {/* Help section (hidden by default) */}
          {showHelp && (
            <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
              <p className="font-medium">Audio Recording Guide:</p>
              <div className="mt-2 space-y-2">
                <div>
                  <p className="font-medium text-green-700">Mobile Recording (Recommended):</p>
                  <ul className="ml-3 mt-1 list-disc space-y-0.5">
                    <li>Scan QR code with your phone - takes 30 seconds</li>
                    <li>Use your phone's microphone for recording</li>
                    <li>No need to stay near the computer</li>
                    <li>Start/stop recording from your phone</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Desktop Recording:</p>
                  <ul className="ml-3 mt-1 list-disc space-y-0.5">
                    <li>Good backup option if mobile setup fails</li>
                    <li>Must stay near computer during consultation</li>
                    <li>Audio quality depends on your computer's microphone</li>
                  </ul>
                </div>
                <div className="border-t border-blue-200 pt-2">
                  <p className="font-medium">General Tips:</p>
                  <ul className="ml-3 mt-1 list-disc space-y-0.5">
                    <li>Speak naturally - transcript builds in real-time</li>
                    <li>Use "Additional Info" below for vitals, observations, assessments</li>
                    <li>Click "Generate Notes" when complete for your final consultation note</li>
                  </ul>
                </div>
              </div>
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

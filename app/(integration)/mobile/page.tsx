'use client';

import { AlertTriangle, CheckCircle, Mic, MicOff, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useState } from 'react';

import { useTranscription } from '@/src/features/clinical/main-ui/hooks/useTranscription';
import { useSimpleAbly } from '@/src/features/clinical/mobile/hooks/useSimpleAbly';
import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

// Simple mobile state types
type MobileState = 'disconnected' | 'connecting' | 'connected' | 'recording' | 'error';

type TokenState = {
  token: string | null;
  isValidating: boolean;
  error: string | null;
};

type SessionState = {
  sessionId: string | null;
  patientName: string | null;
};

// Custom hook for screen wake lock
function useWakeLock() {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported || wakeLock) {
      return;
    }

    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);

      lock.addEventListener('release', () => {
        setWakeLock(null);
      });
    } catch (error) {
      console.error('Failed to request wake lock:', error);
    }
  }, [isSupported, wakeLock]);

  const releaseWakeLock = useCallback(() => {
    if (wakeLock) {
      wakeLock.release();
      setWakeLock(null);
    }
  }, [wakeLock]);

  return {
    isSupported,
    isActive: !!wakeLock,
    requestWakeLock,
    releaseWakeLock,
  };
}

// Main mobile page component
function MobilePageContent() {
  const searchParams = useSearchParams();

  const [tokenState, setTokenState] = useState<TokenState>({
    token: null,
    isValidating: false,
    error: null,
  });

  const [sessionState, setSessionState] = useState<SessionState>({
    sessionId: null,
    patientName: null,
  });

  const [mobileState, setMobileState] = useState<MobileState>('disconnected');

  // Wake lock hook
  const { isSupported: wakeLockSupported, isActive: wakeLockActive, requestWakeLock, releaseWakeLock } = useWakeLock();

  // Simple Ably connection
  const { isConnected, currentSessionId, sendTranscript } = useSimpleAbly({
    tokenId: tokenState.token,
    onTranscriptReceived: (transcript, sessionId) => {
      // Mobile shouldn't receive transcripts, only send them
      console.log('Unexpected transcript received on mobile:', transcript, sessionId);
    },
    onSessionChanged: (sessionId, patientName) => {
      // Update session when desktop changes patient
      setSessionState({ sessionId, patientName });
    },
    onDeviceConnected: (deviceName) => {
      console.log('Device connected:', deviceName);
    },
    onDeviceDisconnected: (deviceName) => {
      console.log('Device disconnected:', deviceName);
    },
    onError: (error) => {
      setTokenState(prev => ({ ...prev, error }));
      setMobileState('error');
    },
  });

  // Transcription hook with simple handling
  const { isRecording, startRecording, stopRecording } = useTranscription({
    isMobile: true,
    mobileChunkTimeout: 2, // 2s silence threshold for mobile
    onChunkComplete: async (audioBlob: Blob) => {
      if (!currentSessionId) {
        console.warn('No session ID available for transcription');
        return;
      }

      try {
        // Send audio to Deepgram for transcription
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        formData.append('sessionId', currentSessionId);

        const response = await fetch('/api/deepgram/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error('Transcription failed:', response.statusText);
          return;
        }

        const { transcript } = await response.json();

        // Send transcript via simple Ably
        if (transcript?.trim()) {
          sendTranscript(transcript.trim());
        }
      } catch (error) {
        console.error('Error during transcription:', error);
      }
    },
  });

  // Validate token from URL on mount
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setTokenState({
        token,
        isValidating: true,
        error: null,
      });

      // Simple validation - just set the token
      // The useSimpleAbly hook will handle the actual validation
      setTimeout(() => {
        setTokenState(prev => ({
          ...prev,
          isValidating: false,
        }));
      }, 1000);
    } else {
      setTokenState({
        token: null,
        isValidating: false,
        error: 'No token provided in URL',
      });
    }
  }, [searchParams]);

  // Update mobile state based on connection and session
  useEffect(() => {
    if (tokenState.error) {
      setMobileState('error');
    } else if (tokenState.isValidating) {
      setMobileState('connecting');
    } else if (!tokenState.token) {
      setMobileState('disconnected');
    } else if (!isConnected) {
      setMobileState('connecting');
    } else if (isRecording) {
      setMobileState('recording');
    } else {
      setMobileState('connected');
    }
  }, [tokenState, isConnected, isRecording]);

  // Manage wake lock based on recording state
  useEffect(() => {
    if (isRecording && wakeLockSupported) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [isRecording, wakeLockSupported, requestWakeLock, releaseWakeLock]);

  const handleStartRecording = useCallback(async () => {
    if (mobileState === 'connected') {
      await startRecording();
    }
  }, [mobileState, startRecording]);

  const handleStopRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    }
  }, [isRecording, stopRecording]);

  const getStateInfo = () => {
    switch (mobileState) {
      case 'disconnected':
        return {
          icon: <WifiOff className="size-8 text-red-500" />,
          title: 'Disconnected',
          message: 'No valid connection token',
          canRecord: false,
        };
      case 'connecting':
        return {
          icon: <Wifi className="size-8 text-yellow-500" />,
          title: 'Connecting...',
          message: tokenState.isValidating ? 'Validating token...' : 'Establishing connection...',
          canRecord: false,
        };
      case 'connected':
        return {
          icon: <CheckCircle className="size-8 text-green-500" />,
          title: 'Connected',
          message: sessionState.patientName ? `Ready to record for ${sessionState.patientName}` : 'Ready to record',
          canRecord: true,
        };
      case 'recording':
        return {
          icon: <Mic className="size-8 text-red-500" />,
          title: 'Recording',
          message: sessionState.patientName ? `Recording for ${sessionState.patientName}` : 'Recording in progress',
          canRecord: true,
        };
      case 'error':
        return {
          icon: <AlertTriangle className="size-8 text-red-500" />,
          title: 'Error',
          message: tokenState.error || 'Connection error',
          canRecord: false,
        };
      default:
        return {
          icon: <WifiOff className="size-8 text-gray-500" />,
          title: 'Unknown',
          message: 'Unknown state',
          canRecord: false,
        };
    }
  };

  const stateInfo = getStateInfo();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex-1 p-4">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
              <Smartphone className="size-8 text-gray-600" />
            </div>
            <CardTitle>Mobile Recording</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="text-center">
              <div className="mx-auto mb-2 flex size-16 items-center justify-center">
                {stateInfo.icon}
              </div>
              <h3 className="text-lg font-semibold">{stateInfo.title}</h3>
              <p className="text-sm text-gray-600">{stateInfo.message}</p>
            </div>

            {/* Error Display */}
            {mobileState === 'error' && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <div>
                  <div className="font-medium">Connection Error</div>
                  <div className="text-sm">{tokenState.error}</div>
                </div>
              </Alert>
            )}

            {/* Recording Controls */}
            {stateInfo.canRecord && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {!isRecording
                    ? (
                        <Button
                          onClick={handleStartRecording}
                          size="lg"
                          className="size-16 rounded-full bg-red-500 hover:bg-red-600"
                        >
                          <Mic className="size-8 text-white" />
                        </Button>
                      )
                    : (
                        <Button
                          onClick={handleStopRecording}
                          size="lg"
                          variant="outline"
                          className="size-16 rounded-full border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <MicOff className="size-8" />
                        </Button>
                      )}
                </div>

                <div className="text-center text-xs text-gray-500">
                  {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
                </div>

                {/* Wake Lock Status */}
                {wakeLockSupported && (
                  <div className="text-center text-xs text-gray-400">
                    Screen lock:
                    {' '}
                    {wakeLockActive ? 'Disabled' : 'Enabled'}
                  </div>
                )}
              </div>
            )}

            {/* Session Info */}
            {sessionState.sessionId && (
              <div className="rounded-lg bg-blue-50 p-3">
                <h4 className="text-sm font-medium text-blue-800">Session Info</h4>
                <p className="text-xs text-blue-700">
                  Patient:
                  {' '}
                  {sessionState.patientName || 'Unknown'}
                </p>
                <p className="text-xs text-blue-600">
                  Session:
                  {' '}
                  {sessionState.sessionId.slice(0, 8)}
                  ...
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="rounded-lg bg-gray-50 p-3">
              <h4 className="mb-2 text-sm font-medium text-gray-800">Instructions:</h4>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>1. Ensure you're connected to the desktop</li>
                <li>2. Tap the red button to start recording</li>
                <li>3. Speak clearly into your device microphone</li>
                <li>4. Transcriptions will appear on desktop in real-time</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading component
function MobilePageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Smartphone className="mx-auto size-12 text-blue-600" />
          <CardTitle>Loading Mobile Recording</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">Please wait while we prepare your mobile recording session...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main export with Suspense wrapper
export default function MobilePage() {
  return (
    <Suspense fallback={<MobilePageLoading />}>
      <MobilePageContent />
    </Suspense>
  );
}

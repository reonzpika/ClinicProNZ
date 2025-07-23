'use client';

import { AlertTriangle, CheckCircle, Clock, Mic, MicOff, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useAblySync } from '@/src/features/clinical/main-ui/hooks/useAblySync';
import { useTranscription } from '@/src/features/clinical/main-ui/hooks/useTranscription';
import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

// Phase 4: Comprehensive mobile state machine
type MobileState =
  | 'disconnected' // No token or invalid token
  | 'connecting' // Validating token and establishing Ably connection
  | 'waiting_session' // Connected but no patient session
  | 'ready' // Session received, ready to record
  | 'recording' // Currently recording
  | 'session_ended' // Session was completed/ended
  | 'error'; // Error state

type TokenState = {
  token: string | null;
  isValidating: boolean;
  error: string | null;
  isGuest: boolean;
};

type PatientState = {
  sessionId: string | null;
  name: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced';
  lastSyncTime: number | null;
};

// Phase 4: State machine with clear transitions
type StateMachineState = {
  currentState: MobileState;
  tokenState: TokenState;
  patientState: PatientState;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  error: string | null;
  canRecord: boolean;
  statusMessage: string;
};

// Phase 4: State machine reducer for clear state transitions
function getStateMachineState(
  tokenState: TokenState,
  patientState: PatientState,
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error',
  isRecording: boolean,
): StateMachineState {
  let currentState: MobileState;
  let error: string | null = null;
  let canRecord = false;
  let statusMessage = '';

  if (tokenState.error) {
    currentState = 'error';
    error = tokenState.error;
    statusMessage = tokenState.error;
  } else if (tokenState.isValidating || !tokenState.token) {
    currentState = tokenState.isValidating ? 'connecting' : 'disconnected';
    statusMessage = tokenState.isValidating ? 'Validating token...' : 'No valid token';
  } else if (connectionStatus === 'error') {
    currentState = 'error';
    error = 'Connection failed';
    statusMessage = 'Connection failed';
  } else if (connectionStatus !== 'connected') {
    currentState = 'connecting';
    statusMessage = 'Connecting...';
  } else if (!patientState.sessionId) {
    currentState = 'waiting_session';
    statusMessage = 'Waiting for patient session...';
  } else if (isRecording) {
    currentState = 'recording';
    canRecord = true;
    statusMessage = `Recording for ${patientState.name || 'Patient'}`;
  } else {
    currentState = 'ready';
    canRecord = true;
    statusMessage = `Ready to record for ${patientState.name || 'Patient'}`;
  }

  return {
    currentState,
    tokenState,
    patientState,
    connectionStatus,
    error,
    canRecord,
    statusMessage,
  };
}

// Loading component for Suspense fallback
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
      const sentinel = await navigator.wakeLock.request('screen');
      setWakeLock(sentinel);
      sentinel.addEventListener('release', () => {
        setWakeLock(null);
      });
    } catch {
      // Wake lock request failures are handled silently
    }
  }, [isSupported, wakeLock]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
      } catch {
        // Wake lock release failures are handled silently
      }
    }
  }, [wakeLock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && wakeLock) {
        releaseWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [wakeLock, releaseWakeLock]);

  useEffect(() => {
    return () => {
      if (wakeLock) {
        releaseWakeLock();
      }
    };
  }, [wakeLock, releaseWakeLock]);

  return {
    isSupported,
    isActive: !!wakeLock,
    requestWakeLock,
    releaseWakeLock,
  };
}

// Main mobile page component
function MobilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Phase 4: State machine-based state management
  const [tokenState, setTokenState] = useState<TokenState>({
    token: null,
    isValidating: true,
    error: null,
    isGuest: false,
  });

  const [patientState, setPatientState] = useState<PatientState>({
    sessionId: null,
    name: null,
    syncStatus: 'idle',
    lastSyncTime: null,
  });

  // Refs to track timeouts and prevent leaks
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validate token on mount
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setTokenState({
        token: null,
        isValidating: false,
        error: 'No token provided. Please scan a valid QR code.',
        isGuest: false,
      });
      return;
    }

    const validateToken = async () => {
      try {
        setTokenState(prev => ({ ...prev, token, isValidating: true }));

        const url = new URL('/api/ably/token', window.location.origin);
        url.searchParams.set('token', token);

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Invalid or expired QR code. Please generate a new one.');
          } else if (response.status === 503) {
            // Ably not configured - continue anyway
            setTokenState({ token, isValidating: false, error: null, isGuest: false });
            return;
          } else {
            throw new Error('Token validation failed. Please try again.');
          }
        }

        const data = await response.json();
        const clientId = data.tokenRequest?.clientId || '';
        const isGuestToken = clientId.startsWith('guest-');

        setTokenState({ token, isValidating: false, error: null, isGuest: isGuestToken });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Token validation failed';
        setTokenState({
          token: null,
          isValidating: false,
          error: errorMessage,
          isGuest: false,
        });
      }
    };

    validateToken();
  }, [searchParams]);

  // Ably connection for real-time sync - only start after token validation completes
  const { connectionState, sendTranscriptionWithDiarization } = useAblySync({
    enabled: !!tokenState.token && !tokenState.isValidating && !tokenState.error,
    token: tokenState.token || undefined,
    isDesktop: false,
    onPatientSwitched: useCallback((sessionId: string, name?: string) => {
      // Clear any existing sync timeout to prevent overlaps
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }

      // Show brief syncing state for user feedback
      setPatientState({
        sessionId,
        name: name || 'Unknown Patient',
        syncStatus: 'syncing',
        lastSyncTime: null,
      });

      // After brief delay, show synced state
      syncTimeoutRef.current = setTimeout(() => {
        setPatientState(prev => ({
          ...prev,
          syncStatus: 'synced',
          lastSyncTime: Date.now(),
        }));
        syncTimeoutRef.current = null; // Clear ref after timeout executes
      }, 1000); // 1 second syncing feedback
    }, []),
    // Phase 5: Removed onHealthCheckRequested - health check system eliminated
    onStartRecording: useCallback(() => {
      // This callback is now handled by the useTranscription hook
    }, []),
    onStopRecording: useCallback(() => {
      // This callback is now handled by the useTranscription hook
    }, []),
    onError: useCallback((error: string | null) => {
      // Filter out expected Ably configuration errors
      if (error && (
        error.includes('Failed to create Ably connection')
        || error.includes('Failed to connect to Ably')
        || error.includes('Ably service not configured')
      )) {
        return;
      }
      if (error) {
        setTokenState(prev => ({ ...prev, error }));
      }
    }, []),
  });

  // Wake lock hook
  const { isSupported: wakeLockSupported, isActive: wakeLockActive, requestWakeLock, releaseWakeLock } = useWakeLock();

  // Use new VAD-based smart recording
  const { isRecording, isTranscribing, chunksCompleted, startRecording, stopRecording } = useTranscription({
    isMobile: true,
    mobileChunkTimeout: 2, // 2s silence threshold for mobile
    onChunkComplete: async (audioBlob: Blob) => {
      // Mobile-specific processing with diarization support
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      // Phase 3: Add sessionId for backend validation
      if (patientState.sessionId) {
        formData.append('sessionId', patientState.sessionId);
      }

      const headers: Record<string, string> = {};
      if (tokenState.token) {
        headers['x-guest-token'] = tokenState.token;
      }

      try {
        const response = await fetch('/api/deepgram/transcribe', {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          // Phase 4: Better error handling with user feedback
          const errorData = await response.json().catch(() => ({}));
          console.error('Transcription failed:', response.status, errorData);
          return;
        }

        const { transcript } = await response.json();

        // Use regular transcript since diarization is disabled
        if (transcript?.trim() && connectionState.status === 'connected') {
          // Send regular transcription data
          await sendTranscriptionWithDiarization(
            transcript.trim(),
            patientState.sessionId || undefined,
            null, // No diarized transcript
            [], // No utterances
          );
        }
      } catch (error) {
        // Phase 4: Handle network errors with user feedback
        console.error('Network error during transcription:', error);
      }
    },
  });

  // Phase 4: Calculate current state using state machine
  const stateMachine = getStateMachineState(
    tokenState,
    patientState,
    connectionState.status,
    isRecording,
  );

  // Manage wake lock based on recording state
  useEffect(() => {
    if (isRecording) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [isRecording, requestWakeLock, releaseWakeLock]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);



  // Show error page for invalid tokens
  if (tokenState.error && !tokenState.isValidating && !tokenState.token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto size-12 text-red-500" />
            <CardTitle className="text-red-700">Invalid QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">{tokenState.error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="size-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">Mobile Recording</h1>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {stateMachine.currentState === 'ready' || stateMachine.currentState === 'recording'
              ? (
                  <>
                    <Wifi className="size-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </>
                )
              : stateMachine.currentState === 'error'
                ? (
                    <>
                      <WifiOff className="size-5 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Error</span>
                    </>
                  )
                : stateMachine.currentState === 'connecting'
                  ? (
                      <>
                        <Wifi className="size-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-600">Connecting...</span>
                      </>
                    )
                  : stateMachine.currentState === 'waiting_session'
                    ? (
                        <>
                          <Wifi className="size-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">Waiting Session</span>
                        </>
                      )
                    : (
                        <>
                          <Wifi className="size-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-600">Disconnected</span>
                        </>
                      )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4">
        {/* Phase 4: Comprehensive Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Current State Display */}
              <div className="flex items-center space-x-3">
                {stateMachine.currentState === 'error' && (
                  <>
                    <AlertTriangle className="size-6 text-red-500" />
                    <div>
                      <div className="font-medium text-red-700">Error</div>
                      <div className="text-sm text-red-600">{stateMachine.error}</div>
                    </div>
                  </>
                )}
                {stateMachine.currentState === 'disconnected' && (
                  <>
                    <WifiOff className="size-6 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-700">Disconnected</div>
                      <div className="text-sm text-gray-600">No valid token</div>
                    </div>
                  </>
                )}
                {stateMachine.currentState === 'connecting' && (
                  <>
                    <div className="size-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <div>
                      <div className="font-medium text-blue-700">Connecting</div>
                      <div className="text-sm text-blue-600">Establishing connection...</div>
                    </div>
                  </>
                )}
                {stateMachine.currentState === 'waiting_session' && (
                  <>
                    <Clock className="size-6 text-yellow-500" />
                    <div>
                      <div className="font-medium text-yellow-700">Waiting for Session</div>
                      <div className="text-sm text-yellow-600">Connected, waiting for patient session from desktop</div>
                    </div>
                  </>
                )}
                {stateMachine.currentState === 'ready' && (
                  <>
                    <CheckCircle className="size-6 text-green-500" />
                    <div>
                      <div className="font-medium text-green-700">Ready to Record</div>
                      <div className="text-sm text-green-600">
                        Session:
                        {patientState.name}
                      </div>
                    </div>
                  </>
                )}
                {stateMachine.currentState === 'recording' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="size-3 animate-pulse rounded-full bg-red-500" />
                      <Mic className="size-6 text-red-500" />
                    </div>
                    <div>
                      <div className="font-medium text-red-700">Recording Active</div>
                      <div className="text-sm text-red-600">
                        Recording for
                        {patientState.name}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Status Message */}
              <div className="rounded-md bg-gray-50 p-3">
                <div className="text-sm text-gray-700">{stateMachine.statusMessage}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Patient - Only show for authenticated users */}
        {!tokenState.isGuest && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Patient</CardTitle>
            </CardHeader>
            <CardContent>
              {patientState.name
                ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {patientState.syncStatus === 'syncing'
                          ? <div className="size-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                          : patientState.syncStatus === 'synced'
                            ? <CheckCircle className="size-5 text-green-600" />
                            : <AlertTriangle className="size-5 text-amber-500" />}
                        <span className="font-medium">{patientState.name}</span>
                      </div>
                      {patientState.syncStatus === 'syncing' && (
                        <div className="text-xs text-blue-600">
                          <div className="flex items-center space-x-1">
                            <div className="size-1 animate-pulse rounded-full bg-blue-600" />
                            <span>Syncing patient data...</span>
                          </div>
                        </div>
                      )}
                      {patientState.syncStatus === 'synced' && patientState.lastSyncTime && (
                        <div className="text-xs text-green-600">
                          Synced
                          {' '}
                          {new Date(patientState.lastSyncTime).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  )
                : (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <AlertTriangle className="size-5" />
                      <span>Waiting for patient session...</span>
                    </div>
                  )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {tokenState.error && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <div className="text-sm">{tokenState.error}</div>
          </Alert>
        )}

        {/* Recording Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recording Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recording Status */}
            <div className="space-y-2">
              {isRecording && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="size-2 animate-pulse rounded-full bg-red-500" />
                    <span className="font-medium">Recording...</span>
                  </div>
                  <span className="font-mono">{formatDuration(chunksCompleted)}</span>
                </div>
              )}

              {isTranscribing && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="size-2 animate-pulse rounded-full bg-blue-500" />
                  <span>Processing audio...</span>
                </div>
              )}

              {chunksCompleted > 0 && (
                <div className="text-sm text-green-600">
                  ✓
                  {' '}
                  {chunksCompleted}
                  {' '}
                  audio chunks processed
                </div>
              )}
              {/* Wake Lock Status */}
              {wakeLockSupported && (
                <div className="flex items-center space-x-2 text-sm">
                  {wakeLockActive
                    ? (
                        <>
                          <div className="size-2 rounded-full bg-green-500" />
                          <span className="text-green-600">Screen will stay on</span>
                        </>
                      )
                    : (
                        <>
                          <div className="size-2 rounded-full bg-gray-400" />
                          <span className="text-gray-500">Screen may lock</span>
                        </>
                      )}
                </div>
              )}
            </div>

            {/* Recording Button */}
            <div className="space-y-2">
              {!isRecording
                ? (
                    <Button
                      onClick={startRecording}
                      disabled={!stateMachine.canRecord}
                      className="h-16 w-full text-lg"
                      size="lg"
                    >
                      <Mic className="mr-2 size-6" />
                      {stateMachine.currentState === 'connecting'
                        ? 'Connecting...'
                        : stateMachine.currentState === 'waiting_session'
                          ? 'Waiting for Session...'
                          : stateMachine.currentState === 'error'
                            ? 'Error - Cannot Record'
                            : 'Start Recording'}
                    </Button>
                  )
                : (
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      className="h-16 w-full text-lg"
                      size="lg"
                    >
                      <MicOff className="mr-2 size-6" />
                      Stop Recording
                    </Button>
                  )}
            </div>
          </CardContent>
        </Card>

        {/* Help Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How it Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Tap "Start Recording" to begin audio capture</li>
              <li>• Audio is automatically chunked at natural pauses in speech (smart recording)</li>
              <li>• Transcriptions are sent to your desktop in real-time</li>
              <li>• Keep this page open during the consultation</li>
              {wakeLockSupported && (
                <li>• Screen will stay on automatically during recording</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Export with Suspense boundary
export default function MobilePage() {
  return (
    <Suspense fallback={<MobilePageLoading />}>
      <MobilePageContent />
    </Suspense>
  );
}

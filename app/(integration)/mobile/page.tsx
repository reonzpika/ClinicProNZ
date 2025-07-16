'use client';

import { AlertTriangle, CheckCircle, Mic, MicOff, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

import { useAblySync } from '@/src/features/clinical/main-ui/hooks/useAblySync';
import { useTranscription } from '@/src/features/clinical/main-ui/hooks/useTranscription';
import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

// Simplified state types
type TokenState = {
  token: string | null;
  isValidating: boolean;
  error: string | null;
  isGuest: boolean;
};

type PatientState = {
  sessionId: string | null;
  name: string | null;
};

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
    } catch (error) {
      console.warn('Failed to request wake lock:', error);
    }
  }, [isSupported, wakeLock]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
      } catch (error) {
        console.warn('Failed to release wake lock:', error);
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

  // Simplified state management
  const [tokenState, setTokenState] = useState<TokenState>({
    token: null,
    isValidating: true,
    error: null,
    isGuest: false,
  });

  const [patientState, setPatientState] = useState<PatientState>({
    sessionId: null,
    name: null,
  });

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
  const { connectionState, sendTranscription } = useAblySync({
    enabled: !!tokenState.token && !tokenState.isValidating && !tokenState.error,
    token: tokenState.token || undefined,
    isDesktop: false,
    onPatientSwitched: useCallback((sessionId: string, name?: string) => {
      setPatientState({
        sessionId,
        name: name || 'Unknown Patient',
      });
    }, []),
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
      // Mobile-specific processing
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      const headers: Record<string, string> = {};
      if (tokenState.token) {
        headers['x-guest-token'] = tokenState.token;
      }
      const response = await fetch('/api/deepgram/transcribe', {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!response.ok) {
        return;
      }
      const { transcript } = await response.json();
      if (transcript?.trim() && connectionState.status === 'connected') {
        await sendTranscription(transcript.trim(), patientState.sessionId || undefined);
      }
    },
  });

  // Manage wake lock based on recording state
  useEffect(() => {
    if (isRecording) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [isRecording, requestWakeLock, releaseWakeLock]);

  // Update refs with current function references
  useEffect(() => {
    // These refs are no longer needed as startRecording/stopRecording are managed by the hook
  }, []);

  // Connection status helpers
  const isConnected = connectionState.status === 'connected';
  const isConnecting = connectionState.status === 'connecting';
  const hasConnectionError = connectionState.status === 'error';
  const isFunctional = isConnected || connectionState.status === 'disconnected';

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
            {isConnected
              ? (
                  <>
                    <Wifi className="size-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </>
                )
              : hasConnectionError
                ? (
                    <>
                      <WifiOff className="size-5 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Error</span>
                    </>
                  )
                : isConnecting
                  ? (
                      <>
                        <Wifi className="size-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-600">Connecting...</span>
                      </>
                    )
                  : (
                      <>
                        <Wifi className="size-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Ready</span>
                      </>
                    )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4">
        {/* Current Patient - Only show for authenticated users */}
        {!tokenState.isGuest && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Patient</CardTitle>
            </CardHeader>
            <CardContent>
              {patientState.name
                ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="size-5 text-green-600" />
                      <span className="font-medium">{patientState.name}</span>
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
                      disabled={!isFunctional || tokenState.isValidating || !tokenState.token}
                      className="h-16 w-full text-lg"
                      size="lg"
                    >
                      <Mic className="mr-2 size-6" />
                      {tokenState.isValidating ? 'Validating Token...' : 'Start Recording'}
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

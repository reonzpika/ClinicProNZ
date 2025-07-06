'use client';

import { AlertTriangle, CheckCircle, Mic, MicOff, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useAblySync } from '@/features/consultation/hooks/useAblySync';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

// Simplified state types
type TokenState = {
  token: string | null;
  isValidating: boolean;
  error: string | null;
};

type PatientState = {
  sessionId: string | null;
  name: string | null;
};

type RecordingState = {
  isRecording: boolean;
  isPaused: boolean;
  isTranscribing: boolean;
  duration: number;
  chunksUploaded: number;
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

// Main mobile page component
function MobilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Simplified state management
  const [tokenState, setTokenState] = useState<TokenState>({
    token: null,
    isValidating: true,
    error: null,
  });

  const [patientState, setPatientState] = useState<PatientState>({
    sessionId: null,
    name: null,
  });

  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    isTranscribing: false,
    duration: 0,
    chunksUploaded: 0,
  });

  // Validate token on mount
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setTokenState({
        token: null,
        isValidating: false,
        error: 'No token provided. Please scan a valid QR code.',
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
            setTokenState({ token, isValidating: false, error: null });
            return;
          } else {
            throw new Error('Token validation failed. Please try again.');
          }
        }

        setTokenState({ token, isValidating: false, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Token validation failed';
        setTokenState({
          token: null,
          isValidating: false,
          error: errorMessage,
        });
      }
    };

    validateToken();
  }, [searchParams]);

  // Ably connection for real-time sync
  const { connectionState, sendTranscription } = useAblySync({
    enabled: !!tokenState.token,
    token: tokenState.token || undefined,
    isDesktop: false,
    onPatientSwitched: useCallback((sessionId: string, name?: string) => {
      setPatientState({
        sessionId,
        name: name || 'Unknown Patient',
      });
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

  // Recording management
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Process audio for transcription
  const processAudio = useCallback(async (audioBlob: Blob) => {
    setRecordingState(prev => ({ ...prev, isTranscribing: true }));

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('/api/deepgram/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const { transcript } = await response.json();

      if (transcript?.trim()) {
        // Send to desktop if connected
        if (connectionState.status === 'connected') {
          try {
            await sendTranscription(transcript.trim(), patientState.sessionId || undefined);
            setRecordingState(prev => ({
              ...prev,
              chunksUploaded: prev.chunksUploaded + 1,
            }));
          } catch {
            setTokenState(prev => ({
              ...prev,
              error: 'Failed to send to desktop. Connection lost.',
            }));
          }
        } else {
          // Just count locally if no connection
          setRecordingState(prev => ({
            ...prev,
            chunksUploaded: prev.chunksUploaded + 1,
          }));
        }
      }
    } catch {
      setTokenState(prev => ({ ...prev, error: 'Transcription failed. Please try again.' }));
    } finally {
      setRecordingState(prev => ({ ...prev, isTranscribing: false }));
    }
  }, [connectionState.status, sendTranscription, patientState.sessionId]);

  // Recording controls
  const startRecording = useCallback(async () => {
    if (!tokenState.token || tokenState.isValidating) {
      setTokenState(prev => ({ ...prev, error: 'Please wait for token validation.' }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

      let chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        processAudio(audioBlob);
        chunks = [];
      };

      setMediaRecorder(recorder);
      setAudioStream(stream);
      recorder.start();
      setRecordingState(prev => ({ ...prev, isRecording: true, duration: 0 }));

      // Record in 5-second chunks
      const chunkInterval = setInterval(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          recorder.start();
        }
      }, 5000);
      recordingIntervalRef.current = chunkInterval;

      // Update duration
      const durationInterval = setInterval(() => {
        setRecordingState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      durationIntervalRef.current = durationInterval;
    } catch {
      setTokenState(prev => ({ ...prev, error: 'Could not access microphone.' }));
    }
  }, [tokenState.token, tokenState.isValidating, processAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder?.state !== 'inactive') {
      mediaRecorder?.stop();
    }

    audioStream?.getTracks().forEach(track => track.stop());
    setAudioStream(null);

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setMediaRecorder(null);
    setRecordingState({
      isRecording: false,
      isPaused: false,
      isTranscribing: false,
      duration: 0,
      chunksUploaded: 0,
    });
  }, [mediaRecorder, audioStream]);

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
        {/* Current Patient */}
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
              {recordingState.isRecording && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="size-2 animate-pulse rounded-full bg-red-500" />
                    <span className="font-medium">Recording...</span>
                  </div>
                  <span className="font-mono">{formatDuration(recordingState.duration)}</span>
                </div>
              )}

              {recordingState.isTranscribing && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="size-2 animate-pulse rounded-full bg-blue-500" />
                  <span>Processing audio...</span>
                </div>
              )}

              {recordingState.chunksUploaded > 0 && (
                <div className="text-sm text-green-600">
                  ✓
                  {' '}
                  {recordingState.chunksUploaded}
                  {' '}
                  audio chunks processed
                </div>
              )}
            </div>

            {/* Recording Button */}
            <div className="space-y-2">
              {!recordingState.isRecording
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
              <li>• Audio is processed in 5-second chunks</li>
              <li>• Transcriptions are sent to your desktop in real-time</li>
              <li>• Keep this page open during the consultation</li>
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

'use client';

import { AlertTriangle, CheckCircle, Mic, MicOff, Phone, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useAblySync } from '@/features/consultation/hooks/useAblySync';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

type MobilePageState = {
  token: string | null;
  currentPatientName: string | null;
  currentPatientSessionId: string | null;
  error: string | null;
  isValidatingToken: boolean;
  // Recording state
  isRecording: boolean;
  isPaused: boolean;
  isTranscribing: boolean;
  recordingDuration: number;
  volumeLevel: number;
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

// Main mobile page component that uses useSearchParams
function MobilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<MobilePageState>({
    token: null,
    currentPatientName: null,
    currentPatientSessionId: null,
    error: null,
    isValidatingToken: true,
    // Recording state
    isRecording: false,
    isPaused: false,
    isTranscribing: false,
    recordingDuration: 0,
    volumeLevel: 0,
    chunksUploaded: 0,
  });

  // Extract token from URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'No token provided. Please scan a valid QR code.',
        isValidatingToken: false,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      token,
      isValidatingToken: false,
    }));
  }, [searchParams]);

  // Ably connection for real-time sync
  const {
    connectionState,
    sendTranscription,
  } = useAblySync({
    enabled: !!state.token,
    token: state.token || undefined,
    isDesktop: false, // This is a mobile device
    onPatientSwitched: useCallback((patientSessionId: string, patientName?: string) => {
      setState(prev => ({
        ...prev,
        currentPatientSessionId: patientSessionId,
        currentPatientName: patientName || 'Unknown Patient',
      }));
    }, []),
    onError: useCallback((error: string | null) => {
      setState(prev => ({ ...prev, error }));
    }, []),
  });

  // Simple recording state management (WebSocket-based)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio processing for transcription
  const processAudioForTranscription = useCallback(async (audioBlob: Blob) => {
    setState(prev => ({ ...prev, isTranscribing: true }));

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('/api/deepgram/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const { transcript } = await response.json();

      if (transcript && transcript.trim()) {
        // Send via WebSocket (now async)
        try {
          await sendTranscription(transcript.trim(), state.currentPatientSessionId || undefined);
          setState(prev => ({
            ...prev,
            chunksUploaded: prev.chunksUploaded + 1,
          }));
        } catch (error) {
          console.warn('Failed to send transcription:', error);
          setState(prev => ({
            ...prev,
            error: 'Failed to send transcription to desktop. Connection may be lost.',
          }));
        }
      }
    } catch {
      // Transcription error occurred
      setState(prev => ({
        ...prev,
        error: 'Transcription failed. Please try again.',
      }));
    } finally {
      setState(prev => ({ ...prev, isTranscribing: false }));
    }
  }, [sendTranscription, state.currentPatientSessionId]);

  // Connection status
  const isConnected = connectionState.status === 'connected';
  const isConnecting = connectionState.status === 'connecting';
  const hasConnectionError = connectionState.status === 'error';

  // Recording status
  const isRecording = state.isRecording && !state.isPaused;
  const isPaused = state.isPaused;
  const isTranscribing = state.isTranscribing;

  // Handle recording controls
  const handleStartRecording = useCallback(async () => {
    if (!isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to desktop. Please check connection.' }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

      let audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        processAudioForTranscription(audioBlob);
        audioChunks = [];
      };

      setMediaRecorder(recorder);
      setAudioStream(stream);

      // Start recording in 5-second chunks
      recorder.start();
      setState(prev => ({ ...prev, isRecording: true, recordingDuration: 0 }));

      // Record in chunks every 5 seconds
      const interval = setInterval(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          recorder.start();
        }
      }, 5000);
      recordingIntervalRef.current = interval;

      // Update duration timer
      const durationInterval = setInterval(() => {
        setState(prev => ({ ...prev, recordingDuration: prev.recordingDuration + 1 }));
      }, 1000);
      volumeIntervalRef.current = durationInterval;
    } catch {
      setState(prev => ({ ...prev, error: 'Could not access microphone. Please check permissions.' }));
    }
  }, [isConnected, processAudioForTranscription]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }

    setMediaRecorder(null);
    setState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false,
      recordingDuration: 0,
    }));
  }, [mediaRecorder, audioStream]);

  const handlePauseRecording = useCallback(() => {
    if (isRecording) {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
      }
      setState(prev => ({ ...prev, isPaused: true }));
    } else if (isPaused) {
      if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
      }
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [isRecording, isPaused, mediaRecorder]);

  // Show error page if token validation failed
  if (state.error && state.isValidatingToken === false && !state.token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto size-12 text-red-500" />
            <CardTitle className="text-red-700">Invalid QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">{state.error}</p>
            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                        <WifiOff className="size-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-400">Disconnected</span>
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
            {state.currentPatientName
              ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="size-5 text-green-600" />
                    <span className="font-medium text-gray-900">{state.currentPatientName}</span>
                  </div>
                )
              : (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="size-5 text-yellow-600" />
                    <span className="text-gray-600">Waiting for patient session...</span>
                  </div>
                )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {state.error && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <div className="text-sm">{state.error}</div>
          </Alert>
        )}

        {/* Connection Error */}
        {hasConnectionError && (
          <Alert variant="destructive">
            <WifiOff className="size-4" />
            <div>
              <div className="font-medium">Connection Failed</div>
              <div className="text-sm">{connectionState.error}</div>
            </div>
          </Alert>
        )}

        {/* Recording Status */}
        {(isRecording || isPaused || isTranscribing) && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isRecording
                    ? (
                        <Mic className="size-5 text-red-600" />
                      )
                    : (
                        <MicOff className="size-5 text-gray-600" />
                      )}
                  <span className="font-medium">
                    {isTranscribing
                      ? 'Processing...'
                      : isRecording
                        ? 'Recording'
                        : isPaused ? 'Paused' : 'Ready'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {Math.floor(state.recordingDuration / 60)}
                  :
                  {(state.recordingDuration % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Volume Indicator */}
              {isRecording && (
                <div className="mt-2">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-green-500 transition-all duration-150"
                      style={{ width: `${state.volumeLevel * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recording Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {!isRecording && !isPaused
                ? (
                    <Button
                      onClick={handleStartRecording}
                      disabled={!isConnected || state.isValidatingToken}
                      className="h-16 w-full text-lg"
                      size="lg"
                    >
                      <Mic className="mr-2 size-6" />
                      Start Recording
                    </Button>
                  )
                : (
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={handlePauseRecording}
                        variant="outline"
                        className="h-16"
                        size="lg"
                      >
                        {isPaused
                          ? (
                              <>
                                <Mic className="mr-2 size-6" />
                                Resume
                              </>
                            )
                          : (
                              <>
                                <MicOff className="mr-2 size-6" />
                                Pause
                              </>
                            )}
                      </Button>

                      <Button
                        onClick={handleStopRecording}
                        variant="destructive"
                        className="h-16"
                        size="lg"
                      >
                        <Phone className="mr-2 size-6" />
                        Stop
                      </Button>
                    </div>
                  )}
            </div>
          </CardContent>
        </Card>

        {/* Session Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {state.chunksUploaded}
                </div>
                <div className="text-sm text-gray-600">Transcriptions Sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {connectionState.connectedDevices.length + 1}
                </div>
                <div className="text-sm text-gray-600">Connected Devices</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="text-center text-sm text-gray-500">
          Keep this page open during consultation
        </div>
      </div>
    </div>
  );
}

// Export the wrapped component with Suspense boundary
export default function MobilePage() {
  return (
    <Suspense fallback={<MobilePageLoading />}>
      <MobilePageContent />
    </Suspense>
  );
}

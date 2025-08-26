'use client';

import { AlertTriangle, Camera, CheckCircle, Mic, MicOff, Smartphone, Upload, Wifi, WifiOff } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useTranscription } from '@/src/features/clinical/main-ui/hooks/useTranscription';
import { PhotoReview } from '@/src/features/clinical/mobile/components/PhotoReview';
import { WebRTCCamera } from '@/src/features/clinical/mobile/components/WebRTCCamera';
import { useSimpleAbly } from '@/src/features/clinical/mobile/hooks/useSimpleAbly';
import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { createAuthHeadersForMobile } from '@/src/shared/utils';

// Types for mobile image capture
type CapturedPhoto = {
  id: string;
  blob: Blob;
  timestamp: string;
  filename: string;
  status: 'captured' | 'uploading' | 'uploaded' | 'failed';
};

type UploadProgress = {
  photoId: string;
  progress: number;
  error?: string;
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

  // Removed consultation stores - no session management needed

  // Token validation state
  const [tokenState, setTokenState] = useState<{
    token: string | null;
    isValidating: boolean;
    isValid: boolean; // FIXED: Add isValid flag for proper validation tracking
    error: string | null;
  }>({
    token: null,
    isValidating: false,
    isValid: false, // FIXED: Add isValid flag
    error: null,
  });

  // Mobile state for UI - extended for camera functionality
  const [mobileState, setMobileState] = useState<'disconnected' | 'connecting' | 'connected' | 'recording' | 'camera' | 'reviewing' | 'uploading' | 'error'>('disconnected');

  // Photo capture state management
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);

  // Wake lock functionality
  const { isSupported: wakeLockSupported, requestWakeLock, releaseWakeLock } = useWakeLock();

  const handleError = useCallback((error: string) => {
    setTokenState(prev => ({ ...prev, error }));
    setMobileState('error');
  }, []);

  // Refs to avoid use-before-define in callbacks
  const isRecordingRef = useRef<boolean>(false);
  const startRecordingRef = useRef<() => Promise<void> | void>(() => {});
  const stopRecordingRef = useRef<() => Promise<void> | void>(() => {});

  // Simple Ably for real-time sync - no session sync needed
  const { isConnected, sendTranscript, sendRecordingStatus, sendImageNotification } = useSimpleAbly({
    tokenId: tokenState.isValid ? tokenState.token : null,
    onTranscriptReceived: (_transcript: string) => {
      // Transcript received unexpectedly on mobile (shouldn't happen)
    },
    onError: (err: string) => {
      // Treat auth errors as disconnect prompt; suppress noisy logs
      if (/Authentication failed|Token expired or invalid/i.test(err)) {
        setTokenState(prev => ({ ...prev, error: 'Token invalid or rotated. Please rescan QR.' }));
        return;
      }
      handleError(err);
    },
    isMobile: true,
    onControlCommand: async (action: 'start' | 'stop') => {
      try {
        if (action === 'start' && !isRecordingRef.current) {
          await startRecordingRef.current?.();
          // 🔧 FIX: Broadcast recording status to desktop for acknowledgment
          sendRecordingStatus(true);
        }
        if (action === 'stop' && isRecordingRef.current) {
          await stopRecordingRef.current?.();
          // 🔧 FIX: Broadcast recording status to desktop for acknowledgment
          sendRecordingStatus(false);
        }
      } catch (e) {
        setTokenState(prev => ({ ...prev, error: `Control error: ${e instanceof Error ? e.message : 'Unknown error'}` }));
      }
    },
  });

  // Transcription hook with simple handling
  const { isRecording, startRecording, stopRecording } = useTranscription({
    isMobile: true,
    mobileChunkTimeout: 2, // 2s silence threshold for mobile
    startImmediate: true, // ensure immediate recorder session for remote-stop path
    onChunkComplete: async (audioBlob: Blob) => {
      try {
        // Send audio to Deepgram for transcription
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        // No sessionId needed - desktop will append to current session

        // FIXED: Add auth headers using mobile token with null check
        if (!tokenState.token) {
          setTokenState(prev => ({ ...prev, error: 'No mobile token available for authentication' }));
          return;
        }

        const authHeaders = createAuthHeadersForMobile(tokenState.token, 'basic');

        const response = await fetch('/api/deepgram/transcribe', {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        });

        if (!response.ok) {
          setTokenState(prev => ({ ...prev, error: `Transcription failed: ${response.statusText}` }));
          return;
        }

        const data = await response.json();
        const { transcript } = data;

        // Send transcript via Ably (no words/paragraphs to minimise message size)
        if (transcript?.trim()) {
          const success = sendTranscript(transcript.trim());
          if (!success) {
            setTokenState(prev => ({ ...prev, error: 'Failed to send transcription to desktop' }));
          }
        }
      } catch (error) {
        setTokenState(prev => ({ ...prev, error: `Recording error: ${error instanceof Error ? error.message : 'Unknown error'}` }));
      }
    },
  });

  // Keep refs updated with latest recording controls
  useEffect(() => {
    isRecordingRef.current = isRecording;
    startRecordingRef.current = startRecording;
    stopRecordingRef.current = stopRecording;
  }, [isRecording, startRecording, stopRecording]);

  // Validate token from URL on mount
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setTokenState({
        token,
        isValidating: true,
        isValid: false, // FIXED: Start with false until validated
        error: null,
      });

      // FIXED: Proper server-side token validation instead of setTimeout
      const validateToken = async () => {
        try {
          // Validate token by calling the simple-token API
          const response = await fetch('/api/ably/simple-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenId: token }),
          });

          if (response.ok) {
            // Token is valid
            setTokenState(prev => ({
              ...prev,
              isValidating: false,
              isValid: true,
              error: null,
            }));
          } else {
            // Token is invalid or expired
            const errorData = await response.json().catch(() => ({ error: 'Token validation failed' }));
            setTokenState(prev => ({
              ...prev,
              isValidating: false,
              isValid: false,
              error: errorData.error || 'Invalid or expired token',
            }));
          }
        } catch (error) {
          // Network or other error
          setTokenState(prev => ({
            ...prev,
            isValidating: false,
            isValid: false,
            error: error instanceof Error ? error.message : 'Token validation failed',
          }));
        }
      };

      validateToken();
    } else {
      setTokenState({
        token: null,
        isValidating: false,
        isValid: false, // FIXED: Add isValid flag
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
    } else if (!tokenState.token || !tokenState.isValid) { // FIXED: Check both token and isValid
      setMobileState('disconnected');
    } else if (!isConnected) {
      setMobileState('connecting');
    } else if (isRecording) {
      setMobileState('recording');
    } else {
      setMobileState('connected');
    }
  }, [tokenState, isConnected, isRecording]); // FIXED: Include all tokenState changes

  // Manage wake lock based on recording state
  useEffect(() => {
    if (isRecording && wakeLockSupported) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [isRecording, wakeLockSupported, requestWakeLock, releaseWakeLock]);

  // Removed session request logic - no longer needed

  // 🛡️ PHASE 1 FIX: Retry mechanism for recording status
  const sendRecordingStatusWithRetry = useCallback(async (isRecording: boolean) => {
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const success = sendRecordingStatus(isRecording);
      if (success) {
        return true;
      }
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff: 1s, 2s)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    // Final fallback
    return false;
  }, [sendRecordingStatus]);

  const handleStartRecording = useCallback(async () => {
    if (mobileState === 'connected') {
      await startRecording();
      // Broadcast recording start to desktop
      await sendRecordingStatusWithRetry(true);
    }
  }, [mobileState, startRecording, sendRecordingStatusWithRetry]);

  const handleStopRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
      // 🛡️ Broadcast recording stop to desktop with retry
      await sendRecordingStatusWithRetry(false);
    }
  }, [isRecording, stopRecording, sendRecordingStatusWithRetry]);

  // Camera workflow handlers
  const handleCameraMode = useCallback(async () => {
    // Stop recording if active
    if (isRecording) {
      await stopRecording();
      await sendRecordingStatusWithRetry(false);
    }

    setMobileState('camera');
  }, [isRecording, stopRecording, sendRecordingStatusWithRetry]);

  const handleCameraCapture = useCallback((photoBlob: Blob, filename: string) => {
    const newPhoto: CapturedPhoto = {
      id: Math.random().toString(36).substr(2, 9),
      blob: photoBlob,
      timestamp: new Date().toISOString(),
      filename,
      status: 'captured',
    };

    setCapturedPhotos(prev => [...prev, newPhoto]);
  }, []);

  const handleCameraClose = useCallback(() => {
    if (capturedPhotos.length > 0) {
      setMobileState('reviewing');
    } else {
      setMobileState('connected');
    }
  }, [capturedPhotos.length]);

  const handleDeletePhoto = useCallback((photoId: string) => {
    setCapturedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  }, []);

  const handleRetakePhoto = useCallback(() => {
    setMobileState('camera');
  }, []);

  const uploadSinglePhoto = useCallback(async (photo: CapturedPhoto): Promise<void> => {
    if (!tokenState.token) {
      throw new Error('No mobile token available');
    }

    // Update photo status to uploading
    setCapturedPhotos(prev =>
      prev.map(p => p.id === photo.id ? { ...p, status: 'uploading' } : p),
    );

    // Initialize progress
    setUploadProgress(prev => [...prev, { photoId: photo.id, progress: 0 }]);

    try {
      // Get presigned URL for mobile upload
      const presignParams = new URLSearchParams({
        filename: photo.filename,
        mimeType: photo.blob.type,
        mobileTokenId: tokenState.token,
      });

      const presignResponse = await fetch(`/api/uploads/presign?${presignParams}`);
      if (!presignResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl } = await presignResponse.json();

      // Update progress
      setUploadProgress(prev =>
        prev.map(p => p.photoId === photo.id ? { ...p, progress: 50 } : p),
      );

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: photo.blob,
        headers: {
          'Content-Type': photo.blob.type,
          'X-Amz-Server-Side-Encryption': 'AES256',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image (${uploadResponse.status})`);
      }

      // Complete progress
      setUploadProgress(prev =>
        prev.map(p => p.photoId === photo.id ? { ...p, progress: 100 } : p),
      );

      // Update photo status to uploaded
      setCapturedPhotos(prev =>
        prev.map(p => p.id === photo.id ? { ...p, status: 'uploaded' } : p),
      );
    } catch (error) {
      console.error('Photo upload failed:', error);

      // Update photo status to failed
      setCapturedPhotos(prev =>
        prev.map(p => p.id === photo.id ? { ...p, status: 'failed' } : p),
      );

      // Update progress with error
      setUploadProgress(prev =>
        prev.map(p => p.photoId === photo.id
          ? { ...p, progress: 0, error: error instanceof Error ? error.message : 'Upload failed' }
          : p,
        ),
      );

      throw error;
    }
  }, [tokenState.token]);

  const handleUploadAll = useCallback(async () => {
    const photosToUpload = capturedPhotos.filter(p => p.status === 'captured' || p.status === 'failed');
    if (photosToUpload.length === 0) {
 return;
}

    setIsUploadingBatch(true);
    setMobileState('uploading');

    try {
      // Upload photos sequentially to avoid overwhelming the connection
      for (const photo of photosToUpload) {
        try {
          await uploadSinglePhoto(photo);
        } catch (error) {
          // Continue with other photos even if one fails
          console.error(`Failed to upload photo ${photo.id}:`, error);
        }
      }

      // Send notification to desktop about new images
      const uploadedPhotos = capturedPhotos.filter(p => p.status === 'uploaded');
      if (uploadedPhotos.length > 0 && tokenState.token) {
        sendImageNotification(tokenState.token, uploadedPhotos.length);
      }
    } finally {
      setIsUploadingBatch(false);

      // Check if all photos uploaded successfully
      const allUploaded = capturedPhotos.every(p => p.status === 'uploaded');
      if (allUploaded) {
        // Clear photos and return to recording
        setCapturedPhotos([]);
        setUploadProgress([]);
        setMobileState('connected');
      } else {
        // Some failed, stay in review mode
        setMobileState('reviewing');
      }
    }
  }, [capturedPhotos, uploadSinglePhoto, sendImageNotification, tokenState.token]);

  const handleCancelPhotos = useCallback(() => {
    // Clear all photos and return to connected state
    setCapturedPhotos([]);
    setUploadProgress([]);
    setMobileState('connected');
  }, []);

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
          title: 'Ready to Record',
          message: 'Connected to desktop - ready to record',
          canRecord: isConnected,
        };
      case 'recording':
        return {
          icon: <Mic className="size-8 text-red-500" />,
          title: 'Recording',
          message: 'Recording in progress - transcripts sent to desktop',
          canRecord: isConnected,
        };
      case 'camera':
        return {
          icon: <Camera className="size-8 text-blue-500" />,
          title: 'Camera Active',
          message: 'Capture clinical images',
          canRecord: false,
        };
      case 'reviewing':
        return {
          icon: <Camera className="size-8 text-blue-500" />,
          title: 'Review Photos',
          message: `${capturedPhotos.length} photo${capturedPhotos.length === 1 ? '' : 's'} captured`,
          canRecord: false,
        };
      case 'uploading':
        return {
          icon: <Upload className="size-8 text-blue-500" />,
          title: 'Uploading',
          message: 'Uploading photos to desktop...',
          canRecord: false,
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

  // Render camera component if in camera mode
  if (mobileState === 'camera') {
    return (
      <WebRTCCamera
        onCapture={handleCameraCapture}
        onClose={handleCameraClose}
        maxImageSize={800}
      />
    );
  }

  // Render photo review component if in reviewing mode
  if (mobileState === 'reviewing') {
    return (
      <PhotoReview
        photos={capturedPhotos}
        onDeletePhoto={handleDeletePhoto}
        onRetakePhoto={handleRetakePhoto}
        onUploadAll={handleUploadAll}
        onCancel={handleCancelPhotos}
        uploadProgress={uploadProgress}
        isUploading={isUploadingBatch}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex-1 p-4">
        {/* Always-visible camera CTA */}
        <div className="mx-auto mb-4 max-w-md">
          <Button
            onClick={handleCameraMode}
            size="lg"
            className="w-full"
            type="button"
          >
            <Camera className="mr-2 size-5" />
            Capture Clinical Images
          </Button>
        </div>
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
                    {wakeLockSupported ? 'Enabled' : 'Disabled'}
                  </div>
                )}
              </div>
            )}

            {/* Removed session info display - not needed in simplified architecture */}

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

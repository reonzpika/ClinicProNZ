'use client';

import { AlertTriangle, Camera } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useTranscription } from '@/src/features/clinical/main-ui/hooks/useTranscription';
import { useSimpleAbly } from '@/src/features/clinical/mobile/hooks/useSimpleAbly';
import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { createAuthHeadersForFormData } from '@/src/shared/utils';
import { useUploadImages } from '@/src/hooks/useImageQueries';
import { isFeatureEnabled } from '@/src/shared/utils/launch-config';

// Types for native mobile capture queue
type QueuedItem = { id: string; file: File; previewUrl: string };

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
  const { userId, isSignedIn } = useAuth();

  // Removed consultation stores - no session management needed

  // Auth-required state
  const [authError, setAuthError] = useState<string | null>(null);

  // Mobile state for UI - extended for camera functionality
  const [mobileState, setMobileState] = useState<'disconnected' | 'connecting' | 'connected' | 'recording' | 'camera' | 'reviewing' | 'uploading' | 'error'>('disconnected');

  // Native capture state (parity with /image)
  const [mobileStep, setMobileStep] = useState<'collect' | 'review'>('collect');
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);
  const cameraFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const uploadImages = useUploadImages();
  const isUploading = uploadImages.isPending;
  // removed uploadingFileCount (unused)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Wake lock functionality
  const { isSupported: wakeLockSupported, requestWakeLock, releaseWakeLock } = useWakeLock();

  const handleError = useCallback((error: string) => {
    setAuthError(error);
    setMobileState('error');
  }, []);

  // Refs to avoid use-before-define in callbacks
  const isRecordingRef = useRef<boolean>(false);
  const startRecordingRef = useRef<() => Promise<void> | void>(() => {});
  const stopRecordingRef = useRef<() => Promise<void> | void>(() => {});

  // Simple Ably for real-time sync - no session sync needed
  const { isConnected, sendRecordingStatus, sendImageNotification } = useSimpleAbly({
    userId: isSignedIn ? userId : null,
    onError: (err: string) => {
      handleError(err);
    },
    isMobile: true,
    onSessionContextChanged: (sessionId: string | null) => {
      setCurrentSessionId(sessionId);
    },
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
        setAuthError(`Control error: ${e instanceof Error ? e.message : 'Unknown error'}`);
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
        try { console.info('[Mobile] onChunkComplete auth', { isSignedIn, userId, size: audioBlob?.size }); } catch {}
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');

        if (!isSignedIn || !userId) {
          setAuthError('Not signed in');
          try { console.warn('[Mobile] Aborting upload: not signed in'); } catch {}
          return;
        }

        try { console.info('[Mobile] POST /api/deepgram/transcribe?persist=true starting'); } catch {}
        const response = await fetch('/api/deepgram/transcribe?persist=true', {
          method: 'POST',
          headers: createAuthHeadersForFormData(userId),
          body: formData,
        });

        try { console.info('[Mobile] POST /api/deepgram/transcribe?persist=true status', response.status); } catch {}
        if (!response.ok) {
          setAuthError(`Transcription failed: ${response.statusText}`);
          return;
        }
      } catch (error) {
        setAuthError(`Recording error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        try { console.error('[Mobile] onChunkComplete error', error); } catch {}
      }
    },
  });

  // Keep refs updated with latest recording controls
  useEffect(() => {
    isRecordingRef.current = isRecording;
    startRecordingRef.current = startRecording;
    stopRecordingRef.current = stopRecording;
  }, [isRecording, startRecording, stopRecording]);

  // No token validation; require login

  // Update mobile state based on connection and session
  useEffect(() => {
    if (authError) {
      setMobileState('error');
    } else if (!isSignedIn || !userId) {
      setMobileState('disconnected');
    } else if (!isConnected) {
      setMobileState('connecting');
    } else if (isRecording) {
      setMobileState('recording');
    } else {
      setMobileState('connected');
    }
  }, [authError, isConnected, isRecording, isSignedIn, userId]);

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

  // Removed legacy WebRTC camera handlers in favour of native capture

  // state info removed - simplified UI

  // Sign-in required
  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-gray-600">Please sign in to use mobile recording</p>
            <Button onClick={() => (window.location.href = '/auth/login')} size="lg" className="w-full">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Removed WebRTC camera/review components in favour of native capture flow

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex-1 p-4">
        {/* Native capture controls (parity with /image) */}
        <div className="mx-auto mb-4 max-w-md space-y-3">
          {mobileStep === 'collect' && (
            <>
              <Button onClick={() => cameraFileInputRef.current?.click()} size="lg" className="w-full" type="button">
                <Camera className="mr-2 size-5" />
                Capture with camera
              </Button>
              {isFeatureEnabled('MOBILE_GALLERY_UPLOADS') && (
                <Button onClick={() => galleryFileInputRef.current?.click()} size="lg" variant="outline" className="w-full" type="button">
                  Upload from gallery
                </Button>
              )}
              {queuedItems.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">{queuedItems.length} photo{queuedItems.length === 1 ? '' : 's'} selected</p>
                    <Button onClick={() => setMobileStep('review')} variant="outline" className="mt-2 w-full">Review & upload</Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {mobileStep === 'review' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {queuedItems.map(item => (
                  <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg border">
                    {item.previewUrl
                      ? <img src={item.previewUrl} alt={item.file.name} className="size-full object-cover" />
                      : <div className="flex size-full items-center justify-center text-xs text-gray-500">Loading...</div>}
                    <button
                      onClick={() => {
                        URL.revokeObjectURL(item.previewUrl);
                        setQueuedItems(prev => prev.filter(it => it.id !== item.id));
                      }}
                      className="absolute right-2 top-2 rounded bg-white/80 px-2 py-1 text-xs text-red-600"
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => cameraFileInputRef.current?.click()} variant="outline" className="flex-1" type="button">Take more</Button>
                {isFeatureEnabled('MOBILE_GALLERY_UPLOADS') && (
                  <Button onClick={() => galleryFileInputRef.current?.click()} variant="outline" className="flex-1" type="button">From gallery</Button>
                )}
                <Button
                  onClick={() => {
                    queuedItems.forEach(it => it.previewUrl && URL.revokeObjectURL(it.previewUrl));
                    setQueuedItems([]);
                    setMobileStep('collect');
                  }}
                  variant="ghost"
                  className="flex-1"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  disabled={queuedItems.length === 0 || isUploading}
                  onClick={async () => {
                    const filesToUpload = queuedItems.map(it => it.file);
                    try {
                      await uploadImages.mutateAsync({ files: filesToUpload, patientSessionId: currentSessionId || undefined });
                      // Ably notify desktop to refresh
                      try { sendImageNotification(undefined, filesToUpload.length, currentSessionId || undefined); } catch {}
                      // Clear queue and return
                      queuedItems.forEach(it => it.previewUrl && URL.revokeObjectURL(it.previewUrl));
                      setQueuedItems([]);
                      setMobileStep('collect');
                    } catch (err) {
                      console.error('Upload failed:', err);
                    } finally {
                    }
                  }}
                  type="button"
                >
                  {isUploading ? 'Uploading...' : `Upload ${queuedItems.length} photo${queuedItems.length === 1 ? '' : 's'}`}
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* Hidden File Inputs for Mobile */}
        <input type="file" ref={cameraFileInputRef} onChange={handleFileSelect} accept="image/*" capture="environment" multiple className="hidden" />
        {isFeatureEnabled('MOBILE_GALLERY_UPLOADS') && (
          <input type="file" ref={galleryFileInputRef} onChange={handleFileSelect} multiple accept="image/*" className="hidden" />
        )}
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Mobile Recording</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Connection Status - simplified */}
            <div className="text-center">
              <h3 className="text-lg font-semibold">{isConnected ? 'Ready to Record' : 'Connecting…'}</h3>
              <p className="text-sm text-gray-600">{isConnected ? 'Connected to desktop - ready to record' : 'Please ensure you are connected'}</p>
            </div>

            {/* Error Display */}
            {mobileState === 'error' && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <div>
                  <div className="font-medium">Connection Error</div>
                  <div className="text-sm">{authError}</div>
                </div>
              </Alert>
            )}

            {/* Recording Controls - simplified */}
            {isConnected && (
              <div className="space-y-3">
                <Button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  size="lg"
                  type="button"
                  className={`w-full ${isRecording ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                <div className="text-center text-xs text-gray-500">
                  {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
                </div>
                <div className="text-center text-xs text-gray-400">
                  Screen lock:
                  {' '}
                  {wakeLockSupported ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            )}

            {/* Removed session info display - not needed in simplified architecture */}

            {/* Instructions removed for simplified UI */}
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

'use client';

import { useAuth } from '@clerk/nextjs';
import { AlertTriangle, Camera } from 'lucide-react';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useTranscription } from '@/src/features/clinical/main-ui/hooks/useTranscription';
import { useSimpleAbly } from '@/src/features/clinical/mobile/hooks/useSimpleAbly';
import { ConsentModal } from '@/src/features/clinical/session-management/components/ConsentModal';
import { useUploadImages } from '@/src/hooks/useImageQueries';
import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { createAuthHeadersForFormData, fetchWithRetry } from '@/src/shared/utils';
import { isFeatureEnabled } from '@/src/shared/utils/launch-config';

// Types for native mobile capture queue
  type QueuedItem = { id: string; file: File; previewUrl: string; identifier?: string };

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
    } catch (_e) {}
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

  // Auth-required state
  const [authError, setAuthError] = useState<string | null>(null);

  // Mobile state for UI
  const [mobileState, setMobileState] = useState<'disconnected' | 'connecting' | 'connected' | 'recording' | 'error'>('disconnected');

  // Native capture state
  const [mobileStep, setMobileStep] = useState<'collect' | 'review'>('collect');
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);
  const cameraFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const uploadImages = useUploadImages();
  const [patientNameInput, setPatientNameInput] = useState('');
  const isUploading = uploadImages.isPending;
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

  // Simple Ably for real-time sync
  const [consentOpen, setConsentOpen] = useState(false);
  const pendingRequestIdRef = useRef<string | null>(null);
  const consentTimerRef = useRef<any>(null);
  const consentOpenDelayRef = useRef<any>(null);

  const currentSessionIdRef = useRef<string | null>(null);

  const { isConnected, sendRecordingStatus, sendImageUploadStarted, sendImageUploaded, sendConsentRequest, sendConsentGranted, sendConsentDenied } = useSimpleAbly({
    userId: isSignedIn ? userId : null,
    onError: (err: string) => {
      handleError(err);
    },
    isMobile: true,

    onSessionContextChanged: (sessionId) => {
      currentSessionIdRef.current = sessionId || null;
      // Reset per-session consent when session context changes
      try { (window as any).__clinicproConsentObtained = false; } catch {}
      setConsentOpen(false);
      pendingRequestIdRef.current = null;
    },

    onControlCommand: async (action: 'start' | 'stop') => {
      try {
        if (action === 'start' && !isRecordingRef.current) {
          // If consent already granted this session, start immediately
          if (typeof window !== 'undefined') {
            const consent = (window as any).__clinicproConsentObtained as boolean | undefined;
            if (consent) {
              await startRecordingRef.current?.();
              sendRecordingStatus(true);
              return;
            }
          }
          // Require consent first: emit request and open modal
          const requestId = Math.random().toString(36).slice(2, 10);
          pendingRequestIdRef.current = requestId;
          sendConsentRequest?.(requestId, 'desktop', currentSessionIdRef.current);
          // Delay opening modal briefly to allow auto-grant to arrive
          if (consentOpenDelayRef.current) { clearTimeout(consentOpenDelayRef.current); }
          consentOpenDelayRef.current = setTimeout(() => setConsentOpen(true), 200);
          return;
        }
        if (action === 'stop' && isRecordingRef.current) {
          await stopRecordingRef.current?.();
          sendRecordingStatus(false);
        }
      } catch (e) {
        setAuthError(`Control error: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    },
    onConsentRequested: ({ requestId }) => {
      // If consent already granted this session on mobile, auto-grant and skip modal
      const alreadyConsented = typeof window !== 'undefined' && (window as any).__clinicproConsentObtained === true;
      if (alreadyConsented) {
        try { sendConsentGranted?.(requestId, 'mobile', currentSessionIdRef.current); } catch {}
        return;
      }
      // When local user taps start, we'll emit, but also if desktop emits, show modal
      pendingRequestIdRef.current = requestId;
      setConsentOpen(true);
      // Start timeout to auto-deny after 30s
      if (consentTimerRef.current) {
        clearTimeout(consentTimerRef.current);
      }
      consentTimerRef.current = setTimeout(() => {
        try {
          if (pendingRequestIdRef.current) {
            sendConsentDenied?.(pendingRequestIdRef.current, 'mobile', 'timeout');
          }
        } catch {}
        // Cancel delayed open if pending; otherwise close if visible
        if (consentOpenDelayRef.current) { clearTimeout(consentOpenDelayRef.current); consentOpenDelayRef.current = null; }
        setConsentOpen(false);
        pendingRequestIdRef.current = null;
      }, 30000);
    },
    onConsentGranted: async ({ requestId }) => {
      if (pendingRequestIdRef.current && requestId === pendingRequestIdRef.current) {
        // Cancel delayed open if pending; otherwise close if visible
        if (consentOpenDelayRef.current) { clearTimeout(consentOpenDelayRef.current); consentOpenDelayRef.current = null; }
        setConsentOpen(false);
        if (consentTimerRef.current) {
          clearTimeout(consentTimerRef.current);
          consentTimerRef.current = null;
        }
        // Start immediately on mobile if not already recording
        if (!isRecordingRef.current) {
          await startRecordingRef.current?.();
          sendRecordingStatus(true);
        }
        pendingRequestIdRef.current = null;
        // Persist consent flag locally for this session lifecycle
        try { (window as any).__clinicproConsentObtained = true; } catch {}
      }
    },
    onConsentDenied: ({ requestId }) => {
      if (pendingRequestIdRef.current && requestId === pendingRequestIdRef.current) {
        setConsentOpen(false);
        if (consentTimerRef.current) {
          clearTimeout(consentTimerRef.current);
          consentTimerRef.current = null;
        }
        pendingRequestIdRef.current = null;
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
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        const reqId = Math.random().toString(36).slice(2, 10);

        if (!isSignedIn || !userId) {
          setAuthError('Not signed in');
          return;
        }

        const response = await fetchWithRetry('/api/deepgram/transcribe?persist=true', {
          method: 'POST',
          headers: { ...createAuthHeadersForFormData(userId), 'X-Debug-Request-Id': reqId },
          body: formData,
        }, { maxRetries: 2 });
        // timing omitted
        if (!response.ok) {
          setAuthError(`Transcription failed: ${response.statusText}`);
        }
      } catch (_e) {
        setAuthError('Recording error');
      }
    },
  });

  // Keep refs updated with latest recording controls
  useEffect(() => {
    isRecordingRef.current = isRecording;
    startRecordingRef.current = startRecording;
    stopRecordingRef.current = stopRecording;
  }, [isRecording, startRecording, stopRecording]);

  // Heartbeat while recording to keep desktop in sync
  useEffect(() => {
    if (!isRecording) {
      return;
    }
    const interval = setInterval(() => {
      try {
        sendRecordingStatus(true);
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [isRecording, sendRecordingStatus]);

  // Best-effort immediate stop when page is closing or hidden
  useEffect(() => {
    const stopOnUnload = () => {
      try {
        if (isRecordingRef.current) {
          // Fire-and-forget; cannot await during unload
          stopRecordingRef.current?.();
          sendRecordingStatus(false);
        }
      } catch {}
    };
    const onVisibilityChange = () => {
      try {
        if (document.visibilityState === 'hidden') {
          stopOnUnload();
        }
      } catch {}
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', stopOnUnload);
      window.addEventListener('beforeunload', stopOnUnload);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pagehide', stopOnUnload);
        window.removeEventListener('beforeunload', stopOnUnload);
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
    };
  }, [sendRecordingStatus]);

  // Update mobile state based on connection and auth
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

  // Retry mechanism for recording status
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
    if (mobileState !== 'connected') {
      return;
    }
    // If consent already granted in this session, start immediately
    const alreadyConsented = typeof window !== 'undefined' && (window as any).__clinicproConsentObtained === true;
    if (alreadyConsented) {
      if (!isRecordingRef.current) {
        await startRecordingRef.current?.();
        sendRecordingStatus(true);
      }
      return;
    }
    // Initiate consent flow first
    const requestId = Math.random().toString(36).slice(2, 10);
    pendingRequestIdRef.current = requestId;
    sendConsentRequest?.(requestId, 'mobile', currentSessionIdRef.current);
    // Delay opening to allow potential auto-grant from desktop
    if (consentOpenDelayRef.current) { clearTimeout(consentOpenDelayRef.current); }
    consentOpenDelayRef.current = setTimeout(() => setConsentOpen(true), 200);
  }, [mobileState, sendConsentRequest]);

  const handleStopRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
      // Broadcast recording stop to desktop with retry
      await sendRecordingStatusWithRetry(false);
    }
  }, [isRecording, stopRecording, sendRecordingStatusWithRetry]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
 return;
}
    const fileArray = Array.from(files);
    setQueuedItems(prev => ([
      ...prev,
      ...fileArray.map(f => ({ id: Math.random().toString(36).slice(2), file: f, previewUrl: URL.createObjectURL(f) })),
    ]));
    setMobileStep('review');
    if (event.target) {
 event.target.value = '';
}
  }, []);

  useEffect(() => () => {
    queuedItems.forEach(item => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
  }, [queuedItems]);

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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex-1 p-4">
        {/* Native capture controls */}
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
              <div className="mt-2">
                <label htmlFor="mobile-collect-patient-name" className="mb-1 block text-xs text-gray-600">Patient name (optional)</label>
                <input
                  id="mobile-collect-patient-name"
                  type="text"
                  value={patientNameInput}
                  onChange={e => setPatientNameInput(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full rounded-md border p-2 text-sm"
                />
              </div>
              {queuedItems.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">
{queuedItems.length}
{' '}
photo
{queuedItems.length === 1 ? '' : 's'}
{' '}
selected
                    </p>
                    <Button onClick={() => setMobileStep('review')} variant="outline" className="mt-2 w-full">Review & upload</Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {mobileStep === 'review' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="mobile-review-patient-name" className="mb-1 block text-xs text-gray-600">Patient name (optional)</label>
                <input
                  id="mobile-review-patient-name"
                  type="text"
                  value={patientNameInput}
                  onChange={e => setPatientNameInput(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full rounded-md border p-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {queuedItems.map(item => (
                  <div key={item.id} className="relative overflow-hidden rounded-lg border">
                    <div className="aspect-square w-full">
                      {item.previewUrl
                        ? <img src={item.previewUrl} alt={item.file.name} className="size-full object-cover" />
                        : <div className="flex size-full items-center justify-center text-xs text-gray-500">Loading...</div>}
                    </div>
                    <div className="p-2">
                      <input
                        type="text"
                        value={item.identifier || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQueuedItems(prev => prev.map(it => it.id === item.id ? { ...it, identifier: val } : it));
                        }}
                        placeholder="Identifier (e.g., left forearm)"
                        className="w-full rounded-md border px-2 py-1 text-xs"
                      />
                    </div>
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
                      // Emit started event to desktop (best effort)
                      try { sendImageUploadStarted?.(filesToUpload.length, currentSessionIdRef.current); } catch {}
                      await uploadImages.mutateAsync({
                        files: filesToUpload,
                        names: queuedItems.map(it => ({ patientName: patientNameInput || undefined, identifier: it.identifier || undefined })),
                      });
                      // Notify desktop completion (compat path retained)
                      try { sendImageUploaded?.(filesToUpload.length, currentSessionIdRef.current); } catch {}
                      // Clear queue and return
                      queuedItems.forEach(it => it.previewUrl && URL.revokeObjectURL(it.previewUrl));
                      setQueuedItems([]);
                      setMobileStep('collect');
                    } catch {
                      // Swallow upload error for UI; error toast handled elsewhere
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
        {/* Hidden File Inputs */}
        <input type="file" ref={cameraFileInputRef} onChange={handleFileSelect} accept="image/*" capture="environment" multiple className="hidden" />
        {isFeatureEnabled('MOBILE_GALLERY_UPLOADS') && (
          <input type="file" ref={galleryFileInputRef} onChange={handleFileSelect} multiple accept="image/*" className="hidden" />
        )}
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Mobile Recording</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Connection Status */}
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

            {/* Recording Controls */}
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
          </CardContent>
        </Card>
        {/* Consent Modal */}
        <ConsentModal
          isOpen={consentOpen}
          onConfirm={() => {
            const id = pendingRequestIdRef.current;
            if (id) {
              try {
 sendConsentGranted?.(id, 'mobile');
} catch {}
            }
            if (consentOpenDelayRef.current) { clearTimeout(consentOpenDelayRef.current); consentOpenDelayRef.current = null; }
            setConsentOpen(false);
          }}
          onCancel={() => {
            const id = pendingRequestIdRef.current;
            if (id) {
              try {
 sendConsentDenied?.(id, 'mobile', 'user');
} catch {}
            }
            if (consentOpenDelayRef.current) { clearTimeout(consentOpenDelayRef.current); consentOpenDelayRef.current = null; }
            setConsentOpen(false);
          }}
        />
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

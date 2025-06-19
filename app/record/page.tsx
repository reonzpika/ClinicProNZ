'use client';

import { AlertCircle, Clock, Loader2, Mic, MicOff, Pause, Play } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { useMobileRecording } from '@/features/consultation/hooks/useMobileRecording';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

type ValidationResult = {
  valid: boolean;
  sessionId: string;
  userId: string;
  expiresAt: string;
};

// Separate component that uses useSearchParams
function MobileRecordingContent() {
  const searchParams = useSearchParams();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const sessId = searchParams.get('sessId');
  const token = searchParams.get('token');

  // Initialize mobile recording hook
  const mobileRecording = useMobileRecording({
    sessionId: validationResult?.sessionId || '',
    token: token || '',
    onTranscriptionReceived: () => {
      // No need for additional API call - mobile-upload already handles syncing
      // via SessionSyncService.addTranscription() in the backend
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    },
  });

  // Update time remaining
  useEffect(() => {
    if (!validationResult) {
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(validationResult.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [validationResult]);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !sessId) {
        setError('Invalid access link. Please scan the QR code again.');
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch('/api/recording/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, sessionId: sessId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Token validation failed');
        }

        const result = await response.json();
        setValidationResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to validate access');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, sessId]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) {
      return 'Expired';
    }
    if (seconds < 300) {
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s remaining`;
    } // Show warning if < 5 min

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
  };

  const isExpiringSoon = timeRemaining > 0 && timeRemaining < 300; // Less than 5 minutes

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="size-6 animate-spin" />
              <span>Validating access...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !validationResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="size-4" />
              <div>
                <div className="font-medium">Access Denied</div>
                <div className="text-sm">{error}</div>
              </div>
            </Alert>
            <p className="text-center text-sm text-slate-600">
              Please scan the QR code again from the consultation page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (timeRemaining <= 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive" className="mb-4">
              <Clock className="size-4" />
              <div>
                <div className="font-medium">Session Expired</div>
                <div className="text-sm">This recording session has expired.</div>
              </div>
            </Alert>
            <p className="text-center text-sm text-slate-600">
              Please ask the GP to generate a new QR code from the desktop.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white p-4">
        <div className="mx-auto max-w-md">
          <h1 className="text-lg font-semibold text-slate-900">ConsultAI NZ</h1>
          <p className="text-sm text-slate-600">Mobile Recording</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="mx-auto max-w-md space-y-4">
          {/* Expiry Warning */}
          {isExpiringSoon && (
            <Alert variant="destructive">
              <Clock className="size-4" />
              <div>
                <div className="font-medium">Session Expiring Soon</div>
                <div className="text-sm">
                  {formatTimeRemaining(timeRemaining)}
                  {' '}
                  - Ask GP to generate new QR code
                </div>
              </div>
            </Alert>
          )}

          {/* Session Info */}
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-sm font-medium">Session Information</h2>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-xs text-slate-600">
                <div>
                  Session:
                  <span className="font-mono">{validationResult?.sessionId}</span>
                </div>
                <div>
                  Chunks processed:
                  <span className="font-medium">{mobileRecording.chunksUploaded}</span>
                </div>
                <div className={isExpiringSoon ? 'font-medium text-orange-600' : ''}>
                  {formatTimeRemaining(timeRemaining)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recording Controls */}
          <Card>
            <CardContent className="space-y-4 p-6 text-center">
              {/* Recording State Indicator */}
              <div className="flex items-center justify-center">
                {mobileRecording.isRecording
                  ? (
                      <div className="flex items-center space-x-2">
                        {mobileRecording.isPaused
                          ? (
                              <Pause className="size-5 text-yellow-600" />
                            )
                          : (
                              <div className="size-3 animate-pulse rounded-full bg-red-500" />
                            )}
                        <span className="font-mono text-lg text-red-600">
                          {formatDuration(mobileRecording.recordingDuration)}
                        </span>
                      </div>
                    )
                  : mobileRecording.isTranscribing
                    ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="size-5 animate-spin text-blue-600" />
                          <span className="text-sm text-blue-600">Processing audio...</span>
                        </div>
                      )
                    : (
                        <div className="text-sm text-slate-600">
                          Ready to record audio for consultation
                        </div>
                      )}

                {/* No input warning */}
                {mobileRecording.noInputWarning && mobileRecording.isRecording && !mobileRecording.isPaused && (
                  <div className="ml-2 text-xs text-red-500">
                    No audio detected - check microphone
                  </div>
                )}
              </div>

              {/* Main Action Buttons */}
              <div className="space-y-3">
                {!mobileRecording.isRecording && (
                  <Button
                    onClick={mobileRecording.startRecording}
                    size="lg"
                    className="size-32 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Mic className="size-8" />
                      <span className="text-sm font-medium">Start Recording</span>
                    </div>
                  </Button>
                )}

                {mobileRecording.isRecording && (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex space-x-3">
                      {!mobileRecording.isPaused
                        ? (
                            <Button
                              onClick={mobileRecording.pauseRecording}
                              size="lg"
                              variant="outline"
                              className="size-24 rounded-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                            >
                              <div className="flex flex-col items-center space-y-1">
                                <Pause className="size-6" />
                                <span className="text-xs">Pause</span>
                              </div>
                            </Button>
                          )
                        : (
                            <Button
                              onClick={mobileRecording.resumeRecording}
                              size="lg"
                              variant="outline"
                              className="size-24 rounded-full border-green-500 text-green-600 hover:bg-green-50"
                            >
                              <div className="flex flex-col items-center space-y-1">
                                <Play className="size-6" />
                                <span className="text-xs">Resume</span>
                              </div>
                            </Button>
                          )}

                      <Button
                        onClick={mobileRecording.stopRecording}
                        size="lg"
                        variant="outline"
                        className="size-24 rounded-full border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <MicOff className="size-6" />
                          <span className="text-xs">Stop</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {(error || mobileRecording.error) && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <div className="text-sm">{error || mobileRecording.error}</div>
            </Alert>
          )}

          {/* Instructions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-medium">Recording Tips:</h3>
              <ul className="space-y-1 text-xs text-slate-600">
                <li>• Recordings are automatically sent to desktop</li>
                <li>• Use pause/resume for long conversations</li>
                <li>• Keep the app open during recording</li>
                <li>• Ensure good audio quality and proximity</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function RecordingPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="size-6 animate-spin" />
            <span>Loading recording session...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function MobileRecordingPage() {
  return (
    <Suspense fallback={<RecordingPageFallback />}>
      <MobileRecordingContent />
    </Suspense>
  );
}

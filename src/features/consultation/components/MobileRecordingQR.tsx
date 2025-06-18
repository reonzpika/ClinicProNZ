'use client';

import { useAuth } from '@clerk/nextjs';
import { AlertTriangle, CheckCircle, Clock, LogIn, RefreshCw, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';

import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

type QRTokenData = {
  token: string;
  url: string;
  expiresAt: string;
};

export const MobileRecordingQR = () => {
  const { isSignedIn, userId } = useAuth();
  const {
    sessionId,
    setMobileRecordingActive,
    setMobileTokenGenerated,
    mobileRecording,
    isMobileRecordingDisabled,
  } = useConsultation();

  const [qrData, setQrData] = useState<QRTokenData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);

  // Update remaining time and show warnings
  useEffect(() => {
    if (!qrData) {
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(qrData.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

      setTimeRemaining(remaining);

      // Show warning if less than 30 minutes remaining
      setShowExpiryWarning(remaining > 0 && remaining < 1800);

      // Auto-refresh if expired
      if (remaining <= 0 && qrData) {
        setQrData(null);
        setMobileTokenGenerated(false);
        setError('QR code has expired. Please generate a new one.');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [qrData, setMobileTokenGenerated]);

  const generateToken = useCallback(async () => {
    if (!sessionId) {
      setError('No active session found');
      return;
    }

    if (!isSignedIn || !userId) {
      setError('Please sign in to generate QR code for mobile recording');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/recording/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate token');
      }

      const { token, expiresAt } = await response.json();
      const url = `${window.location.origin}/record?sessId=${sessionId}&token=${token}`;

      const tokenData = { token, url, expiresAt };
      setQrData(tokenData);
      setMobileTokenGenerated(true, expiresAt);
      setMobileRecordingActive(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      setQrData(null);
      setMobileTokenGenerated(false);
    } finally {
      setIsGenerating(false);
    }
  }, [sessionId, setMobileTokenGenerated, setMobileRecordingActive, isSignedIn, userId]);

  const stopMobileRecording = useCallback(() => {
    setQrData(null);
    setMobileTokenGenerated(false);
    setMobileRecordingActive(false);
    setError(null);
  }, [setMobileTokenGenerated, setMobileRecordingActive]);

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s remaining`;
    } else {
      return `${remainingSeconds}s remaining`;
    }
  };

  const isExpired = timeRemaining <= 0 && qrData;
  const isExpiringSoon = timeRemaining > 0 && timeRemaining < 1800; // 30 minutes

  const handleSignIn = () => {
    window.location.href = '/login';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smartphone className="size-5" />
          <span>Mobile Recording</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authentication Status */}
        {!isSignedIn && (
          <Alert>
            <LogIn className="size-4" />
            <div>
              <div className="font-medium">Sign in required</div>
              <div className="text-sm">Please sign in to use mobile recording</div>
            </div>
          </Alert>
        )}

        {/* Desktop Recording Status */}
        {isMobileRecordingDisabled() && (
          <Alert>
            <AlertTriangle className="size-4" />
            <div>
              <div className="font-medium">Desktop recording active</div>
              <div className="text-sm">Stop desktop recording to enable mobile recording</div>
            </div>
          </Alert>
        )}

        {/* Mobile Recording Status */}
        {mobileRecording.isActive && !isExpired && (
          <Alert className={isExpiringSoon ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
            <div className="flex items-center space-x-2">
              {isExpiringSoon
                ? (
                    <Clock className="size-4 text-orange-600" />
                  )
                : (
                    <CheckCircle className="size-4 text-green-600" />
                  )}
              <div>
                <div className="font-medium">
                  {isExpiringSoon ? 'Mobile recording expires soon' : 'Mobile recording ready'}
                </div>
                <div className="text-sm">
                  {formatTimeRemaining(timeRemaining)}
                </div>
              </div>
            </div>
          </Alert>
        )}

        {/* Expiry Warning */}
        {showExpiryWarning && qrData && (
          <Alert variant="destructive">
            <Clock className="size-4" />
            <div>
              <div className="font-medium">QR Code Expiring Soon</div>
              <div className="text-sm">
                {formatTimeRemaining(timeRemaining)}
                {' '}
                - Consider generating a new code
              </div>
            </div>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <div className="text-sm">{error}</div>
          </Alert>
        )}

        {/* QR Code Display */}
        {qrData && !isExpired && (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
              <QRCodeSVG
                value={qrData.url}
                size={200}
                level="M"
                includeMargin
                className="block"
              />
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm text-gray-600">
                Scan with mobile device to start recording
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>
                  Session:
                  <span className="font-mono">{sessionId}</span>
                </div>
                <div className={isExpiringSoon ? 'font-medium text-orange-600' : ''}>
                  {formatTimeRemaining(timeRemaining)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex space-x-2">
          {!isSignedIn
            ? (
                <Button onClick={handleSignIn} className="flex-1">
                  <LogIn className="mr-2 size-4" />
                  Sign In to Use Mobile Recording
                </Button>
              )
            : !qrData
                ? (
                    <Button
                      onClick={generateToken}
                      disabled={isGenerating || isMobileRecordingDisabled()}
                      className="flex-1"
                    >
                      {isGenerating
                        ? (
                            <>
                              <RefreshCw className="mr-2 size-4 animate-spin" />
                              Generating...
                            </>
                          )
                        : (
                            <>
                              <Smartphone className="mr-2 size-4" />
                              Generate QR Code
                            </>
                          )}
                    </Button>
                  )
                : (
                    <>
                      <Button
                        onClick={generateToken}
                        disabled={isGenerating}
                        variant="outline"
                        className="flex-1"
                      >
                        {isGenerating
                          ? (
                              <>
                                <RefreshCw className="mr-2 size-4 animate-spin" />
                                Generating...
                              </>
                            )
                          : (
                              <>
                                <RefreshCw className="mr-2 size-4" />
                                New QR Code
                              </>
                            )}
                      </Button>

                      <Button onClick={stopMobileRecording} variant="outline" className="flex-1">
                        Stop Mobile Recording
                      </Button>
                    </>
                  )}
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-gray-50 p-3">
          <h4 className="mb-2 text-sm font-medium">Instructions:</h4>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>1. Generate QR code above</li>
            <li>2. Scan with mobile phone camera</li>
            <li>3. Allow microphone access when prompted</li>
            <li>4. Start recording on mobile device</li>
            <li>5. Transcription appears automatically here</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

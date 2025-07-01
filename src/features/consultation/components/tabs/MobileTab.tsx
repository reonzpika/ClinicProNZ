'use client';

import { useAuth } from '@clerk/nextjs';
import { AlertTriangle, CheckCircle, Clock, LogIn, RefreshCw, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useCallback, useEffect, useState } from 'react';

import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

type QRTokenData = {
  token: string;
  mobileUrl: string;
  expiresAt: string;
};

export const MobileTab: React.FC = () => {
  const { isSignedIn, userId } = useAuth();
  const {
    mobileV2 = { isEnabled: false, token: null, tokenData: null, connectedDevices: [], connectionStatus: 'disconnected' },
    setMobileV2TokenData,
    enableMobileV2,
    ensureActiveSession,
  } = useConsultation();

  const [qrData, setQrData] = useState<QRTokenData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get connected devices from context
  const connectedDevices = mobileV2.connectedDevices.filter(d => d.deviceType === 'Mobile');

  // Restore QR data from context when component mounts or tokenData changes (client-side only)
  useEffect(() => {
    if (isClient && mobileV2.tokenData && !qrData) {
      setQrData(mobileV2.tokenData);
    }
  }, [isClient, mobileV2.tokenData, qrData]);

  // Update remaining time (client-side only)
  useEffect(() => {
    if (!isClient || !qrData) {
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(qrData.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeRemaining(remaining);

      // Auto-refresh if expired
      if (remaining <= 0) {
        setQrData(null);
        setError('QR code has expired. Please generate a new one.');
        setMobileV2TokenData(null);
        enableMobileV2(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isClient, qrData, setMobileV2TokenData, enableMobileV2]);

  const generateToken = useCallback(async () => {
    if (!isSignedIn || !userId) {
      setError('Please sign in to generate QR code');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await ensureActiveSession();

      const response = await fetch('/api/mobile/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate token');
      }

      const { token, mobileUrl, expiresAt } = await response.json();
      const tokenData = { token, mobileUrl, expiresAt };
      setQrData(tokenData);
      setMobileV2TokenData(tokenData);
      enableMobileV2(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      setQrData(null);
    } finally {
      setIsGenerating(false);
    }
  }, [isSignedIn, userId, ensureActiveSession, setMobileV2TokenData, enableMobileV2]);

  const stopMobileRecording = useCallback(() => {
    setQrData(null);
    setError(null);
    setMobileV2TokenData(null);
    enableMobileV2(false);
  }, [setMobileV2TokenData, enableMobileV2]);

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      return `${minutes}m remaining`;
    } else {
      return `${seconds}s remaining`;
    }
  };

  const isExpired = timeRemaining <= 0 && qrData;
  const isExpiringSoon = timeRemaining > 0 && timeRemaining < 3600;

  const handleSignIn = () => {
    if (isClient) {
      window.location.href = '/login';
    }
  };

  return (
    <div className="space-y-4">
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

      {/* Connected Devices */}
      {connectedDevices.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="size-4 text-green-600" />
          <div>
            <div className="font-medium text-green-800">
              {connectedDevices.length}
              {' '}
              mobile device(s) connected
            </div>
            <div className="text-sm text-green-700">
              {connectedDevices.map(device => device.deviceName).join(', ')}
            </div>
          </div>
        </Alert>
      )}

      {/* Expiry Warning */}
      {isExpiringSoon && qrData && (
        <Alert variant="destructive">
          <Clock className="size-4" />
          <div>
            <div className="font-medium">QR Code Expiring Soon</div>
            <div className="text-sm">{formatTimeRemaining(timeRemaining)}</div>
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

      {/* QR Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="size-5" />
            Mobile Recording
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code Display - only render on client to prevent SSR issues */}
          {isClient && qrData && !isExpired
            ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="rounded-lg border-2 border-gray-200 bg-white p-3">
                    <QRCodeSVG
                      value={qrData.mobileUrl}
                      size={120}
                      level="M"
                      includeMargin
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Scan with your mobile device
                    </p>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatTimeRemaining(timeRemaining)}
                    </div>
                  </div>
                </div>
              )
            : (
                <div className="text-center text-gray-500">
                  <Smartphone className="mx-auto mb-2 size-12 text-gray-400" />
                  <p className="text-sm">No mobile QR code active</p>
                </div>
              )}

          {/* Control Buttons */}
          <div className="flex flex-col space-y-2">
            {!isSignedIn
              ? (
                  <Button
                    onClick={handleSignIn}
                    className="w-full"
                    size="sm"
                  >
                    <LogIn className="mr-2 size-4" />
                    Sign In
                  </Button>
                )
              : !qrData
                  ? (
                      <Button
                        onClick={generateToken}
                        disabled={isGenerating}
                        className="w-full"
                        size="sm"
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
                          className="w-full"
                          size="sm"
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

                        <Button onClick={stopMobileRecording} variant="outline" className="w-full" size="sm">
                          Disconnect Devices
                        </Button>
                      </>
                    )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

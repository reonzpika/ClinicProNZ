'use client';

import { useAuth } from '@clerk/nextjs';
import { AlertTriangle, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeaders } from '@/src/shared/utils';

type QRTokenData = {
  token: string;
  mobileUrl: string;
  expiresAt: string;
};

type MobileRecordingQRV2Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const MobileRecordingQRV2: React.FC<MobileRecordingQRV2Props> = ({
  isOpen,
  onClose,
}) => {
  const { isSignedIn, userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const {
    mobileV2 = { isEnabled: false, token: null, tokenData: null, connectionStatus: 'disconnected' },
    setMobileV2TokenData,
    enableMobileV2,
    ensureActiveSession,
    // Guest tokens removed - authentication required
  } = useConsultationStores();

  // Simplified state for the new approach
  const [qrData, setQrData] = useState<QRTokenData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Restore QR data from context when component mounts
  useEffect(() => {
    if (isClient && mobileV2.tokenData && !qrData) {
      setQrData(mobileV2.tokenData);
    }
  }, [isClient, mobileV2.tokenData, qrData]);

  // Simple timer for token expiry
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
      if (remaining <= 0 && qrData) {
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
    setIsGenerating(true);
    setError(null);

    try {
      // Ensure we have an active patient session for authenticated users
      if (isSignedIn && userId) {
        await ensureActiveSession();
      }

      const response = await fetch('/api/mobile/generate-token', {
        method: 'POST',
        headers: createAuthHeaders(userId, userTier),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle session limit errors
        if (response.status === 429) {
          setError(errorData.message || 'Session limit exceeded. Please sign in to continue.');
          return;
        }

        // Handle Ably configuration issues
        if (response.status === 503) {
          throw new Error('Mobile recording is temporarily unavailable.');
        }

        throw new Error(errorData.error || 'Failed to generate token');
      }

      const { token, mobileUrl, expiresAt } = await response.json();

      const tokenData = { token, mobileUrl, expiresAt };
      setQrData(tokenData);

      // Set token data in consultation context
      setMobileV2TokenData(tokenData);
      enableMobileV2(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      setQrData(null);
    } finally {
      setIsGenerating(false);
    }
  }, [isSignedIn, userId, ensureActiveSession, setMobileV2TokenData, enableMobileV2, isClient, userTier]);

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
  const isConnected = mobileV2.connectionStatus === 'connected';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-lg border border-gray-200 bg-white shadow-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Smartphone className="size-5 text-gray-700" />
            Mobile Recording
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connection Status */}
          {isConnected && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="size-4 text-green-600" />
              <div>
                <div className="font-medium text-green-800">
                  Mobile device connected
                </div>
                <div className="text-sm text-green-700">
                  Ready to receive transcriptions
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
          {isClient && qrData && !isExpired && (
            <div className="flex flex-col items-center space-y-3">
              <div className="rounded-lg border-2 border-gray-200 bg-white p-3">
                <QRCodeSVG
                  value={qrData.mobileUrl}
                  size={160}
                  level="M"
                  includeMargin
                  className="block"
                />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-600">
                  Scan with your mobile device to connect
                </p>
                <div className="text-xs text-gray-500">
                  <div>24-hour access token</div>
                  <div className="font-medium text-gray-600">
                    {formatTimeRemaining(timeRemaining)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!qrData
              ? (
                  <Button
                    onClick={generateToken}
                    disabled={isGenerating}
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
                      Disconnect
                    </Button>
                  </>
                )}
          </div>

          {/* Simple Instructions */}
          <div className="rounded-lg bg-blue-50 p-3">
            <h4 className="mb-2 text-sm font-medium text-blue-800">How it works:</h4>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>1. Generate QR code above</li>
              <li>2. Scan with your mobile device</li>
              <li>3. Start recording on mobile</li>
              <li>4. View transcriptions here in real-time</li>
            </ul>
          </div>

          {/* Close button */}
          <div className="flex justify-end pt-2">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

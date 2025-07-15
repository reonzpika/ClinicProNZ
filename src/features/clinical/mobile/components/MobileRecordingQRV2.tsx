'use client';

import { useAuth } from '@clerk/nextjs';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';

import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { useConsultation } from '@/src/shared/ConsultationContext';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeadersWithGuest } from '@/src/shared/utils';

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
  const {
    mobileV2 = { isEnabled: false, token: null, tokenData: null, connectedDevices: [], connectionStatus: 'disconnected' },
    setMobileV2TokenData,
    enableMobileV2,
    ensureActiveSession,
    getEffectiveGuestToken,
    setGuestToken,
  } = useConsultation();

  // Get connected devices and status from context
  const connectedDevices = mobileV2.connectedDevices;
  const connectionStatus = mobileV2.connectionStatus;
  const [qrData, setQrData] = useState<QRTokenData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<{
    sessionsUsed: number;
    sessionsRemaining: number;
    canCreateSession: boolean;
    resetTime: string;
  } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fetch session status for guest tokens
  const fetchSessionStatus = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/guest-sessions/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestToken: token }),
      });

      if (response.ok) {
        const status = await response.json();
        setSessionStatus(status);
      }
    } catch (error) {
      console.error('Error fetching session status:', error);
    }
  }, []);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
    // Fetch session status for guest users using consultation context token
    if (!isSignedIn) {
      const effectiveGuestToken = getEffectiveGuestToken();
      if (effectiveGuestToken) {
        fetchSessionStatus(effectiveGuestToken);
      }
    }
  }, [isSignedIn, fetchSessionStatus, getEffectiveGuestToken]);

  // Restore QR data from context when component mounts or tokenData changes (client-side only)
  useEffect(() => {
    if (isClient && mobileV2.tokenData && !qrData) {
      setQrData(mobileV2.tokenData);
    }
  }, [isClient, mobileV2.tokenData, qrData]);

  // Update remaining time and show warnings (client-side only)
  useEffect(() => {
    if (!isClient || !qrData) {
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(qrData.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

      setTimeRemaining(remaining);

      // Show warning if less than 2 hours remaining (24hr token)
      setShowExpiryWarning(remaining > 0 && remaining < 7200);

      // Auto-refresh if expired
      if (remaining <= 0 && qrData) {
        setQrData(null);
        setError('QR code has expired. Please generate a new one.');

        // Clear token data from consultation context
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
      // Ensure we have an active patient session before generating mobile token (for authenticated users)
      if (isSignedIn && userId) {
        await ensureActiveSession();
      }

      const response = await fetch('/api/mobile/generate-token', {
        method: 'POST',
        headers: createAuthHeadersWithGuest(userId, getUserTier(), !isSignedIn ? getEffectiveGuestToken() : null),
        body: JSON.stringify({
          guestToken: !isSignedIn ? getEffectiveGuestToken() : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Check if this is a session limit exceeded error
        if (response.status === 429 && errorData.error === 'Session limit exceeded') {
          setShowUpgradeModal(true);
          setError(errorData.message || 'Session limit exceeded. Please sign in to continue.');
          return;
        }

        // Check if this is an Ably configuration issue
        if (response.status === 503 || errorData.error?.includes('Ably service not configured')) {
          throw new Error('Real-time features are not configured on this deployment. Mobile recording is temporarily unavailable.');
        }

        throw new Error(errorData.error || 'Failed to generate token');
      }

      const { token, mobileUrl, expiresAt, isGuest, guestToken: newGuestToken } = await response.json();

      const tokenData = { token, mobileUrl, expiresAt };
      setQrData(tokenData);

      // Store guest token in consultation context for anonymous users
      if (isGuest && newGuestToken && isClient) {
        setGuestToken(newGuestToken);
        // Fetch session status for the new token
        fetchSessionStatus(newGuestToken);
      }

      // Set token data in consultation context for persistence and WebSocket sync
      setMobileV2TokenData(tokenData);
      enableMobileV2(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      setQrData(null);
    } finally {
      setIsGenerating(false);
    }
  }, [isSignedIn, userId, ensureActiveSession, setMobileV2TokenData, enableMobileV2, getEffectiveGuestToken, setGuestToken, isClient, fetchSessionStatus]);

  const stopMobileRecording = useCallback(() => {
    setQrData(null);
    setError(null);

    // Clear guest token from localStorage for anonymous users
    if (!isSignedIn && isClient) {
      // localStorage.removeItem('clinicpro_guest_token'); // This is now handled by getEffectiveGuestToken
      // setGuestToken(null); // This is now handled by getEffectiveGuestToken
    }

    // Clear token data from consultation context
    setMobileV2TokenData(null);
    enableMobileV2(false);
  }, [setMobileV2TokenData, enableMobileV2, isSignedIn, isClient]);

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
  const isExpiringSoon = timeRemaining > 0 && timeRemaining < 7200; // 2 hours

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-lg border border-gray-200 bg-white shadow-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Smartphone className="size-5 text-gray-700" />
            Mobile Recording V2
            {false && ( // Debug info disabled
              <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                Beta
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connected Devices Status */}
          {connectedDevices.length > 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="size-4 text-green-600" />
              <div>
                <div className="font-medium text-green-800">
                  {connectedDevices.filter(d => d.deviceType === 'Mobile').length}
                  {' '}
                  mobile device(s) connected
                </div>
                <div className="text-sm text-green-700">
                  {connectedDevices
                    .filter(d => d.deviceType === 'Mobile')
                    .map(device => device.deviceName)
                    .join(', ')}
                </div>
              </div>
            </Alert>
          )}

          {/* Connection Status */}
          {connectionStatus === 'connecting' && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Clock className="size-4 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-800">Waiting for mobile connection</div>
                <div className="text-sm text-yellow-700">Scan QR code to connect</div>
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

          {/* QR Code Display - only render on client to prevent SSR issues */}
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
                <div className="space-y-1 text-xs text-gray-500">
                  <div>
                    24-hour access token
                  </div>
                  <div className={`font-medium ${isExpiringSoon ? 'text-orange-600' : 'text-gray-600'}`}>
                    {formatTimeRemaining(timeRemaining)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex space-x-2">
            {!qrData
              ? (
                  <Button
                    onClick={generateToken}
                    disabled={isGenerating || (!isSignedIn && sessionStatus?.canCreateSession === false)}
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
                      Disconnect Devices
                    </Button>
                  </>
                )}
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-blue-50 p-3">
            <h4 className="mb-2 text-sm font-medium text-blue-800">New Features:</h4>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>✨ Real-time transcription sync</li>
              <li>✨ 24-hour persistent connection</li>
              <li>✨ Multiple device support</li>
              <li>✨ Better connection stability</li>
              <li>✨ Patient session awareness</li>
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

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Session Limit Reached</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              You've used your 5 free mobile recording sessions. Sign in or upgrade to continue using this feature.
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  if (isClient) {
                    window.location.href = '/login';
                  }
                }}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setShowUpgradeModal(false)}
                variant="outline"
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

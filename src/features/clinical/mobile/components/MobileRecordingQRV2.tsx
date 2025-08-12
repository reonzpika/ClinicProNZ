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
  // Permanent tokens: no expiry
  const [isClient, setIsClient] = useState(false);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Always trust server: on modal open, fetch active token and override any cache
  useEffect(() => {
    if (!isClient || !isOpen) return;

    const fetchActiveToken = async () => {
      if (!isSignedIn || !userId) return;
      try {
        const response = await fetch('/api/mobile/active-token', {
          method: 'GET',
          headers: createAuthHeaders(userId, userTier),
        });

        if (response.ok) {
          const tokenData = await response.json();
          setQrData(tokenData);
          setMobileV2TokenData(tokenData);
          enableMobileV2(true);
        } else if (response.status === 404) {
          // No active token - clear local cache/state
          setQrData(null);
          setMobileV2TokenData(null);
          enableMobileV2(false);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch token' }));
          setError(errorData.error || 'Failed to check for existing token');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check for existing token';
        setError(errorMessage);
      }
    };

    fetchActiveToken();
  }, [isClient, isOpen, isSignedIn, userId, userTier, setMobileV2TokenData, enableMobileV2]);

  // No expiry timer for permanent tokens

  const generateToken = useCallback(async (forceRotate: boolean = false) => {
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
        body: JSON.stringify(forceRotate ? { forceRotate: true } : {}),
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

          const { token, mobileUrl } = await response.json();

          const tokenData = { token, mobileUrl } as any;
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

  // Disconnect button removed per UX update; token remains active until expiry

  // No countdown UI for permanent tokens

  const isExpired = false;
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
                {/* No countdown for permanent token */}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!qrData && (
              <Button
                onClick={() => generateToken(false)}
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

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2">
            {/* Reset token: force rotate, deactivating old token */}
            <Button
              variant="outline"
              onClick={() => generateToken(true)}
              disabled={isGenerating}
              title="Rotate token and show new QR immediately"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                  Rotating...
                </>
              ) : 'Reset token'}
            </Button>

            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

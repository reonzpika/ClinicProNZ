/**
 * QR Panel Component
 *
 * Displays QR code for mobile handoff with:
 * - QR code image
 * - Mobile URL
 * - TTL countdown
 * - Regenerate button
 */

'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect } from 'react';

import { Button } from '@/src/shared/components/ui/button';

import { useQRSession } from '../../hooks/useQRSession';

export function QRPanel() {
  const {
    mobileUrl,
    isExpired,
    isGenerating,
    generateSession,
    regenerateSession,
  } = useQRSession();

  // Auto-generate QR on mount if not already generated
  useEffect(() => {
    if (!mobileUrl && !isGenerating) {
      generateSession();
    }
  }, [mobileUrl, isGenerating, generateSession]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      {/* Loading State */}
      {isGenerating && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="mr-3 size-8 animate-spin text-purple-500" />
          <p className="text-sm text-slate-600">Generating QR code...</p>
        </div>
      )}

      {/* QR Code Display - Horizontal Layout */}
      {!isGenerating && mobileUrl && (
        <div className="flex gap-4">
          {/* Left: QR Code */}
          <div className="relative shrink-0">
            <div
              className={`rounded-lg border-2 p-2 ${
                isExpired ? 'border-red-300 opacity-50' : 'border-slate-200'
              }`}
            >
              <QRCodeSVG
                value={mobileUrl}
                size={120}
                level="H"
                includeMargin={false}
              />
            </div>
            {isExpired && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                  Expired
                </div>
              </div>
            )}
          </div>

          {/* Right: Instructions & Button */}
          <div className="flex flex-1 flex-col justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">Mobile Upload</p>
              <p className="text-xs text-slate-600">
                Scan QR with mobile device to capture and upload images. Images appear here automatically.
              </p>
              {/* Mobile URL */}
              {mobileUrl && !isExpired && (
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="mb-1 text-xs font-medium text-slate-700">Mobile URL:</p>
                  <p className="break-all text-xs text-slate-600">{mobileUrl}</p>
                </div>
              )}
            </div>
            <Button
              onClick={regenerateSession}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="mt-3 w-fit"
            >
              <RefreshCw className="mr-2 size-4" />
              Regenerate QR
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

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

import { QrCode, RefreshCw, Clock, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQRSession } from '../../hooks/useQRSession';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

export function QRPanel() {
  const {
    qrSvg,
    mobileUrl,
    isExpired,
    isGenerating,
    generateSession,
    regenerateSession,
    getRemainingTime,
  } = useQRSession();
  
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  
  // Update remaining time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds(getRemainingTime());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [getRemainingTime]);
  
  // Format remaining time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Generate on mount if not already generated
  useEffect(() => {
    if (!qrSvg && !isGenerating) {
      generateSession();
    }
  }, [qrSvg, isGenerating, generateSession]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCode className="size-5 text-purple-600" />
          Mobile Upload
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="mb-3 size-12 animate-spin text-purple-500" />
            <p className="text-sm text-slate-600">Generating QR code...</p>
          </div>
        )}
        
        {/* QR Code Display */}
        {!isGenerating && qrSvg && (
          <>
            <div className="relative">
              {/* QR Code */}
              <div className="flex justify-center">
                <img
                  src={qrSvg}
                  alt="QR Code for mobile upload"
                  className={`rounded-lg border-2 ${
                    isExpired ? 'border-red-300 opacity-50' : 'border-slate-200'
                  }`}
                  style={{ width: 200, height: 200 }}
                />
              </div>
              
              {/* Expired Overlay */}
              {isExpired && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
                    Expired
                  </div>
                </div>
              )}
            </div>
            
            {/* Timer */}
            {!isExpired && remainingSeconds > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <Clock className="size-4" />
                <span>Expires in {formatTime(remainingSeconds)}</span>
              </div>
            )}
            
            {/* Mobile URL (for manual entry) */}
            {mobileUrl && !isExpired && (
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="mb-1 text-xs font-medium text-slate-700">Mobile URL:</p>
                <p className="break-all text-xs text-slate-600">{mobileUrl}</p>
              </div>
            )}
            
            {/* Regenerate Button */}
            <Button
              onClick={regenerateSession}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="mr-2 size-4" />
              {isExpired ? 'Generate New QR' : 'Regenerate QR'}
            </Button>
            
            {/* Instructions */}
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs text-blue-800">
                <strong>Instructions:</strong>
                <br />
                1. Scan QR with mobile device
                <br />
                2. Capture images with phone camera
                <br />
                3. Images appear here automatically
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

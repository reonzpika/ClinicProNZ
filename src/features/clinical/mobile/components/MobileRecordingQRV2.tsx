'use client';

import { AlertTriangle, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';

import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';

type MobileRecordingQRV2Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const MobileRecordingQRV2: React.FC<MobileRecordingQRV2Props> = ({
  isOpen,
  onClose,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !isOpen) {
      return;
    }
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      setQrUrl(`${baseUrl}/mobile`);
    } catch {
      setError('Failed to prepare QR');
    }
  }, [isClient, isOpen]);

  const openMobile = useCallback(() => {
    try {
      if (qrUrl) {
        window.open(qrUrl, '_blank');
      }
    } catch {}
  }, [qrUrl]);

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
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <div className="text-sm">{error}</div>
            </Alert>
          )}

          {isClient && qrUrl && (
            <div className="flex flex-col items-center space-y-3">
              <div className="rounded-lg border-2 border-gray-200 bg-white p-3">
                <QRCodeSVG
                  value={qrUrl}
                  size={160}
                  level="M"
                  includeMargin
                  className="block"
                />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-600">Scan with your mobile device to open</p>
                <Button variant="outline" onClick={openMobile}>Open on phone</Button>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-blue-50 p-3">
            <h4 className="mb-2 text-sm font-medium text-blue-800">How it works:</h4>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>1. Scan the QR to open /mobile</li>
              <li>2. Sign in on your phone</li>
              <li>3. Start recording; desktop updates automatically</li>
            </ul>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

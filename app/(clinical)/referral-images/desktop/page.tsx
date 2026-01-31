'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Copy, Mail, MessageSquare, QrCode, Download, CheckCircle, AlertCircle } from 'lucide-react';
import Ably from 'ably';

interface ImageData {
  imageId: string;
  presignedUrl: string;
  filename: string;
  fileSize: number;
  createdAt: string;
  metadata: {
    side?: 'R' | 'L';
    description?: string;
  };
}

interface StatusData {
  tier: string;
  imageCount: number;
  limit: number;
  limitReached: boolean;
  graceUnlocksRemaining: number;
  images: ImageData[];
}

function ReferralImagesDesktopPageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get('u');

  const [status, setStatus] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/referral-images/status/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch status');
      
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError('Failed to load images');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Ably real-time sync
  useEffect(() => {
    if (!userId || !process.env.NEXT_PUBLIC_ABLY_API_KEY) return;

    const ably = new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY });
    const channel = ably.channels.get(`user:${userId}`);

    channel.subscribe('image-uploaded', () => {
      console.log('[Ably] Image uploaded event received');
      fetchStatus();
    });

    return () => {
      channel.unsubscribe();
      ably.close();
    };
  }, [userId, fetchStatus]);

  const mobileLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/referral-images/capture?u=${userId}`
    : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mobileLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=GP Referral Images Mobile Link&body=Use this link to capture referral photos on your phone:%0A%0A${encodeURIComponent(mobileLink)}`;
  };

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`GP Referral Images mobile link: ${mobileLink}`)}`, '_blank');
  };

  const downloadAll = async () => {
    if (!status?.images.length) return;

    for (const image of status.images) {
      const link = document.createElement('a');
      link.href = image.presignedUrl;
      link.download = image.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Delay to avoid browser blocking
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Missing User ID</h1>
          <p className="text-text-secondary">Please use the link from your welcome email.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Error</h1>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => fetchStatus()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-text-primary">
            GP Referral Images
          </h1>
          {status?.tier === 'premium' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              Premium
            </span>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile Link Sharing */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Send Mobile Link to Your Phone
          </h2>
          
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={mobileLink}
              readOnly
              className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg font-mono text-sm text-text-primary"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              {copySuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={shareViaEmail}
              className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={shareViaWhatsApp}
              className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
          </div>

          {showQR && (
            <div className="mt-4 p-4 bg-surface rounded-lg">
              <p className="text-sm text-text-secondary mb-2">Scan with your phone camera:</p>
              <div className="bg-white p-4 inline-block rounded-lg">
                {/* QR code would be generated here - placeholder for now */}
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-text-tertiary text-sm">QR Code</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Images Gallery */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-text-primary">
              Your Images (updates in real-time)
            </h2>
            {status && status.images.length > 0 && (
              <button
                onClick={downloadAll}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            )}
          </div>

          {status && status.images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">No images yet</p>
              <p className="text-sm text-text-tertiary">
                Use your mobile link to capture photos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {status?.images.map((image) => (
                <div
                  key={image.imageId}
                  className="group relative aspect-square border border-border rounded-lg overflow-hidden hover:border-primary hover:shadow-md transition-all cursor-pointer"
                >
                  <img
                    src={image.presignedUrl}
                    alt={image.metadata.description || 'Clinical photo'}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Metadata Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                    {image.metadata.side && (
                      <span className="inline-block px-2 py-1 bg-primary rounded text-xs font-semibold mb-1">
                        {image.metadata.side === 'R' ? 'Right' : 'Left'}
                      </span>
                    )}
                    {image.metadata.description && (
                      <p className="text-sm truncate">{image.metadata.description}</p>
                    )}
                    <p className="text-xs opacity-80 mt-1">
                      {(image.fileSize / 1024).toFixed(0)} KB
                    </p>
                  </div>

                  {/* Download on click */}
                  <a
                    href={image.presignedUrl}
                    download={image.filename}
                    className="absolute inset-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>
          )}

          {status && status.images.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={downloadAll}
                className="w-full max-w-md px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download All {status.images.length} Image{status.images.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-text-tertiary">
          <p>Images automatically delete after 24 hours</p>
          {status?.tier === 'free' && (
            <p className="mt-2">
              Free tier: Unlimited Month 1, then 10/month
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ReferralImagesDesktopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-text-secondary">Loading...</p>
        </div>
      }
    >
      <ReferralImagesDesktopPageContent />
    </Suspense>
  );
}

'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import * as Tabs from '@radix-ui/react-tabs';
import { Copy, Mail, MessageSquare, QrCode, Download, CheckCircle, AlertCircle, Share2, Trash2, Smartphone, RotateCcw, RotateCw, Loader2 } from 'lucide-react';
import Ably from 'ably';

import { ShareModal } from '../components/ShareModal';
import { BookmarkInstructionsModal } from '../components/BookmarkInstructionsModal';
import { useShare } from '../components/useShare';
import {
  incrementDownloadCount,
  isSharePromptThreshold,
} from '../components/share-prompt-threshold';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/src/shared/components/ui/dialog';
import { useToast } from '@/src/shared/components/ui/toast';

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
  referralCode?: string | null;
  totalLifetimeImages?: number;
  images: ImageData[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0 || !Number.isFinite(bytes)) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
}

/** Display title for an image: includes side in title when present (matches download filename). */
function imageDisplayTitle(image: ImageData): string {
  const sideLabel = image.metadata?.side === 'R' ? 'Right' : image.metadata?.side === 'L' ? 'Left' : null;
  if (image.metadata?.description) {
    return sideLabel ? `${image.metadata.description} (${sideLabel})` : image.metadata.description;
  }
  if (sideLabel) return sideLabel;
  return image.filename || 'Clinical photo';
}

function ReferralImagesDesktopPageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get('u');

  const [status, setStatus] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDownloadSuccessModal, setShowDownloadSuccessModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [deleteConfirmImageId, setDeleteConfirmImageId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rotatingImageId, setRotatingImageId] = useState<string | null>(null);
  const [bookmarkBannerDismissed, setBookmarkBannerDismissed] = useState(true); // start true, set false in useEffect if not dismissed
  const [showBookmarkInstructions, setShowBookmarkInstructions] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<ImageData | null>(null);
  const [downloadingImageIds, setDownloadingImageIds] = useState<Set<string>>(new Set());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Share URL: Always use landing page for sharing to others (with optional referral tracking)
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/referral-images${status?.referralCode ? `?ref=${status.referralCode}` : ''}`
      : '';
  const { handleShare, shareModalOpen, setShareModalOpen, shareLocation } = useShare(
    userId ?? null,
    shareUrl
  );
  const toast = useToast();

  const onShareClick = async (location: string) => {
    const usedNative = await handleShare(location);
    if (usedNative) toast.show({ title: 'Thanks for sharing!', durationMs: 3000 });
  };

  const fetchStatus = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/referral-images/status/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch status');

      const data = await response.json();
      setStatus(data);
      setError(null);
      if (
        data.totalLifetimeImages >= 10 &&
        typeof window !== 'undefined' &&
        !window.localStorage.getItem(`milestone_10_${userId}`)
      ) {
        setShowMilestoneModal(true);
      }
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

  // Bookmark banner: hide if user previously dismissed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDismissed = localStorage.getItem('bookmark_banner_dismissed');
    setBookmarkBannerDismissed(!!isDismissed);
  }, []);

  // Ably real-time sync with comprehensive logging
  useEffect(() => {
    console.log('[Ably Setup] useEffect triggered', {
      userId,
      hasApiKey: !!process.env.NEXT_PUBLIC_ABLY_API_KEY,
      apiKeyPrefix: process.env.NEXT_PUBLIC_ABLY_API_KEY?.substring(0, 10),
      timestamp: new Date().toISOString(),
    });

    if (!userId) {
      console.log('[Ably Setup] No userId, skipping setup');
      return;
    }

    if (!process.env.NEXT_PUBLIC_ABLY_API_KEY) {
      console.log('[Ably Setup] No NEXT_PUBLIC_ABLY_API_KEY, skipping setup');
      return;
    }

    console.log('[Ably Setup] Creating Ably Realtime instance...');
    const ably = new Ably.Realtime({ 
      key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
    });
    
    console.log('[Ably Setup] Getting channel for user:', userId);
    const channel = ably.channels.get(`user:${userId}`);

    // Log initial connection state
    console.log('[Ably Setup] Initial connection state:', ably.connection.state);
    console.log('[Ably Setup] Initial channel state:', channel.state);

    // Monitor all connection state changes
    ably.connection.on('connecting', () => {
      console.log('[Ably Connection] State: CONNECTING');
    });

    ably.connection.on('connected', () => {
      console.log('[Ably Connection] State: CONNECTED', {
        connectionId: ably.connection.id,
        timestamp: new Date().toISOString(),
      });
      console.log('[Ably Connection] Fetching status after connection...');
      fetchStatus();
    });

    ably.connection.on('disconnected', () => {
      console.log('[Ably Connection] State: DISCONNECTED', {
        timestamp: new Date().toISOString(),
      });
    });

    ably.connection.on('suspended', () => {
      console.log('[Ably Connection] State: SUSPENDED', {
        timestamp: new Date().toISOString(),
      });
    });

    ably.connection.on('closing', () => {
      console.log('[Ably Connection] State: CLOSING', {
        timestamp: new Date().toISOString(),
      });
    });

    ably.connection.on('closed', () => {
      console.log('[Ably Connection] State: CLOSED', {
        timestamp: new Date().toISOString(),
      });
    });

    ably.connection.on('failed', (error) => {
      console.error('[Ably Connection] State: FAILED', {
        error: error,
        message: error?.message,
        code: error?.code,
        timestamp: new Date().toISOString(),
      });
    });

    // Monitor channel state changes
    channel.on('attaching', () => {
      console.log('[Ably Channel] State: ATTACHING', {
        channelName: channel.name,
        timestamp: new Date().toISOString(),
      });
    });

    channel.on('attached', () => {
      console.log('[Ably Channel] State: ATTACHED', {
        channelName: channel.name,
        timestamp: new Date().toISOString(),
      });
    });

    channel.on('detaching', () => {
      console.log('[Ably Channel] State: DETACHING', {
        channelName: channel.name,
        timestamp: new Date().toISOString(),
      });
    });

    channel.on('detached', () => {
      console.log('[Ably Channel] State: DETACHED', {
        channelName: channel.name,
        timestamp: new Date().toISOString(),
      });
    });

    channel.on('failed', (error) => {
      console.error('[Ably Channel] State: FAILED', {
        channelName: channel.name,
        error: error,
        message: error?.message,
        timestamp: new Date().toISOString(),
      });
    });

    // Subscribe to image-uploaded events
    console.log('[Ably Subscribe] Subscribing to image-uploaded events...');
    console.log('[Ably Subscribe] Channel state before subscribe:', channel.state);
    
    channel.subscribe('image-uploaded', (message) => {
      console.log('[Ably Message] Image uploaded event received!', {
        messageId: message.id,
        timestamp: message.timestamp,
        data: message.data,
        receivedAt: new Date().toISOString(),
      });
      console.log('[Ably Message] Calling fetchStatus...');
      fetchStatus();
    });

    console.log('[Ably Subscribe] Subscription call completed');
    console.log('[Ably Subscribe] Channel state after subscribe:', channel.state);

    // Cleanup function
    return () => {
      console.log('[Ably Cleanup] Starting cleanup...', {
        connectionState: ably.connection.state,
        channelState: channel.state,
        timestamp: new Date().toISOString(),
      });
      
      console.log('[Ably Cleanup] Unsubscribing from channel...');
      channel.unsubscribe();
      
      console.log('[Ably Cleanup] Closing Ably connection...');
      ably.close();
      
      console.log('[Ably Cleanup] Cleanup completed');
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

  const shareViaEmail = async () => {
    if (!userId) return;
    
    setIsSendingEmail(true);
    setEmailSent(false);
    
    try {
      const response = await fetch('/api/referral-images/send-mobile-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setEmailSent(true);
      toast.show({ 
        title: 'Email sent! Check your inbox', 
        durationMs: 3000 
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setEmailSent(false), 5000);
    } catch (err) {
      console.error('Failed to send email:', err);
      toast.show({ 
        title: 'Failed to send email. Please try again.', 
        variant: 'destructive',
        durationMs: 3000 
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`GP Referral Images mobile link: ${mobileLink}`)}`, '_blank');
  };

  /** Fetch image as blob and trigger file download (avoids browser opening image in new tab for cross-origin presigned URLs). */
  const triggerFileDownload = async (url: string, filename: string): Promise<boolean> => {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) return false;
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      return true;
    } catch {
      return false;
    }
  };

  const downloadUrl = (image: ImageData) =>
    userId ? `/api/referral-images/download/${image.imageId}?u=${userId}` : '';

  const downloadAll = async () => {
    if (!status?.images.length || !userId) return;

    setIsDownloadingAll(true);
    try {
      let successCount = 0;
      for (const image of status.images) {
        const url = downloadUrl(image);
        if (!url) continue;
        const ok = await triggerFileDownload(url, image.filename);
        if (ok) successCount++;
        else toast.show({ title: `Failed to download ${image.filename}`, variant: 'destructive' });
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      const newTotal = incrementDownloadCount(userId, successCount);
      setShowDownloadSuccessModal(isSharePromptThreshold(newTotal));
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const downloadSingleImage = async (image: ImageData) => {
    const url = downloadUrl(image);
    if (!url) return;

    setDownloadingImageIds(prev => new Set(prev).add(image.imageId));
    try {
      const ok = await triggerFileDownload(url, image.filename);
      if (ok) {
        const newTotal = incrementDownloadCount(userId, 1);
        setShowDownloadSuccessModal(isSharePromptThreshold(newTotal));
      } else {
        toast.show({ title: 'Failed to download image', variant: 'destructive' });
      }
    } finally {
      setDownloadingImageIds(prev => {
        const next = new Set(prev);
        next.delete(image.imageId);
        return next;
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!userId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/referral-images/delete/${imageId}?u=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteConfirmImageId(null);
      await fetchStatus();
    } catch (err) {
      console.error(err);
      toast.show({ title: 'Failed to delete image', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRotateImage = async (imageId: string, degrees: number) => {
    if (!userId) return;
    setRotatingImageId(imageId);
    try {
      const res = await fetch(`/api/referral-images/rotate/${imageId}?u=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ degrees }),
      });
      if (!res.ok) throw new Error('Rotate failed');
      await fetchStatus();
    } catch (err) {
      console.error(err);
      toast.show({ title: 'Failed to rotate image', variant: 'destructive' });
    } finally {
      setRotatingImageId(null);
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
      {/* Bookmark banner - top banner, closable, blue highlight. Once dismissed it does not reappear (stored in localStorage until user clears site data). */}
      {!bookmarkBannerDismissed && (
        <div className="bg-blue-100 border-b border-blue-200 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-blue-900 flex-1">
            <span className="mr-1" aria-hidden>🔖</span>
            <strong>Bookmark this page</strong> on your computer for quick access.{' '}
            <button
              type="button"
              onClick={() => setShowBookmarkInstructions(true)}
              className="text-blue-800 hover:text-blue-900 underline font-medium"
            >
              How to bookmark
            </button>
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('bookmark_banner_dismissed', 'true');
              }
              setBookmarkBannerDismissed(true);
            }}
            className="shrink-0 p-1 rounded hover:bg-blue-200/50 text-blue-900"
            aria-label="Dismiss bookmark banner"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xl font-bold text-text-primary hover:text-primary transition-colors"
            >
              ClinicPro
            </Link>
            <span className="text-text-tertiary">/</span>
            <h1 className="text-xl font-bold text-text-primary">
              Referral Images
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={mobileLink || '#'}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors text-text-primary"
              title="Open mobile capture page"
            >
              <Smartphone className="w-4 h-4" />
              Switch to Mobile Page
            </Link>
            <button
              type="button"
              onClick={() => onShareClick('desktop_header')}
              disabled={!userId || !shareUrl}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={shareUrl ? 'Share with colleagues' : 'Share'}
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            {status?.tier === 'premium' && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Premium
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Bookmark instructions modal */}
      <BookmarkInstructionsModal
        open={showBookmarkInstructions}
        onClose={() => setShowBookmarkInstructions(false)}
      />

      {/* Share modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        shareUrl={shareUrl}
        location={shareLocation}
        userId={userId}
        onShareComplete={() => setShareModalOpen(false)}
      />

      {/* Download success modal */}
      <Dialog open={showDownloadSuccessModal} onOpenChange={setShowDownloadSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Download Complete!</span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-text-secondary">Ready to attach to your referral.</p>
          <div className="border-t border-border my-4" />
          <p className="text-text-primary">Just saved &gt;10 minutes?</p>
          <p className="text-sm text-text-secondary mb-4">
            Know GPs in your practice who still email photos to themselves?
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setShowDownloadSuccessModal(false);
                onShareClick('desktop_after_download');
              }}
              className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share ClinicPro
            </button>
            <p className="text-xs text-text-tertiary text-center">(Takes 5 seconds)</p>
            <button
              type="button"
              onClick={() => setShowDownloadSuccessModal(false)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirmImageId} onOpenChange={(open) => !open && setDeleteConfirmImageId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete image?</DialogTitle>
          </DialogHeader>
          <p className="text-text-secondary">This cannot be undone.</p>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => deleteConfirmImageId && handleDeleteImage(deleteConfirmImageId)}
              disabled={isDeleting}
              className="px-4 py-2 bg-destructive text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirmImageId(null)}
              disabled={isDeleting}
              className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 10th image milestone modal */}
      <Dialog
        open={showMilestoneModal}
        onOpenChange={(open) => {
          setShowMilestoneModal(open);
          if (!open && userId && typeof window !== 'undefined') {
            window.localStorage.setItem(`milestone_10_${userId}`, 'true');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>10 Referral Images Captured!</DialogTitle>
          </DialogHeader>
          <p className="text-text-secondary">
            You&apos;ve saved approximately{' '}
            <strong>
              {(status?.totalLifetimeImages ?? 10) * 5} minutes
            </strong>{' '}
            of workflow time with ClinicPro.
          </p>
          <div className="border-t border-border my-4" />
          <p className="text-text-primary">Help your colleagues save time too</p>
          <p className="text-sm text-text-secondary mb-4">
            Share ClinicPro with GPs who still do the email-resize-upload routine.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setShowMilestoneModal(false);
                if (userId && typeof window !== 'undefined') {
                  window.localStorage.setItem(`milestone_10_${userId}`, 'true');
                }
                onShareClick('desktop_milestone_10');
              }}
              className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share with Colleagues
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMilestoneModal(false);
                if (userId && typeof window !== 'undefined') {
                  window.localStorage.setItem(`milestone_10_${userId}`, 'true');
                }
              }}
              className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enlarged image modal */}
      <Dialog open={enlargedImage !== null} onOpenChange={(open) => !open && setEnlargedImage(null)}>
        <DialogContent className="sm:max-w-4xl max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="sr-only">Enlarged image</DialogTitle>
          </DialogHeader>
          {enlargedImage && (
            <>
              <div className="flex justify-center bg-black/5 rounded-lg overflow-hidden">
                <img
                  src={enlargedImage.presignedUrl}
                  alt={imageDisplayTitle(enlargedImage)}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              </div>
              <p className="text-sm text-text-secondary text-center mt-2">
                {imageDisplayTitle(enlargedImage)}
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <button
                  type="button"
                  onClick={() => {
                    downloadSingleImage(enlargedImage);
                  }}
                  disabled={downloadingImageIds.has(enlargedImage.imageId)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingImageIds.has(enlargedImage.imageId) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEnlargedImage(null)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors"
                >
                  Close
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile Link Sharing - collapsed by default */}
        <details className="bg-white rounded-lg shadow-sm border border-border mb-6 group">
          <summary className="list-none cursor-pointer">
            <div className="p-6 pb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                Send Mobile Link to Your Phone
              </h2>
              <span className="text-text-tertiary group-open:rotate-180 transition-transform" aria-hidden>▼</span>
            </div>
          </summary>
          <div className="px-6 pb-6 pt-0">
          <p className="text-sm text-text-secondary mb-4">
            💡 <strong>Save the mobile link to your phone&apos;s home screen</strong> for instant access during consults.
          </p>
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
              disabled={isSendingEmail}
              className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : emailSent ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Sent!
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Email Me
                </>
              )}
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

          {showQR && mobileLink && (
            <div className="mt-4 p-4 bg-surface rounded-lg">
              <p className="text-sm text-text-secondary mb-2">Scan with your phone camera:</p>
              <div className="bg-white p-4 inline-block rounded-lg">
                <QRCodeSVG value={mobileLink} size={200} level="M" />
              </div>
            </div>
          )}

          <details className="mt-4 rounded-lg border border-border overflow-hidden">
            <summary className="px-4 py-3 bg-surface cursor-pointer text-sm font-medium text-text-primary hover:bg-black/5">
              How to save to home screen
            </summary>
            <div className="p-4 border-t border-border">
              <Tabs.Root defaultValue="iphone" className="text-sm">
                <Tabs.List className="flex gap-1 rounded-lg border border-border p-1 mb-4">
                  <Tabs.Trigger
                    value="iphone"
                    className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-surface data-[state=active]:shadow-sm"
                  >
                    iPhone
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="android"
                    className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-surface data-[state=active]:shadow-sm"
                  >
                    Android
                  </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="iphone" className="text-text-secondary space-y-2">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open the mobile link in Safari</li>
                    <li>Tap the Share button (□↑)</li>
                    <li>Scroll and tap &quot;Add to Home Screen&quot;</li>
                    <li>Tap &quot;Add&quot;</li>
                  </ol>
                </Tabs.Content>
                <Tabs.Content value="android" className="text-text-secondary space-y-2">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open the mobile link in Chrome</li>
                    <li>Tap the menu (⋮) in top-right</li>
                    <li>Tap &quot;Add to Home screen&quot;</li>
                    <li>Tap &quot;Add&quot;</li>
                  </ol>
                </Tabs.Content>
              </Tabs.Root>
            </div>
          </details>
          </div>
        </details>

        {/* Images Gallery */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-text-primary">
              Your Images (updates in real-time)
            </h2>
            {status && status.images.length > 0 && (
              <button
                onClick={downloadAll}
                disabled={isDownloadingAll}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloadingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download All
                  </>
                )}
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
                  role="button"
                  tabIndex={0}
                  className="group relative aspect-square border border-border rounded-lg overflow-hidden hover:border-primary hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setEnlargedImage(image)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setEnlargedImage(image);
                    }
                  }}
                >
                  <img
                    src={image.presignedUrl}
                    alt={imageDisplayTitle(image)}
                    className="w-full h-full object-cover"
                  />
                  {/* Action buttons - stopPropagation so card click (open modal) does not fire; visible on hover/focus */}
                  <div className="absolute top-2 right-2 flex gap-1 pointer-events-auto opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRotateImage(image.imageId, -90);
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      disabled={rotatingImageId === image.imageId}
                      className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-50"
                      title="Rotate left"
                      aria-label="Rotate left"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRotateImage(image.imageId, 90);
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      disabled={rotatingImageId === image.imageId}
                      className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-50"
                      title="Rotate right"
                      aria-label="Rotate right"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        downloadSingleImage(image);
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      disabled={downloadingImageIds.has(image.imageId)}
                      className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-50"
                      title="Download"
                      aria-label="Download"
                    >
                      {downloadingImageIds.has(image.imageId) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeleteConfirmImageId(image.imageId);
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                      title="Delete image"
                      aria-label="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Metadata Overlay - single label: description (side) || side || filename */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white pointer-events-none">
                    <p className="text-sm truncate font-medium">
                      {imageDisplayTitle(image)}
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                      {formatBytes(image.fileSize)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {status && status.images.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={downloadAll}
                disabled={isDownloadingAll}
                className="w-full max-w-md px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloadingAll ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download All {status.images.length} Image{status.images.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-text-tertiary">
          <p>Images automatically delete after 24 hours</p>
          <p className="mt-2">
            <Link href={mobileLink || '#'} className="text-primary hover:underline">
              On mobile? Switch to mobile page
            </Link>
          </p>
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

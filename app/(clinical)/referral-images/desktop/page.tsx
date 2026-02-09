'use client';

import * as Tabs from '@radix-ui/react-tabs';
import Ably from 'ably';
import { AlertCircle, CheckCircle, Copy, Download, Loader2, Mail, MessageSquare, QrCode, RotateCcw, RotateCw, Share2, Smartphone, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Suspense, useCallback, useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';
import { useToast } from '@/src/shared/components/ui/toast';

import { BookmarkInstructionsModal } from '../components/BookmarkInstructionsModal';
import {
  incrementDownloadCount,
  isSharePromptThreshold,
} from '../components/share-prompt-threshold';
import { ShareModal } from '../components/ShareModal';
import { useShare } from '../components/useShare';

type ImageData = {
  imageId: string;
  presignedUrl: string;
  filename: string;
  fileSize: number;
  createdAt: string;
  metadata: {
    side?: 'R' | 'L';
    description?: string;
  };
};

type StatusData = {
  tier: string;
  imageCount: number;
  limit: number;
  limitReached: boolean;
  graceUnlocksRemaining: number;
  referralCode?: string | null;
  totalLifetimeImages?: number;
  images: ImageData[];
};

function formatBytes(bytes: number): string {
  if (bytes === 0 || !Number.isFinite(bytes)) {
 return '0 KB';
}
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${Math.round(bytes / k ** i)} ${sizes[i]}`;
}

/** Display title for an image: includes side in title when present (matches download filename). */
function imageDisplayTitle(image: ImageData): string {
  const sideLabel = image.metadata?.side === 'R' ? 'Right' : image.metadata?.side === 'L' ? 'Left' : null;
  if (image.metadata?.description) {
    return sideLabel ? `${image.metadata.description} (${sideLabel})` : image.metadata.description;
  }
  if (sideLabel) {
 return sideLabel;
}
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
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [rotatingImageId, setRotatingImageId] = useState<string | null>(null);
  const [bookmarkBannerDismissed, setBookmarkBannerDismissed] = useState(true); // start true, set false in useEffect if not dismissed
  const [showBookmarkInstructions, setShowBookmarkInstructions] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<ImageData | null>(null);
  const [downloadingImageIds, setDownloadingImageIds] = useState<Set<string>>(new Set());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Share URL: Always use landing page for sharing to others (with optional referral tracking)
  const shareUrl
    = typeof window !== 'undefined'
      ? `${window.location.origin}/referral-images${status?.referralCode ? `?ref=${status.referralCode}` : ''}`
      : '';
  const { handleShare, shareModalOpen, setShareModalOpen, shareLocation } = useShare(
    userId ?? null,
    shareUrl,
  );
  const toast = useToast();

  const onShareClick = async (location: string) => {
    const usedNative = await handleShare(location);
    if (usedNative) {
 toast.show({ title: 'Thanks for sharing!', durationMs: 3000 });
}
  };

  const fetchStatus = useCallback(async () => {
    if (!userId) {
 return;
}

    try {
      const response = await fetch(`/api/referral-images/status/${userId}`);
      if (!response.ok) {
 throw new Error('Failed to fetch status');
}

      const data = await response.json();
      setStatus(data);
      setError(null);
      if (
        data.totalLifetimeImages >= 10
        && typeof window !== 'undefined'
        && !window.localStorage.getItem(`milestone_10_${userId}`)
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
    if (typeof window === 'undefined') {
 return;
}
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

    ably.connection.on('failed', (stateChange) => {
      console.error('[Ably Connection] State: FAILED', {
        reason: stateChange.reason,
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

    channel.on('failed', (stateChange) => {
      console.error('[Ably Channel] State: FAILED', {
        channelName: channel.name,
        reason: stateChange.reason,
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
    if (!userId) {
 return;
}

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
        durationMs: 3000,
      });

      // Reset success message after 5 seconds
      setTimeout(() => setEmailSent(false), 5000);
    } catch (err) {
      console.error('Failed to send email:', err);
      toast.show({
        title: 'Failed to send email. Please try again.',
        variant: 'destructive',
        durationMs: 3000,
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
      if (!res.ok) {
 return false;
}
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
    if (!status?.images.length || !userId) {
 return;
}

    setIsDownloadingAll(true);
    try {
      let successCount = 0;
      for (const image of status.images) {
        const url = downloadUrl(image);
        if (!url) {
 continue;
}
        const ok = await triggerFileDownload(url, image.filename);
        if (ok) {
 successCount++;
} else {
 toast.show({ title: `Failed to download ${image.filename}`, variant: 'destructive' });
}
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      const newTotal = incrementDownloadCount(userId, successCount);
      setShowDownloadSuccessModal(isSharePromptThreshold(newTotal));
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const downloadSingleImage = async (image: ImageData) => {
    const url = downloadUrl(image);
    if (!url) {
 return;
}

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
      setDownloadingImageIds((prev) => {
        const next = new Set(prev);
        next.delete(image.imageId);
        return next;
      });
    }
  };

  const handleDeleteClick = async (imageId: string) => {
    if (!userId) {
 return;
}

    // First click: show confirmation (checkmark)
    if (deleteConfirmImageId !== imageId) {
      setDeleteConfirmImageId(imageId);
      // Auto-reset after 3 seconds if not confirmed
      setTimeout(() => {
        setDeleteConfirmImageId(prev => prev === imageId ? null : prev);
      }, 3000);
      return;
    }

    // Second click: actually delete
    setDeletingImageId(imageId);
    setDeleteConfirmImageId(null);
    try {
      const res = await fetch(`/api/referral-images/delete/${imageId}?u=${userId}`, { method: 'DELETE' });
      if (!res.ok) {
 throw new Error('Delete failed');
}
      await fetchStatus();
      toast.show({ title: 'Image deleted', durationMs: 2000 });
    } catch (err) {
      console.error(err);
      toast.show({ title: 'Failed to delete image', variant: 'destructive' });
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleRotateImage = async (imageId: string, degrees: number) => {
    if (!userId) {
 return;
}
    setRotatingImageId(imageId);
    try {
      const res = await fetch(`/api/referral-images/rotate/${imageId}?u=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ degrees }),
      });
      if (!res.ok) {
 throw new Error('Rotate failed');
}
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
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-text-primary">Missing User ID</h1>
          <p className="text-text-secondary">Please use the link from your welcome email.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-text-primary">Error</h1>
          <p className="mb-4 text-text-secondary">{error}</p>
          <button
            onClick={() => fetchStatus()}
            className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary-dark"
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
        <div className="flex items-center justify-between gap-4 border-b border-blue-200 bg-blue-100 px-4 py-3">
          <p className="flex-1 text-sm text-blue-900">
            <span className="mr-1" aria-hidden>🔖</span>
            <strong>Bookmark this page</strong>
{' '}
on your computer for quick access.
{' '}
            <button
              type="button"
              onClick={() => setShowBookmarkInstructions(true)}
              className="font-medium text-blue-800 underline hover:text-blue-900"
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
            className="shrink-0 rounded p-1 text-blue-900 hover:bg-blue-200/50"
            aria-label="Dismiss bookmark banner"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xl font-bold text-text-primary transition-colors hover:text-primary"
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
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-text-primary transition-colors hover:bg-surface"
              title="Open mobile capture page"
            >
              <Smartphone className="size-4" />
              Switch to Mobile Page
            </Link>
            <button
              type="button"
              onClick={() => onShareClick('desktop_header')}
              disabled={!userId || !shareUrl}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              title={shareUrl ? 'Share with colleagues' : 'Share'}
            >
              <Share2 className="size-4" />
              Share
            </button>
            {status?.tier === 'premium' && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
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
          <div className="my-4 border-t border-border" />
          <p className="text-text-primary">Just saved &gt;10 minutes?</p>
          <p className="mb-4 text-sm text-text-secondary">
            Know GPs in your practice who still email photos to themselves?
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setShowDownloadSuccessModal(false);
                onShareClick('desktop_after_download');
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-white transition-colors hover:bg-primary-dark"
            >
              <Share2 className="size-4" />
              Share ClinicPro
            </button>
            <p className="text-center text-xs text-text-tertiary">(Takes 5 seconds)</p>
            <button
              type="button"
              onClick={() => setShowDownloadSuccessModal(false)}
              className="rounded-lg border border-border px-4 py-2 transition-colors hover:bg-surface"
            >
              Close
            </button>
          </div>
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
            You&apos;ve saved approximately
{' '}
            <strong>
              {(status?.totalLifetimeImages ?? 10) * 5}
{' '}
minutes
            </strong>
{' '}
            of workflow time with ClinicPro.
          </p>
          <div className="my-4 border-t border-border" />
          <p className="text-text-primary">Help your colleagues save time too</p>
          <p className="mb-4 text-sm text-text-secondary">
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
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-white transition-colors hover:bg-primary-dark"
            >
              <Share2 className="size-4" />
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
              className="rounded-lg border border-border px-4 py-2 transition-colors hover:bg-surface"
            >
              Maybe Later
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enlarged image modal */}
      <Dialog open={enlargedImage !== null} onOpenChange={open => !open && setEnlargedImage(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Enlarged image</DialogTitle>
          </DialogHeader>
          {enlargedImage && (
            <>
              <div className="flex justify-center overflow-hidden rounded-lg bg-black/5">
                <img
                  src={enlargedImage.presignedUrl}
                  alt={imageDisplayTitle(enlargedImage)}
                  className="max-h-[85vh] max-w-full object-contain"
                />
              </div>
              <p className="mt-2 text-center text-sm text-text-secondary">
                {imageDisplayTitle(enlargedImage)}
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <button
                  type="button"
                  onClick={() => {
                    downloadSingleImage(enlargedImage);
                  }}
                  disabled={downloadingImageIds.has(enlargedImage.imageId)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloadingImageIds.has(enlargedImage.imageId)
? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Downloading...
                    </>
                  )
: (
                    <>
                      <Download className="size-4" />
                      Download
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEnlargedImage(null)}
                  className="rounded-lg border border-border px-4 py-2 transition-colors hover:bg-surface"
                >
                  Close
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Mobile Link Sharing - collapsed by default */}
        <details className="group mb-6 rounded-lg border border-border bg-white shadow-sm">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Send Mobile Link to Your Phone
              </h2>
              <span className="text-text-tertiary transition-transform group-open:rotate-180" aria-hidden>▼</span>
            </div>
          </summary>
          <div className="px-6 pb-6 pt-0">
          <p className="mb-4 text-sm text-text-secondary">
            💡
{' '}
<strong>Save the mobile link to your phone&apos;s home screen</strong>
{' '}
for instant access during consults.
          </p>
          <div className="mb-4 flex items-center gap-3">
            <input
              type="text"
              value={mobileLink}
              readOnly
              className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 font-mono text-sm text-text-primary"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark"
            >
              {copySuccess
? (
                <>
                  <CheckCircle className="size-4" />
                  Copied
                </>
              )
: (
                <>
                  <Copy className="size-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={shareViaEmail}
              disabled={isSendingEmail}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSendingEmail
? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending...
                </>
              )
: emailSent
? (
                <>
                  <CheckCircle className="size-4 text-green-600" />
                  Sent!
                </>
              )
: (
                <>
                  <Mail className="size-4" />
                  Email Me
                </>
              )}
            </button>
            <button
              onClick={shareViaWhatsApp}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-surface"
            >
              <MessageSquare className="size-4" />
              WhatsApp
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition-colors hover:bg-surface"
            >
              <QrCode className="size-4" />
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
          </div>

          {showQR && mobileLink && (
            <div className="mt-4 rounded-lg bg-surface p-4">
              <p className="mb-2 text-sm text-text-secondary">Scan with your phone camera:</p>
              <div className="inline-block rounded-lg bg-white p-4">
                <QRCodeSVG value={mobileLink} size={200} level="M" />
              </div>
            </div>
          )}

          <details className="mt-4 overflow-hidden rounded-lg border border-border">
            <summary className="cursor-pointer bg-surface px-4 py-3 text-sm font-medium text-text-primary hover:bg-black/5">
              How to save to home screen
            </summary>
            <div className="border-t border-border p-4">
              <Tabs.Root defaultValue="iphone" className="text-sm">
                <Tabs.List className="mb-4 flex gap-1 rounded-lg border border-border p-1">
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
                <Tabs.Content value="iphone" className="space-y-2 text-text-secondary">
                  <ol className="list-inside list-decimal space-y-1">
                    <li>Open the mobile link in Safari</li>
                    <li>Tap the Share button (□↑)</li>
                    <li>Scroll and tap &quot;Add to Home Screen&quot;</li>
                    <li>Tap &quot;Add&quot;</li>
                  </ol>
                </Tabs.Content>
                <Tabs.Content value="android" className="space-y-2 text-text-secondary">
                  <ol className="list-inside list-decimal space-y-1">
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
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              Your Images (updates in real-time)
            </h2>
            {status && status.images.length > 0 && (
              <button
                onClick={downloadAll}
                disabled={isDownloadingAll}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDownloadingAll
? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Downloading...
                  </>
                )
: (
                  <>
                    <Download className="size-4" />
                    Download All
                  </>
                )}
              </button>
            )}
          </div>

          {status && status.images.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-text-secondary">No images yet</p>
              <p className="text-sm text-text-tertiary">
                Use your mobile link to capture photos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {status?.images.map(image => (
                <div
                  key={image.imageId}
                  role="button"
                  tabIndex={0}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-border transition-all hover:border-primary hover:shadow-md"
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
                    className="size-full object-cover"
                  />
                  {/* Action buttons - stopPropagation so card click (open modal) does not fire; visible on hover/focus */}
                  <div className="pointer-events-auto absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRotateImage(image.imageId, -90);
                      }}
                      onKeyDown={e => e.stopPropagation()}
                      disabled={rotatingImageId === image.imageId}
                      className="rounded-lg bg-black/50 p-2 text-white transition-colors hover:bg-black/70 disabled:opacity-50"
                      title="Rotate left"
                      aria-label="Rotate left"
                    >
                      <RotateCcw className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRotateImage(image.imageId, 90);
                      }}
                      onKeyDown={e => e.stopPropagation()}
                      disabled={rotatingImageId === image.imageId}
                      className="rounded-lg bg-black/50 p-2 text-white transition-colors hover:bg-black/70 disabled:opacity-50"
                      title="Rotate right"
                      aria-label="Rotate right"
                    >
                      <RotateCw className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        downloadSingleImage(image);
                      }}
                      onKeyDown={e => e.stopPropagation()}
                      disabled={downloadingImageIds.has(image.imageId)}
                      className="rounded-lg bg-black/50 p-2 text-white transition-colors hover:bg-black/70 disabled:opacity-50"
                      title="Download"
                      aria-label="Download"
                    >
                      {downloadingImageIds.has(image.imageId)
? (
                        <Loader2 className="size-4 animate-spin" />
                      )
: (
                        <Download className="size-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteClick(image.imageId);
                      }}
                      onKeyDown={e => e.stopPropagation()}
                      disabled={deletingImageId === image.imageId}
                      className={`rounded-lg p-2 ${
                        deleteConfirmImageId === image.imageId
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-black/50 hover:bg-black/70'
                      } text-white transition-colors disabled:opacity-50`}
                      title={
                        deletingImageId === image.imageId
                          ? 'Deleting...'
                          : deleteConfirmImageId === image.imageId
                          ? 'Click again to confirm delete'
                          : 'Delete image'
                      }
                      aria-label={deleteConfirmImageId === image.imageId ? 'Confirm delete' : 'Delete image'}
                    >
                      {deletingImageId === image.imageId
? (
                        <Loader2 className="size-4 animate-spin" />
                      )
: deleteConfirmImageId === image.imageId
? (
                        <CheckCircle className="size-4" />
                      )
: (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                  {/* Metadata Overlay - single label: description (side) || side || filename */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                    <p className="truncate text-sm font-medium">
                      {imageDisplayTitle(image)}
                    </p>
                    <p className="mt-1 text-xs opacity-80">
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
                className="flex w-full max-w-md items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDownloadingAll
? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Downloading...
                  </>
                )
: (
                  <>
                    <Download className="size-5" />
                    Download All
{' '}
{status.images.length}
{' '}
Image
{status.images.length !== 1 ? 's' : ''}
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
      fallback={(
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-text-secondary">Loading...</p>
        </div>
      )}
    >
      <ReferralImagesDesktopPageContent />
    </Suspense>
  );
}

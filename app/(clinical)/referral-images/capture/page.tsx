'use client';

import imageCompression from 'browser-image-compression';
import { Camera, CheckCircle, ChevronLeft, ChevronRight, Download, Image, Loader2, Mail, Share2, Upload, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';
import { useToast } from '@/src/shared/components/ui/toast';

import { MobileInstallPrompt } from '../components/OnboardingPrompts';
import {
  incrementUploadCount,
  isSharePromptThreshold,
} from '../components/share-prompt-threshold';
import { ShareModal } from '../components/ShareModal';
import { triggerFileDownload } from '../components/triggerFileDownload';
import { useShare } from '../components/useShare';

type CapturedImage = {
  id: string;
  dataUrl: string;
  file: File;
  metadata: {
    side?: 'R' | 'L';
    description?: string;
  };
};

type MyImageData = {
  imageId: string;
  presignedUrl: string;
  filename: string;
  fileSize: number;
  createdAt: string;
  metadata: { side?: 'R' | 'L'; description?: string };
};

type Screen = 'loading' | 'capture' | 'review' | 'metadata' | 'uploading' | 'success' | 'limit-reached' | 'error';

const HAS_SEEN_SAVE_PROMPT = 'referral-images-hasSeenSavePrompt';
const DESKTOP_TIP_KEY = (uid: string) => `referral-images-hasSeenDesktopTip-${uid}`;

function ReferralImagesMobilePageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get('u');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [screen, setScreen] = useState<Screen>('loading');
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [currentMetadataIndex, setCurrentMetadataIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [usageStatus, setUsageStatus] = useState<{
    imageCount: number;
    limit: number;
    graceUnlocksRemaining: number;
  } | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showSharePromptAfterUpload, setShowSharePromptAfterUpload] = useState(false);
  const [lastAddSource, setLastAddSource] = useState<'camera' | 'gallery'>('gallery');
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showDesktopTipBanner, setShowDesktopTipBanner] = useState(false);
  const [showMyImagesPanel, setShowMyImagesPanel] = useState(false);
  const [myImages, setMyImages] = useState<MyImageData[] | null>(null);
  const [myImagesLoading, setMyImagesLoading] = useState(false);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(null);

  // Share URL: Always use landing page for sharing to others
  const shareUrl
    = typeof window !== 'undefined'
      ? `${window.location.origin}/referral-images`
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

  const handleSavedPrompt = () => {
    if (typeof window !== 'undefined') {
 localStorage.setItem(HAS_SEEN_SAVE_PROMPT, 'true');
}
    setShowSavePrompt(false);
  };

  const handleRemindLater = () => {
    setShowSavePrompt(false);
  };

  const sendEmailToSelf = async () => {
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

  // Check usage status on load
  useEffect(() => {
    if (!userId) {
      setScreen('error');
      setError('Missing user ID');
      return;
    }

    fetch(`/api/referral-images/status/${userId}`)
      .then(res => res.json())
      .then((data) => {
        setUsageStatus({
          imageCount: data.imageCount,
          limit: data.limit,
          graceUnlocksRemaining: data.graceUnlocksRemaining,
        });
        setScreen(data.limitReached === true ? 'limit-reached' : 'capture');
      })
      .catch(() => {
        setScreen('error');
        setError('Failed to load status');
      });
  }, [userId]);

  // First-time desktop tip banner: show when on capture and user has not dismissed it
  useEffect(() => {
    if (screen !== 'capture' || !userId || typeof window === 'undefined') {
      return;
    }
    const key = DESKTOP_TIP_KEY(userId);
    if (!localStorage.getItem(key)) {
      setShowDesktopTipBanner(true);
    }
  }, [screen, userId]);

  const handleDismissDesktopTip = () => {
    if (userId && typeof window !== 'undefined') {
      localStorage.setItem(DESKTOP_TIP_KEY(userId), 'true');
    }
    setShowDesktopTipBanner(false);
  };

  const toggleMyImagesPanel = () => {
    const next = !showMyImagesPanel;
    setShowMyImagesPanel(next);
    if (next && userId) {
      setMyImagesLoading(true);
      fetch(`/api/referral-images/status/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setMyImages(data.images ?? []);
        })
        .catch(() => {
          setMyImages([]);
        })
        .finally(() => {
          setMyImagesLoading(false);
        });
    }
  };

  const downloadMyImage = async (image: MyImageData) => {
    if (!userId) return;
    const url = `/api/referral-images/download/${image.imageId}?u=${userId}`;
    setDownloadingImageId(image.imageId);
    try {
      const ok = await triggerFileDownload(url, image.filename);
      if (!ok) {
        toast.show({ title: 'Failed to download image', variant: 'destructive' });
      }
    } finally {
      setDownloadingImageId(null);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
 return;
}

    setIsProcessingFiles(true);
    // Reset input so same input can be opened again later
    e.target.value = '';

    const newImages: CapturedImage[] = [];

    try {
      for (const file of files) {
        try {
          // Compress image
          const compressed = await imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });

          // Convert to data URL
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(compressed);
          });

          newImages.push({
            id: `img-${Date.now()}-${Math.random()}`,
            dataUrl,
            file: compressed,
            metadata: {},
          });
        } catch (err) {
          console.error('Failed to process image:', err);
        }
      }

      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages]);
        setScreen('review');
      }
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const handleCameraClick = () => {
    setLastAddSource('camera');
    const input = cameraInputRef.current;
    if (input) {
      input.value = '';
      input.click();
    }
  };

  const handleGalleryClick = () => {
    setLastAddSource('gallery');
    const input = galleryInputRef.current;
    if (input) {
      input.value = '';
      input.click();
    }
  };

  /** Open the same source (camera or gallery) as last time; used for "Add More Photos". */
  const handleAddMorePhotos = () => {
    if (lastAddSource === 'camera') {
      const input = cameraInputRef.current;
      if (input) {
        input.value = '';
        input.click();
      }
    } else {
      const input = galleryInputRef.current;
      if (input) {
        input.value = '';
        input.click();
      }
    }
  };

  /** Open the other source (gallery if last was camera, camera if last was gallery). */
  const handleAddFromOtherSource = () => {
    if (lastAddSource === 'camera') {
      const input = galleryInputRef.current;
      if (input) {
        input.value = '';
        input.click();
      }
    } else {
      const input = cameraInputRef.current;
      if (input) {
        input.value = '';
        input.click();
      }
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (images.length === 1) {
      setScreen('capture');
    }
  };

  const proceedToMetadata = () => {
    setCurrentMetadataIndex(0);
    setScreen('metadata');
  };

  const updateMetadata = (metadata: { side?: 'R' | 'L'; description?: string }) => {
    setImages(prev => prev.map((img, idx) =>
      idx === currentMetadataIndex ? { ...img, metadata } : img,
    ));
  };

  const handleMetadataNext = () => {
    if (currentMetadataIndex < images.length - 1) {
      // Carry forward metadata to next image
      const currentImage = images[currentMetadataIndex];
      if (!currentImage) {
 return;
}
      const currentMetadata = currentImage.metadata;
      setImages(prev => prev.map((img, idx) =>
        idx === currentMetadataIndex + 1 ? { ...img, metadata: { ...currentMetadata } } : img,
      ));
      setCurrentMetadataIndex(prev => prev + 1);
    } else {
      // All metadata complete, start upload
      handleUpload();
    }
  };

  const handleMetadataPrevious = () => {
    if (currentMetadataIndex > 0) {
      setCurrentMetadataIndex(prev => prev - 1);
    }
  };

  const handleUpload = async () => {
    if (!userId) {
 return;
}

    setScreen('uploading');
    setUploadProgress(0);

    let successCount = 0;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image) {
 continue;
}

      try {
        const response = await fetch('/api/referral-images/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            imageData: image.dataUrl,
            metadata: image.metadata,
          }),
        });

        const result = await response.json();

        if (result.limitReached) {
          setScreen('limit-reached');
          return;
        }

        if (result.success) {
          successCount++;
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }

      setUploadProgress(((i + 1) / images.length) * 100);
    }

    if (successCount === images.length) {
      const newTotal = incrementUploadCount(userId, successCount);
      setScreen('success');
      if (isSharePromptThreshold(newTotal)) {
        setShowSharePromptAfterUpload(true);
      }
      // Reset after 2 seconds
      setTimeout(() => {
        setImages([]);
        setScreen('capture');
      }, 2000);
    } else {
      setScreen('error');
      setError('Some images failed to upload');
    }
  };

  const handleGraceUnlock = async () => {
    if (!userId) {
 return;
}

    try {
      const response = await fetch('/api/referral-images/unlock-grace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.success) {
        // Unlock successful, return to capture
        setUsageStatus(prev => prev
? {
          ...prev,
          limit: result.newLimit,
          graceUnlocksRemaining: 2 - result.graceUnlocksUsed,
        }
: null);
        setScreen('capture');
      } else {
        setError('Failed to unlock grace images');
      }
    } catch (err) {
      setError('Failed to unlock grace images');
      console.error(err);
    }
  };

  const handleUpgradeClick = async () => {
    if (!userId) {
 return;
}

    setUpgradeError(null);
    try {
      const response = await fetch('/api/referral-images/upgrade/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: '' }),
      });

      const result = await response.json();

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setUpgradeError(result.error || result.details || 'Checkout failed. Please try again.');
    } catch (err) {
      console.error('Failed to create checkout:', err);
      setUpgradeError('Checkout failed. Please try again.');
    }
  };

  // Loading Screen
  if (screen === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-12 animate-spin text-primary" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Capture Screen
  const desktopLink = typeof window !== 'undefined' && userId
    ? `${window.location.origin}/referral-images/desktop?u=${userId}`
    : '';

  if (screen === 'capture') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* Processing photos overlay (gallery/camera pick) */}
        {isProcessingFiles && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 flex flex-col items-center gap-4 rounded-lg bg-white p-6">
              <Loader2 className="size-12 animate-spin text-primary" />
              <p className="font-medium text-text-primary">Processing photos...</p>
            </div>
          </div>
        )}
        {/* Save to Home Screen modal */}
        <MobileInstallPrompt
          open={showSavePrompt}
          onClose={handleRemindLater}
          onSaved={handleSavedPrompt}
        />

        <header className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-center p-4">
            <div className="flex items-center gap-2">
              <a href="/" className="text-xl font-bold text-text-primary transition-colors hover:text-primary">
                ClinicPro
              </a>
              <span className="text-text-tertiary">/</span>
              <h1 className="text-xl font-bold text-text-primary">
                Referral Images
              </h1>
            </div>
          </div>
        </header>

        {showDesktopTipBanner && (
          <div className="flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-4 py-3">
            <p className="flex-1 text-sm text-amber-900">
              Photos are sent to your desktop. Open the desktop page on your computer to view and download.
            </p>
            <button
              type="button"
              onClick={handleDismissDesktopTip}
              className="shrink-0 rounded-lg bg-amber-200 px-3 py-1.5 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-300"
            >
              Got it
            </button>
          </div>
        )}

        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          shareUrl={shareUrl}
          location={shareLocation}
          userId={userId ?? ''}
          onShareComplete={() => setShareModalOpen(false)}
        />

        <div className="relative flex flex-1 items-center justify-center p-4">
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              type="button"
              onClick={sendEmailToSelf}
              disabled={isSendingEmail || !userId}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-text-primary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              title="Email my links"
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
                  Email my links
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onShareClick('capture_content')}
              disabled={!userId || !shareUrl}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-text-primary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              title={shareUrl ? 'Share with colleagues' : 'Share'}
            >
              <Share2 className="size-4" />
              Share
            </button>
          </div>
          <div className="text-center">
            <div className="flex items-start justify-center gap-8">
              <button
                onClick={handleCameraClick}
                className="flex size-24 flex-col items-center justify-center gap-2 rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-primary-dark"
                type="button"
              >
                <Camera className="size-10" />
                <span className="text-xs font-medium">Camera</span>
              </button>
              <button
                onClick={handleGalleryClick}
                className="flex size-24 flex-col items-center justify-center gap-2 rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-primary-dark"
                type="button"
              >
                <Image className="size-10" />
                <span className="text-xs font-medium">Gallery</span>
              </button>
            </div>
            <p className="mt-6 text-text-secondary">
              Take a photo or choose from gallery
            </p>
          </div>
        </div>

        <div className="border-t border-border bg-white px-4 py-3 text-center">
          <button
            type="button"
            onClick={() => setShowSavePrompt(true)}
            className="text-sm text-primary hover:underline"
          >
            Add to Home Screen for quick access
          </button>
          {userId && (
            <>
              <span className="mx-2 text-text-tertiary">·</span>
              <button
                type="button"
                onClick={toggleMyImagesPanel}
                className="text-sm text-primary hover:underline"
              >
                {showMyImagesPanel ? 'Hide my images' : 'View & download my images on this device'}
              </button>
            </>
          )}
        </div>

        {showMyImagesPanel && userId && (
          <div className="border-t border-border bg-white p-4">
            {myImagesLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-text-secondary">
                <Loader2 className="size-5 animate-spin" />
                <span>Loading images...</span>
              </div>
            ) : myImages !== null && myImages.length === 0 ? (
              <p className="py-4 text-center text-sm text-text-secondary">
                No images yet. They&apos;ll appear here after you upload.
              </p>
            ) : myImages !== null && myImages.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-text-primary">Your images</p>
                <div className="grid grid-cols-2 gap-3">
                  {myImages.map((img) => (
                    <div
                      key={img.imageId}
                      className="overflow-hidden rounded-lg border border-border bg-surface"
                    >
                      <img
                        src={img.presignedUrl}
                        alt={img.metadata?.description || img.filename || 'Image'}
                        className="aspect-square w-full object-cover"
                      />
                      <div className="flex items-center justify-between gap-2 p-2">
                        <span className="truncate text-xs text-text-secondary">
                          {img.metadata?.description || img.filename}
                        </span>
                        <button
                          type="button"
                          onClick={() => downloadMyImage(img)}
                          disabled={downloadingImageId === img.imageId}
                          className="shrink-0 rounded bg-primary px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
                        >
                          {downloadingImageId === img.imageId ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Download className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {desktopLink && (
          <footer className="border-t border-border bg-white p-4 text-center">
            <a href={desktopLink} className="text-sm text-primary hover:underline">
              On desktop? Switch to desktop page
            </a>
          </footer>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  // Review Screen
  if (screen === 'review') {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border bg-white p-4">
          <button onClick={() => setScreen('capture')} className="text-text-primary">
            <X className="size-6" />
          </button>
          <h2 className="font-semibold">
Review Photos (
{images.length}
)
          </h2>
          <div className="w-6"></div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            {images.map(image => (
              <div key={image.id} className="relative aspect-square">
                <img
                  src={image.dataUrl}
                  alt="Captured"
                  className="size-full rounded-lg object-cover"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-red-500 text-white"
                >
                  <X className="size-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t border-border bg-white p-4">
          <button
            onClick={handleAddMorePhotos}
            className="w-full rounded-lg border border-border px-6 py-3 transition-colors hover:bg-surface"
          >
            Add More Photos
          </button>
          <button
            type="button"
            onClick={handleAddFromOtherSource}
            className="w-full rounded-lg border border-border px-6 py-3 text-sm text-text-secondary transition-colors hover:bg-surface"
          >
            {lastAddSource === 'camera' ? 'Add from gallery' : 'Take another photo'}
          </button>
          <button
            onClick={proceedToMetadata}
            className="w-full rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-dark"
          >
            Continue
          </button>
        </div>
        {/* Hidden file inputs must be in DOM on review so Add More Photos / Add from gallery work */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden
        />
      </div>
    );
  }

  // Metadata Input Screen
  if (screen === 'metadata') {
    const currentImage = images[currentMetadataIndex];
    if (!currentImage) {
 return null;
}

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between border-b border-border bg-white p-4">
          <button onClick={() => setScreen('review')} className="text-text-primary">
            <ChevronLeft className="size-6" />
          </button>
          <h2 className="font-semibold">
            Image
{' '}
{currentMetadataIndex + 1}
{' '}
of
{' '}
{images.length}
          </h2>
          <div className="w-6"></div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="mb-6">
            <img
              src={currentImage.dataUrl}
              alt="Current"
              className="max-h-64 w-full rounded-lg object-contain"
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium text-text-primary">
                Side (optional):
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => updateMetadata({ ...currentImage.metadata, side: 'R' })}
                  className={`rounded-lg border-2 px-4 py-3 transition-all ${
                    currentImage.metadata.side === 'R'
                      ? 'bg-primary-light border-primary font-semibold text-primary'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  Right
                </button>
                <button
                  onClick={() => updateMetadata({ ...currentImage.metadata, side: 'L' })}
                  className={`rounded-lg border-2 px-4 py-3 transition-all ${
                    currentImage.metadata.side === 'L'
                      ? 'bg-primary-light border-primary font-semibold text-primary'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  Left
                </button>
                <button
                  onClick={() => updateMetadata({ ...currentImage.metadata, side: undefined })}
                  className={`rounded-lg border-2 px-4 py-3 transition-all ${
                    !currentImage.metadata.side
                      ? 'bg-primary-light border-primary font-semibold text-primary'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  N/A
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Description (optional):
              </label>
              <input
                type="text"
                value={currentImage.metadata.description || ''}
                onChange={e => updateMetadata({ ...currentImage.metadata, description: e.target.value })}
                placeholder="e.g., wound infection, ulcer, rash"
                className="w-full rounded-lg border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-border bg-white p-4">
          {currentMetadataIndex > 0 && (
            <button
              onClick={handleMetadataPrevious}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 transition-colors hover:bg-surface"
            >
              <ChevronLeft className="size-5" />
              Previous
            </button>
          )}
          <button
            onClick={handleMetadataNext}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-dark"
          >
            {currentMetadataIndex < images.length - 1
? (
              <>
                Next
                <ChevronRight className="size-5" />
              </>
            )
: (
              <>
                <Upload className="size-5" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Uploading Screen
  if (screen === 'uploading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <Loader2 className="mx-auto mb-6 size-16 animate-spin text-primary" />
          <h2 className="mb-4 text-2xl font-bold text-text-primary">Uploading...</h2>
          <div className="mb-4 h-3 w-full rounded-full bg-surface">
            <div
              className="h-3 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-text-secondary">
{Math.round(uploadProgress)}
%
          </p>
        </div>
      </div>
    );
  }

  // Success Screen
  if (screen === 'success') {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
              <Camera className="size-10 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-text-primary">Success!</h2>
            <p className="text-text-secondary">
              {images.length}
{' '}
image
{images.length !== 1 ? 's' : ''}
{' '}
uploaded
            </p>
          </div>
        </div>

        {/* Share prompt after upload (at 10, 20, 50, then every 50) */}
        <Dialog open={showSharePromptAfterUpload} onOpenChange={setShowSharePromptAfterUpload}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Upload complete!</span>
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
                  setShowSharePromptAfterUpload(false);
                  onShareClick('capture_after_upload');
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-white transition-colors hover:bg-primary-dark"
              >
                <Share2 className="size-4" />
                Share ClinicPro
              </button>
              <p className="text-center text-xs text-text-tertiary">(Takes 5 seconds)</p>
              <button
                type="button"
                onClick={() => setShowSharePromptAfterUpload(false)}
                className="rounded-lg border border-border px-4 py-2 transition-colors hover:bg-surface"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Limit Reached Screen
  if (screen === 'limit-reached') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-text-primary">
            🎉 You've captured
{' '}
{usageStatus?.imageCount}
{' '}
images this month
          </h2>

          <p className="mb-6 text-text-secondary">
            This tool is clearly helping you!
          </p>

          <div className="mb-6 rounded-lg bg-surface p-6 text-left">
            <p className="mb-4 text-sm text-text-primary">
              I'm a fellow GP who built this to solve our shared workflow pain. No VC funding, no corporate backing.
            </p>
            <p className="mb-3 font-semibold text-text-primary">$50 one-time gets you:</p>
            <ul className="space-y-2 text-sm text-text-primary">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Unlimited images forever</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>All future features</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Early access to Inbox Intelligence</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleUpgradeClick}
              className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Support This Project - $50
            </button>

            {usageStatus && usageStatus.graceUnlocksRemaining > 0 && (
              <>
                <p className="text-sm text-text-secondary">Or:</p>
                <button
                  onClick={handleGraceUnlock}
                  className="w-full rounded-lg border border-border px-6 py-3 transition-colors hover:bg-surface"
                >
                  Give Me 10 More Free Images
                </button>
              </>
            )}

            {upgradeError && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {upgradeError}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error Screen
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
          <X className="size-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-text-primary">Error</h2>
        <p className="mb-6 text-text-secondary">{error || 'Something went wrong'}</p>
        <button
          onClick={() => {
            setImages([]);
            setScreen('capture');
            setError(null);
          }}
          className="rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function ReferralImagesMobilePage() {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 size-12 animate-spin text-primary" />
            <p className="text-text-secondary">Loading...</p>
          </div>
        </div>
      )}
    >
      <ReferralImagesMobilePageContent />
    </Suspense>
  );
}

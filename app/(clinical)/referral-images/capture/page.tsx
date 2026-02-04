'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Camera, Image, Upload, X, ChevronLeft, ChevronRight, Loader2, Share2, Mail, CheckCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';

import { ShareModal } from '../components/ShareModal';
import { useShare } from '../components/useShare';
import {
  incrementUploadCount,
  isSharePromptThreshold,
} from '../components/share-prompt-threshold';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';
import { useToast } from '@/src/shared/components/ui/toast';

interface CapturedImage {
  id: string;
  dataUrl: string;
  file: File;
  metadata: {
    side?: 'R' | 'L';
    description?: string;
  };
}

type Screen = 'loading' | 'capture' | 'review' | 'metadata' | 'uploading' | 'success' | 'limit-reached' | 'error';

type Platform = 'ios' | 'android' | 'other';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

const HAS_SEEN_SAVE_PROMPT = 'referral-images-hasSeenSavePrompt';

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

  // Share URL: Always use landing page for sharing to others
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/referral-images`
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

  const handleSavedPrompt = () => {
    if (typeof window !== 'undefined') localStorage.setItem(HAS_SEEN_SAVE_PROMPT, 'true');
    setShowSavePrompt(false);
  };

  const handleRemindLater = () => {
    setShowSavePrompt(false);
  };

  const sendEmailToSelf = async () => {
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

  // Check usage status on load
  useEffect(() => {
    if (!userId) {
      setScreen('error');
      setError('Missing user ID');
      return;
    }

    fetch(`/api/referral-images/status/${userId}`)
      .then(res => res.json())
      .then(data => {
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

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
      idx === currentMetadataIndex ? { ...img, metadata } : img
    ));
  };

  const handleMetadataNext = () => {
    if (currentMetadataIndex < images.length - 1) {
      // Carry forward metadata to next image
      const currentImage = images[currentMetadataIndex];
      if (!currentImage) return;
      const currentMetadata = currentImage.metadata;
      setImages(prev => prev.map((img, idx) => 
        idx === currentMetadataIndex + 1 ? { ...img, metadata: { ...currentMetadata } } : img
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
    if (!userId) return;
    
    setScreen('uploading');
    setUploadProgress(0);

    let successCount = 0;
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image) continue;

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
    if (!userId) return;

    try {
      const response = await fetch('/api/referral-images/unlock-grace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.success) {
        // Unlock successful, return to capture
        setUsageStatus(prev => prev ? {
          ...prev,
          limit: result.newLimit,
          graceUnlocksRemaining: 2 - result.graceUnlocksUsed,
        } : null);
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
    if (!userId) return;

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
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
      <div className="min-h-screen bg-background flex flex-col">
        {/* Processing photos overlay (gallery/camera pick) */}
        {isProcessingFiles && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 mx-4 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-text-primary font-medium">Processing photos...</p>
            </div>
          </div>
        )}
        {/* Save to Home Screen modal */}
        {showSavePrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
              <div className="text-center text-4xl mb-4">📱</div>
              <h2 className="text-xl font-bold text-text-primary mb-2 text-center">Save to Home Screen</h2>
              <p className="text-text-secondary text-sm mb-4 text-center">
                Save this page for instant access during consults. It&apos;ll work like an app - no need to find the link again.
              </p>
              {detectPlatform() === 'ios' && (
                <ol className="list-decimal list-inside space-y-2 text-text-secondary text-sm mb-4 text-left">
                  <li>Tap the <strong>Share button</strong> (□↑) at the bottom</li>
                  <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></li>
                  <li>Tap <strong>&quot;Add&quot;</strong> in the top-right</li>
                </ol>
              )}
              {detectPlatform() === 'android' && (
                <ol className="list-decimal list-inside space-y-2 text-text-secondary text-sm mb-4 text-left">
                  <li>Tap the <strong>menu</strong> (⋮) in the top-right corner</li>
                  <li>Tap <strong>&quot;Add to Home screen&quot;</strong></li>
                  <li>Tap <strong>&quot;Add&quot;</strong></li>
                </ol>
              )}
              {detectPlatform() === 'other' && (
                <p className="text-text-secondary text-sm mb-4 text-center">
                  Look for &quot;Add to Home Screen&quot; or &quot;Install App&quot; in your browser menu.
                </p>
              )}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSavedPrompt}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                >
                  I&apos;ve Saved It
                </button>
                <button
                  onClick={handleRemindLater}
                  className="w-full py-3 border border-border rounded-lg hover:bg-surface transition-colors text-text-secondary"
                >
                  Remind Me Later
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <a href="/" className="text-xl font-bold text-text-primary hover:text-primary transition-colors">
                ClinicPro
              </a>
              <span className="text-text-tertiary">/</span>
              <h1 className="text-xl font-bold text-text-primary">
                Referral Images
              </h1>
            </div>
          </div>
        </header>

        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          shareUrl={shareUrl}
          location={shareLocation}
          userId={userId ?? ''}
          onShareComplete={() => setShareModalOpen(false)}
        />

        <div className="flex-1 flex items-center justify-center p-4 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={sendEmailToSelf}
              disabled={isSendingEmail || !userId}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-text-primary bg-white"
              title="Email me my links"
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
              type="button"
              onClick={() => onShareClick('capture_content')}
              disabled={!userId || !shareUrl}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-text-primary bg-white"
              title={shareUrl ? 'Share with colleagues' : 'Share'}
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
          <div className="text-center">
            <div className="flex gap-8 justify-center items-start">
              <button
                onClick={handleCameraClick}
                className="w-24 h-24 rounded-full bg-primary text-white flex flex-col items-center justify-center shadow-lg hover:bg-primary-dark transition-colors gap-2"
                type="button"
              >
                <Camera className="w-10 h-10" />
                <span className="text-xs font-medium">Camera</span>
              </button>
              <button
                onClick={handleGalleryClick}
                className="w-24 h-24 rounded-full bg-primary text-white flex flex-col items-center justify-center shadow-lg hover:bg-primary-dark transition-colors gap-2"
                type="button"
              >
                <Image className="w-10 h-10" />
                <span className="text-xs font-medium">Gallery</span>
              </button>
            </div>
            <p className="mt-6 text-text-secondary">
              Take a photo or choose from gallery
            </p>
          </div>
        </div>

        <div className="py-3 px-4 text-center border-t border-border bg-white">
          <button
            type="button"
            onClick={() => setShowSavePrompt(true)}
            className="text-sm text-primary hover:underline"
          >
            Add to Home Screen for quick access
          </button>
        </div>

        {desktopLink && (
          <footer className="py-4 px-4 text-center border-t border-border bg-white">
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
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-white border-b border-border p-4 flex justify-between items-center">
          <button onClick={() => setScreen('capture')} className="text-text-primary">
            <X className="w-6 h-6" />
          </button>
          <h2 className="font-semibold">Review Photos ({images.length})</h2>
          <div className="w-6"></div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-square">
                <img
                  src={image.dataUrl}
                  alt="Captured"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-t border-border p-4 space-y-3">
          <button
            onClick={handleAddMorePhotos}
            className="w-full px-6 py-3 border border-border rounded-lg hover:bg-surface transition-colors"
          >
            Add More Photos
          </button>
          <button
            type="button"
            onClick={handleAddFromOtherSource}
            className="w-full px-6 py-3 border border-border rounded-lg hover:bg-surface transition-colors text-text-secondary text-sm"
          >
            {lastAddSource === 'camera' ? 'Add from gallery' : 'Take another photo'}
          </button>
          <button
            onClick={proceedToMetadata}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
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
    if (!currentImage) return null;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-white border-b border-border p-4 flex justify-between items-center">
          <button onClick={() => setScreen('review')} className="text-text-primary">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="font-semibold">
            Image {currentMetadataIndex + 1} of {images.length}
          </h2>
          <div className="w-6"></div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="mb-6">
            <img
              src={currentImage.dataUrl}
              alt="Current"
              className="w-full max-h-64 object-contain rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Side (optional):
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => updateMetadata({ ...currentImage.metadata, side: 'R' })}
                  className={`px-4 py-3 border-2 rounded-lg transition-all ${
                    currentImage.metadata.side === 'R'
                      ? 'border-primary bg-primary-light text-primary font-semibold'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  Right
                </button>
                <button
                  onClick={() => updateMetadata({ ...currentImage.metadata, side: 'L' })}
                  className={`px-4 py-3 border-2 rounded-lg transition-all ${
                    currentImage.metadata.side === 'L'
                      ? 'border-primary bg-primary-light text-primary font-semibold'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  Left
                </button>
                <button
                  onClick={() => updateMetadata({ ...currentImage.metadata, side: undefined })}
                  className={`px-4 py-3 border-2 rounded-lg transition-all ${
                    !currentImage.metadata.side
                      ? 'border-primary bg-primary-light text-primary font-semibold'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  N/A
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description (optional):
              </label>
              <input
                type="text"
                value={currentImage.metadata.description || ''}
                onChange={(e) => updateMetadata({ ...currentImage.metadata, description: e.target.value })}
                placeholder="e.g., wound infection, ulcer, rash"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-border p-4 flex gap-3">
          {currentMetadataIndex > 0 && (
            <button
              onClick={handleMetadataPrevious}
              className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-surface transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
          )}
          <button
            onClick={handleMetadataNext}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            {currentMetadataIndex < images.length - 1 ? (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md w-full">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-text-primary mb-4">Uploading...</h2>
          <div className="w-full bg-surface rounded-full h-3 mb-4">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-text-secondary">{Math.round(uploadProgress)}%</p>
        </div>
      </div>
    );
  }

  // Success Screen
  if (screen === 'success') {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Success!</h2>
            <p className="text-text-secondary">
              {images.length} image{images.length !== 1 ? 's' : ''} uploaded
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
            <div className="border-t border-border my-4" />
            <p className="text-text-primary">Just saved &gt;10 minutes?</p>
            <p className="text-sm text-text-secondary mb-4">
              Know GPs in your practice who still email photos to themselves?
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSharePromptAfterUpload(false);
                  onShareClick('capture_after_upload');
                }}
                className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share ClinicPro
              </button>
              <p className="text-xs text-text-tertiary text-center">(Takes 5 seconds)</p>
              <button
                type="button"
                onClick={() => setShowSharePromptAfterUpload(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors"
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            🎉 You've captured {usageStatus?.imageCount} images this month
          </h2>
          
          <p className="text-text-secondary mb-6">
            This tool is clearly helping you!
          </p>

          <div className="bg-surface rounded-lg p-6 mb-6 text-left">
            <p className="text-sm text-text-primary mb-4">
              I'm a fellow GP who built this to solve our shared workflow pain. No VC funding, no corporate backing.
            </p>
            <p className="font-semibold text-text-primary mb-3">$50 one-time gets you:</p>
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
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              Support This Project - $50
            </button>

            {usageStatus && usageStatus.graceUnlocksRemaining > 0 && (
              <>
                <p className="text-sm text-text-secondary">Or:</p>
                <button
                  onClick={handleGraceUnlock}
                  className="w-full px-6 py-3 border border-border rounded-lg hover:bg-surface transition-colors"
                >
                  Give Me 10 More Free Images
                </button>
              </>
            )}

            {upgradeError && (
              <p className="text-sm text-red-600 mt-2" role="alert">
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Error</h2>
        <p className="text-text-secondary mb-6">{error || 'Something went wrong'}</p>
        <button
          onClick={() => {
            setImages([]);
            setScreen('capture');
            setError(null);
          }}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
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
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-text-secondary">Loading...</p>
          </div>
        </div>
      }
    >
      <ReferralImagesMobilePageContent />
    </Suspense>
  );
}

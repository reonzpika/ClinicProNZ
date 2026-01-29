'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Camera, Upload, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

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

export default function ReferralImagesMobilePage() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get('u');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [screen, setScreen] = useState<Screen>('loading');
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [currentMetadataIndex, setCurrentMetadataIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [usageStatus, setUsageStatus] = useState<{
    imageCount: number;
    limit: number;
    graceUnlocksRemaining: number;
  } | null>(null);

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
        setScreen('capture');
      })
      .catch(() => {
        setScreen('error');
        setError('Failed to load status');
      });
  }, [userId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImages: CapturedImage[] = [];

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
  };

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
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
      const currentMetadata = images[currentMetadataIndex].metadata;
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
      
      try {
        // Convert file to base64
        const base64 = image.dataUrl.split(',')[1];

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
      setScreen('success');
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

    try {
      const response = await fetch('/api/referral-images/upgrade/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: '' }),
      });

      const result = await response.json();

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      console.error('Failed to create checkout:', err);
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
  if (screen === 'capture') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <button
              onClick={handleCaptureClick}
              className="w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors"
            >
              <Camera className="w-16 h-16" />
            </button>
            <p className="mt-6 text-text-secondary">
              Tap to capture or select photos
            </p>
            {usageStatus && usageStatus.limit !== 999999 && (
              <p className="mt-2 text-sm text-text-tertiary">
                {usageStatus.imageCount} / {usageStatus.limit} used this month
              </p>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
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
            onClick={handleCaptureClick}
            className="w-full px-6 py-3 border border-border rounded-lg hover:bg-surface transition-colors"
          >
            Add More Photos
          </button>
          <button
            onClick={proceedToMetadata}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Metadata Input Screen
  if (screen === 'metadata') {
    const currentImage = images[currentMetadataIndex];
    
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
                <span>Early access to Inbox AI</span>
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
                <p className="text-xs text-text-tertiary">
                  ({usageStatus.graceUnlocksRemaining} unlock{usageStatus.graceUnlocksRemaining !== 1 ? 's' : ''} remaining)
                </p>
              </>
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

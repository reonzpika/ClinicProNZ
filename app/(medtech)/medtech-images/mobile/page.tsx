'use client';

/**
 * Medtech Images Widget - Mobile Page
 *
 * Mobile capture flow accessed via QR code
 * Flow: Capture → Review → (Optional Metadata) → Upload → Take More or Finish
 *
 * URL: /medtech-images/mobile?t=<token>
 */

import { Camera, Check, ChevronDown, ChevronUp, Loader2, Upload, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/src/shared/components/ui/collapsible';

import { useImageCompression } from '@/src/medtech/images-widget/hooks/useImageCompression';
import { useCapabilities } from '@/src/medtech/images-widget/hooks/useCapabilities';
import type { CodeableConcept } from '@/src/medtech/images-widget/types';

// Force dynamic rendering (required for useSearchParams)
export const dynamic = 'force-dynamic';

type ImageWithMetadata = {
  id: string;
  file: File;
  preview: string;
  metadata?: {
    bodySite?: CodeableConcept;
    laterality?: CodeableConcept;
    view?: CodeableConcept;
    type?: CodeableConcept;
    label?: string;
  };
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'error';
  error?: string;
};

const OFFLINE_QUEUE_KEY = 'medtech-mobile-upload-queue';

function MobilePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('t');

  const [step, setStep] = useState<'capture' | 'review'>('capture');
  const [images, setImages] = useState<ImageWithMetadata[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { compressImages, isCompressing } = useImageCompression();
  const { data: capabilities } = useCapabilities();

  // Load offline queue on mount
  // Note: Retry logic would need to reconstruct File objects from stored data
  // For now, failed uploads are handled in the upload function with retry
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (queue) {
        try {
          const parsed = JSON.parse(queue);
          if (parsed.token === token && parsed.images && parsed.images.length > 0) {
            // TODO: Implement retry logic to reconstruct File objects and retry uploads
            console.log('[Mobile] Found offline queue with', parsed.images.length, 'images');
          }
        } catch {
          // Invalid queue data, clear it
          localStorage.removeItem(OFFLINE_QUEUE_KEY);
        }
      }
    }
  }, [token]);

  // Cleanup: Revoke preview URLs when component unmounts
  // Use a ref to track images so cleanup always has latest state
  const imagesRef = useRef<ImageWithMetadata[]>([]);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      // Revoke all preview URLs on unmount (using ref to get latest state)
      imagesRef.current.forEach(image => {
        if (image.preview && image.preview.startsWith('blob:')) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []); // Only run on unmount

  // Save to offline queue if upload fails (stores base64 for retry)
  const saveToOfflineQueue = async (imagesToQueue: ImageWithMetadata[]) => {
    if (typeof window !== 'undefined' && imagesToQueue.length > 0) {
      // Convert files to base64 for storage
      const queuedImages = await Promise.all(
        imagesToQueue.map(async (img) => {
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64 = result.split(',')[1];
              resolve(base64 || '');
            };
            reader.onerror = reject;
            reader.readAsDataURL(img.file);
          });

          return {
            id: img.id,
            file: {
              name: img.file.name,
              type: img.file.type,
              size: img.file.size,
            },
            base64Data, // Store base64 for retry
            metadata: img.metadata,
            preview: img.preview, // Keep preview URL (will be regenerated on retry)
          };
        }),
      );

      localStorage.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify({
          token,
          images: queuedImages,
        }),
      );
    }
  };

  // Retry uploads from offline queue
  // Note: This would need to reconstruct File objects from stored data
  // For now, failed uploads are handled in the upload function

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const files = Array.from(e.target.files);

    try {
      // Compress images
      const compressedResults = await compressImages(files);

      // Create image objects with previews
      const newImages: ImageWithMetadata[] = compressedResults.map((result) => ({
        id: result.id,
        file: result.compressedFile,
        preview: result.preview,
        uploadStatus: 'pending' as const,
      }));

      // Use functional update to ensure we have latest state
      setImages(prev => {
        const updated = [...prev, ...newImages];
        // Set current index to first new image
        setCurrentImageIndex(prev.length);
        return updated;
      });
      setStep('review');
    } catch (error) {
      console.error('Failed to compress images:', error);
      // Show error to user (could add toast/alert here)
      setError('Failed to process images. Please try again.');
    }
  };

  const updateImageMetadata = (index: number, metadata: Partial<ImageWithMetadata['metadata']>) => {
    setImages(prev => prev.map((img, i) => (i === index ? { ...img, metadata: { ...img.metadata, ...metadata } } : img)));
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (newImages.length === 0) {
        setStep('capture');
      } else if (index >= newImages.length) {
        setCurrentImageIndex(newImages.length - 1);
      }
      return newImages;
    });
  };

  const uploadImage = async (image: ImageWithMetadata): Promise<boolean> => {
    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64 = result.split(',')[1];
          if (!base64) {
            reject(new Error('Failed to convert image to base64'));
            return;
          }
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(image.file);
      });

      console.log('[Mobile] Uploading image:', { token, contentType: image.file.type, sizeBytes: image.file.size });

      const response = await fetch('/api/medtech/mobile/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          images: [
            {
              contentType: image.file.type,
              sizeBytes: image.file.size,
              base64Data,
              metadata: image.metadata,
            },
          ],
        }),
      });

      console.log('[Mobile] Upload response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Mobile] Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[Mobile] Upload success:', result);
      return true;
    } catch (error) {
      console.error('[Mobile] Upload error:', error);
      return false;
    }
  };

  const handleTakeMore = async () => {
    if (images.length === 0) {
      return;
    }

    // Upload current image in background
    const currentImageId = images[currentImageIndex]?.id;
    if (currentImageId) {
      // Use functional update with image ID to avoid index issues
      setImages(prev => prev.map((img) => (img.id === currentImageId && img.uploadStatus === 'pending'
        ? { ...img, uploadStatus: 'uploading' }
        : img)));

      const currentImage = images.find(img => img.id === currentImageId);
      if (currentImage) {
        const success = await uploadImage(currentImage);

        setImages(prev => prev.map((img) => (img.id === currentImageId
          ? { ...img, uploadStatus: success ? 'uploaded' : 'error', error: success ? undefined : 'Upload failed' }
          : img)));

        // If failed, save to offline queue
        if (!success) {
          await saveToOfflineQueue([currentImage]);
        }
      }
    }

    // Reset to capture step
    setStep('capture');
    setCurrentImageIndex(0);
    setIsMetadataExpanded(false);
  };

  const handleFinish = async () => {
    console.log('[Mobile] handleFinish called, images:', images.length);
    setIsUploading(true);

    try {
      // Get pending images snapshot (use current state)
      const pendingImageIds = images
        .filter(img => img.uploadStatus === 'pending')
        .map(img => img.id);

      console.log('[Mobile] Pending images to upload:', pendingImageIds.length);

      if (pendingImageIds.length === 0) {
        // No pending images, just reset
        console.log('[Mobile] No pending images, resetting');
        setImages([]);
        setStep('capture');
        setCurrentImageIndex(0);
        setIsMetadataExpanded(false);
        return;
      }

      // Mark all as uploading
      setImages(prev => prev.map((img) => (pendingImageIds.includes(img.id)
        ? { ...img, uploadStatus: 'uploading' }
        : img)));

      // Upload all pending images (use IDs to avoid stale closures)
      const uploadPromises = pendingImageIds.map(async (imageId) => {
        const image = images.find(img => img.id === imageId);
        if (!image) {
          console.warn('[Mobile] Image not found for ID:', imageId);
          return { imageId, success: false };
        }

        console.log('[Mobile] Starting upload for image:', imageId);
        const success = await uploadImage(image);
        console.log('[Mobile] Upload result for image:', imageId, success);

        // Update state using ID (functional update)
        setImages(prev => prev.map((img) => (img.id === imageId
          ? { ...img, uploadStatus: success ? 'uploaded' : 'error', error: success ? undefined : 'Upload failed' }
          : img)));

        return { imageId, image, success };
      });

      const results = await Promise.all(uploadPromises);
      console.log('[Mobile] All uploads completed:', results);
      
      const failedImages = results
        .filter(r => !r.success && r.image)
        .map(r => r.image!)
        .filter(Boolean);

      // Save failed images to offline queue
      if (failedImages.length > 0) {
        console.log('[Mobile] Saving', failedImages.length, 'failed images to offline queue');
        await saveToOfflineQueue(failedImages);
      }

      // Revoke preview URLs before clearing images
      images.forEach(image => {
        if (image.preview && image.preview.startsWith('blob:')) {
          URL.revokeObjectURL(image.preview);
        }
      });

      // Reset to start state
      setImages([]);
      setStep('capture');
      setCurrentImageIndex(0);
      setIsMetadataExpanded(false);
    } catch (error) {
      console.error('Error during finish upload:', error);
      // Don't reset state if there was an error - let user retry
    } finally {
      setIsUploading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              This mobile upload link is invalid or has expired. Please scan the QR code again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];
  const quickChips = capabilities?.features?.images?.quickChips;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">ClinicPro Images</h1>
          <p className="text-sm text-slate-600">Mobile Upload</p>
        </header>

        {step === 'capture' && (
          <Card>
            <CardHeader>
              <CardTitle>Capture Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => document.getElementById('camera-input')?.click()}
                className="w-full"
                size="lg"
                disabled={isCompressing}
              >
                <Camera className="mr-2 size-5" />
                Open Camera
              </Button>

              <Button
                onClick={() => document.getElementById('gallery-input')?.click()}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={isCompressing}
              >
                <Upload className="mr-2 size-5" />
                Choose from Gallery
              </Button>

              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              <input
                id="gallery-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {isCompressing && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <Loader2 className="size-4 animate-spin" />
                  Compressing images...
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <strong>Tip:</strong>
                {' '}
                You can select multiple images at once.
                Images will be compressed automatically before upload.
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'review' && currentImage && (
          <div className="space-y-4">
            {/* Image Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Review Image
                  {' '}
                  {images.length > 1 && `(${currentImageIndex + 1} of ${images.length})`}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(currentImageIndex)}
                >
                  <X className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-lg border">
                  <img
                    src={currentImage.preview}
                    alt={`Image ${currentImageIndex + 1}`}
                    className="size-full object-contain"
                  />
                  {currentImage.uploadStatus === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="size-8 animate-spin text-white" />
                    </div>
                  )}
                  {currentImage.uploadStatus === 'uploaded' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/50">
                      <Check className="size-8 text-white" />
                    </div>
                  )}
                  {currentImage.uploadStatus === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/50">
                      <X className="size-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Metadata Form (Collapsible) */}
                {quickChips && (
                  <Collapsible open={isMetadataExpanded} onOpenChange={setIsMetadataExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full">
                        {isMetadataExpanded ? (
                          <>
                            Hide Metadata
                            <ChevronUp className="ml-2 size-4" />
                          </>
                        ) : (
                          <>
                            Add Metadata (Optional)
                            <ChevronDown className="ml-2 size-4" />
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-4">
                      {/* Laterality */}
                      <div>
                        <label className="mb-2 block text-xs font-medium text-slate-700">
                          Side
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {quickChips.laterality.map((option) => (
                            <button
                              key={option.code}
                              type="button"
                              onClick={() => updateImageMetadata(currentImageIndex, { laterality: option })}
                              className={`rounded-full border px-3 py-1 text-xs ${
                                currentImage.metadata?.laterality?.code === option.code
                                  ? 'border-purple-400 bg-purple-50 text-purple-700'
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              {option.display}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Body Site */}
                      <div>
                        <label className="mb-2 block text-xs font-medium text-slate-700">
                          Body Site
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {quickChips.bodySitesCommon.slice(0, 6).map((option) => (
                            <button
                              key={option.code}
                              type="button"
                              onClick={() => updateImageMetadata(currentImageIndex, { bodySite: option })}
                              className={`rounded-full border px-3 py-1 text-xs ${
                                currentImage.metadata?.bodySite?.code === option.code
                                  ? 'border-purple-400 bg-purple-50 text-purple-700'
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              {option.display}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* View */}
                      <div>
                        <label className="mb-2 block text-xs font-medium text-slate-700">
                          View
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {quickChips.views.map((option) => (
                            <button
                              key={option.code}
                              type="button"
                              onClick={() => updateImageMetadata(currentImageIndex, { view: option })}
                              className={`rounded-full border px-3 py-1 text-xs ${
                                currentImage.metadata?.view?.code === option.code
                                  ? 'border-purple-400 bg-purple-50 text-purple-700'
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              {option.display}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Type */}
                      <div>
                        <label className="mb-2 block text-xs font-medium text-slate-700">
                          Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {quickChips.types.map((option) => (
                            <button
                              key={option.code}
                              type="button"
                              onClick={() => updateImageMetadata(currentImageIndex, { type: option })}
                              className={`rounded-full border px-3 py-1 text-xs ${
                                currentImage.metadata?.type?.code === option.code
                                  ? 'border-purple-400 bg-purple-50 text-purple-700'
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              {option.display}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Navigation */}
                {images.length > 1 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentImageIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                      disabled={currentImageIndex === images.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleTakeMore}
                    variant="outline"
                    className="flex-1"
                    disabled={isUploading || currentImage.uploadStatus === 'uploading'}
                  >
                    Take More
                  </Button>
                  <Button
                    onClick={handleFinish}
                    className="flex-1"
                    disabled={isUploading || images.some(img => img.uploadStatus === 'uploading')}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 size-4" />
                        Finish
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MedtechImagesMobilePage() {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 size-12 animate-spin text-purple-500" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      )}
    >
      <MobilePageContent />
    </Suspense>
  );
}

'use client';

/**
 * Medtech Images Widget - Mobile Page
 *
 * Full 7-screen flow with metadata capture:
 * 1. Landing (token validation)
 * 2. Camera/Gallery selection
 * 3. Review captured images
 * 4. Metadata entry (laterality + body site per image)
 * 5. Upload progress
 * 6. Success
 * 7. Error (if needed)
 *
 * URL: /medtech-images/mobile?t=<token>
 */

import imageCompression from 'browser-image-compression';
import { Camera, Check, ChevronLeft, ChevronRight, Loader2, Upload, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { retry } from 'ts-retry-promise';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Label } from '@/src/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/components/ui/select';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Types
type Step =
  | 'loading'
  | 'error'
  | 'capture'
  | 'review'
  | 'metadata'
  | 'uploading'
  | 'success';

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  metadata: {
    laterality?: string;
    bodySite?: string;
    notes?: string;
  };
}

interface EncounterContext {
  encounterId: string;
  patientId: string;
  facilityId: string;
}

// Body site options (common clinical sites)
const BODY_SITES = [
  { code: 'ear-left', display: 'Left Ear' },
  { code: 'ear-right', display: 'Right Ear' },
  { code: 'eye-left', display: 'Left Eye' },
  { code: 'eye-right', display: 'Right Eye' },
  { code: 'hand-left', display: 'Left Hand' },
  { code: 'hand-right', display: 'Right Hand' },
  { code: 'foot-left', display: 'Left Foot' },
  { code: 'foot-right', display: 'Right Foot' },
  { code: 'chest', display: 'Chest' },
  { code: 'abdomen', display: 'Abdomen' },
  { code: 'back', display: 'Back' },
  { code: 'face', display: 'Face' },
  { code: 'neck', display: 'Neck' },
  { code: 'arm-left', display: 'Left Arm' },
  { code: 'arm-right', display: 'Right Arm' },
  { code: 'leg-left', display: 'Left Leg' },
  { code: 'leg-right', display: 'Right Leg' },
  { code: 'skin-lesion', display: 'Skin Lesion' },
  { code: 'wound', display: 'Wound' },
  { code: 'other', display: 'Other' },
];

// Laterality options
const LATERALITY_OPTIONS = [
  { code: 'left', display: 'Left' },
  { code: 'right', display: 'Right' },
  { code: 'bilateral', display: 'Bilateral' },
  { code: 'na', display: 'N/A' },
];

function MobilePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('t');

  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState<string | null>(null);
  const [encounterContext, setEncounterContext] = useState<EncounterContext | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [currentMetadataIndex, setCurrentMetadataIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token');
      setStep('error');
      return;
    }

    validateToken(token);
  }, [token]);

  /**
   * Validate QR token
   */
  async function validateToken(token: string) {
    try {
      const response = await fetch(`/api/medtech/session/token/${token}`);

      if (!response.ok) {
        throw new Error('Token expired or invalid');
      }

      const data = await response.json();

      setEncounterContext({
        encounterId: data.encounterId,
        patientId: data.patientId,
        facilityId: data.facilityId,
      });

      setStep('capture');
    }
    catch (err) {
      console.error('[Mobile] Token validation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate token');
      setStep('error');
    }
  }

  /**
   * Handle file selection
   */
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
return;
}

    const newImages: ImageFile[] = Array.from(e.target.files).map((file) => ({
      id: nanoid(),
      file,
      previewUrl: URL.createObjectURL(file),
      metadata: {},
    }));

    setImages(prev => [...prev, ...newImages]);
    setStep('review');
  }

  /**
   * Remove image
   */
  function removeImage(id: string) {
    setImages(prev => prev.filter(img => img.id !== id));
  }

  /**
   * Update image metadata
   */
  function updateImageMetadata(
    id: string,
    field: keyof ImageFile['metadata'],
    value: string,
  ) {
    setImages(prev =>
      prev.map(img =>
        img.id === id
          ? { ...img, metadata: { ...img.metadata, [field]: value } }
          : img,
      ),
    );
  }

  /**
   * Proceed to metadata entry
   */
  function proceedToMetadata() {
    if (images.length === 0) {
      setError('No images to upload');
      return;
    }

    setCurrentMetadataIndex(0);
    setStep('metadata');
  }

  /**
   * Skip metadata and proceed to upload
   */
  function skipMetadata() {
    startUpload();
  }

  /**
   * Next image in metadata flow
   */
  function nextMetadataImage() {
    if (currentMetadataIndex < images.length - 1) {
      setCurrentMetadataIndex(prev => prev + 1);
    }
    else {
      // All metadata entered, proceed to upload
      startUpload();
    }
  }

  /**
   * Previous image in metadata flow
   */
  function previousMetadataImage() {
    if (currentMetadataIndex > 0) {
      setCurrentMetadataIndex(prev => prev - 1);
    }
  }

  /**
   * Compress image
   */
  async function compressImage(file: File): Promise<Blob> {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    return await imageCompression(file, options);
  }

  /**
   * Upload single image with auto-retry
   */
  async function uploadImage(image: ImageFile): Promise<void> {
    if (!encounterContext) {
throw new Error('No encounter context');
}

    // Step 1: Compress image
    const compressed = await compressImage(image.file);

    // Step 2: Get presigned URL (with retry)
    const presignedData = await retry(
      async () => {
        const response = await fetch('/api/medtech/session/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            encounterId: encounterContext.encounterId,
            imageId: image.id,
            contentType: 'image/jpeg',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get presigned URL');
        }

        return await response.json();
      },
      { retries: 3, delay: 1000, backoff: 'EXPONENTIAL' },
    );

    // Step 3: Upload to S3 (with retry)
    await retry(
      async () => {
        const response = await fetch(presignedData.uploadUrl, {
          method: 'PUT',
          body: compressed,
          headers: { 'Content-Type': 'image/jpeg' },
        });

        if (!response.ok) {
          throw new Error('S3 upload failed');
        }
      },
      { retries: 3, delay: 1000, backoff: 'EXPONENTIAL' },
    );

    // Step 4: Notify backend + publish Ably event (with retry)
    await retry(
      async () => {
        const response = await fetch('/api/medtech/session/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            encounterId: encounterContext.encounterId,
            s3Key: presignedData.s3Key,
            metadata: image.metadata,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to notify backend');
        }
      },
      { retries: 3, delay: 1000, backoff: 'EXPONENTIAL' },
    );
  }

  /**
   * Start upload process
   */
  async function startUpload() {
    setStep('uploading');
    setUploadProgress({ current: 0, total: images.length });

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (!image) continue; // Type guard
        await uploadImage(image);
        setUploadProgress({ current: i + 1, total: images.length });
      }

      // All uploaded successfully
      setStep('success');
    }
    catch (err) {
      console.error('[Mobile] Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStep('error');
    }
  }

  /**
   * Reset and capture more
   */
  function captureMore() {
    setImages([]);
    setCurrentMetadataIndex(0);
    setUploadProgress({ current: 0, total: 0 });
    setStep('capture');
  }

  // ============================================================================
  // SCREENS
  // ============================================================================

  // Loading Screen
  if (step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-12 animate-spin text-purple-500" />
          <p className="text-slate-600">Validating session...</p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (step === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-slate-600">{error || 'An error occurred'}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">ClinicPro Images</h1>
          <p className="text-sm text-slate-600">Mobile Upload</p>
        </header>

        {/* Step 1: Capture */}
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
              >
                <Camera className="mr-2 size-5" />
                Open Camera
              </Button>

              <Button
                onClick={() => document.getElementById('gallery-input')?.click()}
                variant="outline"
                className="w-full"
                size="lg"
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

              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <strong>Tip:</strong>
                {' '}
                Select multiple images at once. You'll be able to add metadata next.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review Images */}
        {step === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>
                Review Images (
                {images.length}
                )
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {images.map(image => (
                  <div key={image.id} className="relative aspect-square overflow-hidden rounded border">
                    <img
                      src={image.previewUrl}
                      alt="Preview"
                      className="size-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => document.getElementById('camera-input')?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  Add More
                </Button>

                <Button onClick={proceedToMetadata} className="flex-1">
                  <Check className="mr-2 size-4" />
                  Continue
                </Button>
              </div>

              <Button onClick={skipMetadata} variant="ghost" className="w-full text-sm">
                Skip metadata and upload now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Metadata Entry */}
        {step === 'metadata' && images[currentMetadataIndex] && (
          <Card>
            <CardHeader>
              <CardTitle>
                Image
                {' '}
                {currentMetadataIndex + 1}
                {' '}
                of
                {' '}
                {images.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image preview */}
              <div className="aspect-square overflow-hidden rounded border">
                <img
                  src={images[currentMetadataIndex]!.previewUrl}
                  alt="Current"
                  className="size-full object-cover"
                />
              </div>

              {/* Laterality */}
              <div className="space-y-2">
                <Label>Laterality (optional)</Label>
                <Select
                  value={images[currentMetadataIndex]!.metadata.laterality}
                  onValueChange={value =>
                    updateImageMetadata(images[currentMetadataIndex]!.id, 'laterality', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select laterality" />
                  </SelectTrigger>
                  <SelectContent>
                    {LATERALITY_OPTIONS.map(option => (
                      <SelectItem key={option.code} value={option.code}>
                        {option.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Body Site */}
              <div className="space-y-2">
                <Label>Body Site (optional)</Label>
                <Select
                  value={images[currentMetadataIndex]!.metadata.bodySite}
                  onValueChange={value =>
                    updateImageMetadata(images[currentMetadataIndex]!.id, 'bodySite', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body site" />
                  </SelectTrigger>
                  <SelectContent>
                    {BODY_SITES.map(site => (
                      <SelectItem key={site.code} value={site.code}>
                        {site.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                {currentMetadataIndex > 0 && (
                  <Button onClick={previousMetadataImage} variant="outline" className="flex-1">
                    <ChevronLeft className="mr-1 size-4" />
                    Previous
                  </Button>
                )}

                <Button
                  onClick={nextMetadataImage}
                  className="flex-1"
                >
                  {currentMetadataIndex < images.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="ml-1 size-4" />
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 size-4" />
                      Upload All
                    </>
                  )}
                </Button>
              </div>

              <Button onClick={skipMetadata} variant="ghost" className="w-full text-sm">
                Skip remaining
                {' '}
                {images.length - currentMetadataIndex - 1 > 0 && `(${images.length - currentMetadataIndex - 1} images)`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Uploading */}
        {step === 'uploading' && (
          <Card>
            <CardHeader>
              <CardTitle>Uploading Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 size-16 animate-spin text-purple-500" />
                <p className="text-lg font-semibold text-slate-900">
                  {uploadProgress.current}
                  {' '}
                  /
                  {' '}
                  {uploadProgress.total}
                </p>
                <p className="text-sm text-slate-600">Compressing and uploading...</p>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <strong>Please wait...</strong>
                {' '}
                Images are being compressed and uploaded to secure storage.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Success */}
        {step === 'success' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Upload Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="size-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {images.length}
                  {' '}
                  {images.length === 1 ? 'image' : 'images'}
                  {' '}
                  uploaded successfully
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Return to desktop to review and commit to patient record.
                </p>
              </div>

              <Button onClick={captureMore} className="w-full" size="lg">
                <Camera className="mr-2 size-5" />
                Upload More Images
              </Button>
            </CardContent>
          </Card>
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

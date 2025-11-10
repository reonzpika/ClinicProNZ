'use client';

/**
 * Medtech Images Widget - Mobile Page
 *
 * Mobile capture flow accessed via QR code
 *
 * URL: /medtech-images/mobile?t=<token>
 */

import { Camera, Check, Loader2, Upload, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

import { useCapabilities } from '@/src/medtech/images-widget/hooks/useCapabilities';
import { useImageCompression } from '@/src/medtech/images-widget/hooks/useImageCompression';
import { useImageWidgetStore } from '@/src/medtech/images-widget/stores/imageWidgetStore';

// Force dynamic rendering (required for useSearchParams)
export const dynamic = 'force-dynamic';

function MobilePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('t');

  const [step, setStep] = useState<'capture' | 'review' | 'uploading' | 'success'>('capture');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { addImage, setError: setStoreError } = useImageWidgetStore();
  const { data: capabilities, isLoading: isLoadingCapabilities } = useCapabilities();
  const { compressImages, isCompressing } = useImageCompression();

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

  if (isLoadingCapabilities || !capabilities) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-12 animate-spin text-purple-500" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setStep('review');
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!capabilities || files.length === 0) {
      setError('Unable to upload. Please try again.');
      return;
    }

    setStep('uploading');
    setError(null);
    setUploadProgress(0);

    try {
      const limits = capabilities.limits.attachments;

      // Validate file types
      const invalidFiles = files.filter(
        file => !limits.acceptedTypes.some((type) => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', ''));
          }
          return file.type === type;
        }),
      );

      if (invalidFiles.length > 0) {
        setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`);
        setStep('review');
        return;
      }

      // Validate count
      if (files.length > limits.maxPerRequest) {
        setError(`Maximum ${limits.maxPerRequest} images per upload`);
        setStep('review');
        return;
      }

      // Compress images
      const compressed = await compressImages(files, {
        maxSizeBytes: limits.maxSizeBytes,
      });

      // Add to store
      compressed.forEach((result, index) => {
        addImage({
          id: result.id,
          file: result.compressedFile,
          preview: result.preview,
          thumbnail: result.thumbnail,
          metadata: {},
          status: 'pending',
        });
        setUploadProgress(Math.round(((index + 1) / compressed.length) * 100));
      });

      setStep('success');
      setTimeout(() => {
        setFiles([]);
        setStep('capture');
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
      setStep('review');
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50 p-4">
      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">ClinicPro Images</h1>
          <p className="text-sm text-slate-600">Mobile Upload</p>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0">
                <svg className="size-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Upload Error</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="shrink-0 text-red-600 hover:text-red-800"
                aria-label="Dismiss error"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

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
You can select multiple images at once.
                Images will be compressed automatically before upload.
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>
                Review Images (
                {files.length}
                )
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {files.map((file, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border-2 border-slate-200">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="size-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveFile(i)}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-600 group-hover:opacity-100"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1.5">
                      <p className="truncate text-xs text-white">{file.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    document.getElementById('camera-input')?.click();
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isCompressing}
                >
                  Add More
                </Button>

                <Button
                  onClick={handleUpload}
                  className="flex-1"
                  disabled={isCompressing || files.length === 0}
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 size-4" />
                      Upload
                      {' '}
                      {files.length}
                      {' '}
                      Image
                      {files.length === 1 ? '' : 's'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'uploading' && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="size-12 animate-spin text-purple-600" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900">Uploading Images</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {uploadProgress}
                    % complete
                  </p>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="size-8 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-900">Upload Successful!</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {files.length}
                    {' '}
                    image
                    {files.length === 1 ? '' : 's'}
                    {' '}
                    uploaded successfully
                  </p>
                </div>
              </div>
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

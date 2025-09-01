'use client';

import { useAuth } from '@clerk/nextjs';
import {
  AlertCircle,
  Camera,
  Check,
  Download,
  Expand,
  FileText,
  Image as ImageIcon,
  Loader2,
  QrCode,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Removed in-page WebRTC camera in favour of native camera capture
import { imageQueryKeys, useAnalyzeImage, useDeleteImage, useSaveAnalysis, useServerImages, useUploadImages } from '@/src/hooks/useImageQueries';
import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeaders } from '@/src/shared/utils';
import { isFeatureEnabled } from '@/src/shared/utils/launch-config';
import type { AnalysisModalState, ServerImage } from '@/src/stores/imageStore';
import { useImageStore } from '@/src/stores/imageStore';
import { useSimpleAbly } from '@/src/features/clinical/mobile/hooks/useSimpleAbly';

export default function ClinicalImagePage() {
  const { userId, isSignedIn } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();

  // Queries and mutations
  const { data: serverImages = [], isLoading: isLoadingImages } = useServerImages();
  const uploadImages = useUploadImages();
  const analyzeImage = useAnalyzeImage();
  const saveAnalysis = useSaveAnalysis();
  const deleteImage = useDeleteImage();

  // Store state and actions
  const {
    isMobile,
    showQR,
    error,
    analysisModal,
    setIsMobile,
    setShowQR,
    setError,
    openAnalysisModal,
    closeAnalysisModal,
    setAnalysisPrompt,
    setAnalysisResult,
    setAnalysisLoading,
  } = useImageStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const cameraFileInputRef = useRef<HTMLInputElement>(null);

  // Track upload loading state
  const isUploading = uploadImages.isPending;
  const [uploadingFileCount, setUploadingFileCount] = useState(0);

  // Enlarge modal state
  const [enlargeModal, setEnlargeModal] = useState<{
  isOpen: boolean;
  image: ServerImage | null;
  }>({ isOpen: false, image: null });

  // Mobile native capture multi-step state
  const [mobileStep, setMobileStep] = useState<'collect' | 'review'>('collect');
  type QueuedItem = { id: string; file: File; previewUrl: string };
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);

  // Maintain preview URLs for queued files
  // Cleanup previews on unmount
  useEffect(() => () => {
    queuedItems.forEach(item => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
  }, [queuedItems]);

  // QR code URL for mobile uploads (same page with mobile detection)
  const qrCodeUrl = typeof window !== 'undefined' ? `${window.location.origin}/image` : '';

  // Live refresh via Ably images_uploaded
  const queryClientRef = useRef(useQueryClient());
  useSimpleAbly({
    userId: userId ?? null,
    isMobile: false,
    onMobileImagesUploaded: () => {
      try { queryClientRef.current.invalidateQueries({ queryKey: imageQueryKeys.list(userId || '') }); } catch {}
    },
  });

  // Detect mobile on mount
  useEffect(() => {
    const detectMobile = () => {
      const isMobileDevice = window.innerWidth < 768 && 'ontouchstart' in window;
      setIsMobile(isMobileDevice);
    };

    detectMobile();
    window.addEventListener('resize', detectMobile);

    return () => window.removeEventListener('resize', detectMobile);
  }, [setIsMobile]);

  // Handle query errors
  useEffect(() => {
    if (uploadImages.error) {
      setError(uploadImages.error instanceof Error ? uploadImages.error.message : 'Failed to upload files');
    } else if (analyzeImage.error) {
      setError(analyzeImage.error instanceof Error ? analyzeImage.error.message : 'Failed to analyze image');
    }
  }, [uploadImages.error, analyzeImage.error, setError]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setError('');
    const fileArray = Array.from(files);

    // Mobile: queue files for review; Desktop: upload immediately
    if (isMobile) {
      setQueuedItems(prev => [
        ...prev,
        ...fileArray.map(f => ({
          id: Math.random().toString(36).slice(2),
          file: f,
          previewUrl: URL.createObjectURL(f),
        })),
      ]);
      setMobileStep('review');
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    // Desktop immediate upload
    setUploadingFileCount(fileArray.length);
    try {
      await uploadImages.mutateAsync(fileArray);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingFileCount(0);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Analysis functions (using store actions)
  const handleOpenAnalysis = (image: ServerImage) => {
    openAnalysisModal(image);
  };

  const handleCloseAnalysis = () => {
    closeAnalysisModal();
  };

  const handleSetAnalysisPrompt = useCallback((prompt: string) => {
    setAnalysisPrompt(prompt);
  }, [setAnalysisPrompt]);

  const handleDeleteImage = async (imageKey: string) => {
    try {
      await deleteImage.mutateAsync(imageKey);
      // Success handled by the mutation's onSuccess callback
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete image');
    }
  };

  // Enlarge modal handlers
  const handleOpenEnlarge = (image: ServerImage) => {
    setEnlargeModal({ isOpen: true, image });
  };

  const handleCloseEnlarge = () => {
    setEnlargeModal({ isOpen: false, image: null });
  };

  // Download image handler
  const handleDownloadImage = useCallback(async (image: ServerImage) => {
    try {
      // Get the image URL (this will be a presigned S3 URL)
      const urlResponse = await fetch(`/api/uploads/download?key=${encodeURIComponent(image.key)}`, {
            headers: createAuthHeaders(userId, userTier),
          });

      if (!urlResponse.ok) {
        throw new Error('Failed to get download URL');
      }

      const { downloadUrl } = await urlResponse.json();

      // Fetch the image as blob to force download
      const imageResponse = await fetch(downloadUrl);

      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image for download');
      }

      const blob = await imageResponse.blob();

      // Create blob URL and download link
      const blobUrl = URL.createObjectURL(blob);
      const filename = `clinical-image-${image.filename}`;

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      setError(error instanceof Error ? error.message : 'Failed to download image');
    }
  }, [userId, userTier, setError]);

  // Analyze image with Claude (using mutation and store)
  const handleAnalyzeImage = async () => {
    if (!analysisModal.image) {
      return;
    }

    try {
      setAnalysisLoading(true);
    setError('');

      const result = await analyzeImage.mutateAsync({
          imageKey: analysisModal.image.key,
          imageId: analysisModal.image.id,
          prompt: analysisModal.prompt || undefined,
        sessionId: analysisModal.image.sessionId || 'standalone',
        thumbnailUrl: analysisModal.image.thumbnailUrl, // Use existing thumbnailUrl for performance
        onProgress: (analysis: string) => {
          setAnalysisResult(analysis);
        },
      });

      setAnalysisResult(result);

      // Auto-save the analysis result
      if (result && analysisModal.image) {
        try {
          await saveAnalysis.mutateAsync({
            imageKey: analysisModal.image.key,
            prompt: analysisModal.prompt || undefined,
            result,
            modelUsed: 'claude-3-5-sonnet-20241022',
            sessionId: analysisModal.image.sessionId,
          });
        } catch (saveError) {
          console.error('Failed to auto-save analysis:', saveError);
          // Don't throw - analysis was successful, just save failed
          setError('Analysis completed but failed to save automatically');
        }
      }
    } catch (err) {
      // Error handling is done via useEffect watching mutation errors
      console.error('Analysis error:', err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  // Native camera capture is handled via file inputs on mobile

  // Authentication check for all users
  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access clinical image analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => window.location.href = '/auth/login'}
              size="lg"
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Removed WebRTC camera/review interfaces

  // Mobile main interface
  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 p-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Clinical Images</h1>
          <p className="text-slate-600">Capture and upload clinical images</p>
        </div>

        {mobileStep === 'collect' && (
          <div className="flex-1 space-y-4">
            <Button
              onClick={() => cameraFileInputRef.current?.click()}
              size="lg"
              className="w-full"
              type="button"
            >
              <Camera className="mr-2 size-5" />
              Capture with camera
            </Button>

            {isFeatureEnabled('MOBILE_GALLERY_UPLOADS') && (
              <Button
                onClick={() => galleryFileInputRef.current?.click()}
                size="lg"
                variant="outline"
                className="w-full"
                type="button"
              >
                <Upload className="mr-2 size-5" />
                Upload from gallery
              </Button>
            )}

            {queuedItems.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-600">
                    {queuedItems.length}
{' '}
photo
{queuedItems.length === 1 ? '' : 's'}
{' '}
selected
                  </p>
                  <Button
                    onClick={() => setMobileStep('review')}
                    variant="outline"
                    className="mt-2 w-full"
                  >
                    Review & upload
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {mobileStep === 'review' && (
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {queuedItems.map(item => (
                <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg border">
                  {item.previewUrl
                    ? <img src={item.previewUrl} alt={item.file.name} className="size-full object-cover" />
                    : <div className="flex size-full items-center justify-center text-xs text-slate-500">Loading...</div>}
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(item.previewUrl);
                      setQueuedItems(prev => prev.filter(it => it.id !== item.id));
                    }}
                    className="absolute right-2 top-2 rounded bg-white/80 px-2 py-1 text-xs text-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => cameraFileInputRef.current?.click()} variant="outline" className="flex-1">Take more</Button>
              {isFeatureEnabled('MOBILE_GALLERY_UPLOADS') && (
                <Button onClick={() => galleryFileInputRef.current?.click()} variant="outline" className="flex-1">From gallery</Button>
              )}
              <Button
                onClick={() => {
                // Cancel: clear queue and return to collect
                queuedItems.forEach(it => it.previewUrl && URL.revokeObjectURL(it.previewUrl));
                setQueuedItems([]);
                setMobileStep('collect');
              }}
                variant="ghost"
                className="flex-1"
              >
Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={queuedItems.length === 0 || isUploading}
                onClick={async () => {
                  const filesToUpload = queuedItems.map(it => it.file);
                  setUploadingFileCount(filesToUpload.length);
                  try {
                    await uploadImages.mutateAsync(filesToUpload);
                    // Clear queue and return
                    queuedItems.forEach(it => it.previewUrl && URL.revokeObjectURL(it.previewUrl));
                    setQueuedItems([]);
                    setMobileStep('collect');
                  } catch (err) {
                    console.error('Upload failed:', err);
                  } finally {
                    setUploadingFileCount(0);
                  }
                }}
              >
                {isUploading ? 'Uploading...' : `Upload ${queuedItems.length} photo${queuedItems.length === 1 ? '' : 's'}`}
              </Button>
            </div>
          </div>
        )}

        {/* Hidden File Inputs for Mobile */}
        <input
          type="file"
          ref={cameraFileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
        />
        {isFeatureEnabled('MOBILE_GALLERY_UPLOADS') && (
          <input
            type="file"
            ref={galleryFileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*"
            className="hidden"
          />
        )}
      </div>
    );
  }

  // Desktop interface
  return (
    <Container size="fluid" className="h-full">
      <div className="flex h-full gap-6 py-6">
        {/* Analysis Panel - Now on Left */}
        <div className="w-80">
          <Card className="h-full">
            <CardHeader>
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
                  <Camera className="size-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Clinical Images
                  </CardTitle>
                  <CardDescription>
                    AI-powered clinical image analysis and documentation
                  </CardDescription>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading
                    ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          {uploadingFileCount > 1
                            ? `Uploading ${uploadingFileCount} images...`
                            : 'Uploading...'}
                        </>
                      )
                    : (
                        <>
                          <Upload className="mr-2 size-4" />
                          Upload Images
                        </>
                      )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQR(!showQR)}
                  className="w-full"
                >
                  <QrCode className="mr-2 size-4" />
                  Mobile Upload
                </Button>
              </div>

              {/* Mobile QR Code */}
              {showQR && (
                <div className="mt-4 border-t pt-4">
                  <div className="mb-3">
                    <h4 className="mb-1 text-sm font-medium text-slate-700">Mobile Upload</h4>
                    <p className="text-xs text-slate-600">
                      Scan with your mobile device
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <QRCodeSVG
                      value={qrCodeUrl}
                      size={160}
                      className="rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Upload images to get started with AI-powered clinical analysis.
                You can select multiple images at once using Ctrl/Cmd+click.
                Click on any image in the right panel to analyze it with Claude.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Images Panel - Now on Right */}
        <div className="flex-1">
          <Card className="h-full">
            <CardContent className="h-full overflow-y-auto p-6">
              {error && (
                <div className="mb-4 flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-red-600">
                  <AlertCircle className="size-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {isLoadingImages
                ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <div key={idx} className="animate-pulse">
                          <div className="aspect-square rounded-lg bg-slate-200" />
                          <div className="mt-2 h-3 w-3/4 rounded bg-slate-200" />
                        </div>
                      ))}
                    </div>
                  )
                : serverImages.length === 0
                  ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100">
                            <ImageIcon className="size-8 text-slate-400" />
                          </div>
                          <h3 className="mb-2 text-lg font-semibold text-slate-900">
                            No images found
                          </h3>
                          <p className="mb-4 text-slate-600">
                            Upload clinical images to get started with AI analysis.
                            Select multiple files at once for batch upload.
                          </p>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            <Upload className="mr-2 size-4" />
                            Upload Images
                          </Button>
                        </div>
                      </div>
                    )
                  : (
                      <ImageSectionsGrid
                        images={serverImages}
                        onAnalyze={handleOpenAnalysis}
                        onEnlarge={handleOpenEnlarge}
                        onDownload={handleDownloadImage}
                        onDelete={handleDeleteImage}
                        formatFileSize={formatFileSize}
                      />
                    )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analysis Modal */}
      {analysisModal.isOpen && (
        <AnalysisModal
          modal={analysisModal}
          onClose={handleCloseAnalysis}
          onSetPrompt={handleSetAnalysisPrompt}
          onAnalyze={handleAnalyzeImage}
          onEnlarge={() => analysisModal.image && handleOpenEnlarge(analysisModal.image)}
          onDownload={() => analysisModal.image && handleDownloadImage(analysisModal.image)}
          onDelete={handleDeleteImage}
        />
      )}

      {/* Image Enlarge Modal */}
      {enlargeModal.isOpen && enlargeModal.image && (
        <ImageEnlargeModal
          image={enlargeModal.image}
          onClose={handleCloseEnlarge}
        />
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*"
        className="hidden"
      />
    </Container>
  );
}

// Server Image Card Component
function ServerImageCard({
  image,
  onAnalyze,
  onEnlarge,
  onDownload,
  onDelete,
  formatFileSize,
}: {
  image: ServerImage;
  onAnalyze: () => void;
  onEnlarge: () => void;
  onDownload: () => void;
  onDelete: (imageKey: string) => void;
  formatFileSize: (bytes: number) => string;
}) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  // Use thumbnail URL directly from image object (performance optimization)
  const imageUrl = image.thumbnailUrl;
  const isLoadingUrl = !imageUrl; // Only loading if no URL provided

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent opening modal
    if (isDeleting) { return; }
    setIsDeleting(true);
    onDelete(image.key);
  };

  const handleEnlarge = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent opening analysis modal
    onEnlarge();
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent opening analysis modal
    onDownload();
  };

  return (
    <Card className={`group cursor-pointer overflow-hidden transition-all hover:scale-105 hover:shadow-lg ${isDeleting ? 'opacity-50' : ''}`} onClick={onAnalyze}>
      <div className="relative aspect-square">
        <div className="flex size-full items-center justify-center bg-slate-100">
        {isLoadingUrl
? (
              <Loader2 className="size-6 animate-spin text-slate-400" />
        )
: imageUrl
? (
          <img
            src={imageUrl}
            alt={image.filename}
            className="size-full object-cover"
          />
        )
: (
                <ImageIcon className="size-6 text-slate-400" />
        )}
          {isDeleting && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="size-6 animate-spin text-slate-500" />
            </div>
          )}
        </div>

        {/* Top-right badges */}
        <div className="absolute right-2 top-2 z-10 flex gap-1">
          {/* Analysis Status Badge */}
          {image.analysis && (
            <div className="rounded-full bg-green-500 p-1">
              <FileText className="size-3 text-white" />
            </div>
          )}

          {/* Enlarge Button */}
          <button
            type="button"
            onClick={handleEnlarge}
            className="rounded-full bg-blue-500 p-1 opacity-0 transition-opacity hover:bg-blue-600 group-hover:opacity-100"
            title="Enlarge image"
          >
            <Expand className="size-3 text-white" />
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full bg-slate-500 p-1 opacity-0 transition-opacity hover:bg-slate-600 group-hover:opacity-100"
            title="Download image"
          >
            <Download className="size-3 text-white" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full bg-red-500 p-1 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
            title="Delete image"
          >
            <Trash2 className="size-3 text-white" />
          </button>
        </div>

        {/* Hover Overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100">
          <div className="rounded-lg bg-white/90 px-3 py-1 text-xs font-medium text-slate-700">
            {image.analysis ? 'View Analysis' : 'Analyze Image'}
          </div>
        </div>
      </div>

      <CardContent className="p-2">
        <div className="mb-1">
          <h4 className="truncate text-xs font-medium text-slate-900">
            {image.filename}
          </h4>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="capitalize">{image.source}</span>
            <span>{formatFileSize(image.size)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Analysis Modal Component
function AnalysisModal({
  modal,
  onClose,
  onSetPrompt,
  onAnalyze,
  onEnlarge,
  onDownload,
  onDelete,
}: {
  modal: AnalysisModalState;
  onClose: () => void;
  onSetPrompt: (prompt: string) => void;
  onAnalyze: () => void;
  onEnlarge: () => void;
  onDownload: () => void;
  onDelete: (imageKey: string) => void;
}) {
  // Use thumbnail URL directly from image object (performance optimization)
  const imageUrl = modal.image?.thumbnailUrl;
  const isLoadingUrl = !imageUrl; // Only loading if no URL provided

  const handleDeleteFromModal = () => {
    if (!modal.image) {
      return;
    }

    onDelete(modal.image.key);
    onClose(); // Close modal after initiating delete
  };

  // Load existing analysis context if available - run once per image
  useEffect(() => {
    if (modal.image?.analysis && !modal.analysis && modal.image.analysis.prompt) {
      // Pre-populate with existing clinical context if available
      onSetPrompt(modal.image.analysis.prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.image?.key, modal.isOpen]); // Only depend on image key and modal open state

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Left Panel - Compact Image */}
        <div className="flex w-80 items-center justify-center bg-slate-50 p-4">
          <div className="group relative max-w-full">
          {isLoadingUrl
? (
                  <div className="flex size-64 items-center justify-center rounded-lg bg-slate-100">
                    <Loader2 className="size-8 animate-spin text-slate-400" />
                  </div>
          )
: imageUrl
? (
            <>
            <img
              src={imageUrl}
              alt={modal.image?.filename || 'Image'}
              className="max-h-80 max-w-full rounded-lg object-contain shadow-lg"
            />
              {/* Action Buttons Overlay */}
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  type="button"
                  onClick={onEnlarge}
                  className="rounded-full bg-blue-500 p-2 transition-colors hover:bg-blue-600"
                  title="Enlarge image"
                >
                  <Expand className="size-4 text-white" />
                </button>
                <button
                  type="button"
                  onClick={onDownload}
                  className="rounded-full bg-slate-500 p-2 transition-colors hover:bg-slate-600"
                  title="Download image"
                >
                  <Download className="size-4 text-white" />
                </button>
              </div>
            </>
          )
: (
                    <div className="flex size-64 flex-col items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <ImageIcon className="mb-2 size-8" />
                      <p className="text-sm">Failed to load image</p>
                    </div>
          )}
          </div>
        </div>

        {/* Right Panel - Analysis */}
        <div className="flex flex-1 flex-col border-l bg-white">
          {/* Header */}
          <div className="border-b p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">AI Analysis</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteFromModal}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">{modal.image?.filename}</p>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="capitalize">
                {modal.image?.source}
{' '}
                  upload
                </span>
                <span>•</span>
                <span>
{modal.image && new Date(modal.image.uploadedAt).toLocaleDateString()}
                </span>
                {modal.image?.analysis && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="size-3" />
                      <span>Previously analyzed</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col space-y-4 p-4">
            {/* Clinical Context Input */}
            <div>
              <label htmlFor="clinical-context" className="mb-2 block text-sm font-medium text-slate-700">
                Clinical Context
              </label>
              <textarea
                id="clinical-context"
                value={modal.prompt}
                onChange={e => onSetPrompt(e.target.value)}
                placeholder="Add clinical context: anatomical site (e.g., left forearm), your observations, relevant history, or any specific details that may help with analysis..."
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
              <p className="mt-1 text-xs text-slate-500">
                Optional: Provide additional context to help Claude analyze this image more accurately
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
            <Button
              onClick={onAnalyze}
              disabled={modal.isAnalysing}
              className="flex-1"
            >
              {modal.isAnalysing
? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                        Analyzing...
                </>
              )
: (
                <>
                  <FileText className="mr-2 size-4" />
                        Analyze
                </>
              )}
            </Button>
            </div>

            {/* Analysis Results */}
            {(modal.analysis || modal.image?.analysis) && (
              <div className="flex-1 border-t pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700">
                  Analysis Results
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {modal.analysis && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="size-3" />
                        <span>Auto-saved</span>
                      </div>
                    )}
                    <span>
                      {modal.analysis?.split(' ').length || modal.image?.analysis?.result.split(' ').length}
                      {' '}
                      words
                    </span>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto rounded-lg border bg-slate-50 p-4">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {modal.analysis || modal.image?.analysis?.result}
                  </div>

                  {/* Show saved analysis metadata */}
                  {modal.image?.analysis && !modal.analysis && (
                    <div className="mt-4 border-t pt-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Check className="size-3 text-green-600" />
                        <span>
                          Analyzed
                          {' '}
                          {new Date(modal.image.analysis.analyzedAt).toLocaleString()}
                        </span>
                      </div>
                      {modal.image.analysis.prompt && (
                        <div className="mt-1">
                          <span className="font-medium">Clinical context used:</span>
                          {' '}
                          {modal.image.analysis.prompt}
                        </div>
            )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Image Enlarge Modal Component
function ImageEnlargeModal({
  image,
  onClose,
}: {
  image: ServerImage;
  onClose: () => void;
}) {
  // Use thumbnail URL directly from image object (performance optimization)
  const imageUrl = image.thumbnailUrl;
  const isLoadingUrl = !imageUrl; // Only loading if no URL provided

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Close modal"
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="fixed right-4 top-4 z-10 text-white hover:bg-white/20"
      >
        <X className="size-6" />
      </Button>

      {/* Image Container */}
      <div className="max-h-full max-w-full">
        {isLoadingUrl
? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-12 animate-spin text-white" />
          </div>
        )
: imageUrl
? (
          <img
            src={imageUrl}
            alt={image.filename}
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
          />
        )
: (
          <div className="flex flex-col items-center justify-center p-8 text-white">
            <ImageIcon className="mb-4 size-12" />
            <p>Failed to load image</p>
          </div>
        )}
      </div>

      {/* Image Info */}
      <div className="fixed bottom-4 left-4 rounded-lg bg-black/60 px-3 py-2 text-white">
        <p className="text-sm font-medium">{image.filename}</p>
        <p className="text-xs opacity-75">
          {new Date(image.uploadedAt).toLocaleDateString()}
{' '}
•
{' '}
          {(() => {
            const bytes = image.size;
            if (bytes === 0) {
 return '0 Bytes';
}
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
          })()}
        </p>
      </div>
    </div>
  );
}

// Grouped sections by sessionId for clinical-images and legacy consultations
function ImageSectionsGrid({
  images,
  onAnalyze,
  onEnlarge,
  onDownload,
  onDelete,
  formatFileSize,
}: {
  images: ServerImage[];
  onAnalyze: (img: ServerImage) => void;
  onEnlarge: (img: ServerImage) => void;
  onDownload: (img: ServerImage) => void;
  onDelete: (imageKey: string) => void;
  formatFileSize: (bytes: number) => string;
}) {
  // Partition images
  const clinical = images.filter(i => i.source === 'clinical');
  const noSession = clinical.filter(i => !i.sessionId);
  const bySession = clinical.filter(i => i.sessionId).reduce<Record<string, ServerImage[]>>((acc, img) => {
    const key = img.sessionId as string;
    if (!acc[key]) { acc[key] = []; }
    acc[key].push(img);
    return acc;
  }, {});
  const legacyConsultations = images.filter(i => i.source === 'consultation');

  const Section = ({ title, items }: { title: string; items: ServerImage[] }) => (
    items.length === 0 ? null : (
      <div className="mb-6">
        <div className="mb-2 text-sm font-semibold text-slate-700">{title}</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map(image => (
            <ServerImageCard
              key={image.id}
              image={image}
              onAnalyze={() => onAnalyze(image)}
              onEnlarge={() => onEnlarge(image)}
              onDownload={() => onDownload(image)}
              onDelete={onDelete}
              formatFileSize={formatFileSize}
            />
          ))}
        </div>
      </div>
    )
  );

  const sessionKeys = Object.keys(bySession);
  const firstSessionId = sessionKeys.length > 0 ? sessionKeys[0] : null;
  const restSessionIds = sessionKeys.slice(1);

  return (
    <div className="space-y-6">
      {firstSessionId && (
        <Section title="This session" items={bySession[firstSessionId] ?? []} />
      )}
      {restSessionIds.map((sid) => (
        <Section key={sid} title={`Other session ${sid}`} items={bySession[sid] ?? []} />
      ))}
      <Section title="No session" items={noSession} />
      <Section title="Legacy consultations" items={legacyConsultations} />
    </div>
  );
}

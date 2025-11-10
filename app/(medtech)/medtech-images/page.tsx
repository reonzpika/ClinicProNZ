'use client';

/**
 * Medtech Images Widget - Desktop Page
 *
 * Main entry point for the widget (embedded in Medtech or standalone)
 *
 * URL: /medtech-images?encounterId=enc-123&patientId=pat-456&...
 */

import { AlertCircle, Check, Inbox, ListTodo, Loader2, Upload } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { CapturePanel } from '@/src/medtech/images-widget/components/desktop/CapturePanel';
import { CommitDialog } from '@/src/medtech/images-widget/components/desktop/CommitDialog';
import { ErrorModal } from '@/src/medtech/images-widget/components/desktop/ErrorModal';
import { ImageEditModal } from '@/src/medtech/images-widget/components/desktop/ImageEditModal';
import { ImagePreview } from '@/src/medtech/images-widget/components/desktop/ImagePreview';
import { MetadataForm } from '@/src/medtech/images-widget/components/desktop/MetadataForm';
import { PartialFailureDialog } from '@/src/medtech/images-widget/components/desktop/PartialFailureDialog';
import { QRPanel } from '@/src/medtech/images-widget/components/desktop/QRPanel';
import { ThumbnailStrip } from '@/src/medtech/images-widget/components/desktop/ThumbnailStrip';
import { useCapabilities } from '@/src/medtech/images-widget/hooks/useCapabilities';
import { useCommit } from '@/src/medtech/images-widget/hooks/useCommit';
import { useImageCompression } from '@/src/medtech/images-widget/hooks/useImageCompression';
import { useImageWidgetStore } from '@/src/medtech/images-widget/stores/imageWidgetStore';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

// Force dynamic rendering (required for useSearchParams)
export const dynamic = 'force-dynamic';

function MedtechImagesPageContent() {
  const searchParams = useSearchParams();

  // All hooks MUST be declared before any conditional returns
  const [showQR, setShowQR] = useState(false);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [inboxEnabled, setInboxEnabled] = useState(false);
  const [taskEnabled, setTaskEnabled] = useState(false);
  const [errorImageId, setErrorImageId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [partialFailureData, setPartialFailureData] = useState<{
    successIds: string[];
    errorIds: string[];
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const commitMutation = useCommit();

  const {
    encounterContext,
    setEncounterContext,
    sessionImages,
    isCommitDialogOpen,
    setCommitDialogOpen,
    error,
    setError,
    addImage,
    capabilities,
  } = useImageWidgetStore();

  const { data: capabilitiesData, isLoading: isLoadingCapabilities } = useCapabilities();
  const { compressImages, isCompressing } = useImageCompression();

  // Parse encounter context from URL params
  useEffect(() => {
    const encounterId = searchParams.get('encounterId');
    const patientId = searchParams.get('patientId');
    const patientName = searchParams.get('patientName');
    const patientNHI = searchParams.get('patientNHI');
    const facilityId = searchParams.get('facilityId') || 'F2N060-E'; // Default to UAT facility
    const providerId = searchParams.get('providerId');
    const providerName = searchParams.get('providerName');

    if (encounterId && patientId) {
      setEncounterContext({
        encounterId,
        patientId,
        patientName: patientName || undefined,
        patientNHI: patientNHI || undefined,
        facilityId,
        providerId: providerId || undefined,
        providerName: providerName || undefined,
      });
    } else {
      // For demo/testing, use mock context
      setEncounterContext({
        encounterId: 'mock-encounter-123',
        patientId: 'mock-patient-456',
        patientName: 'John Smith',
        patientNHI: 'ABC1234',
        facilityId: 'F2N060-E',
        providerId: 'mock-provider-789',
        providerName: 'Dr Mock',
      });
    }
  }, [searchParams, setEncounterContext]);

  // Auto-select first image when images added
  useEffect(() => {
    if (sessionImages.length > 0 && !currentImageId) {
      const firstImage = sessionImages[0];
      if (firstImage) {
        setCurrentImageId(firstImage.id);
      }
    }
  }, [sessionImages.length, currentImageId]);

  // Global drag and drop handlers
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isCompressing && capabilitiesData) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only hide if we're leaving the window
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (isCompressing || !capabilitiesData) {
        return;
      }

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const fileArray = Array.from(files);
        const limits = capabilitiesData.limits.attachments;

        // Validate file types
        const invalidFiles = fileArray.filter(
          file => !limits.acceptedTypes.some((type) => {
            if (type.endsWith('/*')) {
              return file.type.startsWith(type.replace('/*', ''));
            }
            return file.type === type;
          }),
        );

        if (invalidFiles.length > 0) {
          setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`);
          return;
        }

        // Validate count
        if (fileArray.length > limits.maxPerRequest) {
          setError(`Maximum ${limits.maxPerRequest} images per upload`);
          return;
        }

        try {
          // Compress images
          const compressed = await compressImages(fileArray, {
            maxSizeBytes: limits.maxSizeBytes,
          });

          // Add to store
          compressed.forEach((result) => {
            addImage({
              id: result.id,
              file: result.compressedFile,
              preview: result.preview,
              thumbnail: result.thumbnail,
              metadata: {},
              status: 'pending',
            });
          });

          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to process images');
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [isCompressing, capabilitiesData, compressImages, addImage, setError]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement
        || e.target instanceof HTMLTextAreaElement
        || e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && hasPrevious) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault();
        handleNext();
      }

      // Enter to commit
      if (e.key === 'Enter' && canCommit && !commitMutation.isPending) {
        e.preventDefault();
        handleCommit();
      }

      // Esc to close modals
      if (e.key === 'Escape') {
        if (isCommitDialogOpen) {
          setCommitDialogOpen(false);
        }
        if (isEditModalOpen) {
          setIsEditModalOpen(false);
        }
        if (errorImageId !== null) {
          setErrorImageId(null);
        }
        if (partialFailureData !== null) {
          setPartialFailureData(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    hasPrevious,
    hasNext,
    canCommit,
    commitMutation.isPending,
    isCommitDialogOpen,
    isEditModalOpen,
    errorImageId,
    partialFailureData,
    handlePrevious,
    handleNext,
    handleCommit,
    setCommitDialogOpen,
  ]);

  // Computed values
  const currentImage = currentImageId
    ? sessionImages.find(img => img.id === currentImageId) || null
    : sessionImages[0] || null;

  // All uncommitted images
  const uncommittedImages = sessionImages.filter(img => img.status !== 'committed');

  // Invalid images (missing required metadata)
  const invalidImages = uncommittedImages.filter(
    img => !img.metadata.laterality || !img.metadata.bodySite,
  );

  const hasInvalidImages = invalidImages.length > 0;
  const canCommit = uncommittedImages.length > 0 && !hasInvalidImages;

  const currentIndex = sessionImages.findIndex(img => img.id === currentImageId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sessionImages.length - 1;

  // Navigation handlers
  const handlePrevious = () => {
    if (hasPrevious) {
      const prevImage = sessionImages[currentIndex - 1];
      if (prevImage) {
        setCurrentImageId(prevImage.id);
      }
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextImage = sessionImages[currentIndex + 1];
      if (nextImage) {
        setCurrentImageId(nextImage.id);
      }
    }
  };

  // Commit handler
  const handleCommit = () => {
    // If inbox or task enabled, show modal for details first
    if (inboxEnabled || taskEnabled) {
      setCommitDialogOpen(true);
    } else {
      // Direct commit
      startCommit();
    }
  };

  const handleModalClose = () => {
    setCommitDialogOpen(false);
    // Auto-commit after modal closes (inbox/task details saved)
    if (inboxEnabled || taskEnabled) {
      startCommit();
    }
  };

  const startCommit = async () => {
    const imageIds = uncommittedImages.map(img => img.id);

    try {
      const result = await commitMutation.mutateAsync(imageIds);

      // Show partial failure dialog if there are any errors (partial or complete failure)
      if (result.errorIds.length > 0) {
        setPartialFailureData({
          successIds: result.successIds,
          errorIds: result.errorIds,
        });
      }
      // If all succeeded, no dialog needed - images are marked as committed
    } catch (err) {
      // All images failed (network error, etc.)
      setPartialFailureData({
        successIds: [],
        errorIds: imageIds,
      });
    }
  };

  // Conditional returns AFTER all hooks
  // Loading state
  if (isLoadingCapabilities || !capabilitiesData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-12 animate-spin text-purple-500" />
          <p className="text-slate-600">Loading Medtech Images Widget...</p>
        </div>
      </div>
    );
  }

  // No encounter context
  if (!encounterContext) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" />
              No Encounter Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              This widget must be launched from within Medtech Evolution with an active encounter context.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              For testing, navigate to:
{' '}
              <code className="rounded bg-slate-100 px-1">/medtech-images?encounterId=test&patientId=test</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={dropZoneRef}
      className={`relative flex h-screen flex-col bg-slate-50 ${isDragging ? 'bg-purple-50' : ''}`}
    >
      {/* Global Drag Overlay */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-purple-500/10 backdrop-blur-sm">
          <div className="rounded-lg border-2 border-dashed border-purple-500 bg-white px-12 py-8 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <Upload className="size-12 text-purple-600" />
              <p className="text-lg font-semibold text-purple-900">Drop images here to upload</p>
              <p className="text-sm text-purple-700">Release to add images to this encounter</p>
            </div>
          </div>
        </div>
      )}
      {/* Patient/Encounter Context Header */}
      {encounterContext && (
        <div className="border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs font-medium text-slate-600">Patient</p>
                <p className="text-sm font-semibold text-slate-900">
                  {encounterContext.patientName || 'Unknown'}
                  {encounterContext.patientNHI && (
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      (NHI: {encounterContext.patientNHI})
                    </span>
                  )}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-300" />
              <div>
                <p className="text-xs font-medium text-slate-600">Encounter</p>
                <p className="text-sm font-semibold text-slate-900">
                  {encounterContext.encounterId}
                </p>
              </div>
              {encounterContext.providerName && (
                <>
                  <div className="h-8 w-px bg-slate-300" />
                  <div>
                    <p className="text-xs font-medium text-slate-600">Provider</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {encounterContext.providerName}
                    </p>
                  </div>
                </>
              )}
            </div>
            {process.env.NEXT_PUBLIC_MEDTECH_USE_MOCK === 'true' && (
              <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                MOCK MODE
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Section: Actions + Thumbnails + Commit Actions */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Upload + QR (Stacked) */}
          <div className="flex flex-col gap-2">
            <CapturePanel />
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="ghost"
              size="sm"
              className="w-fit"
            >
              {showQR ? 'Hide QR' : 'Show QR'}
            </Button>
          </div>

          {/* Center: Thumbnail Strip */}
          <div className="flex-1 overflow-x-auto">
            <ThumbnailStrip
              currentImageId={currentImageId}
              onImageSelect={setCurrentImageId}
              onErrorClick={setErrorImageId}
            />
          </div>

          {/* Right: Inbox + Task + Commit (Same Line) */}
          <div className="ml-4 flex items-center gap-3">
            {/* Inbox Checkbox */}
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                checked={inboxEnabled}
                onChange={e => setInboxEnabled(e.target.checked)}
                className="size-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <Inbox className={`size-4 ${inboxEnabled ? 'text-purple-600' : 'text-slate-600'}`} />
              <span className={`font-medium ${inboxEnabled ? 'text-purple-700' : 'text-slate-700'}`}>
                Inbox
              </span>
            </label>

            {/* Task Checkbox */}
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                checked={taskEnabled}
                onChange={e => setTaskEnabled(e.target.checked)}
                className="size-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <ListTodo className={`size-4 ${taskEnabled ? 'text-purple-600' : 'text-slate-600'}`} />
              <span className={`font-medium ${taskEnabled ? 'text-purple-700' : 'text-slate-700'}`}>
                Task
              </span>
            </label>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-300" />

            {/* Commit Button */}
            <Button
              onClick={handleCommit}
              disabled={!canCommit || commitMutation.isPending}
              size="sm"
              className="min-w-[140px] font-semibold"
            >
              {commitMutation.isPending
? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Committing
{' '}
{uncommittedImages.length}
{' '}
image
{uncommittedImages.length === 1 ? '' : 's'}
...
                </>
              )
: (
                <>
                  <Check className="mr-2 size-4" />
                  Commit All
{' '}
{uncommittedImages.length}
{' '}
Image
{uncommittedImages.length === 1 ? '' : 's'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <AlertCircle className="size-5 shrink-0" />
            <span className="flex-1 font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="rounded-md px-2 py-1 text-red-600 transition-colors hover:bg-red-100 hover:text-red-900"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* QR Panel (Collapsible) */}
      {showQR && (
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <QRPanel />
        </div>
      )}

      {/* Main Content: Image Preview + Metadata */}
      {sessionImages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-purple-100">
              <Upload className="size-10 text-purple-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">No images uploaded yet</h3>
            <p className="mb-6 text-sm text-slate-600">
              Upload images or drag and drop them here to get started
            </p>
            <CapturePanel />
            <p className="mt-4 text-xs text-slate-500">
              Supported formats: JPG, PNG, GIF
              {' • '}
              Maximum file size: {capabilitiesData ? `${(capabilitiesData.limits.attachments.maxSizeBytes / 1024 / 1024).toFixed(0)}MB` : 'N/A'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 gap-6 overflow-hidden p-6">
          {/* Image Preview (30%) */}
          <div className="flex-[3]">
            <ImagePreview
              image={currentImage}
              onEdit={() => setIsEditModalOpen(true)}
            />
          </div>

          {/* Metadata Form (70%) */}
          <div className="flex-[7]">
            <MetadataForm
              image={currentImage}
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
            />
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      {sessionImages.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-2">
          <p className="text-xs text-slate-500">
            <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs shadow-sm">←</kbd>
            {' '}
            <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs shadow-sm">→</kbd>
            {' '}
            Navigate
            {' • '}
            <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs shadow-sm">Enter</kbd>
            {' '}
            Commit
            {' • '}
            <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs shadow-sm">Esc</kbd>
            {' '}
            Close modals
          </p>
        </div>
      )}

      {/* Image Edit Modal */}
      <ImageEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        image={currentImage}
        allImages={sessionImages}
        onImageSelect={setCurrentImageId}
      />

      {/* Commit Dialog */}
      <CommitDialog
        isOpen={isCommitDialogOpen}
        onClose={handleModalClose}
        inboxEnabled={inboxEnabled}
        taskEnabled={taskEnabled}
        uncommittedCount={uncommittedImages.length}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorImageId !== null}
        onClose={() => setErrorImageId(null)}
        image={errorImageId ? sessionImages.find(img => img.id === errorImageId) || null : null}
      />

      {/* Partial Failure Dialog */}
      <PartialFailureDialog
        isOpen={partialFailureData !== null}
        onClose={() => setPartialFailureData(null)}
        successIds={partialFailureData?.successIds || []}
        errorIds={partialFailureData?.errorIds || []}
        onRetryFailed={() => {
          // Retry will close dialog and retry in the dialog itself
        }}
        onViewErrorDetails={(imageId) => {
          setErrorImageId(imageId);
        }}
      />
    </div>
  );
}

export default function MedtechImagesPage() {
  return (
    <Suspense
      fallback={(
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 size-12 animate-spin text-purple-500" />
            <p className="text-slate-600">Loading Medtech Images Widget...</p>
          </div>
        </div>
      )}
    >
      <MedtechImagesPageContent />
    </Suspense>
  );
}

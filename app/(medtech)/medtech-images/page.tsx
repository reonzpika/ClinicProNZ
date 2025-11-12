'use client';

/**
 * Medtech Images Widget - Desktop Page
 *
 * Main entry point for the widget (embedded in Medtech or standalone)
 *
 * URL: /medtech-images?encounterId=enc-123&patientId=pat-456&...
 */

import { AlertCircle, Check, Inbox, ListTodo, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

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
import { useMobileSessionWebSocket } from '@/src/medtech/images-widget/hooks/useMobileSessionWebSocket';
import { useQRSession } from '@/src/medtech/images-widget/hooks/useQRSession';
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

  const commitMutation = useCommit();

  const {
    encounterContext,
    setEncounterContext,
    sessionImages,
    isCommitDialogOpen,
    setCommitDialogOpen,
    error,
    setError,
  } = useImageWidgetStore();

  const { data: capabilities, isLoading: isLoadingCapabilities } = useCapabilities();
  const { token: qrToken } = useQRSession();
  useMobileSessionWebSocket(qrToken);

  // Connect WebSocket when QR token is available
  useEffect(() => {
    if (qrToken) {
      console.log('[Desktop] QR session token available:', qrToken);
      console.log('[Desktop] WebSocket hook should be connecting...');
    } else {
      console.log('[Desktop] No QR token available yet');
    }
  }, [qrToken]);

  // Cleanup session on widget close (beforeunload)
  // Use synchronous XHR for reliable delivery during page unload (async fetch is cancelled)
  // Note: sendBeacon doesn't support DELETE method, so we use synchronous XHR
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (qrToken) {
        // Use synchronous XHR to ensure DELETE request completes before page unloads
        // Synchronous XHR blocks page unload but ensures the request is sent
        const url = `/api/medtech/mobile/session/${qrToken}`;
        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', url, false); // false = synchronous
        try {
          xhr.send();
        } catch {
          // Ignore errors during unload (network errors, etc.)
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [qrToken]);

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
  if (isLoadingCapabilities || !capabilities) {
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
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Top Section: Actions + Thumbnails + Commit Actions */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
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
            {process.env.NEXT_PUBLIC_MEDTECH_USE_MOCK === 'true' && (
              <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                MOCK
              </div>
            )}
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
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inboxEnabled}
                onChange={e => setInboxEnabled(e.target.checked)}
                className="size-4 rounded border-slate-300"
              />
              <Inbox className="size-4 text-slate-600" />
              <span className="text-slate-700">Inbox</span>
            </label>

            {/* Task Checkbox */}
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={taskEnabled}
                onChange={e => setTaskEnabled(e.target.checked)}
                className="size-4 rounded border-slate-300"
              />
              <ListTodo className="size-4 text-slate-600" />
              <span className="text-slate-700">Task</span>
            </label>

            {/* Commit Button */}
            <Button
              onClick={handleCommit}
              disabled={!canCommit || commitMutation.isPending}
              size="sm"
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
        <div className="border-b border-red-200 bg-red-50 px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <AlertCircle className="size-4" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
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

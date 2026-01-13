'use client';

/**
 * Medtech Images Widget - Desktop Page
 *
 * Main entry point for the widget (launched from Medtech Evolution).
 *
 * IMPORTANT:
 * - This page must NOT accept patient identifiers in the URL.
 * - It must be launched via GET /medtech-images/launch?context=...&signature=...
 * - Launch context is handed off via a short-lived, single-use, HttpOnly cookie.
 */

import { AlertCircle, Check, Inbox, ListTodo, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CapturePanel } from '@/src/medtech/images-widget/components/desktop/CapturePanel';
import { CommitDialog } from '@/src/medtech/images-widget/components/desktop/CommitDialog';
import { ErrorModal } from '@/src/medtech/images-widget/components/desktop/ErrorModal';
import { ImageEditModal } from '@/src/medtech/images-widget/components/desktop/ImageEditModal';
import { ImagePreview } from '@/src/medtech/images-widget/components/desktop/ImagePreview';
import { MetadataForm } from '@/src/medtech/images-widget/components/desktop/MetadataForm';
import { PartialFailureDialog } from '@/src/medtech/images-widget/components/desktop/PartialFailureDialog';
import { QRPanel } from '@/src/medtech/images-widget/components/desktop/QRPanel';
import { ThumbnailStrip } from '@/src/medtech/images-widget/components/desktop/ThumbnailStrip';
import { useAblySessionSync } from '@/src/medtech/images-widget/hooks/useAblySessionSync';
import { useCapabilities } from '@/src/medtech/images-widget/hooks/useCapabilities';
import { useCommit } from '@/src/medtech/images-widget/hooks/useCommit';
import { useImageWidgetStore } from '@/src/medtech/images-widget/stores/imageWidgetStore';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

// Force dynamic rendering (launch cookie is per-request)
// eslint-disable-next-line react-refresh/only-export-components
export const dynamic = 'force-dynamic';

type LaunchSessionState =
  { status: 'loading' }
  | { status: 'ready' }
  | { status: 'no-session' }
  | { status: 'no-patient' }
  | { status: 'error'; message: string };

type LaunchSessionResponse =
  {
    success: true;
    context: {
      patientId: string | null;
      facilityId: string;
      providerId?: string | null;
      createdTime?: string | null;
      encounterId: string;
    };
  }
  | {
    success: false;
    error: string;
  };

export default function MedtechImagesPage() {
  // All hooks MUST be declared before any conditional returns
  const [showQR, setShowQR] = useState(false);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [inboxEnabled, setInboxEnabled] = useState(false);
  const [taskEnabled, setTaskEnabled] = useState(false);
  const [errorImageId, setErrorImageId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [launchSession, setLaunchSession] = useState<LaunchSessionState>({ status: 'loading' });
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

  // Load encounter context from single-use launch cookie (no identifiers in URL).
  useEffect(() => {
    let cancelled = false;

    async function loadLaunchSession() {
      setLaunchSession({ status: 'loading' });

      try {
        const resp = await fetch('/api/medtech/launch-session', {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });

        if (resp.status === 404) {
          if (!cancelled) {
            setLaunchSession({ status: 'no-session' });
          }
          return;
        }

        const payload = (await resp.json()) as LaunchSessionResponse;
        if (!resp.ok || !payload.success) {
          const message = payload && payload.success === false
            ? payload.error
            : `Launch session failed (${resp.status})`;
          if (!cancelled) {
            setLaunchSession({ status: 'error', message });
          }
          return;
        }

        const { patientId, facilityId, providerId, encounterId } = payload.context;

        if (typeof facilityId !== 'string' || !facilityId.trim()) {
          if (!cancelled) {
            setLaunchSession({ status: 'error', message: 'Invalid launch session: missing facilityId' });
          }
          return;
        }

        // patientId must exist as a field; it may be null (no patient selected).
        if (patientId === null) {
          if (!cancelled) {
            setLaunchSession({ status: 'no-patient' });
          }
          return;
        }

        setEncounterContext({
          encounterId,
          patientId,
          facilityId: facilityId.trim(),
          providerId: providerId || undefined,
        });

        if (!cancelled) {
          setLaunchSession({ status: 'ready' });
        }
      } catch (err) {
        if (!cancelled) {
          setLaunchSession({
            status: 'error',
            message: err instanceof Error ? err.message : 'Failed to load launch session',
          });
        }
      }
    }

    loadLaunchSession();
    return () => {
      cancelled = true;
    };
  }, [setEncounterContext]);

  // Initialize Ably session sync (real-time image notifications)
  useAblySessionSync(encounterContext?.encounterId);

  // Auto-select first image when images added
  useEffect(() => {
    if (sessionImages.length > 0 && !currentImageId) {
      const firstImage = sessionImages[0];
      if (firstImage) {
        setCurrentImageId(firstImage.id);
      }
    }
  }, [sessionImages, currentImageId]);

  // Auto-hide QR when first image arrives
  useEffect(() => {
    if (sessionImages.length > 0 && showQR) {
      setShowQR(false);
    }
  }, [sessionImages, showQR]);

  // Computed values
  const currentImage = currentImageId
    ? sessionImages.find(img => img.id === currentImageId) || null
    : sessionImages[0] || null;

  // All uncommitted images
  const uncommittedImages = sessionImages.filter(img => img.status !== 'committed');

  // Invalid images (missing required metadata)
  const invalidImages = uncommittedImages.filter(
    img => !img.metadata.notes || img.metadata.notes.trim() === '',
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

  async function startCommit() {
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
    } catch {
      // All images failed (network error, etc.)
      setPartialFailureData({
        successIds: [],
        errorIds: imageIds,
      });
    }
  }

  // Conditional returns AFTER all hooks
  // Loading state
  if (isLoadingCapabilities || !capabilities || launchSession.status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-12 animate-spin text-purple-500" />
          <p className="text-slate-600">Loading Medtech Images Widget...</p>
        </div>
      </div>
    );
  }

  if (launchSession.status === 'no-session') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <AlertCircle className="size-5" />
              Launch from Medtech Evolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              This widget must be launched from within Medtech Evolution.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (launchSession.status === 'no-patient') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <AlertCircle className="size-5" />
              No patient selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              No patient selected
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (launchSession.status === 'error') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" />
              Launch failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{launchSession.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safety: if we are "ready" we must have encounter context set.
  if (!encounterContext) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <AlertCircle className="size-5" />
              Launch from Medtech Evolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              This widget must be launched from within Medtech Evolution.
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
              type="button"
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

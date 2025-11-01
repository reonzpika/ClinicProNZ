/**
 * Medtech Images Widget - Desktop Page
 * 
 * Main entry point for the widget (embedded in Medtech or standalone)
 * 
 * URL: /medtech-images?encounterId=enc-123&patientId=pat-456&...
 */

'use client';

// Force dynamic rendering (required for useSearchParams)
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Check, Loader2, Inbox, ListTodo } from 'lucide-react';
import { useImageWidgetStore } from '@/src/medtech/images-widget/stores/imageWidgetStore';
import { useCapabilities } from '@/src/medtech/images-widget/hooks/useCapabilities';
import { CapturePanel } from '@/src/medtech/images-widget/components/desktop/CapturePanel';
import { ThumbnailStrip } from '@/src/medtech/images-widget/components/desktop/ThumbnailStrip';
import { ImagePreview } from '@/src/medtech/images-widget/components/desktop/ImagePreview';
import { MetadataForm } from '@/src/medtech/images-widget/components/desktop/MetadataForm';
import { QRPanel } from '@/src/medtech/images-widget/components/desktop/QRPanel';
import { CommitDialog } from '@/src/medtech/images-widget/components/desktop/CommitDialog';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

function MedtechImagesPageContent() {
  const searchParams = useSearchParams();
  
  // All hooks MUST be declared before any conditional returns
  const [showQR, setShowQR] = useState(false);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [inboxEnabled, setInboxEnabled] = useState(false);
  const [taskEnabled, setTaskEnabled] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  
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
    if (sessionImages.length > 0 && !currentImageId && sessionImages[0]) {
      setCurrentImageId(sessionImages[0].id);
    }
  }, [sessionImages, currentImageId]);
  
  // Computed values
  const currentImage = currentImageId 
    ? sessionImages.find(img => img.id === currentImageId) || null
    : sessionImages[0] || null;
    
  // All uncommitted images
  const uncommittedImages = sessionImages.filter(img => img.status !== 'committed');
  
  // Invalid images (missing required metadata)
  const invalidImages = uncommittedImages.filter(
    img => !img.metadata.laterality || !img.metadata.bodySite
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
    setIsCommitting(true);
    
    try {
      // Use the commit mutation (this uses the API route)
      const response = await fetch('/api/medtech/attachments/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounterId: encounterContext?.encounterId,
          files: uncommittedImages.map(img => ({
            fileId: img.id,
            meta: {
              label: img.metadata.label,
              bodySite: img.metadata.bodySite,
              laterality: img.metadata.laterality,
              view: img.metadata.view,
              type: img.metadata.type,
            },
            alsoInbox: img.commitOptions?.alsoInbox,
            alsoTask: img.commitOptions?.alsoTask,
            idempotencyKey: `${encounterContext?.encounterId}:${img.id}`,
          })),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Commit failed');
      }
      
      const result = await response.json();
      
      // Update image statuses
      const { setImageStatus, setImageResult } = useImageWidgetStore.getState();
      result.files.forEach((fileResult: any) => {
        if (fileResult.status === 'committed' && fileResult.documentReferenceId) {
          setImageResult(fileResult.fileId, {
            documentReferenceId: fileResult.documentReferenceId,
            mediaId: fileResult.mediaId,
            inboxMessageId: fileResult.inboxMessageId,
            taskId: fileResult.taskId,
          });
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit images');
    } finally {
      setIsCommitting(false);
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
              For testing, navigate to:{' '}
              <code className="rounded bg-slate-100 px-1">/medtech-images?encounterId=test&patientId=test</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Compact Top Bar - No patient info */}
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Upload Controls */}
          <div className="flex items-center gap-2">
            <CapturePanel />
            
            <div className="h-6 w-px bg-slate-300" />
            
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="ghost"
              size="sm"
            >
              {showQR ? 'Hide QR' : 'Show QR'}
            </Button>
          </div>
          
          {/* Right: Action Controls */}
          <div className="flex items-center gap-3">
            {/* Status Counter */}
            {sessionImages.length > 0 && (
              <span className="text-sm text-slate-600">
                {sessionImages.length} image{sessionImages.length === 1 ? '' : 's'}
                {selectedImageIds.length > 0 && (
                  <span className="ml-2 font-medium text-purple-600">
                    ? {selectedImageIds.length} selected
                  </span>
                )}
              </span>
            )}
            
            {/* Selection Controls */}
            {sessionImages.length > 0 && (
              <>
                {selectedImageIds.length > 0 ? (
                  <Button
                    onClick={clearSelection}
                    variant="ghost"
                    size="sm"
                  >
                    Clear
                  </Button>
                ) : (
                  <Button
                    onClick={selectAllImages}
                    variant="ghost"
                    size="sm"
                  >
                    Select All
                  </Button>
                )}
              </>
            )}
            
            {/* Commit Button */}
            {committableImages.length > 0 && (
              <Button
                onClick={() => setCommitDialogOpen(true)}
                size="sm"
                disabled={hasIncompleteMetadata}
              >
                <Check className="mr-2 size-4" />
                Commit {committableImages.length}
                {hasIncompleteMetadata && ` (${incompleteCount} incomplete)`}
              </Button>
            )}
            
            {/* Mock Mode Badge */}
            {process.env.NEXT_PUBLIC_MEDTECH_USE_MOCK === 'true' && (
              <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                MOCK
              </div>
            )}
          </div>
        </div>
      </header>
      
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
            onPrevious={handlePrevious}
            onNext={handleNext}
            onEdit={() => {
              // TODO: Open image editor modal
              alert('Image editor coming soon!');
            }}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
          />
        </div>
        
        {/* Metadata Form (70%) */}
        <div className="flex-[7]">
          <MetadataForm image={currentImage} />
        </div>
      </div>
      
      {/* Bottom Bar: Thumbnails + Actions */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
        {/* Left: Thumbnail Strip */}
        <div className="flex-1">
          <ThumbnailStrip
            currentImageId={currentImageId}
            onImageSelect={setCurrentImageId}
          />
        </div>
        
        {/* Right: Actions */}
        <div className="ml-6 flex items-center gap-4">
          {/* Inbox Checkbox */}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inboxEnabled}
              onChange={(e) => setInboxEnabled(e.target.checked)}
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
              onChange={(e) => setTaskEnabled(e.target.checked)}
              className="size-4 rounded border-slate-300"
            />
            <ListTodo className="size-4 text-slate-600" />
            <span className="text-slate-700">Task</span>
          </label>
          
          {/* Commit Button */}
          <Button
            onClick={handleCommit}
            disabled={!canCommit || isCommitting}
            size="sm"
          >
            {isCommitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Committing {uncommittedImages.length} image{uncommittedImages.length === 1 ? '' : 's'}...
              </>
            ) : (
              <>
                <Check className="mr-2 size-4" />
                Commit All {uncommittedImages.length} Image{uncommittedImages.length === 1 ? '' : 's'}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Commit Dialog */}
      <CommitDialog
        isOpen={isCommitDialogOpen}
        onClose={handleModalClose}
        inboxEnabled={inboxEnabled}
        taskEnabled={taskEnabled}
        uncommittedCount={uncommittedImages.length}
      />
    </div>
  );
}

export default function MedtechImagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 size-12 animate-spin text-purple-500" />
            <p className="text-slate-600">Loading Medtech Images Widget...</p>
          </div>
        </div>
      }
    >
      <MedtechImagesPageContent />
    </Suspense>
  );
}

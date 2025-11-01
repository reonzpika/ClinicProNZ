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
import { AlertCircle, Check, Loader2 } from 'lucide-react';
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
  const [showQR, setShowQR] = useState(false);
  
  const {
    encounterContext,
    setEncounterContext,
    sessionImages,
    selectedImageIds,
    selectAllImages,
    clearSelection,
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
  
  // Count committable images
  const committableImages = sessionImages.filter(
    (img) => selectedImageIds.includes(img.id) && img.status !== 'committed'
  );
  
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
  
  // Current image state
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const currentImage = currentImageId 
    ? sessionImages.find(img => img.id === currentImageId) || null
    : sessionImages[0] || null;
  
  // Auto-select first image when images added
  useEffect(() => {
    if (sessionImages.length > 0 && !currentImageId && sessionImages[0]) {
      setCurrentImageId(sessionImages[0].id);
    }
  }, [sessionImages, currentImageId]);
  
  // Navigation
  const currentIndex = sessionImages.findIndex(img => img.id === currentImageId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sessionImages.length - 1;
  
  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentImageId(sessionImages[currentIndex - 1].id);
    }
  };
  
  const handleNext = () => {
    if (hasNext) {
      setCurrentImageId(sessionImages[currentIndex + 1].id);
    }
  };
  
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
              >
                <Check className="mr-2 size-4" />
                Commit {committableImages.length}
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
      
      {/* Thumbnail Strip */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <ThumbnailStrip
          currentImageId={currentImageId}
          onImageSelect={setCurrentImageId}
        />
      </div>
      
      {/* Main Content: Image Preview + Metadata */}
      <div className="flex flex-1 gap-6 overflow-hidden p-6">
        {/* Image Preview (40%) */}
        <div className="flex-[2]">
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
        
        {/* Metadata Form (60%) */}
        <div className="flex-[3]">
          <MetadataForm image={currentImage} />
        </div>
      </div>
      
      {/* Commit Dialog */}
      <CommitDialog
        isOpen={isCommitDialogOpen}
        onClose={() => setCommitDialogOpen(false)}
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

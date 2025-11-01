/**
 * Medtech Images Widget - Desktop Page
 * 
 * Main entry point for the widget (embedded in Medtech or standalone)
 * 
 * URL: /medtech-images?encounterId=enc-123&patientId=pat-456&...
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { useImageWidgetStore } from '@/src/medtech/images-widget/stores/imageWidgetStore';
import { useCapabilities } from '@/src/medtech/images-widget/hooks/useCapabilities';
import { CapturePanel } from '@/src/medtech/images-widget/components/desktop/CapturePanel';
import { GalleryGrid } from '@/src/medtech/images-widget/components/desktop/GalleryGrid';
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
  
  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">ClinicPro Images</h1>
            <p className="text-sm text-slate-600">
              {encounterContext.patientName || encounterContext.patientId}
              {encounterContext.patientNHI && (
                <span className="ml-2 text-slate-500">NHI: {encounterContext.patientNHI}</span>
              )}
            </p>
          </div>
          
          {/* Mock Mode Indicator */}
          {process.env.NEXT_PUBLIC_MEDTECH_USE_MOCK === 'true' && (
            <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              MOCK MODE
            </div>
          )}
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
      
      {/* Main Content */}
      <div className="flex flex-1 gap-6 overflow-hidden p-6">
        {/* Left Sidebar */}
        <div className="w-80 space-y-4 overflow-y-auto">
          {/* Capture Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Capture Images</CardTitle>
            </CardHeader>
            <CardContent>
              <CapturePanel />
            </CardContent>
          </Card>
          
          {/* QR Panel (Collapsible) */}
          {showQR ? (
            <QRPanel />
          ) : (
            <Button
              onClick={() => setShowQR(true)}
              variant="outline"
              className="w-full"
            >
              Show Mobile QR Code
            </Button>
          )}
        </div>
        
        {/* Main Gallery Area */}
        <div className="flex-1 overflow-hidden">
          <Card className="flex h-full flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Session Images ({sessionImages.length})
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  {/* Selection Actions */}
                  {sessionImages.length > 0 && (
                    <>
                      {selectedImageIds.length > 0 ? (
                        <>
                          <Button
                            onClick={clearSelection}
                            variant="ghost"
                            size="sm"
                          >
                            Clear ({selectedImageIds.length})
                          </Button>
                          
                          {committableImages.length > 0 && (
                            <Button
                              onClick={() => setCommitDialogOpen(true)}
                              size="sm"
                            >
                              <Check className="mr-2 size-4" />
                              Commit {committableImages.length}
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          onClick={selectAllImages}
                          variant="outline"
                          size="sm"
                        >
                          Select All
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto">
              <GalleryGrid />
            </CardContent>
          </Card>
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

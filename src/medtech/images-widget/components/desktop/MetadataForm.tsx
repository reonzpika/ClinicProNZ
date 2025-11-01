/**
 * Metadata Form Component
 * 
 * Form for editing metadata of the current image
 * Displays in right panel (70% width)
 */

'use client';

import { useState } from 'react';
import { Check, AlertCircle, CheckCheck, ImagePlus } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/button';
import type { WidgetImage } from '../../types';
import { MetadataChips } from './MetadataChips';
import { ApplyMetadataModal } from './ApplyMetadataModal';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';

interface MetadataFormProps {
  image: WidgetImage | null;
}

export function MetadataForm({ image }: MetadataFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { sessionImages, applyMetadataToImages, setError } = useImageWidgetStore();
  
  if (!image) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 size-12 text-slate-400" />
          <p className="text-sm text-slate-600">Select an image to edit metadata</p>
        </div>
      </div>
    );
  }
  
  // Check if required fields are filled
  const hasLaterality = !!image.metadata.laterality;
  const hasBodySite = !!image.metadata.bodySite;
  const isComplete = hasLaterality && hasBodySite;
  
  // Calculate invalid images for "Apply to Invalid" button
  const invalidImages = sessionImages.filter((img) => {
    // Don't include current image
    if (img.id === image.id) return false;
    // Invalid = missing required fields AND not committed
    return (!img.metadata.laterality || !img.metadata.bodySite) && img.status !== 'committed';
  });
  
  // Show apply buttons only when laterality AND bodySite are selected
  const canApply = hasLaterality && hasBodySite;
  
  // Handle quick apply to invalid images
  const handleApplyToInvalid = () => {
    const targetIds = invalidImages.map((img) => img.id);
    applyMetadataToImages(image.id, targetIds);
    setError(null);
    // TODO: Add toast notification
    console.log(`? Applied metadata to ${targetIds.length} images`);
  };
  
  // Handle selective apply (opens modal)
  const handleChooseImages = () => {
    setIsModalOpen(true);
  };
  
  // Handle apply from modal
  const handleModalApply = (targetIds: string[]) => {
    applyMetadataToImages(image.id, targetIds);
    setError(null);
    // TODO: Add toast notification
    console.log(`? Applied metadata to ${targetIds.length} images`);
  };
  
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">Image Metadata</h3>
        <p className="mt-1 text-xs text-slate-500">
          Fields marked with <span className="text-red-600">*</span> are required
        </p>
      </div>
      
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <MetadataChips imageId={image.id} />
        
        {/* Apply Metadata Buttons */}
        {canApply && (
          <div className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-4">
            {/* Primary: Apply to Invalid */}
            {invalidImages.length > 0 && (
              <Button onClick={handleApplyToInvalid} size="sm">
                <CheckCheck className="mr-2 size-4" />
                Apply to {invalidImages.length} Invalid
              </Button>
            )}
            
            {/* Secondary: Choose Images (link style) */}
            <Button onClick={handleChooseImages} variant="link" size="sm">
              <ImagePlus className="mr-2 size-4" />
              Choose Images...
            </Button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="border-t border-slate-200 bg-slate-50 p-4">
        {isComplete ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Check className="size-4" />
            <span>Metadata complete</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <AlertCircle className="size-4" />
            <span>
              Missing: {!hasLaterality && 'Laterality'}{!hasLaterality && !hasBodySite && ', '}{!hasBodySite && 'Body Site'}
            </span>
          </div>
        )}
      </div>
      
      {/* Apply Metadata Modal */}
      <ApplyMetadataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sourceImage={image}
        availableImages={sessionImages}
        onApply={handleModalApply}
      />
    </div>
  );
}

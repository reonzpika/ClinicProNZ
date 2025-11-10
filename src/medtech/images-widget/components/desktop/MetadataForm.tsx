/**
 * Metadata Form Component
 *
 * Form for editing metadata of the current image
 * Displays in right panel (70% width)
 */

'use client';

import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';

import { useImageWidgetStore } from '../../stores/imageWidgetStore';
import type { WidgetImage } from '../../types';
import { ApplyMetadataModal } from './ApplyMetadataModal';
import { MetadataChips } from './MetadataChips';

type MetadataFormProps = {
  image: WidgetImage | null;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
};

export function MetadataForm({ image, onPrevious, onNext, hasPrevious = false, hasNext = false }: MetadataFormProps) {
  const { sessionImages, applyMetadataToImages, setError } = useImageWidgetStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Calculate rest images (all other uncommitted images)
  const restImages = sessionImages.filter((img) => {
    // Don't include current image
    if (img.id === image.id) {
 return false;
}
    // Only uncommitted images
    return img.status !== 'committed';
  });

  // Handle apply laterality to rest
  const handleApplyLaterality = () => {
    if (!hasLaterality || restImages.length === 0) {
 return;
}
    const targetIds = restImages.map(img => img.id);
    targetIds.forEach((id) => {
      useImageWidgetStore.getState().updateMetadata(id, {
        laterality: image.metadata.laterality,
      });
    });
    setError(null);
  };

  // Handle apply body site to rest
  const handleApplyBodySite = () => {
    if (!hasBodySite || restImages.length === 0) {
 return;
}
    const targetIds = restImages.map(img => img.id);
    targetIds.forEach((id) => {
      useImageWidgetStore.getState().updateMetadata(id, {
        bodySite: image.metadata.bodySite,
      });
    });
    setError(null);
  };

  // Handle apply to selected (opens modal)
  const handleApplyToSelected = () => {
    setIsModalOpen(true);
  };

  // Handle apply from modal
  const handleModalApply = (targetIds: string[]) => {
    applyMetadataToImages(image.id, targetIds);
    setError(null);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">Image Metadata</h3>
        <p className="mt-1 text-xs text-slate-500">
          Fields marked with
{' '}
<span className="text-red-600">*</span>
{' '}
are required
        </p>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <MetadataChips
          imageId={image.id}
          onApplyLaterality={handleApplyLaterality}
          onApplyBodySite={handleApplyBodySite}
          onApplyToSelected={handleApplyToSelected}
          restImagesCount={restImages.length}
          hasLaterality={hasLaterality}
          hasBodySite={hasBodySite}
        />
      </div>

      {/* Footer with Navigation */}
      {(onPrevious || onNext) && (
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center justify-start gap-3">
            <Button
              onClick={onPrevious}
              disabled={!hasPrevious}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="mr-1 size-4" />
              Previous
            </Button>

            <Button
              onClick={onNext}
              disabled={!hasNext}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

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

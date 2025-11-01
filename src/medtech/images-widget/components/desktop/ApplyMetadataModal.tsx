/**
 * Apply Metadata Modal
 * 
 * Allows GP to select which images to apply metadata to
 */

'use client';

import { useState, useMemo } from 'react';
import { CheckCheck, AlertCircle, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';
import { Button } from '@/src/shared/components/ui/button';
import { Checkbox } from '@/src/shared/components/ui/checkbox';
import type { WidgetImage } from '../../types';

interface ApplyMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceImage: WidgetImage;
  availableImages: WidgetImage[];
  onApply: (targetImageIds: string[]) => void;
}

export function ApplyMetadataModal({
  isOpen,
  onClose,
  sourceImage,
  availableImages,
  onApply,
}: ApplyMetadataModalProps) {
  // Pre-select invalid images by default
  const defaultSelected = useMemo(() => {
    return availableImages
      .filter((img) => {
        // Don't include source image
        if (img.id === sourceImage.id) return false;
        // Invalid = missing required fields
        return !img.metadata.laterality || !img.metadata.bodySite;
      })
      .map((img) => img.id);
  }, [availableImages, sourceImage.id]);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(defaultSelected));
  
  const toggleImage = (imageId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };
  
  const handleApply = () => {
    onApply(Array.from(selectedIds));
    onClose();
  };
  
  // Filter out source image from available images
  const selectableImages = availableImages.filter((img) => img.id !== sourceImage.id);
  
  // Get metadata summary to show what will be copied
  const metadataSummary = [
    sourceImage.metadata.laterality && `Laterality: ${sourceImage.metadata.laterality.display}`,
    sourceImage.metadata.bodySite && `Body Site: ${sourceImage.metadata.bodySite.display}`,
    sourceImage.metadata.view && `View: ${sourceImage.metadata.view.display}`,
    sourceImage.metadata.type && `Type: ${sourceImage.metadata.type.display}`,
  ].filter(Boolean);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply Metadata to Images</DialogTitle>
          <DialogDescription>
            Select which images to apply this metadata to
          </DialogDescription>
        </DialogHeader>
        
        {/* Source metadata summary */}
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="mb-2 text-sm font-medium text-slate-700">
            Copying from: {sourceImage.file.name}
          </div>
          <div className="space-y-1 text-sm text-slate-600">
            {metadataSummary.map((item, i) => (
              <div key={i}>• {item}</div>
            ))}
          </div>
        </div>
        
        {/* Image selection grid */}
        <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 p-4">
          <div className="grid grid-cols-2 gap-4">
            {selectableImages.map((image) => {
              const isSelected = selectedIds.has(image.id);
              const isInvalid = !image.metadata.laterality || !image.metadata.bodySite;
              const isCommitted = image.status === 'committed';
              
              return (
                <div
                  key={image.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleImage(image.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    {/* Thumbnail */}
                    <div className="relative mb-2 h-20 w-20 overflow-hidden rounded border border-slate-200">
                      <img
                        src={image.thumbnail}
                        alt={image.file.name}
                        className="size-full object-cover"
                      />
                      
                      {/* Status badge */}
                      {isCommitted && (
                        <div className="absolute right-1 top-1 rounded-full bg-green-500 p-1">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                      {isInvalid && !isCommitted && (
                        <div className="absolute right-1 top-1 rounded-full bg-red-500 p-1">
                          <AlertCircle className="size-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Filename */}
                    <div className="text-sm font-medium text-slate-700">
                      {image.file.name}
                    </div>
                    
                    {/* Status text */}
                    <div className="text-xs text-slate-500">
                      {isCommitted && 'Committed'}
                      {isInvalid && !isCommitted && 'Missing required fields'}
                      {!isInvalid && !isCommitted && 'Valid'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Selected count */}
        <div className="text-sm text-slate-600">
          {selectedIds.size} image{selectedIds.size === 1 ? '' : 's'} selected
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={selectedIds.size === 0}>
            <CheckCheck className="mr-2 size-4" />
            Apply to {selectedIds.size} Image{selectedIds.size === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

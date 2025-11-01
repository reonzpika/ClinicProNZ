/**
 * Metadata Form Component
 * 
 * Form for editing metadata of the current image
 * Displays in right panel (40% width)
 */

'use client';

import { Check, AlertCircle } from 'lucide-react';
import type { WidgetImage } from '../../types';
import { MetadataChips } from './MetadataChips';

interface MetadataFormProps {
  image: WidgetImage | null;
}

export function MetadataForm({ image }: MetadataFormProps) {
  const { updateMetadata } = useImageWidgetStore();
  
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
  
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">Image Metadata</h3>
        <p className="mt-1 text-xs text-slate-500">
          Required fields: Laterality, Body Site
        </p>
      </div>
      
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <MetadataChips imageId={image.id} />
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
    </div>
  );
}

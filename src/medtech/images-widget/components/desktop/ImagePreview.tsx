/**
 * Image Preview Component
 * 
 * Large image display with navigation controls
 */

'use client';

import { Edit2 } from 'lucide-react';
import type { WidgetImage } from '../../types';
import { Button } from '@/src/shared/components/ui/button';
import { formatFileSize } from '../../services/compression';

interface ImagePreviewProps {
  image: WidgetImage | null;
  onEdit: () => void;
}

export function ImagePreview({
  image,
  onEdit,
}: ImagePreviewProps) {
  if (!image) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
        <div className="text-center">
          <svg
            className="mx-auto mb-3 size-16 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-slate-600">No image selected</p>
          <p className="text-xs text-slate-500">Upload images to get started</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col">
      {/* Controls Bar - Edit Button Only */}
      <div className="mb-3 flex items-center justify-end">
        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
        >
          <Edit2 className="mr-2 size-4" />
          Edit
        </Button>
      </div>
      
      {/* Image Display Area */}
      <div className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <div className="flex size-full items-center justify-center p-4">
          <img
            src={image.preview}
            alt={image.metadata.label || 'Clinical image'}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
      
      {/* Image Info - AT BOTTOM */}
      <div className="mt-2 text-xs text-slate-500">
        {image.file.name} • {formatFileSize(image.file.size)}
        {image.metadata.label && ` • ${image.metadata.label}`}
      </div>
    </div>
  );
}

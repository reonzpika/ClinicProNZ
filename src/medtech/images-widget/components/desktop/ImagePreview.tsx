/**
 * Image Preview Component
 * 
 * Large image display with navigation controls
 */

'use client';

import { ChevronLeft, ChevronRight, Edit2, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import type { WidgetImage } from '../../types';
import { Button } from '@/src/shared/components/ui/button';
import { formatFileSize } from '../../services/compression';

interface ImagePreviewProps {
  image: WidgetImage | null;
  onPrevious: () => void;
  onNext: () => void;
  onEdit: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function ImagePreview({
  image,
  onPrevious,
  onNext,
  onEdit,
  hasPrevious,
  hasNext,
}: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  
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
      {/* Image Display Area */}
      <div className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <div className="flex size-full items-center justify-center p-4">
          <img
            src={image.preview}
            alt={image.metadata.label || 'Clinical image'}
            className="max-h-full max-w-full object-contain"
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
          />
        </div>
      </div>
      
      {/* Controls Bar */}
      <div className="mt-3 flex items-center justify-between">
        {/* Navigation */}
        <div className="flex items-center gap-2">
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
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            disabled={zoom <= 0.5}
            variant="ghost"
            size="sm"
          >
            <ZoomOut className="size-4" />
          </Button>
          
          <span className="text-sm text-slate-600">{Math.round(zoom * 100)}%</span>
          
          <Button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            disabled={zoom >= 3}
            variant="ghost"
            size="sm"
          >
            <ZoomIn className="size-4" />
          </Button>
          
          <Button
            onClick={() => setZoom(1)}
            disabled={zoom === 1}
            variant="ghost"
            size="sm"
          >
            Reset
          </Button>
        </div>
        
        {/* Edit Button */}
        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
        >
          <Edit2 className="mr-2 size-4" />
          Edit Image
        </Button>
      </div>
      
      {/* Image Info */}
      <div className="mt-2 text-xs text-slate-500">
        {image.file.name} • {formatFileSize(image.file.size)}
        {image.metadata.label && ` • ${image.metadata.label}`}
      </div>
    </div>
  );
}

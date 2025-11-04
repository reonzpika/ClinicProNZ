/**
 * Thumbnail Strip Component
 * 
 * Horizontal scrollable strip of image thumbnails
 * Shows status badges and allows selection
 */

'use client';

import { Check, AlertCircle, X } from 'lucide-react';
import type { WidgetImage } from '../../types';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';

interface ThumbnailStripProps {
  currentImageId: string | null;
  onImageSelect: (imageId: string) => void;
  onErrorClick?: (imageId: string) => void;
}

export function ThumbnailStrip({ currentImageId, onImageSelect, onErrorClick }: ThumbnailStripProps) {
  const { sessionImages, removeImage } = useImageWidgetStore();
  
  if (sessionImages.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
        <p className="text-sm text-slate-500">No images uploaded yet</p>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {sessionImages.map((image) => {
        const hasError = image.status === 'error' || !!image.error;
        return (
          <ThumbnailCard
            key={image.id}
            image={image}
            isCurrent={image.id === currentImageId}
            onClick={() => onImageSelect(image.id)}
            onErrorClick={hasError && onErrorClick ? () => onErrorClick(image.id) : undefined}
            onRemove={() => {
              URL.revokeObjectURL(image.preview);
              removeImage(image.id);
            }}
          />
        );
      })}
    </div>
  );
}

interface ThumbnailCardProps {
  image: WidgetImage;
  isCurrent: boolean;
  onClick: () => void;
  onErrorClick?: () => void;
  onRemove: () => void;
}

function ThumbnailCard({ image, isCurrent, onClick, onErrorClick, onRemove }: ThumbnailCardProps) {
  // Badge logic: Red = error/invalid, Green = committed, No badge = valid ready to commit
  const isInvalid = !image.metadata.laterality || !image.metadata.bodySite;
  const hasError = image.status === 'error' || !!image.error;
  const badgeColor = 
    image.status === 'committed' ? 'green' :
    hasError || isInvalid ? 'red' :
    null;
  
  const badgeTitle = 
    image.status === 'committed' ? 'Committed' :
    hasError ? image.error || 'Error' :
    isInvalid ? 'Missing required metadata' :
    null;
  return (
    <div
      className={`
        group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all
        ${isCurrent ? 'border-purple-500 ring-2 ring-purple-200' : 'border-slate-200 hover:border-slate-300'}
      `}
      style={{ width: 120, height: 120 }}
      onClick={onClick}
    >
      {/* Image */}
      <img
        src={image.thumbnail || image.preview}
        alt={image.metadata.label || 'Image'}
        className="size-full object-cover"
      />
      
      {/* Badge (Red = Error/Invalid, Green = Committed) */}
      {badgeColor && (
        <div className="absolute bottom-1 right-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasError && onErrorClick) {
                onErrorClick();
              }
            }}
            className={`flex size-6 items-center justify-center rounded-full transition-opacity ${
              badgeColor === 'green' ? 'bg-green-500' : 'bg-red-500'
            } ${hasError && onErrorClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            title={badgeTitle || undefined}
          >
            {badgeColor === 'green' ? (
              <Check className="size-3 text-white" />
            ) : (
              <AlertCircle className="size-3 text-white" />
            )}
          </button>
        </div>
      )}
      
      {/* Remove Button (on hover) */}
      {image.status !== 'uploading' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Remove this image?')) {
              onRemove();
            }
          }}
          className="absolute right-1 top-1 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
        >
          <X className="size-3" />
        </button>
      )}
      
    </div>
  );
}

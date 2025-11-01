/**
 * Thumbnail Strip Component
 * 
 * Horizontal scrollable strip of image thumbnails
 * Shows status badges and allows selection
 */

'use client';

import { Check, AlertCircle, Loader2, X } from 'lucide-react';
import type { WidgetImage } from '../../types';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';
import { formatFileSize } from '../../services/compression';

interface ThumbnailStripProps {
  currentImageId: string | null;
  onImageSelect: (imageId: string) => void;
}

export function ThumbnailStrip({ currentImageId, onImageSelect }: ThumbnailStripProps) {
  const { sessionImages, selectedImageIds, toggleImageSelection, removeImage } = useImageWidgetStore();
  
  if (sessionImages.length === 0) {
    return (
      <div className="flex h-28 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
        <p className="text-sm text-slate-500">No images uploaded yet</p>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {sessionImages.map((image) => (
        <ThumbnailCard
          key={image.id}
          image={image}
          isSelected={selectedImageIds.includes(image.id)}
          isCurrent={image.id === currentImageId}
          onSelect={() => toggleImageSelection(image.id)}
          onClick={() => onImageSelect(image.id)}
          onRemove={() => {
            URL.revokeObjectURL(image.preview);
            removeImage(image.id);
          }}
        />
      ))}
    </div>
  );
}

interface ThumbnailCardProps {
  image: WidgetImage;
  isSelected: boolean;
  isCurrent: boolean;
  onSelect: () => void;
  onClick: () => void;
  onRemove: () => void;
}

function ThumbnailCard({ image, isSelected, isCurrent, onSelect, onClick, onRemove }: ThumbnailCardProps) {
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
      
      {/* Selection Checkbox */}
      <div className="absolute left-1 top-1 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="size-4 rounded border-2 border-white shadow-sm"
        />
      </div>
      
      {/* Status Badge */}
      <div className="absolute bottom-1 right-1">
        <StatusBadge status={image.status} />
      </div>
      
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
      
      {/* Metadata Indicators (tiny chips at bottom) */}
      {(image.metadata.laterality || image.metadata.bodySite) && (
        <div className="absolute bottom-6 left-1 flex flex-wrap gap-0.5">
          {image.metadata.laterality && (
            <span className="rounded bg-purple-600 px-1 py-0.5 text-[8px] font-medium text-white">
              {image.metadata.laterality.display.slice(0, 1)}
            </span>
          )}
          {image.metadata.bodySite && (
            <span className="rounded bg-blue-600 px-1 py-0.5 text-[8px] font-medium text-white">
              {image.metadata.bodySite.display.slice(0, 3)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: WidgetImage['status'] }) {
  const badges = {
    pending: { icon: null, bg: 'bg-orange-500', title: 'Pending' },
    compressing: { icon: <Loader2 className="size-2 animate-spin" />, bg: 'bg-blue-500', title: 'Compressing' },
    uploading: { icon: <Loader2 className="size-2 animate-spin" />, bg: 'bg-blue-500', title: 'Uploading' },
    committed: { icon: <Check className="size-2" />, bg: 'bg-green-500', title: 'Committed' },
    error: { icon: <AlertCircle className="size-2" />, bg: 'bg-red-500', title: 'Error' },
  };
  
  const badge = badges[status];
  
  return (
    <div
      className={`flex items-center justify-center rounded p-1 text-white ${badge.bg}`}
      title={badge.title}
    >
      {badge.icon || <div className="size-2 rounded-full bg-white" />}
    </div>
  );
}

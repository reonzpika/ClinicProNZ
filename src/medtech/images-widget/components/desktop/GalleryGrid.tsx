/**
 * Gallery Grid Component
 *
 * Displays session images in grid layout with:
 * - Status badges (pending/uploading/committed/error)
 * - Metadata preview
 * - Quick actions (edit metadata, remove)
 * - Selection for batch commit
 */

'use client';

import { AlertCircle, Check, Edit2, Loader2, X } from 'lucide-react';
import { useState } from 'react';

import { formatFileSize } from '../../services/compression';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';
import type { WidgetImage } from '../../types';
import { MetadataChips } from './MetadataChips';

type GalleryGridProps = {
  onImageClick?: (imageId: string) => void;
};

export function GalleryGrid({ onImageClick }: GalleryGridProps) {
  const { sessionImages, selectedImageIds, toggleImageSelection } = useImageWidgetStore();

  if (sessionImages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="size-8 text-slate-400"
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
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">No images yet</h3>
          <p className="text-sm text-slate-600">
            Upload images or scan QR code to start
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {sessionImages.map(image => (
        <ImageCard
          key={image.id}
          image={image}
          isSelected={selectedImageIds.includes(image.id)}
          onSelect={() => toggleImageSelection(image.id)}
          onClick={() => onImageClick?.(image.id)}
        />
      ))}
    </div>
  );
}

type ImageCardProps = {
  image: WidgetImage;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
};

function ImageCard({ image, isSelected, onSelect, onClick }: ImageCardProps) {
  const removeImage = useImageWidgetStore(state => state.removeImage);
  const [showMetadata, setShowMetadata] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Image */}
      <div
        className="relative aspect-square cursor-pointer bg-slate-100"
        onClick={onClick}
      >
        <img
          src={image.preview || image.previewUrl || ''}
          alt={image.metadata.label || 'Clinical image'}
          className="size-full object-cover"
        />

        {/* Status Badge */}
        <StatusBadge status={image.status} error={image.error} />

        {/* Selection Checkbox */}
        <div className="absolute left-2 top-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="size-5 rounded border-2 border-white shadow-sm"
          />
        </div>

        {/* Remove Button */}
        {image.status !== 'uploading' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Remove this image?')) {
                if (image.preview) {
                  URL.revokeObjectURL(image.preview);
                }
                removeImage(image.id);
              }
            }}
            className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Metadata Preview */}
      <div className="p-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">
            {formatFileSize(image.file.size)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMetadata(!showMetadata);
            }}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            title="Edit metadata"
          >
            <Edit2 className="size-3" />
          </button>
        </div>

        {/* Metadata Tags */}
        <div className="flex flex-wrap gap-1">
          {image.metadata.laterality && (
            <span className="inline-block rounded bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
              {image.metadata.laterality.display}
            </span>
          )}
          {image.metadata.bodySite && (
            <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
              {image.metadata.bodySite.display}
            </span>
          )}
          {image.metadata.view && (
            <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
              {image.metadata.view.display}
            </span>
          )}
        </div>

        {image.metadata.label && (
          <p className="mt-1 truncate text-xs text-slate-600">{image.metadata.label}</p>
        )}
      </div>

      {/* Metadata Editor (Collapsible) */}
      {showMetadata && (
        <div className="border-t border-slate-200 bg-slate-50 p-3">
          <MetadataChips imageId={image.id} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, error }: { status: WidgetImage['status']; error?: string }) {
  const badges = {
    pending: {
      icon: null,
      bg: 'bg-orange-500',
      text: 'Not committed',
    },
    compressing: {
      icon: <Loader2 className="size-3 animate-spin" />,
      bg: 'bg-blue-500',
      text: 'Compressing...',
    },
    uploading: {
      icon: <Loader2 className="size-3 animate-spin" />,
      bg: 'bg-blue-500',
      text: 'Uploading...',
    },
    committed: {
      icon: <Check className="size-3" />,
      bg: 'bg-green-500',
      text: 'Committed',
    },
    error: {
      icon: <AlertCircle className="size-3" />,
      bg: 'bg-red-500',
      text: error || 'Error',
    },
  };

  const badge = badges[status];

  return (
    <div
      className={`absolute bottom-2 right-2 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-white ${badge.bg}`}
      title={badge.text}
    >
      {badge.icon}
      <span>{badge.text}</span>
    </div>
  );
}

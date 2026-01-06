/**
 * Thumbnail Strip Component
 *
 * Horizontal scrollable strip of image thumbnails
 * Shows status badges and allows selection
 */

'use client';

import { AlertCircle, Check, X } from 'lucide-react';

import { useImageWidgetStore } from '../../stores/imageWidgetStore';
import type { WidgetImage } from '../../types';

type ThumbnailStripProps = {
  currentImageId: string | null;
  onImageSelect: (imageId: string) => void;
  onErrorClick?: (imageId: string) => void;
};

export function ThumbnailStrip({ currentImageId, onImageSelect, onErrorClick }: ThumbnailStripProps) {
  const { sessionImages, removeImage, encounterContext } = useImageWidgetStore();

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
        const hasCommitError = image.status === 'error' || !!image.error;
        return (
          <ThumbnailCard
            key={image.id}
            image={image}
            isCurrent={image.id === currentImageId}
            onClick={() => onImageSelect(image.id)}
            onErrorClick={hasCommitError && onErrorClick ? () => onErrorClick(image.id) : undefined}
            onRemove={async () => {
              // If image is from session (has s3Key), delete from Redis
              if (image.s3Key && encounterContext) {
                try {
                  const response = await fetch('/api/medtech/session/images/delete', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      encounterId: encounterContext.encounterId,
                      s3Key: image.s3Key,
                    }),
                  });

                  if (!response.ok) {
                    console.error('[Delete Image] Failed to delete from session');
                  }
                }
                catch (error) {
                  console.error('[Delete Image] Error:', error);
                }
              }

              // Remove from local state
              if (image.preview) {
                URL.revokeObjectURL(image.preview);
              }
              removeImage(image.id);
            }}
          />
        );
      })}
    </div>
  );
}

type ThumbnailCardProps = {
  image: WidgetImage;
  isCurrent: boolean;
  onClick: () => void;
  onErrorClick?: () => void;
  onRemove: () => void;
};

function ThumbnailCard({ image, isCurrent, onClick, onErrorClick, onRemove }: ThumbnailCardProps) {
  // Badge logic: Yellow = validation error, Red = commit error, Green = committed
  const isInvalid = !image.metadata.notes || image.metadata.notes.trim() === '';
  const hasCommitError = image.status === 'error' || !!image.error;

  // Badge type: 'validation' (yellow), 'error' (red), 'committed' (green), or null
  const badgeType
    = image.status === 'committed'
? 'committed'
    : hasCommitError
? 'error'
    : isInvalid
? 'validation'
    : null;

  const badgeTitle
    = badgeType === 'committed'
? 'Committed'
    : badgeType === 'error'
? image.error || 'Commit error'
    : badgeType === 'validation'
? 'Missing required metadata'
    : null;
  return (
    <div
      className={`
        group relative shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all
        ${isCurrent ? 'border-purple-500 ring-2 ring-purple-200' : 'border-slate-200 hover:border-slate-300'}
      `}
      style={{ width: 120, height: 120 }}
      onClick={onClick}
    >
      {/* Image */}
      <img
        src={image.thumbnail || image.preview || image.previewUrl || ''}
        alt={image.metadata.label || 'Image'}
        className="size-full object-cover"
      />

      {/* Badge (Yellow = Validation, Red = Commit Error, Green = Committed) */}
      {badgeType && (
        <div className="absolute bottom-1 right-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (badgeType === 'error' && onErrorClick) {
                onErrorClick();
              }
            }}
            className={`flex size-6 items-center justify-center rounded-full transition-opacity ${
              badgeType === 'committed'
? 'bg-green-500'
              : badgeType === 'error'
? 'bg-red-500'
              : 'bg-yellow-500'
            } ${badgeType === 'error' && onErrorClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            title={badgeTitle || undefined}
          >
            {badgeType === 'committed'
? (
              <Check className="size-3 text-white" />
            )
: (
              <AlertCircle className={`size-3 ${
                badgeType === 'error' ? 'text-white' : 'text-white'
              }`}
              />
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

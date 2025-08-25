'use client';

import { AlertTriangle, Camera, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Alert } from '@/src/shared/components/ui/alert';
import { Button } from '@/src/shared/components/ui/button';

type CapturedPhoto = {
  id: string;
  blob: Blob;
  timestamp: string;
  filename: string;
  status: 'captured' | 'uploading' | 'uploaded' | 'failed';
};

type UploadProgress = {
  photoId: string;
  progress: number;
  error?: string;
};

type PhotoReviewProps = {
  photos: CapturedPhoto[];
  onDeletePhoto: (id: string) => void;
  onRetakePhoto: () => void;
  onUploadAll: () => Promise<void>;
  onCancel: () => void;
  uploadProgress: UploadProgress[];
  isUploading: boolean;
};

export const PhotoReview: React.FC<PhotoReviewProps> = ({
  photos,
  onDeletePhoto,
  onRetakePhoto,
  onUploadAll,
  onCancel,
  uploadProgress,
  isUploading,
}) => {
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());

  // Create preview URLs for photos
  useEffect(() => {
    const newPreviewUrls = new Map<string, string>();

    photos.forEach((photo) => {
      if (!previewUrls.has(photo.id)) {
        const url = URL.createObjectURL(photo.blob);
        newPreviewUrls.set(photo.id, url);
      } else {
        newPreviewUrls.set(photo.id, previewUrls.get(photo.id)!);
      }
    });

    // Clean up old URLs that are no longer needed
    previewUrls.forEach((url, id) => {
      if (!photos.find(p => p.id === id)) {
        URL.revokeObjectURL(url);
      }
    });

    setPreviewUrls(newPreviewUrls);

    // Cleanup on unmount
    return () => {
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photos]); // Remove previewUrls from dependency to avoid infinite loop

  const getPhotoProgress = useCallback((photoId: string): UploadProgress | undefined => {
    return uploadProgress.find(p => p.photoId === photoId);
  }, [uploadProgress]);

  const getStatusIcon = useCallback((photo: CapturedPhoto) => {
    switch (photo.status) {
      case 'uploading':
        return (
          <div className="flex size-4 items-center justify-center">
            <div className="size-3 animate-spin rounded-full border border-white border-t-transparent" />
          </div>
        );
      case 'uploaded':
        return <div className="size-2 rounded-full bg-green-500" />;
      case 'failed':
        return <AlertTriangle className="size-4 text-red-500" />;
      default:
        return null;
    }
  }, []);

  const handleDeletePhoto = useCallback((photoId: string) => {
    const url = previewUrls.get(photoId);
    if (url) {
      URL.revokeObjectURL(url);
    }
    onDeletePhoto(photoId);
  }, [onDeletePhoto, previewUrls]);

  const completedUploads = photos.filter(p => p.status === 'uploaded').length;
  const failedUploads = photos.filter(p => p.status === 'failed').length;
  const canUpload = photos.length > 0 && !isUploading;
  const hasUploaded = completedUploads > 0;

  return (
    <div className="fixed inset-0 z-40 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">
Review Photos (
{photos.length}
)
        </h2>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex h-full flex-col">
        {/* Photos Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {photos.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-500">
              <Camera className="mb-4 size-12 text-gray-300" />
              <p className="text-lg font-medium">No photos captured</p>
              <p className="text-sm">Take some clinical images to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => {
                const previewUrl = previewUrls.get(photo.id);
                const progress = getPhotoProgress(photo.id);

                return (
                  <div key={photo.id} className="relative aspect-square">
                    {/* Photo Thumbnail */}
                    <div className="relative size-full overflow-hidden rounded-lg bg-gray-100">
                      {previewUrl
? (
                        <img
                          src={previewUrl}
                          alt={`Captured photo ${photo.timestamp}`}
                          className="size-full object-cover"
                        />
                      )
: (
                        <div className="flex size-full items-center justify-center">
                          <div className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                        </div>
                      )}

                      {/* Status Overlay */}
                      {photo.status !== 'captured' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          {getStatusIcon(photo)}
                        </div>
                      )}

                      {/* Progress Bar (for uploading) */}
                      {photo.status === 'uploading' && progress && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Delete Button */}
                      {!isUploading && photo.status === 'captured' && (
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}

                      {/* Error State */}
                      {photo.status === 'failed' && (
                        <div className="absolute inset-x-2 bottom-2">
                          <div className="rounded bg-red-500/90 px-2 py-1 text-xs text-white">
                            Upload failed
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Photo Info */}
                    <div className="mt-1 truncate text-xs text-gray-500">
                      {new Date(photo.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upload Status */}
        {(isUploading || hasUploaded) && (
          <div className="border-t p-4">
            {isUploading && (
              <Alert>
                <Upload className="size-4" />
                <div>
                  <div className="font-medium">Uploading photos...</div>
                  <div className="text-sm">
                    {completedUploads}
{' '}
of
{photos.length}
{' '}
photos uploaded
                  </div>
                </div>
              </Alert>
            )}

            {!isUploading && hasUploaded && (
              <Alert className={failedUploads > 0 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
                <div className="flex items-center">
                  {failedUploads > 0
? (
                    <AlertTriangle className="size-4 text-yellow-600" />
                  )
: (
                    <div className="size-2 rounded-full bg-green-500" />
                  )}
                  <div className="ml-2">
                    <div className="text-sm font-medium">
                      {failedUploads > 0
                        ? `${completedUploads} uploaded, ${failedUploads} failed`
                        : `All ${completedUploads} photos uploaded successfully!`}
                    </div>
                  </div>
                </div>
              </Alert>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 border-t p-4">
          {/* Primary Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onRetakePhoto}
              variant="outline"
              className="flex-1"
              disabled={isUploading}
            >
              <Camera className="mr-2 size-4" />
              Take More
            </Button>

            <Button
              onClick={onUploadAll}
              disabled={!canUpload}
              className="flex-1"
            >
              <Upload className="mr-2 size-4" />
              {isUploading
                ? `Uploading... (${completedUploads}/${photos.length})`
                : `Upload ${photos.length} Photo${photos.length === 1 ? '' : 's'}`}
            </Button>
          </div>

          {/* Retry Failed */}
          {failedUploads > 0 && !isUploading && (
            <Button
              onClick={onUploadAll}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="mr-2 size-4" />
              Retry Failed Uploads (
{failedUploads}
)
            </Button>
          )}

          {/* Cancel */}
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full"
            disabled={isUploading}
          >
            {hasUploaded ? 'Continue Recording' : 'Cancel'}
          </Button>
        </div>
      </div>
    </div>
  );
};

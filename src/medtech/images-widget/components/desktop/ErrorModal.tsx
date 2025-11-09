/**
 * Error Modal Component
 *
 * Shows error details for a failed image with retry option
 */

'use client';

import { AlertCircle, RefreshCw, X } from 'lucide-react';

import { Button } from '@/src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';

import { useCommit } from '../../hooks/useCommit';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';
import type { WidgetImage } from '../../types';

type ErrorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  image: WidgetImage | null;
};

export function ErrorModal({ isOpen, onClose, image }: ErrorModalProps) {
  const { setImageStatus } = useImageWidgetStore();
  const commitMutation = useCommit();

  if (!image) {
 return null;
}

  const handleRetry = async () => {
    if (!image.error) {
 return;
}

    // Clear error status
    setImageStatus(image.id, 'pending');

    // Retry commit for this single image
    try {
      await commitMutation.mutateAsync([image.id]);
      onClose();
    } catch (error) {
      // Error handling is done in useCommit hook
    }
  };

  const handleDismiss = () => {
    // Clear error status but keep image
    setImageStatus(image.id, 'pending', undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="size-5" />
            Image Error
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="relative overflow-hidden rounded-lg border-2 border-red-200">
              <img
                src={image.thumbnail || image.preview}
                alt={image.metadata.label || 'Image'}
                className="h-48 w-auto object-contain"
              />
            </div>
          </div>

          {/* Error Message */}
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm font-medium text-red-900">Error Details:</p>
            <p className="mt-1 text-sm text-red-700">
              {image.error || 'Unknown error occurred'}
            </p>
          </div>

          {/* Image Info */}
          <div className="rounded-lg bg-slate-50 p-4 text-sm">
            <p className="font-medium text-slate-900">Image Information:</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              <li>
File:
{image.file.name}
              </li>
              <li>
Size:
{(image.file.size / 1024).toFixed(1)}
{' '}
KB
              </li>
              {image.metadata.label && (
                <li>
Label:
{image.metadata.label}
                </li>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              <X className="mr-2 size-4" />
              Dismiss
            </Button>
            <Button
              onClick={handleRetry}
              disabled={commitMutation.isPending}
              className="flex-1"
            >
              <RefreshCw
                className={`mr-2 size-4 ${commitMutation.isPending ? 'animate-spin' : ''}`}
              />
              Retry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

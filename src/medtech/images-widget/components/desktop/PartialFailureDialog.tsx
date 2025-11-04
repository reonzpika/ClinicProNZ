/**
 * Partial Failure Dialog Component
 * 
 * Shows results after commit with options for managing failed images
 */

'use client';

import { AlertCircle, Check, RefreshCw, X } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';
import { useCommit } from '../../hooks/useCommit';

interface PartialFailureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  successIds: string[];
  errorIds: string[];
  onRetryFailed?: () => void;
  onViewErrorDetails?: (imageId: string) => void;
}

export function PartialFailureDialog({
  isOpen,
  onClose,
  successIds,
  errorIds,
  onRetryFailed,
  onViewErrorDetails,
}: PartialFailureDialogProps) {
  const { sessionImages } = useImageWidgetStore();
  const commitMutation = useCommit();

  const successImages = sessionImages.filter(img => successIds.includes(img.id));
  const errorImages = sessionImages.filter(img => errorIds.includes(img.id));

  const handleRetryFailed = async () => {
    if (errorIds.length === 0) return;
    
    try {
      await commitMutation.mutateAsync(errorIds);
      // If retry succeeds, close dialog
      onClose();
      if (onRetryFailed) {
        onRetryFailed();
      }
    } catch (error) {
      // Error handling is done in useCommit hook
    }
  };

  const handleDismiss = () => {
    onClose();
  };

  const handleRemoveFailed = () => {
    const { removeImage } = useImageWidgetStore.getState();
    errorIds.forEach(id => {
      const image = sessionImages.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
        removeImage(id);
      }
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {errorIds.length > 0 && successIds.length > 0 ? (
              <>
                <AlertCircle className="size-5 text-yellow-600" />
                Partial Success
              </>
            ) : errorIds.length > 0 ? (
              <>
                <AlertCircle className="size-5 text-red-600" />
                Commit Failed
              </>
            ) : (
              <>
                <Check className="size-5 text-green-600" />
                Success
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Summary */}
          {successIds.length > 0 && (
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-900">
                <Check className="size-5" />
                <p className="font-medium">
                  Successfully committed {successIds.length} image{successIds.length === 1 ? '' : 's'}
                </p>
              </div>
              {successImages.length > 0 && successImages.length <= 5 && (
                <ul className="mt-2 space-y-1 text-sm text-green-700">
                  {successImages.map(img => (
                    <li key={img.id}>
                      • {img.metadata.label || img.file.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Error Summary */}
          {errorIds.length > 0 && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-900">
                <AlertCircle className="size-5" />
                <p className="font-medium">
                  Failed to commit {errorIds.length} image{errorIds.length === 1 ? '' : 's'}
                </p>
              </div>
              <ul className="mt-2 space-y-2 text-sm text-red-700">
                {errorImages.map(img => (
                  <li key={img.id} className="flex items-start gap-2">
                    <span>•</span>
                    <div className="flex-1">
                      <div className="font-medium">{img.metadata.label || img.file.name}</div>
                      {img.error && (
                        <div className="mt-0.5 text-xs text-red-600">{img.error}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Options */}
          {errorIds.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900">What would you like to do?</p>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleRetryFailed}
                  disabled={commitMutation.isPending}
                  className="w-full justify-start"
                  variant="default"
                >
                  <RefreshCw
                    className={`mr-2 size-4 ${commitMutation.isPending ? 'animate-spin' : ''}`}
                  />
                  Retry Failed Images ({errorIds.length})
                </Button>
                
                <Button
                  onClick={() => {
                    // Open error modal for first failed image
                    if (errorIds.length > 0 && onViewErrorDetails) {
                      onViewErrorDetails(errorIds[0]);
                      onClose();
                    }
                  }}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <AlertCircle className="mr-2 size-4" />
                  View Error Details
                </Button>
                
                <Button
                  onClick={handleRemoveFailed}
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  <X className="mr-2 size-4" />
                  Remove Failed Images
                </Button>
              </div>
            </div>
          )}

          {/* Dismiss Button */}
          <div className="flex justify-end">
            <Button onClick={handleDismiss} variant="outline">
              {errorIds.length === 0 ? 'Done' : 'Dismiss'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

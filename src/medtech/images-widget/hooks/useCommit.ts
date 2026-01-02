/**
 * Hook to commit images to Medtech encounter
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { medtechAPI } from '../services/mock-medtech-api';
import { useImageWidgetStore } from '../stores/imageWidgetStore';
import type { CommitRequest, WidgetImage } from '../types';

/**
 * Generate filename based on metadata
 */
function generateFilename(image: WidgetImage, index: number): string {
  const parts: string[] = [];

  // Add metadata parts in order: Side, Body Site, View, Type, Label
  if (image.metadata.laterality?.display) {
    parts.push(image.metadata.laterality.display);
  }
  if (image.metadata.bodySite?.display) {
    parts.push(image.metadata.bodySite.display);
  }
  if (image.metadata.view?.display) {
    parts.push(image.metadata.view.display);
  }
  if (image.metadata.type?.display) {
    parts.push(image.metadata.type.display);
  }
  if (image.metadata.label) {
    parts.push(image.metadata.label);
  }

  // If no metadata, use index
  if (parts.length === 0) {
    parts.push(`image-${index + 1}`);
  } else {
    // Add index at the end if multiple images
    parts.push(`${index + 1}`);
  }

  // Sanitize filename: remove special chars, replace spaces with hyphens
  const sanitized = parts
    .map(part => part.replace(/[^a-z0-9\s-]/gi, '').replace(/\s+/g, '-'))
    .join('-')
    .toLowerCase();

  // Get original extension
  const originalName = image.file?.name || 'image.jpg';
  const extension = originalName.split('.').pop() || 'jpg';

  return `${sanitized}.${extension === 'jpg' || extension === 'jpeg' ? 'jpg' : extension}`;
}

export function useCommit() {
  const queryClient = useQueryClient();
  const { encounterContext, sessionImages, setImageStatus, setImageResult } = useImageWidgetStore();

  return useMutation({
    mutationFn: async (imageIds: string[]) => {
      if (!encounterContext) {
        throw new Error('No encounter context available');
      }

      // Get images to commit
      const imagesToCommit = sessionImages.filter(img => imageIds.includes(img.id));

      if (imagesToCommit.length === 0) {
        throw new Error('No images selected for commit');
      }

      // Update status to uploading
      imageIds.forEach((id) => {
        setImageStatus(id, 'uploading');
      });

      // Prepare commit request with renamed files
      const request: CommitRequest = {
        encounterId: encounterContext.encounterId,
        files: imagesToCommit.map((img, index) => {
          // Generate filename based on metadata
          const newFilename = generateFilename(img, index);

          // Update file name in store for display
          // Note: The actual file object is not sent in CommitRequest,
          // but we update the name for consistency
          if (img.file) {
            useImageWidgetStore.getState().updateImage(img.id, {
              file: new File([img.file], newFilename, { type: img.file.type }),
            });
          }

          return {
            fileId: img.id,
            meta: {
              label: img.metadata.label,
              bodySite: img.metadata.bodySite,
              laterality: img.metadata.laterality,
              view: img.metadata.view,
              type: img.metadata.type,
            },
            alsoInbox: img.commitOptions?.alsoInbox,
            alsoTask: img.commitOptions?.alsoTask,
            idempotencyKey: `${encounterContext.encounterId}:${img.id}`,
          };
        }),
      };

      // Commit to API
      const response = await medtechAPI.commit(request);

      // Update results and track successes/failures
      const successIds: string[] = [];
      const errorIds: string[] = [];

      response.files.forEach((fileResult) => {
        if (fileResult.status === 'committed' && fileResult.documentReferenceId) {
          setImageResult(fileResult.fileId, {
            documentReferenceId: fileResult.documentReferenceId,
            mediaId: fileResult.mediaId,
            inboxMessageId: fileResult.inboxMessageId,
            taskId: fileResult.taskId,
          });
          successIds.push(fileResult.fileId);
        } else if (fileResult.status === 'error') {
          setImageStatus(fileResult.fileId, 'error', fileResult.error);
          errorIds.push(fileResult.fileId);
        }
      });

      return {
        ...response,
        successIds,
        errorIds,
      };
    },
    onSuccess: () => {
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['medtech', 'images'] });
    },
    onError: (error, imageIds) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to commit';

      // Mark all images as error
      imageIds.forEach((id) => {
        setImageStatus(id, 'error', errorMessage);
      });
    },
  });
}

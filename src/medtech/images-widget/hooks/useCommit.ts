/**
 * Hook to commit images to Medtech encounter
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { medtechAPI } from '../services/mock-medtech-api';
import { useImageWidgetStore } from '../stores/imageWidgetStore';
import type { CommitRequest, WidgetImage } from '../types';

async function fileToBase64DataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

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

      // Prepare commit request with commit-ready sources
      const files: CommitRequest['files'] = await Promise.all(
        imagesToCommit.map(async (img, index) => {
          // Generate filename based on metadata
          const newFilename = generateFilename(img, index);

          // Update file name in store for display
          const renamedFile = img.file
            ? new File([img.file], newFilename, { type: img.file.type })
            : null;

          if (img.file && renamedFile) {
            useImageWidgetStore.getState().updateImage(img.id, { file: renamedFile });
          }

          // Desktop: we still have a File; include base64.
          if (renamedFile) {
            const base64Data = await fileToBase64DataUrl(renamedFile);
            return {
              fileId: img.id,
              contentType: renamedFile.type || 'image/jpeg',
              source: { base64Data },
              meta: {
                title: newFilename,
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
          }

          // Mobile: no File; use stored S3 key so server can presign.
          if (img.s3Key) {
            const mobileTitle = img.metadata.label?.trim()
              ? `${img.metadata.label.trim()}.jpg`
              : `image-${index + 1}.jpg`;
            return {
              fileId: img.id,
              contentType: 'image/jpeg',
              source: { s3Key: img.s3Key },
              meta: {
                title: mobileTitle,
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
          }

          throw new Error(`Cannot commit image ${img.id}; missing File and s3Key`);
        }),
      );

      const request: CommitRequest = {
        encounterId: encounterContext.encounterId,
        patientId: encounterContext.patientId,
        facilityId: encounterContext.facilityId,
        providerId: encounterContext.providerId,
        files,
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

/**
 * Hook to commit images to Medtech encounter
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medtechAPI } from '../services/mock-medtech-api';
import { useImageWidgetStore } from '../stores/imageWidgetStore';
import type { CommitRequest } from '../types';

export function useCommit() {
  const queryClient = useQueryClient();
  const { encounterContext, sessionImages, setImageStatus, setImageResult } = useImageWidgetStore();
  
  return useMutation({
    mutationFn: async (imageIds: string[]) => {
      if (!encounterContext) {
        throw new Error('No encounter context available');
      }
      
      // Get images to commit
      const imagesToCommit = sessionImages.filter((img) => imageIds.includes(img.id));
      
      if (imagesToCommit.length === 0) {
        throw new Error('No images selected for commit');
      }
      
      // Update status to uploading
      imageIds.forEach((id) => {
        setImageStatus(id, 'uploading');
      });
      
      // Prepare commit request
      const request: CommitRequest = {
        encounterId: encounterContext.encounterId,
        files: imagesToCommit.map((img) => ({
          fileId: img.id, // Using widget ID as fileId for mock
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
        })),
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

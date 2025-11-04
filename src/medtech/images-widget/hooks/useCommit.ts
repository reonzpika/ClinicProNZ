/**
 * Hook to commit images to Medtech encounter
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medtechAPI } from '../services/mock-medtech-api';
import { useImageWidgetStore } from '../stores/imageWidgetStore';
import type { CommitRequest } from '../types';
import { useToast } from '@/src/shared/components/ui/toast';

export function useCommit() {
  const queryClient = useQueryClient();
  const { encounterContext, sessionImages, setImageStatus, setImageResult } = useImageWidgetStore();
  const { show: showToast } = useToast();
  
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
      let successCount = 0;
      let errorCount = 0;
      
      response.files.forEach((fileResult) => {
        if (fileResult.status === 'committed' && fileResult.documentReferenceId) {
          setImageResult(fileResult.fileId, {
            documentReferenceId: fileResult.documentReferenceId,
            mediaId: fileResult.mediaId,
            inboxMessageId: fileResult.inboxMessageId,
            taskId: fileResult.taskId,
          });
          successCount++;
        } else if (fileResult.status === 'error') {
          setImageStatus(fileResult.fileId, 'error', fileResult.error);
          errorCount++;
        }
      });
      
      // Show toast notifications
      if (successCount > 0 && errorCount === 0) {
        showToast({
          title: 'Success',
          description: `Successfully committed ${successCount} image${successCount === 1 ? '' : 's'}`,
          variant: 'default',
        });
      } else if (successCount > 0 && errorCount > 0) {
        showToast({
          title: 'Partial Success',
          description: `Committed ${successCount} image${successCount === 1 ? '' : 's'}, ${errorCount} failed`,
          variant: 'default',
        });
      } else if (errorCount > 0) {
        showToast({
          title: 'Commit Failed',
          description: `Failed to commit ${errorCount} image${errorCount === 1 ? '' : 's'}. Click error badges for details.`,
          variant: 'destructive',
        });
      }
      
      return response;
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
      
      // Show error toast
      showToast({
        title: 'Commit Failed',
        description: `Failed to commit ${imageIds.length} image${imageIds.length === 1 ? '' : 's'}. ${errorMessage}`,
        variant: 'destructive',
      });
    },
  });
}

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeaders } from '@/src/shared/utils';
import { resizeImageFile } from '@/src/shared/utils/image';
import type { ImageAnalysis, ServerImage } from '@/src/stores/imageStore';

// resizeImageFile imported from shared utils

// Query Keys
export const imageQueryKeys = {
  all: ['images'] as const,
  lists: () => [...imageQueryKeys.all, 'list'] as const,
  list: (userId: string) => [...imageQueryKeys.lists(), userId] as const,
  downloads: () => [...imageQueryKeys.all, 'downloads'] as const,
  download: (key: string) => [...imageQueryKeys.downloads(), key] as const,
  analyses: () => [...imageQueryKeys.all, 'analyses'] as const,
  analysis: (imageKey: string) => [...imageQueryKeys.analyses(), imageKey] as const,
} as const;

// Server Images Query
export function useServerImages(sessionId?: string) {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();

  return useQuery({
    queryKey: imageQueryKeys.list(`${userId || ''}:${sessionId || ''}`),
    queryFn: async (): Promise<ServerImage[]> => {
      if (!userId) {
        return [];
      }

      const url = sessionId
        ? `/api/clinical-images/list?sessionId=${encodeURIComponent(sessionId)}`
        : '/api/clinical-images/list';

      const response = await fetch(url, {
        headers: createAuthHeaders(userId, userTier),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch images');
      }

      const data = await response.json();
      return data.images || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Upload Image Mutation
export function useUploadImage() {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: File | { file: File; context?: { sessionId?: string; noSession?: boolean } }): Promise<{ key: string }> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Normalise input
      const file = input instanceof File ? input : input.file;
      const ctx = input instanceof File ? undefined : input.context;

      // Resize on client before uploading (keeps original MIME type)
      const resizedBlob = await resizeImageFile(file, 1024);

      // 🆕 SERVER-SIDE SESSION RESOLUTION: No need to pass session ID, server auto-lookups from users.currentSessionId
      const presignParams = new URLSearchParams({
        filename: file.name,
        mimeType: file.type,
      });
      if (ctx?.sessionId) {
 presignParams.set('sessionId', ctx.sessionId);
}
      if (ctx?.noSession) {
 presignParams.set('noSession', '1');
}

      const presignResponse = await fetch(`/api/uploads/presign?${presignParams}`, {
        method: 'GET',
        headers: createAuthHeaders(userId, userTier),
      });

      if (!presignResponse.ok) {
        const errorData = await presignResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { uploadUrl, key } = await presignResponse.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: resizedBlob,
        headers: {
          'Content-Type': file.type,
          'X-Amz-Server-Side-Encryption': 'AES256',
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 upload error:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText,
        });
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      return { key };
    },
    onSuccess: () => {
      // Invalidate and refetch images list
      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.lists(),
      });
    },
  });
}

// Batch Upload Images Mutation
export function useUploadImages() {
  const uploadImage = useUploadImage();
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { files: File[]; names?: Array<{ patientName?: string; identifier?: string; displayName?: string }>; context?: { sessionId?: string; noSession?: boolean } } | File[]): Promise<{ keys: string[] }> => {
      const isArrayInput = Array.isArray(input);
      const files = isArrayInput ? (input as File[]) : (input as { files: File[] }).files;
      const context = (!isArrayInput && (input as any).context) ? ((input as any).context as { sessionId?: string; noSession?: boolean }) : undefined;
      const names = (!isArrayInput && (input as any).names)
        ? ((input as any).names as Array<{ patientName?: string; identifier?: string; displayName?: string }>)
        : [];

      const results: { key: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) {
          throw new Error(`File at index ${i} is undefined`);
        }
        const res = await uploadImage.mutateAsync(context ? { file, context } : file);
        results.push(res);
      }

      // Best-effort metadata batch upsert if provided
      try {
        if (userId && results.length > 0) {
          const today = new Date();
          const y = today.getFullYear();
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const d = String(today.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;

          const items = results.map((r, idx) => {
            const entry = names[idx] || {};
            const parts: string[] = [];
            if (entry.patientName && entry.patientName.trim()) {
 parts.push(entry.patientName.trim());
}
            if (entry.identifier && entry.identifier.trim()) {
 parts.push(entry.identifier.trim());
}
            let displayName: string | undefined;
            if (parts.length > 0) {
              // Provide a client-side displayName with date + time (HH:mm)
              const now = new Date();
              const hh = String(now.getHours()).padStart(2, '0');
              const mm = String(now.getMinutes()).padStart(2, '0');
              displayName = `${parts.join(' ')} ${dateStr} ${hh}:${mm}`.trim();
            }
            return {
              imageKey: r.key,
              ...(entry.patientName ? { patientName: entry.patientName } : {}),
              ...(entry.identifier ? { identifier: entry.identifier } : {}),
              ...(displayName ? { displayName } : {}),
            };
          });
          await fetch('/api/clinical-images/metadata/batch', {
            method: 'POST',
            headers: createAuthHeaders(userId, userTier),
            body: JSON.stringify({ items }),
          });
          // Ensure UI reflects updated display names
          queryClient.invalidateQueries({ queryKey: imageQueryKeys.lists() });
        }
      } catch {}

      return { keys: results.map(r => r.key) };
    },
  });
}

// Rename image mutation
export function useRenameImage() {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageKey, displayName }: { imageKey: string; displayName: string }): Promise<void> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const res = await fetch('/api/clinical-images/metadata', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...createAuthHeaders(userId, userTier) },
        body: JSON.stringify({ imageKey, displayName }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to rename image');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageQueryKeys.lists() });
    },
  });
}

// Image URL Query (for download URLs)
export function useImageUrl(imageKey: string) {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();

  return useQuery({
    queryKey: imageQueryKeys.download(imageKey),
    queryFn: async (): Promise<string> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`/api/uploads/download?key=${encodeURIComponent(imageKey)}`, {
        headers: createAuthHeaders(userId, userTier),
      });

      if (!response.ok) {
        throw new Error('Failed to get image URL');
      }

      const data = await response.json();
      return data.downloadUrl;
    },
    enabled: !!userId && !!imageKey,
    staleTime: 30 * 60 * 1000, // 30 minutes (URLs expire in 1 hour)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Analyze Image Mutation
export function useAnalyzeImage() {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();

  return useMutation({
    mutationFn: async ({
      imageKey,
      imageId,
      prompt,
      sessionId = 'standalone',
      thumbnailUrl, // Use existing thumbnailUrl if available
      onProgress,
    }: {
      imageKey: string;
      imageId: string;
      prompt?: string;
      sessionId?: string;
      thumbnailUrl?: string; // Add thumbnailUrl parameter
      onProgress?: (analysis: string) => void;
    }): Promise<string> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

                  // Fetch image data from frontend to avoid S3 download in backend
      let imageData: string | undefined;

      try {
        let downloadUrl = thumbnailUrl;

        // If no thumbnailUrl provided, fallback to getting presigned URL
        if (!downloadUrl) {
          const urlResponse = await fetch(`/api/uploads/download?key=${encodeURIComponent(imageKey)}`, {
            headers: createAuthHeaders(userId, userTier),
          });

          if (urlResponse.ok) {
            const response = await urlResponse.json();
            downloadUrl = response.downloadUrl;
          } else {
            throw new Error('Failed to get image URL');
          }
        }

        // Fetch image as blob and convert to base64
        if (downloadUrl) {
          const imageResponse = await fetch(downloadUrl);
          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            imageData = base64;
          }
        }
      } catch {
        // Continue without imageData - backend will fallback to S3
      }

      const requestHeaders = createAuthHeaders(userId, userTier);
      const requestBody = {
        imageKey,
        patientSessionId: sessionId,
        imageId,
        prompt: prompt || undefined,
        imageData, // Send base64 image data if available
      };

      const response = await fetch('/api/clinical-images/analyze', {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyse image');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response');
      }

      let analysisText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              return analysisText;
            }

            try {
              const parsed = JSON.parse(data);

              // Handle the actual API format
              if (parsed.description && (parsed.status === 'processing' || parsed.status === 'completed')) {
                analysisText = parsed.description;
                if (onProgress) {
                  onProgress(analysisText);
                }
              } else if (parsed.status === 'error') {
                throw new Error(parsed.error || 'Analysis failed');
              }
            } catch (parseError) {
              // Skip invalid JSON but log for debugging
              console.warn('Failed to parse SSE data:', data, parseError);
            }
          }
        }
      }

      return analysisText;
    },
  });
}

// Save Analysis Mutation
export function useSaveAnalysis() {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageKey,
      prompt,
      result,
      modelUsed,
      sessionId,
    }: {
      imageKey: string;
      prompt?: string;
      result: string;
      modelUsed?: string;
      sessionId?: string;
    }): Promise<{ success: boolean; analysisId: string; message: string }> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/clinical-images/analysis', {
        method: 'POST',
        headers: createAuthHeaders(userId, userTier),
        body: JSON.stringify({
          imageKey,
          prompt,
          result,
          modelUsed,
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save analysis');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate the images list to show updated analysis status
      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.lists(),
      });

      // Invalidate specific analysis query
      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.analysis(variables.imageKey),
      });
    },
  });
}

// Get Analysis Query
export function useImageAnalysis(imageKey: string) {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();

  return useQuery({
    queryKey: imageQueryKeys.analysis(imageKey),
    queryFn: async (): Promise<ImageAnalysis | null> => {
      if (!userId || !imageKey) {
        return null;
      }

      const response = await fetch(`/api/clinical-images/analysis?imageKey=${encodeURIComponent(imageKey)}`, {
        headers: createAuthHeaders(userId, userTier),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to get analysis');
      }

      const data = await response.json();
      return data.analysis;
    },
    enabled: !!userId && !!imageKey,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Delete Image Mutation
export function useDeleteImage() {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageKey: string): Promise<{ success: boolean; message: string }> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/clinical-images/delete', {
        method: 'DELETE',
        headers: createAuthHeaders(userId, userTier),
        body: JSON.stringify({
          imageKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }

      return response.json();
    },
    // Optimistic update - remove image immediately
    onMutate: async (imageKey: string) => {
      if (!userId) {
        return;
      }

      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({
        queryKey: imageQueryKeys.list(userId),
      });

      // Snapshot previous list (it's an array in this app)
      const previousImages = queryClient.getQueryData<ServerImage[]>(imageQueryKeys.list(userId));

      // Optimistically update the cache - remove the image
      if (previousImages) {
        queryClient.setQueryData<ServerImage[]>(
          imageQueryKeys.list(userId),
          previousImages.filter(img => img.key !== imageKey),
        );
      }

      // Return context for potential rollback
      return { previousImages };
    },
    // Rollback on error
    onError: (_error, _imageKey, context) => {
      if (context?.previousImages && userId) {
        // Restore previous data on error
        queryClient.setQueryData(
          imageQueryKeys.list(userId),
          context.previousImages,
        );
      }
    },
    // Ensure cache is clean on success
    onSuccess: (_data, imageKey) => {
      // Remove specific image queries from cache
      queryClient.removeQueries({
        queryKey: imageQueryKeys.download(imageKey),
      });

      queryClient.removeQueries({
        queryKey: imageQueryKeys.analysis(imageKey),
      });

      // Refetch to ensure data consistency (in background)
      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.list(userId || ''),
      });
    },
  });
}

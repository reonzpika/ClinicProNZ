'use client';

import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { Brain, Download, Expand, Loader2, QrCode, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { useSimpleAbly } from '@/src/features/clinical/mobile/hooks/useSimpleAbly';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { imageQueryKeys, useDeleteImage, useImageUrl, useRenameImage, useServerImages } from '@/src/hooks/useImageQueries';
import { createAuthHeaders } from '@/src/shared/utils';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { resizeImageFile } from '@/src/shared/utils/image';
import type { ClinicalImage } from '@/src/types/consultation';

function SessionImageTile({
  image,
  isAnalyzing,
  onAnalyze,
  onEnlarge,
  onDownload,
  onDelete,
  sessionPatientName,
}: {
  image: any;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onEnlarge: () => void;
  onDownload: () => void;
  onDelete: () => void;
  sessionPatientName: string;
}) {
  const { data: imageUrl } = useImageUrl(image.key);
  const renameImage = useRenameImage();
  const baseName = (image.displayName || image.filename || '').replace(/\.[^.]+$/, '');
  const initialIdentifier = React.useMemo(() => {
    // Strip trailing date + #n
    const m = baseName.match(/^(.*)\s\d{4}-\d{2}-\d{2}\s#\d+$/);
    const core = m ? m[1] : baseName;
    // Remove leading session patient name prefix
    const prefix = (sessionPatientName || '').trim();
    if (prefix && core.startsWith(prefix + ' ')) {
      return core.slice(prefix.length + 1);
    }
    return '';
  }, [baseName, sessionPatientName]);
  const [identifier, setIdentifier] = React.useState<string>(initialIdentifier);

  const commitIdentifier = () => {
    const id = identifier.trim();
    if (!id) return;
    // Build new displayName preserving patient and #n if present
    const original = baseName;
    const parts = original.split(' ');
    const dateIdx = parts.findIndex((p: string) => /^\d{4}-\d{2}-\d{2}$/.test(p));
    const hashPos = parts.findIndex((p: string) => /^#\d+$/.test(p));
    const dateStr = dateIdx >= 0 ? parts[dateIdx] : new Date().toISOString().slice(0,10);
    const hashStr = hashPos >= 0 ? parts[hashPos] : '#1';
    const patientPart = (sessionPatientName && sessionPatientName.trim()) || 'Patient';
    const newDisplay = `${patientPart} ${id} ${dateStr} ${hashStr}`.replace(/\s+/g, ' ').trim();
    renameImage.mutate({ imageKey: image.key, displayName: newDisplay });
  };
  return (
    <div className="flex flex-col">
      <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
        {imageUrl
          ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          )
          : (
            <div className="flex size-full items-center justify-center text-xs text-slate-400">No preview</div>
          )}
      </div>
      <div className="mt-2">
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onBlur={commitIdentifier}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitIdentifier();
          }}
          placeholder="Identifier (e.g., left forearm)"
          className="w-full rounded-md border px-2 py-1 text-xs"
        />
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="size-7"
          title={isAnalyzing ? 'Analysing...' : 'Analyse'}
        >
          {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={onEnlarge}
          className="size-7"
          title="Enlarge"
        >
          <Expand size={12} />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={onDownload}
          className="size-7"
          title="Download"
        >
          <Download size={12} />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={onDelete}
          className="size-7 text-red-600 hover:text-red-700"
          title="Delete"
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );
}

export const ClinicalImageTab: React.FC = () => {
  const {
    getCurrentPatientSession,
    addClinicalImage,
    removeClinicalImage,
    saveClinicalImagesToCurrentSession,
    updateImageDescription,
    currentPatientSessionId,
    objectiveText,
    setObjectiveText,
    saveObjectiveToCurrentSession,
  } = useConsultationStores();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzingImages, setAnalyzingImages] = useState<Set<string>>(new Set());
  const [analysisErrors, setAnalysisErrors] = useState<Record<string, string>>({});
  const [enlargeImage, setEnlargeImage] = useState<any | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set());

  // Server images (user scope) for session grouping
  const { userId } = useAuth();
  const { data: serverImages = [], isLoading: isLoadingServerImages } = useServerImages(currentPatientSessionId || undefined);
  const deleteImageMutation = useDeleteImage();
  const sessionServerImages = useMemo(() => {
    const filtered = (serverImages || []).filter((img: any) => img.source === 'clinical' && img.sessionId && img.sessionId === currentPatientSessionId);
    // Filter out images being deleted for optimistic UI
    return filtered.filter((img: any) => !deletingImages.has(img.key));
  }, [serverImages, currentPatientSessionId, deletingImages]);
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  useSimpleAbly({
    userId: userId ?? null,
    isMobile: false,
    onMobileImagesUploaded: () => {
      try {
 queryClientRef.current.invalidateQueries({ queryKey: imageQueryKeys.list(userId || '') });
} catch {}
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = getCurrentPatientSession();
  const sessionPatientName = (currentSession?.patientName as string) || 'Patient';
  const clinicalImages = useMemo(() => {
    const images = currentSession?.clinicalImages || [];
    return images;
  }, [currentSession?.clinicalImages]);

  // Fetch mobile images disabled in simplified architecture (handled via direct uploads)

  // Ably listener for mobile image notifications (desktop only)
  // Desktop image notifications can be re-wired later to user channel if needed

  const handleFileUpload = useCallback(async (file: File) => {
    if (!currentPatientSessionId) {
      setError('No active patient session');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Client-side resize
      const resizedBlob = await resizeImageFile(file, 1024);

      // 🆕 SERVER-SIDE SESSION RESOLUTION: No need to pass session ID, server auto-lookups from users.currentSessionId
      const presignParams = new URLSearchParams({
        filename: file.name,
        mimeType: file.type,
      });

      const presignResponse = await fetch(`/api/uploads/presign?${presignParams}`);
      if (!presignResponse.ok) {
        throw new Error('Failed to get upload URL');
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
        console.error('S3 Upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          headers: Object.fromEntries(uploadResponse.headers.entries()),
          url: uploadUrl,
        });

        const errorText = await uploadResponse.text().catch(() => 'No error details');
        console.error('S3 Error response:', errorText);

        throw new Error(`Failed to upload image (${uploadResponse.status}: ${uploadResponse.statusText})`);
      }

      // Create image metadata
      const newImage: ClinicalImage = {
        id: Math.random().toString(36).substr(2, 9),
        key,
        filename: file.name,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };

      // Add to context and save
      addClinicalImage(newImage);
      await saveClinicalImagesToCurrentSession([...clinicalImages, newImage]);
      
      // Invalidate React Query cache to refresh server images
      queryClient.invalidateQueries({
        queryKey: imageQueryKeys.lists(),
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [
    currentPatientSessionId,
    addClinicalImage,
    saveClinicalImagesToCurrentSession,
    clinicalImages,
    queryClient,
  ]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        await handleFileUpload(file);
      }
    }

    // Clear input for re-selection
    if (event.target) {
      event.target.value = '';
    }
  }, [handleFileUpload]);

  const handleRemoveImage = useCallback(async (imageId: string) => {
    const updatedImages = clinicalImages.filter((img: any) => img.id !== imageId);
    removeClinicalImage(imageId);
    await saveClinicalImagesToCurrentSession(updatedImages);
  }, [clinicalImages, removeClinicalImage, saveClinicalImagesToCurrentSession]);

  const handleDownloadImage = useCallback(async (image: any) => {
    try {
      const response = await fetch(`/api/uploads/download?key=${encodeURIComponent(image.key)}`);
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const { downloadUrl } = await response.json();

      // Fetch blob and force download via anchor
      const fileResp = await fetch(downloadUrl);
      if (!fileResp.ok) {
        throw new Error('Failed to fetch image for download');
      }
      const blob = await fileResp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = image.filename || 'clinical-image';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download image');
    }
  }, []);

  const handleDeleteSessionImage = useCallback(async (imageKey: string) => {
    // Optimistic UI: immediately hide the image
    setDeletingImages(prev => new Set(prev).add(imageKey));
    
    try {
      // Delete in background
      await deleteImageMutation.mutateAsync(imageKey);
      // Successfully deleted - keep it hidden
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      // On error, restore the image
      setDeletingImages(prev => {
        const updated = new Set(prev);
        updated.delete(imageKey);
        return updated;
      });
    }
  }, [deleteImageMutation]);

  const handleAnalyzeImage = useCallback(async (image: ClinicalImage) => {
    if (!currentPatientSessionId) {
      setError('No active patient session');
      return;
    }

    // Clear any previous error for this image
    setAnalysisErrors((prev) => {
      const updated = { ...prev };
      delete updated[image.id];
      return updated;
    });

    // Add image to analyzing set
    setAnalyzingImages(prev => new Set(prev).add(image.id));

    try {
      const response = await fetch('/api/clinical-images/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageKey: image.key,
          patientSessionId: currentPatientSessionId,
          imageId: image.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonData = line.slice(6).trim();
            if (!jsonData) {
              continue;
            }

            try {
              const data = JSON.parse(jsonData);

              if (data.imageId === image.id) {
                if (data.status === 'processing' && data.description) {
                  // Update description in real-time
                  updateImageDescription(image.id, data.description);
                } else if (data.status === 'completed') {
                  // Final update
                  updateImageDescription(image.id, data.description);

                  // Save to session
                  const updatedImages = clinicalImages.map((img: any) =>
                    img.id === image.id
                      ? { ...img, aiDescription: data.description }
                      : img,
                  );
                  await saveClinicalImagesToCurrentSession(updatedImages);

                  // Add analysis to consultation notes
                  const analysisText = `AI Analysis of ${image.filename}:\n${data.description}`.trim();
                  const nextObjective = [String(objectiveText || '').trim(), analysisText].filter(Boolean).join('\n\n');
                  setObjectiveText(nextObjective);
                  await saveObjectiveToCurrentSession(nextObjective);
                } else if (data.status === 'error') {
                  console.error('❌ AI Analysis error:', data.error);
                  throw new Error(data.error || 'Analysis failed');
                }
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', { line, parseError });
            }
          }
        }
      }
    } catch (err) {
      console.error('AI analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';

      setAnalysisErrors(prev => ({
        ...prev,
        [image.id]: errorMessage,
      }));

      if (errorMessage.includes('Unauthorized') || errorMessage.includes('No active patient session')) {
        setError(errorMessage);
      }
    } finally {
      // Remove image from analyzing set
      setAnalyzingImages((prev) => {
        const updated = new Set(prev);
        updated.delete(image.id);
        return updated;
      });
    }
  }, [
    currentPatientSessionId,
    updateImageDescription,
    clinicalImages,
    saveClinicalImagesToCurrentSession,
    objectiveText,
    setObjectiveText,
    saveObjectiveToCurrentSession,
  ]);

  // QR code URL for mobile uploads
  const qrCodeUrl = typeof window !== 'undefined' ? `${window.location.origin}/image` : '';

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Image Grid */}
      {clinicalImages.length > 0 && (
        <div className="space-y-3">
          {clinicalImages.map((image: any) => {
            const isAnalyzing = analyzingImages.has(image.id);
            const hasError = analysisErrors[image.id];

            return (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-700">
                        {image.filename}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(image.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="ml-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAnalyzeImage(image)}
                        disabled={isAnalyzing}
                        className="size-6 p-0"
                        title={isAnalyzing ? 'Analysing...' : 'Analyse with AI'}
                      >
                        {isAnalyzing
                          ? (
                              <Loader2 size={12} className="animate-spin" />
                            )
                          : (
                              <Brain size={12} />
                            )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadImage(image)}
                        className="size-6 p-0"
                      >
                        <Download size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveImage(image.id)}
                        className="size-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>

                  {image.aiDescription && (
                    <div className="mt-2 rounded bg-green-50 p-2 text-xs text-green-600">
                      <div className="font-medium">✓ Analysis completed</div>
                      <div className="text-slate-600">Added to Additional Notes</div>
                    </div>
                  )}

                  {hasError && (
                    <div className="mt-2 rounded bg-red-50 p-2 text-xs text-red-600">
                      <div className="mb-1 font-medium">Analysis Error:</div>
                      {hasError}
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="mt-2 rounded bg-blue-50 p-2 text-xs text-blue-600">
                      <div className="flex items-center gap-2">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Analysing image...</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Session Images (from server under clinical-images/{userId}/{sessionId}/) */}
      {(isLoadingServerImages || sessionServerImages.length > 0) && (
        <div className="border-l-2 border-blue-200 pl-3">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium text-blue-600">Session Images</h4>
            {isLoadingServerImages && <Loader2 size={12} className="animate-spin text-blue-500" />}
          </div>

          {isLoadingServerImages
            ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className="aspect-square animate-pulse rounded-lg bg-slate-200" />
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <div className="size-7 rounded border border-slate-200 bg-slate-100" />
                        <div className="size-7 rounded border border-slate-200 bg-slate-100" />
                        <div className="size-7 rounded border border-slate-200 bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              )
            : (
                <div className="grid grid-cols-2 gap-3">
                  {sessionServerImages.map((image: any) => {
                    const isAnalyzing = analyzingImages.has(image.id);
                    return (
                      <SessionImageTile
                        key={image.id}
                        image={image}
                        isAnalyzing={isAnalyzing}
                        onAnalyze={() => handleAnalyzeImage(image as any)}
                        onEnlarge={() => setEnlargeImage(image)}
                        onDownload={() => handleDownloadImage(image as any)}
                        onDelete={() => handleDeleteSessionImage(image.key)}
                        sessionPatientName={sessionPatientName}
                      />
                    );
                  })}
                </div>
              )}
        </div>
      )}

      {/* Lightbox for enlarged view */}
      {enlargeImage && <EnlargeImageModal image={enlargeImage} onClose={() => setEnlargeImage(null)} />}

      {/* Upload Buttons */}
      <div className="rounded-lg border-2 border-dashed border-slate-200 p-4 text-center">
        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="flex-1 gap-2"
            size="sm"
          >
            {uploading ? 'Uploading...' : 'Add Clinical Image'}
          </Button>
          <Button
            onClick={() => setShowQR(!showQR)}
            variant="outline"
            size="sm"
            title="Mobile Upload"
          >
            <QrCode className="size-4" />
          </Button>
        </div>
        
        {/* QR Code for Mobile Upload */}
        {showQR && (
          <div className="mt-4 border-t pt-4">
            <div className="mb-3">
              <h4 className="mb-1 text-sm font-medium text-slate-700">Mobile Upload</h4>
              <p className="text-xs text-slate-600">
                Scan with your mobile device
              </p>
            </div>
            <div className="flex items-center justify-center">
              <QRCodeSVG
                value={qrCodeUrl}
                size={120}
                className="rounded-lg border border-slate-200"
              />
            </div>
          </div>
        )}
        
        <p className="mt-2 text-xs text-slate-500">
          Images are automatically resized and securely stored. Select multiple files to upload at once.
        </p>
      </div>

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

// Enlarge Image Modal Component
function EnlargeImageModal({ image, onClose }: { image: any; onClose: () => void }) {
  const { data: imageUrl } = useImageUrl(image.key);
  const isLoadingUrl = !imageUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose();
        }
      }}
      aria-label="Close modal"
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed right-4 top-4 z-10 text-white hover:bg-white/20"
      >
        ✕
      </Button>

      {/* Image Container */}
      <div className="max-h-full max-w-full">
        {isLoadingUrl ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-12 animate-spin text-white" />
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={image.filename || 'Clinical image'}
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-white">
            <p>Failed to load image</p>
          </div>
        )}
      </div>

      {/* Image Info */}
      {image.filename && (
        <div className="fixed bottom-4 left-4 rounded-lg bg-black/60 px-3 py-2 text-white">
          <p className="text-sm font-medium">{image.filename}</p>
          {image.uploadedAt && (
            <p className="text-xs opacity-75">
              {new Date(image.uploadedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

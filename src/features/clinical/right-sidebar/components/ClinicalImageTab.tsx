'use client';

import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { Brain, Download, Expand, Loader2, QrCode, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { useSimpleAbly } from '@/src/features/clinical/mobile/hooks/useSimpleAbly';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { imageQueryKeys, useDeleteImage, useImageUrl, useRenameImage, useServerImages } from '@/src/hooks/useImageQueries';
import { Button } from '@/src/shared/components/ui/button';
import { GalleryTileSkeleton } from '@/src/shared/components/ui/gallery-tile-skeleton';
import { Card, CardContent } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { resizeImageFile } from '@/src/shared/utils/image';
import type { ClinicalImage } from '@/src/types/consultation';
import { useToast } from '@/src/shared/components/ui/toast';

function SessionImageTile({
  image,
  isAnalyzing,
  onAnalyze,
  onEnlarge,
  onDownload,
  onDelete,
  selectionMode,
  selected,
  onToggleSelect,
  onActivateSelection,
}: {
  image: any;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onEnlarge: () => void;
  onDownload: () => void;
  onDelete: () => void;
  selectionMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onActivateSelection: () => void;
}) {
  // Prefer server-provided thumbnailUrl; otherwise request presigned URL for the full image key
  const { data: imageUrlData } = useImageUrl(image.thumbnailUrl ? '' : image.key);
  const imageUrl = image.thumbnailUrl || imageUrlData;
  const renameImage = useRenameImage();
  const baseName = (image.displayName || image.filename || '').replace(/\.[^.]+$/, '');
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [nameValue, setNameValue] = React.useState(image.displayName || baseName);
  const commitRename = () => {
    const cleaned = nameValue.trim();
    if (!cleaned) { setIsRenaming(false); return; }
    renameImage.mutate({ imageKey: image.key, displayName: cleaned });
    setIsRenaming(false);
  };
  return (
    <div className="group flex flex-col">
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 group"
        onClick={(e) => {
          if (selectionMode) {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect();
            return;
          }
          onAnalyze();
        }}
      >
        {imageUrl
          ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          )
          : (
            <div className="flex size-full items-center justify-center text-xs text-slate-400">No preview</div>
          )}
        {/* Checkbox top-left */}
        <div className={`absolute left-2 top-2 z-10 ${selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              if (!selectionMode) onActivateSelection();
              else onToggleSelect();
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        {isRenaming ? (
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            className="w-full rounded-md border px-2 py-1 text-xs"
          />
        ) : (
          <>
            <div
              className="min-w-0 flex-1 truncate text-xs text-slate-700 cursor-text"
              onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}
              role="button"
            >
              {image.displayName || image.filename}
            </div>
          </>
        )}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
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
  // removed upload spinner state
  const [error, setError] = useState<string | null>(null);
  const [analyzingImages, setAnalyzingImages] = useState<Set<string>>(new Set());
  const [analysisErrors, setAnalysisErrors] = useState<Record<string, string>>({});
  const [enlargeImage, setEnlargeImage] = useState<any | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set());
  // Selection state for bulk download
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Server images (user scope) for session grouping
  const { userId } = useAuth();
  const [inFlightUploads, setInFlightUploads] = useState(0);
  const [completedUploads, setCompletedUploads] = useState(0);
  const { show: showToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const { data: serverImages = [], isLoading: isLoadingServerImages } = useServerImages(currentPatientSessionId || undefined);
  const deleteImageMutation = useDeleteImage();
  const sessionServerImages = useMemo(() => {
    const filtered = (serverImages || []).filter((img: any) => img.source === 'clinical' && img.sessionId && img.sessionId === currentPatientSessionId);
    // Filter out images being deleted for optimistic UI
    return filtered.filter((img: any) => !deletingImages.has(img.key));
  }, [serverImages, currentPatientSessionId, deletingImages]);
  // Optimistic previews for immediate thumbnail display
  // Placeholder-only flow on consultation widget
  // Desktop placeholders with mapping; replaced when server image with expectedKey arrives
  const [desktopPlaceholders, setDesktopPlaceholders] = useState<Array<{ id: string; clientHash?: string; expectedKey?: string }>>([]);
  // Removed pendingBatches; we rely on cache invalidation and Ably refresh to replace optimistics
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  useSimpleAbly({
    userId: userId ?? null,
    isMobile: false,
    onImageUploadStarted: (count) => {
      const n = Math.max(0, count || 0);
      setInFlightUploads(prev => prev + n);
      if (n > 0) {
        const ids: string[] = [];
        for (let i = 0; i < n; i++) ids.push(Math.random().toString(36).slice(2));
        setMobilePlaceholders(prev => [...ids, ...prev]);
      }
    },
    onImageUploaded: () => {
      setInFlightUploads(prev => Math.max(0, prev - 1));
      try { queryClientRef.current.invalidateQueries({ queryKey: imageQueryKeys.lists() }); } catch {}
      setCompletedUploads((c) => c + 1);
    },
    onImageProcessed: () => {
      try { queryClientRef.current.invalidateQueries({ queryKey: imageQueryKeys.lists() }); } catch {}
    },
  });

  // Mobile placeholders in consultation grid (added via Ably events)
  const [mobilePlaceholders, setMobilePlaceholders] = useState<string[]>([]);

  // Show toast when uploads complete
  React.useEffect(() => {
    if (inFlightUploads === 0 && completedUploads > 0) {
      const n = completedUploads;
      showToast({ title: 'Images added', description: `${n} image${n === 1 ? '' : 's'} added`, durationMs: 4000 });
      setCompletedUploads(0);
    }
  }, [inFlightUploads, completedUploads, showToast]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = getCurrentPatientSession();
  const clinicalImages = useMemo(() => {
    const images = currentSession?.clinicalImages || [];
    return images;
  }, [currentSession?.clinicalImages]);

  // Fetch mobile images disabled in simplified architecture (handled via direct uploads)

  // Ably listener for mobile image notifications (desktop only)
  // Desktop image notifications can be re-wired later to user channel if needed

  // Build a server-like filename so optimistic tiles match the eventual server object naming
  const buildServerLikeFilename = useCallback((file: File): string => {
    const parts = new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const get = (t: string) => parts.find(p => p.type === t)?.value || '';
    const yyyy = get('year');
    const mm = get('month');
    const dd = get('day');
    const hh = get('hour');
    const mi = get('minute');
    const ss = get('second');
    const ms = String(new Date().getMilliseconds()).padStart(3, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const compactTime = `${hh}${mi}${ss}${ms}`;
    const ext = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
    const safePatient = (currentSession?.patientName || 'Patient').replaceAll('/', '-');
    return `${safePatient} ${dateStr} ${compactTime}${ext}`.trim();
  }, [currentSession?.patientName]);

  // Compute client fingerprint (SHA-1 of first 128KB + size + lastModified)
  const computeClientHash = useCallback(async (file: File): Promise<string> => {
    try {
      const chunk = file.slice(0, 128 * 1024);
      const buf = await chunk.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-1', buf);
      const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
      return `${file.size}-${file.lastModified}-${hex}`;
    } catch {
      return `${file.size}-${file.lastModified}`;
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File, clientHash?: string, placeholderId?: string) => {
    if (!currentPatientSessionId) {
      setError('No active patient session');
      return;
    }

    setError(null);

  try {
      // Client-side resize
      const resizedBlob = await resizeImageFile(file, 1024);

      // 🆕 SERVER-SIDE SESSION RESOLUTION: No need to pass session ID, server auto-lookups from users.currentSessionId
      const presignParams = new URLSearchParams({
        filename: file.name,
        mimeType: file.type,
      });
      if (clientHash) presignParams.set('clientHash', clientHash);

      const presignResponse = await fetch(`/api/uploads/presign?${presignParams}`);
      if (!presignResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, key } = await presignResponse.json();
      // Attach expectedKey to matching desktop placeholder immediately
      if (placeholderId && key) {
        setDesktopPlaceholders(prev => prev.map(ph => ph.id === placeholderId ? { ...ph, expectedKey: String(key) } : ph));
      }

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

      // Default naming: set displayName via metadata so /image shows correct name immediately
      try {
        await fetch('/api/clinical-images/metadata/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ imageKey: key, patientName: (currentSession?.patientName as string) || undefined }] }),
        });
      } catch {}

      // Create image metadata
      const newImage: ClinicalImage = {
        id: Math.random().toString(36).substr(2, 9),
        key,
        filename: buildServerLikeFilename(file),
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
      // no-op; placeholders will be replaced by server tiles
    }
  }, [
    currentPatientSessionId,
    addClinicalImage,
    saveClinicalImagesToCurrentSession,
    clinicalImages,
    queryClient,
    buildServerLikeFilename,
  ]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    // Desktop placeholders with clientHash mapping
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      // eslint-disable-next-line no-await-in-loop
      const hash = await computeClientHash(file);
      const phId = Math.random().toString(36).slice(2);
      setDesktopPlaceholders(prev => [{ id: phId, clientHash: hash }, ...prev]);
      // eslint-disable-next-line no-await-in-loop
      await handleFileUpload(file, hash, phId);
    }

    // Clear input for re-selection
    if (event.target) {
      event.target.value = '';
    }
  }, [handleFileUpload, currentPatientSessionId, sessionServerImages.length]);

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
      {
        const baseName = (image.displayName || image.filename || '').replace(/\.[^.]+$/, '');
        const ext = image.filename && image.filename.includes('.') ? `.${image.filename.split('.').pop()}` : '';
        a.download = `${baseName}${ext}`.trim() || 'clinical-image';
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download image');
    }
  }, []);

  // Bulk download helpers
  const getDownloadUrl = useCallback(async (key: string): Promise<string> => {
    const res = await fetch(`/api/uploads/download?key=${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error('Failed to get download URL');
    const data = await res.json();
    return data.downloadUrl as string;
  }, []);

  const bulkDownload = useCallback(async (images: Array<{ key: string; filename: string; displayName?: string }>) => {
    if (!images || images.length === 0) return;
    // Fetch URLs with concurrency 10 (batching)
    const results: Array<{ url: string; name: string } | null> = new Array(images.length).fill(null);
    for (let i = 0; i < images.length; i += 10) {
      const slice = images.slice(i, i + 10);
      const urls = await Promise.all(slice.map(async (img) => {
        const url = await getDownloadUrl(img.key);
        const baseName = (img.displayName || img.filename || '').replace(/\.[^.]+$/, '');
        const ext = img.filename && img.filename.includes('.') ? `.${img.filename.split('.').pop()}` : '';
        const name = `${baseName}${ext}`.trim();
        return { url, name };
      }));
      for (let j = 0; j < urls.length; j++) {
        results[i + j] = urls[j] ?? null;
      }
    }
    // Trigger downloads sequentially using blob URLs to force save
    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      if (!item) continue;
      try {
        // eslint-disable-next-line no-await-in-loop
        const resp = await fetch(item.url);
        if (!resp.ok) continue;
        // eslint-disable-next-line no-await-in-loop
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = item.name;
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch {}
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }, [getDownloadUrl]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      const next = !prev;
      if (!next) setSelectedKeys(new Set());
      return next;
    });
  }, []);

  const toggleSelectKey = useCallback((key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedKeys(new Set(sessionServerImages.map((img: any) => img.key)));
  }, [sessionServerImages]);

  const clearSelection = useCallback(() => setSelectedKeys(new Set()), []);

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
      setDeletingImages((prev) => {
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
                        {(() => {
                          const date = new Date(image.uploadedAt);
                          const parts = new Intl.DateTimeFormat('en-NZ', {
                            timeZone: 'Pacific/Auckland',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          }).formatToParts(date);
                          const get = (t: string) => parts.find(p => p.type === t)?.value || '';
                          return `${get('day')}/${get('month')}/${get('year')}`;
                        })()}
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
      {(isLoadingServerImages || sessionServerImages.length > 0 || mobilePlaceholders.length > 0) && (
        <div
          className={`border-l-2 pl-3 ${isDragging ? 'border-blue-400 border-dashed bg-blue-50/50' : 'border-blue-200'}`}
          onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            try {
              const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
              // Desktop placeholders with clientHash mapping
              for (const file of files) {
                // eslint-disable-next-line no-await-in-loop
                const hash = await computeClientHash(file);
                const phId = Math.random().toString(36).slice(2);
                setDesktopPlaceholders(prev => [{ id: phId, clientHash: hash }, ...prev]);
                // eslint-disable-next-line no-await-in-loop
                await handleFileUpload(file, hash, phId);
              }
            } catch {
              setError('Failed to upload dropped files');
            }
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2" />
            <div className="flex items-center gap-2">
              {inFlightUploads > 0 && (
                <span className="flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  <Loader2 size={12} className="animate-spin" />
                  Receiving {inFlightUploads}
                </span>
              )}
              {selectionMode && (
                <span className="text-xs text-slate-600">{selectedKeys.size} selected</span>
              )}
              <Button type="button" size="sm" variant="outline" onClick={toggleSelectionMode}>
                {selectionMode ? 'Exit selection' : 'Select'}
              </Button>
              {selectionMode && (
                <>
                  <Button type="button" size="sm" variant="outline" onClick={selectAllVisible}>Select all</Button>
                  <Button type="button" size="sm" variant="outline" onClick={clearSelection}>Clear</Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const items = sessionServerImages.filter((img: any) => selectedKeys.has(img.key));
                      bulkDownload(items as any);
                    }}
                    disabled={selectedKeys.size === 0}
                  >
                    Download selected
                  </Button>
                </>
              )}
              {isLoadingServerImages && <Loader2 size={12} className="animate-spin text-blue-500" />}
            </div>
          </div>

          {isDragging && (
            <div className="mb-2 rounded border border-dashed border-blue-300 bg-blue-50 p-2 text-center text-xs text-blue-700">Drop images to upload</div>
          )}
          {isLoadingServerImages
            ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <GalleryTileSkeleton key={idx} />
                  ))}
                </div>
              )
            : (
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    // Remove desktop placeholders as soon as their expected server key appears
                    const serverKeys = new Set(sessionServerImages.map((img: any) => img.key));
                    const desktopPending = desktopPlaceholders.filter(ph => !ph.expectedKey || !serverKeys.has(ph.expectedKey));
                    const placeholderTiles: any[] = [
                      ...mobilePlaceholders.map((id) => ({ id: `mobile-ph-${id}`, key: `mobile-ph:${id}`, filename: 'Uploading…', thumbnailUrl: undefined, uploadedAt: new Date().toISOString(), source: 'clinical', sessionId: currentPatientSessionId })),
                      ...desktopPending.map(ph => ({ id: `desktop-ph-${ph.id}`, key: `desktop-ph:${ph.id}`, filename: 'Uploading…', thumbnailUrl: undefined, uploadedAt: new Date().toISOString(), source: 'clinical', sessionId: currentPatientSessionId })),
                    ];
                    return [...placeholderTiles, ...sessionServerImages];
                  })().map((image: any) => {
                    const isAnalyzing = analyzingImages.has(image.id);
                    return (
                      <div key={image.id} className="relative">
                        <SessionImageTile
                          image={image}
                          isAnalyzing={isAnalyzing}
                          onAnalyze={() => handleAnalyzeImage(image as any)}
                          onEnlarge={() => setEnlargeImage(image)}
                          onDownload={() => handleDownloadImage(image as any)}
                          onDelete={() => handleDeleteSessionImage(image.key)}
                          selectionMode={selectionMode}
                          selected={selectedKeys.has(image.key)}
                          onToggleSelect={() => toggleSelectKey(image.key)}
                          onActivateSelection={() => {
                            if (!selectionMode) {
                              setSelectionMode(true);
                              setSelectedKeys(new Set([image.key]));
                            }
                          }}
                        />
                      </div>
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
            variant="outline"
            className="flex-1 gap-2"
            size="sm"
          >
            Add Clinical Image
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
      <div className="max-h-full max-w-full" role="img" aria-label="Enlarged image">
        {isLoadingUrl
? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-12 animate-spin text-white" />
          </div>
        )
: imageUrl
? (
          <img
            src={imageUrl}
            alt={image.filename || 'Clinical image'}
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        )
: (
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

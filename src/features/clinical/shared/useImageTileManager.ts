import { useCallback, useRef, useState } from 'react';
import type { ServerImage } from '@/src/stores/imageStore';
import { imageQueryKeys, useUploadImages } from '@/src/hooks/useImageQueries';
import { computeClientHash } from '@/src/shared/utils/clientHash';
import { useQueryClient } from '@tanstack/react-query';

export type PlaceholderTile = {
  id: string;
  type: 'desktop' | 'mobile';
  // Fingerprint for reconciliation when server arrives
  clientHash?: string;
  // Expected server key if known (desktop batch response)
  expectedKey?: string;
  // Optional sessionId context so pages can filter immediately
  sessionId?: string;
};

export function useImageTileManager(params: { sessionId?: string | null }) {
  const { sessionId } = params;
  // Placeholders across sources
  const [placeholders, setPlaceholders] = useState<PlaceholderTile[]>([]);
  const uploadImages = useUploadImages();
  const queryClient = useQueryClient();
  const invalidateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastServerCountRef = useRef<number>(0);

  // Public API: add mobile placeholders by count
  const addMobilePlaceholders = useCallback((count: number) => {
    if (count <= 0) return [] as string[];
    const ids: string[] = [];
    for (let i = 0; i < count; i++) ids.push(Math.random().toString(36).slice(2));
    const tiles: PlaceholderTile[] = ids.map(id => ({ id, type: 'mobile', sessionId: sessionId ?? undefined }));
    setPlaceholders(prev => [...tiles, ...prev]);
    return ids;
  }, [sessionId]);

  // Public API: reconcile when server images update (by expectedKey or clientHash)
  const reconcileWithServer = useCallback((serverImages: ServerImage[]) => {
    if (placeholders.length === 0) {
      lastServerCountRef.current = serverImages.length;
      return;
    }
    // 1) Remove any placeholders that now have a matching server image by key or clientHash
    let nextPlaceholders: PlaceholderTile[] = [];
    setPlaceholders(prev => {
      nextPlaceholders = prev.filter(ph => {
        if (ph.expectedKey && serverImages.some(img => img.key === ph.expectedKey)) return false;
        if (ph.clientHash && serverImages.some(img => img.clientHash && img.clientHash === ph.clientHash)) return false;
        return true;
      });
      return nextPlaceholders;
    });

    // 2) If server count increased but we still have mobile placeholders without mapping,
    //    remove the oldest mobile placeholders equal to the delta (best-effort reconcile).
    const prevCount = lastServerCountRef.current;
    const currCount = serverImages.length;
    const delta = Math.max(0, currCount - prevCount);
    if (delta > 0) {
      setPlaceholders(prev => {
        let remaining = [...prev];
        let toRemove = delta;
        for (let i = remaining.length - 1; i >= 0 && toRemove > 0; i--) {
          const ph = remaining[i];
          if (ph.type === 'mobile' && !ph.expectedKey && !ph.clientHash) {
            remaining.splice(i, 1);
            toRemove -= 1;
          }
        }
        return remaining;
      });
    }
    lastServerCountRef.current = currCount;
  }, [placeholders.length]);

  // Public API: desktop upload with immediate placeholders
  const uploadDesktopFiles = useCallback(async (files: File[], context?: { sessionId?: string; noSession?: boolean }) => {
    if (!files || files.length === 0) return { placeholderIds: [] as string[], returnedKeys: [] as string[] };

    // Create placeholders with clientHash
    const placeholderIds: string[] = [];
    const phWithHash: Array<{ id: string; clientHash: string }> = [];
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const hash = await computeClientHash(file);
      const id = Math.random().toString(36).slice(2);
      placeholderIds.push(id);
      phWithHash.push({ id, clientHash: hash });
    }
    setPlaceholders(prev => [
      ...phWithHash.map(ph => ({ id: ph.id, type: 'desktop', clientHash: ph.clientHash, sessionId: context?.sessionId })),
      ...prev,
    ]);

    // Upload via batch helper
    try {
      const result = await uploadImages.mutateAsync({ files, context });
      const returnedKeys: string[] = Array.isArray((result as any)?.keys) ? (result as any).keys : [];
      if (returnedKeys.length) {
        setPlaceholders(prev => {
          const next = [...prev];
          // Attach expectedKey to the first N placeholders we just created
          let idx = 0;
          for (let i = 0; i < next.length && idx < returnedKeys.length; i++) {
            const ph = next[i];
            if (ph.type === 'desktop' && placeholderIds.includes(ph.id)) {
              next[i] = { ...ph, expectedKey: returnedKeys[idx++] };
            }
          }
          return next;
        });
      }
      // Trigger a debounced list refresh
      if (!invalidateTimerRef.current) {
        invalidateTimerRef.current = setTimeout(() => {
          try { queryClient.invalidateQueries({ queryKey: imageQueryKeys.lists() }); } catch {}
          invalidateTimerRef.current = null;
        }, 400);
      }
      return { placeholderIds, returnedKeys };
    } catch (err) {
      // Remove the placeholders on failure
      setPlaceholders(prev => prev.filter(ph => !placeholderIds.includes(ph.id)));
      throw err;
    }
  }, [uploadImages, queryClient]);

  // Derived: renderable tiles for a given server list
  const deriveTiles = useCallback((serverImages: ServerImage[]) => {
    // Filter placeholders that still do not match any server image
    const unresolved = placeholders.filter(ph => {
      if (ph.expectedKey && serverImages.some(img => img.key === ph.expectedKey)) return false;
      if (ph.clientHash && serverImages.some(img => img.clientHash && img.clientHash === ph.clientHash)) return false;
      return true;
    });

    const placeholderTiles: ServerImage[] = unresolved.map(ph => ({
      id: `${ph.type}-placeholder-${ph.id}`,
      key: `${ph.type}-placeholder:${ph.id}`,
      filename: 'Uploading…',
      mimeType: 'image/jpeg',
      size: 0,
      uploadedAt: new Date().toISOString(),
      source: 'clinical',
      thumbnailUrl: undefined,
      sessionId: ph.sessionId,
    }));

    return [...placeholderTiles, ...serverImages];
  }, [placeholders]);

  return {
    // state
    placeholders,
    // actions
    addMobilePlaceholders,
    uploadDesktopFiles,
    reconcileWithServer,
    // selectors
    deriveTiles,
  };
}

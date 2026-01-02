/**
 * Ably Session Sync Hook
 *
 * Subscribes to real-time image uploads via Ably
 * Fetches session images eagerly when notified
 */

import Ably from 'ably';
import { nanoid } from 'nanoid';
import { useEffect, useRef } from 'react';

import { useImageWidgetStore } from '../stores/imageWidgetStore';
import type { WidgetImage } from '../types';

export function useAblySessionSync(encounterId: string | null | undefined) {
  const { addImage, sessionImages } = useImageWidgetStore();
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const hasInitialFetchRef = useRef(false);

  useEffect(() => {
    if (!encounterId) {
      console.log('[Ably Sync] No encounterId, skipping sync');
      return;
    }

    const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;

    if (!ablyApiKey) {
      console.error('[Ably Sync] ABLY_API_KEY not configured');
      return;
    }

    console.log('[Ably Sync] Initializing session sync', { encounterId });

    // Initialize Ably client (client-side)
    const ably = new Ably.Realtime({ key: ablyApiKey });
    ablyRef.current = ably;

    const channelName = `session:${encounterId}`;
    const channel = ably.channels.get(channelName);

    // Fetch existing session images on mount (eager fetch)
    async function fetchSessionImages() {
      try {
        console.log('[Ably Sync] Fetching existing session images', { encounterId });

        const response = await fetch(`/api/medtech/session/images/${encounterId}`);

        if (!response.ok) {
          console.warn('[Ably Sync] Failed to fetch session images:', response.statusText);
          return;
        }

        const data = await response.json();

        console.log('[Ably Sync] Fetched session images', {
          encounterId,
          count: data.images?.length || 0,
        });

        // Add images to store (if not already present)
        if (data.images && data.images.length > 0) {
          for (const img of data.images) {
            // Check if image already exists in store
            const exists = sessionImages.some(storeImg =>
              storeImg.previewUrl === img.downloadUrl,
            );

            if (!exists && img.downloadUrl) {
              const widgetImage: WidgetImage = {
                id: nanoid(),
                file: null, // No file object for mobile uploads
                previewUrl: img.downloadUrl,
                s3Key: img.s3Key,
                metadata: {
                  laterality: img.metadata?.laterality
                    ? {
                        system: undefined,
                        code: img.metadata.laterality.code || '',
                        display: img.metadata.laterality.display || '',
                      }
                    : undefined,
                  bodySite: img.metadata?.bodySite
                    ? {
                        system: undefined,
                        code: img.metadata.bodySite.code || '',
                        display: img.metadata.bodySite.display || '',
                      }
                    : undefined,
                  notes: img.metadata?.notes,
                },
                status: 'pending',
                commitOptions: {},
              };

              addImage(widgetImage);
              console.log('[Ably Sync] Added image from session', { s3Key: img.s3Key });
            }
          }
        }

        hasInitialFetchRef.current = true;
      }
      catch (error) {
        console.error('[Ably Sync] Error fetching session images:', error);
      }
    }

    // Subscribe to image-uploaded events
    channel.subscribe('image-uploaded', async (message) => {
      console.log('[Ably Sync] Image uploaded event received', {
        encounterId,
        data: message.data,
      });

      // Fetch latest session images (includes newly uploaded image)
      await fetchSessionImages();
    });

    // Initial fetch on mount
    fetchSessionImages();

    // Cleanup
    return () => {
      console.log('[Ably Sync] Cleaning up', { encounterId });
      channel.unsubscribe();
      ably.close();
      ablyRef.current = null;
      hasInitialFetchRef.current = false;
    };
  }, [encounterId]); // Only depend on encounterId (not addImage to avoid re-init)
}

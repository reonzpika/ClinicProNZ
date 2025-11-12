/**
 * Hook to connect to mobile session WebSocket/SSE for real-time updates
 *
 * Uses Server-Sent Events (SSE) since Vercel doesn't support WebSocket
 */

import { useEffect, useRef, useState } from 'react';

import { useImageWidgetStore } from '../stores/imageWidgetStore';

type SSEMessage = {
  type: 'connected' | 'images_received' | 'session_expired' | 'heartbeat' | 'error';
  token?: string;
  images?: Array<{
    id: string;
    contentType: string;
    sizeBytes: number;
    metadata?: {
      bodySite?: { system?: string; code: string; display: string };
      laterality?: { system?: string; code: string; display: string };
      view?: { system?: string; code: string; display: string };
      type?: { system?: string; code: string; display: string };
      label?: string;
    };
    uploadedAt: number;
  }>;
  timestamp?: number;
  message?: string;
};

export function useMobileSessionWebSocket(token: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatRef = useRef<number>(Date.now());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastImageIdRef = useRef<string | null>(null); // Track last received image ID to avoid duplicates
  const addImageRef = useRef(useImageWidgetStore.getState().addImage);

  // Keep addImage ref updated
  useEffect(() => {
    addImageRef.current = useImageWidgetStore.getState().addImage;
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 2000; // Base delay: 2 seconds

    const connect = () => {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Clear existing intervals
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      try {
        const sseUrl = `/api/medtech/mobile/ws/${token}`;
        console.log('[WebSocket] Connecting to SSE:', sseUrl);
        const eventSource = new EventSource(sseUrl);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('[WebSocket] Connected to mobile session, token:', token);
          setIsConnected(true);
          setError(null);
          reconnectAttempts = 0;
          lastHeartbeatRef.current = Date.now();
          
          // Clear any pending reconnect timeout to prevent duplicate connections
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        eventSource.onmessage = (event) => {
          try {
            // Validate event data exists
            if (!event.data) {
              return;
            }

            const message: SSEMessage = JSON.parse(event.data);

            switch (message.type) {
              case 'connected':
                console.log('[WebSocket] Session connected:', message.token);
                break;

              case 'images_received':
                if (message.images && message.images.length > 0) {
                  console.log('[WebSocket] Received images:', message.images.length);
                  
                  // Filter to only new images (not already in store)
                  const existingImageIds = new Set(
                    useImageWidgetStore.getState().sessionImages.map(img => img.id),
                  );
                  
                  const newImages = message.images.filter(img => {
                    // Skip if already in store
                    if (existingImageIds.has(img.id)) {
                      return false;
                    }
                    // If we have a lastImageIdRef, only process images after it
                    if (lastImageIdRef.current) {
                      // For now, accept all new images (we'll track the latest ID after processing)
                      return true;
                    }
                    return true; // First batch, accept all
                  });

                  if (newImages.length === 0) {
                    break; // No new images
                  }

                  // Fetch full image data from session endpoint (only for new images)
                  const imageIds = newImages.map(img => img.id);
                  fetch(`/api/medtech/mobile/session/${token}/images`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.images) {
                        // Process only new images
                        const imagesToProcess = data.images.filter((img: any) => imageIds.includes(img.id));
                        
                        imagesToProcess.forEach((img: any) => {
                          // Check if already added (double-check)
                          const existingImage = useImageWidgetStore.getState().sessionImages.find(
                            existing => existing.id === img.id,
                          );
                          if (existingImage) {
                            return; // Skip if already added
                          }

                          // Convert base64 to File
                          const base64Data = img.base64Data;
                          const byteCharacters = atob(base64Data);
                          const byteNumbers = new Array(byteCharacters.length);
                          for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                          }
                          const byteArray = new Uint8Array(byteNumbers);
                          const blob = new Blob([byteArray], { type: img.contentType });
                          const file = new File([blob], `mobile-${img.id}.jpg`, { type: img.contentType });

                          // Create preview URL
                          const preview = URL.createObjectURL(file);

                          // Create WidgetImage
                          const widgetImage = {
                            id: img.id,
                            file,
                            preview,
                            thumbnail: undefined,
                            metadata: {
                              bodySite: img.metadata?.bodySite,
                              laterality: img.metadata?.laterality,
                              view: img.metadata?.view,
                              type: img.metadata?.type,
                              label: img.metadata?.label,
                            },
                            status: 'pending' as const,
                          };

                          // Add to store
                          addImageRef.current(widgetImage);
                        });

                        // Update last image ID (use the most recent uploadedAt)
                        const latestImage = imagesToProcess.reduce((latest: any, current: any) => {
                          return (!latest || current.uploadedAt > latest.uploadedAt) ? current : latest;
                        }, null);
                        if (latestImage) {
                          lastImageIdRef.current = latestImage.id;
                        }
                      }
                    })
                    .catch(err => {
                      console.error('[WebSocket] Failed to fetch images:', err);
                    });
                }
                break;

              case 'session_expired':
                console.log('[WebSocket] Session expired');
                setError('Session expired. Please scan QR code again.');
                eventSource.close();
                break;

              case 'heartbeat':
                lastHeartbeatRef.current = Date.now();
                break;

              case 'error':
                console.error('[WebSocket] Error:', message.message);
                setError(message.message || 'Connection error');
                break;
            }
          } catch (err) {
            console.error('[WebSocket] Failed to parse message:', err);
          }
        };

        eventSource.onerror = (err) => {
          console.error('[WebSocket] Connection error:', err);
          setIsConnected(false);

          // Check if we should reconnect
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            // Exponential backoff: baseDelay * 2^(attempt-1)
            const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts - 1);
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log(`[WebSocket] Reconnecting (attempt ${reconnectAttempts}, delay ${delay}ms)...`);
              connect();
            }, delay);
          } else {
            setError('Failed to connect. Please refresh the page.');
            eventSource.close();
          }
        };

        // Heartbeat monitoring - if no heartbeat for 30 seconds, reconnect
        heartbeatIntervalRef.current = setInterval(() => {
          const timeSinceLastHeartbeat = Date.now() - lastHeartbeatRef.current;
          if (timeSinceLastHeartbeat > 30000) {
            console.log('[WebSocket] No heartbeat received, reconnecting...');
            connect();
          }
        }, 5000); // Check every 5 seconds
      } catch (err) {
        console.error('[WebSocket] Failed to create connection:', err);
        setError('Failed to connect. Please refresh the page.');
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      // Reset last image ID on disconnect
      lastImageIdRef.current = null;
    };
  }, [token]); // Removed addImage from dependencies (using ref instead)

  return {
    isConnected,
    error,
  };
}

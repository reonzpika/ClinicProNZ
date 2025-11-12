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

  const { addImage } = useImageWidgetStore();

  useEffect(() => {
    if (!token) {
      return;
    }

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 2000; // 2 seconds

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
        const eventSource = new EventSource(`/api/medtech/mobile/ws/${token}`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('[WebSocket] Connected to mobile session');
          setIsConnected(true);
          setError(null);
          reconnectAttempts = 0;
          lastHeartbeatRef.current = Date.now();
        };

        eventSource.onmessage = (event) => {
          try {
            const message: SSEMessage = JSON.parse(event.data);

            switch (message.type) {
              case 'connected':
                console.log('[WebSocket] Session connected:', message.token);
                break;

              case 'images_received':
                if (message.images && message.images.length > 0) {
                  console.log('[WebSocket] Received images:', message.images.length);
                  // Fetch images from session endpoint
                  fetch(`/api/medtech/mobile/session/${token}/images`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.images) {
                        // Process each image
                        data.images.forEach((img: any) => {
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

                          // Add to store (check if not already added)
                          const existingImage = useImageWidgetStore.getState().sessionImages.find(
                            existing => existing.id === img.id,
                          );
                          if (!existingImage) {
                            addImage(widgetImage);
                          }
                        });
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
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log(`[WebSocket] Reconnecting (attempt ${reconnectAttempts})...`);
              connect();
            }, reconnectDelay * reconnectAttempts);
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
    };
  }, [token, addImage]);

  return {
    isConnected,
    error,
  };
}

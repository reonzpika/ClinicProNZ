/**
 * WebSocket/SSE endpoint for real-time mobile upload updates
 *
 * Note: Vercel doesn't support WebSocket, so we use Server-Sent Events (SSE)
 * Client connects via EventSource API
 */

import { getMobileSession } from '@/src/lib/services/medtech/mobile-session-storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!token) {
    return new Response('token is required', { status: 400 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let isConnected = true;
      let pollInterval: NodeJS.Timeout | null = null;

      // Send initial connection message
      const send = (data: object) => {
        if (!isConnected) {
          return; // Don't send if disconnected
        }
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          // Client disconnected, stop sending
          isConnected = false;
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }
      };

      send({ type: 'connected', token });

      // Poll for new images every 2 seconds
      let lastImageCount = 0;
      let isPolling = false; // Flag to prevent concurrent polls
      pollInterval = setInterval(async () => {
        // Prevent concurrent poll iterations
        if (!isConnected || isPolling) {
          return;
        }

        isPolling = true;

        try {
          const session = await getMobileSession(token);

          // Check connection state again after async operation
          if (!isConnected) {
            isPolling = false;
            return;
          }

          if (!session) {
            // Session expired - cleanup atomically
            isConnected = false;
            isPolling = false;
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
            try {
              send({ type: 'session_expired' });
              controller.close();
            } catch {
              // Ignore errors if stream already closed
            }
            return;
          }

          // Double-check connection before sending
          if (!isConnected) {
            isPolling = false;
            return;
          }

          const currentImageCount = session.images.length;

          // If new images detected, send them
          if (currentImageCount > lastImageCount) {
            const newImages = session.images.slice(lastImageCount);
            try {
              send({
                type: 'images_received',
                images: newImages.map(img => ({
                  id: img.id,
                  contentType: img.contentType,
                  sizeBytes: img.sizeBytes,
                  metadata: img.metadata,
                  uploadedAt: img.uploadedAt,
                })),
              });
              lastImageCount = currentImageCount;
            } catch {
              // Stream closed, stop polling
              isConnected = false;
              isPolling = false;
              if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
              }
              return;
            }
          }

          // Send heartbeat only if still connected
          if (isConnected) {
            try {
              send({ type: 'heartbeat', timestamp: Date.now() });
            } catch {
              // Stream closed, stop polling
              isConnected = false;
              isPolling = false;
              if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
              }
              return;
            }
          }
        } catch (error) {
          console.error('[SSE] Error polling session:', error);
          if (isConnected) {
            try {
              send({ type: 'error', message: 'Failed to poll session' });
            } catch {
              // Stream closed, stop polling
              isConnected = false;
            }
          }
        } finally {
          isPolling = false;
        }
      }, 2000); // Poll every 2 seconds

      // Cleanup on client disconnect
      const cleanup = () => {
        isConnected = false;
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        try {
          controller.close();
        } catch {
          // Ignore errors during cleanup
        }
      };

      if (request.signal) {
        request.signal.addEventListener('abort', cleanup);
      }

      // Also handle stream errors
      stream.cancel = () => {
        cleanup();
        return Promise.resolve();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

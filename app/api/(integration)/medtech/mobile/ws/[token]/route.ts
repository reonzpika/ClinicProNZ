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

      // Send initial connection message
      const send = (data: object) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      send({ type: 'connected', token });

      // Poll for new images every 2 seconds
      let lastImageCount = 0;
      const pollInterval = setInterval(async () => {
        try {
          const session = await getMobileSession(token);

          if (!session) {
            send({ type: 'session_expired' });
            clearInterval(pollInterval);
            controller.close();
            return;
          }

          const currentImageCount = session.images.length;

          // If new images detected, send them
          if (currentImageCount > lastImageCount) {
            const newImages = session.images.slice(lastImageCount);
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
          }

          // Send heartbeat
          send({ type: 'heartbeat', timestamp: Date.now() });
        } catch (error) {
          console.error('[SSE] Error polling session:', error);
          send({ type: 'error', message: 'Failed to poll session' });
        }
      }, 2000); // Poll every 2 seconds

      // Cleanup on client disconnect
      if (request.signal) {
        request.signal.addEventListener('abort', () => {
          clearInterval(pollInterval);
          controller.close();
        });
      }
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

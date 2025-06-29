import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { WebSocketServer } from 'ws';

import { db } from '@/client';
import { WebSocketManager } from '@/lib/services/websocket-manager';
import { mobileTokens } from '@/schema/mobile_tokens';

// Global WebSocket server instance
let wss: WebSocketServer | null = null;

// Initialize WebSocket server (singleton pattern)
function getWebSocketServer(): WebSocketServer {
  if (!wss) {
    wss = new WebSocketServer({
      port: 8080,
      path: '/ws/mobile',
    });

    wss.on('connection', async (ws, req) => {
      try {
        // Extract token from query params
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');
        const deviceId = url.searchParams.get('deviceId') || `mobile-${Date.now()}`;
        const deviceName = url.searchParams.get('deviceName') || 'Mobile Device';

        if (!token) {
          ws.close(1008, 'Missing token');
          return;
        }

        // Validate token and get user
        const tokenRecord = await db
          .select()
          .from(mobileTokens)
          .where(eq(mobileTokens.token, token))
          .limit(1);

        if (tokenRecord.length === 0 || tokenRecord[0]!.expiresAt < new Date()) {
          ws.close(1008, 'Invalid or expired token');
          return;
        }

        const { userId } = tokenRecord[0]!;

        // Add connection to manager
        WebSocketManager.addConnection(userId, ws, deviceId, deviceName);

        // Update last used timestamp
        await db
          .update(mobileTokens)
          .set({
            lastUsedAt: new Date(),
            deviceId,
            deviceName,
          })
          .where(eq(mobileTokens.token, token));

        // Send connection confirmation
        ws.send(JSON.stringify({
          type: 'connected',
          userId,
          deviceId,
          message: 'Connected successfully',
        }));

        // Handle incoming messages
        ws.on('message', async (data) => {
          try {
            const message = JSON.parse(data.toString());

            // Broadcast transcription to other devices
            if (message.type === 'transcription') {
              WebSocketManager.broadcastToUser(userId, {
                type: 'transcription',
                transcript: message.transcript,
                patientSessionId: message.patientSessionId,
                deviceId,
              }, deviceId);
            }
          } catch {
            // Error processing WebSocket message
          }
        });
      } catch {
        // WebSocket connection error
        ws.close(1011, 'Server error');
      }
    });

    // WebSocket server started on port 8080
  }

  return wss;
}

// This endpoint is used to start the WebSocket server
// The actual WebSocket connection happens on ws://localhost:8080/ws/mobile
export async function GET(_req: NextRequest) {
  try {
    // Initialize WebSocket server if not already running
    getWebSocketServer();

    return NextResponse.json({
      success: true,
      message: 'Ably integration active - WebSocket server no longer needed',
    });
  } catch {
    // Error starting WebSocket server
    return NextResponse.json(
      { error: 'Failed to start WebSocket server' },
      { status: 500 },
    );
  }
}

// Endpoint to get connection status for a user
export async function POST(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connectedDevices = WebSocketManager.getConnectedDevices(userId);
    const stats = WebSocketManager.getStats();

    return NextResponse.json({
      connectedDevices: connectedDevices.map(device => ({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        connectedAt: device.connectedAt,
        lastSeen: device.lastSeen,
      })),
      stats,
    });
  } catch {
    // Error getting connection status
    return NextResponse.json(
      { error: 'Failed to get connection status' },
      { status: 500 },
    );
  }
}

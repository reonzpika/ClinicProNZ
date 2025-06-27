import type { WebSocket } from 'ws';

export type WSMessage = {
  type: 'switch_patient' | 'transcription' | 'device_connected' | 'device_disconnected' | 'session_created';
  userId?: string;
  patientSessionId?: string;
  transcript?: string;
  deviceId?: string;
  deviceName?: string;
  patientName?: string;
  data?: any;
};

export type ConnectedDevice = {
  ws: WebSocket;
  deviceId: string;
  deviceName: string;
  userId: string;
  connectedAt: number;
  lastSeen: number;
};

// In-memory store for WebSocket connections
// In production, use Redis for horizontal scaling
const userConnections: Map<string, Set<ConnectedDevice>> = new Map();

export class WebSocketManager {
  /**
   * Add a new WebSocket connection for a user
   */
  static addConnection(userId: string, ws: WebSocket, deviceId: string, deviceName: string): void {
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }

    const device: ConnectedDevice = {
      ws,
      deviceId,
      deviceName,
      userId,
      connectedAt: Date.now(),
      lastSeen: Date.now(),
    };

    userConnections.get(userId)!.add(device);

    // Set up heartbeat to track connection health
    ws.on('pong', () => {
      device.lastSeen = Date.now();
    });

    // Cleanup on disconnect
    ws.on('close', () => {
      WebSocketManager.removeConnection(userId, deviceId);
    });

    // Notify other devices about new connection
    WebSocketManager.broadcastToUser(userId, {
      type: 'device_connected',
      deviceId,
      deviceName,
    }, deviceId);
  }

  /**
   * Remove a WebSocket connection
   */
  static removeConnection(userId: string, deviceId: string): void {
    const userDevices = userConnections.get(userId);
    if (!userDevices) {
      return;
    }

    const deviceToRemove = Array.from(userDevices).find(d => d.deviceId === deviceId);
    if (deviceToRemove) {
      userDevices.delete(deviceToRemove);

      // Notify other devices about disconnection
      WebSocketManager.broadcastToUser(userId, {
        type: 'device_disconnected',
        deviceId,
      }, deviceId);

      // Clean up empty user connections
      if (userDevices.size === 0) {
        userConnections.delete(userId);
      }
    }
  }

  /**
   * Broadcast message to all devices for a user (except sender)
   */
  static broadcastToUser(userId: string, message: WSMessage, excludeDeviceId?: string): void {
    const userDevices = userConnections.get(userId);
    if (!userDevices) {
      return;
    }

    const messageStr = JSON.stringify(message);

    userDevices.forEach((device) => {
      if (excludeDeviceId && device.deviceId === excludeDeviceId) {
        return;
      }

      if (device.ws.readyState === device.ws.OPEN) {
        device.ws.send(messageStr);
        device.lastSeen = Date.now();
      }
    });
  }

  /**
   * Send message to specific device
   */
  static sendToDevice(userId: string, deviceId: string, message: WSMessage): boolean {
    const userDevices = userConnections.get(userId);
    if (!userDevices) {
      return false;
    }

    const device = Array.from(userDevices).find(d => d.deviceId === deviceId);
    if (!device || device.ws.readyState !== device.ws.OPEN) {
      return false;
    }

    device.ws.send(JSON.stringify(message));
    device.lastSeen = Date.now();
    return true;
  }

  /**
   * Get connected devices for a user
   */
  static getConnectedDevices(userId: string): ConnectedDevice[] {
    const userDevices = userConnections.get(userId);
    return userDevices ? Array.from(userDevices) : [];
  }

  /**
   * Health check - ping all connections and remove stale ones
   */
  static performHealthCheck(): void {
    const now = Date.now();
    const STALE_THRESHOLD = 60000; // 1 minute

    userConnections.forEach((devices, userId) => {
      devices.forEach((device) => {
        if (now - device.lastSeen > STALE_THRESHOLD) {
          // Connection is stale, remove it
          WebSocketManager.removeConnection(userId, device.deviceId);
        } else if (device.ws.readyState === device.ws.OPEN) {
          // Ping healthy connections
          device.ws.ping();
        }
      });
    });
  }

  /**
   * Get statistics for monitoring
   */
  static getStats(): {
    totalUsers: number;
    totalConnections: number;
    usersWithMultipleDevices: number;
  } {
    let totalConnections = 0;
    let usersWithMultipleDevices = 0;

    userConnections.forEach((devices) => {
      totalConnections += devices.size;
      if (devices.size > 1) {
        usersWithMultipleDevices++;
      }
    });

    return {
      totalUsers: userConnections.size,
      totalConnections,
      usersWithMultipleDevices,
    };
  }
}

// Start health check interval
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(() => {
    WebSocketManager.performHealthCheck();
  }, 30000); // Every 30 seconds
}

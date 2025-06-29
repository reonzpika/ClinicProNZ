import { useCallback, useEffect, useRef, useState } from 'react';

import type { WSMessage } from '@/lib/services/websocket-manager';

// Extended message types for WebSocket communication
type ExtendedWSMessage = WSMessage | {
  type: 'connected' | 'pong' | 'ping' | 'force_disconnect';
  deviceId?: string;
  deviceName?: string;
  targetDeviceId?: string;
  [key: string]: any;
};

type WebSocketSyncHookProps = {
  enabled: boolean;
  token?: string;
  isDesktop?: boolean; // true for desktop, false for mobile
  onTranscriptionReceived?: (transcript: string, patientSessionId?: string) => void;
  onPatientSwitched?: (patientSessionId: string, patientName?: string) => void;
  onDeviceConnected?: (deviceId: string, deviceName: string, deviceType?: string) => void;
  onDeviceDisconnected?: (deviceId: string) => void;
  onError?: (error: string) => void;
};

type ConnectionState = {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectedDevices: Array<{ deviceId: string; deviceName: string; connectedAt: number }>;
  error?: string;
  lastSeen?: number;
};

export const useWebSocketSync = ({
  enabled,
  token,
  isDesktop = true,
  onTranscriptionReceived,
  onPatientSwitched,
  onDeviceConnected,
  onDeviceDisconnected,
  onError,
}: WebSocketSyncHookProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    connectedDevices: [],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 1000; // Start with 1 second
  const HEARTBEAT_INTERVAL = 30000; // 30 seconds

  // Generate device info - use stable ID to prevent duplicates
  const deviceInfoRef = useRef<{ deviceId: string; deviceName: string } | null>(null);

  const getDeviceInfo = useCallback(() => {
    if (!deviceInfoRef.current) {
      const isMobile = !isDesktop;
      const deviceType = isMobile ? 'Mobile' : 'Desktop';

      // Generate descriptive device name
      let deviceName = `${deviceType} Device`;
      if (typeof window !== 'undefined') {
        const userAgent = navigator.userAgent;

        // Detect device platform
        let platform = '';
        if (/iPhone|iPod/.test(userAgent)) {
          platform = 'iPhone';
        } else if (/iPad/.test(userAgent)) {
          platform = 'iPad';
        } else if (/Android/.test(userAgent)) {
          platform = 'Android';
        } else if (/Macintosh/.test(userAgent)) {
          platform = 'Mac';
        } else if (/Windows/.test(userAgent)) {
          platform = 'Windows';
        } else if (/Linux/.test(userAgent)) {
          platform = 'Linux';
        }

        // Detect browser
        let browser = '';
        if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
          browser = 'Chrome';
        } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
          browser = 'Safari';
        } else if (/Firefox/.test(userAgent)) {
          browser = 'Firefox';
        } else if (/Edge/.test(userAgent)) {
          browser = 'Edge';
        }

        // Combine platform and browser for descriptive name
        if (platform && browser) {
          deviceName = `${platform} ${browser}`;
        } else if (platform) {
          deviceName = platform;
        } else if (browser) {
          deviceName = `${deviceType} ${browser}`;
        }
      }

      const deviceId = `${deviceType.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      deviceInfoRef.current = { deviceId, deviceName };
    }

    return deviceInfoRef.current;
  }, [isDesktop]);

  // Clean up connection
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
  }, []);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  // Handle WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: ExtendedWSMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'connected':
          setConnectionState(prev => ({ ...prev, status: 'connected', error: undefined }));
          reconnectAttemptsRef.current = 0;
          startHeartbeat();
          break;

        case 'transcription':
          if (message.transcript && onTranscriptionReceived) {
            onTranscriptionReceived(message.transcript, message.patientSessionId);
          }
          break;

        case 'switch_patient':
          if (message.patientSessionId && onPatientSwitched) {
            onPatientSwitched(message.patientSessionId, message.patientName);
          }
          break;

        case 'device_connected': {
          if (message.deviceId && message.deviceName && onDeviceConnected) {
            const deviceType = 'deviceType' in message ? (message.deviceType as string) : undefined;
            onDeviceConnected(message.deviceId, message.deviceName, deviceType);
            setConnectionState(prev => ({
              ...prev,
              connectedDevices: [
                ...prev.connectedDevices.filter(d => d.deviceId !== message.deviceId),
                {
                  deviceId: message.deviceId!,
                  deviceName: message.deviceName!,
                  connectedAt: Date.now(),
                },
              ],
            }));
          }
          break;
        }

        case 'device_disconnected':
          if (message.deviceId && onDeviceDisconnected) {
            onDeviceDisconnected(message.deviceId);
            setConnectionState(prev => ({
              ...prev,
              connectedDevices: prev.connectedDevices.filter(d => d.deviceId !== message.deviceId),
            }));
          }
          break;

        case 'pong':
          setConnectionState(prev => ({ ...prev, lastSeen: Date.now() }));
          break;

        case 'force_disconnect': {
          // Check if this device is being targeted for disconnection
          const { deviceId: currentDeviceId } = getDeviceInfo();
          if (message.targetDeviceId === currentDeviceId) {
            // Clean up and disconnect this device
            cleanup();
          }
          break;
        }

        default:
      }
    } catch {
      // Error parsing WebSocket message - silently ignore malformed messages
    }
  }, [onTranscriptionReceived, onPatientSwitched, onDeviceConnected, onDeviceDisconnected, startHeartbeat]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled) {
      return;
    }

    // Prevent duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    // For desktop, we can connect without a specific mobile token
    // Desktop will use a special identifier to receive broadcasts

    cleanup();

    try {
      setConnectionState(prev => ({ ...prev, status: 'connecting', error: undefined }));

      const { deviceId, deviceName } = getDeviceInfo();
      // For desktop, use a special token or the provided mobile token
      const connectionToken = token || (isDesktop ? 'desktop-listener' : '');
      const wsUrl = `ws://localhost:8080/ws/mobile?token=${connectionToken}&deviceId=${deviceId}&deviceName=${encodeURIComponent(deviceName)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Connection opened successfully
      };

      ws.onmessage = handleMessage;

      ws.onclose = () => {
        if (enabled && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAY * 2 ** reconnectAttemptsRef.current;
          reconnectAttemptsRef.current += 1;

          setConnectionState(prev => ({
            ...prev,
            status: 'connecting',
            error: `Reconnecting... (attempt ${reconnectAttemptsRef.current})`,
          }));

          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else {
          setConnectionState(prev => ({
            ...prev,
            status: 'error',
            error: 'Connection failed after multiple attempts',
          }));
          onError?.('Failed to connect to WebSocket server');
        }
      };

      ws.onerror = () => {
        setConnectionState(prev => ({
          ...prev,
          status: 'error',
          error: 'Connection error occurred',
        }));
      };
    } catch {
      setConnectionState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to create connection',
      }));
      onError?.('Failed to create WebSocket connection');
    }
  }, [enabled, token, getDeviceInfo, handleMessage, cleanup, onError]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Send transcription to other devices
  const sendTranscription = useCallback((transcript: string, patientSessionId?: string) => {
    return sendMessage({
      type: 'transcription',
      transcript,
      patientSessionId,
    });
  }, [sendMessage]);

  // Notify about patient switch (desktop only)
  const notifyPatientSwitch = useCallback((patientSessionId: string, patientName?: string) => {
    return sendMessage({
      type: 'switch_patient',
      patientSessionId,
      patientName,
    });
  }, [sendMessage]);

  // Force disconnect a specific device
  const forceDisconnectDevice = useCallback((targetDeviceId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'force_disconnect',
        targetDeviceId,
      }));
      return true;
    }
    return false;
  }, []);

  // Initialize WebSocket server (desktop only)
  const initializeWebSocketServer = useCallback(async () => {
    if (!isDesktop) {
      return;
    }

    try {
      await fetch('/api/ws/mobile');
    } catch {
      // Failed to initialize WebSocket server - silently continue
    }
  }, [isDesktop]);

  // Connect when enabled
  useEffect(() => {
    if (enabled) {
      if (isDesktop) {
        // Desktop connects immediately when enabled to listen for mobile connections
        initializeWebSocketServer().then(() => {
          // Small delay to ensure server is ready
          setTimeout(connect, 1000);
        });
      } else {
        // Mobile connects only when token is available
        if (token) {
          setTimeout(connect, 1000);
        } else {
          cleanup();
        }
      }
    } else {
      cleanup();
    }

    return cleanup;
  }, [enabled, token, isDesktop, connect, cleanup, initializeWebSocketServer]);

  return {
    connectionState,
    sendTranscription,
    notifyPatientSwitch,
    forceDisconnectDevice,
    reconnect: connect,
    disconnect: cleanup,
  };
};

import * as Ably from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';

// Message types for Ably communication
type AblyMessage = {
  type: 'transcription' | 'switch_patient' | 'device_connected' | 'device_disconnected' | 'session_created' | 'force_disconnect';
  userId?: string;
  patientSessionId?: string;
  transcript?: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  patientName?: string;
  targetDeviceId?: string; // For targeting specific devices to disconnect
  data?: any;
};

type AblySyncHookProps = {
  enabled: boolean;
  token?: string;
  isDesktop?: boolean; // true for desktop, false for mobile
  onTranscriptionReceived?: (transcript: string, patientSessionId?: string) => void;
  onPatientSwitched?: (patientSessionId: string, patientName?: string) => void;
  onDeviceConnected?: (deviceId: string, deviceName: string, deviceType?: string) => void;
  onDeviceDisconnected?: (deviceId: string) => void;
  onError?: (error: string | null) => void;
};

type ConnectionState = {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectedDevices: Array<{
    deviceId: string;
    deviceName: string;
    deviceType?: string;
    presenceKey?: string;
    connectedAt: number;
  }>;
  error?: string;
  lastSeen?: number;
};

export const useAblySync = ({
  enabled,
  token,
  isDesktop = true,
  onTranscriptionReceived,
  onPatientSwitched,
  onDeviceConnected,
  onDeviceDisconnected,
  onError,
}: AblySyncHookProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    connectedDevices: [],
  });

  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [processedMessageIds] = useState(new Set<string>());

  // Get userId from token API when needed
  const getUserId = useCallback(async () => {
    if (userId) {
      return userId;
    }

    try {
      const response = await fetch('/api/ably/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        // Extract userId from tokenRequest if available
        const userIdFromToken = data.tokenRequest?.clientId;
        if (userIdFromToken) {
          setUserId(userIdFromToken);
          return userIdFromToken;
        }
      }
    } catch (error) {
      console.error('Error getting userId:', error);
    }

    return null;
  }, [userId]);

  // Generate stable device info for identification
  const getDeviceInfo = useCallback(() => {
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

    // Create stable deviceId based on browser session and device type
    // This prevents duplicate devices when reconnecting
    let deviceId = '';
    if (typeof window !== 'undefined') {
      // Use sessionStorage for browser session persistence
      const storageKey = `ably-device-${deviceType.toLowerCase()}`;
      deviceId = sessionStorage.getItem(storageKey) || '';

      if (!deviceId) {
        // Generate new stable ID only once per browser session
        deviceId = `${deviceType.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        sessionStorage.setItem(storageKey, deviceId);
      }
    } else {
      // Fallback for server-side rendering
      deviceId = `${deviceType.toLowerCase()}-server`;
    }

    return { deviceId, deviceName, deviceType };
  }, [isDesktop]);

  // Clean up connection - Added safety checks
  const cleanup = useCallback(() => {
    try {
      if (channelRef.current) {
        channelRef.current.detach();
        channelRef.current = null;
      }

      if (ablyRef.current) {
        // Check if connection is still open before closing
        if (ablyRef.current.connection.state !== 'closed' && ablyRef.current.connection.state !== 'closing') {
          ablyRef.current.close();
        }
        ablyRef.current = null;
      }

      setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
    } catch {
      // Silently handle cleanup errors - connection might already be closed
      setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
    }
  }, []);

  // Handle Ably messages
  const handleMessage = useCallback((message: Ably.Message) => {
    try {
      const data: AblyMessage = message.data;

      // Create unique message ID for deduplication
      const messageId = `${data.type}-${message.timestamp}-${data.deviceId || 'unknown'}`;

      // Skip if we've already processed this message
      if (processedMessageIds.has(messageId)) {
        return;
      }

      // Mark message as processed
      processedMessageIds.add(messageId);

      // Clean up old message IDs (keep last 100)
      if (processedMessageIds.size > 100) {
        const oldestIds = Array.from(processedMessageIds).slice(0, processedMessageIds.size - 100);
        oldestIds.forEach(id => processedMessageIds.delete(id));
      }

      switch (data.type) {
        case 'transcription':
          if (data.transcript && onTranscriptionReceived) {
            onTranscriptionReceived(data.transcript, data.patientSessionId);
          }
          break;

        case 'switch_patient':
          if (data.patientSessionId && onPatientSwitched) {
            onPatientSwitched(data.patientSessionId, data.patientName);
          }
          break;

        case 'session_created':
          // Handle new session creation broadcast
          if (data.patientSessionId && data.patientName) {
            // New session created
          }
          break;

        case 'device_connected':
          if (data.deviceId && data.deviceName && onDeviceConnected) {
            onDeviceConnected(data.deviceId, data.deviceName, data.deviceType);
            const presenceKey = `${data.userId}-${data.deviceType}`;
            setConnectionState(prev => ({
              ...prev,
              connectedDevices: [
                ...prev.connectedDevices.filter(d => d.presenceKey !== presenceKey),
                {
                  deviceId: data.deviceId!,
                  deviceName: data.deviceName!,
                  deviceType: data.deviceType,
                  presenceKey,
                  connectedAt: Date.now(),
                },
              ],
            }));
          }
          break;

        case 'device_disconnected':
          if (data.deviceId && onDeviceDisconnected) {
            onDeviceDisconnected(data.deviceId);
            const presenceKey = `${data.userId}-${data.deviceType}`;
            setConnectionState(prev => ({
              ...prev,
              connectedDevices: prev.connectedDevices.filter(d => d.presenceKey !== presenceKey),
            }));
          }
          break;

        case 'force_disconnect': {
          // Check if this device is being targeted for disconnection
          const { deviceId: currentDeviceId } = getDeviceInfo();
          if (data.targetDeviceId === currentDeviceId) {
            // Clean up and disconnect this device
            cleanup();
          }
          break;
        }

        default:
          // Unknown message type
      }
    } catch (error) {
      console.error('Error handling Ably message:', error);
    }
  }, [onTranscriptionReceived, onPatientSwitched, onDeviceConnected, onDeviceDisconnected, processedMessageIds]);

  // Connect to Ably - Improved connection management
  const connect = useCallback(async () => {
    if (!enabled) {
      return;
    }

    // Prevent duplicate connections
    if (ablyRef.current?.connection.state === 'connected' || ablyRef.current?.connection.state === 'connecting') {
      return;
    }

    // Only cleanup if we have a failed/closed connection
    if (ablyRef.current?.connection.state === 'failed' || ablyRef.current?.connection.state === 'closed') {
      cleanup();
    }

    try {
      setConnectionState(prev => ({ ...prev, status: 'connecting', error: undefined }));
      // Clear any previous errors when starting a new connection attempt
      onError?.(null);

      // Get userId first - this will be our clientId
      const currentUserId = await getUserId();
      if (!currentUserId) {
        throw new Error('Failed to get user ID');
      }

      const { deviceId, deviceName, deviceType } = getDeviceInfo();

      // Create Ably client with token-based auth using userId as clientId
      const ably = new Ably.Realtime({
        authCallback: async (_tokenParams, callback) => {
          try {
            const response = await fetch('/api/ably/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
              throw new Error('Failed to get Ably token');
            }

            const { tokenRequest } = await response.json();
            callback(null, tokenRequest);
          } catch (error) {
            callback(error as Ably.ErrorInfo, null);
          }
        },
        // Use userId as clientId to match the token
        clientId: currentUserId,
      });

      ablyRef.current = ably;

      // Use user-based channel for both desktop and mobile to enable communication
      // Both desktop and mobile connect to the same user channel
      const channelName = `user-${currentUserId}`;
      const channel = ably.channels.get(channelName);
      channelRef.current = channel;

      // Connection state handlers
      ably.connection.on('connected', () => {
        setConnectionState(prev => ({ ...prev, status: 'connected', error: undefined }));
        // Clear any previous connection errors
        onError?.(null);

        // Announce device connection with both deviceId and userId
        channel.publish('device_connected', {
          type: 'device_connected',
          deviceId,
          deviceName,
          deviceType,
          userId: currentUserId,
        });
      });

      ably.connection.on('disconnected', () => {
        setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
      });

      ably.connection.on('failed', (_error) => {
        setConnectionState(prev => ({
          ...prev,
          status: 'error',
          error: 'Connection failed',
        }));
        onError?.('Failed to connect to Ably');
      });

      // Subscribe to messages
      channel.subscribe(handleMessage);

      // Handle presence for device tracking with unique key per device type
      channel.presence.enter({
        deviceId,
        deviceName,
        userId: currentUserId,
        deviceType,
        // Use deviceType as key to prevent duplicates
        presenceKey: `${currentUserId}-${deviceType}`,
      });

      channel.presence.subscribe('enter', (member) => {
        if (member.data?.deviceId && member.data?.deviceName && member.data?.deviceType) {
          setConnectionState(prev => ({
            ...prev,
            connectedDevices: [
              // Filter by presenceKey to prevent duplicates of same device type
              ...prev.connectedDevices.filter(d => d.presenceKey !== member.data.presenceKey),
              {
                deviceId: member.data.deviceId,
                deviceName: member.data.deviceName,
                deviceType: member.data.deviceType,
                presenceKey: member.data.presenceKey,
                connectedAt: Date.now(),
              },
            ],
          }));
        }
      });

      channel.presence.subscribe('leave', (member) => {
        if (member.data?.presenceKey) {
          setConnectionState(prev => ({
            ...prev,
            connectedDevices: prev.connectedDevices.filter(d => d.presenceKey !== member.data.presenceKey),
          }));
        }
      });
    } catch (error) {
      console.error('Error connecting to Ably:', error);
      setConnectionState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to create connection',
      }));
      onError?.('Failed to create Ably connection');
    }
  }, [enabled, token, getUserId, getDeviceInfo, handleMessage, cleanup, onError, isDesktop]);

  // Send message through Ably
  const sendMessage = useCallback((message: AblyMessage) => {
    if (channelRef.current && ablyRef.current?.connection.state === 'connected') {
      channelRef.current.publish(message.type, message);
      return true;
    }
    return false;
  }, []);

  // Connect when enabled - Fixed dependencies to prevent cleanup loops
  useEffect(() => {
    // Prevent duplicate connections in React Strict Mode
    if (ablyRef.current?.connection.state === 'connected'
      || ablyRef.current?.connection.state === 'connecting') {
      return;
    }

    if (enabled) {
      if (isDesktop) {
        // Desktop: Don't connect immediately on page load to avoid unnecessary errors
        // Connection will be established when actually needed (e.g., when recording starts)
      } else {
        // Mobile connects only when token is available
        if (token) {
          connect();
        } else {
          cleanup();
        }
      }
    } else {
      cleanup();
    }

    // Only cleanup on unmount or when disabled
    return () => {
      if (!enabled) {
        cleanup();
      }
    };
  }, [enabled, token, isDesktop]); // Removed connect and cleanup from dependencies

  // Auto-connect for desktop when first transcription or device interaction happens
  const ensureConnection = useCallback(async () => {
    if (!enabled) {
      return false;
    }

    if (ablyRef.current?.connection.state === 'connected') {
      return true;
    }

    if (ablyRef.current?.connection.state === 'connecting') {
      // Wait for current connection attempt
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (ablyRef.current?.connection.state === 'connected') {
            resolve(true);
          } else if (ablyRef.current?.connection.state === 'failed'
            || ablyRef.current?.connection.state === 'disconnected') {
            resolve(false);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    // Start connection
    await connect();
    return ablyRef.current?.connection.state === 'connected';
  }, [enabled, connect]);

  // Enhanced send methods that ensure connection first
  const sendTranscription = useCallback(async (transcript: string, patientSessionId?: string) => {
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return false;
    }

    const { deviceId, deviceType } = getDeviceInfo();
    return sendMessage({
      type: 'transcription',
      transcript,
      patientSessionId,
      deviceId,
      deviceType,
    });
  }, [ensureConnection, sendMessage, getDeviceInfo]);

  // Enhanced notify method that ensures connection first
  const notifyPatientSwitch = useCallback(async (patientSessionId: string, patientName?: string) => {
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return false;
    }

    return sendMessage({
      type: 'switch_patient',
      patientSessionId,
      patientName,
    });
  }, [ensureConnection, sendMessage]);

  // Enhanced force disconnect that ensures connection first
  const forceDisconnectDevice = useCallback(async (targetDeviceId: string) => {
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return false;
    }

    return sendMessage({
      type: 'force_disconnect',
      targetDeviceId,
    });
  }, [ensureConnection, sendMessage]);

  return {
    connectionState,
    sendTranscription,
    notifyPatientSwitch,
    forceDisconnectDevice,
    reconnect: connect,
    disconnect: cleanup,
  };
};

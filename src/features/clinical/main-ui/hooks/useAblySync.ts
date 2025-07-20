import { useAuth } from '@clerk/nextjs';
import * as Ably from 'ably';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useConsultation } from '@/src/shared/ConsultationContext';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeadersWithGuest } from '@/src/shared/utils';

// Global connection registry to prevent duplicate connections
const globalConnectionRegistry = new Map<string, { connection: Ably.Realtime; refCount: number }>();

// Message types for Ably communication
type AblyMessage = {
  type: 'transcription' | 'switch_patient' | 'device_connected' | 'device_disconnected' | 'session_created' | 'force_disconnect' | 'sync_current_patient' | 'start_recording' | 'stop_recording';
  userId?: string;
  patientSessionId?: string;
  transcript?: string;
  diarizedTranscript?: string | null; // Enhanced: diarized transcript with speaker labels
  utterances?: any[]; // Enhanced: utterances array for speaker segmentation
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
  onTranscriptionReceived?: (transcript: string, patientSessionId?: string, diarizedTranscript?: string | null, utterances?: any[]) => void;
  onPatientSwitched?: (patientSessionId: string, patientName?: string) => void;
  onDeviceConnected?: (deviceId: string, deviceName: string, deviceType?: string) => void;
  onDeviceDisconnected?: (deviceId: string) => void;
  onError?: (error: string | null) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
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
  onStartRecording,
  onStopRecording,
}: AblySyncHookProps) => {
  const { userId: authUserId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    connectedDevices: [],
  });

  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [processedMessageIds] = useState(new Set<string>());

  // Get guest token from ConsultationContext for fallback user ID
  const { getEffectiveGuestToken } = useConsultation();

  // Stabilize callback references to prevent unnecessary reconnections
  const stableCallbacks = useMemo(() => ({
    onTranscriptionReceived,
    onPatientSwitched,
    onDeviceConnected,
    onDeviceDisconnected,
    onError,
    onStartRecording,
    onStopRecording,
  }), [
    onTranscriptionReceived,
    onPatientSwitched,
    onDeviceConnected,
    onDeviceDisconnected,
    onError,
    onStartRecording,
    onStopRecording,
  ]);

  // Memoize device info to prevent recreation on every render
  const deviceInfo = useMemo(() => {
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

  // Get userId from token API when needed, fallback to guest token
  const getUserId = useCallback(async () => {
    // If we have a real userId, use it
    if (userId) {
      return userId;
    }

    try {
      // Include mobile token for both desktop and mobile when available
      const url = new URL('/api/ably/token', window.location.origin);
      if (token) {
        url.searchParams.set('token', token);
      }

      // Get effective guest token for authentication
      const guestToken = getEffectiveGuestToken();
      const effectiveGuestToken = guestToken && !token ? guestToken : null; // Only for desktop users (no mobile token)

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: createAuthHeadersWithGuest(authUserId, userTier, effectiveGuestToken),
      });

      if (response.ok) {
        const data = await response.json();
        // Extract userId from tokenRequest if available
        const userIdFromToken = data.tokenRequest?.clientId;
        if (userIdFromToken) {
          setUserId(userIdFromToken);
          return userIdFromToken;
        }
      } else if (response.status === 503) {
        // Ably not configured - this is expected in some deployments
        const data = await response.json();
        if (data.code === 'ABLY_NOT_CONFIGURED') {
          return 'ably-disabled';
        }
      }
    } catch (error) {
      console.error('Error getting userId:', error);
    }

    // Fallback: Use guest token as user ID for guest users
    const guestToken = getEffectiveGuestToken();
    if (guestToken) {
      return guestToken;
    }

    return null;
  }, [userId, token, authUserId, userTier, getEffectiveGuestToken]);

  // Generate stable device info for identification
  const getDeviceInfo = useCallback(() => {
    return deviceInfo;
  }, [deviceInfo]);

  // Clean up connection - Added safety checks and global registry management
  const cleanup = useCallback(() => {
    try {
      if (channelRef.current) {
        channelRef.current.detach();
        channelRef.current = null;
      }

      if (ablyRef.current) {
        // Find and decrement reference count in global registry
        for (const [channelName, entry] of globalConnectionRegistry.entries()) {
          if (entry.connection === ablyRef.current) {
            entry.refCount--;

            // Only close connection if no other instances are using it
            if (entry.refCount <= 0) {
              globalConnectionRegistry.delete(channelName);

              // Check if connection is still open before closing
              if ((ablyRef.current.connection.state as string) !== 'closed' && (ablyRef.current.connection.state as string) !== 'closing') {
                ablyRef.current.close();
              }
            }
            break;
          }
        }

        ablyRef.current = null;
      }

      setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
    } catch {
      // Silently handle cleanup errors - connection might already be closed
      setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
    }
  }, []);

  // Send transcription to connected desktop device
  const sendTranscription = useCallback(async (transcript: string, patientSessionId?: string) => {
    if (!channelRef.current) {
      return false;
    }

    try {
      const message: AblyMessage = {
        type: 'transcription',
        transcript,
        patientSessionId,
      };

      await channelRef.current.publish('transcription', message);
      return true;
    } catch (error) {
      console.error('Failed to send transcription:', error);
      return false;
    }
  }, []);

  // Send enhanced transcription with diarization data
  const sendTranscriptionWithDiarization = useCallback(async (
    transcript: string,
    patientSessionId?: string,
    diarizedTranscript?: string | null,
    utterances?: any[],
  ) => {
    if (!channelRef.current) {
      return false;
    }

    try {
      const message: AblyMessage = {
        type: 'transcription',
        transcript,
        patientSessionId,
        diarizedTranscript,
        utterances,
      };

      await channelRef.current.publish('transcription', message);
      return true;
    } catch (error) {
      console.error('Failed to send transcription:', error);
      return false;
    }
  }, []);

  // Send message through Ably
  const sendMessage = useCallback((message: AblyMessage) => {
    if (channelRef.current && (ablyRef.current?.connection.state as string) === 'connected') {
      channelRef.current.publish(message.type, message);
      return true;
    }
    return false;
  }, []);

  // Separate function to set up channel handlers to avoid duplication
  const setupChannelHandlers = useCallback((channel: Ably.RealtimeChannel, deviceId: string) => {
    // Handle incoming messages
    channel.subscribe((message: Ably.Message) => {
      const data: AblyMessage = message.data;
      const messageId = `${data.type}-${message.timestamp}-${data.deviceId || 'unknown'}`;

      if (processedMessageIds.has(messageId)) {
        return;
      }
      processedMessageIds.add(messageId);

      switch (data.type) {
        case 'transcription':
          if (isDesktop && data.transcript) {
            stableCallbacks.onTranscriptionReceived?.(data.transcript, data.patientSessionId, data.diarizedTranscript, data.utterances);
          }
          break;
        case 'switch_patient':
          if (!isDesktop && data.patientSessionId) {
            stableCallbacks.onPatientSwitched?.(data.patientSessionId, data.patientName);
          }
          break;
        case 'force_disconnect':
          if (!isDesktop && data.targetDeviceId === deviceId) {
            cleanup();
          }
          break;
        case 'start_recording':
          if (!isDesktop) {
            stableCallbacks.onStartRecording?.();
          }
          break;
        case 'stop_recording':
          if (!isDesktop) {
            stableCallbacks.onStopRecording?.();
          }
          break;
      }
    });

    // Handle presence changes
    channel.presence.subscribe((presenceMsg) => {
      const { deviceId: presenceDeviceId, deviceName: presenceDeviceName, deviceType: presenceDeviceType } = presenceMsg.data;

      if (presenceMsg.action === 'enter') {
        stableCallbacks.onDeviceConnected?.(presenceDeviceId, presenceDeviceName, presenceDeviceType);
      } else if (presenceMsg.action === 'leave') {
        stableCallbacks.onDeviceDisconnected?.(presenceDeviceId);
      }
    });
  }, [isDesktop, stableCallbacks, cleanup, processedMessageIds]);

  // Connect to Ably
  const connect = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      setConnectionState(prev => ({ ...prev, status: 'connecting', error: undefined }));
      stableCallbacks.onError?.(null);

      const currentUserId = await getUserId();
      if (!currentUserId) {
        throw new Error('Failed to get user ID');
      }

      if (currentUserId === 'ably-disabled') {
        setConnectionState(prev => ({ ...prev, status: 'disconnected', error: undefined }));
        return;
      }

      const channelName = `user-${currentUserId}`;

      // Check if there's already an active connection for this user
      if (globalConnectionRegistry.has(channelName)) {
        const existing = globalConnectionRegistry.get(channelName)!;
        const connectionState = existing.connection.connection.state;

        if (connectionState === 'connected' || connectionState === 'connecting') {
          // Reuse existing connection
          existing.refCount++;
          ablyRef.current = existing.connection;

          const channel = existing.connection.channels.get(channelName);
          channelRef.current = channel;

          // Set up event handlers for this instance
          setupChannelHandlers(channel, currentUserId);

          if (connectionState === 'connected') {
            setConnectionState(prev => ({ ...prev, status: 'connected' }));
          }
          return;
        } else {
          // Clean up stale connection
          globalConnectionRegistry.delete(channelName);
        }
      }

      // Clean up any existing connection first
      cleanup();

      const { deviceId, deviceName, deviceType } = getDeviceInfo();

      const ably = new Ably.Realtime({
        authCallback: async (_tokenParams, callback) => {
          const maxRetries = 3;
          let attempt = 0;

          const attemptAuth = async (): Promise<void> => {
            try {
              const url = new URL('/api/ably/token', window.location.origin);
              if (token) {
                url.searchParams.set('token', token);
              }

              // Get effective guest token for authentication
              const guestToken = getEffectiveGuestToken();
              const effectiveGuestToken = guestToken && !token ? guestToken : null; // Only for desktop users (no mobile token)

              const response = await fetch(url.toString(), {
                method: 'POST',
                headers: createAuthHeadersWithGuest(authUserId, userTier, effectiveGuestToken),
              });

              if (!response.ok) {
                if (response.status === 503) {
                  const data = await response.json();
                  if (data.code === 'ABLY_NOT_CONFIGURED') {
                    callback(new Error('Ably service not configured') as Ably.ErrorInfo, null);
                    return;
                  }
                }

                // For 401 errors, retry with exponential backoff
                if (response.status === 401 && attempt < maxRetries) {
                  attempt++;
                  const delay = 2 ** attempt * 1000; // 2s, 4s, 8s
                  setTimeout(() => attemptAuth(), delay);
                  return;
                }

                throw new Error(`Failed to get Ably token (${response.status})`);
              }

              const { tokenRequest } = await response.json();
              callback(null, tokenRequest);
            } catch (error) {
              if (attempt < maxRetries) {
                attempt++;
                const delay = 2 ** attempt * 1000; // 2s, 4s, 8s
                setTimeout(() => attemptAuth(), delay);
              } else {
                callback(error as Ably.ErrorInfo, null);
              }
            }
          };

          await attemptAuth();
        },
        clientId: currentUserId,
      });

      // Register this connection globally
      globalConnectionRegistry.set(channelName, { connection: ably, refCount: 1 });
      ablyRef.current = ably;

      const channel = ably.channels.get(channelName);
      channelRef.current = channel;

      // Set up presence
      channel.presence.enter({
        deviceId,
        deviceName,
        deviceType,
        connectedAt: Date.now(),
      });

      // Set up event handlers
      setupChannelHandlers(channel, deviceId);

      // Handle connection state changes
      ably.connection.on('connected', () => {
        setConnectionState(prev => ({ ...prev, status: 'connected' }));
      });

      ably.connection.on('disconnected', () => {
        setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
      });

      ably.connection.on('failed', () => {
        setConnectionState(prev => ({ ...prev, status: 'error', error: 'Connection error' }));
        stableCallbacks.onError?.('Connection error');
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setConnectionState(prev => ({ ...prev, status: 'error', error: errorMessage }));
      stableCallbacks.onError?.(errorMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, token, isDesktop, getUserId, getDeviceInfo, stableCallbacks, cleanup, authUserId, userTier, getEffectiveGuestToken, processedMessageIds, setupChannelHandlers]);

  // Enhanced notify method
  const notifyPatientSwitch = useCallback(async (patientSessionId: string, patientName?: string) => {
    return sendMessage({
      type: 'switch_patient',
      patientSessionId,
      patientName,
    });
  }, [sendMessage]);

  // Enhanced force disconnect
  const forceDisconnectDevice = useCallback(async (targetDeviceId: string) => {
    return sendMessage({
      type: 'force_disconnect',
      targetDeviceId,
    });
  }, [sendMessage]);

  // Send current patient state
  const syncCurrentPatient = useCallback(async (patientSessionId: string, patientName?: string) => {
    return sendMessage({
      type: 'sync_current_patient',
      patientSessionId,
      patientName,
    });
  }, [sendMessage]);

  // Connect when enabled
  useEffect(() => {
    if (enabled) {
      if (isDesktop) {
        connect();
      } else {
        if (token) {
          connect();
        } else {
          cleanup();
        }
      }
    } else {
      cleanup();
    }

    // Always cleanup on unmount or when effect re-runs
    return cleanup;
  }, [enabled, token, isDesktop, connect, cleanup]);

  return {
    connectionState,
    sendTranscription,
    sendTranscriptionWithDiarization,
    notifyPatientSwitch,
    syncCurrentPatient,
    forceDisconnectDevice,
    reconnect: connect,
    disconnect: cleanup,
    startMobileRecording: useCallback(async () => {
      return sendMessage({ type: 'start_recording' });
    }, [sendMessage]),
    stopMobileRecording: useCallback(async () => {
      return sendMessage({ type: 'stop_recording' });
    }, [sendMessage]),
  };
};

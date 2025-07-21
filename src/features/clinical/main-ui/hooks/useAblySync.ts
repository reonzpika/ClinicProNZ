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
  type: 'transcription' | 'device_connected' | 'device_disconnected' | 'session_created' | 'force_disconnect' | 'start_recording' | 'stop_recording' | 'patient_updated' | 'health_check_request' | 'health_check_response';
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
  confirmationId?: string; // For health check confirmations
  isHealthy?: boolean; // For health check responses
  issues?: string[]; // For health check issue reporting
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
  onHealthCheckRequested?: () => Promise<boolean>; // Mobile responds to health checks
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
  onHealthCheckRequested,
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
  
  // Enhanced refs to track lifecycle state and prevent race conditions
  const isConnectingRef = useRef(false);
  const isCleaningUpRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelAttachPromiseRef = useRef<Promise<void> | null>(null);
  const isDestroyedRef = useRef(false); // Track if component is destroyed
  const activeOperationRef = useRef<'none' | 'connecting' | 'cleaning'>('none'); // Track active operations

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
    onHealthCheckRequested,
  }), [
    onTranscriptionReceived,
    onPatientSwitched,
    onDeviceConnected,
    onDeviceDisconnected,
    onError,
    onStartRecording,
    onStopRecording,
    onHealthCheckRequested,
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
    } catch {
      // getUserId errors are handled silently - fallback logic will handle this
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

  // Enhanced cleanup with proper state checks and race condition prevention
  const cleanup = useCallback(async () => {
    // Prevent multiple simultaneous cleanup operations
    if (activeOperationRef.current === 'cleaning' || isDestroyedRef.current) {
      return;
    }
    
    const wasConnecting = activeOperationRef.current === 'connecting';
    activeOperationRef.current = 'cleaning';
    isCleaningUpRef.current = true;

    try {
      // Cancel any pending debounced connection
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }

      // Wait for any pending attach operation to complete first, but with timeout
      if (channelAttachPromiseRef.current && !wasConnecting) {
        try {
          await Promise.race([
            channelAttachPromiseRef.current,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
          ]);
        } catch {
          // Ignore attach errors during cleanup
        }
        channelAttachPromiseRef.current = null;
      }

      // Clean up channel with proper state checking and error handling
      if (channelRef.current) {
        try {
          const channel = channelRef.current;
          const channelState = channel.state;
          
          // Only attempt detach if channel is in attachable state
          if (channelState === 'attached' || channelState === 'attaching') {
            // Use a timeout to prevent hanging
            await Promise.race([
              new Promise<void>((resolve) => {
                try {
                  channel.detach();
                  // Detach is synchronous in current Ably version
                  resolve();
                } catch {
                  resolve();
                }
              }),
              new Promise<void>((resolve) => setTimeout(resolve, 1000)) // 1 second timeout
            ]);
          }
        } catch {
          // Ignore all detach errors - connection might already be closed
        }
        channelRef.current = null;
      }

      // Clean up connection with global registry management
      if (ablyRef.current) {
        // Find and decrement reference count in global registry
        for (const [channelName, entry] of globalConnectionRegistry.entries()) {
          if (entry.connection === ablyRef.current) {
            entry.refCount--;

            // Only close connection if no other instances are using it
            if (entry.refCount <= 0) {
              globalConnectionRegistry.delete(channelName);

              // Check connection state before closing
              const connectionState = ablyRef.current.connection.state;
              if (connectionState !== 'closed' && connectionState !== 'closing' && connectionState !== 'failed') {
                try {
                  ablyRef.current.close();
                } catch {
                  // Ignore close errors - connection might already be closed
                }
              }
            }
            break;
          }
        }

        ablyRef.current = null;
      }

      // Only update state if not destroyed
      if (!isDestroyedRef.current) {
        setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
      }
    } catch {
      // Silently handle cleanup errors - connection might already be closed
      if (!isDestroyedRef.current) {
        setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
      }
    } finally {
      isCleaningUpRef.current = false;
      if (activeOperationRef.current === 'cleaning') {
        activeOperationRef.current = 'none';
      }
    }
  }, []);

  // Send transcription to connected desktop device
  const sendTranscription = useCallback(async (transcript: string, patientSessionId?: string) => {
    if (!channelRef.current || !ablyRef.current || isDestroyedRef.current) {
      return false;
    }

    // Guard against connection closures
    if (ablyRef.current.connection.state !== 'connected') {
      console.warn('Not connected, skipping transcription send...');
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
    } catch {
      // Transcription send failures are handled silently - UI will show appropriate feedback
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
    if (!channelRef.current || !ablyRef.current || isDestroyedRef.current) {
      return false;
    }

    // Guard against connection closures
    if (ablyRef.current.connection.state !== 'connected') {
      console.warn('Not connected, skipping enhanced transcription send...');
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
    } catch {
      // Enhanced transcription send failures are handled silently - UI will show appropriate feedback
      return false;
    }
  }, []);

  // Send message through Ably with enhanced connection state checking
  const sendMessage = useCallback((message: AblyMessage) => {
    // More robust connection state checking to prevent error 80017
    if (!channelRef.current || !ablyRef.current || isDestroyedRef.current) {
      return false;
    }

    const connectionState = ablyRef.current.connection.state;
    const channelState = channelRef.current.state;

    // Only send if connection is truly connected and channel is attached
    if (connectionState === 'connected' && channelState === 'attached') {
      try {
        channelRef.current.publish(message.type, message);
        return true;
      } catch {
        // Handle publish failures gracefully
        return false;
      }
    }

    return false;
  }, []);

  // Separate function to set up channel handlers to avoid duplication
  const setupChannelHandlers = useCallback((channel: Ably.RealtimeChannel, deviceId: string) => {
    // Handle incoming messages
    channel.subscribe((message: Ably.Message) => {
      if (isDestroyedRef.current) {
        return;
      }

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
        case 'patient_updated':
          if (!isDesktop && data.patientSessionId) {
            // Mobile: Direct patient update
            stableCallbacks.onPatientSwitched?.(data.patientSessionId, data.patientName || 'Unknown Patient');
          }
          break;
        case 'health_check_request':
          if (!isDesktop && data.confirmationId && stableCallbacks.onHealthCheckRequested) {
            // Mobile: Respond to health check request
            stableCallbacks.onHealthCheckRequested()
              .then((isHealthy) => {
                sendMessage({
                  type: 'health_check_response',
                  confirmationId: data.confirmationId,
                  isHealthy,
                  deviceId,
                });
              })
              .catch(() => {
                sendMessage({
                  type: 'health_check_response',
                  confirmationId: data.confirmationId,
                  isHealthy: false,
                  deviceId,
                  issues: ['Health check failed on mobile'],
                });
              });
          }
          break;
        case 'health_check_response':
          // Desktop: Handle health check response (will be processed by health check hook)
          break;
      }
    });

    // Handle presence changes
    channel.presence.subscribe((presenceMsg) => {
      if (isDestroyedRef.current) {
        return;
      }

      const { deviceId: presenceDeviceId, deviceName: presenceDeviceName, deviceType: presenceDeviceType } = presenceMsg.data;

      if (presenceMsg.action === 'enter') {
        stableCallbacks.onDeviceConnected?.(presenceDeviceId, presenceDeviceName, presenceDeviceType);
      } else if (presenceMsg.action === 'leave') {
        stableCallbacks.onDeviceDisconnected?.(presenceDeviceId);
      }
    });
  }, [isDesktop, stableCallbacks, cleanup, processedMessageIds, sendMessage]);

  // Enhanced connect function with proper lifecycle management
  const connect = useCallback(async () => {
    if (!enabled || activeOperationRef.current !== 'none' || isDestroyedRef.current) {
      return;
    }

    activeOperationRef.current = 'connecting';
    isConnectingRef.current = true;

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
      await cleanup();

      // Check if we were destroyed during cleanup
      if (isDestroyedRef.current || activeOperationRef.current !== 'connecting') {
        return;
      }

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

      // Properly handle channel attachment with promise tracking and timeout
      channelAttachPromiseRef.current = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Channel attach timeout'));
        }, 10000); // 10 second timeout

        try {
          channel.attach();
          clearTimeout(timeout);
          resolve();
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });

      try {
        await channelAttachPromiseRef.current;
        channelAttachPromiseRef.current = null;
      } catch (error) {
        channelAttachPromiseRef.current = null;
        throw error;
      }

      // Check if we were destroyed during attachment
      if (isDestroyedRef.current || activeOperationRef.current !== 'connecting') {
        return;
      }

      // Set up presence only after successful attachment
      try {
        channel.presence.enter({
          deviceId,
          deviceName,
          deviceType,
          connectedAt: Date.now(),
        });
      } catch (error) {
        console.warn('Failed to enter presence:', error);
        // Continue even if presence fails
      }

      // Set up event handlers
      setupChannelHandlers(channel, deviceId);

      // Handle connection state changes
      ably.connection.on('connected', () => {
        if (!isDestroyedRef.current) {
          setConnectionState(prev => ({ ...prev, status: 'connected' }));
        }
      });

      ably.connection.on('disconnected', () => {
        if (!isDestroyedRef.current) {
          setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
        }
      });

      ably.connection.on('failed', () => {
        if (!isDestroyedRef.current) {
          setConnectionState(prev => ({ ...prev, status: 'error', error: 'Connection error' }));
          stableCallbacks.onError?.('Connection error');
        }
      });
    } catch (error) {
      if (!isDestroyedRef.current) {
        const errorMessage = error instanceof Error ? error.message : 'Connection failed';
        setConnectionState(prev => ({ ...prev, status: 'error', error: errorMessage }));
        stableCallbacks.onError?.(errorMessage);
      }
    } finally {
      isConnectingRef.current = false;
      if (activeOperationRef.current === 'connecting') {
        activeOperationRef.current = 'none';
      }
    }
  }, [enabled, token, isDesktop, getUserId, getDeviceInfo, stableCallbacks, cleanup, authUserId, userTier, getEffectiveGuestToken, setupChannelHandlers]);

  // Enhanced force disconnect
  const forceDisconnectDevice = useCallback(async (targetDeviceId: string) => {
    return sendMessage({
      type: 'force_disconnect',
      targetDeviceId,
    });
  }, [sendMessage]);

  // Debounced connection management to prevent rapid attach/detach cycles
  const debouncedConnect = useCallback(() => {
    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce connection changes by 500ms (increased from 200ms)
    debounceTimeoutRef.current = setTimeout(() => {
      if (isDestroyedRef.current) {
        return;
      }

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
    }, 500);
  }, [enabled, token, isDesktop, connect, cleanup]);

  // Connect when enabled with debouncing
  useEffect(() => {
    debouncedConnect();

    // Always cleanup on unmount or when effect re-runs
    return () => {
      isDestroyedRef.current = true;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      cleanup();
    };
  }, [debouncedConnect, cleanup]);

  return {
    connectionState,
    sendTranscription,
    sendTranscriptionWithDiarization,
    forceDisconnectDevice,
    reconnect: connect,
    disconnect: cleanup,
    startMobileRecording: useCallback(async () => {
      return sendMessage({ type: 'start_recording' });
    }, [sendMessage]),
    stopMobileRecording: useCallback(async () => {
      return sendMessage({ type: 'stop_recording' });
    }, [sendMessage]),
    // Enhanced patient session sync functions
    syncPatientSession: useCallback(async (patientSessionId: string, patientName?: string): Promise<string> => {
      const success = sendMessage({
        type: 'patient_updated',
        patientSessionId,
        patientName,
      });
      return success ? patientSessionId : '';
    }, [sendMessage]),
    requestHealthCheck: useCallback(async (): Promise<string> => {
      const confirmationId = `health-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const success = sendMessage({
        type: 'health_check_request',
        confirmationId,
      });
      return success ? confirmationId : '';
    }, [sendMessage]),
  };
};

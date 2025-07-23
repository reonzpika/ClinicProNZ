import { useAuth } from '@clerk/nextjs';
import * as Ably from 'ably';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useConsultation } from '@/src/shared/ConsultationContext';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeadersWithGuest } from '@/src/shared/utils';

// Global connection registry to prevent duplicate connections
const globalConnectionRegistry = new Map<string, { connection: Ably.Realtime; refCount: number }>();

// Simplified message types for Ably communication (Phase 1: Removed health check messages)
type AblyMessage = {
  type: 'transcription' | 'patient_updated' | 'start_recording' | 'stop_recording' | 'force_disconnect';
  userId?: string;
  patientSessionId?: string;
  transcript?: string;
  diarizedTranscript?: string | null; // Enhanced: diarized transcript with speaker labels
  utterances?: any[]; // Enhanced: utterances array for speaker segmentation
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  patientName?: string;
  targetDeviceId?: string; // Required for force_disconnect messages
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
  // Removed: onHealthCheckRequested - health checks eliminated per Phase 1
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
  // Phase 1: Added current transcript channel tracking
  currentTranscriptChannel?: string;
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
  // Removed: onHealthCheckRequested
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
  // Phase 1: Add separate tracking for control and transcript channels
  const controlChannelRef = useRef<Ably.RealtimeChannel | null>(null);
  const transcriptChannelRef = useRef<Ably.RealtimeChannel | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [processedMessageIds] = useState(new Set<string>());

  // Get guest token from ConsultationContext for fallback user ID
  const { getEffectiveGuestToken, getCurrentPatientSession } = useConsultation();

  // Stabilize callback references to prevent unnecessary reconnections
  const stableCallbacks = useMemo(() => ({
    onTranscriptionReceived,
    onPatientSwitched,
    onDeviceConnected,
    onDeviceDisconnected,
    onError,
    onStartRecording,
    onStopRecording,
    // Removed: onHealthCheckRequested
  }), [
    onTranscriptionReceived,
    onPatientSwitched,
    onDeviceConnected,
    onDeviceDisconnected,
    onError,
    onStartRecording,
    onStopRecording,
    // Removed: onHealthCheckRequested
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
  // Get userId from token API when needed, with proper authentication separation
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

      // FIXED: Authentication context separation
      // Desktop authenticated users: Use Clerk auth only, never guest tokens
      // Desktop guest users: Use guest token only
      // Mobile devices: Use mobile token only
      let effectiveGuestToken: string | null = null;

      if (authUserId) {
        // Authenticated user - never use guest token
        effectiveGuestToken = null;
      } else if (!token && !authUserId) {
        // Desktop guest user (no mobile token, no Clerk auth)
        effectiveGuestToken = getEffectiveGuestToken();
      }
      // Mobile users (have token) don't need guest token

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

  // Clean up connection - Added safety checks and global registry management
  const cleanup = useCallback(() => {
    try {
      // Phase 1: Clean up both control and transcript channels
      if (controlChannelRef.current) {
        controlChannelRef.current.detach();
        controlChannelRef.current = null;
      }

      if (transcriptChannelRef.current) {
        transcriptChannelRef.current.detach();
        transcriptChannelRef.current = null;
      }

      if (channelRef.current) {
        channelRef.current.detach();
        channelRef.current = null;
      }

      if (ablyRef.current) {
        // Find and decrement reference count in global registry
        for (const [channelName, entry] of globalConnectionRegistry.entries()) {
          if (entry.connection === ablyRef.current) {
            // Fix 3: Prevent negative reference counts
            entry.refCount = Math.max(0, entry.refCount - 1);

            // Only close connection if no other instances are using it
            if (entry.refCount <= 0) {
              globalConnectionRegistry.delete(channelName);

              // Fix 3: Force close connection with better error handling
              try {
                if (ablyRef.current.connection.state !== 'closed' && ablyRef.current.connection.state !== 'closing') {
                  ablyRef.current.close();
                }
              } catch {
                // Ignore cleanup errors - connection might already be closed
              }
            }
            break;
          }
        }

        ablyRef.current = null;
      }

      // Reset session tracking
      currentSessionIdRef.current = null;
      setConnectionState(prev => ({ ...prev, status: 'disconnected', currentTranscriptChannel: undefined }));
    } catch {
      // Silently handle cleanup errors - connection might already be closed
      setConnectionState(prev => ({ ...prev, status: 'disconnected', currentTranscriptChannel: undefined }));
    }
  }, []);

  // Send transcription to connected desktop device
  const sendTranscription = useCallback(async (transcript: string, patientSessionId?: string) => {
    // Phase 1: Mobile uses transcript channel, desktop uses control channel
    const targetChannel = !isDesktop && transcriptChannelRef.current
      ? transcriptChannelRef.current
      : channelRef.current;

    if (!targetChannel) {
      // Phase 4: Better error feedback instead of silent failure
      console.warn('Cannot send transcription: No active channel');
      stableCallbacks.onError?.('No active connection to send transcription');
      return false;
    }

    try {
      const message: AblyMessage = {
        type: 'transcription',
        transcript,
        patientSessionId,
      };

      await targetChannel.publish('transcription', message);
      return true;
    } catch (error) {
      // Phase 4: Improved error handling with specific feedback
      console.error('Failed to send transcription:', error);
      stableCallbacks.onError?.('Failed to send transcription to desktop');
      return false;
    }
  }, [isDesktop, stableCallbacks]);

  // Send enhanced transcription with diarization data
  const sendTranscriptionWithDiarization = useCallback(async (
    transcript: string,
    patientSessionId?: string,
    diarizedTranscript?: string | null,
    utterances?: any[],
  ) => {
    // Phase 1: Mobile uses transcript channel, desktop uses control channel
    const targetChannel = !isDesktop && transcriptChannelRef.current
      ? transcriptChannelRef.current
      : channelRef.current;

    if (!targetChannel) {
      // Phase 4: Better error feedback instead of silent failure
      console.warn('Cannot send transcription: No active channel');
      stableCallbacks.onError?.('No active connection to send transcription');
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

      await targetChannel.publish('transcription', message);
      return true;
    } catch (error) {
      // Phase 4: Improved error handling with specific feedback
      console.error('Failed to send enhanced transcription:', error);
      stableCallbacks.onError?.('Failed to send transcription to desktop');
      return false;
    }
  }, [isDesktop, stableCallbacks]);

  // Send message through Ably
  const sendMessage = useCallback((message: AblyMessage) => {
    // More robust connection state checking to prevent error 80017
    if (!channelRef.current || !ablyRef.current) {
      return false;
    }

    const connectionState = ablyRef.current.connection.state;

    // Only send if connection is truly connected and stable
    if (connectionState === 'connected') {
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

  // Phase 2: Expose sendMessage globally for consultation context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ablySyncHook = { sendMessage };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).ablySyncHook;
      }
    };
  }, [sendMessage]);

  // Phase 2: Presence-based reconnection recovery
  const handlePresenceChanges = useCallback((presenceMsg: Ably.PresenceMessage) => {
    const { deviceId: presenceDeviceId, deviceName: presenceDeviceName, deviceType: presenceDeviceType } = presenceMsg.data;

    if (presenceMsg.action === 'enter') {
      stableCallbacks.onDeviceConnected?.(presenceDeviceId, presenceDeviceName, presenceDeviceType);

      // Phase 2: If we're desktop and a mobile device reconnects, resend current session
      if (isDesktop && presenceDeviceType === 'Mobile') {
        // Get current session from consultation context and resend
        const currentSession = getCurrentPatientSession?.();
        if (currentSession) {
          setTimeout(() => {
            sendMessage({
              type: 'patient_updated',
              patientSessionId: currentSession.id,
              patientName: currentSession.patientName,
            });
          }, 1000); // Give mobile device time to set up channel handlers
        }
      }
    } else if (presenceMsg.action === 'leave') {
      stableCallbacks.onDeviceDisconnected?.(presenceDeviceId);
    }
  }, [isDesktop, stableCallbacks, sendMessage, getCurrentPatientSession]);

  // Phase 1: Switch transcript channel for mobile devices
  const switchTranscriptChannel = useCallback(async (newSessionId: string) => {
    if (isDesktop || !ablyRef.current || newSessionId === currentSessionIdRef.current) {
      return; // Desktop doesn't switch channels, or no change needed
    }

    try {
      // Detach from old transcript channel
      if (transcriptChannelRef.current) {
        transcriptChannelRef.current.detach();
        transcriptChannelRef.current = null;
      }

      // Connect to new transcript channel
      const newTranscriptChannelName = `consult:${newSessionId}`;
      const newTranscriptChannel = ablyRef.current.channels.get(newTranscriptChannelName);
      transcriptChannelRef.current = newTranscriptChannel;
      currentSessionIdRef.current = newSessionId;

      // Update connection state
      setConnectionState(prev => ({
        ...prev,
        currentTranscriptChannel: newTranscriptChannelName,
      }));

      // Successfully switched to new transcript channel
    } catch (error) {
      console.error('Failed to switch transcript channel:', error);
      stableCallbacks.onError?.('Failed to switch to new session channel');
    }
  }, [isDesktop, stableCallbacks]);

  // Separate function to set up channel handlers to avoid duplication
  const setupChannelHandlers = useCallback((channel: Ably.RealtimeChannel, _deviceId: string) => {
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
            // Phase 1: Mobile transcript channel switching
            switchTranscriptChannel(data.patientSessionId);
            // Mobile: Direct patient update
            stableCallbacks.onPatientSwitched?.(data.patientSessionId, data.patientName || 'Unknown Patient');
          }
          break;
        // Phase 1: Removed health check message handling
      }
    });

    // Handle presence changes
    channel.presence.subscribe((presenceMsg) => {
      handlePresenceChanges(presenceMsg);
    });
  }, [isDesktop, stableCallbacks, cleanup, processedMessageIds, switchTranscriptChannel, handlePresenceChanges]);

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

      // FIXED: More robust channel naming with clear authentication separation
      // Desktop authenticated users: user:${clerkUserId}
      // Desktop guest users: guest:${guestToken}
      // Mobile devices: guest:${mobileToken} (inherits from creator)
      let controlChannelName: string;

      if (authUserId && !token) {
        // Desktop authenticated user - use Clerk user ID
        controlChannelName = `user:${currentUserId}`;
      } else if (token) {
        // Mobile device - always uses guest pattern with mobile token
        controlChannelName = `guest:${currentUserId.replace('guest-', '')}`;
      } else if (currentUserId.startsWith('guest-')) {
        // Desktop guest user
        controlChannelName = `guest:${currentUserId.replace('guest-', '')}`;
      } else {
        // Fallback for edge cases
        controlChannelName = `user:${currentUserId}`;
      }

      // FIXED: Better global registry conflict detection
      if (globalConnectionRegistry.has(controlChannelName)) {
        const existing = globalConnectionRegistry.get(controlChannelName)!;
        const connectionState = existing.connection.connection.state;

        // Log potential conflicts for debugging
        console.log('Global registry check:', {
          channelName: controlChannelName,
          existingState: connectionState,
          isDesktop,
          currentUserId,
          authUserId,
          hasToken: !!token,
        });

        if (connectionState === 'connected' || connectionState === 'connecting') {
          // Check if this is a legitimate shared connection or a conflict
          const isLegitimateReuse = (
            (isDesktop && !token) // Desktop user reusing their own connection
            || (!isDesktop && token) // Mobile device connection
          );

          if (isLegitimateReuse) {
            // Reuse existing connection
            existing.refCount++;
            ablyRef.current = existing.connection;

            const channel = existing.connection.channels.get(controlChannelName);
            channelRef.current = channel;
            controlChannelRef.current = channel; // Phase 1: Track control channel

            // Set up event handlers for this instance
            setupChannelHandlers(channel, currentUserId);

            if (connectionState === 'connected') {
              setConnectionState(prev => ({ ...prev, status: 'connected' }));
            }
            return;
          } else {
            // Potential conflict - force cleanup of stale connection
            console.warn('Potential connection conflict detected, forcing cleanup:', {
              channelName: controlChannelName,
              existingRefCount: existing.refCount,
            });
            globalConnectionRegistry.delete(controlChannelName);
            try {
              existing.connection.close();
            } catch {
              // Ignore cleanup errors
            }
          }
        } else {
          // Clean up stale connection
          globalConnectionRegistry.delete(controlChannelName);
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

                // Fix 1: Stop retrying on quota/auth errors to prevent connection multiplication
                if (response.status === 401) {
                  throw new Error(`Authentication failed - service may be at capacity (${response.status})`);
                }

                throw new Error(`Failed to get Ably token (${response.status})`);
              }

              const { tokenRequest } = await response.json();
              callback(null, tokenRequest);
            } catch (error) {
              // Fix 1: Limit retries to prevent connection multiplication
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
      globalConnectionRegistry.set(controlChannelName, { connection: ably, refCount: 1 });
      ablyRef.current = ably;

      const channel = ably.channels.get(controlChannelName);
      channelRef.current = channel;
      controlChannelRef.current = channel; // Phase 1: Track control channel

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

  // Enhanced force disconnect
  const forceDisconnectDevice = useCallback(async (targetDeviceId: string) => {
    return sendMessage({
      type: 'force_disconnect',
      targetDeviceId,
    });
  }, [sendMessage]);

  // Fix 2: Add tab close cleanup to prevent connection leaks
  useEffect(() => {
    const handleTabClose = () => {
      cleanup();
    };

    window.addEventListener('beforeunload', handleTabClose);
    window.addEventListener('pagehide', handleTabClose); // iOS Safari support

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      window.removeEventListener('pagehide', handleTabClose);
    };
  }, [cleanup]);

  // FIXED: Improved connection lifecycle management with conflict prevention
  useEffect(() => {
    let connectionTimeout: NodeJS.Timeout | null = null;

    if (enabled) {
      // Only connect if not already connecting/connected and not in cleanup phase
      if (connectionState.status === 'disconnected' && ablyRef.current === null) {
        // Add small delay to prevent rapid connect/disconnect cycles
        connectionTimeout = setTimeout(() => {
          if (isDesktop) {
            connect();
          } else if (token) {
            connect();
          }
        }, 50); // 50ms debounce
      }
    } else {
      // Only cleanup if we have an active connection
      if (connectionState.status !== 'disconnected' && ablyRef.current !== null) {
        // Clear any pending connections
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
        cleanup();
      }
    }

    // Cleanup function
    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      // Only cleanup if we actually have a connection
      if (ablyRef.current !== null) {
        cleanup();
      }
    };
  }, [enabled, token, isDesktop, connectionState.status]);

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
  };
};

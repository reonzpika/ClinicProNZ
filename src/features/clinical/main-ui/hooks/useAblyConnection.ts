import { useAuth } from '@clerk/nextjs';
import * as Ably from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useConsultation } from '@/src/shared/ConsultationContext';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeadersWithGuest } from '@/src/shared/utils';

// Global connection registry to prevent duplicate connections
const globalConnections = new Map<string, { connection: Ably.Realtime; refCount: number }>();

// Message types for Ably communication
type AblyMessage = {
  type: 'transcription' | 'patient_session_update' | 'device_connected' | 'device_disconnected' | 'force_disconnect';
  transcript?: string;
  diarizedTranscript?: string | null;
  utterances?: any[];
  patientSessionId?: string;
  patientName?: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  targetDeviceId?: string;
};

type ConnectionState = {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectedDevices: Array<{
    deviceId: string;
    deviceName: string;
    deviceType?: string;
    connectedAt: number;
  }>;
  error?: string;
};

type UseAblyConnectionProps = {
  enabled: boolean;
  token?: string;
  isDesktop: boolean;
  onPatientSwitched?: (sessionId: string, name?: string) => void;
  onTranscriptionReceived?: (transcript: string, patientSessionId?: string, diarizedTranscript?: string | null, utterances?: any[]) => void;
  onDeviceConnected?: (deviceId: string, deviceName: string, deviceType?: string) => void;
  onDeviceDisconnected?: (deviceId: string) => void;
  onError?: (error: string | null) => void;
};

export const useAblyConnection = ({
  enabled,
  token,
  isDesktop,
  onPatientSwitched,
  onTranscriptionReceived,
  onDeviceConnected,
  onDeviceDisconnected,
  onError,
}: UseAblyConnectionProps) => {
  const { userId: authUserId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const { getEffectiveGuestToken } = useConsultation();

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    connectedDevices: [],
  });

  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const userIdRef = useRef<string | null>(null);
  const isConnectingRef = useRef(false);

  // Generate stable device info
  const deviceInfo = useRef({
    deviceId: `${isDesktop ? 'desktop' : 'mobile'}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    deviceName: isDesktop ? 'Desktop' : 'Mobile Device',
    deviceType: isDesktop ? 'Desktop' : 'Mobile',
  });

  // Get user ID
  const getUserId = useCallback(async () => {
    if (userIdRef.current) {
      return userIdRef.current;
    }

    try {
      const url = new URL('/api/ably/token', window.location.origin);
      if (token) {
        url.searchParams.set('token', token);
      }

      const guestToken = getEffectiveGuestToken();
      const effectiveGuestToken = guestToken && !token ? guestToken : null;

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: createAuthHeadersWithGuest(authUserId, userTier, effectiveGuestToken),
      });

      if (response.ok) {
        const data = await response.json();
        const userId = data.tokenRequest?.clientId;
        if (userId) {
          userIdRef.current = userId;
          return userId;
        }
      }
    } catch {
      // Silent error handling
    }

    // Fallback to guest token
    const guestToken = getEffectiveGuestToken();
    if (guestToken) {
      userIdRef.current = guestToken;
      return guestToken;
    }

    return null;
  }, [token, authUserId, userTier, getEffectiveGuestToken]);

  // Send message helper
  const sendMessage = useCallback((message: AblyMessage) => {
    if (!channelRef.current || !ablyRef.current) {
      return false;
    }

    if (ablyRef.current.connection.state === 'connected' && channelRef.current.state === 'attached') {
      try {
        channelRef.current.publish(message.type, message);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  // Cleanup function
  const disconnect = useCallback(async () => {
    if (channelRef.current) {
      try {
        channelRef.current.detach();
      } catch {
        // Ignore errors
      }
      channelRef.current = null;
    }

    if (ablyRef.current) {
      // Handle global connection cleanup
      for (const [channelName, entry] of globalConnections.entries()) {
        if (entry.connection === ablyRef.current) {
          entry.refCount--;
          if (entry.refCount <= 0) {
            globalConnections.delete(channelName);
            try {
              ablyRef.current.close();
            } catch {
              // Ignore errors
            }
          }
          break;
        }
      }
      ablyRef.current = null;
    }

    setConnectionState({ status: 'disconnected', connectedDevices: [] });
  }, []);

  // Connect function
  const connect = useCallback(async () => {
    if (isConnectingRef.current) {
      return;
    }
    isConnectingRef.current = true;

    try {
      setConnectionState(prev => ({ ...prev, status: 'connecting', error: undefined }));
      onError?.(null);

      const currentUserId = await getUserId();
      if (!currentUserId) {
        throw new Error('Failed to get user ID');
      }

      const channelName = `user-${currentUserId}`;

      // Check for existing connection
      if (globalConnections.has(channelName)) {
        const existing = globalConnections.get(channelName)!;
        if (existing.connection.connection.state === 'connected') {
          existing.refCount++;
          ablyRef.current = existing.connection;
          channelRef.current = existing.connection.channels.get(channelName);
          setConnectionState(prev => ({ ...prev, status: 'connected' }));
          return;
        } else {
          globalConnections.delete(channelName);
        }
      }

      // Create new connection
      const ably = new Ably.Realtime({
        authCallback: async (_tokenParams, callback) => {
          try {
            const url = new URL('/api/ably/token', window.location.origin);
            if (token) {
              url.searchParams.set('token', token);
            }

            const guestToken = getEffectiveGuestToken();
            const effectiveGuestToken = guestToken && !token ? guestToken : null;

            const response = await fetch(url.toString(), {
              method: 'POST',
              headers: createAuthHeadersWithGuest(authUserId, userTier, effectiveGuestToken),
            });

            if (!response.ok) {
              throw new Error(`Token request failed: ${response.status}`);
            }

            const { tokenRequest } = await response.json();
            callback(null, tokenRequest);
          } catch (error) {
            callback(error as Ably.ErrorInfo, null);
          }
        },
        clientId: currentUserId,
      });

      globalConnections.set(channelName, { connection: ably, refCount: 1 });
      ablyRef.current = ably;

      const channel = ably.channels.get(channelName);
      channelRef.current = channel;

      // Attach channel
      channel.attach();

      // Enter presence
      try {
        channel.presence.enter(deviceInfo.current);
      } catch {
        // Continue if presence fails
      }

      // Set up message handlers
      channel.subscribe((message: Ably.Message) => {
        const data: AblyMessage = message.data;

        switch (data.type) {
          case 'transcription':
            if (isDesktop && data.transcript) {
              onTranscriptionReceived?.(data.transcript, data.patientSessionId, data.diarizedTranscript, data.utterances);
            }
            break;
          case 'patient_session_update':
            if (!isDesktop && data.patientSessionId) {
              onPatientSwitched?.(data.patientSessionId, data.patientName);
            }
            break;
          case 'force_disconnect':
            if (!isDesktop && data.targetDeviceId === deviceInfo.current.deviceId) {
              disconnect();
            }
            break;
        }
      });

      // Set up presence handlers
      channel.presence.subscribe((presenceMsg) => {
        const { deviceId, deviceName, deviceType } = presenceMsg.data;
        if (presenceMsg.action === 'enter') {
          onDeviceConnected?.(deviceId, deviceName, deviceType);
        } else if (presenceMsg.action === 'leave') {
          onDeviceDisconnected?.(deviceId);
        }
      });

      // Handle connection state changes
      ably.connection.on('connected', () => {
        setConnectionState(prev => ({ ...prev, status: 'connected' }));
      });

      ably.connection.on('disconnected', () => {
        setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
      });

      ably.connection.on('failed', () => {
        setConnectionState(prev => ({ ...prev, status: 'error', error: 'Connection failed' }));
        onError?.('Connection failed');
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setConnectionState(prev => ({ ...prev, status: 'error', error: errorMessage }));
      onError?.(errorMessage);
    } finally {
      isConnectingRef.current = false;
    }
  }, [getUserId, isDesktop, token, authUserId, userTier, getEffectiveGuestToken, onTranscriptionReceived, onPatientSwitched, onDeviceConnected, onDeviceDisconnected, onError, disconnect]);

  // Single useEffect with only enabled dependency
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled]); // ONLY enabled dependency

  // Public API
  const sendTranscription = useCallback(async (
    transcript: string,
    patientSessionId?: string,
    diarizedTranscript?: string | null,
    utterances?: any[]
  ) => {
    return sendMessage({
      type: 'transcription',
      transcript,
      patientSessionId,
      diarizedTranscript,
      utterances,
    });
  }, [sendMessage]);

  const updatePatientSession = useCallback(async (patientSessionId: string, patientName?: string) => {
    return sendMessage({
      type: 'patient_session_update',
      patientSessionId,
      patientName,
    });
  }, [sendMessage]);

  const forceDisconnectDevice = useCallback(async (targetDeviceId: string) => {
    return sendMessage({
      type: 'force_disconnect',
      targetDeviceId,
    });
  }, [sendMessage]);

  return {
    connectionState,
    sendTranscription,
    updatePatientSession,
    forceDisconnectDevice,
    reconnect: connect,
    disconnect,
  };
};
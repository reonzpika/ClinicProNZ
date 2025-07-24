import * as Ably from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';

type SimpleAblyMessage = {
  type: 'transcription' | 'patient_updated';
  transcript?: string;
  sessionId?: string;
  patientName?: string;
  timestamp?: number;
  data?: any;
};

export type UseSimpleAblyOptions = {
  tokenId: string | null;
  onTranscriptReceived?: (transcript: string, sessionId: string) => void;
  onSessionChanged?: (sessionId: string, patientName: string) => void;
  onError?: (error: string) => void;
  onConnectionStatusChanged?: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void; // NEW: Connection status bridge
  isMobile?: boolean; // NEW: Device type detection
};

export const useSimpleAbly = ({
  tokenId,
  onTranscriptReceived,
  onSessionChanged,
  onError,
  onConnectionStatusChanged,
  isMobile = false, // Default to false (desktop)
}: UseSimpleAblyOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [lastSessionFetch, setLastSessionFetch] = useState<number>(0);

  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  // Stable callback refs to prevent re-connections
  const callbacksRef = useRef({
    onTranscriptReceived,
    onSessionChanged,
    onError,
  });

  // Update callbacks without triggering reconnection
  useEffect(() => {
    callbacksRef.current = {
      onTranscriptReceived,
      onSessionChanged,
      onError,
    };
  }, [onTranscriptReceived, onSessionChanged, onError]);

  // Connect when tokenId is provided
  useEffect(() => {
    if (!tokenId) {
      // Clean up if no token
      if (ablyRef.current) {
        ablyRef.current.close();
        ablyRef.current = null;
        channelRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    let isCurrentConnection = true; // Prevent race conditions

    const connect = async () => {
      try {
        // FIXED: Use authCallback instead of authParams to control request format
        const ably = new Ably.Realtime({
          authCallback: async (_tokenParams, callback) => {
            try {
              const response = await fetch('/api/ably/simple-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokenId }),
              });

              if (!response.ok) {
                throw new Error(`Failed to get Ably token: ${response.statusText}`);
              }

              const tokenRequest = await response.json();
              callback(null, tokenRequest);
            } catch (error) {
              callback(error as string, null);
            }
          },
          autoConnect: true,
          // Add proper error handling and retry configuration
          disconnectedRetryTimeout: 15000,
          suspendedRetryTimeout: 30000,
        });

        // Check if this connection is still current
        if (!isCurrentConnection) {
          ably.close();
          return;
        }

        // Single channel based on tokenId
        const channel = ably.channels.get(`token:${tokenId}`);

        // Subscribe to all message types on single channel
        channel.subscribe((message) => {
          const { type, ...data } = message.data as SimpleAblyMessage;

          switch (type) {
            case 'transcription':
              if (data.transcript && data.sessionId) {
                callbacksRef.current.onTranscriptReceived?.(data.transcript, data.sessionId);
              }
              break;

            case 'patient_updated':
              if (data.sessionId && data.patientName) {
                setCurrentSessionId(data.sessionId);
                // FIXED: Only mobile devices should receive session updates
                // Desktop shouldn't process its own broadcasts
                if (isMobile) {
                  callbacksRef.current.onSessionChanged?.(data.sessionId, data.patientName);
                }
              }
              break;
          }
        });

        // Track connection state with better error handling
        ably.connection.on('connected', () => {
          if (!isCurrentConnection) {
            return;
          }
          setIsConnected(true);
          onConnectionStatusChanged?.('connected');
        });

        ably.connection.on('disconnected', () => {
          if (!isCurrentConnection) {
            return;
          }
          setIsConnected(false);
          onConnectionStatusChanged?.('disconnected');
        });

        ably.connection.on('suspended', () => {
          if (!isCurrentConnection) {
            return;
          }
          setIsConnected(false);
          onConnectionStatusChanged?.('disconnected');
        });

        ably.connection.on('failed', (error) => {
          if (!isCurrentConnection) {
            return;
          }
          setIsConnected(false);
          onConnectionStatusChanged?.('error');
          callbacksRef.current.onError?.(`Connection failed: ${error?.reason || 'Unknown error'}`);
        });

        // Handle auth failures specifically
        ably.connection.on('update', (change) => {
          if (!isCurrentConnection) {
            return;
          }
          if (change.reason?.code === 40142 || change.reason?.code === 40140) {
            // Token expired or invalid - clear connection
            onConnectionStatusChanged?.('error');
            callbacksRef.current.onError?.('Authentication failed: Token expired or invalid');
          }
        });

        // Only set refs if this is still the current connection
        if (isCurrentConnection) {
          ablyRef.current = ably;
          channelRef.current = channel;
        } else {
          // Clean up abandoned connection
          ably.close();
        }
      } catch (error: any) {
        if (isCurrentConnection) {
          onConnectionStatusChanged?.('error');
          callbacksRef.current.onError?.(`Failed to connect: ${error.message}`);
        }
      }
    };

    connect();

    return () => {
      isCurrentConnection = false; // Mark this connection as outdated

      if (ablyRef.current) {
        ablyRef.current.close();
        ablyRef.current = null;
        channelRef.current = null;
      }
      setIsConnected(false);
      setCurrentSessionId(null);
    };
  }, [tokenId, onConnectionStatusChanged, isMobile]); // Only tokenId in dependency array

  // Send transcript (mobile to desktop)
  const sendTranscript = useCallback((transcript: string) => {
    if (!channelRef.current || !currentSessionId || !transcript.trim()) {
      return false;
    }

    try {
      channelRef.current.publish('transcription', {
        type: 'transcription',
        transcript: transcript.trim(),
        sessionId: currentSessionId,
        timestamp: Date.now(),
      });
      return true;
    } catch (error: any) {
      callbacksRef.current.onError?.(`Failed to send transcript: ${error.message}`);
      return false;
    }
  }, [currentSessionId]);

  // Update session (desktop to mobile)
  const updateSession = useCallback((sessionId: string, patientName: string) => {
    if (!channelRef.current) {
      return false;
    }

    try {
      channelRef.current.publish('patient_updated', {
        type: 'patient_updated',
        sessionId,
        patientName,
        timestamp: Date.now(),
      });
      setCurrentSessionId(sessionId);
      return true;
    } catch (error: any) {
      callbacksRef.current.onError?.(`Failed to update session: ${error.message}`);
      return false;
    }
  }, []);

  // Fallback session fetching when Ably is disconnected
  const fetchCurrentSession = useCallback(async () => {
    if (!tokenId || isConnected) {
      return; // Don't fetch if connected or no token
    }

    // Throttle requests - only fetch every 10 seconds
    const now = Date.now();
    if (now - lastSessionFetch < 10000) {
      return;
    }

    try {
      setLastSessionFetch(now);

      const response = await fetch(`/api/mobile/current-session?token=${encodeURIComponent(tokenId)}`);

      if (!response.ok) {
        // FIXED: Better error handling for session fetch failures
        if (response.status === 401) {
          callbacksRef.current.onError?.('Token expired or invalid');
        } else {
          console.warn('Failed to fetch current session:', response.statusText);
        }
        return;
      }

      const sessionData = await response.json();

      if (sessionData.sessionId && sessionData.patientName) {
        // Only update if session has changed
        if (sessionData.sessionId !== currentSessionId) {
          setCurrentSessionId(sessionData.sessionId);
          callbacksRef.current.onSessionChanged?.(sessionData.sessionId, sessionData.patientName);
        }
      }
    } catch (error) {
      console.warn('Error fetching current session:', error);
    }
  }, [tokenId, isConnected, lastSessionFetch, currentSessionId]);

  // Poll for session updates when disconnected
  useEffect(() => {
    if (!tokenId || isConnected) {
      return;
    }

    // Initial fetch
    fetchCurrentSession();

    // Set up polling every 15 seconds when disconnected
    const interval = setInterval(fetchCurrentSession, 15000);

    return () => clearInterval(interval);
  }, [tokenId, isConnected, fetchCurrentSession]);

  return {
    isConnected,
    currentSessionId,
    sendTranscript,
    updateSession,
    fetchCurrentSession, // Expose for manual refresh
  };
};

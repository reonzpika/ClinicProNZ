import * as Ably from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';

// 🆕 Enhanced transcription data structure
export type EnhancedTranscriptionData = {
  confidence?: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
    punctuated_word: string;
  }>;
  paragraphs?: any;
};

type SimpleAblyMessage = {
  type: 'transcription' | 'recording_status' | 'recording_control' | 'token_rotated';
  transcript?: string;
  timestamp?: number;
  // 🆕 Enhanced transcription fields
  confidence?: number;
  words?: any[];
  paragraphs?: any;
  // 🆕 Recording status fields
  isRecording?: boolean;
  // 🆕 Recording control fields
  action?: 'start' | 'stop';
};

export type UseSimpleAblyOptions = {
  tokenId: string | null;
  onTranscriptReceived?: (transcript: string, enhancedData?: EnhancedTranscriptionData) => void; // Simplified: no sessionId needed
  onRecordingStatusChanged?: (isRecording: boolean) => void; // Simplified: no sessionId needed
  onError?: (error: string) => void;
  onConnectionStatusChanged?: (isConnected: boolean) => void;
  isMobile?: boolean;
  onControlCommand?: (action: 'start' | 'stop') => void; // For mobile remote control
};

export const useSimpleAbly = ({
  tokenId,
  onTranscriptReceived,
  onRecordingStatusChanged,
  onError,
  onConnectionStatusChanged,
  isMobile = false, // Default to false (desktop)
  onControlCommand,
}: UseSimpleAblyOptions) => {
  const [isConnected, setIsConnected] = useState(false);

  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  // Outbox queue for reliability of messages
  const outboxRef = useRef<Array<{ eventName: string; data: any }>>([]);
  // Track last seen message timestamp to reconcile via History on reconnect
  const lastSeenTsRef = useRef<number>(0);

  // Stable callback refs to prevent re-connections
  const callbacksRef = useRef({
    onTranscriptReceived,
    onRecordingStatusChanged,
    onError,
    onControlCommand,
  });

  // Update callbacks without triggering reconnection
  useEffect(() => {
    callbacksRef.current = {
      onTranscriptReceived,
      onRecordingStatusChanged,
      onError,
      onControlCommand,
    };
  }, [onTranscriptReceived, onRecordingStatusChanged, onError, onControlCommand]);

  // Update connection status based on connection state
  const updateConnectionStatus = useCallback((connected: boolean) => {
    setIsConnected(connected);
    onConnectionStatusChanged?.(connected);
  }, [onConnectionStatusChanged]);

  // Internal helper to safely publish and handle both sync errors and async rejections
  const publishSafe = useCallback((eventName: string, data: any, options?: { queueIfNotReady?: boolean }): boolean => {
    const queueIfNotReady = options?.queueIfNotReady ?? true;
    const ready = !!ablyRef.current && ablyRef.current.connection.state === 'connected' && !!channelRef.current;
    if (!ready) {
      if (queueIfNotReady) {
        // Cap outbox length to avoid unbounded growth
        if (outboxRef.current.length > 20) {
          outboxRef.current.shift();
        }
        outboxRef.current.push({ eventName, data });
        return true; // treat as accepted (will flush later)
      }
      return false;
    }
    try {
      const result: any = channelRef.current!.publish(eventName, data);
      if (result && typeof result.then === 'function') {
        result.catch((err: any) => {
          callbacksRef.current.onError?.(`Failed to publish ${eventName}: ${err?.message || 'Unknown error'}`);
        });
      }
      return true;
    } catch (err: any) {
      callbacksRef.current.onError?.(`Failed to publish ${eventName}: ${err?.message || 'Unknown error'}`);
      return false;
    }
  }, [callbacksRef]);

  // Removed session request - no longer needed in simplified architecture

  // Connect when tokenId is provided
  useEffect(() => {
    if (!tokenId) {
      // Clean up if no token
      if (ablyRef.current) {
        try {
          const state = ablyRef.current.connection?.state;
          if (state !== 'closing' && state !== 'closed') {
            ablyRef.current.close();
          }
        } catch {
          // ignore close errors
        } finally {
          ablyRef.current = null;
          channelRef.current = null;
          setIsConnected(false);
        }
      }
      return;
    }

    let isCurrentConnection = true; // Prevent race conditions

    const connect = async () => {
      try {
        // Use authCallback and connect explicitly after wiring listeners to avoid races
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
          autoConnect: false,
          // Add proper error handling and retry configuration
          disconnectedRetryTimeout: 15000,
          suspendedRetryTimeout: 30000,
        });

        // Check if this connection is still current
        if (!isCurrentConnection) {
          ably.close();
          return;
        }

        // Emit connecting state - use false until actually connected
        onConnectionStatusChanged?.(false);

        // Wire connection handlers BEFORE connecting to avoid missing early events
        ably.connection.on('connecting', () => {
          if (!isCurrentConnection) {
 return;
}
          onConnectionStatusChanged?.(false);
        });

        ably.connection.on('connected', async () => {
          if (!isCurrentConnection) {
 return;
}
          try {
            // Ensure channel exists and is attached after connecting
            let channel: Ably.RealtimeChannel;
            try {
              channel = ably.channels.get(`token:${tokenId}`, { params: { rewind: '1' } } as any);
            } catch {
              channel = ably.channels.get(`token:${tokenId}?rewind=1` as any);
            }
            try {
              await channel.attach();
            } catch {
              // ignore attach errors; subscribe will attach implicitly
            }

            // Simplified connection for mobile-as-microphone architecture

            // Mark as connected - ready to send/receive transcripts
            updateConnectionStatus(true);

            // Flush any queued messages now that we are connected and channel is attached
            try {
              if (channelRef.current) {
                // already set
              }
            } catch {}
            // Set refs only after successful connect/attach
            if (isCurrentConnection) {
              ablyRef.current = ably;
              channelRef.current = ably.channels.get(`token:${tokenId}` as any);
              // Flush outbox
              if (outboxRef.current.length > 0) {
                const pending = [...outboxRef.current];
                outboxRef.current = [];
                pending.forEach((item) => {
                  try {
                    channelRef.current!.publish(item.eventName, item.data);
                  } catch {
                    // If publish fails, re-queue once
                    outboxRef.current.push(item);
                  }
                });
              }
            }
          } catch (e) {
            console.warn('Post-connect setup error:', e);
            updateConnectionStatus(true);
          }
        });

        ably.connection.on('disconnected', () => {
          if (!isCurrentConnection) {
 return;
}
          updateConnectionStatus(false);
        });

        ably.connection.on('suspended', () => {
          if (!isCurrentConnection) {
 return;
}
          onConnectionStatusChanged?.(false);
        });

        ably.connection.on('failed', (error) => {
          if (!isCurrentConnection) {
 return;
}
          updateConnectionStatus(false);
          callbacksRef.current.onError?.(`Connection failed: ${error?.reason || 'Unknown error'}`);
        });

        ably.connection.on('closed', () => {
          if (!isCurrentConnection) {
 return;
}
          updateConnectionStatus(false);
        });

        ably.connection.on('update', (change) => {
          if (!isCurrentConnection) {
 return;
}
          if (change.reason?.code === 40142 || change.reason?.code === 40140) {
            onConnectionStatusChanged?.(false);
            callbacksRef.current.onError?.('Authentication failed: Token expired or invalid');
          }
        });

        // Now that handlers are wired, initiate the connection
        ably.connect();

        // Single channel based on tokenId with rewind to avoid missed messages
        let channel: Ably.RealtimeChannel;
        try {
          // Preferred: params object (supported by recent Ably SDKs)
          channel = ably.channels.get(`token:${tokenId}`, { params: { rewind: '1' } } as any);
        } catch {
          // Fallback: embed query into channel name if params are not supported
          channel = ably.channels.get(`token:${tokenId}?rewind=1` as any);
        }
        try {
          await channel.attach();
        } catch {
          // ignore attach errors; subscribe will attach implicitly
        }

        // Direct message subscription - no presence tracking needed

        // Subscribe to all message types on single channel
        channel.subscribe((message) => {
          if (typeof message.timestamp === 'number') {
            lastSeenTsRef.current = Math.max(lastSeenTsRef.current, message.timestamp);
          }
          const { type, ...data } = message.data as SimpleAblyMessage;

          switch (type) {
            case 'token_rotated':
              // Server indicates this token is rotated; disconnect gracefully
              try {
                ablyRef.current?.close();
              } catch {}
              updateConnectionStatus(false);
              callbacksRef.current.onError?.('Authentication failed: Token expired or invalid');
              break;

            case 'transcription':
              if (data.transcript) {
                // Extract enhanced data from Ably message
                const enhancedData: EnhancedTranscriptionData | undefined
                  = (data.confidence !== undefined || (data.words && data.words.length > 0))
                    ? {
                        confidence: data.confidence,
                        words: data.words || [],
                        paragraphs: data.paragraphs,
                      }
                    : undefined;

                callbacksRef.current.onTranscriptReceived?.(data.transcript, enhancedData);
              }
              break;

            case 'recording_status':
              if (data.isRecording !== undefined) {
                // Only desktop should receive recording status updates
                if (!isMobile) {
                  callbacksRef.current.onRecordingStatusChanged?.(data.isRecording);
                }
              }
              break;

            case 'recording_control':
              if (isMobile && (data.action === 'start' || data.action === 'stop')) {
                // Invoke control command; mobile page will handle start/stop
                callbacksRef.current.onControlCommand?.(data.action);
              }
              break;
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
          onConnectionStatusChanged?.(false);
          callbacksRef.current.onError?.(`Failed to connect: ${error.message}`);
        }
      }
    };

    connect();

    return () => {
      isCurrentConnection = false; // Mark this connection as outdated

      if (ablyRef.current) {
        // Clean up connection
        try {
          const state = ablyRef.current.connection?.state;
          if (state !== 'closing' && state !== 'closed') {
            ablyRef.current.close();
          }
        } catch {
          // ignore close errors
        } finally {
          ablyRef.current = null;
          channelRef.current = null;
        }
      }
      setIsConnected(false);
    };
  }, [tokenId, onConnectionStatusChanged, isMobile, publishSafe, updateConnectionStatus]);

  // Reconcile missed messages using Ably History on connect and when coming back from suspended
  useEffect(() => {
    const reconcile = async () => {
      if (!channelRef.current || !ablyRef.current) {
 return;
}
      try {
        const start = lastSeenTsRef.current ? new Date(lastSeenTsRef.current + 1) : undefined;
        // Fetch a reasonable window of missed messages
        const history = await (channelRef.current as any).history({ start, direction: 'forwards', limit: 100 });
        // history.items in reverse-chronological; process oldest-first
        const items = (history.items || []).slice().reverse();
        for (const item of items) {
          const { type, ...data } = (item.data || {}) as SimpleAblyMessage;
          if (typeof item.timestamp === 'number') {
            lastSeenTsRef.current = Math.max(lastSeenTsRef.current, item.timestamp);
          }
          switch (type) {
            case 'transcription':
              if (data.transcript) {
                const enhancedData = (data.confidence !== undefined || (data.words && data.words.length > 0))
                  ? { confidence: data.confidence, words: data.words || [], paragraphs: data.paragraphs }
                  : undefined;
                callbacksRef.current.onTranscriptReceived?.(data.transcript, enhancedData);
              }
              break;
            case 'recording_status':
              if (!isMobile && data.isRecording !== undefined) {
                callbacksRef.current.onRecordingStatusChanged?.(data.isRecording);
              }
              break;
          }
        }
      } catch {
        // ignore history errors
      }
    };

    // Run on connect
    if (isConnected) {
      void reconcile();
    }
  }, [isConnected, isMobile]);

  // Removed visibility handling - not needed in simplified architecture

  // Removed duplicate publishSafe definition (moved earlier in file)

  // Send transcript with enhanced data (mobile to desktop)
  const sendTranscript = useCallback((transcript: string, enhancedData?: EnhancedTranscriptionData) => {
    if (!transcript.trim()) {
      return false;
    }
    return publishSafe('transcription', {
      type: 'transcription',
      transcript: transcript.trim(),
      timestamp: Date.now(),
      confidence: enhancedData?.confidence,
      words: enhancedData?.words || [],
      paragraphs: enhancedData?.paragraphs,
    }, { queueIfNotReady: false });
  }, [publishSafe]);

  // Send recording status (mobile to desktop)
  const sendRecordingStatus = useCallback((isRecording: boolean) => {
    return publishSafe('recording_status', {
      type: 'recording_status',
      isRecording,
      timestamp: Date.now(),
    }, { queueIfNotReady: false });
  }, [publishSafe]);

  // Removed updateSession - no longer needed in simplified architecture

  // Send recording control (desktop to mobile)
  const sendRecordingControl = useCallback((action: 'start' | 'stop') => {
    return publishSafe('recording_control', {
      type: 'recording_control',
      action,
      timestamp: Date.now(),
    });
  }, [publishSafe]);

  // Removed HTTP polling - using broadcast requests instead

  return {
    isConnected,
    sendTranscript,
    sendRecordingStatus,
    sendRecordingControl,
  };
};

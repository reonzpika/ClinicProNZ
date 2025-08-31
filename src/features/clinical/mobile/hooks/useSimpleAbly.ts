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
  type: 'transcriptions_updated' | 'recording_status' | 'recording_control' | 'images_uploaded';
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
  // 🆕 Image upload notification fields
  mobileTokenId?: string;
  imageCount?: number;
  uploadTimestamp?: string;
};

export type UseSimpleAblyOptions = {
  userId: string | null;
  onRecordingStatusChanged?: (isRecording: boolean) => void; // Simplified: no sessionId needed
  onError?: (error: string) => void;
  onConnectionStatusChanged?: (isConnected: boolean) => void;
  isMobile?: boolean;
  onControlCommand?: (action: 'start' | 'stop') => void; // For mobile remote control
  onMobileImagesUploaded?: (mobileTokenId: string, imageCount: number, timestamp: string) => void; // For desktop image notification
  onTranscriptionsUpdated?: (sessionId?: string, chunkId?: string) => void;
};

export const useSimpleAbly = ({
  userId,
  onRecordingStatusChanged,
  onError,
  onConnectionStatusChanged,
  isMobile = false, // Default to false (desktop)
  onControlCommand,
  onMobileImagesUploaded,
  onTranscriptionsUpdated,
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
    onRecordingStatusChanged,
    onError,
    onControlCommand,
    onMobileImagesUploaded,
    onTranscriptionsUpdated,
  });

  // Update callbacks without triggering reconnection
  useEffect(() => {
    callbacksRef.current = {
      onRecordingStatusChanged,
      onError,
      onControlCommand,
      onMobileImagesUploaded,
      onTranscriptionsUpdated,
    } as any;
  }, [onRecordingStatusChanged, onError, onControlCommand, onMobileImagesUploaded, onTranscriptionsUpdated]);

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

  // Connect when userId is provided. Re-initialise if userId changes from null->value or value->different value.
  useEffect(() => {
    if (!userId) {
      // Defer cleanup slightly to avoid thrashing during rapid auth transitions
      const timer = setTimeout(() => {
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
      }, 50);
      return () => clearTimeout(timer);
    }

    let isCurrentConnection = true; // Prevent race conditions

    const connect = async () => {
      try {
        // Use authCallback and connect explicitly after wiring listeners to avoid races
        const ably = new Ably.Realtime({
          clientId: userId,
          authUrl: '/api/ably/user-token',
          autoConnect: false,
          transports: ['web_socket', 'xhr_streaming', 'xhr_polling'] as any,
          disconnectedRetryTimeout: 10000,
          suspendedRetryTimeout: 20000,
        } as any);

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
          try { if (!isMobile) console.info('[Ably] connecting'); } catch {}
        });

        ably.connection.on('connected', async () => {
          if (!isCurrentConnection) {
 return;
}
          try {
            // Ensure channel exists and is attached after connecting
            let channel: Ably.RealtimeChannel;
            try {
              channel = isMobile
                ? (ably.channels.get(`user:${userId}`, { params: { rewind: '1' } } as any))
                : (ably.channels.get(`user:${userId}` as any));
            } catch {
              channel = isMobile
                ? (ably.channels.get(`user:${userId}?rewind=1` as any))
                : (ably.channels.get(`user:${userId}` as any));
            }
            try {
              await channel.attach();
            } catch {
              // ignore attach errors; subscribe will attach implicitly
            }
            try { if (!isMobile) console.info('[Ably] connected; channel attached'); } catch {}

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
              channelRef.current = ably.channels.get(`user:${userId}` as any);
              try { if (!isMobile) console.info('[Ably] connection ready on channel user:' + userId); } catch {}
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
          try { if (!isMobile) console.info('[Ably] disconnected'); } catch {}
        });

        ably.connection.on('suspended', () => {
          if (!isCurrentConnection) {
 return;
}
          onConnectionStatusChanged?.(false);
          try { if (!isMobile) console.info('[Ably] suspended'); } catch {}
        });

        ably.connection.on('failed', (error) => {
          if (!isCurrentConnection) {
 return;
}
          updateConnectionStatus(false);
          callbacksRef.current.onError?.(`Connection failed: ${error?.reason || 'Unknown error'}`);
          try { if (!isMobile) console.warn('[Ably] failed', error); } catch {}
        });

        ably.connection.on('closed', () => {
          if (!isCurrentConnection) {
 return;
}
          updateConnectionStatus(false);
          try { if (!isMobile) console.info('[Ably] closed'); } catch {}
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

        // Single channel based on userId
        let channel: Ably.RealtimeChannel;
        try {
          channel = isMobile
            ? (ably.channels.get(`user:${userId}`, { params: { rewind: '1' } } as any))
            : (ably.channels.get(`user:${userId}` as any));
        } catch {
          channel = isMobile
            ? (ably.channels.get(`user:${userId}?rewind=1` as any))
            : (ably.channels.get(`user:${userId}` as any));
        }
        try {
          await channel.attach();
        } catch {
          // ignore attach errors; subscribe will attach implicitly
        }

        // Direct message subscription - no presence tracking needed

        // Subscribe to all message types on single channel
        try { if (!isMobile) console.info('[Ably] subscribing to channel user:' + userId); } catch {}
        channel.subscribe((message) => {
          if (typeof message.timestamp === 'number') {
            lastSeenTsRef.current = Math.max(lastSeenTsRef.current, message.timestamp);
          }
          const { type, ...data } = message.data as SimpleAblyMessage;

          switch (type) {
            case 'transcriptions_updated':
              try { if (!isMobile) console.info('[Ably] message: transcriptions_updated'); } catch {}
              callbacksRef.current.onTranscriptionsUpdated?.((data as any).sessionId, (data as any).chunkId);
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

            case 'images_uploaded':
              if (!isMobile && data.mobileTokenId && data.imageCount && data.uploadTimestamp) {
                // Only desktop should receive image upload notifications
                callbacksRef.current.onMobileImagesUploaded?.(
                  data.mobileTokenId,
                  data.imageCount,
                  data.uploadTimestamp,
                );
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
  }, [userId, onConnectionStatusChanged, isMobile, publishSafe, updateConnectionStatus]);

  // Removed history reconciliation to avoid duplicate replays after hydration

  // Removed visibility handling - not needed in simplified architecture

  // Removed duplicate publishSafe definition (moved earlier in file)

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

  // Send image upload notification (mobile to desktop)
  const sendImageNotification = useCallback((mobileTokenId: string, imageCount: number) => {
    return publishSafe('images_uploaded', {
      type: 'images_uploaded',
      mobileTokenId,
      imageCount,
      uploadTimestamp: new Date().toISOString(),
      timestamp: Date.now(),
    }, { queueIfNotReady: true }); // Queue if not ready to ensure delivery
  }, [publishSafe]);

  // Removed HTTP polling - using broadcast requests instead

  return {
    isConnected,
    sendRecordingStatus,
    sendRecordingControl,
    sendImageNotification,
  };
};

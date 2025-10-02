import * as Ably from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';

type SimpleAblyMessage = {
  type: 'transcriptions_updated' | 'recording_status' | 'recording_control' | 'images_uploaded' | 'session_context' | 'transcription_status' | 'flush_request' | 'consent_request' | 'consent_granted' | 'consent_denied';
  transcript?: string;
  timestamp?: number;
  // Recording status fields
  isRecording?: boolean;
  // Recording control fields
  action?: 'start' | 'stop';
  // Consent fields
  requestId?: string;
  initiator?: 'desktop' | 'mobile';
  actor?: 'desktop' | 'mobile';
  reason?: 'user' | 'timeout' | 'other';
  // Image upload notification fields
  mobileTokenId?: string;
  imageCount?: number;
  uploadTimestamp?: string;
  // Session context fields
  sessionId?: string | null;
  // Transcription status fields
  state?: 'flushing' | 'flushed';
  lastChunkId?: string;
};

export type UseSimpleAblyOptions = {
  userId: string | null;
  onRecordingStatusChanged?: (isRecording: boolean) => void; // Simplified: no sessionId needed
  onError?: (error: string) => void;
  onConnectionStatusChanged?: (isConnected: boolean) => void;
  isMobile?: boolean;
  onControlCommand?: (action: 'start' | 'stop') => void; // For mobile remote control
  onMobileImagesUploaded?: (mobileTokenId: string | undefined, imageCount: number, timestamp: string, sessionId?: string | null) => void; // For desktop image notification
  onTranscriptionsUpdated?: (sessionId?: string, chunkId?: string) => void;
  onTranscriptionFlushed?: (sessionId?: string, lastChunkId?: string) => void; // Desktop waits on this
  onSessionContextChanged?: (sessionId: string | null) => void; // For mobile to receive session context
  onConsentRequested?: (data: { requestId: string; initiator: 'desktop' | 'mobile'; sessionId?: string | null }) => void;
  onConsentGranted?: (data: { requestId: string; actor: 'desktop' | 'mobile'; sessionId?: string | null }) => void;
  onConsentDenied?: (data: { requestId: string; actor: 'desktop' | 'mobile'; reason?: 'user' | 'timeout' | 'other'; sessionId?: string | null }) => void;
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
  onTranscriptionFlushed,
  onSessionContextChanged,
  onConsentRequested,
  onConsentGranted,
  onConsentDenied,
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
    onConnectionStatusChanged,
    onControlCommand,
    onMobileImagesUploaded,
    onTranscriptionsUpdated,
    onTranscriptionFlushed,
    onSessionContextChanged,
    onConsentRequested,
    onConsentGranted,
    onConsentDenied,
  });

  // Update callbacks without triggering reconnection
  useEffect(() => {
    callbacksRef.current = {
      onRecordingStatusChanged,
      onError,
      onConnectionStatusChanged,
      onControlCommand,
      onMobileImagesUploaded,
      onTranscriptionsUpdated,
      onTranscriptionFlushed,
      onSessionContextChanged,
      onConsentRequested,
      onConsentGranted,
      onConsentDenied,
    } as any;
  }, [onRecordingStatusChanged, onError, onConnectionStatusChanged, onControlCommand, onMobileImagesUploaded, onTranscriptionsUpdated, onTranscriptionFlushed, onSessionContextChanged, onConsentRequested, onConsentGranted, onConsentDenied]);

  // Connection status is updated directly to avoid unstable deps

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

            // Simplified connection for mobile-as-microphone architecture

            // Mark as connected - ready to send/receive transcripts
            setIsConnected(true);
            try {
 callbacksRef.current.onConnectionStatusChanged?.(true);
} catch {}

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
            setIsConnected(true);
            try {
 callbacksRef.current.onConnectionStatusChanged?.(true);
} catch {}
          }
        });

        ably.connection.on('disconnected', () => {
          if (!isCurrentConnection) {
 return;
}
          setIsConnected(false);
          try {
 callbacksRef.current.onConnectionStatusChanged?.(false);
} catch {}
        });

        ably.connection.on('suspended', () => {
          if (!isCurrentConnection) {
 return;
}
          setIsConnected(false);
          try {
 callbacksRef.current.onConnectionStatusChanged?.(false);
} catch {}
        });

        ably.connection.on('failed', (error) => {
          if (!isCurrentConnection) {
 return;
}
          setIsConnected(false);
          try {
 callbacksRef.current.onConnectionStatusChanged?.(false);
} catch {}
          callbacksRef.current.onError?.(`Connection failed: ${error?.reason || 'Unknown error'}`);
          try {
 if (!isMobile) {
 console.warn('[Ably] failed', error);
}
} catch {}
        });

        ably.connection.on('closed', () => {
          if (!isCurrentConnection) {
 return;
}
          setIsConnected(false);
          try {
 callbacksRef.current.onConnectionStatusChanged?.(false);
} catch {}
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

        channel.subscribe((message) => {
          if (typeof message.timestamp === 'number') {
            lastSeenTsRef.current = Math.max(lastSeenTsRef.current, message.timestamp);
          }
          const { type, ...data } = message.data as SimpleAblyMessage;

          switch (type) {
            case 'transcriptions_updated':

              callbacksRef.current.onTranscriptionsUpdated?.((data as any).sessionId, (data as any).chunkId);
              break;
            case 'consent_request':
              if ((data as any).requestId && (data as any).initiator) {
                callbacksRef.current.onConsentRequested?.({
                  requestId: (data as any).requestId,
                  initiator: (data as any).initiator,
                  sessionId: (data as any).sessionId ?? undefined,
                });
              }
              break;
            case 'consent_granted':
              if ((data as any).requestId && (data as any).actor) {
                callbacksRef.current.onConsentGranted?.({
                  requestId: (data as any).requestId,
                  actor: (data as any).actor,
                  sessionId: (data as any).sessionId ?? undefined,
                });
              }
              break;
            case 'consent_denied':
              if ((data as any).requestId && (data as any).actor) {
                callbacksRef.current.onConsentDenied?.({
                  requestId: (data as any).requestId,
                  actor: (data as any).actor,
                  reason: (data as any).reason,
                  sessionId: (data as any).sessionId ?? undefined,
                });
              }
              break;
            case 'transcription_status':
              if (!isMobile && data.state === 'flushed') {
                callbacksRef.current.onTranscriptionFlushed?.(data.sessionId ?? undefined, (data as any).lastChunkId);
              }
              break;

            case 'flush_request':
              // Mobile may optionally respond by initiating a flush and then emit 'transcription_status: flushed'
              // Desktop side does not process this case
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
              if (!isMobile && data.imageCount && data.uploadTimestamp) {
                // Only desktop should receive image upload notifications
                callbacksRef.current.onMobileImagesUploaded?.(
                  data.mobileTokenId,
                  data.imageCount,
                  data.uploadTimestamp,
                  data.sessionId,
                );
              }
              break;

            case 'session_context':
              if (isMobile) {
                callbacksRef.current.onSessionContextChanged?.(data.sessionId ?? null);
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
          try {
 callbacksRef.current.onConnectionStatusChanged?.(false);
} catch {}
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
  }, [userId, isMobile]);

  // Removed history reconciliation to avoid duplicate replays after hydration

  // Removed visibility handling - not needed in simplified architecture

  // Removed duplicate publishSafe definition (moved earlier in file)

  // Attempt to reconnect and reattach channel when app returns to foreground or network returns
  const attemptReconnect = useCallback(async () => {
    const ably = ablyRef.current;
    if (!ably) {
      return;
    }

    const state = ably.connection.state as any;
    if (state === 'suspended' || state === 'disconnected' || state === 'closing' || state === 'closed') {
      try {
        ably.connect();
      } catch {
        // ignore connect errors; Ably will retry
      }
    }

    // Ensure channel is attached
    const ch = channelRef.current;
    if (ch) {
      try {
        const channelState = (ch as any).state as string | undefined;
        if (channelState !== 'attached' && channelState !== 'attaching') {
          try {
            await ch.attach();
          } catch {
            // attach may fail if connection not ready yet; next resume will retry
          }
        }
      } catch {
        // ignore state access errors
      }
    }

    // Try to flush any queued messages if ready
    if (channelRef.current && outboxRef.current.length > 0 && ably.connection.state === 'connected') {
      const pending = [...outboxRef.current];
      outboxRef.current = [];
      for (const item of pending) {
        try {
          channelRef.current.publish(item.eventName, item.data);
        } catch {
          // If publish fails, re-queue once
          outboxRef.current.push(item);
        }
      }
    }
  }, []);

  // Reconnect on visibility/pageshow/online events
  useEffect(() => {
    const onVisibilityChange = () => {
      try {
        if (document.visibilityState === 'visible') {
          attemptReconnect();
        }
      } catch {
        // ignore
      }
    };
    const onPageShow = () => {
      attemptReconnect();
    };
    const onOnline = () => {
      attemptReconnect();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', onPageShow);
      window.addEventListener('online', onOnline);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('pageshow', onPageShow);
        window.removeEventListener('online', onOnline);
      }
    };
  }, [attemptReconnect]);

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
  const sendImageNotification = useCallback((mobileTokenId: string | undefined, imageCount: number, sessionId?: string | null) => {
    return publishSafe('images_uploaded', {
      type: 'images_uploaded',
      mobileTokenId,
      imageCount,
      sessionId: sessionId ?? undefined,
      uploadTimestamp: new Date().toISOString(),
      timestamp: Date.now(),
    }, { queueIfNotReady: true }); // Queue if not ready to ensure delivery
  }, [publishSafe]);

  // Send session context (desktop to mobile)
  const sendSessionContext = useCallback((sessionId: string | null) => {
    return publishSafe('session_context', {
      type: 'session_context',
      sessionId,
      timestamp: Date.now(),
    }, { queueIfNotReady: true });
  }, [publishSafe]);

  // Consent signalling
  const sendConsentRequest = useCallback((requestId: string, initiator: 'desktop' | 'mobile', sessionId?: string | null) => {
    return publishSafe('consent_request', {
      type: 'consent_request',
      requestId,
      initiator,
      sessionId: sessionId ?? undefined,
      timestamp: Date.now(),
    });
  }, [publishSafe]);

  const sendConsentGranted = useCallback((requestId: string, actor: 'desktop' | 'mobile', sessionId?: string | null) => {
    return publishSafe('consent_granted', {
      type: 'consent_granted',
      requestId,
      actor,
      sessionId: sessionId ?? undefined,
      timestamp: Date.now(),
    });
  }, [publishSafe]);

  const sendConsentDenied = useCallback((requestId: string, actor: 'desktop' | 'mobile', reason: 'user' | 'timeout' | 'other' = 'user', sessionId?: string | null) => {
    return publishSafe('consent_denied', {
      type: 'consent_denied',
      requestId,
      actor,
      reason,
      sessionId: sessionId ?? undefined,
      timestamp: Date.now(),
    });
  }, [publishSafe]);

  // Removed HTTP polling - using broadcast requests instead

  return {
    isConnected,
    sendRecordingStatus,
    sendRecordingControl,
    sendImageNotification,
    sendSessionContext,
    sendConsentRequest,
    sendConsentGranted,
    sendConsentDenied,
  };
};

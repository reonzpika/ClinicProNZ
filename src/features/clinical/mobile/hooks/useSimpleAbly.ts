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
  type: 'transcription' | 'patient_updated' | 'patient_ack' | 'recording_status' | 'recording_control' | 'mobile_visibility' | 'token_rotated';
  transcript?: string;
  sessionId?: string;
  patientName?: string;
  timestamp?: number;
  data?: any;
  // 🆕 Enhanced transcription fields
  confidence?: number;
  words?: any[];
  paragraphs?: any;
  // 🆕 Recording status fields
  isRecording?: boolean;
  // 🆕 Recording control fields
  action?: 'start' | 'stop';
  // 🆕 Mobile visibility fields
  focused?: boolean;
};

export type UseSimpleAblyOptions = {
  tokenId: string | null;
  onTranscriptReceived?: (transcript: string, sessionId: string, enhancedData?: EnhancedTranscriptionData) => void;
  onSessionChanged?: (sessionId: string, patientName: string) => void;
  onSessionAcknowledged?: (sessionId: string, patientName?: string) => void; // 🆕 Acknowledgement from mobile
  onRecordingStatusChanged?: (isRecording: boolean, sessionId: string) => void; // 🆕 Recording status callback
  onError?: (error: string) => void;
  onConnectionStatusChanged?: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void; // NEW: Connection status bridge
  isMobile?: boolean; // NEW: Device type detection
  onControlCommand?: (action: 'start' | 'stop') => void; // NEW: Remote control callback for mobile
};

export const useSimpleAbly = ({
  tokenId,
  onTranscriptReceived,
  onSessionChanged,
  onRecordingStatusChanged,
  onError,
  onConnectionStatusChanged,
  isMobile = false, // Default to false (desktop)
  onControlCommand,
  onSessionAcknowledged,
}: UseSimpleAblyOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [lastSessionFetch, setLastSessionFetch] = useState<number>(0);
  const [hasMobilePeer, setHasMobilePeer] = useState(false); // Track mobile peer presence

  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const lastSessionInfoRef = useRef<{ sessionId: string | null; patientName: string | null }>({ sessionId: null, patientName: null });
  // Outbox queue for reliability of key control/session messages
  const outboxRef = useRef<Array<{ eventName: string; data: any }>>([]);
  // Track last seen message timestamp to reconcile via History on reconnect
  const lastSeenTsRef = useRef<number>(0);

  // Stable callback refs to prevent re-connections
  const callbacksRef = useRef({
    onTranscriptReceived,
    onSessionChanged,
    onSessionAcknowledged,
    onRecordingStatusChanged,
    onError,
    onControlCommand,
  });

  // Update callbacks without triggering reconnection
  useEffect(() => {
    callbacksRef.current = {
      onTranscriptReceived,
      onSessionChanged,
      onSessionAcknowledged,
      onRecordingStatusChanged,
      onError,
      onControlCommand,
    };
  }, [onTranscriptReceived, onSessionChanged, onSessionAcknowledged, onRecordingStatusChanged, onError, onControlCommand]);

  // Update connection status based on connection state and mobile peer presence
  const updateConnectionStatus = useCallback((connected: boolean, _mobilePeerPresent: boolean) => {
    // Connection status should reflect transport connectivity only
    setIsConnected(connected);
    onConnectionStatusChanged?.(connected ? 'connected' : 'disconnected');
  }, [onConnectionStatusChanged]);

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

        // Emit 'connecting' immediately for UI
        onConnectionStatusChanged?.('connecting');

        // Wire connection handlers BEFORE connecting to avoid missing early events
        ably.connection.on('connecting', () => {
          if (!isCurrentConnection) return;
          onConnectionStatusChanged?.('connecting');
        });

        ably.connection.on('connected', async () => {
          if (!isCurrentConnection) return;
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

            // Enter presence with role and best-effort session info
            try {
              const presenceData: any = {
                role: isMobile ? 'mobile' : 'desktop',
                deviceId: isMobile ? navigator.userAgent : 'desktop',
                timestamp: Date.now(),
              };
              // Desktop can include last known session for mobile recovery
              if (!isMobile && lastSessionInfoRef.current.sessionId) {
                presenceData.sessionId = lastSessionInfoRef.current.sessionId;
                presenceData.patientName = lastSessionInfoRef.current.patientName || 'Current Session';
              }
              await channel.presence.enter(presenceData);
            } catch (err) {
              console.warn('Failed to enter presence on connect:', err);
            }

            // For desktop, check if mobile peers are present; for mobile, mark connected immediately
            if (!isMobile) {
              try {
                const members = await channel.presence.get();
                const mobilePeerPresent = members.some(member => member.data?.role === 'mobile');
                setHasMobilePeer(mobilePeerPresent);
              } catch (error) {
                console.warn('Failed to check presence on connect:', error);
              }
              updateConnectionStatus(true, hasMobilePeer);
            } else {
              updateConnectionStatus(true, false);
              // On mobile, reconcile session from presence (covers missed broadcast)
              try {
                const members = await channel.presence.get();
                const withSession = members
                  .map(m => m.data)
                  .filter((d: any) => d && d.sessionId);
                if (withSession.length > 0) {
                  const latest = withSession.reduce((a: any, b: any) => (a.timestamp > b.timestamp ? a : b));
                  if (latest.sessionId) {
                    setCurrentSessionId(latest.sessionId);
                    callbacksRef.current.onSessionChanged?.(latest.sessionId, latest.patientName || 'Current Session');
                    // Acknowledge presence-sourced session
                    publishSafe('patient_ack', {
                      type: 'patient_ack',
                      sessionId: latest.sessionId,
                      patientName: latest.patientName,
                      timestamp: Date.now(),
                    });
                  }
                }
                // If still no session after presence reconciliation, force a one-off server fetch
                if (!currentSessionId) {
                  fetchCurrentSession(true);
                }
              } catch {
                // ignore presence reconciliation errors
              }
            }

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
                pending.forEach(item => {
                  try {
                    channelRef.current!.publish(item.eventName, item.data);
                  } catch (e) {
                    // If publish fails, re-queue once
                    outboxRef.current.push(item);
                  }
                });
              }
            }
          } catch (e) {
            console.warn('Post-connect setup error:', e);
            updateConnectionStatus(true, isMobile ? false : hasMobilePeer);
          }
        });

        ably.connection.on('disconnected', async () => {
          if (!isCurrentConnection) return;
          try {
            if (channelRef.current) {
              await channelRef.current.presence.leave();
            }
          } catch (error) {
            // Suppress noisy console warnings
          }
          setHasMobilePeer(false);
          updateConnectionStatus(false, false);
        });

        ably.connection.on('suspended', async () => {
          if (!isCurrentConnection) return;
          onConnectionStatusChanged?.('connecting');
          try {
            if (channelRef.current) {
              await channelRef.current.presence.leave();
            }
          } catch (error) {
            // Suppress noisy console warnings
          }
          setHasMobilePeer(false);
        });

        ably.connection.on('failed', async (error) => {
          if (!isCurrentConnection) return;
          try {
            if (channelRef.current) {
              await channelRef.current.presence.leave();
            }
          } catch (presenceError) {
            // Suppress noisy console warnings
          }
          setHasMobilePeer(false);
          updateConnectionStatus(false, false);
          onConnectionStatusChanged?.('error');
          callbacksRef.current.onError?.(`Connection failed: ${error?.reason || 'Unknown error'}`);
        });

        ably.connection.on('closed', () => {
          if (!isCurrentConnection) return;
          setHasMobilePeer(false);
          updateConnectionStatus(false, false);
        });

        ably.connection.on('update', (change) => {
          if (!isCurrentConnection) return;
          if (change.reason?.code === 40142 || change.reason?.code === 40140) {
            onConnectionStatusChanged?.('error');
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

        // Function to check mobile peer presence
        const checkMobilePeerPresence = async () => {
          if (!isCurrentConnection) {
            return;
          }

          try {
            const members = await channel.presence.get();
            const mobilePeerPresent = members.some(member => member.data?.role === 'mobile');
            setHasMobilePeer(mobilePeerPresent);
          } catch (error) {
            // Ignore presence errors to avoid disrupting main functionality
            console.warn('Failed to check presence:', error);
          }
        };

        // Subscribe to presence events (desktop only needs to track mobile peers)
        if (!isMobile) {
          channel.presence.subscribe('enter', (member) => {
            if (member.data?.role === 'mobile') {
              setHasMobilePeer(true);
              // Presence changes do not affect connection status
              // Proactively rebroadcast current session for late-joining mobile peers
              if (lastSessionInfoRef.current.sessionId) {
                publishSafe('patient_updated', {
                  type: 'patient_updated',
                  sessionId: lastSessionInfoRef.current.sessionId,
                  patientName: lastSessionInfoRef.current.patientName || 'Current Session',
                  timestamp: Date.now(),
                });
              }
            }
          });

          channel.presence.subscribe('leave', async () => {
            // Recheck all members when someone leaves
            await checkMobilePeerPresence();
          });

          channel.presence.subscribe('update', async () => {
            // Recheck when presence is updated
            await checkMobilePeerPresence();
          });
        }

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
                channelRef.current?.presence.leave();
              } catch {}
              try {
                ablyRef.current?.close();
              } catch {}
              updateConnectionStatus(false, false);
              callbacksRef.current.onError?.('Authentication failed: Token expired or invalid');
              break;
            case 'transcription':
              if (data.transcript && data.sessionId) {
                // 🆕 Extract enhanced data from Ably message
                const enhancedData: EnhancedTranscriptionData | undefined
                  = (data.confidence !== undefined || (data.words && data.words.length > 0))
                    ? {
                        confidence: data.confidence,
                        words: data.words || [],
                        paragraphs: data.paragraphs,
                      }
                    : undefined;

                callbacksRef.current.onTranscriptReceived?.(data.transcript, data.sessionId, enhancedData);
              }
              break;

            case 'patient_updated':
              if (data.sessionId && data.patientName) {
                setCurrentSessionId(data.sessionId);
                // Always notify mobile client to sync UI
                callbacksRef.current.onSessionChanged?.(data.sessionId, data.patientName);
                // Always acknowledge to desktop when session changes
                publishSafe('patient_ack', {
                  type: 'patient_ack',
                  sessionId: data.sessionId,
                  patientName: data.patientName,
                  timestamp: Date.now(),
                });
              }
              break;

            case 'patient_ack':
              if (!isMobile && data.sessionId) {
                callbacksRef.current.onSessionAcknowledged?.(data.sessionId, data.patientName);
              }
              break;

            case 'recording_status':
              if (data.sessionId && data.isRecording !== undefined) {
                // Only desktop should receive recording status updates
                // Mobile shouldn't process its own broadcasts
                if (!isMobile) {
                  callbacksRef.current.onRecordingStatusChanged?.(data.isRecording, data.sessionId);
                }
              }
              break;

            case 'recording_control':
              if (isMobile && (data.action === 'start' || data.action === 'stop')) {
                // Invoke control command; mobile page will handle start/stop and upload
                callbacksRef.current.onControlCommand?.(data.action);
              }
              break;

            case 'mobile_visibility':
              // Desktop receives mobile focus/blur events
              if (!isMobile && data.focused !== undefined) {
                // For now, we just track focus state - could be used for enhanced status
                // This provides real-time feedback about mobile page visibility
                // Note: visibility state is tracked for potential future enhancements
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
          onConnectionStatusChanged?.('error');
          callbacksRef.current.onError?.(`Failed to connect: ${error.message}`);
        }
      }
    };

    connect();

    return () => {
      isCurrentConnection = false; // Mark this connection as outdated

      if (ablyRef.current) {
        // Try to leave presence before closing
        if (channelRef.current) {
          channelRef.current.presence.leave().catch(() => {
            // Ignore errors during cleanup
          });
        }
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
      setHasMobilePeer(false);
      setCurrentSessionId(null);
    };
  }, [tokenId, onConnectionStatusChanged, isMobile]);

  // Reconcile missed messages using Ably History on connect and when coming back from suspended
  useEffect(() => {
    const reconcile = async () => {
      if (!channelRef.current || !ablyRef.current) return;
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
              if (data.transcript && data.sessionId) {
                const enhancedData = (data.confidence !== undefined || (data.words && data.words.length > 0))
                  ? { confidence: data.confidence, words: data.words || [], paragraphs: data.paragraphs }
                  : undefined;
                callbacksRef.current.onTranscriptReceived?.(data.transcript, data.sessionId, enhancedData);
              }
              break;
            case 'patient_updated':
              if (data.sessionId && data.patientName) {
                setCurrentSessionId(data.sessionId);
                callbacksRef.current.onSessionChanged?.(data.sessionId, data.patientName);
              }
              break;
            case 'recording_status':
              if (!isMobile && data.sessionId && data.isRecording !== undefined) {
                callbacksRef.current.onRecordingStatusChanged?.(data.isRecording, data.sessionId);
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

  // Add visibility change handling for mobile devices
  useEffect(() => {
    if (!isMobile || !isConnected || !channelRef.current) {
      return;
    }

    const handleVisibilityChange = () => {
      if (!channelRef.current) {
        return;
      }

      const isVisible = document.visibilityState === 'visible';

      try {
        // Update presence data with focus state
        channelRef.current.presence.update({
          role: 'mobile',
          deviceId: navigator.userAgent,
          timestamp: Date.now(),
          focused: isVisible,
        });

        // Also publish visibility change for immediate desktop response
        channelRef.current.publish('mobile_visibility', {
          type: 'mobile_visibility',
          focused: isVisible,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.warn('Failed to update visibility:', error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMobile, isConnected]);

  // Internal helper to safely publish and handle both sync errors and async rejections
  const publishSafe = useCallback((eventName: string, data: any, options?: { queueIfNotReady?: boolean }): boolean => {
    const queueIfNotReady = options?.queueIfNotReady ?? true;
    const ready = !!ablyRef.current && ablyRef.current.connection.state === 'connected' && !!channelRef.current;
    if (!ready) {
      if (queueIfNotReady) {
        // Cap outbox length to avoid unbounded growth
        if (outboxRef.current.length > 20) outboxRef.current.shift();
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
  }, []);

  // Send transcript with enhanced data (mobile to desktop)
  const sendTranscript = useCallback((transcript: string, enhancedData?: EnhancedTranscriptionData) => {
    if (!currentSessionId || !transcript.trim()) {
      return false;
    }
    return publishSafe('transcription', {
      type: 'transcription',
      transcript: transcript.trim(),
      sessionId: currentSessionId,
      timestamp: Date.now(),
      confidence: enhancedData?.confidence,
      words: enhancedData?.words || [],
      paragraphs: enhancedData?.paragraphs,
    }, { queueIfNotReady: false });
  }, [currentSessionId, publishSafe]);

  // Send recording status (mobile to desktop)
  const sendRecordingStatus = useCallback((isRecording: boolean) => {
    if (!currentSessionId) {
      return false;
    }
    return publishSafe('recording_status', {
      type: 'recording_status',
      isRecording,
      sessionId: currentSessionId,
      timestamp: Date.now(),
    }, { queueIfNotReady: false });
  }, [currentSessionId, publishSafe]);

  // Update session (desktop to mobile)
  const updateSession = useCallback((sessionId: string, patientName: string) => {
    const ok = publishSafe('patient_updated', {
      type: 'patient_updated',
      sessionId,
      patientName,
      timestamp: Date.now(),
    });
    if (ok) {
      setCurrentSessionId(sessionId);
      lastSessionInfoRef.current = { sessionId, patientName };
      // Best-effort: update presence data so late-joining mobile can recover via presence.get()
      try {
        if (channelRef.current) {
          channelRef.current.presence.update({
            role: 'desktop',
            deviceId: 'desktop',
            sessionId,
            patientName,
            timestamp: Date.now(),
          });
        }
      } catch {
        // ignore presence update errors
      }
    }
    return ok;
  }, [publishSafe]);

  // Send recording control (desktop to mobile)
  const sendRecordingControl = useCallback((action: 'start' | 'stop') => {
    if (!currentSessionId) {
      return false;
    }
    return publishSafe('recording_control', {
      type: 'recording_control',
      action,
      sessionId: currentSessionId,
      timestamp: Date.now(),
    });
  }, [currentSessionId, publishSafe]);

  // Fallback session fetching when Ably is disconnected
  const fetchCurrentSession = useCallback(async (force: boolean = false) => {
    if (!tokenId || (isConnected && !force)) {
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
          return;
        }
      }

      const sessionData = await response.json();

      if (sessionData.sessionId && sessionData.patientName) {
        // Only update if session has changed
        if (sessionData.sessionId !== currentSessionId) {
          setCurrentSessionId(sessionData.sessionId);
          callbacksRef.current.onSessionChanged?.(sessionData.sessionId, sessionData.patientName);
        }
      }
    } catch {
      // no-op
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
    sendRecordingStatus, // 🆕 Export recording status function
    updateSession,
    fetchCurrentSession, // Expose for manual refresh
    sendRecordingControl,
  };
};

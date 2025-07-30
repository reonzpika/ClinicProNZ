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
  type: 'transcription' | 'patient_updated' | 'recording_status';
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
};

export type UseSimpleAblyOptions = {
  tokenId: string | null;
  onTranscriptReceived?: (transcript: string, sessionId: string, enhancedData?: EnhancedTranscriptionData) => void;
  onSessionChanged?: (sessionId: string, patientName: string) => void;
  onRecordingStatusChanged?: (isRecording: boolean, sessionId: string) => void; // 🆕 Recording status callback
  onError?: (error: string) => void;
  onConnectionStatusChanged?: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void; // NEW: Connection status bridge
  isMobile?: boolean; // NEW: Device type detection
};

export const useSimpleAbly = ({
  tokenId,
  onTranscriptReceived,
  onSessionChanged,
  onRecordingStatusChanged,
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
    onRecordingStatusChanged,
    onError,
  });

  // Update callbacks without triggering reconnection
  useEffect(() => {
    callbacksRef.current = {
      onTranscriptReceived,
      onSessionChanged,
      onRecordingStatusChanged,
      onError,
    };
  }, [onTranscriptReceived, onSessionChanged, onRecordingStatusChanged, onError]);

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
                // 🆕 Extract enhanced data from Ably message
                const enhancedData: EnhancedTranscriptionData | undefined
                  = (data.confidence !== undefined || (data.words && data.words.length > 0))
                    ? {
                        confidence: data.confidence,
                        words: data.words || [],
                        paragraphs: data.paragraphs,
                      }
                    : undefined;

                // 🐛 DEBUG: Log enhanced data received on desktop
                void console.log('📨 Desktop Ably Receive Debug:', {
                  transcript: `${data.transcript?.slice(0, 50)}...`,
                  confidence: enhancedData?.confidence,
                  wordsCount: enhancedData?.words?.length || 0,
                  hasEnhancedData: !!enhancedData,
                  sampleWords: enhancedData?.words?.slice(0, 3),
                });

                callbacksRef.current.onTranscriptReceived?.(data.transcript, data.sessionId, enhancedData);
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

            case 'recording_status':
              if (data.sessionId && data.isRecording !== undefined) {
                // 🐛 DEBUG: Log recording status received
                void console.log('📼 Recording Status Received:', {
                  isRecording: data.isRecording,
                  sessionId: data.sessionId,
                  isMobile,
                  timestamp: new Date().toISOString(),
                });

                // Only desktop should receive recording status updates
                // Mobile shouldn't process its own broadcasts
                if (!isMobile) {
                  callbacksRef.current.onRecordingStatusChanged?.(data.isRecording, data.sessionId);
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

  // Send transcript with enhanced data (mobile to desktop)
  const sendTranscript = useCallback((transcript: string, enhancedData?: EnhancedTranscriptionData) => {
    if (!channelRef.current || !currentSessionId || !transcript.trim()) {
      return false;
    }

    try {
      // 🐛 DEBUG: Log what we're sending via Ably
      void console.log('📡 Ably Send Debug:', {
        transcript: `${transcript.slice(0, 50)}...`,
        confidence: enhancedData?.confidence,
        wordsCount: enhancedData?.words?.length || 0,
        hasEnhancedData: enhancedData && (enhancedData.confidence !== undefined || (enhancedData.words?.length || 0) > 0),
      });

      channelRef.current.publish('transcription', {
        type: 'transcription',
        transcript: transcript.trim(),
        sessionId: currentSessionId,
        timestamp: Date.now(),
        // 🆕 Include enhanced data in Ably message
        confidence: enhancedData?.confidence,
        words: enhancedData?.words || [],
        paragraphs: enhancedData?.paragraphs,
      });
      return true;
    } catch (error: any) {
      callbacksRef.current.onError?.(`Failed to send transcript: ${error.message}`);
      return false;
    }
  }, [currentSessionId]);

  // Send recording status (mobile to desktop)
  const sendRecordingStatus = useCallback((isRecording: boolean) => {
    if (!channelRef.current || !currentSessionId) {
      return false;
    }

    try {
      // 🐛 DEBUG: Log recording status being sent
      void console.log('📡 Sending Recording Status:', {
        isRecording,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
      });

      channelRef.current.publish('recording_status', {
        type: 'recording_status',
        isRecording,
        sessionId: currentSessionId,
        timestamp: Date.now(),
      });
      return true;
    } catch (error: any) {
      callbacksRef.current.onError?.(`Failed to send recording status: ${error.message}`);
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
    sendRecordingStatus, // 🆕 Export recording status function
    updateSession,
    fetchCurrentSession, // Expose for manual refresh
  };
};

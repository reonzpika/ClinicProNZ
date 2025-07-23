import * as Ably from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';

type SimpleAblyMessage = {
  type: 'transcription' | 'patient_updated' | 'start_recording' | 'stop_recording' | 'device_connected' | 'device_disconnected';
  transcript?: string;
  sessionId?: string;
  patientName?: string;
  deviceName?: string;
  timestamp?: number;
  data?: any;
};

type SimpleAblyProps = {
  tokenId: string | null;
  onTranscriptReceived?: (transcript: string, sessionId: string) => void;
  onSessionChanged?: (sessionId: string, patientName: string) => void;
  onDeviceConnected?: (deviceName: string) => void;
  onDeviceDisconnected?: (deviceName: string) => void;
  onError?: (error: string) => void;
};

export const useSimpleAbly = ({
  tokenId,
  onTranscriptReceived,
  onSessionChanged,
  onDeviceConnected,
  onDeviceDisconnected,
  onError,
}: SimpleAblyProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);

  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

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

    const connect = async () => {
      try {
        // Get Ably token from backend
        const response = await fetch('/api/ably/simple-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get Ably token: ${response.statusText}`);
        }

        const { ablyToken } = await response.json();

        // Create Ably connection
        const ably = new Ably.Realtime({
          token: ablyToken,
          autoConnect: true,
        });

        // Single channel based on tokenId
        const channel = ably.channels.get(`token:${tokenId}`);

        // Subscribe to all message types on single channel
        channel.subscribe((message) => {
          const { type, ...data } = message.data as SimpleAblyMessage;

          switch (type) {
            case 'transcription':
              if (data.transcript && data.sessionId) {
                onTranscriptReceived?.(data.transcript, data.sessionId);
              }
              break;

            case 'patient_updated':
              if (data.sessionId && data.patientName) {
                setCurrentSessionId(data.sessionId);
                onSessionChanged?.(data.sessionId, data.patientName);
              }
              break;

            case 'device_connected':
              if (data.deviceName) {
                setConnectedDevices(prev => [...prev.filter(d => d !== data.deviceName), data.deviceName!]);
                onDeviceConnected?.(data.deviceName);
              }
              break;

            case 'device_disconnected':
              if (data.deviceName) {
                setConnectedDevices(prev => prev.filter(d => d !== data.deviceName));
                onDeviceDisconnected?.(data.deviceName);
              }
              break;
          }
        });

        // Track connection state
        ably.connection.on('connected', () => {
          setIsConnected(true);

          // Announce device connection
          if (typeof window !== 'undefined') {
            const deviceName = navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop';
            channel.publish('device_connected', {
              type: 'device_connected',
              deviceName,
              timestamp: Date.now(),
            });
          }
        });

        ably.connection.on('disconnected', () => {
          setIsConnected(false);
        });

        ably.connection.on('failed', (error) => {
          setIsConnected(false);
          onError?.(`Connection failed: ${error?.reason || 'Unknown error'}`);
        });

        ablyRef.current = ably;
        channelRef.current = channel;
      } catch (error: any) {
        onError?.(`Failed to connect: ${error.message}`);
      }
    };

    connect();

    return () => {
      if (ablyRef.current) {
        // Announce device disconnection before closing
        if (channelRef.current && typeof window !== 'undefined') {
          const deviceName = navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop';
          channelRef.current.publish('device_disconnected', {
            type: 'device_disconnected',
            deviceName,
            timestamp: Date.now(),
          });
        }

        ablyRef.current.close();
        ablyRef.current = null;
        channelRef.current = null;
      }
      setIsConnected(false);
      setCurrentSessionId(null);
      setConnectedDevices([]);
    };
  }, [tokenId, onTranscriptReceived, onSessionChanged, onDeviceConnected, onDeviceDisconnected, onError]);

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
      onError?.(`Failed to send transcript: ${error.message}`);
      return false;
    }
  }, [currentSessionId, onError]);

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
      onError?.(`Failed to update session: ${error.message}`);
      return false;
    }
  }, [onError]);

  return {
    isConnected,
    currentSessionId,
    connectedDevices,
    sendTranscript,
    updateSession,
  };
};

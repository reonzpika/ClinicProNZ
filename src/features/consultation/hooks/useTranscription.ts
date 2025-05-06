import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { useCallback, useRef, useState } from 'react';

import { AudioRecordingService } from '../services/AudioRecordingService';

type TranscriptionStatus = {
  isConnected: boolean;
  isProcessing: boolean;
  error: string | null;
};

type DeepgramTranscript = {
  type: string;
  channel?: {
    alternatives?: Array<{
      transcript?: string;
    }>;
  };
  is_final?: boolean;
  error?: string;
};

export const useTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<TranscriptionStatus>({
    isConnected: false,
    isProcessing: false,
    error: null,
  });
  const wsRef = useRef<any>(null); // Using any for now as Deepgram types are not complete
  const audioServiceRef = useRef<AudioRecordingService | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  const resetStatus = useCallback(() => {
    setStatus({
      isConnected: false,
      isProcessing: false,
      error: null,
    });
  }, []);

  const handleWebSocketError = useCallback((error: string) => {
    console.error('WebSocket error:', error);
    setStatus(prev => ({
      ...prev,
      error,
      isConnected: false,
    }));
  }, []);

  const getDeepgramToken = useCallback(async () => {
    try {
      const response = await fetch('/api/deepgram/token');
      if (!response.ok) {
        throw new Error('Failed to get Deepgram token');
      }
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error getting Deepgram token:', error);
      throw error;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      resetStatus();
      setTranscript('');
      setIsRecording(true);
      setIsPaused(false);

      // Get Deepgram token
      const token = await getDeepgramToken();
      console.error('Got Deepgram token:', `${token.substring(0, 10)}...`);

      // First verify audio recording setup
      const audioService = new AudioRecordingService();
      audioServiceRef.current = audioService;

      try {
        await audioService.verifySetup();
      } catch (error) {
        console.error('Audio setup failed:', error);
        handleWebSocketError('Failed to initialize audio recording');
        setIsRecording(false);
        return;
      }

      // Initialize Deepgram client with the latest format
      const deepgram = createClient(token);

      // Create WebSocket connection using Deepgram SDK
      const ws = await deepgram.listen.live({
        encoding: 'linear16',
        sample_rate: 16000,
        channels: 1,
        model: 'nova-3',
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        interim_results: true,
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      wsRef.current = ws;

      // Set up connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.getReadyState() !== 1) { // 1 = OPEN
          console.error('WebSocket connection timeout');
          ws.finish();
          handleWebSocketError('Connection timeout');
        }
      }, 5000);

      // Set up event listeners using the SDK's event system
      ws.on(LiveTranscriptionEvents.Open, () => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket connection opened');
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          isProcessing: true,
          error: null,
        }));

        // Start recording and stream audio chunks
        audioService.startRecording((chunk) => {
          if (ws.getReadyState() === 1) { // 1 = OPEN
            ws.send(chunk);
          } else {
            console.error('WebSocket not open when trying to send chunk');
            handleWebSocketError('Connection lost while sending audio');
          }
        });
      });

      ws.on(LiveTranscriptionEvents.Transcript, (data: DeepgramTranscript) => {
        try {
          console.error('Received WebSocket message:', data);

          if (data.type === 'Results') {
            const transcript = data.channel?.alternatives?.[0]?.transcript;
            if (transcript) {
              setTranscript((prev) => {
                const updated = data.is_final
                  ? `${prev} ${transcript}`.trim()
                  : `${prev} ${transcript}`.trim();
                console.error('Updated transcript:', updated);
                return updated;
              });
            }
          } else if (data.type === 'Error') {
            handleWebSocketError(data.error || 'Unknown error occurred');
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e, data);
          handleWebSocketError('Failed to parse server response');
        }
      });

      ws.on(LiveTranscriptionEvents.Error, (error: Error) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket connection error', error);
        handleWebSocketError('Connection error occurred');
      });

      ws.on(LiveTranscriptionEvents.Close, (event: { code: number }) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket closed', event);
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          isProcessing: false,
        }));

        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.error(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          setTimeout(() => {
            if (isRecording) {
              startRecording();
            }
          }, 1000 * reconnectAttemptsRef.current);
        } else {
          setIsRecording(false);
          setIsPaused(false);
        }
      });
    } catch (err) {
      console.error('Failed to start recording', err);
      handleWebSocketError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
    }
  }, [resetStatus, handleWebSocketError, getDeepgramToken]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setIsPaused(false);
    reconnectAttemptsRef.current = 0;

    if (audioServiceRef.current) {
      audioServiceRef.current.stopRecording();
      audioServiceRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.finish();
      } catch (e) {
        console.error('Error closing WebSocket', e);
      }
      wsRef.current = null;
    }

    resetStatus();
  }, [resetStatus]);

  const pauseRecording = useCallback(() => {
    setIsPaused(true);
    // TODO: Implement pause logic if needed
  }, []);

  const resumeRecording = useCallback(() => {
    setIsPaused(false);
    // TODO: Implement pause logic if needed
  }, []);

  return {
    isRecording,
    isPaused,
    transcript,
    status,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
};

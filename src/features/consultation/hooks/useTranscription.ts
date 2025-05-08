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
      confidence?: number;
      words?: Array<{
        word: string;
        start: number;
        end: number;
        confidence: number;
      }>;
    }>;
  };
  is_final?: boolean;
  speech_final?: boolean;
  error?: string;
};

type TranscriptionWord = {
  word: string;
  confidence: number;
  start: number;
  end: number;
};

type TranscriptionSegment = {
  text: string;
  words: TranscriptionWord[];
  isFinal: boolean;
  confidence: number;
};

export const useTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [status, setStatus] = useState<TranscriptionStatus>({
    isConnected: false,
    isProcessing: false,
    error: null,
  });
  const wsRef = useRef<any>(null); // Using any for now as Deepgram types are not complete
  const audioServiceRef = useRef<AudioRecordingService | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      setInterimTranscript('');
      setSegments([]);
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
        interim_results: true,
        endpointing: 500, // 500ms of silence to detect endpoint
        vad_events: true, // Enable voice activity detection
        filler_words: true, // Enable filler words in transcript
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
            const alternative = data.channel?.alternatives?.[0];
            if (alternative?.transcript) {
              const words = alternative.words || [];
              const confidence = alternative.confidence || 0;

              if (data.is_final || data.speech_final) {
                // Handle final transcript
                setSegments(prev => [...prev, {
                  text: alternative.transcript || '',
                  words: words.map(w => ({
                    word: w.word,
                    confidence: w.confidence,
                    start: w.start,
                    end: w.end,
                  })),
                  isFinal: true,
                  confidence,
                }]);
                setTranscript(prev => `${prev} ${alternative.transcript}`.trim());
                setInterimTranscript(''); // Clear interim transcript when final
              } else {
                // Handle interim transcript
                setInterimTranscript(alternative.transcript || '');
              }
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

    // Clear KeepAlive interval
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }

    resetStatus();
  }, [resetStatus]);

  const pauseRecording = useCallback(() => {
    setIsPaused(true);
    audioServiceRef.current?.pauseRecording();
    // Start KeepAlive interval
    if (wsRef.current && !keepAliveIntervalRef.current) {
      keepAliveIntervalRef.current = setInterval(() => {
        if (wsRef.current && wsRef.current.getReadyState() === 1) {
          wsRef.current.send(JSON.stringify({ type: 'KeepAlive' }));
        }
      }, 5000);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    setIsPaused(false);
    audioServiceRef.current?.resumeRecording();
    // Clear KeepAlive interval
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  }, []);

  return {
    isRecording,
    isPaused,
    transcript,
    interimTranscript,
    segments,
    status,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
};

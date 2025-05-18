import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { useCallback, useRef, useState, useEffect } from 'react';

import { useConsultation } from '@/shared/ConsultationContext';

import { AudioRecordingService } from '../services/AudioRecordingService';

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

export const useTranscription = (resetSignal?: any) => {
  const {
    status,
    setStatus,
    transcription,
    setTranscription,
    error,
    setError,
  } = useConsultation();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const wsRef = useRef<any>(null); // Using any for now as Deepgram types are not complete
  const audioServiceRef = useRef<AudioRecordingService | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset local transcription state when resetSignal changes
  useEffect(() => {
    if (resetSignal !== undefined) {
      setSegments([]);
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [resetSignal]);

  const resetTranscription = useCallback(() => {
    setSegments([]);
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  const resetStatus = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, [setStatus, setError]);

  const handleWebSocketError = useCallback((errorMsg: string) => {
    console.error('WebSocket error:', errorMsg);
    setError(errorMsg);
    setStatus('idle');
  }, [setError, setStatus]);

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
      setTranscription('', true);
      setSegments([]);
      setIsRecording(true);
      setIsPaused(false);
      setStatus('recording');

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
        setStatus('recording');

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
                setTranscription(alternative.transcript || '', false);
              } else {
                // Handle interim transcript
                setTranscription(alternative.transcript || '', true);
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
        setStatus('idle');

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
  }, [resetStatus, handleWebSocketError, setTranscription, setStatus, transcription.interimBuffer]);

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
    transcript: transcription.interimBuffer,
    interimTranscript: transcription.interim,
    segments,
    error,
    status,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetTranscription,
  };
};

import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { useCallback, useEffect, useRef, useState } from 'react';

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

  const getDeepgramToken = useCallback(async (): Promise<string> => {
    const res = await fetch('/api/deepgram/token', { method: 'POST' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error('[Deepgram] token fetch failed:', {
        status: res.status,
        message: body.message || res.statusText,
      });
      throw new Error(body.message || 'Failed to fetch Deepgram token');
    }
    const data: { token?: string } = await res.json();
    if (!data.token) {
      console.error('[Deepgram] token missing in response:', data);
      throw new Error('Deepgram token missing');
    }
    return data.token;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      resetStatus();
      setTranscription('', true);
      setSegments([]);
      setIsRecording(true);
      setIsPaused(false);
      setStatus('recording');

      // ── FETCH A NEW JWT ────────────────────────────────────────
      let token: string;
      try {
        token = await getDeepgramToken();
      } catch (err) {
        console.error('[Deepgram] could not acquire token:', err);
        handleWebSocketError('Authentication error');
        return;
      }
      // Get Deepgram JWT token
      console.error('[Deepgram] Full JWT token:', token); // DEBUG: Remove after debugging
      // DEBUG: show only a short preview, never the whole JWT
      const tokenPreview = `${token.slice(0, 6)}…${token.slice(-6)}`;
      console.error('[Deepgram] token preview:', tokenPreview);

      // ── AUDIO SETUP ────────────────────────────────────────────
      console.error('[Deepgram] Starting audio setup...');
      const audioService = new AudioRecordingService();
      audioServiceRef.current = audioService;
      try {
        await audioService.verifySetup();
        console.error('[Deepgram] Audio setup verified.');
      } catch (error) {
        console.error('[Deepgram] Audio setup failed:', error);
        handleWebSocketError('Failed to initialize audio recording');
        setIsRecording(false);
        return;
      }

      // ── INITIALIZE DEEPGRAM CLIENT & SOCKET ────────────────────
      const deepgram = createClient(token);

      const connectionParams = {
        audioEncoding: 'linear16',
        sampleRate: 16000,
        channels: 1,
        model: 'nova-3',
        language: 'en-US',
        smartFormat: true,
        interimResults: true,
        endpointing: 500,
        vadEvents: true,
        fillerWords: true,
      };

      console.error('[Deepgram] Creating WebSocket connection…', {
        tokenPreview,
        connectionParams,
        time: new Date().toISOString(),
      });

      // ── EVENT LISTENERS ────────────────────────────────────────
      const ws = await deepgram.transcription.live(connectionParams);
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.getReadyState() !== 1) {
          console.error('[Deepgram] WebSocket connection timeout');
          ws.finish();
          handleWebSocketError('Connection timeout');
        }
      }, 5000);

      ws.on(LiveTranscriptionEvents.Open, () => {
        clearTimeout(connectionTimeout);
        setStatus('recording');
        // Start recording and stream audio chunks
        let firstChunkSent = false;
        audioService.startRecording((chunk) => {
          if (ws.getReadyState() === 1) { // 1 = OPEN
            if (!firstChunkSent) {
              firstChunkSent = true;
            }
            ws.send(chunk);
          } else {
            console.error('[Deepgram] WebSocket not open when trying to send chunk');
            handleWebSocketError('Connection lost while sending audio');
          }
        });
      });

      ws.on(LiveTranscriptionEvents.Transcript, (data: DeepgramTranscript) => {
        try {
          console.error('[Deepgram] Transcript event received:', data);

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
          console.error('[Deepgram] Error parsing WebSocket message:', e, data);
          handleWebSocketError('Failed to parse server response');
        }
      });

      ws.on(LiveTranscriptionEvents.Error, (error: any) => {
        clearTimeout(connectionTimeout);
        console.error('[Deepgram] WebSocket connection error', {
          error,
          time: new Date().toISOString(),
        });
        handleWebSocketError('Connection error occurred');
      });

      ws.on(LiveTranscriptionEvents.Close, (event: any) => {
        clearTimeout(connectionTimeout);
        console.error('[Deepgram] WebSocket closed', {
          event,
          code: event?.code,
          reason: event?.reason,
          time: new Date().toISOString(),
        });
        setStatus('idle');

        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.error(`[Deepgram] Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
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
      handleWebSocketError(
        err instanceof Error ? err.message : 'Failed to start recording',
      );
      setIsRecording(false);
    }
  }, [
    resetStatus,
    setTranscription,
    setStatus,
    getDeepgramToken,
    handleWebSocketError,
    isRecording,
    setSegments,
  ]);

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

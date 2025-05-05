import { useCallback, useRef, useState } from 'react';

import { audioRecordingService } from '../services/AudioRecordingService';
import type { AudioRecordingError } from '../services/AudioRecordingService';

export function useTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [latestTranscription, setLatestTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const handleAudioData = useCallback(async (audioData: Blob) => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const arrayBuffer = await audioData.arrayBuffer();
        wsRef.current.send(arrayBuffer);
      }
    } catch (err) {
      console.error('Failed to send audio data:', err);
      setError('Failed to process audio data');
    }
  }, []);

  const handleError = useCallback((err: AudioRecordingError) => {
    console.error('Transcription error:', err);
    setError(err.message);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setLatestTranscription('');
      // Open WebSocket connection
      const ws = new WebSocket('ws://localhost:8080');
      wsRef.current = ws;

      ws.onopen = async () => {
        await audioRecordingService.startRecording(handleAudioData, handleError);
        setIsRecording(true);
        setIsPaused(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.transcript) {
            setLatestTranscription((prev) => data.isFinal ? data.transcript : prev + ' ' + data.transcript);
          } else if (data.error) {
            setError(data.error);
          }
        } catch (e) {
          setError('Failed to parse transcription data');
        }
      };

      ws.onerror = (event) => {
        setError('WebSocket error');
      };

      ws.onclose = () => {
        setIsRecording(false);
        setIsPaused(false);
      };
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
    }
  }, [handleAudioData, handleError]);

  const pauseRecording = useCallback(() => {
    if (isRecording && !isPaused) {
      audioRecordingService.pauseRecording();
      setIsPaused(true);
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (isRecording && isPaused) {
      audioRecordingService.resumeRecording();
      setIsPaused(false);
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(async () => {
    try {
      await audioRecordingService.stopRecording();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsRecording(false);
      setIsPaused(false);
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setError('Failed to stop recording');
    }
  }, []);

  return {
    isRecording,
    isPaused,
    latestTranscription,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
} 
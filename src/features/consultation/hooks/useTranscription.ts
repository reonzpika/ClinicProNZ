import { useCallback, useRef, useState } from 'react';

import { useConsultation } from '@/shared/ConsultationContext';

type TranscriptionState = {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string;
  error: string | null;
  audioBlob: Blob | null;
  paragraphs: any[];
  metadata: any;
};

export const useTranscription = () => {
  const {
    setStatus,
    setTranscription,
    setError,
  } = useConsultation();

  const [state, setState] = useState<TranscriptionState>({
    isRecording: false,
    isTranscribing: false,
    transcript: '',
    error: null,
    audioBlob: null,
    paragraphs: [],
    metadata: {},
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Transcribe audio after recording
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setState(prev => ({ ...prev, isTranscribing: true, error: null }));
      setStatus('processing');
      setError(null);

      const formData = new FormData();
      formData.append('audio', audioBlob, 'consultation.webm');

      const response = await fetch('/api/deepgram/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const { transcript, paragraphs, metadata } = await response.json();

      setState(prev => ({
        ...prev,
        transcript,
        paragraphs,
        metadata,
        isTranscribing: false,
      }));
      setStatus('completed');
      setTranscription(transcript, false);
      setError(null);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: `Transcription failed: ${error.message}`,
        isTranscribing: false,
      }));
      setStatus('idle');
      setError(`Transcription failed: ${error.message}`);
    }
  }, [setStatus, setTranscription, setError]);

  // Reset local transcription state
  const resetTranscription = useCallback(() => {
    setState({
      isRecording: false,
      isTranscribing: false,
      transcript: '',
      error: null,
      audioBlob: null,
      paragraphs: [],
      metadata: {},
    });
    setStatus('idle');
    setTranscription('', false);
    setError(null);
    audioChunksRef.current = [];
  }, [setStatus, setTranscription, setError]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm;codecs=opus',
        });

        setState(prev => ({
          ...prev,
          isRecording: false,
          isTranscribing: true,
          audioBlob,
        }));
        setStatus('processing');
        setTranscription('', false);
        setError(null);

        // Auto-transcribe when recording stops
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second

      setState(prev => ({
        ...prev,
        isRecording: true,
        error: null,
        transcript: '',
        paragraphs: [],
        metadata: {},
      }));
      setStatus('recording');
      setTranscription('', true);
      setError(null);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: `Failed to start recording: ${error.message}`,
      }));
      setStatus('idle');
      setError(`Failed to start recording: ${error.message}`);
    }
  }, [setStatus, setTranscription, setError, transcribeAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  }, [state.isRecording]);

  return {
    ...state,
    startRecording,
    stopRecording,
    transcribeAudio,
    resetTranscription,
  };
};

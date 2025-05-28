import { useCallback, useRef, useState } from 'react';

import { useConsultation } from '@/shared/ConsultationContext';

interface TranscriptionState {
  isRecording: boolean;
  isPaused: boolean;
  isTranscribing: boolean;
  transcript: string;
  error: string | null;
  audioBlob: Blob | null;
  paragraphs: any[];
  metadata: any;
  volumeLevel: number;
  noInputWarning: boolean;
}

export const useTranscription = () => {
  const {
    setStatus,
    setTranscription,
    setError,
  } = useConsultation();

  const [state, setState] = useState<TranscriptionState>({
    isRecording: false,
    isPaused: false,
    isTranscribing: false,
    transcript: '',
    error: null,
    audioBlob: null,
    paragraphs: [],
    metadata: {},
    volumeLevel: 0,
    noInputWarning: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);

  // Volume meter loop
  const startVolumeMeter = useCallback((stream: MediaStream) => {
    const ctx = new window.AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.fftSize);

    const checkVolume = () => {
      analyser.getByteTimeDomainData(data);
      const sum = data.reduce((acc, v) => acc + Math.abs(v - 128), 0);
      const level = sum / data.length;
      setState(prev => ({ ...prev, volumeLevel: level }));
      // Silence detection
      if (level < 2) { // tweak threshold as needed
        if (silenceStartRef.current === null) silenceStartRef.current = Date.now();
        if (Date.now() - (silenceStartRef.current ?? 0) > 5000) {
          setState(prev => ({ ...prev, noInputWarning: true }));
        }
      } else {
        silenceStartRef.current = null;
        setState(prev => ({ ...prev, noInputWarning: false }));
      }
      animationFrameRef.current = requestAnimationFrame(checkVolume);
    };
    checkVolume();
  }, []);

  // Clean up audio context and animation frame
  const stopVolumeMeter = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    silenceStartRef.current = null;
    setState(prev => ({ ...prev, volumeLevel: 0, noInputWarning: false }));
  }, []);

  // Transcribe audio after recording
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      // Check audio duration before uploading
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      try {
        await new Promise((resolve, reject) => {
          audio.onloadedmetadata = () => {
            if (isFinite(audio.duration) && audio.duration > 0) {
              resolve(true);
            } else {
              // Poll for duration if not immediately available
              const check = setInterval(() => {
                if (isFinite(audio.duration) && audio.duration > 0) {
                  clearInterval(check);
                  resolve(true);
                }
              }, 50);
              setTimeout(() => {
                clearInterval(check);
                reject(new Error('Could not determine audio duration'));
              }, 2000);
            }
          };
          audio.onerror = () => reject(new Error('Failed to load audio for duration check'));
        });
      } catch (err) {
        URL.revokeObjectURL(audioUrl);
        setState(prev => ({ ...prev, error: 'Could not determine audio duration.', isTranscribing: false }));
        setStatus('idle');
        setError('Could not determine audio duration.');
        return;
      }
      const durationSec = audio.duration;
      URL.revokeObjectURL(audioUrl);
      if (durationSec < 30) {
        setState(prev => ({ ...prev, error: 'Recording too short—please record at least 30 seconds of audio.', isTranscribing: false }));
        setStatus('idle');
        setError('Recording too short—please record at least 30 seconds of audio.');
        return;
      }

      setState((prev) => ({ ...prev, isTranscribing: true, error: null }));
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

      setState((prev) => ({
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
      setState((prev) => ({
        ...prev,
        error: 'Transcription failed: ' + error.message,
        isTranscribing: false,
      }));
      setStatus('idle');
      setError('Transcription failed: ' + error.message);
    }
  }, [setStatus, setTranscription, setError]);

  // Reset local transcription state
  const resetTranscription = useCallback(() => {
    setState({
      isRecording: false,
      isPaused: false,
      isTranscribing: false,
      transcript: '',
      error: null,
      audioBlob: null,
      paragraphs: [],
      metadata: {},
      volumeLevel: 0,
      noInputWarning: false,
    });
    setStatus('idle');
    setTranscription('', false);
    setError(null);
    audioChunksRef.current = [];
    stopVolumeMeter();
  }, [setStatus, setTranscription, setError, stopVolumeMeter]);

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
        stopVolumeMeter();
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm;codecs=opus',
        });

        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          isTranscribing: true,
          audioBlob,
        }));
        setStatus('processing');
        setTranscription('', false);
        setError(null);

        // Auto-transcribe when recording stops
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.onpause = () => setState(prev => ({ ...prev, isPaused: true }));
      mediaRecorder.onresume = () => setState(prev => ({ ...prev, isPaused: false }));

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        error: null,
        transcript: '',
        paragraphs: [],
        metadata: {},
        volumeLevel: 0,
        noInputWarning: false,
      }));
      setStatus('recording');
      setTranscription('', true);
      setError(null);
      startVolumeMeter(stream);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to start recording: ' + error.message,
      }));
      setStatus('idle');
      setError('Failed to start recording: ' + error.message);
    }
  }, [setStatus, setTranscription, setError, transcribeAudio, startVolumeMeter, stopVolumeMeter]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    stopVolumeMeter();
  }, [state.isRecording, stopVolumeMeter]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [state.isRecording, state.isPaused]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    transcribeAudio,
    resetTranscription,
  };
};

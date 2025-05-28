import { useCallback, useRef, useState } from 'react';

import { useConsultation } from '@/shared/ConsultationContext';

interface PartialTranscript {
  start: number;
  end: number;
  text: string;
}

interface Progress {
  completed: number;
  total: number;
}

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
  partialTranscripts: PartialTranscript[];
  progress: Progress;
  recordingStart: number | null;
  recordingEnd: number | null;
}

const CHUNK_DURATION = 60; // seconds
const CHUNK_OVERLAP = 1; // seconds

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
    partialTranscripts: [],
    progress: { completed: 0, total: 0 },
    recordingStart: null,
    recordingEnd: null,
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

  // Helper: Split Blob into 60s chunks with 1s overlap (byte estimation)
  const splitBlobIntoChunks = async (blob: Blob, duration: number): Promise<{ blob: Blob; start: number; end: number; idx: number }[]> => {
    const chunkCount = Math.ceil(duration / (CHUNK_DURATION - CHUNK_OVERLAP));
    const chunks: { blob: Blob; start: number; end: number; idx: number }[] = [];
    for (let i = 0; i < chunkCount; i++) {
      const startSec = i * (CHUNK_DURATION - CHUNK_OVERLAP);
      const endSec = Math.min(startSec + CHUNK_DURATION, duration);
      const startByte = Math.floor((startSec / duration) * blob.size);
      const endByte = Math.floor((endSec / duration) * blob.size);
      const chunk = blob.slice(startByte, endByte, blob.type);
      chunks.push({ blob: chunk, start: startSec, end: endSec, idx: i });
    }
    return chunks;
  };

  // Helper: Merge and de-duplicate chunk transcripts
  const mergeTranscripts = (partials: PartialTranscript[]): string => {
    if (partials.length === 0) return '';
    // Simple join for MVP; TODO: smarter de-duplication
    return partials
      .sort((a, b) => a.start - b.start)
      .map(pt => pt.text.trim())
      .join(' ')
      .replace(/\s+/g, ' ');
  };

  // Chunked, parallel transcription
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      // Use manual timer for duration
      const { recordingStart, recordingEnd } = state;
      let durationSec = 0;
      if (recordingStart && recordingEnd) {
        durationSec = (recordingEnd - recordingStart) / 1000;
      }

      setState((prev) => ({
        ...prev,
        isTranscribing: true,
        error: null,
        partialTranscripts: [],
        progress: { completed: 0, total: 0 },
      }));
      setStatus('processing');
      setError(null);

      // Split into chunks
      const chunks = await splitBlobIntoChunks(audioBlob, durationSec || 1); // fallback to 1s if unknown
      setState(prev => ({ ...prev, progress: { completed: 0, total: chunks.length } }));

      // Fire off all chunk requests in parallel
      const partials: PartialTranscript[] = Array(chunks.length).fill(null);
      await Promise.all(
        chunks.map(async ({ blob, start, end, idx }) => {
          const formData = new FormData();
          formData.append('audio', blob, `chunk${idx}.webm`);
          try {
            const response = await fetch('/api/deepgram/transcribe', {
              method: 'POST',
              body: formData,
            });
            if (!response.ok) throw new Error('Chunk transcription failed');
            const { transcript } = await response.json();
            partials[idx] = { start, end, text: transcript || '' };
          } catch (e) {
            partials[idx] = { start, end, text: '[Chunk failed]' };
          }
          setState(prev => ({
            ...prev,
            partialTranscripts: partials.slice(),
            progress: { completed: prev.progress.completed + 1, total: chunks.length },
          }));
        })
      );

      // Merge and update final transcript
      const merged = mergeTranscripts(partials.filter(Boolean));
      setState(prev => ({
        ...prev,
        transcript: merged,
        isTranscribing: false,
      }));
      setStatus('completed');
      setTranscription(merged, false);
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
  }, [setStatus, setTranscription, setError, state]);

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
      partialTranscripts: [],
      progress: { completed: 0, total: 0 },
      recordingStart: null,
      recordingEnd: null,
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
        const now = Date.now();
        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          isTranscribing: true,
          audioBlob,
          recordingEnd: now,
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

      const now = Date.now();
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
        partialTranscripts: [],
        progress: { completed: 0, total: 0 },
        recordingStart: now,
        recordingEnd: null,
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

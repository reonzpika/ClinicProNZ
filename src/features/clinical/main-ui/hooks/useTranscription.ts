import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeadersForFormData } from '@/src/shared/utils';

type TranscriptionState = {
  isRecording: boolean;
  isPaused: boolean;
  isTranscribing: boolean;
  error: string | null;
  volumeLevel: number;
  noInputWarning: boolean;
  chunksCompleted: number;
  totalChunks: number;
  recordingStart: number | null;
  recordingEnd: number | null;
};

// Smart timing constants
const SILENCE_THRESHOLD = 10; // seconds of silence to trigger sending recording
const SMART_BOUNDARY_THRESHOLD = 250; // seconds - when to start looking for word boundaries (was 25)
const WORD_BOUNDARY_PAUSE = 2; // seconds - micro-pause indicating word boundary (was 1)
const FORCE_STOP_DURATION = 360; // seconds - absolute maximum before force-stopping (was 35)
const SPEECH_CONFIRMATION_FRAMES = 5; // Number of consecutive frames above threshold to confirm speech (was 3)

// Add options for mobile support
export type UseTranscriptionOptions = {
  isMobile?: boolean;
  onChunkComplete?: (audioBlob: Blob) => Promise<void>;
  mobileChunkTimeout?: number;
  startImmediate?: boolean;
};

export const useTranscription = (options: UseTranscriptionOptions = {}) => {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const { isMobile = false, onChunkComplete, startImmediate = false } = options;
  const {
    setStatus,
    setTranscription,
    appendTranscription,
    appendTranscriptionEnhanced,
    transcription,
    microphoneGain,
    volumeThreshold,
    ensureActiveSession,
  } = useConsultationStores();

  const [state, setState] = useState<TranscriptionState>({
    isRecording: false,
    isPaused: false,
    isTranscribing: false,
    error: null,
    volumeLevel: 0,
    noInputWarning: false,
    chunksCompleted: 0,
    totalChunks: 0,
    recordingStart: null,
    recordingEnd: null,
  });

  // Core audio refs
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const vadLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Recording session management
  const currentRecorderRef = useRef<MediaRecorder | null>(null);
  const currentAudioChunksRef = useRef<Blob[]>([]);
  const recordingSessionStartRef = useRef<number>(0);
  const lastSpokeAtRef = useRef<number>(0);
  const speechFrameCountRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const sessionCountRef = useRef<number>(0);
  const isSessionActiveRef = useRef<boolean>(false);

  // Volume measurement for VAD
  const measureVolume = useCallback((): number => {
    if (!analyserRef.current) {
      return 0;
    }

    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(dataArray);

    // Compute RMS normalized between 0-1
    let sum = 0;
    for (const value of dataArray) {
      const sample = (value / 128) - 1;
      sum += sample * sample;
    }
    return Math.sqrt(sum / dataArray.length);
  }, []);

  // Send completed recording to Deepgram
  const sendRecordingSession = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob) {
      return;
    }
    // For mobile, always attempt upload even for small blobs (remote stop edge cases)
    if (!isMobile && audioBlob.size <= 1000) {
      return;
    }

    try {
      try { console.info('[Transcription] sendRecordingSession start', { isMobile, size: audioBlob.size }); } catch {}
      setState(prev => ({ ...prev, isTranscribing: true }));

      sessionCountRef.current += 1;
      const currentSession = sessionCountRef.current;

      if (isMobile && onChunkComplete) {
        try { console.info('[Transcription] mobile onChunkComplete about to run'); } catch {}
        await onChunkComplete(audioBlob);
      } else {
        const formData = new FormData();
        formData.append('audio', audioBlob, `session-${currentSession}.webm`);

        // Authentication required via headers

        const response = await fetch('/api/deepgram/transcribe', {
          method: 'POST',
          headers: createAuthHeadersForFormData(userId, userTier),
          body: formData,
        });

        try { console.info('[Transcription] desktop transcribe response', { status: response.status }); } catch {}
        if (!response.ok) {
          throw new Error(`Transcription failed: ${response.statusText}`);
        }

        const data = await response.json();
        const { transcript } = data;

        // 🆕 Extract enhanced data if available (graceful degradation)
        const enhancedData = {
          confidence: data.confidence,
          words: data.words || [],
          paragraphs: data.paragraphs,
        };

        // Use regular transcript since diarization is disabled
        if (transcript && transcript.trim()) {
          // 🆕 Use enhanced function if we have enhanced data
          const hasEnhancedData = enhancedData.confidence !== undefined || enhancedData.words.length > 0;

          if (hasEnhancedData) {
            await appendTranscriptionEnhanced(
              transcript.trim(),
              state.isRecording,
              'desktop',
              undefined, // deviceId
              undefined, // diarizedTranscript
              undefined, // utterances
              enhancedData.confidence,
              enhancedData.words,
              enhancedData.paragraphs,
            );
          } else {
            // ✅ Fallback to existing function
            await appendTranscription(transcript.trim(), state.isRecording, 'desktop');
          }

          setState(prev => ({
            ...prev,
            noInputWarning: false,
            chunksCompleted: prev.chunksCompleted + 1,
          }));
        }
      }
    } catch (error: any) {
      try { console.error('[Transcription] sendRecordingSession error', error?.message || error); } catch {}
      setState(prev => ({
        ...prev,
        error: `Transcription failed: ${error.message}`,
      }));
    } finally {
      setState(prev => ({ ...prev, isTranscribing: false }));
    }
  }, [appendTranscription, state.isRecording, isMobile, onChunkComplete]);

  // Start a new recording session
  const startRecordingSession = useCallback(() => {
    if (!audioStreamRef.current || isSessionActiveRef.current || isPausedRef.current) {
      return;
    }

    try {
      // Debug supported types
      try {
        const supportsOpus = (typeof (window as any).MediaRecorder !== 'undefined')
          && (MediaRecorder as any).isTypeSupported?.('audio/webm;codecs=opus');
        const supportsWebm = (typeof (window as any).MediaRecorder !== 'undefined')
          && (MediaRecorder as any).isTypeSupported?.('audio/webm');
        console.info('[Transcription] starting MediaRecorder', { supportsOpus, supportsWebm });
      } catch {}
      const mediaRecorder = new MediaRecorder(audioStreamRef.current, {
        mimeType: 'audio/webm;codecs=opus',
      });

      currentAudioChunksRef.current = [];
      recordingSessionStartRef.current = Date.now();
      isSessionActiveRef.current = true;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          currentAudioChunksRef.current.push(event.data);
          try { console.info('[Transcription] ondataavailable', { size: event.data.size, chunks: currentAudioChunksRef.current.length }); } catch {}
        }
      };

      mediaRecorder.onstop = async () => {
        isSessionActiveRef.current = false;
        try {
          const totalSize = currentAudioChunksRef.current.reduce((s, b) => s + b.size, 0);
          console.info('[Transcription] mediaRecorder.onstop', { chunks: currentAudioChunksRef.current.length, totalSize });
        } catch {}

        // Create complete audio blob from all chunks
        const audioBlob = new Blob(currentAudioChunksRef.current, {
          type: 'audio/webm;codecs=opus',
        });

        // Send to Deepgram
        await sendRecordingSession(audioBlob);
      };

      mediaRecorder.onerror = () => {
        isSessionActiveRef.current = false;
        setState(prev => ({
          ...prev,
          error: 'Recording session error occurred',
        }));
        try { console.error('[Transcription] mediaRecorder.onerror'); } catch {}
      };

      currentRecorderRef.current = mediaRecorder;
      mediaRecorder.start(); // Record everything in one session
      try { console.info('[Transcription] MediaRecorder started'); } catch {}
    } catch {
      isSessionActiveRef.current = false;
      try { console.error('[Transcription] MediaRecorder failed to start'); } catch {}
    }
  }, [sendRecordingSession]);

  // Stop current recording session
  const stopRecordingSession = useCallback(() => {
    if (currentRecorderRef.current && isSessionActiveRef.current) {
      currentRecorderRef.current.stop();
      currentRecorderRef.current = null;
    }
  }, []);

  // Smart VAD monitoring loop
  const vadLoop = useCallback(() => {
    if (!audioContextRef.current || isPausedRef.current || !isRecordingRef.current) {
      return;
    }

    const currentTime = Date.now();
    const recordingDuration = recordingSessionStartRef.current
      ? (currentTime - recordingSessionStartRef.current) / 1000
      : 0;

    // Measure current volume
    const volume = measureVolume();
    const adjustedVolume = volume * (microphoneGain || 1);

    // Update volume level for UI
    setState(prev => ({ ...prev, volumeLevel: adjustedVolume }));

    // Speech detection
    const isSpeaking = adjustedVolume > (volumeThreshold || 0.01);

    if (isSpeaking) {
      speechFrameCountRef.current++;
      if (speechFrameCountRef.current >= SPEECH_CONFIRMATION_FRAMES) {
        lastSpokeAtRef.current = currentTime;
        setState(prev => ({ ...prev, noInputWarning: false }));
      }
    } else {
      speechFrameCountRef.current = 0;
    }

    // Calculate silence duration
    const silenceDuration = (currentTime - lastSpokeAtRef.current) / 1000;

    // Smart recording session management
    if (isSessionActiveRef.current) {
      // Force stop if recording too long
      if (recordingDuration > FORCE_STOP_DURATION) {
        stopRecordingSession();
        return;
      }

      // Smart boundary detection
      if (recordingDuration > SMART_BOUNDARY_THRESHOLD) {
        if (silenceDuration > WORD_BOUNDARY_PAUSE) {
          stopRecordingSession();
          return;
        }
      }

      // Standard silence threshold
      if (silenceDuration > SILENCE_THRESHOLD) {
        stopRecordingSession();
        return;
      }
    } else {
      // Start new session if speaking
      if (isSpeaking && speechFrameCountRef.current >= SPEECH_CONFIRMATION_FRAMES) {
        startRecordingSession();
      }
    }

    // No input warning
    if (silenceDuration > 10 && !state.noInputWarning) {
      setState(prev => ({ ...prev, noInputWarning: true }));
    }
  }, [measureVolume, microphoneGain, volumeThreshold, startRecordingSession, stopRecordingSession, state.noInputWarning]);

  // Start VAD loop
  const startVADLoop = useCallback(() => {
    if (vadLoopRef.current) {
      clearInterval(vadLoopRef.current);
    }

    vadLoopRef.current = setInterval(vadLoop, 100); // 100ms intervals
  }, [vadLoop]);

  // Stop VAD loop
  const stopVADLoop = useCallback(() => {
    if (vadLoopRef.current) {
      clearInterval(vadLoopRef.current);
      vadLoopRef.current = null;
    }
  }, []);

  // Initialize audio context and analyzer
  const initializeAudio = useCallback(async () => {
    try {
      if (!audioStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 16000,
          },
        });
        audioStreamRef.current = stream;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }

      if (!sourceNodeRef.current) {
        sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(audioStreamRef.current);
        sourceNodeRef.current.connect(analyserRef.current);
      }

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: `Microphone access failed: ${error.message}`,
      }));
      return false;
    }
  }, []);

  // Cleanup audio resources
  const cleanupAudio = useCallback(() => {
    stopVADLoop();
    stopRecordingSession();

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    analyserRef.current = null;
    isRecordingRef.current = false;
    isPausedRef.current = false;
    isSessionActiveRef.current = false;
  }, [stopVADLoop, stopRecordingSession]);

  // Start recording
  const startRecording = useCallback(async () => {
    try { console.info('[Transcription] startRecording'); } catch {}
    await ensureActiveSession();

    const audioInitialized = await initializeAudio();
    if (!audioInitialized) {
      try { console.error('[Transcription] initializeAudio failed'); } catch {}
      return;
    }

    isRecordingRef.current = true;
    isPausedRef.current = false;
    lastSpokeAtRef.current = Date.now();
    speechFrameCountRef.current = 0;
    sessionCountRef.current = 0;

    setState(prev => ({
      ...prev,
      isRecording: true,
      isPaused: false,
      error: null,
      recordingStart: Date.now(),
      recordingEnd: null,
      chunksCompleted: 0,
      totalChunks: 0,
    }));

    startVADLoop();
    // Optional: start recording session immediately to ensure remote stop always flushes
    if (startImmediate) {
      try {
        startRecordingSession();
        try { console.info('[Transcription] startImmediate: startRecordingSession called'); } catch {}
      } catch { /* ignore */ }
    }
    setStatus('recording');
  }, [ensureActiveSession, initializeAudio, startVADLoop, setStatus]);

  // Stop recording
  const stopRecording = useCallback(() => {
    try { console.info('[Transcription] stopRecording'); } catch {}
    isRecordingRef.current = false;
    isPausedRef.current = false;

    stopVADLoop();
    stopRecordingSession();

    setState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false,
      recordingEnd: Date.now(),
    }));

    setStatus('idle');
  }, [stopVADLoop, stopRecordingSession, setStatus]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    isPausedRef.current = true;
    stopVADLoop();
    stopRecordingSession();

    setState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, [stopVADLoop, stopRecordingSession]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    isPausedRef.current = false;
    lastSpokeAtRef.current = Date.now();
    speechFrameCountRef.current = 0;

    setState(prev => ({
      ...prev,
      isPaused: false,
    }));

    startVADLoop();
  }, [startVADLoop]);

  // Clear current transcription
  const clearTranscription = useCallback(() => {
    setTranscription('', false);
    setState(prev => ({
      ...prev,
      chunksCompleted: 0,
      totalChunks: 0,
      error: null,
    }));
  }, [setTranscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    // State
    isRecording: state.isRecording,
    isPaused: state.isPaused,
    isTranscribing: state.isTranscribing,
    error: state.error,
    volumeLevel: state.volumeLevel,
    noInputWarning: state.noInputWarning,
    chunksCompleted: state.chunksCompleted,
    totalChunks: state.totalChunks,
    recordingStart: state.recordingStart,
    recordingEnd: state.recordingEnd,

    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearTranscription,

    // Current transcript
    transcript: transcription.transcript,
    confidence: 0,
  };
};

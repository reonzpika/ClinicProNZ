import { useCallback, useEffect, useRef, useState } from 'react';

import { useConsultation } from '@/src/shared/ConsultationContext';

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
const SILENCE_THRESHOLD = 3; // seconds of silence to trigger sending recording
const SMART_BOUNDARY_THRESHOLD = 25; // seconds - when to start looking for word boundaries
const WORD_BOUNDARY_PAUSE = 1; // seconds - micro-pause indicating word boundary
const FORCE_STOP_DURATION = 35; // seconds - absolute maximum before force-stopping
const SPEECH_CONFIRMATION_FRAMES = 3; // Number of consecutive frames above threshold to confirm speech

// Add options for mobile support
export type UseTranscriptionOptions = {
  isMobile?: boolean;
  onChunkComplete?: (audioBlob: Blob) => Promise<void>;
  mobileChunkTimeout?: number;
};

export const useTranscription = (options: UseTranscriptionOptions = {}) => {
  const { isMobile = false, onChunkComplete } = options;
  const {
    setStatus,
    setTranscription,
    appendTranscription,

    transcription,
    microphoneGain,
    volumeThreshold,
    ensureActiveSession,
    getEffectiveGuestToken,
  } = useConsultation();

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
    if (!audioBlob || audioBlob.size <= 1000) {
      return;
    }

    try {
      setState(prev => ({ ...prev, isTranscribing: true }));

      sessionCountRef.current += 1;
      const currentSession = sessionCountRef.current;

      if (isMobile && onChunkComplete) {
        await onChunkComplete(audioBlob);
      } else {
        const formData = new FormData();
        formData.append('audio', audioBlob, `session-${currentSession}.webm`);

        const guestToken = getEffectiveGuestToken();
        const headers: Record<string, string> = {};
        if (guestToken) {
          headers['x-guest-token'] = guestToken;
        }

        const response = await fetch('/api/deepgram/transcribe', {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Transcription failed: ${response.statusText}`);
        }

        const { transcript, diarizedTranscript } = await response.json();

        // Prefer diarizedTranscript if available
        const finalTranscript = diarizedTranscript && diarizedTranscript.trim() ? diarizedTranscript : transcript;
        if (finalTranscript && finalTranscript.trim()) {
          await appendTranscription(finalTranscript.trim(), state.isRecording, 'desktop', undefined, diarizedTranscript);
          setState(prev => ({
            ...prev,
            noInputWarning: false,
            chunksCompleted: prev.chunksCompleted + 1,
          }));
        }
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: `Transcription failed: ${error.message}`,
      }));
    } finally {
      setState(prev => ({ ...prev, isTranscribing: false }));
    }
  }, [appendTranscription, state.isRecording, getEffectiveGuestToken, isMobile, onChunkComplete]);

  // Start a new recording session
  const startRecordingSession = useCallback(() => {
    if (!audioStreamRef.current || isSessionActiveRef.current || isPausedRef.current) {
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(audioStreamRef.current, {
        mimeType: 'audio/webm;codecs=opus',
      });

      currentAudioChunksRef.current = [];
      recordingSessionStartRef.current = Date.now();
      isSessionActiveRef.current = true;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          currentAudioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        isSessionActiveRef.current = false;

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
      };

      currentRecorderRef.current = mediaRecorder;
      mediaRecorder.start(); // Record everything in one session
    } catch {
      isSessionActiveRef.current = false;
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
    await ensureActiveSession();

    const audioInitialized = await initializeAudio();
    if (!audioInitialized) {
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
    setStatus('recording');
  }, [ensureActiveSession, initializeAudio, startVADLoop, setStatus]);

  // Stop recording
  const stopRecording = useCallback(() => {
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

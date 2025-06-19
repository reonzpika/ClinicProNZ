import { useCallback, useEffect, useRef, useState } from 'react';

type MobileRecordingState = {
  isRecording: boolean;
  isPaused: boolean;
  isTranscribing: boolean;
  error: string | null;
  recordingDuration: number;
  chunksUploaded: number;
  volumeLevel: number;
  noInputWarning: boolean;
};

type MobileRecordingHookProps = {
  sessionId: string;
  token: string;
  onTranscriptionReceived?: (transcript: string) => void;
  onError?: (error: string) => void;
};

// Smart timing constants - EXACT SAME as desktop useTranscription.ts
const SILENCE_THRESHOLD = 3; // seconds of silence to trigger sending recording
const SMART_BOUNDARY_THRESHOLD = 25; // seconds - when to start looking for word boundaries
const WORD_BOUNDARY_PAUSE = 1; // seconds - micro-pause indicating word boundary
const FORCE_STOP_DURATION = 35; // seconds - absolute maximum before force-stopping
const SPEECH_CONFIRMATION_FRAMES = 3; // Number of consecutive frames above threshold to confirm speech

export const useMobileRecording = ({
  sessionId,
  token,
  onTranscriptionReceived,
  onError,
}: MobileRecordingHookProps) => {
  const [state, setState] = useState<MobileRecordingState>({
    isRecording: false,
    isPaused: false,
    isTranscribing: false,
    error: null,
    recordingDuration: 0,
    chunksUploaded: 0,
    volumeLevel: 0,
    noInputWarning: false,
  });

  // Core audio refs - same as desktop
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const vadLoopRef = useRef<number | null>(null);

  // Recording session management - same as desktop
  const currentRecorderRef = useRef<MediaRecorder | null>(null);
  const currentAudioChunksRef = useRef<Blob[]>([]);
  const recordingSessionStartRef = useRef<number>(0);
  const lastSpokeAtRef = useRef<number>(0);
  const speechFrameCountRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const sessionCountRef = useRef<number>(0);
  const isSessionActiveRef = useRef<boolean>(false);

  // Timer for recording duration
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.isRecording && !state.isPaused) {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, recordingDuration: prev.recordingDuration + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isRecording, state.isPaused]);

  // Volume measurement for VAD - same as desktop
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

  // Send completed recording to Deepgram - same as desktop
  const sendRecordingSession = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob || audioBlob.size <= 1000) {
      return;
    }

    try {
      setState(prev => ({ ...prev, isTranscribing: true }));

      sessionCountRef.current += 1;
      const currentSession = sessionCountRef.current;

      const formData = new FormData();
      formData.append('audio', audioBlob, `mobile-session-${currentSession}.webm`);
      formData.append('sessionId', sessionId);
      formData.append('token', token);

      const response = await fetch('/api/recording/mobile-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const { transcript } = await response.json();

      if (transcript && transcript.trim()) {
        // Notify parent component
        onTranscriptionReceived?.(transcript.trim());

        // Update completion counter
        setState(prev => ({
          ...prev,
          noInputWarning: false,
          chunksUploaded: prev.chunksUploaded + 1,
        }));
      }
    } catch (error: any) {
      const errorMessage = `Transcription failed: ${error.message}`;
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isTranscribing: false }));
    }
  }, [sessionId, token, onTranscriptionReceived, onError]);

  // Start a new recording session - same as desktop
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
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error: any) {
      isSessionActiveRef.current = false;
    }
  }, [sendRecordingSession]);

  // Stop current recording session - same as desktop
  const stopRecordingSession = useCallback(() => {
    if (currentRecorderRef.current && isSessionActiveRef.current) {
      currentRecorderRef.current.stop();
      currentRecorderRef.current = null;
    }
  }, []);

  // Smart VAD monitoring loop - EXACT SAME as desktop
  const vadLoop = useCallback(() => {
    if (!audioContextRef.current || isPausedRef.current || !isRecordingRef.current) {
      vadLoopRef.current = requestAnimationFrame(vadLoop);
      return;
    }

    const volume = measureVolume();
    const currentTime = audioContextRef.current.currentTime;

    // Apply default microphone gain (mobile doesn't need user settings)
    const microphoneGain = 7.0; // Default value
    const volumeThreshold = 0.1; // Default value
    const adjustedVolume = volume * microphoneGain;

    // Scale volume for better UI feedback (2x multiplier, capped at 100%)
    const uiVolume = Math.min(adjustedVolume * 2, 1.0);

    // Update volume level for UI with scaled value
    setState(prev => ({ ...prev, volumeLevel: uiVolume }));

    // Voice activity detection (uses gain-adjusted volume)
    if (adjustedVolume > volumeThreshold) {
      speechFrameCountRef.current += 1;

      // Only confirm speech after consecutive frames above threshold
      if (speechFrameCountRef.current >= SPEECH_CONFIRMATION_FRAMES) {
        lastSpokeAtRef.current = currentTime;

        // Start recording session if not already active
        if (!isSessionActiveRef.current) {
          startRecordingSession();
        }

        // Clear no input warning when speech detected
        setState(prev => ({ ...prev, noInputWarning: false }));
      }
    } else {
      // Reset speech frame counter when volume drops
      speechFrameCountRef.current = 0;
    }

    // Check triggers for stopping current session
    const silenceDuration = currentTime - lastSpokeAtRef.current;
    const sessionDuration = (Date.now() - recordingSessionStartRef.current) / 1000;

    // Trigger 1: Normal silence threshold reached
    if (isSessionActiveRef.current && silenceDuration > SILENCE_THRESHOLD) {
      stopRecordingSession();
    }

    // Trigger 2: Smart boundary detection near time limit
    if (isSessionActiveRef.current && sessionDuration > SMART_BOUNDARY_THRESHOLD) {
      // Look for word boundaries (short pauses) when approaching time limit
      if (silenceDuration > WORD_BOUNDARY_PAUSE) {
        stopRecordingSession();
      }
    }

    // Trigger 3: Force stop at absolute maximum duration
    if (isSessionActiveRef.current && sessionDuration > FORCE_STOP_DURATION) {
      stopRecordingSession();
    }

    // No input warning after 5 seconds of silence
    if (silenceDuration > 5) {
      setState(prev => ({ ...prev, noInputWarning: true }));
    }

    vadLoopRef.current = requestAnimationFrame(vadLoop);
  }, [measureVolume, startRecordingSession, stopRecordingSession]);

  // Initialize audio context for VAD - same as desktop
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioStreamRef.current = stream;

      // Setup Web Audio API for VAD
      const audioContext = new AudioContext();
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      sourceNode.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceNodeRef.current = sourceNode;
      lastSpokeAtRef.current = audioContext.currentTime;

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: `Failed to initialize audio: ${error.message}`,
      }));
      onError?.(`Failed to initialize audio: ${error.message}`);
      return false;
    }
  }, [onError]);

  // Clean up audio resources - same as desktop
  const cleanupAudio = useCallback(() => {
    // Stop VAD loop
    if (vadLoopRef.current) {
      cancelAnimationFrame(vadLoopRef.current);
      vadLoopRef.current = null;
    }

    // Stop any active recording session
    if (currentRecorderRef.current && isSessionActiveRef.current) {
      currentRecorderRef.current.stop();
      currentRecorderRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    // Reset refs
    analyserRef.current = null;
    sourceNodeRef.current = null;
    currentRecorderRef.current = null;
    currentAudioChunksRef.current = [];
    recordingSessionStartRef.current = 0;
    lastSpokeAtRef.current = 0;
    speechFrameCountRef.current = 0;
    sessionCountRef.current = 0;
    isSessionActiveRef.current = false;

    setState(prev => ({
      ...prev,
      volumeLevel: 0,
      noInputWarning: false,
    }));
  }, []);

  // Start recording with smart session management - same as desktop
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isRecording: false, // Will be set to true after successful init
        error: null,
        chunksUploaded: 0,
        recordingDuration: 0,
      }));

      const success = await initializeAudio();
      if (!success) {
        return;
      }

      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
      }));

      // Reset session management
      sessionCountRef.current = 0;
      isSessionActiveRef.current = false;

      // Start VAD monitoring
      vadLoop();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: `Failed to start recording: ${error.message}`,
        isRecording: false,
      }));
      onError?.(`Failed to start recording: ${error.message}`);
      cleanupAudio();
    }
  }, [initializeAudio, vadLoop, cleanupAudio, onError]);

  // Stop recording and finalize any active session - same as desktop
  const stopRecording = useCallback(async () => {
    if (!state.isRecording) {
      return;
    }

    setState(prev => ({ ...prev, isRecording: false }));

    // Stop any active recording session
    if (isSessionActiveRef.current) {
      stopRecordingSession();
    }

    cleanupAudio();
  }, [state.isRecording, stopRecordingSession, cleanupAudio]);

  // Pause recording - same as desktop
  const pauseRecording = useCallback(() => {
    if (state.isRecording && !state.isPaused) {
      setState(prev => ({ ...prev, isPaused: true }));
      isPausedRef.current = true;

      // Stop current session when pausing
      if (isSessionActiveRef.current) {
        stopRecordingSession();
      }
    }
  }, [state.isRecording, state.isPaused, stopRecordingSession]);

  // Resume recording - same as desktop
  const resumeRecording = useCallback(() => {
    if (state.isRecording && state.isPaused) {
      setState(prev => ({ ...prev, isPaused: false }));
      isPausedRef.current = false;
    }
  }, [state.isRecording, state.isPaused]);

  // Reset recording state - same as desktop
  const resetRecording = useCallback(() => {
    cleanupAudio();
    setState({
      isRecording: false,
      isPaused: false,
      isTranscribing: false,
      error: null,
      recordingDuration: 0,
      chunksUploaded: 0,
      volumeLevel: 0,
      noInputWarning: false,
    });
  }, [cleanupAudio]);

  // Keep refs in sync with state - same as desktop
  useEffect(() => {
    isRecordingRef.current = state.isRecording;
  }, [state.isRecording]);

  useEffect(() => {
    isPausedRef.current = state.isPaused;
  }, [state.isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
};

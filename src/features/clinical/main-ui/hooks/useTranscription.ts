import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeadersForFormData } from '@/src/shared/utils';
import { fetchWithRetry } from '@/src/shared/utils';

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

// Optimized timing constants based on VAD best practices
const SILENCE_THRESHOLD = 2.5; // seconds of silence to trigger sending recording (was 1.5)
const SMART_BOUNDARY_THRESHOLD = 60; // seconds - when to start looking for word boundaries (was 30)
const WORD_BOUNDARY_PAUSE = 2; // seconds - micro-pause indicating word boundary (was 1.0)
const FORCE_STOP_DURATION = 90; // seconds - absolute maximum before force-stopping (unchanged)
const SPEECH_CONFIRMATION_FRAMES = 2; // Reduced to cut start latency
const STOP_VOLUME_THRESHOLD = 0.05; // Hysteresis stop threshold (start uses volumeThreshold ~0.10)
const POST_ROLL_MS = 200; // Delay before actually stopping to catch trailing phonemes
const RESTART_GRACE_MS = 1500; // Window allowing quicker restart after a stop

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
  const highPassFilterRef = useRef<BiquadFilterNode | null>(null);
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const vadLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const postRollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const restartGraceUntilRef = useRef<number>(0);

  // Lightweight debug guard: enable by setting localStorage key 'debug:transcription' = '1'
  const debugLog = (...args: any[]) => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('debug:transcription') === '1') {
        // eslint-disable-next-line no-console
        console.debug('[Transcription]', ...args);
      }
    } catch {
      // ignore
    }
  };

  // Request correlation id helper
  const nextReqId = () => Math.random().toString(36).slice(2, 10);

  // Volume measurement for VAD
  const measureVolume = useCallback((): number => {
    if (!analyserRef.current) {
      return 0;
    }

    const analyser = analyserRef.current;
    // Prefer float time domain data when available (better precision, Safari-compatible)
    if (typeof (analyser as any).getFloatTimeDomainData === 'function') {
      const floatArray = new Float32Array(analyser.fftSize);
      (analyser as any).getFloatTimeDomainData(floatArray);
      let sum = 0;
      for (const sample of floatArray) {
        sum += sample * sample;
      }
      return Math.sqrt(sum / floatArray.length);
    }

    const dataArray = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(dataArray);

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
      setState((prev: TranscriptionState) => ({ ...prev, isTranscribing: true }));

      sessionCountRef.current += 1;
      const currentSession = sessionCountRef.current;
      const reqId = nextReqId();

      if (isMobile && onChunkComplete) {
        debugLog('sendRecordingSession[mobile]', { reqId, blobSize: audioBlob.size });
        await onChunkComplete(audioBlob);
      } else {
        const formData = new FormData();
        formData.append('audio', audioBlob, `session-${currentSession}.webm`);

        // Authentication required via headers
        const t0 = Date.now();
        const response = await fetchWithRetry('/api/deepgram/transcribe', {
          method: 'POST',
          headers: { ...createAuthHeadersForFormData(userId, userTier), 'X-Debug-Request-Id': reqId },
          body: formData,
        }, { maxRetries: 2 });
        const tMs = Date.now() - t0;

        if (!response.ok) {
          debugLog('transcribe:nonOk', { reqId, status: response.status, tMs });
          throw new Error(`Transcription failed: ${response.statusText}`);
        }

        const data = await response.json();
        const { transcript } = data;
        debugLog('transcribe:ok', { reqId, tMs, transcriptLen: (transcript || '').length });

        // Use regular transcript since diarization is disabled
        if (transcript && transcript.trim()) {
          await appendTranscription(transcript.trim(), state.isRecording, 'desktop');

          setState((prev: TranscriptionState) => ({
            ...prev,
            noInputWarning: false,
            chunksCompleted: prev.chunksCompleted + 1,
          }));
        }
      }
    } catch (error: any) {
      try {
        console.error('[Transcription] sendRecordingSession error', error?.message || error);
} catch {}
      setState((prev: TranscriptionState) => ({
        ...prev,
        error: `Transcription failed: ${error.message}`,
      }));
    } finally {
      setState((prev: TranscriptionState) => ({ ...prev, isTranscribing: false }));
    }
  }, [appendTranscription, state.isRecording, isMobile, onChunkComplete]);

  // Start a new recording session
  const startRecordingSession = useCallback(() => {
    if (!audioStreamRef.current || isSessionActiveRef.current || isPausedRef.current) {
      return;
    }

    try {
      const inputStream = destinationNodeRef.current?.stream || audioStreamRef.current;

      let preferredMime = 'audio/webm;codecs=opus';
      let fallbackMime = 'audio/webm';
      let useMime: string | null = preferredMime;
      try {
        const checker = (MediaRecorder as any)?.isTypeSupported;
        if (typeof checker === 'function') {
          if (!checker(preferredMime)) {
            useMime = checker(fallbackMime) ? fallbackMime : null;
          }
        }
      } catch {
        // ignore feature detection errors
      }

      const recorderOptions: MediaRecorderOptions = useMime
        ? { mimeType: useMime, audioBitsPerSecond: 96000 }
        : { audioBitsPerSecond: 96000 };

      const mediaRecorder = new MediaRecorder(inputStream, recorderOptions);

      currentAudioChunksRef.current = [];
      recordingSessionStartRef.current = Date.now();
      isSessionActiveRef.current = true;
      debugLog('startRecordingSession', { at: new Date().toISOString() });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          currentAudioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        isSessionActiveRef.current = false;
        const durationSec = recordingSessionStartRef.current
          ? Math.round((Date.now() - recordingSessionStartRef.current) / 1000)
          : 0;

        // Create complete audio blob from all chunks
        const audioBlob = new Blob(currentAudioChunksRef.current, { type: useMime || 'audio/webm' });

        debugLog('mediaRecorder.onstop', { durationSec, blobSize: audioBlob.size, mimeType: audioBlob.type });

        // Send to Deepgram
        await sendRecordingSession(audioBlob);
      };

      mediaRecorder.onerror = () => {
        isSessionActiveRef.current = false;
        setState((prev: TranscriptionState) => ({
          ...prev,
          error: 'Recording session error occurred',
        }));
        try {
 console.error('[Transcription] mediaRecorder.onerror');
} catch {}
      };

      currentRecorderRef.current = mediaRecorder;
      debugLog('MediaRecorder.start', { mimeType: mediaRecorder.mimeType });
      mediaRecorder.start(); // Record everything in one session
    } catch {
      isSessionActiveRef.current = false;
      try {
 console.error('[Transcription] MediaRecorder failed to start');
} catch {}
    }
  }, [sendRecordingSession]);

  // Stop current recording session
  const stopRecordingSession = useCallback(() => {
    if (currentRecorderRef.current && isSessionActiveRef.current) {
      debugLog('stopRecordingSession');
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
    setState((prev: TranscriptionState) => ({ ...prev, volumeLevel: adjustedVolume }));

    // Speech detection with hysteresis
    const startThreshold = volumeThreshold || 0.01;
    const isSpeakingStart = adjustedVolume > startThreshold;
    const isSpeakingKeep = adjustedVolume > (STOP_VOLUME_THRESHOLD || 0.01);

    if (isSpeakingStart) {
      speechFrameCountRef.current++;
      const withinGrace = currentTime < restartGraceUntilRef.current;
      const requiredFrames = withinGrace ? 1 : SPEECH_CONFIRMATION_FRAMES;
      if (speechFrameCountRef.current >= requiredFrames) {
        lastSpokeAtRef.current = currentTime;
        setState((prev: TranscriptionState) => ({ ...prev, noInputWarning: false }));
        // Cancel any pending post-roll stop if speech resumed
        if (postRollTimerRef.current) {
          clearTimeout(postRollTimerRef.current);
          postRollTimerRef.current = null;
        }
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
        debugLog('VAD force stop', { recordingDuration, silenceDuration });
        stopRecordingSession();
        restartGraceUntilRef.current = Date.now() + RESTART_GRACE_MS;
        return;
      }

      // Smart boundary detection
      if (recordingDuration > SMART_BOUNDARY_THRESHOLD) {
        if (silenceDuration > WORD_BOUNDARY_PAUSE) {
          debugLog('VAD boundary stop', { recordingDuration, silenceDuration });
          if (!postRollTimerRef.current) {
            postRollTimerRef.current = setTimeout(() => {
              stopRecordingSession();
              postRollTimerRef.current = null;
              restartGraceUntilRef.current = Date.now() + RESTART_GRACE_MS;
            }, POST_ROLL_MS);
          }
          return;
        }
      }

      // Standard silence threshold
      if (!isSpeakingKeep && silenceDuration > SILENCE_THRESHOLD) {
        debugLog('VAD silence stop', { silenceDuration, recordingDuration });
        if (!postRollTimerRef.current) {
          postRollTimerRef.current = setTimeout(() => {
            stopRecordingSession();
            postRollTimerRef.current = null;
            restartGraceUntilRef.current = Date.now() + RESTART_GRACE_MS;
          }, POST_ROLL_MS);
        }
        return;
      }
    } else {
      // Start new session if speaking
      const withinGrace = currentTime < restartGraceUntilRef.current;
      const requiredFrames = withinGrace ? 1 : SPEECH_CONFIRMATION_FRAMES;
      if (isSpeakingStart && speechFrameCountRef.current >= requiredFrames) {
        debugLog('VAD start session', { volume: adjustedVolume, speechFrames: speechFrameCountRef.current });
        startRecordingSession();
        restartGraceUntilRef.current = 0; // clear grace once started
      }
    }

    // No input warning
    if (silenceDuration > 10 && !state.noInputWarning) {
      setState((prev: TranscriptionState) => ({ ...prev, noInputWarning: true }));
    }
  }, [measureVolume, microphoneGain, volumeThreshold, startRecordingSession, stopRecordingSession, state.noInputWarning]);

  // Start VAD loop
  const startVADLoop = useCallback(() => {
    if (vadLoopRef.current) {
      clearInterval(vadLoopRef.current);
    }

    vadLoopRef.current = setInterval(vadLoop, 40); // faster loop for lower latency
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
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            channelCount: 1,
          },
        });
        audioStreamRef.current = stream;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        analyserRef.current.smoothingTimeConstant = 0.4; // lower smoothing for quicker response
      }

      if (!sourceNodeRef.current) {
        sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(audioStreamRef.current);
      }

      // Build processing chain once
      if (!destinationNodeRef.current && sourceNodeRef.current) {
        highPassFilterRef.current = audioContextRef.current.createBiquadFilter();
        highPassFilterRef.current.type = 'highpass';
        highPassFilterRef.current.frequency.value = 100;

        compressorNodeRef.current = audioContextRef.current.createDynamicsCompressor();
        compressorNodeRef.current.threshold.value = -30;
        compressorNodeRef.current.knee.value = 20;
        compressorNodeRef.current.ratio.value = 3;
        compressorNodeRef.current.attack.value = 0.003;
        compressorNodeRef.current.release.value = 0.25;

        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.value = 2.0;

        destinationNodeRef.current = audioContextRef.current.createMediaStreamDestination();

        try {
          sourceNodeRef.current.connect(highPassFilterRef.current);
          highPassFilterRef.current.connect(compressorNodeRef.current);
          compressorNodeRef.current.connect(gainNodeRef.current);
          gainNodeRef.current.connect(analyserRef.current as unknown as AudioNode);
          gainNodeRef.current.connect(destinationNodeRef.current);
        } catch {
          try { sourceNodeRef.current.connect(analyserRef.current as unknown as AudioNode); } catch {}
        }
      }

      return true;
    } catch (error: any) {
      setState((prev: TranscriptionState) => ({
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

    if (highPassFilterRef.current) {
      try { highPassFilterRef.current.disconnect(); } catch {}
      highPassFilterRef.current = null;
    }

    if (compressorNodeRef.current) {
      try { compressorNodeRef.current.disconnect(); } catch {}
      compressorNodeRef.current = null;
    }

    if (gainNodeRef.current) {
      try { gainNodeRef.current.disconnect(); } catch {}
      gainNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      audioStreamRef.current = null;
    }

    analyserRef.current = null;
    destinationNodeRef.current = null;
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

    setState((prev: TranscriptionState) => ({
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
      } catch { /* ignore */ }
    }
    setStatus('recording');
  }, [ensureActiveSession, initializeAudio, startVADLoop, setStatus]);

  // Stop recording
  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    isPausedRef.current = false;

    stopVADLoop();
    stopRecordingSession();

    setState((prev: TranscriptionState) => ({
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

    setState((prev: TranscriptionState) => ({
      ...prev,
      isPaused: true,
    }));
  }, [stopVADLoop, stopRecordingSession]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    isPausedRef.current = false;
    lastSpokeAtRef.current = Date.now();
    speechFrameCountRef.current = 0;

    setState((prev: TranscriptionState) => ({
      ...prev,
      isPaused: false,
    }));

    startVADLoop();
  }, [startVADLoop]);

  // Clear current transcription
  const clearTranscription = useCallback(() => {
    setTranscription('', false);
    setState((prev: TranscriptionState) => ({
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

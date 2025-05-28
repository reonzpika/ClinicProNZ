import { useCallback, useEffect, useRef, useState } from 'react';

import { useConsultation } from '@/shared/ConsultationContext';

type ChunkTranscript = {
  chunk: number;
  text: string;
  timestamp: number;
  status: 'uploading' | 'transcribing' | 'completed' | 'failed';
};

type TranscriptionState = {
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
  chunkTranscripts: ChunkTranscript[];
  chunksCompleted: number;
  totalChunks: number;
  recordingStart: number | null;
  recordingEnd: number | null;
};

const SILENCE_THRESHOLD = 2; // seconds of silence to trigger chunk end
const VOLUME_THRESHOLD = 0.1; // RMS threshold for speech detection (increased from 0.005)
const MIN_CHUNK_DURATION = 3; // minimum seconds before allowing chunk split
const SPEECH_CONFIRMATION_FRAMES = 3; // Number of consecutive frames above threshold to confirm speech

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
    chunkTranscripts: [],
    chunksCompleted: 0,
    totalChunks: 0,
    recordingStart: null,
    recordingEnd: null,
  });

  // Audio recording and VAD refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const vadLoopRef = useRef<number | null>(null);

  // VAD state refs
  const lastSpokeAtRef = useRef<number>(0);
  const isChunkRecordingRef = useRef<boolean>(false);
  const chunkCountRef = useRef<number>(0);
  const chunkStartTimeRef = useRef<number>(0);
  const audioChunksRef = useRef<Blob[]>([]);
  const lastTranscriptSentRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const speechFrameCountRef = useRef<number>(0);

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

  // Transcribe a single chunk
  const transcribeChunk = useCallback(async (blob: Blob, chunkIdx: number) => {
    try {
      // Update chunk status to uploading
      setState(prev => ({
        ...prev,
        chunkTranscripts: prev.chunkTranscripts.map(ct =>
          ct.chunk === chunkIdx
            ? { ...ct, status: 'uploading' as const }
            : ct,
        ),
      }));

      const formData = new FormData();
      formData.append('audio', blob, `chunk-${chunkIdx}.webm`);

      // Update to transcribing
      setState(prev => ({
        ...prev,
        chunkTranscripts: prev.chunkTranscripts.map(ct =>
          ct.chunk === chunkIdx
            ? { ...ct, status: 'transcribing' as const }
            : ct,
        ),
      }));

      const response = await fetch('/api/deepgram/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const { transcript } = await response.json();

      // Update chunk with completed transcript
      setState((prev) => {
        const updatedChunks = prev.chunkTranscripts.map(ct =>
          ct.chunk === chunkIdx
            ? { ...ct, text: transcript || '[No speech detected]', status: 'completed' as const }
            : ct,
        );

        const completedCount = updatedChunks.filter(ct => ct.status === 'completed').length;

        // Build full transcript from completed chunks in order
        const fullTranscript = updatedChunks
          .filter(ct => ct.status === 'completed')
          .sort((a, b) => a.chunk - b.chunk)
          .map(ct => ct.text.trim())
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        return {
          ...prev,
          chunkTranscripts: updatedChunks,
          chunksCompleted: completedCount,
          transcript: fullTranscript,
        };
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        chunkTranscripts: prev.chunkTranscripts.map(ct =>
          ct.chunk === chunkIdx
            ? { ...ct, text: '[Transcription failed]', status: 'failed' as const }
            : ct,
        ),
      }));
      console.error(`Chunk ${chunkIdx} transcription failed:`, error);
    }
  }, []);

  // Start recording a new chunk
  const startChunk = useCallback(() => {
    if (!audioStreamRef.current || isChunkRecordingRef.current) {
      console.log(`❌ Cannot start chunk: stream=${!!audioStreamRef.current}, recording=${isChunkRecordingRef.current}`);
      return;
    }

    const mediaRecorder = new MediaRecorder(audioStreamRef.current, {
      mimeType: 'audio/webm;codecs=opus',
    });

    audioChunksRef.current = [];
    chunkCountRef.current += 1;
    chunkStartTimeRef.current = Date.now();
    isChunkRecordingRef.current = true;

    const currentChunkIdx = chunkCountRef.current;
    console.log(`🎬 Starting chunk ${currentChunkIdx}`);

    // Add new chunk to state
    setState(prev => ({
      ...prev,
      chunkTranscripts: [
        ...prev.chunkTranscripts,
        {
          chunk: currentChunkIdx,
          text: '',
          timestamp: Date.now(),
          status: 'uploading' as const, // Will be updated when recording starts
        },
      ],
      totalChunks: currentChunkIdx,
    }));

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      isChunkRecordingRef.current = false;
      const audioBlob = new Blob(audioChunksRef.current, {
        type: 'audio/webm;codecs=opus',
      });

      console.log(`🛑 Chunk ${currentChunkIdx} stopped, blob size: ${audioBlob.size} bytes`);

      // Only transcribe if we have meaningful audio data
      if (audioBlob.size > 1000) { // Minimum size check
        await transcribeChunk(audioBlob, currentChunkIdx);
      } else {
        console.log(`⚠️ Chunk ${currentChunkIdx} too small (${audioBlob.size} bytes), skipping transcription`);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100); // Collect data every 100ms for responsiveness
  }, [transcribeChunk]);

  // End current chunk recording
  const endChunk = useCallback(() => {
    if (!isChunkRecordingRef.current || !mediaRecorderRef.current) {
      console.log(`❌ Cannot end chunk: recording=${isChunkRecordingRef.current}, mediaRecorder=${!!mediaRecorderRef.current}`);
      return;
    }

    // Check minimum duration before allowing split
    const chunkDuration = (Date.now() - chunkStartTimeRef.current) / 1000;
    if (chunkDuration < MIN_CHUNK_DURATION) {
      console.log(`⏱️ Chunk ${chunkCountRef.current} too short (${chunkDuration.toFixed(2)}s < ${MIN_CHUNK_DURATION}s), skipping split`);
      return;
    }

    console.log(`🔚 Ending chunk ${chunkCountRef.current}, starting new chunk...`);
    mediaRecorderRef.current.stop();

    // Immediately start next chunk to avoid gaps
    setTimeout(() => {
      console.log(`📊 Refs check: isRecording=${isRecordingRef.current}, isPaused=${isPausedRef.current}`);
      if (isRecordingRef.current && !isPausedRef.current) {
        console.log(`🔄 Starting new chunk after ${chunkCountRef.current}`);
        startChunk();
      } else {
        console.log(`❌ Not starting new chunk: isRecording=${isRecordingRef.current}, isPaused=${isPausedRef.current}`);
      }
    }, 50); // Small delay to ensure clean chunk boundary
  }, [startChunk]);

  // VAD monitoring loop
  const vadLoop = useCallback(() => {
    if (!audioContextRef.current || isPausedRef.current) {
      vadLoopRef.current = requestAnimationFrame(vadLoop);
      return;
    }

    const volume = measureVolume();
    const currentTime = audioContextRef.current.currentTime;

    // Update volume level for UI
    setState(prev => ({ ...prev, volumeLevel: volume }));

    // Voice activity detection with noise filtering
    if (volume > VOLUME_THRESHOLD) {
      speechFrameCountRef.current += 1;
      // Only confirm speech after consecutive frames above threshold
      if (speechFrameCountRef.current >= SPEECH_CONFIRMATION_FRAMES) {
        lastSpokeAtRef.current = currentTime;
        // Clear no input warning when speech detected
        setState(prev => ({ ...prev, noInputWarning: false }));
        console.log(`🎤 Speech confirmed: volume=${volume.toFixed(4)}, frames=${speechFrameCountRef.current}`);
      }
    } else {
      // Reset speech frame counter when volume drops
      speechFrameCountRef.current = 0;
    }

    // Check for silence to trigger chunk end
    const silenceDuration = currentTime - lastSpokeAtRef.current;
    if (isChunkRecordingRef.current && silenceDuration > SILENCE_THRESHOLD) {
      console.log(`🔇 Silence detected for ${silenceDuration.toFixed(2)}s, ending chunk ${chunkCountRef.current}`);
      endChunk();
    }

    // Debug: Log long silences
    if (silenceDuration > 1 && silenceDuration < 1.1) {
      console.log(`⏱️ Silence duration: ${silenceDuration.toFixed(2)}s (threshold: ${SILENCE_THRESHOLD}s)`);
    }

    // No input warning after 5 seconds of silence
    if (silenceDuration > 5) {
      setState(prev => ({ ...prev, noInputWarning: true }));
    }

    vadLoopRef.current = requestAnimationFrame(vadLoop);
  }, [measureVolume, endChunk]);

  // Initialize audio context and VAD
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
      analyser.smoothingTimeConstant = 0.8;
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
      setError(`Failed to initialize audio: ${error.message}`);
      return false;
    }
  }, [setError]);

  // Clean up audio resources
  const cleanupAudio = useCallback(() => {
    // Stop VAD loop
    if (vadLoopRef.current) {
      cancelAnimationFrame(vadLoopRef.current);
      vadLoopRef.current = null;
    }

    // Stop any active recording
    if (mediaRecorderRef.current && isChunkRecordingRef.current) {
      mediaRecorderRef.current.stop();
      isChunkRecordingRef.current = false;
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
    mediaRecorderRef.current = null;
    chunkCountRef.current = 0;
    lastSpokeAtRef.current = 0;
    isChunkRecordingRef.current = false;
    speechFrameCountRef.current = 0;

    setState(prev => ({
      ...prev,
      volumeLevel: 0,
      noInputWarning: false,
    }));
  }, []);

  // Start recording with VAD-driven chunking
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isRecording: false, // Will be set to true after successful init
        error: null,
        transcript: '',
        chunkTranscripts: [],
        chunksCompleted: 0,
        totalChunks: 0,
        recordingStart: Date.now(),
        recordingEnd: null,
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

      setStatus('recording');
      setTranscription('', true);
      setError(null);

      // Start first chunk and VAD monitoring
      startChunk();
      vadLoop();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: `Failed to start recording: ${error.message}`,
        isRecording: false,
      }));
      setStatus('idle');
      setError(`Failed to start recording: ${error.message}`);
      cleanupAudio();
    }
  }, [initializeAudio, setStatus, setTranscription, setError, startChunk, vadLoop, cleanupAudio]);

  // Stop recording and finalize transcription
  const stopRecording = useCallback(() => {
    if (!state.isRecording) {
      return;
    }

    setState(prev => ({
      ...prev,
      isRecording: false,
      recordingEnd: Date.now(),
    }));

    // End current chunk
    if (isChunkRecordingRef.current) {
      endChunk();
    }

    cleanupAudio();
    setStatus('processing');
  }, [state.isRecording, endChunk, cleanupAudio, setStatus]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (state.isRecording && !state.isPaused) {
      setState(prev => ({ ...prev, isPaused: true }));
      // VAD loop will handle paused state
    }
  }, [state.isRecording, state.isPaused]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (state.isRecording && state.isPaused) {
      setState(prev => ({ ...prev, isPaused: false }));
      // If we paused mid-chunk, continue with current chunk
      // VAD loop will resume monitoring
    }
  }, [state.isRecording, state.isPaused]);

  // Reset transcription state
  const resetTranscription = useCallback(() => {
    cleanupAudio();
    lastTranscriptSentRef.current = '';
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
      chunkTranscripts: [],
      chunksCompleted: 0,
      totalChunks: 0,
      recordingStart: null,
      recordingEnd: null,
    });
    setStatus('idle');
    setTranscription('', false);
    setError(null);
  }, [cleanupAudio, setStatus, setTranscription, setError]);

  // Update global transcript when chunks complete
  useEffect(() => {
    // Only update if transcript has actually changed and we have meaningful content
    if (state.transcript
      && state.transcript !== lastTranscriptSentRef.current
      && (state.chunksCompleted > 0 || !state.isRecording)) {
      lastTranscriptSentRef.current = state.transcript;
      setTranscription(state.transcript, state.isRecording);
    }
  }, [state.transcript, state.chunksCompleted, state.isRecording, setTranscription]);

  // Legacy transcribeAudio method for compatibility (not used in VAD mode)
  const transcribeAudio = useCallback(async () => {
    // This method is not used in the new VAD-driven system
    console.warn('transcribeAudio called in VAD mode - this should not happen');
  }, []);

  // Keep refs in sync with state for reliable VAD operations
  useEffect(() => {
    isRecordingRef.current = state.isRecording;
  }, [state.isRecording]);

  useEffect(() => {
    isPausedRef.current = state.isPaused;
  }, [state.isPaused]);

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

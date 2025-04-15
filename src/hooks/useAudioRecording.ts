import type { LiveClient } from '@deepgram/sdk';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { useEffect, useRef, useState } from 'react';

const DEEPGRAM_API_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;

export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const connectionRef = useRef<LiveClient | null>(null);

  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.finish();
      }
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (connectionRef.current) {
      connectionRef.current.finish();
    }
    setIsRecording(false);
    setInterimTranscript('');
  };

  const startRecording = async () => {
    try {
      // 1. Get microphone access and initialize MediaRecorder
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      // 2. Initialize Deepgram
      const deepgram = createClient(DEEPGRAM_API_KEY!);

      // 3. Create live transcription
      const connection = deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
      });

      connectionRef.current = connection;

      // 4. Handle transcription results
      connection.addListener(LiveTranscriptionEvents.Transcript, (data) => {
        const { is_final, channel } = data;
        const transcript = channel.alternatives[0].transcript;

        if (is_final) {
          setFinalTranscript(prev => `${prev} ${transcript}`.trim());
          setInterimTranscript('');
        } else {
          setInterimTranscript(transcript);
        }
      });

      connection.addListener(LiveTranscriptionEvents.Open, () => {
        setIsRecording(true);
        mediaRecorderRef.current?.start(250);
      });

      connection.addListener(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram error:', error);
        setError('Deepgram connection error occurred');
        stopRecording();
      });

      connection.addListener(LiveTranscriptionEvents.Close, () => {
        setIsRecording(false);
        setInterimTranscript('');
      });

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0 && connectionRef.current) {
            connectionRef.current.send(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          if (connection) {
            connection.finish();
          }
        };
      }
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Microphone permission denied'
          : 'Failed to start recording',
      );
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    finalTranscript,
    interimTranscript,
    error,
    startRecording,
    stopRecording,
  };
}

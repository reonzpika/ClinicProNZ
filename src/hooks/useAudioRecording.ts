import type { LiveClient } from '@deepgram/sdk';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { useEffect, useRef, useState } from 'react';

const DEEPGRAM_API_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;

export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const connectionRef = useRef<LiveClient | null>(null);

  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.finish();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      const deepgram = createClient(DEEPGRAM_API_KEY);
      if (!deepgram || !deepgram.listen || !deepgram.listen.live) {
        throw new Error('Deepgram client is not properly initialized');
      }

      const connection = deepgram.listen.live({
        language: 'en-GB',
        model: 'nova-2',
        punctuate: true,
        interim_results: true,
      });

      connection.addListener(LiveTranscriptionEvents.Open, () => {
        setIsRecording(true);
        mediaRecorderRef.current?.start(250);
      });

      connection.addListener(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript && data.is_final) {
          setTranscript(prev => `${prev} ${transcript}`);
        }
      });

      connection.addListener(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram error:', error);
        setError('Deepgram connection error occurred');
      });

      connection.addListener(LiveTranscriptionEvents.Close, () => {
        setIsRecording(false);
      });

      connectionRef.current = connection;

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
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (connectionRef.current) {
      connectionRef.current.finish();
    }
    setIsRecording(false);
  };

  return { isRecording, transcript, error, startRecording, stopRecording };
}

import { useCallback, useEffect, useRef } from 'react';

import { useConsultation } from '@/shared/ConsultationContext';

type MobileSyncHookProps = {
  enabled: boolean; // Only sync when mobile recording is active
  sessionId: string;
};

export const useMobileSync = ({ enabled, sessionId }: MobileSyncHookProps) => {
  const { appendMobileTranscription } = useConsultation();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckpointRef = useRef<string | null>(null);

  const pollForMobileTranscriptions = useCallback(async () => {
    if (!enabled || !sessionId) {
      return;
    }

    try {
      const params = new URLSearchParams({
        sessionId,
        ...(lastCheckpointRef.current && { lastCheckpoint: lastCheckpointRef.current }),
      });

      console.log('Desktop polling for mobile transcriptions...', { sessionId, lastCheckpoint: lastCheckpointRef.current });
      const response = await fetch(`/api/recording/sync-session?${params}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Desktop sync response:', data);

        // Process new transcriptions
        if (data.hasNewData && data.transcriptions) {
          console.log('Processing new mobile transcriptions:', data.transcriptions.length);
          for (const transcription of data.transcriptions) {
            if (transcription.source === 'mobile') {
              console.log('Appending mobile transcription:', transcription.transcript.substring(0, 50) + '...');
              // Append mobile transcription to desktop context
              appendMobileTranscription(transcription.transcript, sessionId);
            }
          }
        } else {
          console.log('No new data from mobile');
        }

        // Update checkpoint
        lastCheckpointRef.current = data.lastUpdate;
      } else {
        console.error('Desktop sync failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to poll for mobile transcriptions:', error);
    }
  }, [enabled, sessionId, appendMobileTranscription]);

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (enabled) {
      // Poll every 15 seconds when mobile recording is active
      pollIntervalRef.current = setInterval(pollForMobileTranscriptions, 15000);

      // Initial poll
      pollForMobileTranscriptions();
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      // Reset checkpoint when disabled
      lastCheckpointRef.current = null;
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [enabled, pollForMobileTranscriptions]);

  return {
    isPolling: enabled && !!pollIntervalRef.current,
  };
};

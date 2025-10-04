import { useAuth } from '@clerk/nextjs';
import { useCallback, useState } from 'react';

import { createAuthHeaders } from '@/src/shared/utils';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { useTranscription } from '@/src/features/clinical/main-ui/hooks/useTranscription';

export function useFlushBarrier() {
  const { userId } = useAuth();
  const { ensureActiveSession } = useConsultationStores();
  // Reuse the recording hook for counters and stop action
  const { isTranscribing, postInFlight, stopRecording } = useTranscription();
  const [isFlushing, setIsFlushing] = useState(false);

  const stopAndFlush = useCallback(async (sessionId?: string | null, timeoutMs = 10000): Promise<void> => {
    const sid = sessionId || await ensureActiveSession();
    if (!sid) return;
    setIsFlushing(true);
    try {
      // Stop desktop recording
      try { stopRecording(); } catch {}
      // Best-effort: stop mobile via global bridge if present
      try {
        if (typeof window !== 'undefined' && (window as any).ablySyncHook?.sendRecordingControl) {
          (window as any).ablySyncHook.sendRecordingControl('stop');
        }
      } catch {}

      // Wait for local counters to drain
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        if (!isTranscribing && ((postInFlight || 0) === 0)) break;
        await new Promise(r => setTimeout(r, 200));
      }

      // Stability poll against DB lastId
      let lastId = -1;
      let stable = 0;
      while (Date.now() - start < timeoutMs) {
        try {
          const res = await fetch(`/api/transcriptions?sessionId=${encodeURIComponent(sid)}`, { method: 'GET', headers: createAuthHeaders(userId) });
          if (res.ok) {
            const data = await res.json();
            const chunks = Array.isArray(data?.chunks) ? data.chunks : [];
            const currId = chunks.length > 0 ? Number(chunks[chunks.length - 1]?.id) : 0;
            if (currId === lastId) {
              stable += 1;
              if (stable >= 2) break;
            } else {
              stable = 0;
            }
            lastId = currId;
          }
        } catch {}
        await new Promise(r => setTimeout(r, 300));
      }
    } finally {
      setIsFlushing(false);
    }
  }, [ensureActiveSession, stopRecording, isTranscribing, postInFlight, userId]);

  return { stopAndFlush, isFlushing };
}


'use client';

import { useCallback, useEffect, useRef } from 'react';

import type { AnalysisResult } from '@/types';

export type AnalysisMode = 'manual' | 'auto';

type AnalysisCallbacks = {
  onStart?: () => void;
  onComplete?: (findings: AnalysisResult) => void;
  onError?: (error: string) => void;
};

export function useTranscriptAnalysis(
  transcript: string,
  callbacks?: AnalysisCallbacks,
) {
  // Use refs to track mounted state and store the interval ID
  const isMounted = useRef(true);
  const intervalId = useRef<NodeJS.Timeout>();
  const abortController = useRef<AbortController>();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  // Analysis function with abort controller
  const analyzeNow = useCallback(async () => {
    if (!transcript.trim()) {
      callbacks?.onError?.('No transcript to analyze');
      return;
    }

    // Cleanup previous analysis if exists
    cleanup();

    // Create new abort controller for this request
    abortController.current = new AbortController();

    callbacks?.onStart?.();

    try {
      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Process the data into findings
      const findings: AnalysisResult = {
        patientAgenda: Array.isArray(data.patientAgenda) ? data.patientAgenda : [],
        redFlags: Array.isArray(data.redFlags) ? data.redFlags : [],
        significantPoints: Array.isArray(data.significantPoints) ? data.significantPoints : [],
      };

      // Always call onComplete with findings, regardless of mount state
      callbacks?.onComplete?.(findings);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      callbacks?.onError?.(err instanceof Error ? err.message : 'Analysis failed');
    }
  }, [transcript, cleanup, callbacks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [cleanup]);

  return { analyzeNow };
}

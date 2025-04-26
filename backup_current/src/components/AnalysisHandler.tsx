'use client';

import { useEffect } from 'react';

import { useTranscriptAnalysis } from '@/hooks/useTranscriptAnalysis';
import type { AnalysisResult } from '@/types';

type AnalysisHandlerProps = {
  transcript: string;
  onAnalysisStart: () => void;
  onAnalysisComplete: (findings: AnalysisResult) => void;
  onError: (error: string) => void;
};

export function AnalysisHandler({
  transcript,
  onAnalysisStart,
  onAnalysisComplete,
  onError,
}: AnalysisHandlerProps) {
  const { analyzeNow } = useTranscriptAnalysis(transcript, {
    onStart: onAnalysisStart,
    onComplete: onAnalysisComplete,
    onError,
  });

  // Expose analyzeNow to parent via a custom event
  useEffect(() => {
    const eventName = 'startAnalysis';
    const startAnalysis = () => {
      analyzeNow();
    };

    window.addEventListener(eventName, startAnalysis);
    return () => {
      window.removeEventListener(eventName, startAnalysis);
    };
  }, [analyzeNow]);

  return null;
}

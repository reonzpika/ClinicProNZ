'use client';

import { useState } from 'react';

import type { ClinicalFinding } from '@/types';

type AnalysisMode = 'auto' | 'manual' | 'continuous';

export function useTranscriptAnalysis(
  transcript: string,
  _mode: AnalysisMode = 'manual',
  _interval: number = 5000,
) {
  const [findings, setFindings] = useState<ClinicalFinding[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual analysis trigger
  const analyzeNow = async () => {
    if (!transcript.trim() || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      setFindings(data.findings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { findings, isAnalyzing, error, analyzeNow };
}

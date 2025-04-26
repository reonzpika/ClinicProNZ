'use client';

import { useEffect, useState } from 'react';

import type {
  AnalysisLevel,
  ConciseLevel,
  GeneratedNote,
  PromptConfig,
} from '@/types/note-generation';
import { assemblePrompt, loadPromptConfig, loadTemplatePrompt } from '@/utils/prompt-loader';

export function useNoteGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);

  // Load prompts on mount
  useEffect(() => {
    loadPromptConfig()
      .then(setPromptConfig)
      .catch(err => setError('Failed to load prompts'));
  }, []);

  const generateNotes = async (
    transcript: string,
    templateId: string,
    analysisLevel: AnalysisLevel,
    conciseLevel: ConciseLevel,
  ) => {
    if (!transcript.trim() || !promptConfig) {
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Load template-specific prompt
      const templatePrompt = await loadTemplatePrompt(templateId);
      const fullPromptConfig = {
        ...promptConfig,
        templatePrompt,
      };

      // Assemble final prompt
      const prompt = assemblePrompt(
        fullPromptConfig,
        templateId,
        analysisLevel,
      );

      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          prompt,
          analysisLevel,
          conciseLevel,
          templateId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate notes');
      }

      const data = await response.json();
      return data as GeneratedNote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate notes';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateNotes = async (
    previousNote: GeneratedNote,
    modifications: {
      analysisLevel?: AnalysisLevel;
      conciseLevel?: ConciseLevel;
    },
  ) => {
    if (!promptConfig) {
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/regenerate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousNote,
          modifications,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate notes');
      }

      const data = await response.json();
      return data as GeneratedNote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate notes';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateNotes,
    regenerateNotes,
    isGenerating,
    error,
    isReady: !!promptConfig,
  };
}

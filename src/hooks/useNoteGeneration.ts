'use client';

import { useState } from 'react';

import { NOTE_TEMPLATES } from '@/config/noteTemplates';
import type { ConciseLevel } from '@/types';

type GeneratedNote = {
  sections: Array<{
    key: string;
    content: string;
  }>;
};

const CONCISE_PROMPTS = {
  'detailed': `
    Generate a detailed medical note that includes:
    - Full narrative descriptions
    - Complete context and background
    - All relevant details from the consultation
    - Thorough documentation of findings
    Format: Use complete sentences and paragraphs
  `,

  'concise': `
    Generate a concise medical note that includes:
    - Key information only
    - Brief, clear descriptions
    - Essential context only
    - Most relevant findings
    Format: Use short paragraphs, avoid redundancy
  `,

  'bullet-points': `
    Generate a bullet-point medical note that includes:
    - Only critical information
    - One point per finding
    - Essential details only
    - No narrative text
    Format: Use bullet points (•) for each item, group by section
    Example:
    • PC: Headache x 3 days
    • Severity: 7/10, frontal
    • Triggers: screen time, bright light
  `,
};

export function useNoteGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateNotes = async (transcript: string, templateId: string, conciseLevel: ConciseLevel) => {
    if (!transcript.trim()) {
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Validate template exists before making API call
      const template = NOTE_TEMPLATES.find(t => t.id === templateId);
      if (!template) {
        throw new Error('INVALID_TEMPLATE');
      }

      const concisePrompt = CONCISE_PROMPTS[conciseLevel];

      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          templateId,
          conciseLevel,
          concisePrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate notes');
      }

      const data = await response.json();
      return data as GeneratedNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate notes');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateNotes,
    isGenerating,
    error,
  };
}

'use client';

import { useCallback, useState } from 'react';

import type { ConciseLevel } from '@/types';
import type { AnalysisLevelId } from '@/types/analysis-levels';

export type NoteGenerationSettings = {
  templateId: string;
  analysisLevel: AnalysisLevelId;
  conciseLevel: ConciseLevel;
};

const DEFAULT_SETTINGS: NoteGenerationSettings = {
  templateId: 'multi-problem-soap',
  analysisLevel: 'facts',
  conciseLevel: 'bullet-points',
};

export function useNoteGenerationSettings(initialSettings?: Partial<NoteGenerationSettings>) {
  const [settings, setSettings] = useState<NoteGenerationSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });
  const [isChanging, setIsChanging] = useState(false);

  const updateSetting = useCallback(async <K extends keyof NoteGenerationSettings>(
    key: K,
    value: NoteGenerationSettings[K],
  ) => {
    setIsChanging(true);
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
    } finally {
      setIsChanging(false);
    }
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    isChanging,
    updateSetting,
    resetSettings,
    DEFAULT_SETTINGS,
  };
}

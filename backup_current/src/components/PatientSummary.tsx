import { useCallback, useEffect, useRef, useState } from 'react';

import { AudioRecorder } from '@/components/AudioRecorder';
import { type NoteGenerationConfig, NoteGenerationControls } from '@/components/note-generator/NoteGenerationControls';
import { NoteSection } from '@/components/NoteSection';
import { useToast } from '@/components/ui/use-toast';
import { useNoteGeneration } from '@/hooks/note-generation/useNoteGeneration';
import { useNoteCorrection } from '@/hooks/useNoteCorrection';
import { useNoteGenerationSettings } from '@/hooks/useNoteGenerationSettings';
import type { AnalysisLevel } from '@/types/note-generation';
import type { Template } from '@/types/templates';

type PatientSummaryProps = {
  patientSummary: string;
  setPatientSummary: (summary: string) => void;
  selectedTemplate: string;
  handleTemplateChange: (template: string) => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  templates: Template[];
  resetAll: () => void;
  error: string | null;
  recordingError: string | null;
  isLoading: boolean;
};

export function PatientSummary({
  patientSummary,
  setPatientSummary,
  selectedTemplate,
  handleTemplateChange,
  error,
  recordingError,
  resetAll,
  isLoading,
}: PatientSummaryProps) {
  const { _correctNote, isCorrecting, error: correctionError } = useNoteCorrection();
  const { generateNotes, isReady } = useNoteGeneration();
  const { settings, isChanging, updateSetting, resetSettings } = useNoteGenerationSettings({
    templateId: selectedTemplate,
  });
  const { toast } = useToast();
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisLevel, setAnalysisLevel] = useState<AnalysisLevel>('comprehensive');
  const lastGeneratedTranscriptRef = useRef('');

  const handleNoteGenerated = (formattedNote: string) => {
    setPatientSummary(formattedNote);
  };

  const handleGenerateNote = async (config: NoteGenerationConfig) => {
    const currentTranscript = liveTranscript.trim();

    // Don't regenerate if transcript hasn't changed and we're not forcing regeneration
    if (currentTranscript === lastGeneratedTranscriptRef.current && !config.forceRegenerate) {
      toast({
        description: 'No new content to generate note from.',
      });
      return;
    }

    if (!isReady) {
      toast({
        title: 'Error',
        description: 'Note generation system is not ready',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const note = await generateNotes(
        currentTranscript,
        config.templateId,
        analysisLevel,
        config.conciseLevel,
      );
      if (!note) {
        throw new Error('Failed to generate note');
      }

      // Format note before updating state
      const formattedNote = note.sections
        .map(section => `${section.key.toUpperCase()}:\n${section.content}\n`)
        .join('\n');

      handleNoteGenerated(formattedNote);
      lastGeneratedTranscriptRef.current = currentTranscript;

      toast({
        description: 'Your consultation note has been generated successfully.',
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: 'Error',
          description: error.message || 'Failed to generate note',
          variant: 'destructive',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCorrectNote = async () => {
    if (!patientSummary.trim()) {
      toast({
        title: 'Error',
        description: 'No note content to correct',
        variant: 'destructive',
      });
      return;
    }

    try {
      const correctedNote = await _correctNote(patientSummary);
      if (correctedNote) {
        setPatientSummary(correctedNote);
        toast({
          description: 'Note has been corrected successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to correct note',
        variant: 'destructive',
      });
    }
  };

  // Handle template changes from parent
  useEffect(() => {
    updateSetting('templateId', selectedTemplate);
  }, [selectedTemplate, updateSetting]);

  // Sync template changes back to parent
  const handleSettingChange = useCallback(async <K extends keyof NoteGenerationSettings>(
    key: K,
    value: NoteGenerationSettings[K],
  ) => {
    await updateSetting(key, value);
    if (key === 'templateId') {
      handleTemplateChange(value as string);
    }
  }, [updateSetting, handleTemplateChange]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-none">
        <AudioRecorder
          disabled={isGenerating}
          settings={settings}
          onTranscriptChange={setLiveTranscript}
          onGenerateNote={handleGenerateNote}
          onNoteGenerated={handleNoteGenerated}
        />
      </div>

      <div className="flex-none">
        <NoteGenerationControls
          settings={settings}
          onSettingChange={handleSettingChange}
          onGenerate={handleGenerateNote}
          isGenerating={isGenerating}
          isChangingSettings={isChanging}
          disabled={!liveTranscript.trim()}
        />
      </div>

      <div className="min-h-0 flex-1">
        <NoteSection
          content={patientSummary}
          selectedTemplate={settings.templateId}
          onChange={setPatientSummary}
          onCorrect={handleCorrectNote}
          onReset={() => {
            resetAll();
            resetSettings();
          }}
          isCorrecting={isCorrecting}
        />
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

import { AudioRecorder } from '@/components/AudioRecorder';
import { type NoteGenerationConfig, NoteGenerationControls } from '@/components/note-generator/NoteGenerationControls';
import { NoteSection } from '@/components/NoteSection';
import { useToast } from '@/components/ui/use-toast';
import { NOTE_TEMPLATES } from '@/config/noteTemplates';
import { useNoteGeneration } from '@/hooks/note-generation/useNoteGeneration';
import type { AnalysisLevel } from '@/types/note-generation';

type NoteGenerationError =
  | 'EMPTY_TRANSCRIPT'
  | 'INVALID_TEMPLATE'
  | 'API_ERROR'
  | 'GENERATION_FAILED';

const getNoteGenerationErrorMessage = (type: NoteGenerationError): string => {
  switch (type) {
    case 'EMPTY_TRANSCRIPT':
      return 'No transcript available to generate note';
    case 'INVALID_TEMPLATE':
      return 'Selected template is invalid';
    case 'API_ERROR':
      return 'Failed to connect to note generation service';
    case 'GENERATION_FAILED':
      return 'Failed to generate note. Please try again';
    default:
      return 'An unexpected error occurred';
  }
};

export function ConsultationNote() {
  const [selectedTemplate, setSelectedTemplate] = useState(NOTE_TEMPLATES[0].id);
  const [transcript, setTranscript] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [analysisLevel, setAnalysisLevel] = useState<AnalysisLevel>('comprehensive');

  const { generateNotes, isReady } = useNoteGeneration();
  const { toast } = useToast();

  const handleGenerateNote = async (config: NoteGenerationConfig) => {
    if (!transcript.trim()) {
      toast({
        title: 'Error',
        description: getNoteGenerationErrorMessage('EMPTY_TRANSCRIPT'),
        variant: 'destructive',
      });
      return;
    }

    if (!NOTE_TEMPLATES.find(t => t.id === config.templateId)) {
      toast({
        title: 'Error',
        description: getNoteGenerationErrorMessage('INVALID_TEMPLATE'),
        variant: 'destructive',
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
        transcript,
        config.templateId,
        analysisLevel,
        config.conciseLevel,
      );
      if (!note) {
        throw new Error('GENERATION_FAILED');
      }

      // Format note before updating state
      const formattedNote = note.sections
        .map(section => `${section.key.toUpperCase()}:\n${section.content}\n`)
        .join('\n');

      setNoteContent(formattedNote);
      toast({
        description: 'Your consultation note has been generated successfully.',
      });
    } catch (error) {
      const errorType = error instanceof Error
        ? (error.message as NoteGenerationError)
        : 'API_ERROR';

      toast({
        title: 'Error',
        description: getNoteGenerationErrorMessage(errorType),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCorrectNote = async () => {
    setIsCorrecting(true);
    // Implement note correction logic here
    setIsCorrecting(false);
  };

  const handleResetNote = () => {
    setNoteContent('');
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <AudioRecorder
          disabled={isGenerating}
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
          onTranscriptChange={setTranscript}
          onGenerateNote={handleGenerateNote}
        />

        <NoteGenerationControls
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
          onGenerate={handleGenerateNote}
          isGenerating={isGenerating}
          disabled={!transcript.trim()}
        />
      </div>

      <NoteSection
        content={noteContent}
        selectedTemplate={selectedTemplate}
        onChange={setNoteContent}
        onCorrect={handleCorrectNote}
        onReset={handleResetNote}
        isCorrecting={isCorrecting}
      />
    </div>
  );
}

'use client';

import { Check, ChevronDown, ChevronUp, Loader2, Mic, MicOff, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { ClinicalFinding } from '@/components/ClinicalFinding';
import { ExpandableCard } from '@/components/ExpandableCard';
import { LiveTranscript } from '@/components/LiveTranscript';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { CONCISE_OPTIONS } from '@/config/conciseOptions';
import { NOTE_TEMPLATES } from '@/config/noteTemplates';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useNoteGeneration } from '@/hooks/useNoteGeneration';
import { useTranscriptAnalysis } from '@/hooks/useTranscriptAnalysis';
import type { ConciseLevel } from '@/types';

// Add specific error types
type NoteGenerationError =
  | 'EMPTY_TRANSCRIPT'
  | 'INVALID_TEMPLATE'
  | 'API_ERROR'
  | 'GENERATION_FAILED';

// Add error handling utility
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

type AudioRecorderProps = {
  disabled?: boolean;
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  onNoteGenerated: (formattedNote: string) => void;
};

export function AudioRecorder({
  disabled,
  selectedTemplate,
  onTemplateChange,
  onNoteGenerated,
}: AudioRecorderProps) {
  const {
    isRecording,
    finalTranscript,
    interimTranscript,
    error: recordingError,
    startRecording,
    stopRecording,
  } = useAudioRecording();

  const {
    findings,
    isAnalyzing,
    error: analysisError,
    analyzeNow,
  } = useTranscriptAnalysis(finalTranscript, 'manual');

  const { generateNotes, isGenerating: _isGenerating } = useNoteGeneration();

  const [isExpanded, setIsExpanded] = useState(true);
  const [_expandedCard, setExpandedCard] = useState<'transcript' | 'findings' | null>(null);

  const { toast } = useToast();
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

  // Add a ref to track if we've already generated a note for this recording
  const hasGeneratedNote = useRef(false);

  const [conciseLevel, setConciseLevel] = useState<ConciseLevel>('concise');

  const handleCardExpand = (cardType: 'transcript' | 'findings', expanded: boolean) => {
    if (expanded) {
      setExpandedCard(cardType);
    } else {
      setExpandedCard(null);
    }
  };

  // Add function to handle template changes
  const handleTemplateChange = (templateId: string) => {
    onTemplateChange(templateId);
    // If we have a transcript, regenerate note with new template
    if (finalTranscript) {
      hasGeneratedNote.current = false; // Reset flag to trigger regeneration
    }
  };

  useEffect(() => {
    if (!isRecording && finalTranscript && !hasGeneratedNote.current) {
      const generateNote = async () => {
        if (!finalTranscript.trim()) {
          toast({
            title: 'Error',
            description: getNoteGenerationErrorMessage('EMPTY_TRANSCRIPT'),
            variant: 'destructive',
          });
          return;
        }

        if (!NOTE_TEMPLATES.find(t => t.id === selectedTemplate)) {
          toast({
            title: 'Error',
            description: getNoteGenerationErrorMessage('INVALID_TEMPLATE'),
            variant: 'destructive',
          });
          return;
        }

        setIsGeneratingNote(true);
        hasGeneratedNote.current = true;

        try {
          const note = await generateNotes(finalTranscript, selectedTemplate, conciseLevel);
          if (!note) {
            throw new Error('GENERATION_FAILED');
          }

          // Format note before sending to parent
          const formattedNote = note.sections
            .map(section => `${section.key.toUpperCase()}:\n${section.content}\n`)
            .join('\n');

          onNoteGenerated(formattedNote);
          toast({
            title: 'Success',
            description: 'Your consultation note has been generated successfully.',
            duration: 3000,
          });
        } catch (error) {
          hasGeneratedNote.current = false;
          const errorType = error instanceof Error
            ? (error.message as NoteGenerationError)
            : 'API_ERROR';

          toast({
            title: 'Error',
            description: getNoteGenerationErrorMessage(errorType),
            variant: 'destructive',
          });
        } finally {
          setIsGeneratingNote(false);
        }
      };
      generateNote();
    }

    if (isRecording) {
      hasGeneratedNote.current = false;
    }
  }, [isRecording, finalTranscript, selectedTemplate, generateNotes, onNoteGenerated, toast, conciseLevel]);

  return (
    <div className="space-y-2">
      {/* Add loading indicator */}
      {isGeneratingNote && (
        <div className="flex items-center justify-center rounded-md bg-muted/50 p-2 text-sm">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Generating consultation note...
        </div>
      )}

      {/* Controls - Always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? 'destructive' : 'default'}
            className="gap-2"
            disabled={disabled || !selectedTemplate}
          >
            {isRecording
              ? (
                  <>
                    <MicOff className="size-4" />
                    Stop Recording
                  </>
                )
              : (
                  <>
                    <Mic className="size-4" />
                    Start Recording
                  </>
                )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1"
          >
            {isExpanded
              ? (
                  <ChevronUp className="size-4" />
                )
              : (
                  <ChevronDown className="size-4" />
                )}
            {isExpanded ? 'Hide' : 'Show'}
            {' '}
            Details
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {CONCISE_OPTIONS.find(o => o.id === conciseLevel)?.name}
                <ChevronDown className="ml-2 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {CONCISE_OPTIONS.map(option => (
                <DropdownMenuItem
                  key={option.id}
                  onSelect={() => {
                    setConciseLevel(option.id);
                    if (finalTranscript) {
                      hasGeneratedNote.current = false; // Regenerate with new conciseness
                    }
                  }}
                >
                  <div className="flex flex-col">
                    <span>{option.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {NOTE_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'SOAP'}
                <ChevronDown className="ml-2 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {NOTE_TEMPLATES.map(template => (
                <DropdownMenuItem
                  key={template.id}
                  onSelect={() => handleTemplateChange(template.id)}
                >
                  {template.name}
                  {template.id === selectedTemplate && (
                    <Check className="ml-2 size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant="outline"
            onClick={analyzeNow}
            disabled={isAnalyzing || !finalTranscript}
          >
            {isAnalyzing
              ? (
                  <Loader2 className="size-4 animate-spin" />
                )
              : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Analyze
                  </>
                )}
          </Button>
        </div>
      </div>

      {/* Always show the grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Live Transcript */}
        <ExpandableCard
          title="Live Transcript"
          onExpand={expanded => handleCardExpand('transcript', expanded)}
        >
          <LiveTranscript
            final={finalTranscript}
            interim={interimTranscript}
          />
        </ExpandableCard>

        {/* Clinical Analysis */}
        <ExpandableCard
          title="Clinical Findings"
          onExpand={expanded => handleCardExpand('findings', expanded)}
        >
          <div className="space-y-2">
            {findings.map((finding, index) => (
              <ClinicalFinding
                key={index}
                type={finding.type}
                importance={finding.importance}
                text={finding.text}
              />
            ))}
            {findings.length === 0 && !isAnalyzing && (
              <div className="flex items-center justify-center rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Click "Analyze" to get clinical insights
              </div>
            )}
          </div>
        </ExpandableCard>
      </div>

      {/* Error Messages */}
      {(recordingError || analysisError) && (
        <div className="text-sm text-red-500">
          {recordingError || analysisError}
        </div>
      )}
    </div>
  );
}

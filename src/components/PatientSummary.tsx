import { SignInButton, useAuth } from '@clerk/nextjs';
import { Check, RefreshCw, Settings } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { AudioRecorder } from '@/components/AudioRecorder';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { ConsultTimer } from '@/components/ConsultTimer';
import { StructuredNote } from '@/components/StructuredNote';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NOTE_TEMPLATES } from '@/config/noteTemplates';
import { useNoteCorrection } from '@/hooks/useNoteCorrection';
import type { Template } from '@/hooks/useTemplateManagement';
import type { GeneratedNote } from '@/types';

type PatientSummaryProps = {
  patientSummary: string;
  setPatientSummary: (summary: string) => void;
  handleTemplateChange: (template: string) => void;
  templates: Template[];
  resetAll: () => void;
  error: string | null;
  recordingError: string | null;
};

export function PatientSummary({
  patientSummary,
  setPatientSummary,
  handleTemplateChange,
  templates,
  resetAll,
  error,
  recordingError,
}: PatientSummaryProps) {
  const { correctNote, isCorrecting, error: correctionError } = useNoteCorrection();

  const { isSignedIn } = useAuth();

  const [selectedNoteTemplate, setSelectedNoteTemplate] = useState<string>('soap');
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(null);

  const _handleTemplateSelect = (templateId: number) => {
    if (templateId === -1) {
      // This will be handled by the renderManageTemplatesLink function
      return;
    }
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setPatientSummary(selectedTemplate.content);
      handleTemplateChange(templateId.toString());
    }
  };

  const handleCorrect = async () => {
    const correctedNote = await correctNote(patientSummary);
    if (correctedNote) {
      setPatientSummary(correctedNote);
    }
  };

  const handleNoteGenerated = (note: GeneratedNote) => {
    setGeneratedNote(note);
    // Also update the text area with formatted note
    const formattedNote = note.sections
      .map(section => `${section.key.toUpperCase()}:\n${section.content}\n`)
      .join('\n');
    setPatientSummary(formattedNote);
  };

  const handleNoteSave = (updatedNote: GeneratedNote) => {
    setGeneratedNote(updatedNote);
    const formattedNote = updatedNote.sections
      .map(section => `${section.key.toUpperCase()}:\n${section.content}\n`)
      .join('\n');
    setPatientSummary(formattedNote);
  };

  const _renderManageTemplatesLink = () => {
    if (isSignedIn) {
      return (
        <Link href="/template-management" className="flex items-center">
          <Settings className="mr-2 size-4" />
          Manage Templates
        </Link>
      );
    } else {
      return (
        <SignInButton mode="modal">
          <button type="button" className="flex items-center">
            <Settings className="mr-2 size-4" />
            Manage Templates
          </button>
        </SignInButton>
      );
    }
  };

  return (
    <Card className="flex h-full flex-col rounded-none border-0 bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted px-2 py-1">
        <CardTitle className="text-lg font-semibold">Consultation</CardTitle>
        <div className="flex items-center gap-2">
          <ConsultTimer />
        </div>
      </CardHeader>
      <CardContent className="flex grow flex-col gap-3 p-2">
        <div className="space-y-3">
          {/* Recording Section */}
          <div className="rounded-md border bg-muted/30 p-2">
            <AudioRecorder
              selectedTemplate={selectedNoteTemplate}
              onTemplateChange={setSelectedNoteTemplate}
              onNoteGenerated={handleNoteGenerated}
            />
          </div>

          {/* Note Section */}
          {generatedNote && (
            <div className="rounded-md border bg-card p-3">
              <h2 className="mb-3 text-base font-medium">Consultation Note</h2>
              <StructuredNote
                note={generatedNote}
                template={NOTE_TEMPLATES.find(t => t.id === selectedNoteTemplate) ?? null}
                onSave={handleNoteSave}
              />
            </div>
          )}

          {/* Raw Note Section */}
          <div className="rounded-md border bg-muted/30 p-2">
            <CollapsibleSection
              title="Raw Note Content"
              content={patientSummary}
              selectedTemplate={selectedNoteTemplate}
              onChange={setPatientSummary}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleCorrect}
              variant="outline"
              size="sm"
              disabled={isCorrecting}
              className="flex-1"
            >
              {isCorrecting ? <RefreshCw className="size-3 animate-spin" /> : <Check className="size-3" />}
              <span className="ml-1">Correct</span>
            </Button>
            <Button onClick={resetAll} variant="outline" size="sm" className="flex-1">
              <RefreshCw className="size-3" />
              <span className="ml-1">Reset All</span>
            </Button>
          </div>
        </div>

        {/* Error Messages */}
        {(error || recordingError || correctionError) && (
          <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {error && (
              <p>
                Error:
                {error}
              </p>
            )}
            {recordingError && (
              <p>
                Recording Error:
                {recordingError}
              </p>
            )}
            {correctionError && (
              <p>
                Correction Error:
                {correctionError}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

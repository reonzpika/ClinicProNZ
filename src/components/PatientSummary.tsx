import { SignInButton, useAuth } from '@clerk/nextjs';
import { Check, ChevronDown, Mic, RefreshCw, Settings } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useNoteCorrection } from '@/hooks/useNoteCorrection';
import type { Template } from '@/hooks/useTemplateManagement';

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
  isLoading: boolean;
  error: string | null;
  recordingError: string | null;
};

export function PatientSummary({
  patientSummary,
  setPatientSummary,
  selectedTemplate,
  handleTemplateChange,
  isRecording,
  startRecording,
  stopRecording,
  templates,
  resetAll,
  isLoading,
  error,
  recordingError,
}: PatientSummaryProps) {
  const { correctNote, isCorrecting, error: correctionError } = useNoteCorrection();

  const { isSignedIn } = useAuth();

  const handleTemplateSelect = (templateId: number) => {
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

  const renderManageTemplatesLink = () => {
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
        <div className="flex items-center space-x-2">
          <Button
            variant={isRecording ? 'destructive' : 'secondary'}
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic className={`size-4 ${isRecording ? 'animate-pulse' : ''}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedTemplate ? templates.find(t => t.id.toString() === selectedTemplate)?.name : 'Templates'}
                <ChevronDown className="ml-1 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {templates.map(template => (
                <DropdownMenuItem
                  key={template.id}
                  onSelect={() => handleTemplateSelect(template.id)}
                >
                  {template.name}
                  {template.id.toString() === selectedTemplate && <Check className="ml-2 size-4" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                {renderManageTemplatesLink()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex grow flex-col space-y-2 p-2">
        <Textarea
          placeholder="Enter patient notes here..."
          className="min-h-[200px] grow resize-none bg-background"
          value={patientSummary}
          onChange={e => setPatientSummary(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleCorrect}
            variant="outline"
            size="sm"
            disabled={isCorrecting}
            className="w-full"
          >
            {isCorrecting
              ? (
                  <RefreshCw className="mr-1 size-3 animate-spin" />
                )
              : (
                  <Check className="mr-1 size-3" />
                )}
            Correct
          </Button>
          <Button onClick={resetAll} variant="outline" size="sm" className="w-full">
            <RefreshCw className="mr-1 size-3" />
            Reset All
          </Button>
        </div>
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {recordingError && <p className="text-red-500">{recordingError}</p>}
        {correctionError && <p className="text-red-500">{correctionError}</p>}
      </CardContent>
    </Card>
  );
}

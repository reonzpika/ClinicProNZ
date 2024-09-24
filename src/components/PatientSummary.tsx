'use client';

import { ChevronDown, List, Mic, Plus, RefreshCw, Settings, Stethoscope, Zap } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type PatientSummaryProps = {
  patientSummary: string;
  setPatientSummary: (summary: string) => void;
  selectedTemplate: string;
  handleTemplateChange: (template: string) => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  templates: Record<string, string>;
  addNewTemplate: (name: string, content: string) => void;
  handleConsultAssist: (summary: string) => void;
  handleDifferentialDiagnosis: (summary: string) => void;
  resetAll: () => void;
  prompts: Array<{ id: string; name: string; content: string }>;
  handleCustomPrompt: (promptId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  addPrompt: (prompt: { name: string; content: string }) => void;
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
  addNewTemplate,
  handleConsultAssist,
  handleDifferentialDiagnosis,
  resetAll,
  prompts,
  handleCustomPrompt,
  isLoading,
  error,
  addPrompt,
}: PatientSummaryProps) {
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [isAddPromptDialogOpen, setIsAddPromptDialogOpen] = useState(false);

  const handleAddNewPrompt = () => {
    if (newPromptName && newPromptContent) {
      addPrompt({ name: newPromptName, content: newPromptContent });
      setNewPromptName('');
      setNewPromptContent('');
      setIsAddPromptDialogOpen(false);
    }
  };

  return (
    <Card className="flex grow flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Consultation</CardTitle>
        <div className="flex items-center space-x-2">
          {/* Template dropdown (unchanged) */}
          <Button
            variant={isRecording ? 'destructive' : 'secondary'}
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic className={`size-4 ${isRecording ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex grow flex-col pt-2">
        <Textarea
          placeholder="Enter patient notes here..."
          className="min-h-0 grow resize-none"
          value={patientSummary}
          onChange={e => setPatientSummary(e.target.value)}
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button onClick={() => handleConsultAssist(patientSummary)} size="sm">
            <Stethoscope className="mr-1 size-3" />
            Consult Assist
          </Button>
          <Button onClick={() => handleDifferentialDiagnosis(patientSummary)} size="sm">
            <List className="mr-1 size-3" />
            Differential Diagnosis
          </Button>
          <Dialog open={isAddPromptDialogOpen} onOpenChange={setIsAddPromptDialogOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading}>
                  <Zap className="mr-1 size-3" />
                  AI Insights
                  <ChevronDown className="ml-1 size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {prompts.map(prompt => (
                  <DropdownMenuItem
                    key={prompt.id}
                    onSelect={() => handleCustomPrompt(prompt.id)}
                    disabled={isLoading}
                  >
                    {prompt.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={() => setIsAddPromptDialogOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Add New Prompt
                  </DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem asChild>
                  <Link href="/prompt-management" className="flex items-center">
                    <Settings className="mr-2 size-4" />
                    Manage Prompts
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Prompt</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newPromptName}
                    onChange={e => setNewPromptName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prompt" className="text-right">
                    Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    value={newPromptContent}
                    onChange={e => setNewPromptContent(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddNewPrompt}>Add Prompt</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={resetAll} variant="outline" size="sm">
            <RefreshCw className="mr-1 size-3" />
            Reset All
          </Button>
        </div>
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}

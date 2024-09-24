'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Mic, ChevronDown, Plus, Stethoscope, List, Zap, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface PatientSummaryProps {
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
  handleCustomPrompt: (promptId: string) => void;
}

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
}: PatientSummaryProps) {
  return (
    <Card className="flex grow flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Consultation</CardTitle>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
                <ChevronDown className="ml-1 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {templates && Object.keys(templates).map(template => (
                <DropdownMenuItem key={template} onSelect={() => handleTemplateChange(template)}>
                  {template.charAt(0).toUpperCase() + template.slice(1)}
                </DropdownMenuItem>
              ))}
              <Separator />
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                  <Plus className="mr-2 size-4" />
                  Add New Template
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Zap className="mr-1 size-3" />
                AI Insights
                <ChevronDown className="ml-1 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {prompts.map(prompt => (
                <DropdownMenuItem key={prompt.id} onSelect={() => handleCustomPrompt(prompt.id)}>
                  {prompt.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={resetAll} variant="outline" size="sm">
            <RefreshCw className="mr-1 size-3" />
            Reset All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
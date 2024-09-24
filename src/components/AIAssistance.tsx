import React, { useState } from 'react';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Stethoscope, List, Zap, ChevronDown, Plus, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type AIAssistanceProps = {
  selectedAITask: string;
  setSelectedAITask: (task: string) => void;
  consultAssistResults: { response: string };
  differentialDiagnosisResults: { response: string };
  prompts: Array<{ id: string; name: string; content: string }>;
  customPromptResults: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  handleConsultAssist: (summary: string) => void;
  handleDifferentialDiagnosis: (summary: string) => void;
  handleCustomPrompt: (promptId: string) => Promise<void>;
  patientSummary: string;
  addPrompt: (prompt: { name: string; content: string }) => void;
};

export function AIAssistance({
  selectedAITask,
  setSelectedAITask,
  consultAssistResults,
  differentialDiagnosisResults,
  prompts,
  customPromptResults,
  isLoading,
  error,
  handleConsultAssist,
  handleDifferentialDiagnosis,
  handleCustomPrompt,
  patientSummary,
  addPrompt,
}: AIAssistanceProps) {
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
    <Card>
      <CardContent className="pt-4">
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
        </div>
        <Select value={selectedAITask} onValueChange={setSelectedAITask}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select AI task" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consult">Consult Assist</SelectItem>
            <SelectItem value="differential">Differential Diagnosis</SelectItem>
            {prompts.map(prompt => (
              <SelectItem key={prompt.id} value={prompt.id}>{prompt.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-4">
          {isLoading && <p>Loading...</p>}
          {error && (
            <p className="text-red-500">
              Error:
              {error}
            </p>
          )}
          {!isLoading && !error && (
            <>
              {selectedAITask === 'consult' && (
                <div dangerouslySetInnerHTML={{ __html: consultAssistResults.response }} />
              )}
              {selectedAITask === 'differential' && (
                <div dangerouslySetInnerHTML={{ __html: differentialDiagnosisResults.response }} />
              )}
              {prompts.map(prompt => (
                selectedAITask === prompt.id && (
                  <div key={prompt.id}>
                    <h4 className="mb-2 font-medium">{prompt.name}</h4>
                    <p>{customPromptResults[prompt.id]}</p>
                  </div>
                )
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

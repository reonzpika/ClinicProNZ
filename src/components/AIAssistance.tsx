import { ChevronDown, List, Settings, Stethoscope, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MarkdownRenderer = dynamic(() => import('@/components/MarkdownRenderer'), {
  ssr: false,
});

type AIAssistanceProps = {
  selectedAITask: string;
  setSelectedAITask: (task: string) => void;
  consultAssistResults: { response: string };
  differentialDiagnosisResults: { response: string };
  prompts: Array<{ id: number; name: string; content: string }>;
  customPromptResults: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  handleConsultAssist: (summary: string) => void;
  handleDifferentialDiagnosis: (summary: string) => void;
  handleCustomPrompt: (promptId: number) => Promise<void>;
  patientSummary: string;
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
}: AIAssistanceProps) {
  const renderContent = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div className="text-red-500">{error}</div>;
    }

    switch (selectedAITask) {
      case 'consult':
        return <MarkdownRenderer content={consultAssistResults.response} />;
      case 'differential':
        return <MarkdownRenderer content={differentialDiagnosisResults.response} />;
      default:
        return customPromptResults[selectedAITask]
          ? <MarkdownRenderer content={customPromptResults[selectedAITask]} />
          : null;
    }
  };

  return (
    <Card className="h-full flex flex-col rounded-none border-0 bg-card">
      <CardContent className="flex flex-col space-y-2 p-2 flex-grow">
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => handleConsultAssist(patientSummary)} size="sm" disabled={isLoading} className="w-full">
            <Stethoscope className="mr-1 size-3" />
            Consult Assist
          </Button>
          <Button onClick={() => handleDifferentialDiagnosis(patientSummary)} size="sm" disabled={isLoading} className="w-full">
            <List className="mr-1 size-3" />
            Differential Diagnosis
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading} className="w-full">
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
              <DropdownMenuItem asChild>
                <Link href="/prompt-management" className="flex items-center">
                  <Settings className="mr-2 size-4" />
                  Manage Prompts
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Select value={selectedAITask} onValueChange={setSelectedAITask}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select AI task" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consult">Consult Assist</SelectItem>
            <SelectItem value="differential">Differential Diagnosis</SelectItem>
            {prompts.map(prompt => (
              <SelectItem key={prompt.id} value={prompt.id.toString()}>{prompt.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-grow overflow-y-auto text-sm bg-background p-2 rounded">
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
}

import { SignInButton, useAuth } from '@clerk/nextjs';
import { ChevronDown, Settings } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const MarkdownRenderer = dynamic(() => import('@/components/MarkdownRenderer'), {
  ssr: false,
});

type AIAssistanceProps = {
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
  const { isSignedIn } = useAuth();
  const [selectedTask, setSelectedTask] = React.useState<string | null>(null);

  const handleTaskSelection = (task: string) => {
    setSelectedTask(task);
    switch (task) {
      case 'consult':
        handleConsultAssist(patientSummary);
        break;
      case 'differential':
        handleDifferentialDiagnosis(patientSummary);
        break;
      default: {
        const promptId = Number.parseInt(task, 10);
        if (Number.isNaN(promptId)) {
          return;
        }
        handleCustomPrompt(promptId);
      }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div className="text-red-500">{error}</div>;
    }

    switch (selectedTask) {
      case 'consult':
        return <MarkdownRenderer content={consultAssistResults.response} />;
      case 'differential':
        return <MarkdownRenderer content={differentialDiagnosisResults.response} />;
      default:
        if (selectedTask && customPromptResults[selectedTask]) {
          return <MarkdownRenderer content={customPromptResults[selectedTask]} />;
        }
        return null;
    }
  };

  const renderManagePromptsLink = () => {
    if (isSignedIn) {
      return (
        <Link href="/prompt-management" className="flex items-center">
          <Settings className="mr-2 size-4" />
          Manage Prompts
        </Link>
      );
    } else {
      return (
        <SignInButton mode="modal">
          <button type="button" className="flex items-center">
            <Settings className="mr-2 size-4" />
            Manage Prompts
          </button>
        </SignInButton>
      );
    }
  };

  return (
    <Card className="flex h-full flex-col rounded-none border-0 bg-card">
      <CardContent className="flex grow flex-col space-y-2 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedTask
                ? (
                    selectedTask === 'consult'
                      ? 'Consult Assist'
                      : selectedTask === 'differential'
                        ? 'Differential Diagnosis'
                        : prompts.find(p => p.id.toString() === selectedTask)?.name
                  )
                : 'Choose your function'}
              <ChevronDown className="ml-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onSelect={() => handleTaskSelection('consult')}>
              Consult Assist
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleTaskSelection('differential')}>
              Differential Diagnosis
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {prompts.map(prompt => (
              <DropdownMenuItem
                key={prompt.id}
                onSelect={() => handleTaskSelection(prompt.id.toString())}
              >
                {prompt.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              {renderManagePromptsLink()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="grow overflow-y-auto rounded bg-background p-2 text-sm">
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
}

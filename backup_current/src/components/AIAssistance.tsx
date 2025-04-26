import { AlertCircle, BookOpen, PenSquare, Stethoscope, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ConsultAssistResults = {
  response: string;
};

type DifferentialDiagnosisResults = {
  response: string;
};

type Prompt = {
  id: number;
  content: string;
};

type AIAssistanceProps = {
  consultAssistResults: ConsultAssistResults;
  differentialDiagnosisResults: DifferentialDiagnosisResults;
  prompts: Prompt[];
  customPromptResults: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  handleConsultAssist: (summary: string) => void;
  handleDifferentialDiagnosis: (summary: string) => void;
  handleCustomPrompt: (promptId: number) => void;
  patientSummary: string;
};

const CLINICAL_SUPPORT_FEATURES = [
  {
    id: 'differential',
    name: 'Differential Suggestions',
    icon: Stethoscope,
    description: 'AI-assisted differential diagnosis suggestions based on patient presentation',
  },
  {
    id: 'missing',
    name: 'Missing Information',
    icon: AlertCircle,
    description: 'Identify potentially important missing information or questions',
  },
  {
    id: 'interactions',
    name: 'Drug Interactions',
    icon: PenSquare,
    description: 'Check for potential drug interactions and contraindications',
  },
  {
    id: 'guidelines',
    name: 'Clinical Guidelines',
    icon: BookOpen,
    description: 'Relevant NZ guidelines based on current diagnosis',
  },
] as const;

const InstructionSection = ({ onDismiss }: { onDismiss: () => void }) => (
  <div className="mb-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Welcome to ConsultAI NZ (Beta)</h2>
      <Button variant="ghost" size="sm" onClick={onDismiss} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        <X className="size-4" />
      </Button>
    </div>

    <div className="mt-6 space-y-6 text-slate-700 dark:text-slate-200">
      <div>
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Currently Available:</h3>
        <ul className="ml-5 list-disc space-y-2">
          <li>Live consultation transcription</li>
          <li>AI-powered structured note generation</li>
          <li>Patient agenda and red flags analysis</li>
        </ul>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Coming Soon:</h3>
        <ul className="ml-5 list-disc space-y-2">
          <li>Clinical analysis & decision support</li>
          <li>NZ health resource integration</li>
          <li>Clinical tools integration</li>
        </ul>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">How to Use:</h3>
        <ol className="ml-5 list-decimal space-y-2">
          <li>Start recording your consultation</li>
          <li>View real-time transcription</li>
          <li>Click "Analyze" to see patient's agenda and red flags</li>
          <li>When consultation ends, get an AI-generated structured note</li>
        </ol>
      </div>
    </div>
  </div>
);

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
  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <Card className="flex h-full flex-col rounded-none border-0 bg-card">
      <CardContent className="flex grow flex-col space-y-2 p-2">
        {showInstructions && (
          <InstructionSection onDismiss={() => setShowInstructions(false)} />
        )}

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <p className="font-medium text-yellow-800 dark:text-yellow-200">
            Clinical Decision Support Notice
          </p>
          <p className="mt-1 text-yellow-700 dark:text-yellow-300">
            These AI-powered features are designed to assist clinical decision-making, not replace clinical judgment. Always verify suggestions against current clinical guidelines and your professional expertise.
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handleConsultAssist(patientSummary)}
            disabled={isLoading || !patientSummary}
          >
            Get Additional Questions
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDifferentialDiagnosis(patientSummary)}
            disabled={isLoading || !patientSummary}
          >
            Get Differential Diagnosis
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        )}

        {consultAssistResults.response && (
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Additional Questions to Consider</h3>
            <div className="whitespace-pre-wrap">{consultAssistResults.response}</div>
          </div>
        )}

        {differentialDiagnosisResults.response && (
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Differential Diagnosis Suggestions</h3>
            <div className="whitespace-pre-wrap">{differentialDiagnosisResults.response}</div>
          </div>
        )}

        {prompts.length > 0 && (
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Custom Prompts</h3>
            <div className="space-y-2">
              {prompts.map(prompt => (
                <div key={prompt.id} className="flex items-start space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomPrompt(prompt.id)}
                    disabled={isLoading}
                  >
                    Run
                  </Button>
                  <div className="flex-1">
                    <div className="text-sm">{prompt.content}</div>
                    {customPromptResults[prompt.id] && (
                      <div className="mt-2 whitespace-pre-wrap rounded bg-muted p-2 text-sm">
                        {customPromptResults[prompt.id]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {CLINICAL_SUPPORT_FEATURES.map(feature => (
            <div
              key={feature.id}
              className="flex min-h-[100px] items-center justify-center rounded-lg border border-dashed p-8 text-center"
            >
              <div className="space-y-2">
                <feature.icon className="mx-auto size-8 text-muted-foreground/60" />
                <h3 className="text-sm font-medium">{feature.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                  <span className="ml-1 text-xs">(Coming Soon)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIAssistanceProps {
  selectedAITask: string;
  setSelectedAITask: (task: string) => void;
  consultAssistResults: { response: string };
  differentialDiagnosisResults: { response: string };
  prompts: Array<{ id: string; name: string; content: string }>;
  customPromptResults: Record<string, string>;
  isLoading: boolean;
  error: string | null;
}

export function AIAssistance({
  selectedAITask,
  setSelectedAITask,
  consultAssistResults,
  differentialDiagnosisResults,
  prompts,
  customPromptResults,
  isLoading,
  error,
}: AIAssistanceProps) {
  return (
    <Card>
      <CardContent className="pt-4">
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
          {error && <p className="text-red-500">Error: {error}</p>}
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
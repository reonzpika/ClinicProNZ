'use client';

import { ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { AnalysisHandler } from '@/components/AnalysisHandler';
import { ConsultReminders } from '@/components/ConsultReminders';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AnalysisResult } from '@/types';

export function ConsultationReminders({ transcript }: { transcript: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [findings, setFindings] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = () => {
    window.dispatchEvent(new Event('startAnalysis'));
  };

  return (
    <Card className="border bg-card">
      {/* Analysis Handler */}
      <AnalysisHandler
        transcript={transcript}
        onAnalysisStart={() => {
          setIsAnalyzing(true);
          setError(null);
        }}
        onAnalysisComplete={(newFindings) => {
          setFindings(newFindings);
          setIsAnalyzing(false);
        }}
        onError={(newError) => {
          setError(newError);
          setIsAnalyzing(false);
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between bg-muted px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          Patient Agenda & Reminders
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !transcript}
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

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Show findings if available */}
          {findings && <ConsultReminders findings={findings} />}

          {/* Show placeholder if no findings */}
          {!findings && !isAnalyzing && (
            <div className="flex items-center justify-center rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Click "Analyze" to get consultation reminders
            </div>
          )}

          {/* Show error if any */}
          {error && (
            <div className="mt-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

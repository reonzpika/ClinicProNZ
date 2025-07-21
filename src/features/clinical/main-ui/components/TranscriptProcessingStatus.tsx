'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';

import { Badge } from '@/src/shared/components/ui/badge';

type TranscriptProcessingStatusProps = {
  isLoading: boolean;
  structuredTranscriptStatus: 'none' | 'structuring' | 'completed' | 'failed';
  inputMode: 'audio' | 'typed';
};

export function TranscriptProcessingStatus({
  isLoading,
  structuredTranscriptStatus,
  inputMode,
}: TranscriptProcessingStatusProps) {
  // Don't show anything if not loading or in typed mode
  if (!isLoading || inputMode === 'typed') {
    return null;
  }

  const getStatusMessage = () => {
    switch (structuredTranscriptStatus) {
      case 'structuring':
        return {
          message: 'Organising consultation by problems...',
          badge: 'Structuring',
          variant: 'secondary' as const,
          showSpinner: true,
        };
      case 'completed':
        return {
          message: 'Writing clinical notes...',
          badge: 'Generating Notes',
          variant: 'secondary' as const,
          showSpinner: true,
        };
      case 'failed':
        return {
          message: 'Generating notes with original transcript...',
          badge: 'Generating Notes',
          variant: 'secondary' as const,
          showSpinner: true,
        };
      default:
        return {
          message: 'Generating notes...',
          badge: 'Processing',
          variant: 'secondary' as const,
          showSpinner: true,
        };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="flex items-center justify-center space-x-3 py-4">
      {status.showSpinner && (
        <Loader2 className="size-4 animate-spin text-blue-600" />
      )}
      <div className="flex items-center space-x-2">
        <Badge variant={status.variant} className="font-medium">
          {status.badge}
        </Badge>
        <span className="text-sm text-slate-600">
          {status.message}
        </span>
      </div>
    </div>
  );
}

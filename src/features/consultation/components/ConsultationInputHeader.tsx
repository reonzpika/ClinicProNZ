'use client';

import { Info, Keyboard, Mic } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/shared/components/ui/button';

type ConsultationInputHeaderProps = {
  mode: 'audio' | 'typed';
  status?: string;
  isRecording?: boolean;
  onHelpToggle?: () => void;
  showHelp?: boolean;
};

export const ConsultationInputHeader: React.FC<ConsultationInputHeaderProps> = ({
  mode,
  status,
  isRecording,
  onHelpToggle,
  showHelp = false,
}) => {
  const [helpVisible, setHelpVisible] = useState(showHelp);

  const handleHelpClick = () => {
    setHelpVisible(!helpVisible);
    onHelpToggle?.();
  };

  const getStatusDisplay = () => {
    if (mode === 'audio') {
      if (isRecording) {
        return (
          <div className="flex items-center gap-1">
            <span className="inline-block size-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-xs text-red-600">Recording...</span>
          </div>
        );
      }
      return status
        ? (
            <span className="text-xs text-slate-600">{status}</span>
          )
        : null;
    }

    // Typed mode
    return status
      ? (
          <div className="flex items-center gap-1">
            {status === 'Saved' && <span className="text-xs text-green-600">✓ Saved</span>}
            {status === 'Editing' && <span className="text-xs text-slate-600">Editing...</span>}
            {status !== 'Saved' && status !== 'Editing' && (
              <span className="text-xs text-slate-600">{status}</span>
            )}
          </div>
        )
      : null;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {mode === 'audio'
            ? (
                <Mic size={16} className="text-slate-600" />
              )
            : (
                <Keyboard size={16} className="text-slate-600" />
              )}
          <h3 className="text-sm font-medium text-slate-700">Consultation Note</h3>
        </div>
        {getStatusDisplay()}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleHelpClick}
        className="size-6 p-0 text-slate-500 hover:text-slate-700"
        title="Show help"
      >
        <Info size={14} />
      </Button>
    </div>
  );
};

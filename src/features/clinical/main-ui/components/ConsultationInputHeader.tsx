'use client';

import { Info, Keyboard, Mic } from 'lucide-react';
import React, { useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';

type ConsultationInputHeaderProps = {
  mode: 'audio';
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
  const { inputMode, setInputMode } = useConsultationStores();
  const [helpVisible, setHelpVisible] = useState(showHelp);

  const handleHelpClick = () => {
    setHelpVisible(!helpVisible);
    onHelpToggle?.();
  };

  const handleInputModeToggle = () => {
    setInputMode('audio');
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
    return status ? (<span className="text-xs text-slate-600">{status}</span>) : null;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Mic size={16} className="text-slate-600" />
          <h3 className="text-sm font-medium text-slate-700">Consultation Note</h3>
        </div>
        {getStatusDisplay()}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInputModeToggle}
          className="cursor-pointer text-xs font-medium text-green-600 hover:text-green-800 hover:underline"
          title="Audio input only"
        >
          Audio
        </button>
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
    </div>
  );
};

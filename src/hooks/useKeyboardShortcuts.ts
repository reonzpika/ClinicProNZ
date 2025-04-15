'use client';

import { useEffect } from 'react';

export function useKeyboardShortcuts({
  onStartRecording,
  onStopRecording,
  onAnalyze,
  onToggleTranscript,
  onToggleFindings,
}: {
  onStartRecording: () => void;
  onStopRecording: () => void;
  onAnalyze: () => void;
  onToggleTranscript: () => void;
  onToggleFindings: () => void;
}) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + ...
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            onStartRecording();
            break;
          case 's':
            e.preventDefault();
            onStopRecording();
            break;
          case 'a':
            e.preventDefault();
            onAnalyze();
            break;
          case 't':
            e.preventDefault();
            onToggleTranscript();
            break;
          case 'f':
            e.preventDefault();
            onToggleFindings();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onStartRecording, onStopRecording, onAnalyze, onToggleTranscript, onToggleFindings]);
} 
'use client';

import React, { useEffect, useState } from 'react';

import { useConsultation } from '@/shared/ConsultationContext';

import { ConsultationInputHeader } from './ConsultationInputHeader';

export function TypedInput({ collapsed, onExpand, isMinimized }: { collapsed?: boolean; onExpand?: () => void; isMinimized?: boolean }) {
  const { typedInput, setTypedInput, saveTypedInputToCurrentSession } = useConsultation();
  const [localInput, setLocalInput] = useState(typedInput);
  const [isExpanded, setIsExpanded] = useState(!isMinimized);
  const [lastSavedInput, setLastSavedInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'editing' | 'saving'>('saved');
  const [showHelp, setShowHelp] = useState(false);

  // Check if user has typed anything (not just empty lines)
  const hasContent = localInput.trim().length > 0;

  // Sync local state with context when typedInput changes externally
  useEffect(() => {
    setLocalInput(typedInput);
    setLastSavedInput(typedInput); // Update saved tracking when loaded from session
  }, [typedInput]);

  // Update save status when typing
  useEffect(() => {
    if (localInput !== lastSavedInput) {
      setSaveStatus('editing');
    } else {
      setSaveStatus('saved');
    }
  }, [localInput, lastSavedInput]);

  // Autosave every 2 seconds when typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localInput !== typedInput) {
        setTypedInput(localInput);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [localInput, typedInput, setTypedInput]);

  // Save on blur - sync to context
  const handleBlur = () => {
    setTypedInput(localInput);
  };

  // Save typed input to session
  const handleSaveToSession = async () => {
    if (localInput !== lastSavedInput && localInput.trim() !== '') {
      try {
        setSaveStatus('saving');
        const success = await saveTypedInputToCurrentSession(localInput);
        if (success) {
          setLastSavedInput(localInput);
          setSaveStatus('saved');
        }
      } catch (error) {
        console.error('Failed to save typed input:', error);
        setSaveStatus('editing');
      }
    }
  };

  // Combined blur handler - handles both sync and async operations
  const handleCombinedBlur = async () => {
    handleBlur(); // Sync to context immediately
    await handleSaveToSession(); // Save to session asynchronously
  };

  // Handle Enter key for autosave
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Save on Enter (but don't prevent newline)
      setTimeout(() => handleSaveToSession(), 100);
    }
  };

  // Handle minimized state (in documentation mode)
  if (isMinimized) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">Consultation Note</span>
            {saveStatus === 'saved' && (
              <span className="text-xs text-slate-500">✓ Saved</span>
            )}
          </div>
          <button
            type="button"
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
        {isExpanded && (
          <div className="rounded border border-slate-200 bg-white p-3">
            <textarea
              value={localInput}
              onChange={e => setLocalInput(e.target.value)}
              onBlur={handleCombinedBlur}
              onKeyDown={handleKeyDown}
              className="w-full resize-none border-none text-sm leading-relaxed focus:outline-none"
              placeholder="Type your consultation notes here..."
              spellCheck
              rows={6}
            />
            {hasContent && (
              <div className="mt-1 text-xs text-slate-500">
                {localInput.length}
                {' '}
                characters
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Handle original collapsed state (backwards compatibility)
  if (collapsed) {
    return (
      <div className="p-2">
        <div className="flex items-center justify-between">
          <ConsultationInputHeader
            mode="typed"
            status={saveStatus === 'saved' ? 'Saved' : saveStatus === 'editing' ? 'Editing' : 'Saving...'}
          />
          <button type="button" className="text-xs text-blue-600 hover:underline" onClick={onExpand}>
            Expand
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ConsultationInputHeader
        mode="typed"
        status={saveStatus === 'saved' ? 'Saved' : saveStatus === 'editing' ? 'Editing' : 'Saving...'}
        onHelpToggle={() => setShowHelp(!showHelp)}
        showHelp={showHelp}
      />

      <div className="mt-4 flex flex-1 flex-col space-y-3">
        <textarea
          value={localInput}
          onChange={e => setLocalInput(e.target.value)}
          onBlur={handleCombinedBlur}
          onKeyDown={handleKeyDown}
          className="min-h-[200px] w-full flex-1 resize-none overflow-y-auto rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Type your consultation notes here..."
          spellCheck
        />

        {/* Status and character count */}
        {hasContent && (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {localInput.length}
              {' '}
              characters
            </span>
            <span>
              {saveStatus === 'saved' && '✓ Auto-saved'}
              {saveStatus === 'editing' && 'Editing...'}
              {saveStatus === 'saving' && 'Saving...'}
            </span>
          </div>
        )}

        {/* Help section (hidden by default) */}
        {showHelp && (
          <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
            <p className="font-medium">Typed Input Mode:</p>
            <ul className="ml-3 mt-1 list-disc space-y-0.5">
              <li>Type all consultation details directly into this text box</li>
              <li>Include patient history, examination findings, assessment, and plan</li>
              <li>Your notes auto-save as you type and on Enter</li>
              <li>Use this mode when you prefer typing over voice recording</li>
              <li>Click "Generate Notes" when ready to create the final consultation note</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

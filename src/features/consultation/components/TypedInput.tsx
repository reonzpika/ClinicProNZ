'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Section } from '@/shared/components/layout/Section';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

export function TypedInput({ collapsed, onExpand }: { collapsed?: boolean; onExpand?: () => void }) {
  const { typedInput, setTypedInput } = useConsultation();
  const [localInput, setLocalInput] = useState(typedInput);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if user has typed anything (not just empty lines)
  const hasContent = localInput.trim().length > 0;

  // Sync local state with context when typedInput changes externally
  useEffect(() => {
    setLocalInput(typedInput);
  }, [typedInput]);

  // Autosave every 2 seconds when typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localInput !== typedInput) {
        setTypedInput(localInput);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [localInput, typedInput, setTypedInput]);

  // Save on blur
  const handleBlur = useCallback(() => {
    setTypedInput(localInput);
  }, [localInput, setTypedInput]);

  // Auto-expand textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const minHeight = 200;
      const maxHeight = 600;
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [localInput]);

  if (collapsed) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-1 pb-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">Consultation Notes</span>
          </div>
          <button type="button" className="text-xs text-blue-600 hover:underline" onClick={onExpand}>
            Expand
          </button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xs font-semibold">Consultation Notes</h2>
      </CardHeader>
      <CardContent>
        <Section>
          <textarea
            ref={textareaRef}
            value={localInput}
            onChange={e => setLocalInput(e.target.value)}
            onBlur={handleBlur}
            className="w-full resize-none rounded border p-3 text-sm leading-relaxed focus:border-primary focus:ring-2 focus:ring-primary"
            placeholder={`Type your consultation notes here...

Include patient history, examination findings, assessment, and management plan. This will be used to generate the final consultation note.`}
            spellCheck
            style={{ minHeight: 200, maxHeight: 600 }}
          />

          {/* Instructions for first-time users */}
          {!hasContent && (
            <div className="mt-3 rounded-md bg-blue-50 p-3 text-xs text-blue-800">
              <p className="font-medium">Typed Input Mode:</p>
              <ul className="ml-3 mt-1 list-disc space-y-0.5">
                <li>Type all consultation details directly into this text box</li>
                <li>Include patient history, examination findings, assessment, and plan</li>
                <li>Your notes auto-save as you type</li>
                <li>Use this mode when you prefer typing over voice recording</li>
                <li>Click "Generate Notes" when ready to create the final consultation note</li>
              </ul>
            </div>
          )}

          {hasContent && (
            <div className="mt-2 text-xs text-muted-foreground">
              {localInput.length}
              {' '}
              characters • Auto-saves as you type
            </div>
          )}
        </Section>
      </CardContent>
    </Card>
  );
}

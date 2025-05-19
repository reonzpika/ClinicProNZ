'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Section } from '@/shared/components/layout/Section';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

export function QuickNotes({ collapsed, onExpand }: { collapsed?: boolean; onExpand?: () => void }) {
  const { quickNotes, setQuickNotes } = useConsultation();
  const [notesText, setNotesText] = useState(quickNotes.join('\n'));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync local state with context when quickNotes changes externally
  useEffect(() => {
    setNotesText(quickNotes.join('\n'));
  }, [quickNotes]);

  // Autosave every 1 min
  useEffect(() => {
    const interval = setInterval(() => {
      setQuickNotes(
        notesText.split('\n').map(line => line.trim()).filter(Boolean),
      );
    }, 60000);
    return () => clearInterval(interval);
  }, [notesText, setQuickNotes]);

  // Save on blur
  const handleBlur = useCallback(() => {
    setQuickNotes(
      notesText.split('\n').map(line => line.trim()).filter(Boolean),
    );
  }, [notesText, setQuickNotes]);

  if (collapsed) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-1 pb-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">Quick Notes</span>
          </div>
          <Button type="button" size="sm" className="text-xs" onClick={onExpand}>Expand</Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xs font-semibold">Quick Notes</h2>
      </CardHeader>
      <CardContent>
        <Section>
          <textarea
            ref={textareaRef}
            value={notesText}
            onChange={e => setNotesText(e.target.value)}
            onBlur={handleBlur}
            className="h-20 w-full resize-y overflow-y-auto rounded border p-1 text-xs"
            placeholder="Type each quick note on a new line..."
            spellCheck={false}
          />
        </Section>
      </CardContent>
    </Card>
  );
}

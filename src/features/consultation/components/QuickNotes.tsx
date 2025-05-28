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

  // Check if user has typed anything (not just empty lines)
  const hasContent = notesText.trim().length > 0;

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
            <span className="text-xs font-semibold">Additional Info</span>
          </div>
          <Button type="button" size="sm" className="text-xs" onClick={onExpand}>Expand</Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xs font-semibold">Additional Info</h2>
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

          {/* Instructions for first-time users */}
          {!hasContent && (
            <div className="mt-2 rounded-md bg-blue-50 p-2 text-xs text-blue-800">
              <p className="font-medium">How it works:</p>
              <ul className="ml-3 mt-1 list-disc space-y-0.5">
                <li>Start typing extra details at any time during the consult</li>
                <li>Use it to capture anything you don't say out loud, for example:</li>
                <ul className="ml-4 mt-0.5 list-disc space-y-0.5">
                  <li>Vitals (e.g. BP 120/80 mmHg, temp 37.2)</li>
                  <li>Observations (appearance, affect, gait)</li>
                  <li>Your assessment & plan (e.g. "Suspected viral URTI – advise rest, fluids, review in 1 week")</li>
                  <li>Referrals (e.g. refer to physio) or investigations (e.g. order FBC, CXR)</li>
                </ul>
                <li>Your entries auto-save as you type</li>
                <li>When you stop recording, both your live transcript and Additional Info will be used to generate the consult note</li>
              </ul>
            </div>
          )}
        </Section>
      </CardContent>
    </Card>
  );
}

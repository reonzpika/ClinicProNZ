'use client';

import React, { useCallback, useRef, useState } from 'react';

import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Section } from '@/shared/components/layout/Section';
import { useConsultation } from '@/shared/ConsultationContext';

export function QuickNotes() {
  const { quickNotes, addQuickNote } = useConsultation();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = useCallback(() => {
    const note = input.trim();
    if (note) {
      addQuickNote(note);
      setInput('');
      if (inputRef.current) inputRef.current.focus();
    }
  }, [input, addQuickNote]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }, [handleAdd]);

  const handleBlur = useCallback(() => {
    if (input.trim()) {
      handleAdd();
    }
  }, [input, handleAdd]);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Quick Notes</h2>
      </CardHeader>
      <CardContent>
        <Section>
          <div className="flex gap-2 items-center">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type a quick note..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={handleBlur}
              className="flex-1"
            />
            <Button type="button" onClick={handleAdd} disabled={!input.trim()}>
              Add
            </Button>
          </div>
          <ul className="mt-4 space-y-2">
            {quickNotes.map((note, idx) => (
              <li key={idx} className="bg-muted rounded px-3 py-2 text-sm">
                {note}
              </li>
            ))}
          </ul>
        </Section>
      </CardContent>
    </Card>
  );
}

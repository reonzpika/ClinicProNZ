'use client';

import React, { useCallback, useRef, useState } from 'react';

import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Section } from '@/shared/components/layout/Section';
import { useConsultation } from '@/shared/ConsultationContext';

export function QuickNotes() {
  const { quickNotes, addQuickNote, deleteQuickNote, clearQuickNotes } = useConsultation();
  // deleteQuickNote: removes a single note by index
  // clearQuickNotes: removes all notes
  // TODO: Consider adding undo functionality for note deletion in the future
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
        <div className="flex items-center justify-between gap-1">
          <h2 className="text-xs font-semibold">Quick Notes</h2>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={clearQuickNotes}
            disabled={quickNotes.length === 0}
            title="Delete all notes"
            aria-label="Delete all notes"
            className="text-xs"
          >
            Delete All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Section>
          <div className="flex gap-1 items-center">
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
            <Button type="button" onClick={handleAdd} disabled={!input.trim()} className="text-xs px-2 py-1 h-8">
              Add
            </Button>
          </div>
          <ul className="mt-1 space-y-1">
            {quickNotes.map((note, idx) => (
              <li key={idx} className="bg-muted rounded px-1 py-1 text-xs flex items-center justify-between">
                <span>{note}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteQuickNote(idx)}
                  title="Delete note"
                  aria-label={`Delete note: ${note}`}
                  className="ml-1 text-destructive hover:bg-destructive/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </li>
            ))}
          </ul>
        </Section>
      </CardContent>
    </Card>
  );
}

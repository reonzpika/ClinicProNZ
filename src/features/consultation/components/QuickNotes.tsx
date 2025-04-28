'use client';

import React, { useCallback, useState } from 'react';

import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';
import { Section } from '@/shared/components/layout/Section';

type QuickNotesProps = {
  initialValue?: string;
  onSave?: (content: string) => void;
};

export function QuickNotes({ initialValue = '', onSave }: QuickNotesProps) {
  const [content, setContent] = useState(initialValue);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onSave?.(newContent);
  }, [onSave]);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Quick Notes</h2>
      </CardHeader>
      <CardContent>
        <Section>
          <Textarea
            placeholder="Type your quick notes here..."
            value={content}
            onChange={handleChange}
            className="min-h-[150px]"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Your notes are automatically saved as you type
          </p>
        </Section>
      </CardContent>
    </Card>
  );
}

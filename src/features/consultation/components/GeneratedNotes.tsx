'use client';

import React from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';
import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';

type GeneratedNotesProps = {
  content?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  onGenerate?: () => void;
  onCopy?: () => void;
};

export function GeneratedNotes({ content, onGenerate, onCopy }: GeneratedNotesProps) {
  const hasContent = content && Object.values(content).some(value => value && value.trim() !== '');

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Generated Notes</h2>
      </CardHeader>
      <CardContent>
        <Stack spacing="md">
          <Section>
            <Textarea
              placeholder="Subjective notes will appear here..."
              value={content?.subjective || ''}
              readOnly
              className="min-h-[150px]"
            />
          </Section>

          <Section>
            <Textarea
              placeholder="Objective notes will appear here..."
              value={content?.objective || ''}
              readOnly
              className="min-h-[150px]"
            />
          </Section>

          <Section>
            <Textarea
              placeholder="Assessment notes will appear here..."
              value={content?.assessment || ''}
              readOnly
              className="min-h-[150px]"
            />
          </Section>

          <Section>
            <Textarea
              placeholder="Plan notes will appear here..."
              value={content?.plan || ''}
              readOnly
              className="min-h-[150px]"
            />
          </Section>

          <Section>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="default"
                onClick={onGenerate}
                disabled={!onGenerate}
              >
                Generate Notes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onCopy}
                disabled={!hasContent || !onCopy}
              >
                Copy to Clipboard
              </Button>
            </div>
          </Section>
        </Stack>
      </CardContent>
    </Card>
  );
}

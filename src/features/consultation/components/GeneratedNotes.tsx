'use client';

import React from 'react';

import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';
import { useConsultation } from '@/shared/ConsultationContext';

export function GeneratedNotes({ onGenerate, onCopy }: { onGenerate?: () => void; onCopy?: () => void }) {
  const { generatedNotes } = useConsultation();
  const hasContent = !!(generatedNotes && generatedNotes.trim() !== '');

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Generated Notes</h2>
      </CardHeader>
      <CardContent>
        <Stack spacing="md">
          <Section>
            <Textarea
              placeholder="Generated notes will appear here..."
              value={generatedNotes || ''}
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

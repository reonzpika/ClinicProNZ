"use client";
import * as React from 'react';
import { useParams } from 'next/navigation';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';

const PROMPT_MAP: Record<string, { title: string; text: string }> = {
  'clinical-qna-with-citations': {
    title: 'Clinical Q&A with citations',
    text:
      'Answer as a GP. If uncertain, say so. Include 3–5 citations (guidelines/RCTs/systematic reviews). Note contraindications and drug interactions. End with “Discuss with patient” options.',
  },
  'evidence-and-guidelines': {
    title: 'Evidence & guidelines (PICO)',
    text:
      'You are a cautious evidence assistant. Using PICO [P,I,C,O], search recent high‑quality sources. Return: 1) Bottom line, 2) Key study table (n, effect, CI), 3) Guideline excerpts, 4) Harms/NNH/NNT, 5) Practice implications. Cite with links.',
  },
  'consult-summary-soap': {
    title: 'Consult summary (SOAP)',
    text:
      'Summarise today’s consult. S/O/A/P structure. Include safety‑netting and shared decisions. List codes to consider (SNOMED/ICD terms only as suggestions).',
  },
};

export default function PromptDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';
  const prompt = PROMPT_MAP[String(slug)] ?? null;

  return (
    <Container size="xl" className="py-8">
      <div className="mb-6">
        <div className="mb-2 text-sm text-muted-foreground">Home / Prompts</div>
        <h1 className="mb-1 text-2xl font-bold">{prompt?.title ?? 'Prompt'}</h1>
        <p className="text-sm text-muted-foreground">Copy and adapt for your scenario. Verify with guidelines.</p>
      </div>

      <div className="mb-4 whitespace-pre-wrap rounded-md border bg-muted p-4 text-sm">{prompt?.text ?? 'Coming soon'}</div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => {
            if (prompt?.text) navigator.clipboard?.writeText(prompt.text);
          }}
          disabled={!prompt?.text}
        >
          Copy to clipboard
        </Button>
        <a href="/prompts" className="text-sm underline">Back to all prompts</a>
      </div>

      <footer className="mt-8 text-xs text-muted-foreground">Community (coming soon)</footer>
    </Container>
  );
}

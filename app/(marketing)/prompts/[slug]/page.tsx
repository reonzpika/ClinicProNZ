"use client";
import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';

const PROMPT_MAP: Record<string, { title: string; text: string; bestTools?: Array<{ id: string; name: string }> }> = {
  'clinical-qna-with-citations': {
    title: 'Clinical Q&A with citations',
    text:
      'Answer as a GP. If uncertain, say so. Include 3–5 citations (guidelines/RCTs/systematic reviews). Note contraindications and drug interactions. End with “Discuss with patient” options.',
    bestTools: [
      { id: 'perplexity', name: 'Perplexity' },
      { id: 'openevidence', name: 'OpenEvidence' },
    ],
  },
  'evidence-and-guidelines': {
    title: 'Evidence & guidelines (PICO)',
    text:
      'You are a cautious evidence assistant. Using PICO [P,I,C,O], search recent high‑quality sources. Return: 1) Bottom line, 2) Key study table (n, effect, CI), 3) Guideline excerpts, 4) Harms/NNH/NNT, 5) Practice implications. Cite with links.',
    bestTools: [
      { id: 'openevidence', name: 'OpenEvidence' },
      { id: 'elicit', name: 'Elicit' },
      { id: 'consensus', name: 'Consensus' },
    ],
  },
  'consult-summary-soap': {
    title: 'Consult summary (SOAP)',
    text:
      'Summarise today’s consult. S/O/A/P structure. Include safety‑netting and shared decisions. List codes to consider (SNOMED/ICD terms only as suggestions).',
    bestTools: [
      { id: 'claude', name: 'Claude' },
      { id: 'chatgpt', name: 'ChatGPT' },
    ],
  },
};

export default function PromptDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';
  const prompt = PROMPT_MAP[String(slug)] ?? null;

  return (
    <Container size="xl" className="py-8">
      {/* JSON-LD for prompt detail (Article-like) */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: prompt?.title ?? 'Prompt',
            about: 'AI prompts for General Practice',
            mainEntityOfPage: `https://clinicpro.nz/prompts/${slug}`,
          }),
        }}
      />
      <div className="mb-6">
        <div className="mb-2 text-sm text-muted-foreground">Home / Prompts</div>
        <h1 className="mb-1 text-2xl font-bold">{prompt?.title ?? 'Prompt'}</h1>
        <p className="text-sm text-muted-foreground">Copy and adapt for your scenario. Verify with guidelines.</p>
      </div>

      <div className="mb-4 whitespace-pre-wrap rounded-md border bg-muted p-4 text-sm">{prompt?.text ?? 'Coming soon'}</div>

      {prompt?.bestTools?.length ? (
        <div className="mb-4 text-sm">
          <div className="mb-1 font-medium">Best tool(s) to run this</div>
          <div className="flex flex-wrap gap-2">
            {prompt.bestTools.map((t) => (
              <Link key={t.id} href={`/tools/${t.id}`} className="underline">
                {t.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

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

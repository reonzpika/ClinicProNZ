import Link from 'next/link';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { NZ_12MONTH_RX_GUIDE } from '@/src/features/12-month-prescriptions/lib/nz-12month-rx-guide';
import { cn } from '@/src/lib/utils';
import { Container } from '@/src/shared/components/layout/Container';

const components: Components = {
  table: ({ node, ...props }) => (
    <div className="my-6 overflow-x-auto">
      <table
        className={cn(
          'min-w-full border border-border divide-y divide-border',
          '[&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:text-text-primary [&_th]:bg-surface',
          '[&_td]:px-4 [&_td]:py-2 [&_td]:text-sm [&_td]:text-text-secondary [&_td]:border-b [&_td]:border-border',
        )}
        {...props}
      />
    </div>
  ),
  h2: ({ node, children, ...props }) => (
    <h2
      className="mb-4 mt-12 text-3xl font-bold text-text-primary first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node, children, ...props }) => (
    <h3 className="mb-3 mt-8 text-2xl font-semibold text-text-primary" {...props}>
      {children}
    </h3>
  ),
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <Container size="md">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-text-primary">
              12-Month Prescriptions: Complete Guide
            </h1>
            <p className="mt-2 text-text-secondary">
              Legal requirements, professional standards, and clinical guidance
            </p>
          </div>
        </Container>
      </header>

      <Container size="md">
        <div className="prose prose-lg prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary max-w-none py-16">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {NZ_12MONTH_RX_GUIDE}
          </ReactMarkdown>
        </div>
      </Container>

      <Container size="md">
        <div className="pb-16">
          <Link
            href="/12-month-prescriptions"
            className="font-medium text-primary hover:underline"
          >
            ← Back to decision tools
          </Link>
        </div>
      </Container>
    </div>
  );
}

'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import type { Block, Section as SectionType, TrafficLightDocument as DocType } from '../lib/traffic-light-types';

const proseMarkdownComponents: Components = {
  p: ({ children }) => <span className="block">{children}</span>,
  strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} className="text-primary underline hover:no-underline">
      {children}
    </a>
  ),
};

const inlineMarkdownComponents: Components = {
  p: ({ children }) => <>{children}</>,
  strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} className="text-primary underline hover:no-underline">
      {children}
    </a>
  ),
};

function InlineMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={inlineMarkdownComponents}>
      {content}
    </ReactMarkdown>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <div className="mb-2 prose prose-lg max-w-none prose-p:text-text-secondary prose-strong:text-text-primary [&>p]:mb-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={proseMarkdownComponents}>
            {block.content}
          </ReactMarkdown>
        </div>
      );
    case 'list':
      return (
        <div className="mt-2 mb-6 prose prose-lg max-w-none prose-ul:my-2 prose-li:text-text-secondary prose-strong:text-text-primary">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content}</ReactMarkdown>
        </div>
      );
    case 'table':
      return (
        <div className="overflow-x-auto my-6">
          <table className="min-w-full border border-border divide-y divide-border">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2 text-left text-sm font-semibold text-text-primary bg-surface"
                  >
                    <InlineMarkdown content={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2 text-sm text-text-secondary border-b border-border"
                    >
                      <InlineMarkdown content={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'subsection':
      return (
        <section className="mb-6">
          <h3
            id={block.id}
            className="text-xl font-bold mt-8 mb-3 text-text-primary first:mt-0"
          >
            {block.title}
          </h3>
          {block.subtitle && (
            <p className="mb-3 text-text-secondary italic">({block.subtitle})</p>
          )}
          <div className="space-y-2">
            {block.blocks.map((b, i) => (
              <BlockRenderer key={i} block={b} />
            ))}
          </div>
        </section>
      );
    case 'hr':
      return <hr className="my-6 border-border" />;
    default:
      return null;
  }
}

function Section({ section, isFirst }: { section: SectionType; isFirst: boolean }) {
  return (
    <section className={isFirst ? 'first:mt-0 mt-12' : 'mt-12'}>
      <h2
        id={section.id}
        className="text-2xl font-bold mb-4 text-text-primary first:mt-0"
      >
        {section.title}
      </h2>
      <div className="space-y-2">
        {section.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </section>
  );
}

export function TrafficLightStructured({ document }: { document: DocType }) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary">
      {document.updated && (
        <p className="text-text-secondary mb-6">
          <strong>Updated {document.updated}</strong>
        </p>
      )}
      {document.sections.map((section, i) => (
        <Section key={i} section={section} isFirst={i === 0} />
      ))}
    </div>
  );
}

'use client';

import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        <div className="prose prose-lg prose-p:text-text-secondary prose-strong:text-text-primary mb-2 max-w-none [&>p]:mb-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={proseMarkdownComponents}>
            {block.content}
          </ReactMarkdown>
        </div>
      );
    case 'list':
      return (
        <div className="prose prose-lg prose-ul:my-2 prose-li:text-text-secondary prose-strong:text-text-primary mb-6 mt-2 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content}</ReactMarkdown>
        </div>
      );
    case 'table':
      return (
        <div className="my-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-border border border-border">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="bg-surface px-4 py-2 text-left text-sm font-semibold text-text-primary"
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
                      className="border-b border-border px-4 py-2 text-sm text-text-secondary"
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
            className="mb-3 mt-8 text-xl font-bold text-text-primary first:mt-0"
          >
            {block.title}
          </h3>
          {block.subtitle && (
            <p className="mb-3 italic text-text-secondary">
(
{block.subtitle}
)
            </p>
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
    <section className={isFirst ? 'mt-12 first:mt-0' : 'mt-12'}>
      <h2
        id={section.id}
        className="mb-4 text-2xl font-bold text-text-primary first:mt-0"
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
    <div className="prose prose-lg prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary max-w-none">
      {document.updated && (
        <p className="mb-6 text-text-secondary">
          <strong>
Updated
{document.updated}
          </strong>
        </p>
      )}
      {document.sections.map((section, i) => (
        <Section key={i} section={section} isFirst={i === 0} />
      ))}
    </div>
  );
}

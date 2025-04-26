import { sanitize } from 'isomorphic-dompurify';
import React, { Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { Card } from '@/components/ui/card';

type MarkdownRendererProps = {
  content: string;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const sanitizedContent = sanitize(content);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Card className="markdown-content prose dark:prose-invert max-w-none p-6">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, children, ...props }) => <h1 className="mb-4 text-3xl font-bold" {...props}>{children}</h1>,
            h2: ({ node, children, ...props }) => <h2 className="mb-3 text-2xl font-semibold" {...props}>{children}</h2>,
            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
            ul: ({ ...props }) => <ul className="mb-4 list-disc pl-6" {...props} />,
            ol: ({ ...props }) => <ol className="mb-4 list-decimal pl-6" {...props} />,
            code: ({ inline, className, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
              const combinedClassName = `${
                inline
                  ? 'rounded bg-gray-100 px-1 dark:bg-gray-800'
                  : 'mb-4 block rounded bg-gray-100 p-2 dark:bg-gray-800'
              } ${className || ''}`.trim();

              return <code className={combinedClassName} {...props} />;
            },
          }}
        >
          {sanitizedContent}
        </ReactMarkdown>
      </Card>
    </Suspense>
  );
};

export default MarkdownRenderer;

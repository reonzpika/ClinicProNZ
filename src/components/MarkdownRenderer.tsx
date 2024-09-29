import React, { Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { sanitize } from 'isomorphic-dompurify';

import { Card } from '@/components/ui/card';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const sanitizedContent = sanitize(content);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Card className="markdown-content prose dark:prose-invert max-w-none p-6">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="mb-4 text-3xl font-bold" {...props} />,
            h2: ({ node, ...props }) => <h2 className="mb-3 text-2xl font-semibold" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
            ul: ({ node, ...props }) => <ul className="mb-4 list-disc pl-6" {...props} />,
            ol: ({ node, ...props }) => <ol className="mb-4 list-decimal pl-6" {...props} />,
            code: ({ node, inline, ...props }) =>
              inline
                ? <code className="rounded bg-gray-100 px-1 dark:bg-gray-800" {...props} />
                : <code className="mb-4 block rounded bg-gray-100 p-2 dark:bg-gray-800" {...props} />,
          }}
        >
          {sanitizedContent}
        </ReactMarkdown>
      </Card>
    </Suspense>
  );
};

export default MarkdownRenderer;

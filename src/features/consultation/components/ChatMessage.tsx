import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ChatMessage as ChatMessageType } from '@/shared/ConsultationContext';

type ChatMessageProps = {
  message: ChatMessageType;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`mb-2 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-lg px-2 py-1 ${
        isUser
          ? 'bg-blue-600 text-white'
          : 'border bg-gray-100 text-gray-900'
      }`}
      >
        {isUser
          ? (
              <div className="text-xs">{message.content}</div>
            )
          : (
              <div className="prose prose-xs max-w-none text-xs">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-1 ml-3 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-1 ml-3 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="mb-0.5">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    code: ({ children }) => (
                      <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">
                        {children}
                      </code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-gray-300 pl-2 italic">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
      </div>
    </div>
  );
};

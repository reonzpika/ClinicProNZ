import { Check, Plus, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/src/shared/components/ui/button';
import type { ChatMessage as ChatMessageType } from '@/src/types/consultation';

type ChatMessageProps = {
  message: ChatMessageType;
  onAddToConsultation?: (message: ChatMessageType) => void;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAddToConsultation }) => {
  const isUser = message.role === 'user';
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToConsultation = () => {
    if (onAddToConsultation && !isAdded) {
      onAddToConsultation(message);
      setIsAdded(true);
    }
  };

  return (
    <div className={`mb-2 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-[85%] items-start space-x-1">
        {/* Add button - only for assistant messages */}
        {!isUser && onAddToConsultation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddToConsultation}
            disabled={isAdded}
            className={`mt-0.5 size-5 shrink-0 p-0 ${
              isAdded
                ? 'text-green-600 hover:text-green-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title={isAdded ? 'Added to consultation' : 'Add to consultation'}
          >
            {isAdded ? <Check size={12} /> : <Plus size={12} />}
          </Button>
        )}

        {/* Message content */}
        <div className={`rounded-lg px-2 py-1 ${
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
                      a: ({ href, title, children }) => (
                        <a
                          href={href}
                          title={title as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline"
                        >
                          {children}
                        </a>
                      ),
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
                {/* Collapsible Sources - assistant only */}
                {!isUser && Array.isArray(message.citations) && message.citations.length > 0 && (
                  <details className="mt-1">
                    <summary className="flex cursor-pointer select-none items-center text-xs text-slate-600">
                      <ChevronDown className="mr-1 size-3" /> Sources ({message.citations.length})
                    </summary>
                    <ul className="mt-1 list-disc pl-4 text-[11px] text-slate-700">
                      {message.citations.map((c, idx) => (
                        <li key={idx} className="truncate">
                          <a
                            href={c.url}
                            title={c.title}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline"
                          >
                            {c.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              )}
        </div>
      </div>
    </div>
  );
};

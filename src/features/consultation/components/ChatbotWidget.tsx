/* eslint-disable unused-imports/no-unused-vars */
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { useConsultation } from '@/shared/ConsultationContext';

import { ChatMessage } from './ChatMessage';

export const ChatbotWidget: React.FC = () => {
  const {
    chatHistory,
    isChatContextEnabled,
    isChatLoading,
    generatedNotes,
    addChatMessage,
    clearChatHistory,
    setChatContextEnabled,
    setChatLoading,
  } = useConsultation();

  const [inputMessage, setInputMessage] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  // Auto-scroll when chat history or streaming message changes
  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [chatHistory, streamingMessage, scrollToBottom]);

  // Update context toggle when notes are available
  useEffect(() => {
    if (generatedNotes && !isChatContextEnabled) {
      setChatContextEnabled(true);
    } else if (!generatedNotes) {
      setChatContextEnabled(false);
    }
  }, [generatedNotes, setChatContextEnabled]);

  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isChatLoading) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat history
    addChatMessage({
      role: 'user',
      content: userMessage,
    });

    setChatLoading(true);
    setStreamingMessage('');

    try {
      // Prepare messages for API
      const messages = [
        ...(chatHistory || []),
        { role: 'user' as const, content: userMessage },
      ];

      const response = await fetch('/api/consultation/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          consultationNote: generatedNotes,
          useContext: isChatContextEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;
        setStreamingMessage(assistantMessage);
      }

      // Add the complete assistant message to chat history
      addChatMessage({
        role: 'assistant',
        content: assistantMessage,
      });

      // Clear streaming message
      setStreamingMessage('');
    } catch (error) {
      console.error('Chat error:', error);
      addChatMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      });
      setStreamingMessage('');
    } finally {
      setChatLoading(false);
    }
  }, [
    inputMessage,
    isChatLoading,
    chatHistory,
    generatedNotes,
    isChatContextEnabled,
    addChatMessage,
    setChatLoading,
  ]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  const hasMessages = (chatHistory?.length || 0) > 0 || streamingMessage;
  const chatHeight = isExpanded
    ? 'h-[400px]'
    : 'h-auto'; // Collapsed state shows only header

  const chatContent = useMemo(() => (
    <>
      {/* Chat Messages - Fixed height with proper scrolling */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full pr-2">
          <div className="space-y-1">
            {(chatHistory || []).map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Streaming message */}
            {streamingMessage && (
              <div className="mb-2 flex justify-start">
                <div className="max-w-[85%] rounded-lg border bg-gray-100 px-2 py-1 text-gray-900">
                  <div className="whitespace-pre-wrap break-words text-xs">{streamingMessage}</div>
                  <div className="mt-1 text-xs text-gray-500 opacity-70">
                    typing...
                  </div>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isChatLoading && !streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg border bg-gray-100 px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <div className="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                    <div className="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                    <div className="size-1.5 animate-bounce rounded-full bg-gray-400"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Modern Message Input */}
      <div className="mt-2 shrink-0">
        <div className="relative flex items-center space-x-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder=""
            className="max-h-[40px] min-h-[20px] flex-1 resize-none border-0 bg-transparent py-1 text-xs placeholder:text-gray-400 focus:outline-none focus:ring-0"
            disabled={isChatLoading}
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isChatLoading}
            size="sm"
            className="h-6 shrink-0 rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isChatLoading
              ? (
                  <div className="size-2 animate-spin rounded-full border border-white border-t-transparent"></div>
                )
              : (
                  'Send'
                )}
          </Button>
        </div>
      </div>
    </>
  ), [
    chatHistory,
    streamingMessage,
    isChatLoading,
    inputMessage,
    handleInputChange,
    handleKeyPress,
    handleSendMessage,
    textareaRef,
  ]);

  return (
    <Card className={`flex flex-col ${chatHeight} transition-all duration-300`}>
      <CardHeader className="shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold">🤖 Clinical AI Assistant</h3>
          <div className="flex items-center space-x-1">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1 text-xs"
                >
                  ⧉
                </Button>
              </DialogTrigger>
              <DialogContent className="!flex h-[80vh] max-w-4xl flex-col gap-0 bg-white">
                <DialogHeader className="shrink-0">
                  <DialogTitle className="text-sm">🤖 Clinical AI Assistant</DialogTitle>
                </DialogHeader>
                <div className="flex flex-1 flex-col overflow-hidden p-2">
                  {/* Context Toggle in Modal */}
                  <div className="mb-4 flex shrink-0 items-center space-x-2">
                    <Switch
                      id="context-toggle-modal"
                      checked={isChatContextEnabled}
                      onCheckedChange={setChatContextEnabled}
                      disabled={!generatedNotes}
                    />
                    <label htmlFor="context-toggle-modal" className="text-xs text-gray-600">
                      Use consultation note context
                      {!generatedNotes && (
                        <span className="ml-1 text-gray-400">(Generate notes first)</span>
                      )}
                    </label>
                  </div>
                  {/* Chat Messages - Modal Version */}
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-2">
                      <div className="space-y-1">
                        {(chatHistory || []).map(message => (
                          <ChatMessage key={message.id} message={message} />
                        ))}

                        {/* Streaming message */}
                        {streamingMessage && (
                          <div className="mb-2 flex justify-start">
                            <div className="max-w-[85%] rounded-lg border bg-gray-100 px-2 py-1 text-gray-900">
                              <div className="whitespace-pre-wrap break-words text-xs">{streamingMessage}</div>
                              <div className="mt-1 text-xs text-gray-500 opacity-70">
                                typing...
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Loading indicator */}
                        {isChatLoading && !streamingMessage && (
                          <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-lg border bg-gray-100 px-2 py-1">
                              <div className="flex items-center space-x-1">
                                <div className="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                                <div className="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                                <div className="size-1.5 animate-bounce rounded-full bg-gray-400"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Modal Message Input */}
                  <div className="mt-2 shrink-0">
                    <div className="relative flex items-center space-x-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <Textarea
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder=""
                        className="max-h-[40px] min-h-[20px] flex-1 resize-none border-0 bg-transparent py-1 text-xs placeholder:text-gray-400 focus:outline-none focus:ring-0"
                        disabled={isChatLoading}
                        rows={1}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isChatLoading}
                        size="sm"
                        className="h-6 shrink-0 rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:bg-gray-300"
                      >
                        {isChatLoading
                          ? (
                              <div className="size-2 animate-spin rounded-full border border-white border-t-transparent"></div>
                            )
                          : (
                              'Send'
                            )}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-5 px-1 text-xs"
            >
              {isExpanded ? '▼' : '▲'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChatHistory}
              className="h-5 px-1 text-xs"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Context Toggle - Always show */}
        <div className="mt-2 flex items-center space-x-2">
          <Switch
            id="context-toggle"
            checked={isChatContextEnabled}
            onCheckedChange={setChatContextEnabled}
            disabled={!generatedNotes}
          />
          <label htmlFor="context-toggle" className="text-xs text-gray-600">
            Use consultation note context
            {!generatedNotes && (
              <span className="ml-1 text-gray-400">(Generate notes first)</span>
            )}
          </label>
        </div>
      </CardHeader>

      {/* Only show chat content when expanded */}
      {isExpanded && (
        <CardContent className="flex flex-1 flex-col overflow-hidden p-2 pt-0">
          {chatContent}
        </CardContent>
      )}
    </Card>
  );
};

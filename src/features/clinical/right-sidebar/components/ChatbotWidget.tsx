'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/src/shared/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/shared/components/ui/dialog';
import { ScrollArea } from '@/src/shared/components/ui/scroll-area';
import { Switch } from '@/src/shared/components/ui/switch';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';

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
    // Raw consultation data for Phase 1 context
    transcription,
    typedInput,
    inputMode,
    // Consultation notes functionality
    addConsultationItem,
  } = useConsultationStores();

  const [inputMessage, setInputMessage] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle adding chat message to consultation notes
  const handleAddMessageToConsultation = useCallback((message: any) => {
    const messageType = message.role === 'user' ? 'User Question' : 'Clinical Reference Answer';
    addConsultationItem({
      type: 'other',
      title: messageType,
      content: message.content,
    });
  }, [addConsultationItem]);

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

      // Prepare raw consultation data for Phase 1 context
      const rawConsultationData = {
        transcription: inputMode === 'audio' ? transcription.transcript : '',
        typedInput: inputMode === 'typed' ? typedInput : '',
      };

      const response = await fetch('/api/consultation/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          consultationNote: generatedNotes,
          useContext: isChatContextEnabled,
          rawConsultationData,
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
    inputMode,
    transcription,
    typedInput,
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

  const chatHeight = 'h-[400px]'; // Fixed height for consistent UX

  const chatContent = useMemo(() => (
    <>
      {/* Chat Messages - Fixed height with proper scrolling */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full pr-2">
          <div className="space-y-1">
            {(chatHistory || []).map(message => (
              <ChatMessage key={message.id} message={message} onAddToConsultation={handleAddMessageToConsultation} />
            ))}

            {/* Streaming message */}
            {streamingMessage && (
              <div className="mb-2 flex justify-start">
                <div className="max-w-[85%] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
                  <div className="whitespace-pre-wrap break-words text-sm">{streamingMessage}</div>
                  <div className="mt-1 text-xs text-slate-500 opacity-70">
                    processing...
                  </div>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isChatLoading && !streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-center space-x-1">
                    <div className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                    <div className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                    <div className="size-1.5 animate-bounce rounded-full bg-slate-400"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Modern Message Input */}
      <div className="mt-2 shrink-0">
        <div className="relative flex items-center space-x-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask a clinical question..."
            className="max-h-[40px] min-h-[24px] flex-1 resize-none border-0 bg-transparent py-1 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-0"
            disabled={isChatLoading}
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isChatLoading}
            size="sm"
            className="h-7 shrink-0 rounded-md bg-slate-600 px-3 py-1 text-sm text-white hover:bg-slate-700 disabled:bg-slate-300"
          >
            {isChatLoading
              ? (
                  <div className="size-3 animate-spin rounded-full border border-white border-t-transparent"></div>
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
    <Card className={`flex flex-col ${chatHeight} border-slate-200 bg-white shadow-sm transition-all duration-300`}>
      <CardHeader className="shrink-0 border-b border-slate-100 bg-slate-50 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-700">📋 Clinical Reference</h3>
          <div className="flex items-center space-x-1">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  ⧉
                </Button>
              </DialogTrigger>
              <DialogContent className="!flex h-[80vh] max-w-4xl flex-col gap-0 border-slate-200 bg-white">
                <DialogHeader className="shrink-0 border-b border-slate-100 pb-3">
                  <DialogTitle className="text-base text-slate-700">📋 Clinical Reference</DialogTitle>
                </DialogHeader>
                <div className="flex flex-1 flex-col overflow-hidden">
                  {/* Context Toggle in Modal */}
                  <div className="mb-4 flex shrink-0 items-center space-x-3 p-4">
                    <Switch
                      id="context-toggle-modal"
                      checked={isChatContextEnabled}
                      onCheckedChange={setChatContextEnabled}
                      disabled={!generatedNotes && !transcription.transcript && !typedInput}
                    />
                    <label htmlFor="context-toggle-modal" className="text-sm text-slate-600">
                      {generatedNotes
                        ? 'Use clinical notes as context'
                        : 'Use consultation data as context'}
                      {!generatedNotes && !transcription.transcript && !typedInput && (
                        <span className="ml-1 text-slate-400">(No consultation data available)</span>
                      )}
                    </label>
                  </div>
                  {/* Chat Messages - Modal Version */}
                  <div className="flex-1 overflow-hidden px-4">
                    <ScrollArea className="h-full pr-2">
                      <div className="space-y-2">
                        {(chatHistory || []).map(message => (
                          <ChatMessage key={message.id} message={message} onAddToConsultation={handleAddMessageToConsultation} />
                        ))}

                        {/* Streaming message */}
                        {streamingMessage && (
                          <div className="mb-2 flex justify-start">
                            <div className="max-w-[85%] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
                              <div className="whitespace-pre-wrap break-words text-sm">{streamingMessage}</div>
                              <div className="mt-1 text-xs text-slate-500 opacity-70">
                                processing...
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Loading indicator */}
                        {isChatLoading && !streamingMessage && (
                          <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                              <div className="flex items-center space-x-1">
                                <div className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                                <div className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                                <div className="size-1.5 animate-bounce rounded-full bg-slate-400"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Modal Message Input */}
                  <div className="mt-2 shrink-0 border-t border-slate-100 p-4">
                    <div className="relative flex items-center space-x-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400">
                      <Textarea
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a clinical question..."
                        className="max-h-[40px] min-h-[24px] flex-1 resize-none border-0 bg-transparent py-1 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-0"
                        disabled={isChatLoading}
                        rows={1}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isChatLoading}
                        size="sm"
                        className="h-7 shrink-0 rounded-md bg-slate-600 px-3 py-1 text-sm text-white hover:bg-slate-700 disabled:bg-slate-300"
                      >
                        {isChatLoading
                          ? (
                              <div className="size-3 animate-spin rounded-full border border-white border-t-transparent"></div>
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
              onClick={clearChatHistory}
              className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Context Toggle - Always show */}
        <div className="mt-3 flex items-center space-x-3">
          <Switch
            id="context-toggle"
            checked={isChatContextEnabled}
            onCheckedChange={setChatContextEnabled}
            disabled={!generatedNotes && !transcription.transcript && !typedInput}
          />
          <label htmlFor="context-toggle" className="text-sm text-slate-600">
            {generatedNotes
              ? 'Use clinical notes as context'
              : 'Use consultation data as context'}
            {!generatedNotes && !transcription.transcript && !typedInput && (
              <span className="ml-1 text-slate-400">(No consultation data available)</span>
            )}
          </label>
        </div>
      </CardHeader>

      {/* Chat content - always visible */}
      <CardContent className="flex flex-1 flex-col overflow-hidden p-3 pt-0">
        {chatContent}
      </CardContent>
    </Card>
  );
};

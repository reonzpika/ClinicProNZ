'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Loader2,
  Book,
  AlertCircle,
  CheckCircle,
  Settings,
  User,
  Bot,
  Trash2
} from 'lucide-react';

import { Container } from '@/shared/components/layout/Container';
import { Stack } from '@/shared/components/layout/Stack';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ClinicalReferencePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [useContext, setUseContext] = useState(false);
  const [consultationNote, setConsultationNote] = useState('');
  const [rawConsultationData, setRawConsultationData] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sample consultation data for context
  const sampleConsultationData = {
    transcription: "Patient presents with chest tightness and shortness of breath. Symptoms started 3 days ago. No fever. History of asthma. Using salbutamol inhaler as needed.",
    typedInput: "42-year-old male with asthma exacerbation. Peak flow 60% of predicted. Wheeze bilateral. No signs of pneumonia on examination."
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/consultation/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          consultationNote: useContext ? consultationNote : undefined,
          rawConsultationData: useContext ? sampleConsultationData : undefined,
          useContext,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQueries = [
    "What are the current NZ guidelines for asthma management?",
    "What antibiotics are first-line for community-acquired pneumonia?",
    "When should I refer a patient to cardiology?",
    "What are the contraindications for ACE inhibitors?",
    "How do I interpret HbA1c results?",
    "What vaccinations are recommended for adults in NZ?",
  ];

  return (
    <Container size="full" className="h-full">
      <div className="flex h-full flex-col py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Book className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Clinical Reference
              </h1>
              <p className="text-sm text-slate-600">
                AI-powered clinical guidance for NZ healthcare
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clearMessages}
              disabled={messages.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Chat
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 gap-6">
          {/* Chat Panel */}
          <div className="flex flex-1 flex-col">
            <Card className="flex h-full flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Clinical Assistant</CardTitle>
                      <CardDescription>
                        Ask about NZ clinical guidelines, medications, and protocols
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="inline-flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={useContext}
                        onChange={(e) => setUseContext(e.target.checked)}
                        className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Use consultation context
                    </label>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Ask me anything about clinical practice
                      </h3>
                      <p className="text-slate-600 mb-4">
                        I can help with NZ guidelines, medications, and clinical protocols
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                        {suggestedQueries.map((query, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(query)}
                            className="p-2 text-left text-sm bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            {query}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.role === 'user' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg bg-slate-100 px-4 py-2 text-slate-900">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Chat Input */}
              <div className="border-t border-slate-200 p-4">
                {error && (
                  <div className="mb-3 flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about clinical guidelines, medications, or protocols..."
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="w-80">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Consultation Context
                  </label>
                  <div className="space-y-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={useContext}
                        onChange={(e) => setUseContext(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">
                        Include current consultation in context
                      </span>
                    </label>
                  </div>
                </div>

                {useContext && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Consultation Notes
                    </label>
                    <textarea
                      value={consultationNote}
                      onChange={(e) => setConsultationNote(e.target.value)}
                      placeholder="Enter consultation notes to include as context..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700">Quick Topics</h4>
                  <div className="space-y-1">
                    {[
                      "NZ Clinical Guidelines",
                      "Medication Information",
                      "Referral Pathways",
                      "Investigation Protocols",
                      "Emergency Management"
                    ].map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setInputMessage(`Tell me about ${topic.toLowerCase()}`)}
                        className="block w-full text-left px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
} 
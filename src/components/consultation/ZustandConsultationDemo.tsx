'use client'

import React, { useState } from 'react'
import { Button } from '@/src/shared/components/ui/button'
import { Input } from '@/src/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card'
import { useConsultationStore } from '@/src/stores/consultationStore'

export function ZustandConsultationDemo() {
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemContent, setNewItemContent] = useState('')
  const [chatMessage, setChatMessage] = useState('')

  // Zustand store - direct access, no context needed!
  const {
    status,
    templateId,
    generatedNotes,
    error,
    chatHistory,
    isChatLoading,
    consultationItems,
    consultationNotes,
    // Actions
    setStatus,
    setTemplateId,
    setGeneratedNotes,
    setError,
    addChatMessage,
    clearChatHistory,
    setChatLoading,
    addConsultationItem,
    removeConsultationItem,
    setConsultationNotes,
    getCompiledConsultationText,
    resetConsultation,
  } = useConsultationStore()

  const handleAddConsultationItem = () => {
    if (newItemTitle.trim() && newItemContent.trim()) {
      addConsultationItem({
        title: newItemTitle,
        content: newItemContent,
        type: 'other', // Default type for demo
      })
      setNewItemTitle('')
      setNewItemContent('')
    }
  }

  const handleAddChatMessage = () => {
    if (chatMessage.trim()) {
      addChatMessage({
        role: 'user',
        content: chatMessage,
      })
      setChatMessage('')
      
      // Simulate AI response
      setTimeout(() => {
        addChatMessage({
          role: 'assistant',
          content: `AI response to: "${chatMessage}"`
        })
      }, 1000)
    }
  }

  const statusOptions = ['idle', 'recording', 'processing', 'completed'] as const

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Zustand Consultation Store Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status and Template Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium">Status</h3>
            <div className="flex gap-1 flex-wrap">
              {statusOptions.map((statusOption) => (
                <Button
                  key={statusOption}
                  variant={status === statusOption ? 'default' : 'outline'}
                  onClick={() => setStatus(statusOption)}
                  size="sm"
                >
                  {statusOption}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Template ID</h3>
            <Input
              placeholder="Template ID"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            />
          </div>
        </div>

        {/* Generated Notes */}
        <div className="space-y-2">
          <h3 className="font-medium">Generated Notes</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setGeneratedNotes('Sample generated notes from AI...')}
              variant="outline"
              size="sm"
            >
              Set Sample Notes
            </Button>
            <Button
              onClick={() => setGeneratedNotes(null)}
              variant="outline"
              size="sm"
            >
              Clear Notes
            </Button>
            <Button
              onClick={() => setError('Sample error message')}
              variant="outline"
              size="sm"
            >
              Set Error
            </Button>
            <Button
              onClick={() => setError(null)}
              variant="outline"
              size="sm"
            >
              Clear Error
            </Button>
          </div>
          {generatedNotes && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              {generatedNotes}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Chat Demo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Chat History ({chatHistory.length} messages)</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => setChatLoading(!isChatLoading)}
                variant="outline"
                size="sm"
              >
                {isChatLoading ? 'Stop Loading' : 'Simulate Loading'}
              </Button>
              <Button
                onClick={clearChatHistory}
                variant="outline"
                size="sm"
              >
                Clear Chat
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Type a chat message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddChatMessage()}
              className="flex-1"
            />
            <Button onClick={handleAddChatMessage} size="sm" disabled={isChatLoading}>
              Send
            </Button>
          </div>

          {chatHistory.length > 0 && (
            <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`text-sm p-2 rounded ${
                    message.role === 'user'
                      ? 'bg-blue-50 ml-4'
                      : 'bg-gray-50 mr-4'
                  }`}
                >
                  <strong>{message.role}:</strong> {message.content}
                </div>
              ))}
              {isChatLoading && (
                <div className="text-sm p-2 rounded bg-gray-50 mr-4">
                  <strong>assistant:</strong> <em>typing...</em>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Consultation Items */}
        <div className="space-y-2">
          <h3 className="font-medium">Consultation Items ({consultationItems.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              placeholder="Item title"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Item content"
                value={newItemContent}
                onChange={(e) => setNewItemContent(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddConsultationItem} size="sm">
                Add Item
              </Button>
            </div>
          </div>

          {consultationItems.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {consultationItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-gray-600">{item.content}</div>
                  </div>
                  <Button
                    onClick={() => removeConsultationItem(item.id)}
                    variant="outline"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Notes */}
        <div className="space-y-2">
          <h3 className="font-medium">Manual Consultation Notes</h3>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Add manual consultation notes..."
            value={consultationNotes}
            onChange={(e) => setConsultationNotes(e.target.value)}
          />
        </div>

        {/* Compiled Output */}
        <div className="space-y-2">
          <h3 className="font-medium">Compiled Consultation Text</h3>
          <div className="p-3 bg-gray-50 border rounded text-sm whitespace-pre-wrap">
            {getCompiledConsultationText() || '(empty)'}
          </div>
        </div>

        {/* Reset */}
        <div className="flex justify-center pt-4 border-t">
          <Button onClick={resetConsultation} variant="outline">
            Reset All Consultation Data
          </Button>
        </div>

        {/* Zustand Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Zustand Benefits Demonstrated:</h4>
          <ul className="text-green-800 space-y-1 text-sm">
            <li>• <strong>Domain Separation:</strong> Consultation logic separated from transcription</li>
            <li>• <strong>Real-time Updates:</strong> All components sync automatically across the app</li>
            <li>• <strong>Simple State Management:</strong> No complex reducers or action creators</li>
            <li>• <strong>TypeScript First:</strong> Full type safety with minimal effort</li>
            <li>• <strong>Computed Values:</strong> Automatic compilation of consultation text</li>
            <li>• <strong>Easy Reset:</strong> Clean state reset without side effects</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
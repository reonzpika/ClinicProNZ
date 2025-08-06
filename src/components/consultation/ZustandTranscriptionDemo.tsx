'use client'

import React, { useState } from 'react'
import { Button } from '@/src/shared/components/ui/button'
import { Input } from '@/src/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card'
import { useTranscriptionStore } from '@/src/stores/transcriptionStore'

export function ZustandTranscriptionDemo() {
  const [textToAppend, setTextToAppend] = useState('')

  // Zustand store - direct access, no context needed!
  const {
    inputMode,
    transcription,
    typedInput,
    consentObtained,
    microphoneGain,
    volumeThreshold,
    // Actions
    setInputMode,
    setTranscription,
    appendTranscription,
    setTypedInput,
    setConsentObtained,
    setMicrophoneGain,
    setVolumeThreshold,
    getCurrentInput,
    resetTranscription,
  } = useTranscriptionStore()

  const handleAppendText = async () => {
    if (textToAppend.trim()) {
      await appendTranscription(textToAppend + ' ', false)
      setTextToAppend('')
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Zustand Transcription Store Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Mode Toggle */}
        <div className="space-y-2">
          <h3 className="font-medium">Input Mode</h3>
          <div className="flex gap-2">
            <Button
              variant={inputMode === 'audio' ? 'default' : 'outline'}
              onClick={() => setInputMode('audio')}
              size="sm"
            >
              Audio
            </Button>
            <Button
              variant={inputMode === 'typed' ? 'default' : 'outline'}
              onClick={() => setInputMode('typed')}
              size="sm"
            >
              Typed
            </Button>
          </div>
        </div>

        {/* Transcription Controls */}
        <div className="space-y-2">
          <h3 className="font-medium">Transcription Controls</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Text to append to transcription"
              value={textToAppend}
              onChange={(e) => setTextToAppend(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAppendText} size="sm">
              Append
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setTranscription('Sample transcription text. ', false)}
              variant="outline"
              size="sm"
            >
              Set Sample Text
            </Button>
            <Button
              onClick={resetTranscription}
              variant="outline"
              size="sm"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Typed Input */}
        {inputMode === 'typed' && (
          <div className="space-y-2">
            <h3 className="font-medium">Typed Input</h3>
            <Input
              placeholder="Type your input here..."
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
            />
          </div>
        )}

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="font-medium">Settings</h3>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="consent"
              checked={consentObtained}
              onChange={(e) => setConsentObtained(e.target.checked)}
            />
            <label htmlFor="consent" className="text-sm">
              Consent obtained
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Microphone Gain: {microphoneGain}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.1"
              value={microphoneGain}
              onChange={(e) => setMicrophoneGain(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Volume Threshold: {volumeThreshold.toFixed(3)}
            </label>
            <input
              type="range"
              min="0.005"
              max="0.2"
              step="0.005"
              value={volumeThreshold}
              onChange={(e) => setVolumeThreshold(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Current State Display */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium">Current State</h3>
          
          <div className="text-sm space-y-2">
            <div>
              <strong>Input Mode:</strong> {inputMode}
            </div>
            <div>
              <strong>Current Input:</strong> 
              <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                {getCurrentInput() || '(empty)'}
              </div>
            </div>
            <div>
              <strong>Audio Transcription:</strong>
              <div className="mt-1 p-2 bg-blue-50 rounded text-xs">
                {transcription.transcript || '(empty)'}
              </div>
            </div>
            <div>
              <strong>Typed Input:</strong>
              <div className="mt-1 p-2 bg-green-50 rounded text-xs">
                {typedInput || '(empty)'}
              </div>
            </div>
          </div>
        </div>

        {/* Zustand Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Zustand Benefits Demonstrated:</h4>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• <strong>No Provider Needed:</strong> Direct access to store from any component</li>
            <li>• <strong>Minimal Boilerplate:</strong> Simple store definition with TypeScript</li>
            <li>• <strong>Automatic Subscriptions:</strong> Components re-render only when used data changes</li>
            <li>• <strong>DevTools Ready:</strong> Works with Redux DevTools for debugging</li>
            <li>• <strong>Persistent Settings:</strong> Settings automatically sync with localStorage</li>
            <li>• <strong>Optimized Performance:</strong> Fine-grained subscriptions prevent unnecessary renders</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
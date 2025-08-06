import React, { useState } from 'react';

import type { TranscriptionWord } from '@/src/shared/ConsultationContext';

// Constant to avoid infinite render loops
const EMPTY_WORDS_ARRAY: TranscriptionWord[] = [];

type EnhancedTranscriptionDisplayProps = {
  transcript: string;
  confidence?: number;
  words?: TranscriptionWord[];
  isRecording: boolean;
  onEdit?: (newTranscript: string) => void;
};

export function EnhancedTranscriptionDisplay({
  transcript,
  confidence,
  words = EMPTY_WORDS_ARRAY,
  isRecording,
  onEdit,
}: EnhancedTranscriptionDisplayProps) {
  const [showEnhanced, setShowEnhanced] = useState(true);
  const confidenceThreshold = 0.85;

  // Feature detection - only need words for enhanced view
  const hasEnhancedData = words.length > 0;

  // 🐛 DEBUG: Log enhanced component decision and words data
  void console.log('✨ EnhancedTranscriptionDisplay Debug:', {
    transcript: `${transcript?.slice(0, 50)}...`,
    transcriptLength: transcript?.length || 0,
    confidence,
    wordsLength: words.length,
    sampleWords: words.slice(0, 5).map(w => w.punctuated_word),
    hasEnhancedData,
    showEnhanced,
    isRecording,
    willShowEnhanced: hasEnhancedData && showEnhanced && !isRecording,
    fallbackReason: !hasEnhancedData
      ? 'No enhanced data'
      : !showEnhanced
          ? 'Enhanced disabled'
          : isRecording ? 'Currently recording' : 'Should show enhanced',
  });

  // Simple fallback (exactly like current implementation)
  if (!hasEnhancedData || !showEnhanced || isRecording) {
    return (
      <div className="max-h-64 overflow-y-auto rounded-md border bg-white p-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Transcript</span>
          <div className="flex items-center gap-2">
            {hasEnhancedData && !isRecording && (
              <button
                onClick={() => setShowEnhanced(!showEnhanced)}
                className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200"
              >
                {showEnhanced ? 'Simple View' : 'Enhanced View'}
              </button>
            )}
            {confidence && (
              <span className={`rounded px-2 py-1 text-xs ${
                confidence > 0.9
                  ? 'bg-green-100 text-green-700'
                  : confidence > 0.8
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }`}
              >
                {(confidence * 100).toFixed(1)}
                %
              </span>
            )}
          </div>
        </div>

        {isRecording
          ? (
              <div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {transcript || 'Listening for speech...'}
                </p>
                <span className="mt-1 inline-block h-3 w-1 animate-pulse bg-blue-500" />
              </div>
            )
          : (
              <textarea
                value={transcript}
                onChange={e => onEdit?.(e.target.value)}
                className="w-full resize-none border-none text-sm leading-relaxed focus:outline-none"
                placeholder="Transcription will appear here..."
                rows={Math.min(Math.max(transcript.split('\n').length || 3, 3), 12)}
              />
            )}
      </div>
    );
  }

  // Enhanced view with chronological word confidence (no timestamps)
  return (
    <div className="max-h-64 overflow-y-auto rounded-md border bg-white p-2">
      {/* Header with controls */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">Enhanced Transcript</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEnhanced(false)}
            className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
          >
            Simple View
          </button>
          {confidence && (
            <span className={`rounded px-2 py-1 text-xs ${
              confidence > 0.9
                ? 'bg-green-100 text-green-700'
                : confidence > 0.8
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}
            >
              {(confidence * 100).toFixed(1)}
              %
            </span>
          )}
        </div>
      </div>

      {/* Chronological word display with confidence highlighting */}
      <div className="text-sm leading-relaxed">
        {/* 🐛 DEBUG: Compare reconstructed text with original transcript */}
        {console.log('🔍 Text Comparison:', {
          originalTranscript: transcript,
          reconstructedText: words.map(w => w.punctuated_word).join(' '),
          textMatch: transcript === words.map(w => w.punctuated_word).join(' ')
        })}
        {words.map((word, wordIndex) => {
          const isLowConfidence = word.confidence < confidenceThreshold;

          return (
            <span key={wordIndex} className="group/word relative">
              {/* Only highlight low-confidence words */}
              <span
                className={`${
                  isLowConfidence
                    ? 'cursor-help border-b border-yellow-400 bg-yellow-200'
                    : ''
                }`}
                title={
                  isLowConfidence
                    ? `Low confidence: ${(word.confidence * 100).toFixed(1)}%`
                    : undefined
                }
              >
                {word.punctuated_word}
              </span>

              {/* Confidence tooltip for low-confidence words */}
              {isLowConfidence && (
                <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/word:opacity-100">
                  {(word.confidence * 100).toFixed(1)}
                  % confidence
                </div>
              )}

              {/* Add space between words */}
              {wordIndex < words.length - 1 && ' '}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 border-t border-gray-100 pt-2">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="size-3 rounded border border-yellow-400 bg-yellow-200"></div>
            <span>
              Low confidence (&lt;
              {(confidenceThreshold * 100)}
              %)
            </span>
          </div>
          <span>Hover for details</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Loader2, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';

type AIReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reviewType: string;
  noteContent: {
    problemsText: string;
    objectiveText: string;
    assessmentText: string;
    planText: string;
  };
};

const MODULE_TITLES = {
  red_flags: '🚩 Red Flags Scanner',
  ddx: '🔬 Differential Diagnosis',
  investigations: '🧪 Investigation Advisor',
  management: '💊 Management Review',
};

export function AIReviewModal({ isOpen, onClose, reviewType, noteContent }: AIReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const { currentPatientSessionId } = useConsultationStores();

  // Auto-generate review when modal opens
  useEffect(() => {
    if (isOpen && !response && !loading) {
      generateReview();
    }
  }, [isOpen]);

  const generateReview = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/consultation/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewType,
          ...noteContent,
          sessionId: currentPatientSessionId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate review');
      }

      const data = await res.json();
      setResponse(data.response);
      if (data.reviewId != null) {
 setReviewId(data.reviewId);
}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (feedbackType: 'helpful' | 'not_helpful') => {
    setFeedback(feedbackType);

    // Update feedback in database
    try {
      await fetch('/api/consultation/ai-review/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          reviewType,
          feedback: feedbackType,
          sessionId: currentPatientSessionId,
        }),
      });
    } catch (err) {
      console.error('Failed to save feedback:', err);
      // Don't show error to user - this is non-critical
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{MODULE_TITLES[reviewType as keyof typeof MODULE_TITLES]}</span>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </DialogTitle>
          <DialogDescription>
            AI-generated clinical decision support suggestions for your review
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-3 size-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Analyzing consultation notes...</p>
              <p className="mt-1 text-xs text-gray-400">This typically takes 3-5 seconds</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Error generating review</p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={generateReview}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          )}

          {response && (
            <div className="space-y-4">
              {/* AI Response - preserve formatting */}
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                  {response}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  <strong>Clinical Judgment Required:</strong>
{' '}
These AI-generated suggestions are for consideration only and do not replace your clinical judgment. Always verify recommendations against current evidence and patient context.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex w-full items-center justify-between">
            {/* Feedback buttons */}
            {response && (
              <div className="flex items-center gap-2">
                <span className="mr-2 text-sm text-gray-600">Was this helpful?</span>
                <Button
                  variant={feedback === 'helpful' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFeedback('helpful')}
                  disabled={feedback !== null}
                  className="gap-2"
                >
                  <ThumbsUp className="size-4" />
                  {feedback === 'helpful' && 'Thanks!'}
                </Button>
                <Button
                  variant={feedback === 'not_helpful' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFeedback('not_helpful')}
                  disabled={feedback !== null}
                  className="gap-2"
                >
                  <ThumbsDown className="size-4" />
                  {feedback === 'not_helpful' && 'Thanks!'}
                </Button>
              </div>
            )}

            {/* Close button */}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

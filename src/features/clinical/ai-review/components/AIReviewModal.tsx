'use client';

import { useAuth } from '@clerk/nextjs';
import { Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';
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
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeaders } from '@/src/shared/utils';

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewType: string;
  noteContent: {
    problemsText: string;
    objectiveText: string;
    assessmentText: string;
    planText: string;
  };
}

const MODULE_TITLES: Record<string, string> = {
  red_flags: 'Red Flags Scanner',
  ddx: 'Differential Diagnosis',
  investigations: 'Investigation Advisor',
  management: 'Management Review',
};

function getErrorMessage(error: string): string {
  if (error.includes('API key')) {
    return 'API key not configured. Please contact support.';
  }
  if (error.toLowerCase().includes('rate limit')) {
    return 'Too many requests. Please wait 1 minute and try again.';
  }
  if (error.toLowerCase().includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  if (error.includes('404') || error.includes('not_found') || error.includes('model:')) {
    return 'Review service is temporarily unavailable. Please try again later or contact support.';
  }
  return 'Unable to generate review. Please try again or contact support.';
}

export function AIReviewModal({
  isOpen,
  onClose,
  reviewType,
  noteContent,
}: AIReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);

  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const { currentPatientSessionId } = useConsultationStores();

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
        headers: createAuthHeaders(userId, userTier),
        body: JSON.stringify({
          reviewType,
          ...noteContent,
          sessionId: currentPatientSessionId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to generate review');
      }

      setResponse(data.response ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (feedbackType: 'helpful' | 'not_helpful') => {
    setFeedback(feedbackType);

    try {
      await fetch('/api/consultation/ai-review/feedback', {
        method: 'POST',
        headers: createAuthHeaders(userId, userTier),
        body: JSON.stringify({
          feedback: feedbackType,
          reviewType,
          sessionId: currentPatientSessionId,
        }),
      });
    } catch (err) {
      console.error('Failed to save feedback:', err);
    }
  };

  const displayError = error ? getErrorMessage(error) : null;
  const title = MODULE_TITLES[reviewType] ?? reviewType;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="fixed left-0 top-0 z-50 flex h-[85vh] w-[600px] max-w-3xl translate-x-0 translate-y-0 flex-col overflow-hidden rounded-r-lg border bg-white shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b pb-3">
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>
              {reviewType === 'red_flags' && '🚩 '}
              {reviewType === 'ddx' && '🔬 '}
              {reviewType === 'investigations' && '🧪 '}
              {reviewType === 'management' && '💊 '}
              {title}
            </span>
          </DialogTitle>
          <DialogDescription>
            AI-generated suggestions for your review
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Analyzing consultation notes...</p>
              <p className="mt-1 text-xs text-gray-400">This typically takes 3–5 seconds</p>
            </div>
          )}

          {displayError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Error generating review</p>
              <p className="mt-1 text-sm text-red-600">{displayError}</p>
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
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                  {response}
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  <strong>Clinical Judgment Required:</strong> These AI-generated suggestions
                  are for consideration only and do not replace your clinical judgment.
                  Always verify recommendations against current evidence and patient context.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t pt-4">
          <div className="flex w-full items-center justify-between">
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
                  <ThumbsUp className="h-4 w-4" />
                  {feedback === 'helpful' ? 'Thanks!' : 'Helpful'}
                </Button>
                <Button
                  variant={feedback === 'not_helpful' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFeedback('not_helpful')}
                  disabled={feedback !== null}
                  className="gap-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  {feedback === 'not_helpful' ? 'Thanks!' : 'Not helpful'}
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

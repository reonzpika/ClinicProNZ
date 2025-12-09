'use client';

import { useAuth } from '@clerk/nextjs';
import { Copy, FileText, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeaders } from '@/src/shared/utils';

export const ReferralLetterTab: React.FC = () => {
  const { generatedNotes } = useConsultationStores();
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();

  const [referralReason, setReferralReason] = useState('');
  const [referralLetter, setReferralLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!generatedNotes || generatedNotes.trim() === '') {
      setError('No consultation note available. Please generate a note first.');
      return;
    }

    if (!referralReason || referralReason.trim() === '') {
      setError('Please enter the reason for referring');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setReferralLetter('');

    try {
      const response = await fetch('/api/consultation/referral', {
        method: 'POST',
        headers: createAuthHeaders(userId, userTier),
        body: JSON.stringify({
          consultationNote: generatedNotes,
          referralReason: referralReason.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate referral' }));
        throw new Error(errorData.message || 'Failed to generate referral');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let letter = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        letter += decoder.decode(value, { stream: true });
        setReferralLetter(letter);
      }
    } catch (err) {
      console.error('Referral generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate referral');
    } finally {
      setIsGenerating(false);
    }
  }, [generatedNotes, referralReason, userId, userTier]);

  const handleCopy = useCallback(() => {
    if (referralLetter) {
      navigator.clipboard.writeText(referralLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralLetter]);

  // Check if consultation note exists
  const hasConsultationNote = generatedNotes && generatedNotes.trim() !== '';

  if (!hasConsultationNote) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-6">
        <div className="text-center">
          <FileText className="mx-auto mb-2 size-8 text-slate-400" />
          <p className="text-sm text-slate-600">
            Generate a consultation note first to create a referral letter
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Input Form */}
      <div className="space-y-3">
        <div>
          <label htmlFor="referralReason" className="mb-1 block text-xs font-medium text-slate-700">
            Reason for Referring
{' '}
<span className="text-red-500">*</span>
          </label>
          <Textarea
            id="referralReason"
            placeholder="e.g. Assess for surgical intervention, review management plan, confirm diagnosis"
            value={referralReason}
            onChange={e => setReferralReason(e.target.value)}
            disabled={isGenerating}
            rows={3}
            className="text-sm"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !referralReason.trim()}
          className="w-full"
          size="sm"
        >
          {isGenerating
? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Generating...
            </>
          )
: (
            'Generate Referral Letter'
          )}
        </Button>
      </div>

      {/* Generated Referral Letter */}
      {referralLetter && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700">Generated Referral</label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-7 gap-1 px-2 text-xs"
            >
              <Copy className="size-3" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="max-h-[400px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
              {referralLetter}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

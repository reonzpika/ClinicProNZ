import { MessageSquare } from 'lucide-react';
import React, { useState } from 'react';

import { FeedbackModal } from '@/src/features/marketing/roadmap/components/FeedbackModal';
import { submitFeatureRequest } from '@/src/features/marketing/roadmap/roadmap-service';

import { Button } from './ui/button';

type FeatureFeedbackButtonProps = {
  feature: 'transcription' | 'notes' | 'templates' | 'performance' | 'general';
  context?: string;
  variant?: 'minimal' | 'text';
  className?: string;
  disabled?: boolean;
};

export const FeatureFeedbackButton: React.FC<FeatureFeedbackButtonProps> = ({
  feature,
  context = '',
  variant = 'minimal',
  className = '',
  disabled = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  const config = {
    transcription: {
      title: 'Quick feedback on speech recognition',
      prompt: 'How\'s the transcription accuracy?',
    },
    notes: {
      title: 'Feedback on AI-generated notes',
      prompt: 'Were the AI notes helpful?',
    },
    templates: {
      title: 'Feedback on this template',
      prompt: 'Does this template work for your workflow?',
    },
    performance: {
      title: 'Report performance issues',
      prompt: 'Any speed or performance issues?',
    },
    general: {
      title: 'General feedback',
      prompt: 'Share your feedback',
    },
  }[feature];

  const handleSubmit = async (data: { idea: string; details?: string; email?: string }) => {
    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      // Add feature category and context to the submission
      const enhancedData = {
        ...data,
        idea: `[${feature.toUpperCase()}] ${data.idea}`,
        details: context ? `Context: ${context}\n\n${data.details || ''}` : data.details,
      };

      const result = await submitFeatureRequest(enhancedData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setShowModal(false), 1200);
      } else {
        setError(result.message || 'Something went wrong');
      }
    } catch {
      setError('Failed to send feedback');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'minimal') {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowModal(true)}
          disabled={disabled}
          className={`h-10 px-2 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 ${className}`}
          title={config.title}
        >
          <MessageSquare size={12} className="mr-1" />
          Feedback
        </Button>
        <FeedbackModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          success={success}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        disabled={disabled}
        className={`h-10 border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 ${className}`}
        title={config.title}
      >
        <MessageSquare size={14} className="mr-1.5" />
        Feedback
      </Button>
      <FeedbackModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        success={success}
      />
    </>
  );
};

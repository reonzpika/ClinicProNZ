'use client';

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

import { FeedbackModal } from '@/src/features/marketing/roadmap/components/FeedbackModal';
import { submitFeatureRequest } from '@/src/features/marketing/roadmap/roadmap-service';

import { Button } from './ui/button';

type FloatingFeedbackButtonProps = {
  currentFeature?: 'transcription' | 'notes' | 'templates' | 'performance' | 'general';
  context?: string;
  className?: string;
};

export const FloatingFeedbackButton: React.FC<FloatingFeedbackButtonProps> = ({
  currentFeature = 'general',
  context = '',
  className = '',
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
      prompt: 'Share your feedback about ClinicPro',
    },
  }[currentFeature];

  const handleSubmit = async (data: { idea: string; details?: string; email?: string }) => {
    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      // Add feature category and context to the submission
      const enhancedData = {
        ...data,
        idea: `[${currentFeature.toUpperCase()}] ${data.idea}`,
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

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        <Button
          onClick={() => setShowModal(true)}
          className="h-12 w-12 rounded-full bg-blue-600 p-0 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
          title={config.title}
        >
          <MessageSquare size={20} />
        </Button>
      </div>
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
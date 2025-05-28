/* eslint-disable react-dom/no-missing-button-type */
'use client';
import React, { useEffect, useState } from 'react';

import { getFeatures, submitFeatureRequest, voteForFeature } from '../roadmap-service';
import type { Feature } from '../types';
import { FeatureCard } from './FeatureCard';
import { FeedbackModal } from './FeedbackModal';

const getVotedFeatures = (): number[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem('roadmap_voted') || '[]');
  } catch {
    return [];
  }
};

const setVotedFeatures = (ids: number[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('roadmap_voted', JSON.stringify(ids));
};

export const RoadmapBoard: React.FC = () => {
  const [features, setFeatures] = useState<{ planned: Feature[]; in_progress: Feature[]; completed: Feature[] }>({ planned: [], in_progress: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<number[]>(getVotedFeatures());
  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | undefined>();
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    getFeatures()
      .then(setFeatures)
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (featureId: number) => {
    if (voted.includes(featureId)) {
      return;
    }
    const res = await voteForFeature(featureId);
    if (res.success) {
      setVoted((prev) => {
        const updated = [...prev, featureId];
        setVotedFeatures(updated);
        return updated;
      });
      // Update vote count locally
      setFeatures((f) => {
        const update = (arr: Feature[]) => arr.map(feat => feat.id === featureId ? { ...feat, vote_count: feat.vote_count + 1 } : feat);
        return {
          planned: update(f.planned),
          in_progress: update(f.in_progress),
          completed: update(f.completed),
        };
      });
    }
  };

  const handleFeedback = async (data: { idea: string; details?: string; email?: string }) => {
    setFeedbackLoading(true);
    setFeedbackError(undefined);
    setFeedbackSuccess(false);
    const res = await submitFeatureRequest(data);
    if (res.success) {
      setFeedbackSuccess(true);
      setTimeout(() => setModalOpen(false), 1200);
    } else {
      setFeedbackError(res.message || 'Something went wrong');
    }
    setFeedbackLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-2 py-6">
      <div className="mb-3 flex gap-4 border-b pb-2 text-center">
        <div className="flex-1 font-medium text-yellow-600">🟡 Planned</div>
        <div className="flex-1 font-semibold text-blue-700 bg-blue-100 rounded px-2 py-1">🔵 In Progress</div>
        <div className="flex-1 font-medium text-green-600">✅ Completed</div>
      </div>
      {loading
        ? (
            <div className="py-6 text-center">Loading roadmap...</div>
          )
        : (
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                {features.planned.length === 0 && <div className="text-sm text-gray-400">No planned features yet.</div>}
                {features.planned.map(f => (
                  <FeatureCard key={f.id} feature={f} onVote={handleVote} voted={voted.includes(f.id)} />
                ))}
              </div>
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-blue-50 rounded-lg -mx-2"></div>
                <div className="relative">
                  {features.in_progress.length === 0 && <div className="text-sm text-gray-400">No features in progress.</div>}
                  {features.in_progress.map(f => (
                    <FeatureCard key={f.id} feature={f} onVote={handleVote} voted={voted.includes(f.id)} />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                {features.completed.length === 0 && <div className="text-sm text-gray-400">No completed features yet.</div>}
                {features.completed.map(f => (
                  <FeatureCard key={f.id} feature={f} onVote={handleVote} voted={voted.includes(f.id)} />
                ))}
              </div>
            </div>
          )}
      <div className="mt-6 flex flex-col items-center border-t pt-4">
        <div className="mb-2 text-base font-medium">💡 Got an idea to make your life easier?</div>
        <button
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          onClick={() => {
            setModalOpen(true);
            setFeedbackSuccess(false);
            setFeedbackError(undefined);
          }}
        >
          Share your feedback or feature request
        </button>
      </div>
      <FeedbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFeedback}
        loading={feedbackLoading}
        error={feedbackError}
        success={feedbackSuccess}
      />
    </div>
  );
};

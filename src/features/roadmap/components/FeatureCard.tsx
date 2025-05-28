/* eslint-disable react-dom/no-missing-button-type */
import React from 'react';

import type { Feature } from '../types';

type FeatureCardProps = {
  feature: Feature;
  onVote: (featureId: number) => void;
  voted: boolean;
};

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onVote, voted }) => {
  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg border bg-white p-3 shadow-sm">
      <div className="text-sm font-semibold">
        🩺
        {feature.title}
      </div>
      <div className="text-xs text-gray-700 leading-snug">{feature.description}</div>
      <div className="mt-1 flex items-center gap-4">
        <span className="text-xs text-gray-500">
          👥
          {feature.vote_count}
          {' '}
          GPs want this
        </span>
        <button
          className={`ml-auto rounded px-3 py-1 text-xs font-medium ${voted ? 'cursor-not-allowed bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          onClick={() => onVote(feature.id)}
          disabled={voted}
        >
          👍 I want this too
        </button>
      </div>
    </div>
  );
};

'use client';

import React from 'react';

import { AccCodeSuggestions } from '../AccCodeSuggestions';

// TODO: Integrate with ConsultationContext for global state management
export const AccTab: React.FC = () => {
  return (
    <div className="h-full">
      <AccCodeSuggestions />
    </div>
  );
}; 
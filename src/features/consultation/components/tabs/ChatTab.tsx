'use client';

import React from 'react';

import { ChatbotWidget } from '../ChatbotWidget';

// TODO: Integrate with ConsultationContext for global state management
export const ChatTab: React.FC = () => {
  return (
    <div className="h-full">
      <ChatbotWidget />
    </div>
  );
}; 
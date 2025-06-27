'use client';

import React from 'react';

import { MobileRecordingQRV2 } from '../MobileRecordingQRV2';

export const MobileTab: React.FC = () => {
  return (
    <div className="space-y-4 pt-3">
      <MobileRecordingQRV2
        isOpen={false}
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
      />
    </div>
  );
};
